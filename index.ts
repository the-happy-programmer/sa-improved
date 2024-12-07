import { getShebang } from "typescript";
import Dolores from "./features/zod/chainHandler";

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
      const { email, id } = await getUser();
    })
    .handler(() => {
      console.log("this is a handler");
    });
};

test();
