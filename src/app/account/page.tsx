"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, ShieldCheck, ShoppingBag, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export default function AccountPage() {
  const { user, ready, logout, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.push("/login");
  }, [ready, user, router]);

  if (!ready || !user) return null;

  return (
    <div className="page-enter mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tightest text-ink">Сайн байна уу, {user.name}</h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { logout(); router.push("/"); }}><LogOut size={15} /> Гарах</Button>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link href="/cart" className="flex items-center gap-4 rounded-xl2 border border-line p-6 hover:border-accent">
          <ShoppingBag className="text-accent" /><span className="font-display text-lg text-ink">Миний сагс</span>
        </Link>
        <Link href="/wishlist" className="flex items-center gap-4 rounded-xl2 border border-line p-6 hover:border-accent">
          <Heart className="text-accent" /><span className="font-display text-lg text-ink">Хадгалсан бараа</span>
        </Link>
        {isAdmin && (
          <Link href="/admin" className="flex items-center gap-4 rounded-xl2 border border-line bg-surface p-6 hover:border-accent sm:col-span-2">
            <ShieldCheck className="text-accent" /><span className="font-display text-lg text-ink">Админ удирдлага</span>
          </Link>
        )}
      </div>
    </div>
  );
}
