import { z, ZodSchema, type ZodIssue } from "zod";
import type {
  ChainableHandler,
  ChainableContext,
} from "../../types/zodChainHandler.types";

class ChainHandler {
  private middlewareError: Error | null;
  private hanlderError: Error | null;
  private zodError: ZodIssue[] | null;
  private procedurePromise: Promise<any> | null = null;
  private handlerPromise: Promise<any> | null = null;
  state: any;

  constructor() {
    this.middlewareError = null;
    this.state = {};
  }

  procedure(callback: () => any | Promise<any>): this {
    this.procedurePromise = callback();

    if (callback.constructor.name === "AsyncFuncion") {
      console.log("procedure it is a promise");
      this.procedurePromise!.then((data) => {
        this.state.ctx = data;
        return data;
      });
      return this;
    }
    this.procedurePromise;
    return this;
  }

  schema(schema: ZodSchema): this {
    if (this.middlewareError) {
      return this;
    }
    this.procedurePromise!.then((data) => {
      this.state.schema = schema;
    });
    return this;
  }

  input(data: unknown) {
    this.procedurePromise!.then(() => {
      this.state.input = data;
      const safe = this.state.schema?.safeParse(this.state.input);
      if (!safe.success) {
        this.zodError = safe.error;
        return this;
      }
    });
    return this;
  }

  handler(callback: ({ input, ctx }: { input?: any; ctx?: any }) => any): this {
    if (this.zodError) return this;
    if (!(callback instanceof Promise)) {
      this.procedurePromise!.then((data) => {
        callback({ input: this.state.input, ctx: this.state.ctx });
      });
      return this;
    }

    this.handlerPromise = new Promise((resolve, reject) => {
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
        this.hanlderError = err;
        reject(err);
      });
    });

    return this;
  }

  onSuccess(callback: ({ ctx, input }: { ctx: any; input: any }) => any) {
    Promise.all([this.procedurePromise, this.handlerPromise]).then((data) => {
      callback({ ctx: this.state.ctx, input: this.state.input });
    });
    return this;
  }

  onError(callback: ({ error }: { error: any }) => any) {
    if (this.zodError) return callback({ error: this.zodError });
    Promise.all([this.procedurePromise, this.handlerPromise]).catch((err) => {
      callback({ error: err });
    });
    return this;
  }
}

export function chainHanlder() {
  const chain = new ChainHandler();
  return chain;
}

// const chainHandler = <Result>(): ChainableHandler<unknown, Result, unknown> => {
//   const ctx: ChainableContext<unknown, Result, unknown> = {
//     isAuthed: false,
//     schema: null,
//     input: null,
//     middleware: null,
//     error: null,
//     result: null,
//   };

//   return {
//     async procedure(callback) {
//       try {
//         const middleware = await callback();
//         if (!middleware) throw new Error("middleware Error");
//         ctx.middleware = middleware;
//         ctx.isAuthed = true;
//       } catch (error) {
//         ctx.error = error as Error;
//       }

//       return this as ChainableHandler<
//         typeof ctx.input,
//         Result,
//         typeof ctx.middleware
//       >;
//     },
//     async schema(schema: ZodSchema) {
//       try {
//         if (procedurePromise) {
//           console.log("from schema");
//           await procedurePromise; // Wait for procedure to complete
//         }
//         if (ctx.error) return this;
//         ctx.schema = schema;
//       } catch (error) {
//         ctx.error = error as Error;
//       }
//       return this as ChainableHandler<
//         z.infer<typeof schema>,
//         Result,
//         typeof ctx.middleware
//       >;
//     },
//     async input(data) {
//       if (procedurePromise) await procedurePromise; // Wait for procedure to complete
//       if (ctx.error) return this;
//       if (!ctx.schema) throw new Error("Schema not defined");
//       const ss = ctx.schema.safeParse(data);
//       if (!ss.success) {
//         ctx.error = ss.error.errors as ZodIssue[];
//         return this;
//       }
//       ctx.input = ss;
//       return this;
//     },
//     async handler(callback) {
//       try {
//         if (procedurePromise) await procedurePromise; // Wait for procedure to complete
//         if (ctx.error) return this;
//         const result = callback(ctx.input!, ctx.middleware!);
//         ctx.result = result;
//       } catch (error) {
//         ctx.error = error as Error;
//       }
//       return this;
//     },
//     onError(callback) {
//       if (ctx.error) {
//         callback(ctx.error);
//       }
//       return this;
//     },

//     onSuccess(callback) {
//       if (!ctx.error) {
//         callback(ctx.result);
//       }
//       return this;
//     },
//   };
// };

// export default chainHandler();
