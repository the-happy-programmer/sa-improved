import { Schema, z } from "zod";
import { chainHanlder } from "./features/zod/chainHandler";

export async function getData(): Promise<{ id: string; title: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const time = new Date();
      const success = Math.random() > 0.5;
      false
        ? resolve({ id: "akd-iasd-2323-asds-", title: "this is a title" })
        : reject("fetching data was wrong");
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
        : reject("user not found");
    }, 5000);
  });
}

export async function getAuth(): Promise<{ authed: true }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const time = new Date();
      const success = Math.random() > 0.5;
      true ? resolve({ authed: true }) : reject("user is not authed");
    }, 1000);
  });
}

const mySchema = z.object({ name: z.string(), lastname: z.string() });
const myInput = { name: "Tony", lastname: "hajdini" };

const user = async () => {
  const user = await getUser();
  return user;
};

const authorization = async () => {
  const data = await getAuth();
  return data;
};

chainHanlder()
  .procedure(user, authorization)
  .schema(mySchema)
  .input(myInput)
  .handler(async ({ input, ctx }) => {
    // this will run is procedures have not thrown any errors
    const data = await getData();
    return data;
  })
  .onSuccess(({ ctx, input }) => {
    // this will run is eveything has run successfully
    console.log("onSuccess", ctx, input);
  })
  .onError(({ error }) => {
    // this will run the first errors it occurs when one of the above throws an error
    console.log("from error", error);
  });
