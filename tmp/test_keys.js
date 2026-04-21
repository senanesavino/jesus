const geminiKey = 'AIzaSyBqeNOyAIQyTB8RZIYoB0rz23c-oEZiZ58';
const elevenKey = 'sk_e8025fc353fdb0c3453797c5f8e03733a7c60472430e2cdf';

async function testGemini() {
  console.log('Testando Gemini...');
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Respond "OK"' }] }]
      })
    });
    const data = await response.json();
    console.log('Gemini Response Status:', response.status);
    console.log('Gemini Data:', JSON.stringify(data).slice(0, 100));
  } catch (e) {
    console.log('Error Gemini:', e.message);
  }
}

async function testEleven() {
  console.log('Testando ElevenLabs...');
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': elevenKey }
    });
    console.log('ElevenLabs Response Status:', response.status);
  } catch (e) {
    console.log('Error Eleven:', e.message);
  }
}

testGemini();
testEleven();
