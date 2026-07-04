// utils/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env regardless of where the process starts.
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const normalizeKey = (value = "") =>
  String(value).trim().replace(/^['\"]|['\"]$/g, "");

const getCandidateApiKeys = () => {
  const keys = [
    normalizeKey(process.env.GEMINI_API_KEY || ""),
    normalizeKey(process.env.GOOGLE_API_KEY || "")
  ].filter(Boolean);

  return [...new Set(keys)];
};

const createModel = (apiKey, modelName = "gemini-2.5-flash") => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};

const formatGeminiError = (error, fallbackMessage) => {
  const reason = error?.errorDetails?.[0]?.reason || "";
  if (
    reason === "API_KEY_INVALID" ||
    /API Key not found|API_KEY_INVALID/i.test(error?.message || "")
  ) {
    return "Invalid Gemini API key. Update GEMINI_API_KEY in backend/.env and restart the server.";
  }
  return fallbackMessage;
};

const generateWithGemini = async (prompt) => {
  const candidateKeys = getCandidateApiKeys();

  if (candidateKeys.length === 0) {
    throw new Error(
      "Gemini API key missing. Set GEMINI_API_KEY (or GOOGLE_API_KEY) in backend/.env"
    );
  }

  const candidateModels = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-pro-latest"
  ];

  let lastError;

  for (const modelName of candidateModels) {
    for (const apiKey of candidateKeys) {
      try {
        const model = createModel(apiKey, modelName);
        return await model.generateContent(prompt);
      } catch (error) {
        lastError = error;
        const reason = error?.errorDetails?.[0]?.reason || "";
        const keyInvalid =
          reason === "API_KEY_INVALID" ||
          /API Key not found|API_KEY_INVALID/i.test(error?.message || "");

        if (keyInvalid) {
          continue;
        }

        const isQuotaOrModelError =
          error.status === 429 ||
          error.status === 404 ||
          /quota|rate limit|not found|429|404/i.test(error?.message || "");

        if (isQuotaOrModelError) {
          console.warn(`Model ${modelName} failed with quota/resource error, trying fallback model...`);
          break;
        }

        throw error;
      }
    }
  }

  throw lastError || new Error("Failed to call Gemini API");
};

// ================= GENERATE TEXT =================
export const generateText = async (prompt) => {
  try {
    const result = await generateWithGemini(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(formatGeminiError(error, `Gemini API Failed: ${error.message}`));
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

    const result = await generateWithGemini(prompt);
    let text = result.response.text().trim();

    // Clean accidental markdown
    text = text.replace(/```json|```/gi, "").trim();

    const cards = JSON.parse(text);

    if (!Array.isArray(cards)) {
      throw new Error("Flashcards response is not an array");
    }

    return cards.map((c) => ({
      question: c.question || c.front,
      answer: c.answer || c.back
    }));
  } catch (error) {
    console.error("Flashcard generation error:", error);
    throw new Error(formatGeminiError(error, "Failed to generate flashcards"));
  }
};

// ================= GENERATE QUIZ =================
export const generateQuiz = async (content, numberOfQuestions = 5, topic = "") => {
  try {
    const topicInstruction = topic
      ? `The quiz must focus specifically on the topic "${topic}" within the content.`
      : "The quiz must cover the key concepts of the content.";

    const prompt = `
Create ${numberOfQuestions} MCQ questions from the content below.
${topicInstruction}

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

    const result = await generateWithGemini(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```json|```/gi, "").trim();

    const quiz = JSON.parse(text);

    if (!Array.isArray(quiz)) {
      throw new Error("Quiz response is not an array");
    }

    return quiz;
  } catch (error) {
    console.error("Quiz generation error:", error);
    throw new Error(formatGeminiError(error, "Failed to generate quiz"));
  }
};

// ================= GENERATE SUMMARY =================
export const generateSummary = async (content) => {
  try {
    const prompt = `
Summarize the content below in 200-400 words.

CONTENT:
${content.substring(0, 5000)}
`;

    const result = await generateWithGemini(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Summary error:", error);
    throw new Error(formatGeminiError(error, "Failed to generate summary"));
  }
};

// ================= CHAT WITH CONTEXT =================
export const chatWithContext = async (question, chunks = []) => {
  const context = chunks.map((c) => c.content).join("\n\n");

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

  const result = await generateWithGemini(prompt);
  return result.response.text().trim();
};

// ================= CHAT (GENERAL FALLBACK) =================
export const chatGeneral = async (question) => {
  const prompt = `
You are a helpful AI assistant.
Answer the question clearly and briefly.
If the question is ambiguous, make a reasonable assumption and continue.

QUESTION:
${question}

ANSWER:
`;

  const result = await generateWithGemini(prompt);
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

  const result = await generateWithGemini(prompt);
  return result.response.text().trim();
};
