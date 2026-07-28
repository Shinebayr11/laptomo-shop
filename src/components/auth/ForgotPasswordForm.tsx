"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordForm() {
  const { requestPasswordReset } = useAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(
    searchParams.get("error") === "expired"
      ? "Сэргээх холбоос хүчингүй эсвэл хугацаа нь дууссан байна. Шинэ холбоос авна уу."
      : "",
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Имэйл хаягаа оруулна уу.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await requestPasswordReset(cleanEmail);
      setSent(true);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Сэргээх холбоос илгээж чадсангүй. Дахин оролдоно уу.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="mb-2 font-display text-4xl font-bold tracking-tightest text-ink">
        Нууц үг сэргээх
      </h1>
      <p className="mb-8 text-sm leading-6 text-muted">
        Бүртгэлтэй имэйлээ оруулна уу. Нууц үг шинэчлэх холбоос таны имэйлд
        очно.
      </p>

      {sent ? (
        <div className="space-y-5">
          <p className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm leading-6 text-ink">
            Хэрэв энэ имэйлээр бүртгэл байгаа бол сэргээх холбоос илгээгдлээ.
            Имэйлийн spam хавтсаа мөн шалгана уу.
          </p>
          <Link href="/login" className="block text-center text-sm text-accent hover:underline">
            Нэвтрэх хэсэг рүү буцах
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            placeholder="Имэйл"
            className="w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-accent"
          />
          {error && <p className="text-sm leading-6 text-red-500">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Илгээж байна..." : "Сэргээх холбоос авах"}
          </Button>
          <Link href="/login" className="block text-center text-sm text-muted hover:text-accent">
            Нэвтрэх хэсэг рүү буцах
          </Link>
        </form>
      )}
    </div>
  );
}
