// utils/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in .env file");
}

// ---------- INIT (ONCE) ----------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Stable + supported model
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

// ================= GENERATE TEXT =================
export const generateText = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(`Gemini API Failed: ${error.message}`);
  }
};

// ================= GENERATE FLASHCARDS =================
export const generateFlashcards = async (content, count = 10) => {
  try {
    const prompt = `
Create ${count} flashcards from the content below.

CONTENT:
${content.substring(0, 3000)}

Return ONLY valid JSON (no markdown, no text):
[
  { "question": "...", "answer": "..." }
]
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // clean accidental markdown
    text = text.replace(/```json|```/gi, "").trim();

    const cards = JSON.parse(text);

    if (!Array.isArray(cards)) {
      throw new Error("Flashcards response is not an array");
    }

    return cards.map(c => ({
      question: c.question || c.front,
      answer: c.answer || c.back
    }));
  } catch (error) {
    console.error("Flashcard generation error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

// ================= GENERATE QUIZ =================
export const generateQuiz = async (content, numberOfQuestions = 5) => {
  try {
    const prompt = `
Create ${numberOfQuestions} MCQ questions from the content.

CONTENT:
${content.substring(0, 3000)}

Return ONLY valid JSON:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "..."
  }
]
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```json|```/gi, "").trim();

    const quiz = JSON.parse(text);

    if (!Array.isArray(quiz)) {
      throw new Error("Quiz response is not an array");
    }

    return quiz;
  } catch (error) {
    console.error("Quiz generation error:", error);
    throw new Error("Failed to generate quiz");
  }
};

// ================= GENERATE SUMMARY =================
export const generateSummary = async (content) => {
  try {
    const prompt = `
Summarize the content below in 200–400 words.

CONTENT:
${content.substring(0, 5000)}
`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Summary error:", error);
    throw new Error("Failed to generate summary");
  }
};

// ================= CHAT WITH CONTEXT =================
export const chatWithContext = async (question, chunks = []) => {
  const context = chunks.map(c => c.content).join("\n\n");

  const prompt = `
Answer ONLY using the content below.
If not found, say "Not mentioned in the document".

CONTENT:
${context}

QUESTION:
${question}

ANSWER:
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

// ================= EXPLAIN CONCEPT =================
export const explainConcept = async (concept, context = "") => {
  const prompt = context
    ? `
Explain the concept using the context.

CONCEPT:
${concept}

CONTEXT:
${context.substring(0, 3000)}
`
    : `
Explain the concept clearly with examples.

CONCEPT:
${concept}
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};
