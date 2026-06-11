"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  const dark = theme === "dark";
  return (
    <button
      aria-label="Theme солих"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:text-accent"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
