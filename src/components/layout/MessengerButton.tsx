"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { SITE } from "@/constants/site";

export function MessengerButton() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={SITE.social.messenger}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Messenger-ээр чатлах"
      className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#0866ff] px-4 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0866ff]"
    >
      <MessageCircle size={24} fill="currentColor" aria-hidden="true" />
      <span className="hidden sm:inline">Messenger</span>
    </a>
  );
}
