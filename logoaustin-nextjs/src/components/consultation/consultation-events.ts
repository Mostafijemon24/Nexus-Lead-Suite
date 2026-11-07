export const CONSULTATION_EVENT = "logoaustin:consultation";

export function openConsultation(detail?: { source?: string }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSULTATION_EVENT, { detail }));
}
