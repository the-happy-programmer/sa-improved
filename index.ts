import { getShebang } from "typescript";
import { z } from "zod";
import { Dolores } from "./features/zod/chainHandler";

export async function getUser(): Promise<{ email: string; id: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.5; // Random success/failure
      success
        ? resolve({ id: "akd-123a", email: "email@example.com" })
        : reject("Authentication failed");
    }, 2000);
  });
}
const test = async () => {
  const dolores = new Dolores();

  dolores
    .procedure(async () => {
      console.log("before user");
      const { id } = await getUser();
      console.log("hello");
    })
    .schema(z.object({ name: z.string(), lastname: z.string() }))
    .input({ name: "tony", lastname: "hajdini" })
    .handler(() => {
      console.log("from handler");
    })
    .onError(({ error }) => {
      console.log("from onError()");
    })
    .onSuccess(() => {
      console.log("hello from onSuccess()");
    });
};

test();
