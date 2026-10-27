import type { Metadata } from "next";
import { ConfirmationMessage } from "@/components/agency/audit-flow";
import { ScheduleEventOnMount } from "@/components/agency/pixel";

export const metadata: Metadata = {
  title: { absolute: "You're booked | Selestial" },
  robots: { index: false, follow: false },
};

export default function AuditConfirmedPage() {
  return (
    <section className="px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-xl">
        <ScheduleEventOnMount />
        <ConfirmationMessage />
      </div>
    </section>
  );
}
