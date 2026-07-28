"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function AuthenticatedCartLink() {
  const { user, ready } = useAuth();

  if (!ready || !user) return null;

  return (
    <li>
      <Link href="/cart" className="hover:text-accent">
        Сагс
      </Link>
    </li>
  );
}
