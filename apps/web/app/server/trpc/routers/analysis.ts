import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { db } from "../db";

const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.7,
    model: "gemini-2.5-flash",
});

const analyzeCodeSchema = z.object({
    code: z.string().min(1, "El código es requerido"),
    language: z.string().optional().default("javascript"),
});

export const analysisRouter = router({
    analyzeCode: protectedProcedure
        .input(analyzeCodeSchema)
        .mutation(async ({ ctx, input }) => {
            const { code, language } = input;
            const prompt = `
Eres un experto en revisión de código. Analiza el siguiente código en ${language} y proporciona:
- Posibles errores o bugs.
- Sugerencias de mejora en cuanto a rendimiento, legibilidad o buenas prácticas.
- Un resumen general.

Código:
${code}

Devuelve la respuesta ÚNICAMENTE en formato JSON, sin ningún texto adicional fuera del JSON. El JSON debe tener exactamente las claves: "errors", "suggestions", "summary".
`;

            try {
                const response = await model.invoke(prompt);
                const content = typeof response.content === "string"
                    ? response.content
                    : JSON.stringify(response.content);

                let parsedResult;
                try {
                    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
                    if (jsonMatch && jsonMatch[1]) {
                        parsedResult = JSON.parse(jsonMatch[1]);
                    } else {
                        parsedResult = JSON.parse(content);
                    }
                } catch {
                    parsedResult = { errors: [], suggestions: [], summary: content };
                }

                // --- Guardar en base de datos con comprobación de userId ---
                if (ctx.userId) {
                    try {
                        const user = await db.user.findUnique({
                            where: { clerkId: ctx.userId }
                        });
                        if (user) {
                            await db.analysis.create({
                                data: {
                                    userId: user.id,
                                    codeSnippet: code,
                                    result: parsedResult,
                                    status: "completed",
                                },
                            });
                        } else {
                            console.error("No se encontró usuario en BD para clerkId:", ctx.userId);
                        }
                    } catch (dbError) {
                        console.error("Error guardando análisis en BD:", dbError);
                    }
                } else {
                    console.error("No userId en contexto");
                }
                // ---------------------------------------------------------

                return parsedResult;
            } catch (error) {
                console.error("Error al invocar Gemini:", error);
                throw new Error(`Error al analizar el código con IA: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
        // Si no hay userId, devolver array vacío
        if (!ctx.userId) return [];

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