"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { getMe, logout } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";

type AuthState = "guest" | "authenticated";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>("guest");

  async function load() {
    try {
      const res = await getMe();
      setEmail(res.user.email);
      setAuthState("authenticated");
    } catch {
      setEmail(null);
      setAuthState("guest");
    }
  }

  useEffect(() => {
    load();
    function handleAuthChanged() {
      load();
    }

    window.addEventListener("auth:changed", handleAuthChanged as EventListener);

    return () => {
      window.removeEventListener("auth:changed", handleAuthChanged as EventListener);
    };
  }, [pathname]);

  async function doLogout() {
    setEmail(null);
    setAuthState("guest");
    try {
      await logout();
    } catch {
      // Keep UI logged out even if remote logout fails.
    }
    window.dispatchEvent(new Event("auth:changed"));
    router.push("/notes/login");
    router.refresh();
  }

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="brand-pill">
          Notes Organizer
        </Link>

        <nav className="toolbar site-nav">
          <Link className="btn-ghost text-sm" href="/">
            Profile
          </Link>
          {authState === "authenticated" ? (
            <Link className="btn-outline text-sm" href="/notes">
              Notes
            </Link>
          ) : null}
          <Link className="btn-outline text-sm" href="/public">
            Public
          </Link>

          <ThemeToggle />

          {authState === "authenticated" ? (
            <>
              <span className="text-sm text-muted hidden sm:inline">{email}</span>
              <button className="btn text-sm" onClick={doLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn-outline text-sm" href="/notes/login">
                Login
              </Link>
              <Link className="btn text-sm" href="/notes/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
