import { router } from "./trpc";
import { healthRouter } from "./routers/health";
import { userProfileRouter } from "./routers/user";
import { analysisRouter } from "./routers/analysis";

export const appRouter = router({
    health: healthRouter,
    userProfile: userProfileRouter,
    analysis: analysisRouter,
});

export type AppRouter = typeof appRouter;