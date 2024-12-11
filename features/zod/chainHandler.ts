import { z, ZodSchema, type ZodIssue } from "zod";
import type {
  ChainableHandler,
  ChainableContext,
} from "../../types/zodChainHandler.types";

class ChainHandler {
  private middlewareError: Error | null;
  private procedurePromise: Promise<any> | null = null;
  private hanlderPromise: Promise<any> | null = null;
  state: any;

  constructor() {
    this.middlewareError = null;
    this.state = {};
  }

  procedure(callback: any): this {
    this.procedurePromise = callback();
    if (this.procedurePromise instanceof Promise) {
      this.procedurePromise
        .then((data) => {
          this.state.ctx = data;
          return data;
        })
        .catch((error) => {
          this.middlewareError = error;
          return this;
        });
    }
    return this;
  }

  schema(schema: ZodSchema): this {
    if (this.middlewareError) {
      return this;
    }
    this.procedurePromise!.then((data) => {
      console.log("this is from schema", this.state.input);
      this.state.schema = schema;
    });
    return this;
  }

  input(data: unknown) {
    this.procedurePromise!.then(() => {
      this.state.input = data;
      const safe = this.state.schema?.safeParse(this.state.input);
    });
    return this;
  }

  handler(callback: any): this {
    this.hanlderPromise = callback();
    this.procedurePromise!.then((data) => {
      this.hanlderPromise;
    }).catch((err) => {
      this.middlewareError = err;
    });

    return this;
  }

  onSuccess(callback: ({ ctx, input }: { ctx: any; input: any }) => any) {
    Promise.all([this.procedurePromise, this.hanlderPromise]).then((data) => {
      if (!this.middlewareError) {
        console.log("from success inside", data);
        callback({ ctx: this.state.ctx, input: this.state.input });
      }
    });
    return this;
  }

  onError(callback: ({ error }: { error: any }) => any) {
    this.procedurePromise!.catch((err) => {
      callback({ error: err });
    });
    return this;
  }
}

export function chainHanlder() {
  const chain = new ChainHandler();
  return chain;
}

const chainHandler = <Result>(): ChainableHandler<unknown, Result, unknown> => {
  const ctx: ChainableContext<unknown, Result, unknown> = {
    isAuthed: false,
    schema: null,
    input: null,
    middleware: null,
    error: null,
    result: null,
  };

  return {
    async procedure(callback) {
      try {
        const middleware = await callback();
        if (!middleware) throw new Error("middleware Error");
        ctx.middleware = middleware;
        ctx.isAuthed = true;
      } catch (error) {
        ctx.error = error as Error;
      }

      return this as ChainableHandler<
        typeof ctx.input,
        Result,
        typeof ctx.middleware
      >;
    },
    async schema(schema: ZodSchema) {
      try {
        if (procedurePromise) {
          console.log("from schema");
          await procedurePromise; // Wait for procedure to complete
        }
        if (ctx.error) return this;
        ctx.schema = schema;
      } catch (error) {
        ctx.error = error as Error;
      }
      return this as ChainableHandler<
        z.infer<typeof schema>,
        Result,
        typeof ctx.middleware
      >;
    },
    async input(data) {
      if (procedurePromise) await procedurePromise; // Wait for procedure to complete
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
    async handler(callback) {
      try {
        if (procedurePromise) await procedurePromise; // Wait for procedure to complete
        if (ctx.error) return this;
        const result = callback(ctx.input!, ctx.middleware!);
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

// export default chainHandler();
