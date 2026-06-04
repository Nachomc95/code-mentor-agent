import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// No creamos el modelo aquí arriba, lo haremos dentro de la función

const analyzeCodeSchema = z.object({
    code: z.string().min(1, "El código es requerido"),
    language: z.string().optional().default("javascript"),
});

// Función auxiliar para obtener el modelo (lazy)
let model: ChatGoogleGenerativeAI | null = null;
function getModel() {
    if (!model) {
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error("Falta la variable de entorno GOOGLE_API_KEY");
        }
        model = new ChatGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_API_KEY,
            temperature: 0.7,
            model: "gemini-2.5-flash",
        });
    }
    return model;
}

export const analysisRouter = router({
    analyzeCode: protectedProcedure
        .input(analyzeCodeSchema)
        .mutation(async ({ input }) => {
            const { code, language } = input;

            const prompt = `
Eres un experto en revisión de código. Analiza el siguiente código en ${language} y proporciona:
- Posibles errores o bugs.
- Sugerencias de mejora en cuanto a rendimiento, legibilidad o buenas prácticas.
- Un resumen general.

Código:
${code}

Devuelve la respuesta ÚNICAMENTE en formato JSON con las claves: "errors", "suggestions", "summary".
`;

            const model = getModel();
            const response = await model.invoke(prompt);
            const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);

            try {
                const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch && jsonMatch[1]) {
                    return JSON.parse(jsonMatch[1]);
                }
                return JSON.parse(content);
            } catch {
                return { errors: [], suggestions: [], summary: content };
            }
        }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
        if (!ctx.userId) return [];
        const { db } = await import("../db");
        const user = await db.user.findUnique({
            where: { clerkId: ctx.userId }
        });
        if (!user) return [];
        return db.analysis.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
    }),
});