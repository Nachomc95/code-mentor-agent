"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
    const { isSignedIn } = useUser();
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/dashboard/history", label: "Historial" },
    ];

    return (
        <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-6">
                <Link href="/" className="text-xl font-bold text-blue-600">
                    Code Mentor Agent
                </Link>
                {isSignedIn && (
                    <div className="flex space-x-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === item.href
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <div>
                {!isSignedIn ? (
                    <SignInButton mode="modal">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition">
                            Iniciar sesión
                        </button>
                    </SignInButton>
                ) : (
                    <UserButton />
                )}
            </div>
        </nav>
    );
}