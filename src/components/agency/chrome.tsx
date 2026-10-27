import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AuditCta } from "@/components/agency/audit-cta";

export function AgencyNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Selestial home">
          <Image
            src="/logo-icon-new.png"
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-[10px]"
            priority
          />
          <span className="font-display truncate text-[17px] font-semibold tracking-[-0.03em] text-[#3E18A4]">
            Selestial
          </span>
        </Link>
        <AuditCta
          label="Book Free Audit"
          size="sm"
          showIcon={false}
          className="!h-11 !w-auto shrink-0 px-3.5 sm:px-4"
        />
      </div>
    </header>
  );
}

export function AgencyFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-zinc-200 bg-white px-5 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm text-zinc-500">© {year} Selestial. All rights reserved.</p>
        <p className="mt-2 text-sm text-zinc-700">Selestial is a Divine Acquisition company.</p>
      </div>
    </footer>
  );
}

export function AgencyShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>
      <AgencyNav />
      <main id="content">{children}</main>
      <AgencyFooter />
    </>
  );
}
