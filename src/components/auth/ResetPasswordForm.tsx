"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "./PasswordInput";

export function ResetPasswordForm() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.");
      return;
    }
    if (password !== confirmation) {
      setError("Давтан оруулсан нууц үг тохирохгүй байна.");
      return;
    }

    setBusy(true);
    try {
      await updatePassword(password);
      window.location.replace("/login?reset=1");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      setError(
        message.toLowerCase().includes("session")
          ? "Сэргээх холбоос хүчингүй эсвэл хугацаа нь дууссан байна. Шинэ холбоос авна уу."
          : message || "Нууц үгийг шинэчилж чадсангүй. Дахин оролдоно уу.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="mb-2 font-display text-4xl font-bold tracking-tightest text-ink">
        Шинэ нууц үг
      </h1>
      <p className="mb-8 text-sm text-muted">
        Бүртгэлдээ ашиглах шинэ нууц үгээ оруулна уу.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <PasswordInput
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          placeholder="Шинэ нууц үг"
        />
        <PasswordInput
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="new-password"
          placeholder="Шинэ нууц үгээ давтах"
        />
        {error && <p className="text-sm leading-6 text-red-500">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Шинэчилж байна..." : "Нууц үг шинэчлэх"}
        </Button>
      </form>
    </div>
  );
}
