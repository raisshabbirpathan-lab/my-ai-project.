export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing' });
  }

  try {
    const { prompt, type } = req.body;
    let fullPrompt = `Rewrite the following text into a professional ${type || 'Social Media'} post with relevant emojis and hashtags:\n\n${prompt}`;

    // Direct Google API Call (No package needed)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const generatedText = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: generatedText });
    } else {
      console.error("Gemini Error Response:", data);
      return res.status(500).json({ error: 'Invalid response structure from Gemini' });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
