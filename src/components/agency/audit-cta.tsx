"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BrandButton } from "@/components/marketing/BrandButton";
import { AUDIT_PATH, auditHref, readTrackingRecord } from "@/lib/marketing/agency";
import { cn } from "@/lib/utils";

type Variant = "primary" | "solid" | "outline" | "ghost" | "inverted";
type Size = "sm" | "md" | "lg" | "xl";

function AuditCtaLink({
  label,
  variant,
  size,
  className,
  showIcon,
}: {
  label: string;
  variant: Variant;
  size: Size;
  className?: string;
  showIcon: boolean;
}) {
  const searchParams = useSearchParams();
  const href = auditHref(readTrackingRecord(searchParams));

  return (
    <BrandButton href={href} variant={variant} size={size} className={className}>
      {label}
      {showIcon ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
    </BrandButton>
  );
}

export function AuditCta({
  label,
  variant = "primary",
  size = "xl",
  className,
  showIcon = true,
}: {
  label: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  showIcon?: boolean;
}) {
  const fallbackClass = cn("w-full sm:w-auto", className);

  return (
    <Suspense
      fallback={
        <BrandButton href={AUDIT_PATH} variant={variant} size={size} className={fallbackClass}>
          {label}
          {showIcon ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
        </BrandButton>
      }
    >
      <AuditCtaLink
        label={label}
        variant={variant}
        size={size}
        className={fallbackClass}
        showIcon={showIcon}
      />
    </Suspense>
  );
}
