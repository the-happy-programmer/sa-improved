import type { ZodSchema, ZodIssue } from "zod";

export interface ChainableContext<Input, Result, Ctx> {
  isAuthed?: boolean;
  schema?: ZodSchema<Input> | null;
  input?: Input | null;
  ctx?: Ctx | null;
  error?: Error | ZodIssue[] | null;
  result?: Result | null;
}

export interface ChainableHandler<Input, Result, Ctx> {
  state: ChainableContext<Input, Result, Ctx>;
  procedure<Ctx>(
    callback: () => Ctx,
  ): Promise<ChainableHandler<Input, Result, Ctx>>;
  schema<Input>(schema: ZodSchema<Input>): ChainableHandler<Input, Result, Ctx>;
  input(data: unknown): ChainableHandler<Input, Result, Ctx>;
  handler(
    callback: (input: Input, user: Ctx) => Result,
  ): ChainableHandler<Input, Result, Ctx>;
  onError(
    callback: (error: Error | ZodIssue[]) => void,
  ): ChainableHandler<Input, Result, Ctx>;
  onSuccess(
    callback: (result: Result | null) => void,
  ): ChainableHandler<Input, Result, Ctx>;
}
