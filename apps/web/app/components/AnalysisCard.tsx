/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';

// Importa JsonValue si quieres tipar result correctamente
// import type { JsonValue } from '@prisma/client/runtime/library';

interface Analysis {
    id: string;
    createdAt: Date | string;
    status: string;
    result: any; // O JsonValue si lo prefieres, pero any funciona
    codeSnippet: string | null;   // ← permite null, no solo undefined
    repoUrl?: string | null;
    userId: string;
}

export function AnalysisCard({ analysis }: { analysis: Analysis }) {
    const [expanded, setExpanded] = useState(false);

    const resultData = typeof analysis.result === 'string'
        ? JSON.parse(analysis.result)
        : analysis.result;

    return (
        <div className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500">
                        {new Date(analysis.createdAt).toLocaleString()}
                    </p>
                    <p className="font-medium">Estado: {analysis.status}</p>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-blue-600 hover:underline"
                >
                    {expanded ? 'Ocultar' : 'Ver detalles'}
                </button>
            </div>

            {expanded && (
                <div className="mt-3">
                    {analysis.codeSnippet && (
                        <div className="mb-3">
                            <h4 className="font-semibold">Código analizado:</h4>
                            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                                {analysis.codeSnippet}
                            </pre>
                        </div>
                    )}
                    <div>
                        <h4 className="font-semibold">Resultado:</h4>
                        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                            {JSON.stringify(resultData, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}