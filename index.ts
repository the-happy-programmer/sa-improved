import { z, ZodSchema, type ZodIssue } from "zod";

type ChainableContext<Input, Result, User> = {
  isAuthed: boolean;
  schema: ZodSchema<Input> | null;
  input: Input | null;
  user: User | null;
  error: Error | ZodIssue[] | null;
  result: Result | null;
};

type ChainableHandler<Input, Result, User> = {
  isAuthed<User>(callback: () => User): ChainableHandler<Input, Result, User>;
  schema<Input>(
    schema: ZodSchema<Input>,
  ): ChainableHandler<Input, Result, User>;
  input(data: unknown): ChainableHandler<Input, Result, User>;
  handler(
    callback: (input: Input, user: User) => Result,
  ): ChainableHandler<Input, Result, User>;
  onError(
    callback: (error: Error | ZodIssue[]) => void,
  ): ChainableHandler<Input, Result, User>;
  onSuccess(
    callback: (result: Result | null) => void,
  ): ChainableHandler<Input, Result, User>;
};

const zodChainHandler = <Result>(): ChainableHandler<
  unknown,
  Result,
  unknown
> => {
  const ctx: ChainableContext<unknown, Result, unknown> = {
    isAuthed: false,
    schema: null,
    input: null,
    user: null,
    error: null,
    result: null,
  };

  return {
    isAuthed(callback) {
      const user = callback();
      try {
        if (!user) throw new Error("User not authenticated");
        ctx.user = user;
        ctx.isAuthed = true;
      } catch (error) {
        ctx.error = error as Error;
      }
      return this as ChainableHandler<typeof ctx.input, Result, typeof user>;
    },

    schema(schema: ZodSchema) {
      try {
        if (ctx.error) return this;
        ctx.schema = schema;
      } catch (error) {
        ctx.error = error as Error;
      }
      return this as ChainableHandler<
        z.infer<typeof schema>,
        Result,
        typeof ctx.user
      >;
    },

    input(data) {
      if (ctx.error) return this;
      if (!ctx.schema) throw new Error("Schema not defined");

      console.log("VALIUD");
      const ss = ctx.schema.safeParse(data);
      if (!ss.success) {
        ctx.error = ss.error.errors as ZodIssue[];
        return this;
      }
      console.log("VALIUD", ss);
      ctx.input = ss;

      return this;
    },

    handler(callback) {
      try {
        if (ctx.error) return this;

        const result = callback(ctx.input!, ctx.user!);
        ctx.result = result;
      } catch (error) {
        ctx.error = error as Error;
      }
      return this;
    },

    onError(callback) {
      if (ctx.error) {
        callback(ctx.error);
      }
      return this;
    },

    onSuccess(callback) {
      if (!ctx.error) {
        callback(ctx.result);
      }
      return this;
    },
  };
};
