import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in .env file");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Switch to a model with available quota
// Try these in order: gemini-2.5-flash, gemini-flash-latest, or gemini-2.0-flash-lite
const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

export const generateText = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(`Gemini API Failed: ${error.message}`);
  }
};

export const generateFlashcards = async (content) => {
  try {
    // Updated prompt to use "question" and "answer" instead of "front" and "back"
    const prompt = `
      You are an AI teacher. Create 5-10 flashcards based on the following content.
      
      Content: "${content.substring(0, 3000)}" 

      Return ONLY a valid JSON array with NO additional text or markdown. Format:
      [{"question":"What is X?","answer":"X is..."},{"question":"Define Y","answer":"Y is..."}]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown formatting
    text = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();

    const flashcards = JSON.parse(text);
    
    if (!Array.isArray(flashcards)) {
      throw new Error("Response is not an array");
    }

    // Transform if Gemini still returns "front"/"back" instead of "question"/"answer"
    const transformedCards = flashcards.map(card => ({
      question: card.question || card.front,
      answer: card.answer || card.back
    }));
    
    return transformedCards;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error(`Failed to generate flashcards: ${error.message}`);
  }
};