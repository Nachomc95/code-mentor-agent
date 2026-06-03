import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
console.log('DATABASE_URL:', process.env.DATABASE_URL);
export async function createContext() {
    const { userId } = await auth();

    return {
        db,
        userId,
    };
}

export type Context = Awaited<ReturnType<typeof createContext>>;