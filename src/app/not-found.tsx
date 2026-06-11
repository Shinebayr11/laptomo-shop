import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="page-enter mx-auto grid min-h-[60vh] max-w-md place-items-center px-5 text-center">
      <div className="space-y-5">
        <p className="font-display text-7xl font-semibold text-accent">404</p>
        <h1 className="font-display text-3xl text-ink">Хуудас олдсонгүй</h1>
        <p className="text-sm text-muted">Таны хайсан хуудас байхгүй эсвэл устгагдсан байна.</p>
        <Link href="/"><Button>Нүүр хуудас руу буцах</Button></Link>
      </div>
    </div>
  );
}
