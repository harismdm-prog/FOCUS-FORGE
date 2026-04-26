import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getFocusSuggestions(sessions: any[]) {
  if (!process.env.GEMINI_API_KEY) return "Set your GEMINI_API_KEY to get AI-powered focus suggestions.";

  const sessionSummary = sessions.map(s => ({
    date: s.date,
    duration: s.duration,
    completed: s.completed
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these study sessions, provide 3 short, actionable suggestions to improve focus and productivity. Keep it encouraging and concise.
      
      Sessions: ${JSON.stringify(sessionSummary)}`,
      config: {
        systemInstruction: "You are a productivity coach for students. Provide brief, bulleted advice.",
      }
    });

    return response.text || "Keep up the great work! Consistency is key.";
  } catch (err) {
    console.error(err);
    return "Focus on your goals and take regular breaks!";
  }
}
