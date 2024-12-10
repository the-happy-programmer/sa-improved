import { z, ZodSchema, type ZodIssue } from "zod";

interface CheckResult<T> {
  isError: boolean;
  isSuccess: boolean;
  data?: T;
  error?: ZodIssue[];
}

export default function formInput<T extends ZodSchema>(schema: T) {
  type SchemaType = z.infer<T>;
  return {
    checker: (formData: FormData): CheckResult<SchemaType> => {
      const formDataObject = Object.fromEntries(formData.entries());
      const ss = schema.safeParse(formDataObject);

      if (!ss.success) {
        return {
          isError: true,
          isSuccess: false,
          error: ss.error.errors,
        };
      }

      return {
        isError: false,
        isSuccess: true,
        data: ss.data,
      };
    },
  };
}
