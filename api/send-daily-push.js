export default async function handler(request, response) {
  const APP_ID = process.env.VITE_ONESIGNAL_APP_ID;
  const REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

  if (!APP_ID || !REST_API_KEY) {
    return response.status(500).json({ error: 'Faltam chaves de acesso do OneSignal' });
  }

  // Montando a mensagem para o OneSignal
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: `Basic ${REST_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      app_id: APP_ID,
      included_segments: ['Subscribed Users'], // Atinge todos que tem notificações ligadas
      headings: { 
        en: 'Bom dia! 🕊️', 
        pt: 'Deus tem uma palavra para você! 🕊️' 
      },
      contents: { 
        en: 'Deus preparou uma mensagem para você hoje. Venha ouvir.', 
        pt: 'Uma nova palavra diária e versículo aguardam você. Toque aqui.' 
      },
      url: 'https://jesus-sigma.vercel.app' // Clicou no push, abre direto na sua plataforma
    })
  };

  try {
    const res = await fetch('https://onesignal.com/api/v1/notifications', options);
    const json = await res.json();
    return response.status(200).json({ operacao: 'Sucesso', disparo: json });
  } catch (err) {
    return response.status(500).json({ operacao: 'Falha', error: err.message });
  }
}
