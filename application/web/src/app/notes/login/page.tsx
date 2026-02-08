"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      localStorage.setItem("isAuthed", "1");
      window.dispatchEvent(new Event("auth:changed"));
      router.push("/notes");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    }
  }

  return (
    <main className="page max-w-md">
      <div className="card space-y-3">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="text-muted text-sm">Sign in to access your notes.</p>

        <form className="auth-form" onSubmit={submit}>
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err ? <div className="text-red-500 text-sm">{err}</div> : null}
          <button className="btn w-full" type="submit">
            Login
          </button>
        </form>

        <div className="text-sm text-muted">
          New?{" "}
          <Link className="underline" href="/notes/register">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
