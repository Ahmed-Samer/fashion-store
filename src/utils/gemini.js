// --- AI API Key ---
// بنقرا المفتاح من المتغيرات البيئية
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 

// دالة تأخير بسيطة (عشان ندي فرصة للاتصال يرجع)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const callGeminiAPI = async (prompt) => {
  if (!apiKey) {
      console.error("Gemini API Key is missing!");
      return null;
  }

  // هنحاول 3 مرات كحد أقصى (Retry Logic)
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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

      // لو الاستجابة مش سليمة
      if (!response.ok) {
        // لو المشكلة في السيرفر (503) أو ضغط طلبات (429) -> نحاول تاني
        if (response.status === 503 || response.status === 429 || response.status >= 500) {
            console.warn(`Attempt ${attempt} failed with status ${response.status}. Retrying...`);
            if (attempt < maxRetries) {
                await delay(2000); // استنى ثانيتين قبل المحاولة اللي بعدها
                continue; // عيد اللفة من الأول
            }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;

    } catch (error) {
      console.error(`Attempt ${attempt} Error:`, error);
      
      // لو دي آخر محاولة، رجع null وخلاص
      if (attempt === maxRetries) {
          return null;
      }
      
      // لو لسه فيه محاولات، استنى شوية وحاول تاني
      await delay(2000);
    }
  }
  
  return null;
};