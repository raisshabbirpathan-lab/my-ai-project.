export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing on backend' });
  }

  try {
    const { prompt, type } = req.body;
    const fullPrompt = `Rewrite the following text into a professional ${type || 'Social Media'} post with relevant emojis and hashtags:\n\n${prompt}`;

    // Yahan humne aapke API URL aur request body ko ekdum correct format mein kar diya hai
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: fullPrompt }]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      // Agar abhi bhi koi error aaye, toh hum poora error message response mein dekh payenge
      return res.status(500).json({ 
        error: 'Invalid response from Gemini API', 
        details: data.error?.message || JSON.stringify(data) 
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
