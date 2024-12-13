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
    }, 5000);
  });
}

export async function getUser(): Promise<{ email: string; id: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const time = new Date();
      const success = Math.random() > 0.5;
      true
        ? resolve({ id: "akd-123a", email: "email@example.com" })
        : reject(time);
    }, 1000);
  });
}

const mySchema = z.object({ name: z.string(), lastname: z.string() });
const myInput = { name: "tony", lastname: "hajdini" };

chainHanlder()
  .procedure(() => {
    console.count("from procedure");
    return { name: "Tony", lastname: "hajdini" };
  })
  .schema(mySchema)
  .input(myInput)
  .handler(async (args) => {
    console.count("from hanlder");
    console.log(args?.ctx);
    const data = await getData();
    return data;
  })
  .onSuccess(({ ctx, input }) => {
    console.log("from success", ctx);
  })
  .onError(({ error }) => {
    console.log(error, "from error");
  });
