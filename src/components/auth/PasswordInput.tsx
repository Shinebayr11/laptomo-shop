"use client";

import { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/utils/format";

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

export function PasswordInput({
  className,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const label = visible ? "Нууц үг нуух" : "Нууц үг харуулах";

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(
          "w-full rounded-lg border border-line bg-bg px-4 py-3 pr-12 text-sm outline-none focus:border-accent",
          className,
        )}
      />
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted transition-colors hover:text-ink"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
