import { supabase } from './_lib/supabase';

export default async function handler(request, response) {
  const APP_ID = process.env.VITE_ONESIGNAL_APP_ID;
  const REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
  const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY;

  if (!APP_ID || !REST_API_KEY || !GEMINI_KEY) {
    return response.status(500).json({ error: 'Faltam chaves de ambiente (OneSignal ou Gemini)' });
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // 1. Verificar se já existe mensagem para hoje no banco
    let { data: message, error: fetchError } = await supabase
      .from('daily_messages')
      .select('*')
      .eq('publish_date', today)
      .single();

    // 2. Se não existir, gerar agora com Gemini IA
    if (!message || fetchError) {
      console.log('Gerando conteúdo via IA para o disparador...');
      const prompt = `Você é um conselheiro cristão amoroso. Crie um devocional diário curto focado em esperança e recomeço. Siga estritamente este formato JSON:
      {
        "title": "Um título encorajador de 4 palavras",
        "verse": "O texto bíblico completo na versão NVI",
        "reference": "Livro Capitulo:Versiculo",
        "content": "A mensagem de 3 parágrafos curtos falando diretamente ao coração da pessoa.",
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

      // Salva no banco para quando o usuário abrir o app
      const { data: inserted, error: insertError } = await supabase
        .from('daily_messages')
        .insert({
          publish_date: today,
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

    // 3. Montar e disparar o OneSignal com o conteúdo da IA
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Basic ${REST_API_KEY}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: APP_ID,
        included_segments: ['Subscribed Users'],
        headings: { 
          en: message.title, 
          pt: message.title // Título gerado pela IA
        },
        contents: { 
          en: message.verse, 
          pt: message.verse // Versículo bíblico direto no corpo!
        },
        url: 'https://jesus-sigma.vercel.app'
      })
    };

    const osRes = await fetch('https://onesignal.com/api/v1/notifications', options);
    const osJson = await osRes.json();

    return response.status(200).json({ 
      operacao: 'Sucesso', 
      conteudo: message.title,
      disparo: osJson 
    });

  } catch (err) {
    console.error('Erro no robô inteligente:', err);
    return response.status(500).json({ operacao: 'Falha', error: err.message });
  }
}
