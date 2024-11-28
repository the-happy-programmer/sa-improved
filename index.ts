import { z } from "zod";
import formInput from "./features/zod/formInput";

const formData = new FormData();
formData.append("email", "email@email.com");
formData.append("username", "mynameisbond");
const { data, error, isError, isSuccess } = formInput(
  z.object({
    email: z.string().email(),
    username: z.string(),
  }),
).checker(formData);

console.log(data?.username, error);
