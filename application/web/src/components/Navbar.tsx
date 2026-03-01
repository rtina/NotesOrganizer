"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { getMe, logout } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";

type AuthState = "guest" | "authenticated";

const LOGOUT_COOLDOWN_MS = 3000;

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>("guest");
  const justLoggedOutRef = useRef(false);

  async function load() {
    if (justLoggedOutRef.current) {
      setEmail(null);
      setAuthState("guest");
      return;
    }
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
    justLoggedOutRef.current = true;
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
    window.setTimeout(() => {
      justLoggedOutRef.current = false;
    }, LOGOUT_COOLDOWN_MS);
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
