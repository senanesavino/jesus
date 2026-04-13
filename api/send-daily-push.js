import { supabase } from './_lib/supabase';

export default async function handler(request, response) {
  const APP_ID = process.env.VITE_ONESIGNAL_APP_ID;
  const REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
  const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY;

  if (!APP_ID || !REST_API_KEY || !GEMINI_KEY) {
    return response.status(500).json({ error: 'Faltam chaves de ambiente' });
  }

  // Qual é o período sendo processado neste gatilho? ('manha', 'tarde' ou 'noite')
  const periodoRaw = request.query.periodo || 'manha'; 
  const periodoValido = periodoRaw === 'manha' ? 'manhã' : periodoRaw;

  // A data serve para o Supabase (garante que não geramos duas mensagens diárias iguais para todos da manhã)
  // Como 'noite' vai disparar às 00:00 UTC, ajustamos para a data do Brasil diminuindo 4h.
  const todayBRT = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    // Busca a mensagem oficial do dia (compartilhada entre manhã, tarde e noite)
    let { data: message, error: fetchError } = await supabase
      .from('daily_messages')
      .select('*')
      .eq('publish_date', todayBRT)
      .single();

    if (!message || fetchError) {
      console.log(`Gerando a mensagem oficial do dia...`);
      
      const prompt = `Você é um conselheiro cristão amoroso. Crie um devocional curto.
      Foque em esperança, fé e direção para o dia.
      Siga estritamente este formato JSON:
      {
        "title": "Um título encorajador de 4 palavras no máximo",
        "verse": "O texto bíblico completo na versão NVI",
        "reference": "Livro Capitulo:Versiculo",
        "content": "A mensagem de 3 parágrafos curtos falando diretamente ao coração.",
        "prayer": "Uma oração de 2 frases."
      }`;

      const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      const aiData = await aiResponse.json();
      const resultText = aiData.candidates[0].content.parts[0].text;
      const devocional = JSON.parse(resultText);

      // Salva no banco com o formato de Data correto (YYYY-MM-DD)
      const { data: inserted, error: insertError } = await supabase
        .from('daily_messages')
        .insert({
          publish_date: todayBRT,
          title: devocional.title,
          verse: devocional.verse,
          reference: devocional.reference,
          content: devocional.content,
          prayer: devocional.prayer
        })
        .select()
        .single();

      if (insertError) throw insertError;
      message = inserted;
    }

    let tituloPush = "Deus tem uma palavra para ti! 🕊️";
    if (periodoValido === 'manhã') tituloPush = "Bom dia! " + message.title + " 🌅";
    if (periodoValido === 'tarde') tituloPush = "Boa tarde! " + message.title + " 🌤️";
    if (periodoValido === 'noite') tituloPush = "Boa noite! " + message.title + " 🌙";

    // 3. Montar e disparar APENAS para os usuários do período atual
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Basic ${REST_API_KEY}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: APP_ID,
        // Ao invés de mandar para todos, mandamos só pra quem tem a Tag:
        filters: [
          { "field": "tag", "key": "periodo", "relation": "=", "value": periodoValido }
        ],
        headings: { 
          en: tituloPush, 
          pt: tituloPush
        },
        contents: { 
          en: message.verse, 
          pt: message.verse
        },
        url: 'https://jesus-sigma.vercel.app'
      })
    };

    const osRes = await fetch('https://onesignal.com/api/v1/notifications', options);
    const osJson = await osRes.json();

    return response.status(200).json({ 
      operacao: `Sucesso para usuários da ${periodoValido}`, 
      conteudo: message.title,
      disparo: osJson 
    });

  } catch (err) {
    console.error(`Erro no robô de ${periodoValido}:`, err);
    return response.status(500).json({ operacao: 'Falha', error: err.message });
  }
}
