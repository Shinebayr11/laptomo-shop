"use client";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/utils/format";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-start">
      <div className="flex gap-3 overflow-x-auto pb-1 lg:max-h-[720px] lg:w-28 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0">
        {images.map((src, i) => (
          <button
            key={i} onClick={() => setActive(i)}
            className={cn(
              "relative h-24 w-24 shrink-0 overflow-hidden border-2 bg-white transition-colors sm:h-28 sm:w-28",
              active === i ? "border-ink" : "border-transparent hover:border-line",
            )}
          >
            <Image
              src={src}
              alt={`${title} ${i + 1}`}
              fill
              unoptimized
              sizes="112px"
              className="object-contain p-1"
            />
          </button>
        ))}
      </div>
      <div className="relative w-full overflow-hidden bg-white">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={images[active]}
            alt={title}
            fill
            priority
            unoptimized
            sizes="(max-width:1024px) 100vw, 58vw"
            className="object-contain p-3 sm:p-5 lg:p-6"
          />
        </div>
      </div>
    </div>
  );
}
