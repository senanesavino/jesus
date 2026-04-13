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

    // Prompt engenhoso para o Gemini (Foco em Empatia)
    const prompt = `Você é um conselheiro cristão amoroso. Crie um devocional diário curto focado em esperança e recomeço. Siga estritamente este formato JSON:
    {
      "title": "Um título encorajador de 4 palavras",
      "verse": "O texto bíblico completo na versão NVI",
      "reference": "Livro Capitulo:Versiculo",
      "content": "A mensagem de 3 parágrafos curtos falando diretamente ao coração da pessoa. Use palavras gentis.",
      "prayer": "Uma oração de 2 frases em primeira pessoa (Senhor, ajuda-me a...)"
    }`;

    // Chamar Inteligência Artificial Gemini 2.5 diretamente via REST
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
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
