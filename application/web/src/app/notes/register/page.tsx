"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, login } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await register(email, password);
      await login(email, password);
      localStorage.setItem("isAuthed", "1");
      window.dispatchEvent(new Event("auth:changed"));
      router.push("/notes");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Register failed");
    }
  }

  return (
    <main className="page max-w-md">
      <div className="card space-y-3">
        <h1 className="text-2xl font-bold">Register</h1>
        <p className="text-muted text-sm">Create an account to store notes.</p>

        <form className="auth-form" onSubmit={submit}>
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className="input"
            placeholder="Password (min 8 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err ? <div className="text-red-500 text-sm">{err}</div> : null}
          <button className="btn w-full" type="submit">
            Create account
          </button>
        </form>

        <div className="text-sm text-muted">
          Already have an account?{" "}
          <Link className="underline" href="/notes/login">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
