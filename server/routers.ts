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
import { emailVyaconceptRouter } from "./routers/email-vyaconcept";
import { plansRouter } from "./routers/plans";
import { supportRouter } from "./routers/support";
import { checkoutRouter } from "./routers/checkout";
import { affiliatesRouter } from "./routers/affiliates";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  payments: paymentsRouter,
  plans: plansRouter,
  support: supportRouter,
  checkout: checkoutRouter,
  cloud: cloudRouter,
  email: emailRouter,
  emailVya: emailVyaconceptRouter,
  hosting: hostingRouter,
  admin: adminRouter,
  chat: chatRouter,
  webhooks: webhooksRouter,
  affiliates: affiliatesRouter,
});

export type AppRouter = typeof appRouter;
