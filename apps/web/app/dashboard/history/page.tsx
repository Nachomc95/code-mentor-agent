import { auth } from '@clerk/nextjs/server';
import { db } from '../../server/trpc/db'; // Ajusta si tu db.ts está en otro lugar
import { AnalysisCard } from '../../components/AnalysisCard';

export default async function HistoryPage() {
    const { userId } = await auth();
    if (!userId) return <div>No autorizado</div>;

    const user = await db.user.findUnique({
        where: { clerkId: userId },
        include: { analyses: { orderBy: { createdAt: 'desc' } } } // 'desc' no 0
    });

    if (!user) return <div>Usuario no encontrado</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto"> {/* mx-auto, no max-auto */}
            <h1 className="text-2xl font-bold mb-6">Historial de análisis</h1>
            {user.analyses.length === 0 ? (
                <p className="text-gray-500">Todavía no has realizado ningún análisis.</p>
            ) : (
                <div className="space-y-4">
                    {user.analyses.map((analysis) => (
                        <AnalysisCard key={analysis.id} analysis={analysis} />
                    ))}
                </div>
            )}
        </div>
    );
}