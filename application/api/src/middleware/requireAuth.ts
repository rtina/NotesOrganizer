import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/tokens";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;
  if (!token) {
    const err = new Error("Unauthorized");
    (err as any).status = 401;
    return next(err);
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    const err = new Error("Unauthorized");
    (err as any).status = 401;
    return next(err);
  }
}