import type { Metadata } from "next";
import { COMPANY_LEGAL_NAME } from "@/lib/marketing/agency";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | Selestial" },
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#c4b5fd]">
        Placeholder. To be reviewed by counsel.
      </p>
      <h1 className="font-display mt-3 text-[36px] font-semibold tracking-[-0.03em] text-zinc-950">
        Privacy Policy
      </h1>
      <div className="mt-6 space-y-4 text-[16px] leading-snug text-zinc-600">
        <p>This page is a placeholder. A lawyer must review it before launch.</p>
        <p>
          {COMPANY_LEGAL_NAME} is a Divine Acquisition company. The Lead Leak Audit form collects
          your company name, service area, average project size, how you get leads today, whether
          you can fund ads, and any contact details you give the scheduler.
        </p>
        <p>
          We also keep ad parameters from the link you clicked, such as UTM tags, so we can tell
          which ad produced the audit.
        </p>
        <p>We use that information to prepare for your call and to follow up about your request.</p>
        <p>We do not sell it. You can ask us to delete it by emailing hello@selestial.io.</p>
      </div>
    </article>
  );
}
