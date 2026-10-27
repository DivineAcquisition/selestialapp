import { Suspense } from "react";
import type { Metadata } from "next";
import { AuditFlow } from "@/components/agency/audit-flow";

export const metadata: Metadata = {
  title: { absolute: "Book a Lead Leak Audit | Selestial" },
  description:
    "Answer three questions, then book a free 30-minute Lead Leak Audit with Selestial.",
  robots: { index: false, follow: false },
};

export default function AuditPage() {
  return (
    <section className="px-5 py-12 sm:py-16">
      <Suspense fallback={<p className="mx-auto max-w-xl text-zinc-500">Loading the audit…</p>}>
        <AuditFlow />
      </Suspense>
    </section>
  );
}
