"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { getMe, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  async function load() {
    try {
      const res = await getMe();
      setEmail(res.user.email);
      setLoggedIn(true);
    } catch {
      setEmail(null);
      setLoggedIn(false);
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
  }, []);

  async function doLogout() {
    setEmail(null);
    setLoggedIn(false);
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
      <div className="container flex items-center justify-between gap-3">
        <Link href="/" className="brand-pill">
          Notes Organizer
        </Link>

        <nav className="toolbar">
          <Link className="btn-ghost text-sm" href="/">
            Profile
          </Link>
          <Link className="btn-outline text-sm" href="/notes">
            Notes
          </Link>
          <Link className="btn-outline text-sm" href="/public">
            Public
          </Link>

          <ThemeToggle />

          {loggedIn || email ? (
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
