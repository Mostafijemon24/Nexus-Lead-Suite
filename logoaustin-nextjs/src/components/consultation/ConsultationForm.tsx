"use client";

import { useId, useState, type FormEvent } from "react";
import { site } from "@/data/site";
import Icon from "@/components/ui/Icon";

type Status = "idle" | "sending" | "sent" | "error";

const SERVICE_OPTIONS = ["Custom logo", "Fix an AI-generated logo", "Branding", "Graphic design", "Logo and website", "Something else"];

export default function ConsultationForm({ compact = false, source = "form" }: { compact?: boolean; source?: string }) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.company) return; // honeypot
    setStatus("sending");
    setError("");
    try {
      const res = await fetch(site.consultation.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source, page: typeof window !== "undefined" ? window.location.pathname : "" }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "sent") {
    return (
      <div className="form-success" role="status">
        <Icon name="check-circle" size={28} />
        <h3>Thank you. A designer will contact you shortly.</h3>
        <p>
          Prefer to talk now? Call <a href={`tel:${site.phone.e164}`}>{site.phone.display}</a> or message us on{" "}
          <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form className={`cform ${compact ? "cform--compact" : ""}`} onSubmit={onSubmit} noValidate={false}>
      <div className="cform__grid">
        <div className="field field--full">
          <label htmlFor={`${id}-name`}>Name</label>
          <input id={`${id}-name`} name="name" type="text" autoComplete="name" required placeholder="Your name" />
        </div>
        <div className="field">
          <label htmlFor={`${id}-email`}>Email</label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </div>
        <div className="field">
          <label htmlFor={`${id}-phone`}>Mobile</label>
          <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" required placeholder="(512) 000-0000" />
        </div>
        <fieldset className="field field--full">
          <legend>What do you need?</legend>
          <div className="cform__radios">
            {SERVICE_OPTIONS.map((opt, i) => (
              <label key={opt} className="radio">
                <input type="radio" name="service" value={opt} defaultChecked={i === 0} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {!compact && (
          <div className="field field--full">
            <label htmlFor={`${id}-message`}>Tell us about your business or logo (optional)</label>
            <textarea id={`${id}-message`} name="message" rows={3} placeholder="Business name, what you do, colors or styles you like" />
          </div>
        )}
        <label className="hp" aria-hidden="true">
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button type="submit" className="btn btn--primary btn--lg cform__submit" disabled={status === "sending"}>
        <span>{status === "sending" ? "Sending…" : "Get My Free Consultation"}</span>
        <Icon name="send" size={18} />
      </button>
      {status === "error" && (
        <p className="form-error" role="alert">
          We could not send your message ({error}). Please call <a href={`tel:${site.phone.e164}`}>{site.phone.display}</a> or try again.
        </p>
      )}
      <p className="cform__note">No upfront payment. Multiple concepts and revisions included. We reply by phone, text or email.</p>
    </form>
  );
}
