import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Inicializa a Edge Function
serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) throw new Error("Chave do Gemini não encontrada");

    // Gerar a data oficial do dia no formato ISO (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Verificar se já existe a palavra de hoje (não duplicar)
    const { data: existing } = await supabaseClient
      .from('daily_messages')
      .select('id')
      .eq('publish_date', today)
      .single();

    if (existing) {
      return new Response(JSON.stringify({ message: 'Devocional de hoje já existe.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Temas rotativos por dia do ano para garantir variedade
    const temasDiarios = [
      'esperança e recomeço', 'fé e confiança em Deus', 'paz interior e descanso',
      'força para os desafios', 'gratidão e louvor', 'amor de Deus por você',
      'coragem para seguir em frente', 'perdão e libertação', 'propósito e direção divina',
      'alegria mesmo nas dificuldades', 'paciência e espera no Senhor', 'renovação espiritual',
      'proteção e cuidado de Deus', 'sabedoria para decisões', 'consolo nas aflições',
      'vitória sobre o medo', 'comunhão com Deus', 'provisão divina',
      'transformação interior', 'a presença de Deus no dia a dia', 'entrega e confiança total',
      'superação e perseverança', 'graça suficiente', 'o poder da oração',
      'descanso em Deus', 'fidelidade de Deus', 'a mão de Deus guiando',
      'paz que excede o entendimento', 'força na fraqueza', 'o amor que nunca falha', 'caminhar com Deus',
    ];

    const todayDate = new Date();
    const dayOfYear = Math.floor((todayDate.getTime() - new Date(todayDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const temaDoDia = temasDiarios[dayOfYear % temasDiarios.length];
    const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    const dataFormatada = `${todayDate.getDate()} de ${meses[todayDate.getMonth()]} de ${todayDate.getFullYear()}`;

    // Prompt engenhoso para o Gemini (com data e tema para unicidade)
    const prompt = `Você é um conselheiro cristão amoroso. Hoje é ${dataFormatada}.
Crie um devocional ÚNICO e ORIGINAL para hoje, focado no tema: "${temaDoDia}".
NÃO repita versículos comuns como Jeremias 29:11 ou Isaías 41:13. Busque versículos menos conhecidos mas poderosos.
O título deve ser CRIATIVO e DIFERENTE — evite títulos genéricos como "Nova Esperança" ou "Novo Começo".

Siga estritamente este formato JSON:
{
  "title": "Um título criativo e original de 3 a 5 palavras sobre ${temaDoDia}",
  "verse": "O texto bíblico completo na versão NVI (escolha um versículo DIFERENTE e pouco usado)",
  "reference": "Livro Capitulo:Versiculo",
  "content": "A mensagem de 3 parágrafos curtos falando diretamente ao coração da pessoa sobre ${temaDoDia}. Use palavras gentis.",
  "prayer": "Uma oração de 2-3 frases em primeira pessoa (Senhor, ajuda-me a...)"
}`;

    // Chamar Inteligência Artificial Gemini 2.5 diretamente via REST
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { 
          responseMimeType: 'application/json',
          temperature: 0.9
        }
      })
    });

    const aiData = await aiResponse.json();
    const resultText = aiData.candidates[0].content.parts[0].text;
    const devocional = JSON.parse(resultText);

    // Inserir no Banco
    const { error: insertError } = await supabaseClient
      .from('daily_messages')
      .insert({
        publish_date: today,
        title: devocional.title,
        verse: devocional.verse,
        reference: devocional.reference,
        content: devocional.content,
        prayer: devocional.prayer
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, message: 'Devocional diário gerado e salvo com sucesso!' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
