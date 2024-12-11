import { z } from "zod";
import { chainHanlder } from "./features/zod/chainHandler";

export async function getData(): Promise<{ id: string; title: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const time = new Date();
      const success = Math.random() > 0.5;
      true
        ? resolve({ id: "akd-iasd-2323-asds-", title: "this is a title" })
        : reject(time);
    }, 1000);
  });
}

export async function getUser(): Promise<{ email: string; id: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const time = new Date();
      const success = Math.random() > 0.5;
      false
        ? resolve({ id: "akd-123a", email: "email@example.com" })
        : reject(time);
    }, 1000);
  });
}

const mySchema = z.object({ name: z.string(), lastname: z.string() });
const myInput = { name: "tony", lastname: "hajdini" };

chainHanlder()
  .procedure(async () => {
    const user = getUser();
    return user;
  })
  .schema(mySchema)
  .input(myInput)
  .handler(async ({ input, ctx }) => {
    const tm = new Date();
    console.log("from hanlder", ctx, tm);
    const user = await getData();
    return user;
  })
  .onSuccess(({ ctx, input }) => {
    console.log("from success", ctx);
  })
  .onError(({ error }) => {
    console.log(error, "from error");
  });
