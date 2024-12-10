import { z, ZodSchema, type ZodIssue } from "zod";
import type {
  ChainableHandler,
  ChainableContext,
} from "../../types/zodChainHandler.types";

export class Dolores {
  private middlewareError: boolean;
  private procedurePromise: Promise<any> | null = null;
  private middlewareExecuted: boolean;
  state: Record<string, unknown>;

  constructor() {
    this.middlewareError = false;
    this.middlewareExecuted = false;
    this.state = {};
  }

  procedure(callback: any): this {
    try {
      this.procedurePromise = callback();
      if (this.state.procedure instanceof Promise) {
        this.state.procedure
          .then((data) => {
            this.state.ctx = data;
            return data;
          })
          .catch((error) => {
            this.state.error = error;
            return this;
          });
      }

      return this;
    } catch (error) {
      console.error(error);
      this.middlewareError = true;
      this.state.error = error;
      throw error;
    }
  }

  schema(schema: ZodSchema): this {
    try {
      if (!this.middlewareError) {
        return this;
      }
      if (this.state.error) {
        return this;
      }
      this.state.schema = schema;
      return this;
    } catch (error) {
      this.state.error = error as Error;
    }
    return this;
  }

  input(input: any) {
    return this;
  }

  handler(callback: any): this {
    try {
      this.procedurePromise!.then((data) => {
        this.state.ctx = data;
      }).catch((err) => {
        this.state.error = err;
      });
      if (this.middlewareError) {
        return this;
      }

      return this;
    } catch (error) {
      throw error;
    }
  }

  onSuccess(callback) {
    return this;
  }

  onError(callback: ({ error: any }) => any) {
    if (this.state.error) {
      callback({ error: this.state.error });
    }
    return this;
  }
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
