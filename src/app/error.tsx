"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-enter mx-auto grid min-h-[60vh] max-w-md place-items-center px-5 text-center">
      <div className="space-y-5">
        <h1 className="font-display text-3xl text-ink">Алдаа гарлаа</h1>
        <p className="text-sm text-muted">Уучлаарай, ямар нэг зүйл буруу боллоо. Дахин оролдоно уу.</p>
        <Button onClick={reset}>Дахин ачаалах</Button>
      </div>
    </div>
  );
}
