import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { paymentsRouter } from "./routers/payments";
import { cloudRouter } from "./routers/cloud";
import { emailRouter } from "./routers/email";
import { hostingRouter } from "./routers/hosting";
import { adminRouter } from "./routers/admin";
import { chatRouter } from "./routers/chat";
import { webhooksRouter } from "./routers/webhooks";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  payments: paymentsRouter,
  cloud: cloudRouter,
  email: emailRouter,
  hosting: hostingRouter,
  admin: adminRouter,
  chat: chatRouter,
  webhooks: webhooksRouter,
});

export type AppRouter = typeof appRouter;
