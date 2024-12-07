import type { ZodSchema, ZodIssue } from "zod";

export type ChainableContext<Input, Result, middleware> = {
  isAuthed?: boolean;
  schema?: ZodSchema<Input> | null;
  input?: Input | null;
  middleware?: middleware | null;
  error?: Error | ZodIssue[] | null;
  result?: Result | null;
};

export type ChainableHandler<Input, Result, Middleware> = {
  procedure<Middleware>(
    callback: () => Middleware,
  ): Promise<ChainableHandler<Input, Result, Middleware>>;
  schema<Input>(
    schema: ZodSchema<Input>,
  ): ChainableHandler<Input, Result, Middleware>;
  input(data: unknown): ChainableHandler<Input, Result, Middleware>;
  handler(
    callback: (input: Input, user: Middleware) => Result,
  ): ChainableHandler<Input, Result, Middleware>;
  onError(
    callback: (error: Error | ZodIssue[]) => void,
  ): ChainableHandler<Input, Result, Middleware>;
  onSuccess(
    callback: (result: Result | null) => void,
  ): ChainableHandler<Input, Result, Middleware>;
};
