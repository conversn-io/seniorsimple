"use client";
// React/Next.js wrapper for the callready-tracker pixel.
// Drop into a RootLayout inside <body>. Fires once on landing; no re-fires on
// client-side navigation (click capture is a first-touch concept).
//
// Usage (Next.js App Router):
//   // app/layout.tsx
//   import { TrackerBoot } from "@/lib/callready-tracker/TrackerBoot";
//   export default function RootLayout({ children }) {
//     return (<html><body>{children}<TrackerBoot brand="seniorsimple" offer="apc" /></body></html>);
//   }
import { useEffect } from "react";
import { initTracker, type TrackerConfig } from "./index";

export function TrackerBoot(config: TrackerConfig = {}) {
  useEffect(() => {
    initTracker(config);
    // Deps intentionally empty: fire once on first mount. Config changes
    // between navigations should not re-fire the click (that's a new landing,
    // which is a full page load anyway).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export type { TrackerConfig };
