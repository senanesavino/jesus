import { createClient } from '@supabase/supabase-js';

// Supabase client para serverless
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Temas rotativos para garantir variedade diária (rotaciona pelo dia do ano)
const TEMAS_DIARIOS = [
  'esperança e recomeço',
  'fé e confiança em Deus',
  'paz interior e descanso',
  'força para os desafios',
  'gratidão e louvor',
  'amor de Deus por você',
  'coragem para seguir em frente',
  'perdão e libertação',
  'propósito e direção divina',
  'alegria mesmo nas dificuldades',
  'paciência e espera no Senhor',
  'renovação espiritual',
  'proteção e cuidado de Deus',
  'sabedoria para decisões',
  'consolo nas aflições',
  'vitória sobre o medo',
  'comunhão com Deus',
  'provisão divina',
  'transformação interior',
  'a presença de Deus no dia a dia',
  'entrega e confiança total',
  'superação e perseverança',
  'graça suficiente',
  'o poder da oração',
  'descanso em Deus',
  'fidelidade de Deus',
  'a mão de Deus guiando',
  'paz que excede o entendimento',
  'força na fraqueza',
  'o amor que nunca falha',
  'caminhar com Deus',
];

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

  // Calcular o tema do dia (rotaciona pelo dia do ano)
  const dayOfYear = Math.floor((nowBRT - new Date(nowBRT.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const temaDoDia = TEMAS_DIARIOS[dayOfYear % TEMAS_DIARIOS.length];

  console.log(`[PUSH] Período: ${periodoValido} | Data BRT: ${todayBRT} | Tema: ${temaDoDia}`);

  try {
    // 1. Buscar a mensagem oficial do dia no banco
    let { data: message, error: fetchError } = await supabase
      .from('daily_messages')
      .select('*')
      .eq('publish_date', todayBRT)
      .single();

    if (!message || fetchError) {
      console.log('[PUSH] Mensagem do dia não encontrada no banco. Gerando via Gemini...');

      if (!GEMINI_KEY) {
        // Sem Gemini? Busca a última mensagem disponível no banco
        console.log('[PUSH] Sem chave Gemini. Buscando última mensagem disponível...');
        const { data: lastMsg } = await supabase
          .from('daily_messages')
          .select('*')
          .order('publish_date', { ascending: false })
          .limit(1)
          .single();

        message = lastMsg || {
          title: 'Deus está com você',
          verse: 'Porque Eu sou o Senhor, o seu Deus, que o segura pela mão direita e lhe diz: Não tema, eu o ajudarei.',
          reference: 'Isaías 41:13',
          content: 'Não importa o que você esteja enfrentando hoje, Deus está caminhando ao seu lado.'
        };
      } else {
        // Gerar via Gemini com DATA e TEMA ESPECÍFICO para garantir unicidade
        try {
          // Formatar a data para o prompt (ex: "28 de abril de 2026")
          const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
          const dataFormatada = `${nowBRT.getUTCDate()} de ${meses[nowBRT.getUTCMonth()]} de ${nowBRT.getUTCFullYear()}`;

          const prompt = `Você é um conselheiro cristão amoroso. Hoje é ${dataFormatada}.
Crie um devocional ÚNICO e ORIGINAL para hoje, focado especificamente no tema: "${temaDoDia}".
NÃO repita versículos comuns como Jeremias 29:11 ou Isaías 41:13. Busque versículos menos conhecidos mas igualmente poderosos.
O título deve ser CRIATIVO e DIFERENTE — evite títulos genéricos como "Nova Esperança" ou "Novo Começo".

Siga estritamente este formato JSON:
{
  "title": "Um título criativo e original de 3 a 5 palavras sobre ${temaDoDia}",
  "verse": "O texto bíblico completo na versão NVI (escolha um versículo DIFERENTE e pouco usado)",
  "reference": "Livro Capitulo:Versiculo",
  "content": "A mensagem de 3 parágrafos curtos falando diretamente ao coração da pessoa sobre ${temaDoDia}. Use palavras gentis e personalize para o dia de hoje.",
  "prayer": "Uma oração de 2-3 frases em primeira pessoa (Senhor, ajuda-me a...)"
}`;

          const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { 
                responseMimeType: 'application/json',
                temperature: 0.9 // Mais criatividade para evitar repetição
              }
            })
          });

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            throw new Error(`Gemini ${aiResponse.status}: ${errorText.substring(0, 200)}`);
          }

          const aiData = await aiResponse.json();
          const resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!resultText) throw new Error('Gemini não retornou texto');

          const devocional = JSON.parse(resultText.replace(/```json/g, '').replace(/```/g, '').trim());

          // Inserir no banco
          // É necessário autenticar anonimamente para ter permissão de INSERT (RLS policy)
          await supabase.auth.signInAnonymously();
          
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

          if (insertError) {
            console.error('[PUSH] Erro ao inserir mensagem:', insertError.message);
            // Se falhou por duplicata, busca a existente
            const { data: retryMsg } = await supabase
              .from('daily_messages')
              .select('*')
              .eq('publish_date', todayBRT)
              .single();
            message = retryMsg || devocional;
          } else {
            message = inserted;
          }

          console.log('[PUSH] ✅ Mensagem gerada e salva:', message.title);
        } catch (geminiErr) {
          console.error('[PUSH] ❌ Gemini falhou:', geminiErr.message);
          
          // Tentativa final: buscar no banco (pode ter sido inserida por outro processo)
          const { data: retryMessage } = await supabase
            .from('daily_messages')
            .select('*')
            .eq('publish_date', todayBRT)
            .single();

          if (retryMessage) {
            message = retryMessage;
            console.log('[PUSH] Mensagem encontrada no retry:', message.title);
          } else {
            // Último recurso: buscar a mensagem mais recente do banco
            const { data: lastMsg } = await supabase
              .from('daily_messages')
              .select('*')
              .order('publish_date', { ascending: false })
              .limit(1)
              .single();

            if (lastMsg) {
              message = lastMsg;
              console.log('[PUSH] Usando última mensagem disponível:', message.title);
            } else {
              // Realmente não tem nada — usa genérica
              message = {
                title: 'Deus está com você hoje',
                verse: 'O Senhor é o meu pastor e nada me faltará.',
                reference: 'Salmos 23:1',
                content: 'Não importa o que você esteja enfrentando, Deus caminha ao seu lado.'
              };
            }
          }
        }
      }
    } else {
      console.log('[PUSH] ✅ Mensagem do dia já existe no banco:', message.title);
    }

    // 2. Montar título e conteúdo da notificação
    let tituloPush = `🕊️ ${message.title}`;
    let conteudoPush = message.verse || message.content?.substring(0, 120);

    if (periodoValido === 'manhã') {
      tituloPush = `☀️ Bom dia! ${message.title}`;
    } else if (periodoValido === 'tarde') {
      tituloPush = `🌤️ Boa tarde! ${message.title}`;
    } else if (periodoValido === 'noite') {
      tituloPush = `🌙 Boa noite! ${message.title}`;
    }

    // Truncar conteúdo se for muito longo para notificação
    if (conteudoPush && conteudoPush.length > 150) {
      conteudoPush = conteudoPush.substring(0, 147) + '...';
    }

    // 3. Disparar via OneSignal REST API — APENAS para o segmento do período
    const pushPayload = {
      app_id: APP_ID,
      filters: [
        { "field": "tag", "key": "periodo", "relation": "=", "value": periodoValido },
        { "operator": "OR" },
        { "field": "tag", "key": "periodo", "relation": "=", "value": periodoValido === 'manhã' ? 'manha' : periodoValido === 'tarde' ? 'tarde' : 'noite' }
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
      return response.status(200).json({
        operacao: `Nenhum usuário encontrado para o período ${periodoValido}. Notificação ignorada.`,
        mensagem_gerada: message.title,
        errors: osJson.errors
      });
    }

    return response.status(200).json({ 
      operacao: `Sucesso para usuários da ${periodoValido}`, 
      conteudo: message.title,
      tema: temaDoDia,
      data: todayBRT,
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
