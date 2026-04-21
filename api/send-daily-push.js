import { createClient } from '@supabase/supabase-js';

// Supabase client para serverless — v2 (21/04/2026)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(request, response) {
  const APP_ID = process.env.VITE_ONESIGNAL_APP_ID;
  const REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
  const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY;

  // Log para debug
  console.log('[PUSH] Iniciando...', {
    hasAppId: !!APP_ID,
    hasRestKey: !!REST_API_KEY,
    hasGemini: !!GEMINI_KEY
  });

  if (!APP_ID || !REST_API_KEY) {
    return response.status(500).json({ 
      error: 'Faltam chaves de ambiente',
      details: {
        VITE_ONESIGNAL_APP_ID: APP_ID ? '✅' : '❌ FALTANDO',
        ONESIGNAL_REST_API_KEY: REST_API_KEY ? '✅' : '❌ FALTANDO',
        VITE_GEMINI_API_KEY: GEMINI_KEY ? '✅' : '❌ FALTANDO'
      }
    });
  }

  // Determinar o período: pode vir por query string OU ser auto-detectado pelo horário BRT
  let periodoValido = null;
  const periodoRaw = request.query?.periodo;

  if (periodoRaw) {
    // Veio via query string
    periodoValido = periodoRaw === 'manha' ? 'manhã' : periodoRaw;
  } else {
    // Auto-detectar pelo horário atual no Brasil (UTC-3)
    const nowBRT = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const hourBRT = nowBRT.getUTCHours();

    if (hourBRT >= 6 && hourBRT < 9) {
      periodoValido = 'manhã';
    } else if (hourBRT >= 13 && hourBRT < 16) {
      periodoValido = 'tarde';
    } else if (hourBRT >= 20 && hourBRT < 23) {
      periodoValido = 'noite';
    } else {
      // Fora do horário de envio — não dispara nada
      return response.status(200).json({ 
        message: `Fora do horário de envio. Hora BRT: ${hourBRT}:00. Nenhuma notificação enviada.`
      });
    }
  }

  // Data de hoje no fuso do Brasil
  const nowBRT = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const todayBRT = nowBRT.toISOString().split('T')[0];

  console.log(`[PUSH] Período: ${periodoValido} | Data BRT: ${todayBRT}`);

  try {
    // 1. Buscar ou gerar a mensagem oficial do dia
    let { data: message, error: fetchError } = await supabase
      .from('daily_messages')
      .select('*')
      .eq('publish_date', todayBRT)
      .single();

    if (!message || fetchError) {
      if (!GEMINI_KEY) {
        // Sem Gemini? Envia notificação genérica mesmo assim
        console.log('[PUSH] Sem Gemini e sem mensagem do dia. Usando mensagem genérica.');
        message = {
          title: 'Deus está com você',
          verse: 'Porque Eu sou o Senhor, o seu Deus, que o segura pela mão direita e lhe diz: Não tema, eu o ajudarei. — Isaías 41:13',
          content: 'Não importa o que você esteja enfrentando hoje, Deus está caminhando ao seu lado.'
        };
      } else {
        // Tenta gerar via Gemini, mas se falhar, usa mensagem genérica
        try {
          console.log('[PUSH] Gerando mensagem do dia via Gemini...');
          
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

          if (!aiResponse.ok) {
            throw new Error(`Gemini ${aiResponse.status}`);
          }

          const aiData = await aiResponse.json();
          const resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!resultText) throw new Error('Gemini sem texto');

          const devocional = JSON.parse(resultText.replace(/```json/g, '').replace(/```/g, '').trim());

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
          console.log('[PUSH] Mensagem gerada e salva:', message.title);
        } catch (geminiErr) {
          // Gemini falhou — usa mensagem genérica para não travar o push
          console.error('[PUSH] Gemini falhou, usando fallback:', geminiErr.message);
          message = {
            title: 'Deus está com você',
            verse: 'Porque Eu sou o Senhor, o seu Deus, que o segura pela mão direita e lhe diz: Não tema, eu o ajudarei. — Isaías 41:13',
            content: 'Não importa o que você esteja enfrentando hoje, Deus está caminhando ao seu lado.'
          };
        }
      }
    }

    // 2. Montar título da notificação
    let tituloPush = "Deus tem algo para ti! 🕊️";
    let conteudoPush = message.verse || message.content?.substring(0, 100);

    if (periodoValido === 'manhã') {
      tituloPush = `☀️ Bom dia! ${message.title}`;
    } else if (periodoValido === 'tarde') {
      tituloPush = `🌤️ Boa tarde! ${message.title}`;
    } else if (periodoValido === 'noite') {
      tituloPush = `🌙 Boa noite! ${message.title}`;
    }

    // 3. Disparar via OneSignal REST API — APENAS para o segmento do período
    const pushPayload = {
      app_id: APP_ID,
      filters: [
        { "field": "tag", "key": "periodo", "relation": "=", "value": periodoValido }
      ],
      headings: { en: tituloPush, pt: tituloPush },
      contents: { en: conteudoPush, pt: conteudoPush },
      url: 'https://jesus-sigma.vercel.app',
      // Chrome Web Push specific
      chrome_web_badge: 'https://jesus-sigma.vercel.app/logo.png',
      chrome_web_icon: 'https://jesus-sigma.vercel.app/icon-512.png',
    };

    console.log('[PUSH] Enviando para OneSignal...', JSON.stringify(pushPayload, null, 2));

    const osRes = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Key ${REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pushPayload)
    });

    const osJson = await osRes.json();
    console.log('[PUSH] Resposta OneSignal:', JSON.stringify(osJson));

    if (osJson.errors) {
      // Se não encontrou inscritos com a tag, tenta enviar para TODOS os inscritos
      const isNoSubscribers = osJson.errors.some(e => 
        typeof e === 'string' && e.includes('not subscribed')
      );
      
      if (isNoSubscribers) {
        console.log('[PUSH] Nenhum inscrito com tag. Enviando para todos...');
        
        const fallbackPayload = {
          app_id: APP_ID,
          included_segments: ['Total Subscriptions', 'Subscribed Users', 'Active Users'],
          headings: { en: tituloPush, pt: tituloPush },
          contents: { en: conteudoPush, pt: conteudoPush },
          url: 'https://jesus-sigma.vercel.app',
          chrome_web_badge: 'https://jesus-sigma.vercel.app/logo.png',
          chrome_web_icon: 'https://jesus-sigma.vercel.app/icon-512.png',
        };

        const fallbackRes = await fetch('https://api.onesignal.com/notifications', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Key ${REST_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fallbackPayload)
        });

        const fallbackJson = await fallbackRes.json();
        console.log('[PUSH] Fallback resposta:', JSON.stringify(fallbackJson));

        if (!fallbackJson.errors) {
          return response.status(200).json({
            operacao: `Enviado para TODOS os inscritos (fallback)`,
            conteudo: message.title,
            destinatarios: fallbackJson.recipients || 0,
            disparo: fallbackJson
          });
        } else {
          // Retornar o erro do fallback para debug
          return response.status(400).json({
            operacao: `Erro no envio para TODOS (fallback failed)`,
            errors_original: osJson.errors,
            errors_fallback: fallbackJson.errors,
            payload_enviado: fallbackPayload
          });
        }
      }

      return response.status(400).json({
        operacao: `Erro no envio para ${periodoValido}`,
        errors: osJson.errors,
        payload_enviado: pushPayload
      });
    }

    return response.status(200).json({ 
      operacao: `Sucesso para usuários da ${periodoValido}`, 
      conteudo: message.title,
      destinatarios: osJson.recipients || 0,
      disparo: osJson 
    });

  } catch (err) {
    console.error(`[PUSH] Erro no robô de ${periodoValido}:`, err);
    return response.status(500).json({ 
      operacao: 'Falha', 
      error: err.message,
      stack: err.stack 
    });
  }
}
