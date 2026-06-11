"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const isLogin = mode === "login";

  const submit = async () => {
    setErr("");
    try {
      if (isLogin) await login(email, password);
      else await register(name, email, password);
      router.push("/account");
    } catch {
      setErr("Алдаа гарлаа. Мэдээллээ шалгана уу.");
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="mb-2 font-display text-4xl font-bold tracking-tightest text-ink">{isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}</h1>
      <p className="mb-8 text-sm text-muted">{isLogin ? "Бүртгэлдээ нэвтэрнэ үү." : "Шинэ бүртгэл үүсгэнэ үү."}</p>

      <div className="space-y-4">
        {!isLogin && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Нэр" className="w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-accent" />}
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Имэйл" className="w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-accent" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Нууц үг" className="w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-accent" />
        {err && <p className="text-sm text-red-500">{err}</p>}
        <Button onClick={submit} size="lg" className="w-full">{isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}</Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? "Бүртгэлгүй юу? " : "Бүртгэлтэй юу? "}
        <Link href={isLogin ? "/register" : "/login"} className="text-accent hover:underline">{isLogin ? "Бүртгүүлэх" : "Нэвтрэх"}</Link>
      </p>
    </div>
  );
}
