import type { ZodSchema, ZodIssue } from "zod";

export type ChainableContext<Input, Result, middlware> = {
  isAuthed?: boolean;
  schema?: ZodSchema<Input> | null;
  input?: Input | null;
  middlware?: middlware | null;
  error?: Error | ZodIssue[] | null;
  result?: Result | null;
};

export type ChainableHandler<Input, Result, middlware> = {
  procedure<middlware>(
    callback: () => middlware,
  ): ChainableHandler<Input, Result, middlware>;
  schema<Input>(
    schema: ZodSchema<Input>,
  ): ChainableHandler<Input, Result, middlware>;
  input(data: unknown): ChainableHandler<Input, Result, middlware>;
  handler(
    callback: (input: Input, user: middlware) => Result,
  ): ChainableHandler<Input, Result, middlware>;
  onError(
    callback: (error: Error | ZodIssue[]) => void,
  ): ChainableHandler<Input, Result, middlware>;
  onSuccess(
    callback: (result: Result | null) => void,
  ): ChainableHandler<Input, Result, middlware>;
};
