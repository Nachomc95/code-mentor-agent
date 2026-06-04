// apps/web/lib/gemini.ts
import type { ChatGoogleGenerativeAI } from "@langchain/google-genai";

let model: ChatGoogleGenerativeAI | null = null;

export async function getGeminiModel() {
    if (!model) {
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error("Falta GOOGLE_API_KEY");
        }
        // Importación dinámica del paquete
        const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
        model = new ChatGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_API_KEY,
            temperature: 0.7,
            model: "gemini-2.5-flash",
        });
    }
    return model;
}