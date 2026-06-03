import { protectedProcedure, router } from "../trpc";
import { db } from "../db";
import { currentUser } from "@clerk/nextjs/server";

export const userProfileRouter = router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
        const { userId } = ctx;
        if (!userId) throw new Error("No userId");

        const clerkUser = await currentUser();
        if (!clerkUser) throw new Error("Usuario no encontrado en Clerk");

        const email = clerkUser.emailAddresses[0]?.emailAddress ?? "sin-email@example.com";
        const firstName = clerkUser.firstName ?? "";
        const lastName = clerkUser.lastName ?? "";
        const name = `${firstName} ${lastName}`.trim() || null;

        const user = await db.user.upsert({
            where: { clerkId: userId },
            update: { email, name },
            create: { clerkId: userId, email, name },
        });

        return user;
    }),
});