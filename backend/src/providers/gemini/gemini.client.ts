import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env.js";

export class GeminiClient {
  private ai: GoogleGenerativeAI;

  constructor() {
    if (!env.geminiApiKey) {
      console.warn("GEMINI_API_KEY is not set. Gemini features will fail.");
    }
    this.ai = new GoogleGenerativeAI(env.geminiApiKey || "");
  }

  async analyzeImage(imageBuffer: Buffer, mimeType: string, prompt: string): Promise<any> {
    const model = this.ai.getGenerativeModel({
      model: "gemini-2.0-flash",
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
    const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
