"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LogIn,
  UserPlus,
  ShieldCheck,
  LogOut,
  Package,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function AccountMenu() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  const item =
    "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink hover:bg-surface";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Хэрэглэгч"
        className="grid h-9 w-9 place-items-center text-ink hover:text-accent"
      >
        <User size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl2 border border-line bg-bg shadow-lg">
          {user ? (
            <>
              <div className="border-b border-line px-4 py-3">
                <p className="truncate text-sm font-medium text-ink">
                  {user.name}
                </p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
              {!isAdmin && (
                <button onClick={() => go("/account")} className={item}>
                  <Package size={15} /> Миний захиалга
                </button>
              )}
              {isAdmin && (
                <button onClick={() => go("/admin")} className={item}>
                  <ShieldCheck size={15} /> Админ удирдлага
                </button>
              )}
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                  router.push("/");
                }}
                className={`${item} border-t border-line text-red-600`}
              >
                <LogOut size={15} /> Гарах
              </button>
            </>
          ) : (
            <div className="p-3">
              <p className="px-1 pb-3 text-xs leading-5 text-muted">
                Захиалга хийх, дуртай бараагаа хадгалахын тулд бүртгэлдээ
                нэвтэрнэ үү.
              </p>
              <button
                onClick={() => go("/login")}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-soft px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-accent/25 transition-all duration-300 hover:shadow-lg hover:shadow-accent/35 active:scale-[0.98]"
              >
                <LogIn size={15} /> Нэвтрэх
              </button>
              <button
                onClick={() => go("/register")}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
              >
                <UserPlus size={15} /> Бүртгүүлэх
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
