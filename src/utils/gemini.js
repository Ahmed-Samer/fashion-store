// --- AI API Key ---
// بنقرا المفتاح من المتغيرات البيئية
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 

export const callGeminiAPI = async (prompt) => {
  if (!apiKey) {
      console.error("Gemini API Key is missing!");
      return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};