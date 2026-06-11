"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="overflow-hidden rounded-xl2 bg-ink px-6 py-16 text-center lg:px-16">
        <h2 className="font-display text-3xl font-bold tracking-tightest text-bg lg:text-4xl">Шинэ бараа, хямдралаас бүү хоцроорой</h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-bg/70">Имэйлээ бүртгүүлээд хамгийн сүүлийн санал, онцгой урамшууллыг хүлээн аваарай.</p>
        <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="имэйл@жишээ.mn"
            className="w-full rounded-full bg-bg/10 px-5 py-3 text-sm text-bg outline-none ring-1 ring-bg/20 placeholder:text-bg/40 focus:ring-accent"
          />
          <Button onClick={() => email && setDone(true)} className="shrink-0 bg-accent text-white hover:bg-accent-soft">
            {done ? <><Check size={16} /> Болсон</> : "Бүртгүүлэх"}
          </Button>
        </div>
      </div>
    </section>
  );
}
