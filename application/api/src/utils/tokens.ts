import jwt from "jsonwebtoken";
import { env } from "../config/env";

type TokenPayload = {
  sub: string;
  email: string;
};

export function signAccessToken(payload: TokenPayload) {
  // We cast 'expiresIn' to any or the specific jwt.SignOptions type 
  // to satisfy the library's strict internal string-literal types.
  return jwt.sign(payload, env.JWT_ACCESS_SECRET as string, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as any,
  });
}

export function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET as string, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET as string) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET as string) as TokenPayload;
}