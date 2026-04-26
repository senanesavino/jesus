
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(request, response) {
  const APP_ID = process.env.VITE_ONESIGNAL_APP_ID;
  const REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

  const payload = {
    app_id: APP_ID,
    included_segments: ['Total Subscriptions'],
    headings: { en: 'Teste de Conexão 🛠️', pt: 'Teste de Conexão 🛠️' },
    contents: { en: 'Se você recebeu isso, as notificações estão funcionando!', pt: 'Se você recebeu isso, as notificações estão funcionando!' },
    url: 'https://jesus-sigma.vercel.app',
  };

  const res = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Key ${REST_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  return response.status(200).json(json);
}
