const geminiKey = 'AIzaSyCDnmkbHb5sZYKFGUsUl-pTnDQdKyOjfEM';
const elevenKey = 'sk_e8025fc353fdb0c3453797c5f8e03733a7c60472430e2cdf';

async function testGemini() {
  console.log('--- Testando Gemini ---');
  // Tentando v1 em vez de v1beta
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Respond strictly with the word "SUCCESS"' }] }]
      })
    });
    const data = await response.json();
    console.log('Gemini Status:', response.status);
    if (data.candidates) {
      console.log('Gemini Text:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('Gemini Error Data:', JSON.stringify(data));
    }
  } catch (e) {
    console.log('Gemini fetch crash:', e.message);
  }
}

async function testEleven() {
  console.log('--- Testando ElevenLabs ---');
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': elevenKey }
    });
    console.log('ElevenLabs Status:', response.status);
    if (response.status === 200) {
      console.log('ElevenLabs: OK');
    } else {
      const data = await response.json();
      console.log('ElevenLabs Error:', JSON.stringify(data));
    }
  } catch (e) {
    console.log('ElevenLabs fetch crash:', e.message);
  }
}

async function run() {
  await testGemini();
  await testEleven();
}

run();
