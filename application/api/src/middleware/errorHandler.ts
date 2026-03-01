import type { NextFunction, Request, Response } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = typeof err?.status === "number" ? err.status : 500;
  const message = err?.message || "Internal Server Error";

  // In development, only log unexpected errors (5xx). 401/403/404 are expected and would spam the console.
  if (process.env.NODE_ENV !== "production" && status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    ok: false,
    error: message,
  });
}