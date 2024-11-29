import { z } from "zod";
import formInput from "./features/zod/formInput";
import chain from "./features/zod/chainHandler";

chain
  .procedure(() => {
    const user = { email: "tony@mynameisbond" };
    if (!user) {
      throw Error("user not authenticated");
    }
    return user;
  })
  .schema(z.object({ name: z.string(), lastname: z.string() }))
  .input({ name: "tony", lastname: "chaidinis" })
  .handler(async (ctx, input) => {
    console.log(ctx, input.email);
  })
  .onError(() => {})
  .onSuccess(() => {});
