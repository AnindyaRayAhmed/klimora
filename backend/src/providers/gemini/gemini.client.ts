import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env.js";

export class GeminiClient {
  private ai: GoogleGenerativeAI;

  constructor() {
    if (!env.geminiApiKey) {
      throw new Error("Failed to initialize Gemini Client: GEMINI_API_KEY is not configured. Please set the GEMINI_API_KEY environment variable.");
    }
    try {
      this.ai = new GoogleGenerativeAI(env.geminiApiKey);
    } catch (e: any) {
      throw new Error(`Failed to initialize Gemini Client: ${e.message}`);
    }
  }

  getModelName(): string {
    return env.geminiModel;
  }

  async analyzeImage(imageBuffer: Buffer, mimeType: string, prompt: string): Promise<any> {
    if (!env.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not set. Cannot perform image analysis.");
    }
    const model = this.ai.getGenerativeModel({
      model: env.geminiModel,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType,
        },
      },
    ]);

    const text = result.response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("Failed to parse Gemini response as JSON");
    }
  }

  async generateText(prompt: string): Promise<string> {
    if (!env.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not set. Cannot synthesize response.");
    }
    const model = this.ai.getGenerativeModel({ model: env.geminiModel });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
