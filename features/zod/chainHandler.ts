import { z, ZodSchema, type ZodIssue } from "zod";
import type {
  ChainableHandler,
  ChainableContext,
} from "../../types/zodChainHandler.types";

const chainHandler = <Result>(): ChainableHandler<unknown, Result, unknown> => {
  const ctx: ChainableContext<unknown, Result, unknown> = {
    isAuthed: false,
    schema: null,
    input: null,
    middlware: null,
    error: null,
    result: null,
  };

  return {
    async procedure(callback) {
      const middlware = await callback();
      try {
        console.log(middlware);
        if (!middlware) throw new Error("User not authenticated");
        ctx.middlware = await middlware;
        ctx.isAuthed = true;
      } catch (error) {
        ctx.error = error as Error;
      }
      return this as ChainableHandler<
        typeof ctx.input,
        Result,
        typeof middlware
      >;
    },

    async schema(schema: ZodSchema) {
      try {
        if (ctx.error || !ctx.schema) return this;
        ctx.schema = schema;
      } catch (error) {
        ctx.error = error as Error;
      }
      return this as ChainableHandler<
        z.infer<typeof schema>,
        Result,
        typeof ctx.middlware
      >;
    },

    input(data) {
      if (ctx.error) return this;
      if (!ctx.schema) throw new Error("Schema not defined");

      const ss = ctx.schema.safeParse(data);
      if (!ss.success) {
        ctx.error = ss.error.errors as ZodIssue[];
        return this;
      }
      ctx.input = ss;

      return this;
    },

    handler(callback) {
      try {
        if (ctx.error) return this;

        const result = callback(ctx.input!, ctx.middlware!);
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

export default chainHandler();
