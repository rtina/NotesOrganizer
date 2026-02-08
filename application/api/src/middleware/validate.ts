import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const err = new Error(result.error.issues.map(i => i.message).join(", "));
      (err as any).status = 400;
      return next(err);
    }

    (req as any).validated = result.data;
    next();
  };