import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({ eyebrow, title, href, linkLabel }: { eyebrow?: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-10 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-wide2 text-accent">{eyebrow}</p>}
        <h2 className="font-display text-3xl font-bold tracking-tightest text-ink lg:text-4xl">{title}</h2>
      </div>
      {href && linkLabel && (
        <Link href={href} className="hidden items-center gap-1.5 whitespace-nowrap text-sm text-muted hover:text-accent sm:flex">
          {linkLabel} <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
