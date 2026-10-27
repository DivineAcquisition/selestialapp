"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  TRACKING_STORAGE_KEY,
  mergeTracking,
  readTrackingRecord,
  type TrackingParams,
} from "@/lib/marketing/agency";

function readStored(): TrackingParams {
  try {
    const raw = window.sessionStorage.getItem(TRACKING_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as TrackingParams;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Keeps ad parameters from the landing URL so the booking step can attach them. */
export function CaptureTracking() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromUrl = readTrackingRecord(searchParams);
    if (Object.keys(fromUrl).length === 0) return;
    const merged = mergeTracking(fromUrl, readStored());
    window.sessionStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(merged));
  }, [searchParams]);

  return null;
}
