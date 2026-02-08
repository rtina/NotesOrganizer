"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMe } from "@/lib/auth";

export default function HomeActions() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await getMe();
        setLoggedIn(true);
      } catch {
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null;

  return (
    <div className="hero-actions">
      <Link className="btn" href="/notes">
        Open Notes
      </Link>
      {!loggedIn ? (
        <>
          <Link className="btn-outline" href="/notes/login">
            Login
          </Link>
          <Link className="btn-ghost" href="/notes/register">
            Register
          </Link>
        </>
      ) : null}
    </div>
  );
}
