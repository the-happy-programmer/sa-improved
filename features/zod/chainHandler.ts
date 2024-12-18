import { z, ZodSchema, type ZodIssue } from "zod";
import type {
  ChainableHandler,
  ChainableContext,
} from "../../types/zodChainHandler.types";

class ChainHandler {
  private middlewareError: Error | null;
  private handlerError: Error | null;
  private zodError: ZodIssue[] | null;
  private procedurePromise: Promise<any> | null = null;
  private handlerPromise: Promise<any> | null = null;
  private procedureAsync: boolean = false;
  private hanlderAsync: boolean = false;
  state: any;

  constructor() {
    this.middlewareError = null;
    this.state = {};
    this.handlerError = null;
    this.zodError = null;
  }

  procedure(callback: () => any | Promise<any>): this {
    this.procedureAsync = callback.constructor.name === "AsyncFunction";
    this.procedurePromise = callback();
    if (this.procedureAsync) {
      this.procedurePromise!.then((data) => {
        this.state.ctx = data;
      });
      return this;
    }
    this.state.ctx = callback();
    return this;
  }

  schema(schema: ZodSchema): this {
    if (this.middlewareError) {
      return this;
    }
    this.state.schema = schema;
    return this;
  }

  input(data: unknown) {
    this.state.input = data;
    if (this.procedureAsync) {
      this.procedurePromise!.then(() => {
        const safe = this.state.schema?.safeParse(this.state.input);
        if (!safe.success) {
          this.zodError = safe.error.errors;
        }
      });
    } else {
      const safe = this.state.schema?.safeParse(this.state.input);
      if (!safe.success) {
        this.zodError = safe.error.errors;
      }
    }
    return this;
  }

  handler(callback: ({ input, ctx }: { input?: any; ctx?: any }) => any): this {
    this.hanlderAsync = callback.constructor.name === "AsyncFunction";

    if (this.zodError || this.middlewareError) return this;

    if (!this.hanlderAsync && !this.procedureAsync) {
      callback({ ctx: this.state.ctx, input: this.state.input });
      return this;
    }

    if (this.procedureAsync) {
      this.procedurePromise!.then((data) => {
        callback({ input: this.state.input, ctx: this.state.ctx });
      });
      return this;
    }

    if (this.hanlderAsync || this.procedureAsync) {
      this.handlerPromise = new Promise((resolve, reject) => {
        if (!this.procedureAsync) {
          callback({ ctx: this.state.ctx, input: this.state.input })
            .then((data: any) => {
              resolve(data);
            })
            .catch((err: Error) => {
              this.handlerError = err;
              reject(err);
            });
        } else {
          this.procedurePromise!.then(() => {
            callback({
              ctx: this.state.ctx,
              input: this.state.input,
            })
              .then((data: any) => {
                resolve(data);
              })
              .catch((err: Error) => {
                reject(err);
              });
          }).catch((err) => {
            this.handlerError = err;
            reject(err);
          });
        }
      });
    }

    return this;
  }

  onSuccess(callback: ({ ctx, input }: { ctx: any; input: any }) => any) {
    if (this.zodError || this.middlewareError) return this;
    if (!this.hanlderAsync && !this.procedureAsync) {
      callback({ ctx: this.state.ctx, input: this.state.input });
      return this;
    }
    Promise.all([this.procedurePromise, this.handlerPromise]).then((data) => {
      if (!this.zodError) {
        callback({ ctx: this.state.ctx, input: this.state.input });
      }
    });
    return this;
  }

  onError(callback: ({ error }: { error: any }) => any) {
    const sync = this.hanlderAsync && this.procedureAsync;
    const err = this.zodError || this.middlewareError;
    if (err) {
      callback({ error: this.zodError });
      return this;
    }

    Promise.all([this.procedurePromise, this.handlerPromise])
      .then(() => {
        if (this.zodError) {
          callback({ error: this.zodError });
        }
      })
      .catch((err) => {
        callback({ error: err });
      });
    return this;
  }
}

export function chainHanlder() {
  const chain = new ChainHandler();
  return chain;
}
