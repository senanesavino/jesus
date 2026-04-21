const geminiKey = 'AIzaSyCDnmkbHb5sZYKFGUsUl-pTnDQdKyOjfEM';

async function testGemini25() {
  console.log('--- Testando Gemini 2.5 Flash ---');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Respond "MODEL_OK"' }] }]
      })
    });
    const data = await response.json();
    console.log('Gemini Status:', response.status);
    if (data.candidates) {
      console.log('Gemini Text:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('Gemini Full Error:', JSON.stringify(data));
    }
  } catch (e) {
    console.log('Fetch crash:', e.message);
  }
}

testGemini25();
