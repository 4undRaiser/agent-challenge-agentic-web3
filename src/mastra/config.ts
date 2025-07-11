import dotenv from "dotenv";
import { createOpenAI } from "@ai-sdk/openai";

// Load environment variables once at the beginning
dotenv.config();

// Export all your environment variables
// Defaults to OpenAI GPT-4o-mini
export const modelName = process.env.MODEL_NAME_AT_ENDPOINT ?? "gpt-4o-mini";
export const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "OPENAI_API_KEY not found in environment variables. " +
    "Please create a .env file in the root directory with OPENAI_API_KEY=your-openai-api-key"
  );
}

// Create and export the model instance
export const model = createOpenAI({
  apiKey: apiKey,
}).chat(modelName);

console.log(`ModelName: ${modelName}\nProvider: OpenAI`);
