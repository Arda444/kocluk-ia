"use client";

import type { ReactNode } from "react";
import { TimerProvider } from "@/components/TimerProvider";
import { TimerHud } from "@/components/TimerHud";

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <TimerProvider>
      {children}
      <TimerHud />
    </TimerProvider>
  );
}
