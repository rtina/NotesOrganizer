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
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await getMe();
      setEmail(res.user.email);
      setLoggedIn(true);
      localStorage.setItem("isAuthed", "1");
    } catch {
      setEmail(null);
      const cached = localStorage.getItem("isAuthed") === "1";
      setLoggedIn(cached);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const cached = localStorage.getItem("isAuthed") === "1";
    if (cached) setLoggedIn(true);
    load();
    function handleAuthChanged() {
      load();
    }

    function handleStorage(e: StorageEvent) {
      if (e.key === "isAuthed") {
        load();
      }
    }

    window.addEventListener("auth:changed", handleAuthChanged as EventListener);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("auth:changed", handleAuthChanged as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  async function doLogout() {
    await logout();
    setEmail(null);
    setLoggedIn(false);
    localStorage.removeItem("isAuthed");
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

          {loading ? null : loggedIn || email ? (
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
