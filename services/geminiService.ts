
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getGameOverCommentary(score: number): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The player just failed in a Jackie Chan themed endless runner game with a score of ${score}. 
      Give a short, funny, 1-sentence commentary from the perspective of an impressed but disappointed movie director. 
      Mention stunts, kung fu, or "bad luck". 
      Keep it brief and witty. No emojis.`,
      config: {
        temperature: 0.9,
      }
    });
    return response.text || "Cut! We need another take on that stunt!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "That's not how we rehearsed it!";
  }
}
