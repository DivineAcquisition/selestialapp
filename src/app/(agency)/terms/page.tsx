import type { Metadata } from "next";
import { COMPANY_LEGAL_NAME } from "@/lib/marketing/agency";

export const metadata: Metadata = {
  title: { absolute: "Terms | Selestial" },
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#c4b5fd]">
        Placeholder. To be reviewed by counsel.
      </p>
      <h1 className="font-display mt-3 text-[36px] font-semibold tracking-[-0.03em] text-white">
        Terms
      </h1>
      <div className="mt-6 space-y-4 text-[16px] leading-snug text-[#ddd6f5]">
        <p>This page is a placeholder. A lawyer must review it before launch.</p>
        <p>
          {COMPANY_LEGAL_NAME} is a Divine Acquisition company. Booking a Lead Leak Audit does not
          create a service contract.
        </p>
        <p>
          If you later become a client, the written agreement you sign controls fees, notice, and
          what you own. Until then, these terms are a draft only.
        </p>
        <p>
          The consent line on the booking form is also a placeholder and is not a finished legal
          disclosure.
        </p>
      </div>
    </article>
  );
}
