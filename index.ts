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
      const user = await getUser();
      console.log("hello from procedure after user is called");
      console.log("this is the user", user);
    })
    .schema(z.object({ name: z.string(), lastname: z.string() }))
    .input({ name: "tony", lastname: "hajdini" })
    .handler(() => {
      console.log("from handler");
    })
    .onError(({ error }) => {
      console.log(error, "from onError()");
    })
    .onSuccess(() => {
      console.log("hello from onSuccess()");
    });
};

test();
