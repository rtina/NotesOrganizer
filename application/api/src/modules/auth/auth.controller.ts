import type { Request, Response, NextFunction } from "express";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/tokens";
import { registerUser, validateUser } from "./auth.service";

/**
 * Helper to define cookie settings.
 * The 'as const' at the end ensures that 'sameSite' is treated as the 
 * specific literal types Express expects rather than a general string.
 */
function cookieOptions() {
  const isProd = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  } as const;
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await registerUser(email, password);
    res.status(201).json({ ok: true, user });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await validateUser(email, password);

    if (!user) {
      const err = new Error("Invalid credentials");
      // Use a custom property check or 'any' if you haven't defined a custom Error type
      (err as any).status = 401;
      throw err;
    }

    const access = signAccessToken({ sub: user.id, email: user.email });
    const refresh = signRefreshToken({ sub: user.id, email: user.email });

    // Using the fixed cookieOptions
    res.cookie("access_token", access, cookieOptions());
    res.cookie("refresh_token", refresh, cookieOptions());

    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    // Assuming req.user is populated by an auth middleware
    if (!(req as any).user) {
      const err = new Error("Unauthorized");
      (err as any).status = 401;
      throw err;
    }

    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.id },
      select: { id: true, email: true, createdAt: true },
    });

    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
  res.json({ ok: true });
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) {
      const err = new Error("Unauthorized");
      (err as any).status = 401;
      throw err;
    }

    const payload = verifyRefreshToken(token);
    const access = signAccessToken({ sub: payload.sub, email: payload.email });

    res.cookie("access_token", access, cookieOptions());
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}