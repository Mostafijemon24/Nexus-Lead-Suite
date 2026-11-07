"use client";

import type { ReactNode } from "react";
import { openConsultation } from "./consultation-events";

export default function ConsultationTrigger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => openConsultation()}>
      {children}
    </button>
  );
}
