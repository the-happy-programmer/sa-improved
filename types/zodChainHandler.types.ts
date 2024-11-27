import type { ZodSchema, ZodIssue } from "zod";

export type ChainableContext<Input, Result, User> = {
  isAuthed: boolean;
  schema: ZodSchema<Input> | null;
  input: Input | null;
  user: User | null;
  error: Error | ZodIssue[] | null;
  result: Result | null;
};

export type ChainableHandler<Input, Result, User> = {
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
