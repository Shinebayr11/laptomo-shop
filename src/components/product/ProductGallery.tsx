"use client";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/utils/format";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      <div className="flex gap-3 lg:flex-col">
        {images.map((src, i) => (
          <button
            key={i} onClick={() => setActive(i)}
            className={cn("relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors", active === i ? "border-accent" : "border-transparent")}
          >
            <Image src={src} alt={`${title} ${i + 1}`} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative aspect-square flex-1 overflow-hidden rounded-xl2 bg-surface">
        <Image src={images[active]} alt={title} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
      </div>
    </div>
  );
}
