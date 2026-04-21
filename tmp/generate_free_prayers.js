
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const ELEVENLABS_KEY = process.env.VITE_ELEVENLABS_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const prayers = [
  { id: 1, title: 'Oração para começar o dia', text: 'Senhor, neste novo dia eu Te agradeço. Obrigado por mais uma manhã, por mais uma chance de viver. Guarda os meus passos, dirige os meus pensamentos e me dá sabedoria para cada decisão. Que a Tua paz me acompanhe do amanhecer ao anoitecer. Em nome de Jesus. Amém.' },
  { id: 2, title: 'Oração para dormir', text: 'Pai, eu entrego este dia nas Tuas mãos. Cada palavra dita, cada passo dado, cada pensamento — tudo entrego a Ti. Guarda o meu sono, protege a minha família e me dá descanso verdadeiro. Renova as minhas forças para o amanhã. Em nome de Jesus. Amém.' },
  { id: 3, title: 'Oração contra ansiedade', text: 'Jesus, a ansiedade quer dominar o meu coração, mas eu sei que Tu és maior. Acalma cada pensamento acelerado, cada medo do futuro, cada preocupação que não me pertence. Eu entrego tudo a Ti. Tua paz é o que eu preciso. Amém.' },
  { id: 4, title: 'Oração por direção', text: 'Senhor, eu não sei qual caminho tomar, mas Tu conheces todos eles. Ilumina os meus passos, mostra-me a Tua vontade e me dá coragem para seguir aonde Tu me guiares. Confio no Teu plano, mesmo quando não consigo ver. Amém.' },
  { id: 5, title: 'Oração de gratidão', text: 'Pai, obrigado. Obrigado pela vida, pela saúde, pela família, por cada pessoa que colocaste no meu caminho. Obrigado pelas bênçãos que eu vejo e pelas que eu nem percebo. O Teu amor é incrível e eu sou grato por tudo. Em nome de Jesus. Amém.' }
];

async function generateAndUpload() {
  const results = [];
  const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Sarah

  for (const prayer of prayers) {
    console.log(`Gerando áudio para: ${prayer.title}...`);
    
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_KEY 
        },
        body: JSON.stringify({
          text: prayer.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        })
      });

      if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);

      const audioBuffer = await response.arrayBuffer();
      const fileName = `fixed_prayer_${prayer.id}.mp3`;
      
      const { data, error } = await supabase.storage
        .from('devotionals')
        .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('devotionals')
        .getPublicUrl(fileName);

      results.push({ id: prayer.id, url: publicUrl });
      console.log(`Sucesso: ${publicUrl}`);
    } catch (e) {
      console.error(`Erro em ${prayer.id}:`, e.message);
    }
  }

  console.log('\n--- RESULTADOS FINAIS ---');
  console.log(JSON.stringify(results, null, 2));
}

generateAndUpload();
