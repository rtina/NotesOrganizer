import { api } from "./api";

export type MeResponse = { ok: true; user: { id: string; email: string } };

export async function getMe() {
  return api<MeResponse>("/auth/me");
}

export async function login(email: string, password: string) {
  return api("/auth/login", { method: "POST", json: { email, password } });
}

export async function register(email: string, password: string) {
  return api("/auth/register", { method: "POST", json: { email, password } });
}

export async function logout() {
  return api("/auth/logout", { method: "POST" });
}