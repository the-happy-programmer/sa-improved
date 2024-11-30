import { z } from "zod";
import formInput from "./features/zod/formInput";
import chain from "./features/zod/chainHandler";

async function getUser(max: number): Promise<{ email: string; id: string }> {
  return new Promise(() => {
    setTimeout(() => {
      const e = Math.floor(Math.random() * max);
      if (e > 5) {
        return { email: "tony@hotmail.com", id: "lkj12-1l2kj3-asd31" };
      } else {
        return 0;
      }
    }, 2000);
  });
}

function onSubmit() {
  console.log("hello");
  chain
    .procedure(async () => {
      const user = await getUser(10);
      console.log("hello, from in", user);
      if (!user) throw Error("User not authenticated");

      return user;
    })
    .schema(
      z.object({
        address: z.string(),
        houseNumber: z.number(),
      }),
    )
    .input({ address: "hell's highway", houseNumber: 666 })
    .handler(async (input, user) => {
      const email = (await user).email;
      console.log(input.address, user);
    })
    .onError((error) => {
      console.log(error);
    })
    .onSuccess(() => {
      console.log("from success");
    });
}
onSubmit();
