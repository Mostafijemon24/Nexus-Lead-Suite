import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * Consultation lead endpoint (Node deployment only). Sends the lead by SMTP.
 * Required env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, LEAD_EMAIL_TO, LEAD_EMAIL_FROM
 */
export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

const clean = (v: unknown, max = 500) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  if (body.company) return NextResponse.json({ ok: true }); // honeypot: silently accept

  const name = clean(body.name, 120);
  const email = clean(body.email, 160);
  const phone = clean(body.phone, 40);
  const service = clean(body.service, 80);
  const message = String(body.message ?? "").trim().slice(0, 3000);
  const page = clean(body.page, 200);
  const source = clean(body.source, 40);

  if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !phone) {
    return NextResponse.json({ ok: false, error: "Please provide your name, a valid email and a phone number." }, { status: 422 });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, LEAD_EMAIL_TO, LEAD_EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !LEAD_EMAIL_TO) {
    console.error("Consultation form: SMTP_HOST / LEAD_EMAIL_TO not configured");
    return NextResponse.json({ ok: false, error: "Form delivery is not configured" }, { status: 500 });
  }

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  const text = [`New consultation request (${source || "website"})`, "", `Name: ${name}`, `Email: ${email}`, `Phone: ${phone}`, `Service: ${service}`, `Page: ${page}`, "", "Message:", message || "(none)"].join("\n");

  try {
    await transport.sendMail({
      from: LEAD_EMAIL_FROM || SMTP_USER,
      to: LEAD_EMAIL_TO,
      replyTo: email,
      subject: `Free consultation request – ${name}${service ? ` (${service})` : ""}`,
      text,
    });
  } catch (err) {
    console.error("Consultation form: send failed", err);
    return NextResponse.json({ ok: false, error: "Could not send your request" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
