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
Answer using the content below.
If the exact phrase is missing, provide the closest relevant answer from the content.
If the topic is truly absent, say "I couldn't find an exact answer in the available content".

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
You are a helpful teacher. Using ONLY the context below, explain the concept in clear Markdown.

Formatting requirements:
- Use section headings with "##".
- Use bullet points ("- ") in every section.
- Leave a blank line between sections.
- Keep each bullet short and readable.
- If information is missing, write: "Not mentioned in the provided content."

Use this exact structure:

## Definition
- <1-2 sentence simple definition>

## Why it matters
- <bullet point>
- <bullet point>

## Key ideas or steps
1. <numbered step or key idea>
2. <numbered step or key idea>

## Simple example
- <short, concrete example>

## Quick recap
- <one-line summary>

CONCEPT:
${concept}

CONTEXT:
${context.substring(0, 3000)}
`
    : `
You are a helpful teacher. Explain the concept in clear Markdown.

Formatting requirements:
- Use section headings with "##".
- Use bullet points ("- ") in every section.
- Leave a blank line between sections.
- Keep each bullet short and readable.

Use this exact structure:

## Definition
- <1-2 sentence simple definition>

## Why it matters
- <bullet point>
- <bullet point>

## Key ideas or steps
1. <numbered step or key idea>
2. <numbered step or key idea>

## Simple example
- <short, concrete example>

## Quick recap
- <one-line summary>

CONCEPT:
${concept}
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

