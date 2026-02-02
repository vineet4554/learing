import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const listAvailableModels = async () => {
  try {
    console.log('Fetching available models...\n');
    
    // Use the REST API directly to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.models) {
      console.log('Available models that support generateContent:\n');
      data.models
        .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
        .forEach(model => {
          console.log(`✅ ${model.name}`);
          console.log(`   Display Name: ${model.displayName}`);
          console.log(`   Description: ${model.description}\n`);
        });
    } else {
      console.log('Response:', data);
    }
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
};

listAvailableModels();