import { z, ZodSchema, type ZodIssue } from "zod";
import type {
  ChainableHandler,
  ChainableContext,
} from "../../types/zodChainHandler.types";

class ChainHandler {
  private zodError: ZodIssue[] | null;
  private procedurePromise: Promise<any> | null = null;
  private handlerPromise: Promise<any> | null = null;
  error: ZodIssue[] | Error | null = null;
  state: any;

  constructor() {
    this.state = {};
    this.zodError = null;
  }

  procedure(callback: () => any | Promise<any>): this {
    this.procedurePromise = Promise.resolve()
      .then(() => callback())
      .catch((err) => {
        throw err;
      });
    return this;
  }

  schema(schema: ZodSchema): this {
    this.procedurePromise!.then(() => {
      this.state.schema = schema;
    });
    return this;
  }

  input(data: unknown) {
    this.state.input = data;
    this.procedurePromise!.then(() => {
      const safe = this.state.schema?.safeParse(this.state.input);
      if (!safe.success) {
        this.zodError = safe.error.errors;
      }
    });
    return this;
  }

  handler(callback: ({ input, ctx }: { input?: any; ctx?: any }) => any): this {
    this.handlerPromise = this.procedurePromise!.then((data) =>
      Promise.resolve()
        .then(() => callback({ input: this.state.input, ctx: data }))
        .catch((err) => {
          throw err;
        }),
    );
    return this;
  }

  onSuccess(callback: ({ ctx, input }: { ctx: any; input: any }) => any) {
    Promise.all([this.procedurePromise, this.handlerPromise])!
      .then((data) => {
        if (!this.zodError) {
          callback({ ctx: data[0], input: this.state.input });
        }
      })
      .catch((err) => {
        throw err;
      });
    return this;
  }

  onError(callback: ({ error }: { error: any }) => any) {
    this.handlerPromise!.then(() => {
      if (this.zodError) {
        callback({ error: this.zodError });
      }
    }).catch((err) => {
      callback({ error: err });
    });
    return this;
  }
}

export function chainHanlder() {
  const chain = new ChainHandler();
  return chain;
}
