"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CONSULTATION_EVENT } from "./consultation-events";
import ConsultationForm from "./ConsultationForm";
import Icon from "@/components/ui/Icon";
import { site } from "@/data/site";

/**
 * Site-wide consultation dialog. Opens from any `#consultation` link or ConsultationTrigger,
 * including links inside migrated HTML content (event delegation below). Navigation closes it
 * because the open state is bound to the path it was opened on.
 */
export default function ConsultationModal() {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;

  // Sync the native <dialog> with React state.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      document.documentElement.classList.add("modal-open");
    } else if (!open && d.open) {
      d.close();
    }
    if (!open) document.documentElement.classList.remove("modal-open");
  }, [open]);

  // Open requests from buttons/links anywhere on the page.
  useEffect(() => {
    const onEvent = () => setOpenAt(window.location.pathname);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href="#consultation"], a[href$="#consultation"]');
      if (a) {
        e.preventDefault();
        setOpenAt(window.location.pathname);
      }
    };
    window.addEventListener(CONSULTATION_EVENT, onEvent);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener(CONSULTATION_EVENT, onEvent);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const hide = () => setOpenAt(null);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="consultation-title"
      onClose={hide}
      onClick={(e) => {
        if (e.target === ref.current) hide();
      }}
    >
      <div className="modal__panel">
        <button type="button" className="modal__close" onClick={hide} aria-label="Close">
          <Icon name="x" size={22} />
        </button>
        <p className="eyebrow">{site.brandName}</p>
        <h2 id="consultation-title">Request a Free Logo Consultation</h2>
        <p className="modal__lead">Takes about a minute. A designer will contact you to talk through your idea. No upfront payment.</p>
        {open ? <ConsultationForm compact source="modal" /> : null}
        <p className="modal__alt">
          Prefer to talk now? <a href={`tel:${site.phone.e164}`}>Call {site.phone.display}</a>
        </p>
      </div>
    </dialog>
  );
}
