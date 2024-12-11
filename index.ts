import { getShebang } from "typescript";
import { z } from "zod";
import { chainHanlder } from "./features/zod/chainHandler";

export async function getUser(): Promise<{ email: string; id: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.5; // Random success/failure
      true
        ? resolve({ id: "akd-123a", email: "email@example.com" })
        : reject("Authentication failed");
    }, 1000);
  });
}

const mySchema = z.object({ name: z.string(), lastname: z.string() });
const myInput = { name: "tony", lastname: "hajdini" };
const chain = chainHanlder()
  .procedure(async () => {
    const user = getUser();
    return user;
  })
  .schema(mySchema)
  .input(myInput)
  .handler(async () => {
    const user = await getUser();
    return user;
  })
  .onError(({ error }) => {})
  .onSuccess(({ ctx, input }) => {});
