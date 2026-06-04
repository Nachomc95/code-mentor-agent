import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { getGeminiModel } from "../../../lib/gemini";
import { db } from "../db"; // import normal para db, sin dinámico

const analyzeCodeSchema = z.object({
    code: z.string().min(1),
    language: z.string().optional().default("javascript"),
});

export const analysisRouter = router({
    analyzeCode: protectedProcedure
        .input(analyzeCodeSchema)
        .mutation(async ({ input }) => {
            const { code, language } = input;
            const model = await getGeminiModel();

            const prompt = `
Eres un experto en revisión de código. Analiza el siguiente código en ${language} y proporciona:
- Posibles errores o bugs.
- Sugerencias de mejora en cuanto a rendimiento, legibilidad o buenas prácticas.
- Un resumen general.

Código:
${code}

Devuelve la respuesta ÚNICAMENTE en formato JSON con las claves: "errors", "suggestions", "summary".
`;

            const response = await model.invoke(prompt);
            const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);

            try {
                const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch && jsonMatch[1]) return JSON.parse(jsonMatch[1]);
                return JSON.parse(content);
            } catch {
                return { errors: [], suggestions: [], summary: content };
            }
        }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
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