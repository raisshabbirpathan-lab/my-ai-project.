import { GoogleGenAI } from '@google/genai';

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
    
    // Naya GoogleGenAI initialize karein
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    let fullPrompt = `Rewrite the following text into a professional ${type || 'Social Media'} post with relevant emojis and hashtags:\n\n${prompt}`;

    // Ekdum naya aur stable method call
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    // Sahi tarike se text response handle karne ke liye
    const generatedText = response.text || (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) || "No text generated.";

    return res.status(200).json({ text: generatedText });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
