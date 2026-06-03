"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "../trpc/client";
import { useState } from "react";

export default function Dashboard() {
    const { isSignedIn, user: clerkUser } = useUser();
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");

    const analyzeMutation = api.analysis.analyzeCode.useMutation();

    const handleAnalyze = () => {
        if (!code.trim()) return;
        analyzeMutation.mutate({ code, language });
    };

    if (!isSignedIn) return <div>No autenticado. <a href="/sign-in">Inicia sesión</a></div>;

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Dashboard</h1>
            <section>
                <h2>Perfil</h2>
                <pre>{JSON.stringify(clerkUser, null, 2)}</pre>
            </section>

            <hr />

            <section>
                <h2>Analizar código con IA (Gemini)</h2>
                <div>
                    <label>Lenguaje: </label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                    </select>
                </div>
                <textarea
                    rows={10}
                    cols={70}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Pega tu código aquí..."
                    style={{ width: "100%", fontFamily: "monospace" }}
                />
                <br />
                <button onClick={handleAnalyze} disabled={analyzeMutation.isPending}>
                    {analyzeMutation.isPending ? "Analizando..." : "Analizar con Gemini"}
                </button>

                {analyzeMutation.data && (
                    <div style={{ marginTop: "2rem", background: "#f4f4f4", padding: "1rem", borderRadius: "8px" }}>
                        <h3>Resultado del análisis:</h3>
                        <pre>{JSON.stringify(analyzeMutation.data, null, 2)}</pre>
                    </div>
                )}

                {analyzeMutation.error && (
                    <div style={{ color: "red", marginTop: "1rem" }}>
                        Error: {analyzeMutation.error.message}
                    </div>
                )}
            </section>
        </div>
    );
}