// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "./trpc/provider";
import { Navbar } from "./components/Navbar";
import "./globals.css";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <TRPCProvider>
                <html lang="es">
                    <body>
                        <Navbar />
                        <main className="container mx-auto px-4 py-6">
                            {children}
                        </main>
                    </body>
                </html>
            </TRPCProvider>
        </ClerkProvider>
    );
}