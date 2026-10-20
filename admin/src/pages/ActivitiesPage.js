import * as e from "react/jsx-runtime";
import * as b from "react";
import {
  Activity as vi,
  Bot as Gs,
  CalendarDays as Qc,
  ChevronDown as Qs,
  ChevronRight as Xc,
  Image as Hl,
  MessageSquare as Xn,
  RefreshCw as ad,
  Search as Yn,
  Trash2 as yt,
  Users as Da,
  X as _t,
} from "lucide-react";
import {
  ICON_OPTIONS,
  ModalShell,
  PageFrame,
  ResultModal,
  StickyFooter,
  getAdminConfig,
  jn,
  restFetch,
} from "../shared/common.js";

function StatCard({ icon: a, label: o, value: i, tone: d = "blue" }) {
  const u = {
    blue: "nls-stat--primary",
    green: "nls-stat--success",
    purple: "nls-stat--primary",
    amber: "nls-stat--warning",
    slate: "",
  };
  return e.jsxs("div", {
    className: ["nls-stat", u[d] || ""].filter(Boolean).join(" "),
    children: [
      e.jsxs("div", { className: "nls-stat__label", children: [a, e.jsx("span", { children: o })] }),
      e.jsx("div", { className: "nls-stat__value", children: i }),
    ],
  });
}
function jd(a) {
  if (!a) return "—";
  const [o, i] = String(a).split(" ");
  return i ? `${o} ${i.slice(0, 5)}` : o;
}
function AiLogsPanel() {
  const { restUrl: a, nonce: o } = getAdminConfig(),
    [i, d] = b.useState(!0),
    [u, p] = b.useState(null),
    [h, x] = b.useState(!1),
    [f, S] = b.useState([]),
    [y, P] = b.useState(""),
    [M, T] = b.useState(""),
    [F, V] = b.useState(""),
    [z, U] = b.useState(null),
    [w, N] = b.useState(!1),
    nlsFromId = b.useId(),
    nlsToId = b.useId(),
    nlsSearchId = b.useId(),
    H = b.useCallback(async () => {
      d(!0);
      try {
        const C = new URLSearchParams();
        (y && C.set("dateFrom", y), M && C.set("dateTo", M), F && C.set("search", F));
        const j = await (await fetch(`${a}${jn}/ai/logs?${C}`, { headers: { "X-WP-Nonce": o } })).json();
        j && j.success && (p(j.data.stats), x(!!j.data.loggingEnabled), S(j.data.conversations || []));
      } catch {
      } finally {
        d(!1);
      }
    }, [a, o, y, M, F]);
  b.useEffect(() => {
    H();
  }, []);
  const W = async (C) => {
      (U({ sessionId: C, transcript: null }), N(!0));
      try {
        const j = await (
          await fetch(`${a}${jn}/ai/logs/detail?session=${encodeURIComponent(C)}`, { headers: { "X-WP-Nonce": o } })
        ).json();
        j && j.success && U({ sessionId: C, transcript: j.data.transcript || [] });
      } catch {
        U({ sessionId: C, transcript: [] });
      } finally {
        N(!1);
      }
    },
    I = async () => {
      if (window.confirm("Permanently delete ALL stored chat transcripts? This cannot be undone."))
        try {
          (await fetch(`${a}${jn}/ai/logs/clear`, { method: "POST", headers: { "X-WP-Nonce": o } }), U(null), H());
        } catch {}
    };
  return e.jsxs("div", {
    className: "nls-stack nls-stack--tight",
    children: [
      !h &&
        e.jsxs("div", {
          className: "nls-notice nls-notice--warning",
          role: "status",
          children: [
            e.jsxs("span", {
              children: [
                "Transcript storage is ",
                e.jsx("strong", { children: "off" }),
                ". Turn on ",
                e.jsx("strong", { children: "“Store chat transcripts”" }),
                " in Settings → AI Chatbot → FAQ & Buttons to start collecting conversations here. Existing rows still display below.",
              ],
            }),
          ],
        }),
      e.jsxs("div", {
        className: "nls-stats",
        children: [
          e.jsx(StatCard, {
            tone: "blue",
            icon: e.jsx(Da, { "aria-hidden": "true" }),
            label: "Conversations",
            value: u ? u.conversations : "—",
          }),
          e.jsx(StatCard, {
            tone: "green",
            icon: e.jsx(Xn, { "aria-hidden": "true" }),
            label: "Messages",
            value: u ? u.messages : "—",
          }),
          e.jsx(StatCard, {
            tone: "purple",
            icon: e.jsx(Qc, { "aria-hidden": "true" }),
            label: "Today",
            value: u ? u.today : "—",
          }),
          e.jsx(StatCard, {
            tone: "amber",
            icon: e.jsx(Qc, { "aria-hidden": "true" }),
            label: "Last 7 days",
            value: u ? u.last7 : "—",
          }),
          e.jsx(StatCard, {
            tone: "slate",
            icon: e.jsx(Hl, { "aria-hidden": "true" }),
            label: "With images",
            value: u ? u.withImages : "—",
          }),
        ],
      }),
      u && ((u.intents && u.intents.length) || (u.sentiments && Object.keys(u.sentiments).length))
        ? e.jsxs("div", {
            className: "nls-grid-2",
            children: [
              e.jsxs("div", {
                className: "nls-card nls-card__body",
                children: [
                  e.jsx("div", { className: "nls-eyebrow", style: { marginBottom: 12 }, children: "Top intents" }),
                  e.jsxs("div", {
                    className: "nls-stack nls-stack--tight",
                    style: { gap: 8 },
                    children: [
                      (u.intents || []).map((C) => {
                        const J = Math.max(...u.intents.map((j) => j.count), 1);
                        return e.jsxs(
                          "div",
                          {
                            className: "nls-bar",
                            children: [
                              e.jsx("span", { className: "nls-bar__label", children: C.label }),
                              e.jsx("span", {
                                className: "nls-bar__track",
                                children: e.jsx("span", {
                                  className: "nls-bar__fill",
                                  style: { width: `${Math.round((C.count / J) * 100)}%` },
                                }),
                              }),
                              e.jsx("span", { className: "nls-bar__value", children: C.count }),
                            ],
                          },
                          C.label,
                        );
                      }),
                      (u.intents || []).length
                        ? null
                        : e.jsx("div", { className: "nls-muted nls-text-sm", children: "No data yet." }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "nls-card nls-card__body",
                children: [
                  e.jsx("div", { className: "nls-eyebrow", style: { marginBottom: 12 }, children: "Sentiment" }),
                  e.jsx("div", {
                    className: "nls-row",
                    children: ["positive", "neutral", "negative", "urgent"].map((C) => {
                      const J = {
                          positive: "nls-badge--success",
                          neutral: "nls-badge--muted",
                          negative: "nls-badge--danger",
                          urgent: "nls-badge--warning",
                        },
                        j = (u.sentiments && u.sentiments[C]) || 0;
                      return e.jsxs(
                        "span",
                        {
                          className: `nls-badge ${J[C]}`,
                          style: { textTransform: "capitalize" },
                          children: [C, ": ", j],
                        },
                        C,
                      );
                    }),
                  }),
                ],
              }),
            ],
          })
        : null,
      e.jsxs("div", {
        className: "nls-card nls-card__body nls-toolbar",
        style: { alignItems: "flex-end" },
        children: [
          e.jsxs("div", {
            className: "nls-field",
            children: [
              e.jsx("label", { className: "nls-field__label", htmlFor: nlsFromId, children: "From" }),
              e.jsx("input", { id: nlsFromId, type: "date", value: y, onChange: (C) => P(C.target.value) }),
            ],
          }),
          e.jsxs("div", {
            className: "nls-field",
            children: [
              e.jsx("label", { className: "nls-field__label", htmlFor: nlsToId, children: "To" }),
              e.jsx("input", { id: nlsToId, type: "date", value: M, onChange: (C) => T(C.target.value) }),
            ],
          }),
          e.jsxs("div", {
            className: "nls-field",
            style: { flex: "1 1 220px" },
            children: [
              e.jsx("label", { className: "nls-field__label", htmlFor: nlsSearchId, children: "Search" }),
              e.jsxs("span", {
                className: "nls-input-icon",
                children: [
                  e.jsx(Yn, { "aria-hidden": "true" }),
                  e.jsx("input", {
                    id: nlsSearchId,
                    type: "text",
                    value: F,
                    onChange: (C) => V(C.target.value),
                    onKeyDown: (C) => C.key === "Enter" && H(),
                    placeholder: "Message text…",
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("button", {
            type: "button",
            onClick: H,
            className: "nls-btn nls-btn--primary",
            children: [e.jsx(ad, { "aria-hidden": "true" }), "Apply"],
          }),
          e.jsxs("button", {
            type: "button",
            onClick: I,
            className: "nls-btn nls-btn--danger",
            children: [e.jsx(yt, { "aria-hidden": "true" }), "Clear all"],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "nls-grid-2",
        children: [
          e.jsxs("div", {
            className: "nls-card",
            children: [
              e.jsx("div", {
                className: "nls-card__header",
                children: e.jsxs("div", {
                  className: "nls-card__title",
                  children: ["Conversations ", f.length ? `(${f.length})` : ""],
                }),
              }),
              e.jsx("div", {
                className: "nls-scroll-list",
                children: i
                  ? e.jsx("div", { className: "nls-empty-inline", children: "Loading…" })
                  : f.length === 0
                    ? e.jsx("div", { className: "nls-empty-inline", children: "No conversations yet." })
                    : f.map((C) =>
                        e.jsxs(
                          "button",
                          {
                            type: "button",
                            onClick: () => W(C.sessionId),
                            className: ["nls-convo-row", z && z.sessionId === C.sessionId ? "is-active" : ""]
                              .filter(Boolean)
                              .join(" "),
                            "aria-pressed": z && z.sessionId === C.sessionId ? "true" : "false",
                            children: [
                              e.jsxs("div", {
                                className: "nls-convo-row__main",
                                children: [
                                  e.jsx("div", {
                                    className: "nls-convo-row__title",
                                    children: C.firstQuestion || "(image / no text)",
                                  }),
                                  e.jsxs("div", {
                                    className: "nls-convo-row__meta",
                                    children: [
                                      e.jsx("span", { children: jd(C.lastAt) }),
                                      e.jsx("span", { children: "·" }),
                                      e.jsxs("span", {
                                        children: [C.messageCount, " msg", C.messageCount === 1 ? "" : "s"],
                                      }),
                                      C.imageCount > 0 ? e.jsxs("span", { children: ["· 📎 ", C.imageCount] }) : null,
                                    ],
                                  }),
                                ],
                              }),
                              e.jsx(Xc, { "aria-hidden": "true" }),
                            ],
                          },
                          C.sessionId,
                        ),
                      ),
              }),
            ],
          }),
          e.jsxs("div", {
            className: "nls-card",
            children: [
              e.jsxs("div", {
                className: "nls-card__header",
                children: [
                  e.jsx("div", { className: "nls-card__title", children: "Transcript" }),
                  z
                    ? e.jsx("button", {
                        type: "button",
                        onClick: () => U(null),
                        className: "nls-icon-btn nls-icon-btn--sm",
                        "aria-label": "Close transcript",
                        children: e.jsx(_t, {}),
                      })
                    : null,
                ],
              }),
              e.jsx("div", {
                className: "nls-scroll-list nls-card__body",
                children: z
                  ? w
                    ? e.jsx("div", { className: "nls-empty-inline", children: "Loading…" })
                    : !z.transcript || z.transcript.length === 0
                      ? e.jsx("div", { className: "nls-empty-inline", children: "Empty transcript." })
                      : e.jsx("div", {
                          className: "nls-chat",
                          children: z.transcript.map((C, J) =>
                            e.jsxs(
                              "div",
                              {
                                className: "nls-chat__turn",
                                children: [
                                  e.jsx("div", {
                                    className: "nls-chat__row nls-chat__row--user",
                                    children: e.jsx("div", {
                                      className: "nls-chat__bubble nls-chat__bubble--user",
                                      children: C.question || (C.hasImage ? "🖼️ (image attached)" : "—"),
                                    }),
                                  }),
                                  e.jsx("div", {
                                    className: "nls-chat__row",
                                    children: e.jsxs("div", {
                                      className: "nls-chat__bubble",
                                      children: [
                                        C.answer,
                                        C.sources && C.sources.length
                                          ? e.jsx("div", {
                                              className: "nls-chat__sources",
                                              children: C.sources.map((j, le) =>
                                                e.jsx(
                                                  "a",
                                                  {
                                                    href: j.url,
                                                    target: "_blank",
                                                    rel: "noopener noreferrer",
                                                    className: "nls-chat__source",
                                                    children: j.title || j.url,
                                                  },
                                                  le,
                                                ),
                                              ),
                                            })
                                          : null,
                                      ],
                                    }),
                                  }),
                                  e.jsx("div", { className: "nls-chat__time", children: jd(C.createdAt) }),
                                ],
                              },
                              J,
                            ),
                          ),
                        })
                  : e.jsx("div", { className: "nls-empty-inline", children: "Select a conversation to read it." }),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
const Qm = [
    {
      id: "all",
      label: "All",
    },
    {
      id: "forms",
      label: "Forms",
    },
    {
      id: "calls",
      label: "Calls",
    },
    {
      id: "consultations",
      label: "Consultations",
    },
    {
      id: "interactions",
      label: "Interactions",
    },
  ],
  Xm = [
    {
      id: "summary",
      label: "Summary counts",
    },
    {
      id: "forms",
      label: "Form submissions (full answers)",
    },
    {
      id: "chats",
      label: "Chat transcripts",
    },
    {
      id: "activities",
      label: "Activity log",
    },
  ];
function Ym({ className: a = "h-4 w-4" }) {
  return e.jsxs("svg", {
    className: a,
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.8,
    stroke: "currentColor",
    "aria-hidden": "true",
    children: [
      e.jsx("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 15.75h3.375c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9H5.625c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125H9",
      }),
      e.jsx("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M10 18.25h.75a1.75 1.75 0 0 0 0-3.5H10v3.5Zm4.25 0v-3.5h1.9m-.8 1.75h-1.1",
      }),
    ],
  });
}
function FilterTabs({ active: a, children: o, onClick: i }) {
  return e.jsx("button", {
    type: "button",
    onClick: i,
    "aria-pressed": a ? "true" : "false",
    className: `nls-pill${a ? " is-active" : ""}`,
    children: o,
  });
}
function wd({ tone: a, children: o }) {
  const i = {
    blue: "nls-badge--primary",
    green: "nls-badge--success",
    purple: "nls-badge--primary",
    amber: "nls-badge--warning",
    red: "nls-badge--danger",
    slate: "nls-badge--muted",
  };
  return e.jsx("span", { className: `nls-badge ${i[a] || i.slate}`, children: o });
}
function Zm(a) {
  return String(a || "")
    .split(/\r?\n/)
    .map((o) => o.trim())
    .filter(Boolean);
}
function ex(a) {
  return String(a || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}
function tx(a) {
  if (!("mailSent" in a) && !("mail_sent" in a)) return;
  const o = "mailSent" in a ? a.mailSent : a.mail_sent;
  return o === null ? null : o;
}
function sx(a) {
  return a.mailStatus ?? a.mail_status ?? "—";
}
function getAdminConfigWithTitle() {
  const a = window.nexulesuite_Admin || {};
  return {
    restUrl: a.restUrl || "",
    nonce: a.nonce || "",
    siteTitle: a.siteTitle || "Website",
  };
}
function ActivitiesReportModal({ open: a, onClose: o, filters: i }) {
  const { restUrl: d, nonce: u, siteTitle: p } = getAdminConfigWithTitle(),
    [h, x] = b.useState(!1),
    [f, S] = b.useState(["summary", "activities"]),
    [y, P] = b.useState(!1),
    [M, T] = b.useState([]),
    [F, V] = b.useState(""),
    [z, U] = b.useState(""),
    [w, N] = b.useState({}),
    [H, W] = b.useState({ open: !1, variant: "success", title: "", message: "" });
  b.useEffect(() => {
    if (!a) return;
    const ie = new AbortController();
    return (
      (async () => {
        var O;
        try {
          const pe = await (
              await fetch(`${d}nexulesuite_/v1/emails/templates`, {
                headers: { "X-WP-Nonce": u },
                credentials: "same-origin",
                signal: ie.signal,
              })
            ).json(),
            me = (O = pe == null ? void 0 : pe.data) == null ? void 0 : O.templates;
          T(Array.isArray(me) ? me : []);
        } catch {
          T([]);
        }
      })(),
      () => ie.abort()
    );
  }, [a, d, u]);
  const I = b.useMemo(() => {
      const ie = [];
      for (const O of M) {
        const te = Array.isArray(O == null ? void 0 : O.recipients) ? O.recipients : Zm(O == null ? void 0 : O.emails);
        for (const pe of te) ie.push(String(pe).trim());
      }
      return Array.from(new Set(ie.filter((O) => O !== "")));
    }, [M]),
    C = b.useMemo(() => Object.values(w).filter(Boolean).length, [w]),
    J = (ie) => {
      S((O) => (O.includes(ie) ? O.filter((te) => te !== ie) : [...O, ie]));
    },
    j = async () => {
      var ie;
      if (!(h || f.length === 0)) {
        x(!0);
        try {
          const O = await fetch(`${d}nexulesuite_/v1/reports/combined/pdf`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-WP-Nonce": u },
              credentials: "same-origin",
              body: JSON.stringify({
                tab: i.tab,
                dateFrom: i.fromDate,
                dateTo: i.toDate,
                search: i.search,
                sections: f,
              }),
            }),
            te = await O.json(),
            pe = (ie = te == null ? void 0 : te.data) == null ? void 0 : ie.pdf_url;
          if (!O.ok || !pe) {
            W({ open: !0, variant: "error", title: "Error!", message: "Failed to generate PDF." });
            return;
          }
          window.open(pe, "_blank", "noopener,noreferrer");
        } catch {
          W({ open: !0, variant: "error", title: "Error!", message: "Failed to generate PDF." });
        } finally {
          x(!1);
        }
      }
    },
    le = async () => {
      var pe;
      if (y) return;
      const ie = I.filter((me) => w[me]),
        O = ex(z),
        te = [...ie, ...O];
      if (te.length === 0) {
        W({ open: !0, variant: "error", title: "Error!", message: "Please select or enter at least one recipient." });
        return;
      }
      P(!0);
      try {
        const me = await fetch(`${d}nexulesuite_/v1/reports/activities/email`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-WP-Nonce": u },
            credentials: "same-origin",
            body: JSON.stringify({
              tab: i.tab,
              dateFrom: i.fromDate,
              dateTo: i.toDate,
              search: i.search,
              recipients: te,
              customMessage: F,
            }),
          }),
          B = await me.json();
        if (!me.ok || !(B != null && B.success)) {
          const ee =
            (B == null ? void 0 : B.message) ||
            ((pe = B == null ? void 0 : B.data) == null ? void 0 : pe.message) ||
            "Failed to send email.";
          W({
            open: !0,
            variant: "error",
            title: "Error!",
            message: typeof ee == "string" ? ee : "Failed to send email.",
          });
          return;
        }
        W({ open: !0, variant: "success", title: "Success!", message: "Email sent successfully." });
      } catch {
        W({ open: !0, variant: "error", title: "Error!", message: "Failed to send email." });
      } finally {
        P(!1);
      }
    };
  return a
    ? e.jsxs(e.Fragment, {
        children: [
          e.jsx(ResultModal, {
            open: H.open,
            variant: H.variant,
            title: H.title,
            message: H.message,
            onDismiss: () => W((ie) => ({ ...ie, open: !1 })),
          }),
          e.jsxs(ModalShell, {
            open: a,
            onClose: o,
            size: "md",
            labelledBy: "nexulesuite_act-report-title",
            className: "nexulesuite_act-modal-panel",
            children: [
              e.jsxs("div", {
                className: "nls-modal__header",
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("h2", {
                        id: "nexulesuite_act-report-title",
                        className: "nls-modal__title",
                        children: "Activities Report",
                      }),
                      e.jsx("p", {
                        className: "nls-modal__desc",
                        children: new Date().toLocaleDateString(void 0, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }),
                      }),
                    ],
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: o,
                    className: "nls-icon-btn",
                    "aria-label": "Close",
                    children: e.jsx(_t, {}),
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "nls-modal__body nls-stack nls-stack--tight",
                children: [
                  e.jsxs("fieldset", {
                    className: "nls-field",
                    children: [
                      e.jsx("legend", { className: "nls-field__label", children: "Include in report" }),
                      e.jsx("div", {
                        className: "nls-check-grid",
                        children: Xm.map((ie) =>
                          e.jsxs(
                            "label",
                            {
                              className: "nls-check",
                              children: [
                                e.jsx("input", {
                                  type: "checkbox",
                                  checked: f.includes(ie.id),
                                  onChange: () => J(ie.id),
                                }),
                                e.jsx("span", { children: ie.label }),
                              ],
                            },
                            ie.id,
                          ),
                        ),
                      }),
                    ],
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: j,
                    disabled: h || f.length === 0,
                    className: "nls-btn nls-btn--secondary nls-btn--block",
                    children: h ? "Generating…" : "Preview PDF Report",
                  }),
                  e.jsx("div", { className: "nls-divider" }),
                  e.jsx("h3", { className: "nls-section__title", children: "Share via Email" }),
                  e.jsxs("div", {
                    className: "nls-field",
                    children: [
                      e.jsx("label", {
                        className: "nls-field__label",
                        htmlFor: "nexulesuite_act-custom-message",
                        children: "Custom Message (Optional)",
                      }),
                      e.jsx("textarea", {
                        id: "nexulesuite_act-custom-message",
                        value: F,
                        onChange: (ie) => V(ie.target.value),
                        rows: 3,
                        placeholder: "Add a personal message to include in the email...",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "nls-field",
                    children: [
                      e.jsx("label", {
                        className: "nls-field__label",
                        htmlFor: "nexulesuite_act-custom-emails",
                        children: "Custom Email Addresses",
                      }),
                      e.jsx("input", {
                        id: "nexulesuite_act-custom-emails",
                        value: z,
                        onChange: (ie) => U(ie.target.value),
                        placeholder: "Enter email addresses separated by commas",
                      }),
                    ],
                  }),
                  e.jsxs("fieldset", {
                    className: "nls-field",
                    children: [
                      e.jsx("legend", { className: "nls-field__label", children: "Or Select from Email Settings:" }),
                      e.jsxs("div", {
                        className: "nls-card nls-card--soft nls-recipient-box",
                        children: [
                          e.jsx("p", { className: "nls-eyebrow", children: p }),
                          e.jsx("div", {
                            className: "nls-recipient-list",
                            children:
                              I.length === 0
                                ? e.jsx("p", {
                                    className: "nls-muted nls-text-sm",
                                    children: "No saved email recipients yet. Save Emails settings first.",
                                  })
                                : I.map((ie) =>
                                    e.jsxs(
                                      "label",
                                      {
                                        className: "nls-check",
                                        children: [
                                          e.jsx("input", {
                                            type: "checkbox",
                                            checked: !!w[ie],
                                            onChange: (O) => N((te) => ({ ...te, [ie]: O.target.checked })),
                                          }),
                                          e.jsx("span", { children: ie }),
                                        ],
                                      },
                                      ie,
                                    ),
                                  ),
                          }),
                        ],
                      }),
                      e.jsxs("p", {
                        className: "nls-field__hint",
                        "aria-live": "polite",
                        children: [C, " recipients selected"],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "nls-modal__footer",
                children: [
                  e.jsx("button", {
                    type: "button",
                    onClick: o,
                    className: "nls-btn nls-btn--ghost",
                    children: "Cancel",
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: le,
                    disabled: y,
                    className: "nls-btn nls-btn--primary",
                    children: y ? "Sending…" : "Send Email",
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    : null;
}
function nlsVeToggle() {
  const [a, o] = b.useState(!1),
    [i, d] = b.useState(!1);
  b.useEffect(() => {
    var u;
    try {
      o(((u = window == null ? void 0 : window.localStorage) == null ? void 0 : u.getItem("nexus_ls_ve")) === "1");
    } catch {}
  }, []);
  const p = async () => {
    var h, x, f;
    if (i) return;
    d(!0);
    const u = !a;
    o(u);
    try {
      (h = window == null ? void 0 : window.localStorage) == null || h.setItem("nexus_ls_ve", u ? "1" : "0");
    } catch {}
    try {
      await restFetch("/nexulesuite_/v1/visual-editor/toggle", {
        method: "POST",
        body: JSON.stringify({ enabled: u }),
      });
    } catch {
      o(!u);
      try {
        (x = window == null ? void 0 : window.localStorage) == null || x.setItem("nexus_ls_ve", u ? "0" : "1");
      } catch {}
    } finally {
      d(!1);
    }
  };
  return e.jsxs("button", {
    type: "button",
    onClick: p,
    disabled: i,
    role: "switch",
    "aria-checked": a ? "true" : "false",
    title: a ? "Visual Editor is active on the site" : "Activate Visual Editor",
    className: ["nls-ve-toggle", a ? "is-on" : ""].filter(Boolean).join(" "),
    children: [
      e.jsx("span", { className: "nls-ve-toggle__label", children: "Visual Editor" }),
      e.jsx("span", {
        className: ["nls-switch nls-switch--sm", a ? "is-on" : ""].filter(Boolean).join(" "),
        "aria-hidden": "true",
      }),
    ],
  });
}
export function ActivitiesPage() {
  const [a, o] = b.useState("all"),
    [i, d] = b.useState(""),
    [u, p] = b.useState(""),
    [h, x] = b.useState(""),
    [f, S] = b.useState(""),
    [y, P] = b.useState([]),
    [M, T] = b.useState(!0),
    [F, V] = b.useState(""),
    [z, U] = b.useState(!1),
    [w, N] = b.useState(!1),
    [H, W] = b.useState(!1),
    [I, C] = b.useState(!0),
    [J, j] = b.useState({ open: !1, variant: "success", title: "", message: "" }),
    nlsSearchId = b.useId(),
    nlsFromId = b.useId(),
    nlsToId = b.useId(),
    nlsLogBodyId = b.useId(),
    nlsChatPanelId = b.useId();
  (b.useEffect(() => {
    const O = setTimeout(() => p(i.trim()), 400);
    return () => clearTimeout(O);
  }, [i]),
    b.useEffect(() => {
      let O = !1;
      return (
        (async () => {
          var te;
          (T(!0), V(""));
          try {
            const { restUrl: pe, nonce: me } = getAdminConfigWithTitle(),
              B = new URLSearchParams({ tab: a, dateFrom: h, dateTo: f, search: u }),
              ee = await fetch(`${pe}nexulesuite_/v1/reports/activities/list?${B}`, {
                headers: { "X-WP-Nonce": me },
                credentials: "same-origin",
              }),
              _ = await ee.json().catch(() => ({}));
            if (O) return;
            if (!ee.ok || !(_ != null && _.success)) {
              P([]);
              const X =
                typeof (_ == null ? void 0 : _.message) == "string"
                  ? _.message
                  : (_ == null ? void 0 : _.code) || "Could not load activities.";
              V(X);
              return;
            }
            P(Array.isArray((te = _ == null ? void 0 : _.data) == null ? void 0 : te.rows) ? _.data.rows : []);
          } catch {
            O || (P([]), V("Could not load activities."));
          } finally {
            O || T(!1);
          }
        })(),
        () => {
          O = !0;
        }
      );
    }, [a, h, f, u]));
  const le = async () => {
      if (!(z || !window.confirm("Clear all activities? This cannot be undone."))) {
        U(!0);
        try {
          const { restUrl: O, nonce: te } = getAdminConfigWithTitle(),
            pe = await fetch(`${O}nexulesuite_/v1/reports/activities/clear`, {
              method: "POST",
              headers: { "X-WP-Nonce": te },
              credentials: "same-origin",
            }),
            me = await pe.json().catch(() => ({}));
          if (!pe.ok || !(me != null && me.success)) {
            const B =
              typeof (me == null ? void 0 : me.message) == "string"
                ? me.message
                : (me == null ? void 0 : me.code) || "Could not clear activities.";
            j({ open: !0, variant: "error", title: "Error!", message: B });
            return;
          }
          (P([]), j({ open: !0, variant: "success", title: "Success!", message: "All activities have been cleared." }));
        } catch {
          j({ open: !0, variant: "error", title: "Error!", message: "Could not clear activities." });
        } finally {
          U(!1);
        }
      }
    },
    ie = () => {
      (x(""), S(""), d(""), p(""), o("all"));
    };
  return e.jsxs(PageFrame, {
    title: "Activities",
    subtitle: "Unified log: forms, calls, interactions and triggers",
    icon: e.jsx(vi, { size: 20 }),
    footer: e.jsx(StickyFooter, {}),
    headerRight: e.jsxs(e.Fragment, {
      children: [
        e.jsx(nlsVeToggle, {}),
        e.jsxs("div", {
          className: "nls-input-icon nexulesuite_act-search",
          children: [
            e.jsx(Yn, { "aria-hidden": "true" }),
            e.jsx("label", { htmlFor: nlsSearchId, className: "sr-only", children: "Search activities" }),
            e.jsx("input", {
              id: nlsSearchId,
              type: "search",
              value: i,
              onChange: (O) => d(O.target.value),
              placeholder: "Search...",
              className: "nexulesuite_act-search-input",
            }),
          ],
        }),
      ],
    }),
    children: [
      e.jsx(ResultModal, {
        open: J.open,
        variant: J.variant,
        title: J.title,
        message: J.message,
        onDismiss: () => j((O) => ({ ...O, open: !1 })),
      }),
      e.jsx(ActivitiesReportModal, {
        open: w,
        onClose: () => N(!1),
        filters: { tab: a, fromDate: h, toDate: f, search: i },
      }),
      e.jsxs("div", {
        className: "nls-stack",
        children: [
          e.jsxs("div", {
            className: "nls-card",
            children: [
              e.jsxs("button", {
                type: "button",
                onClick: () => W((O) => !O),
                "aria-expanded": H,
                "aria-controls": nlsChatPanelId,
                className: "nls-accordion__trigger",
                children: [
                  e.jsx("span", {
                    className: "nls-section__ico",
                    "aria-hidden": "true",
                    children: e.jsx(Gs, { size: 16 }),
                  }),
                  e.jsxs("span", {
                    className: "nls-accordion__text",
                    children: [
                      e.jsx("span", { className: "nls-section__title", children: "Chatbot Reports" }),
                      e.jsx("span", {
                        className: "nls-section__desc",
                        children: "Conversations, messages, intents & sentiment from the AI assistant",
                      }),
                    ],
                  }),
                  e.jsx(Qs, {
                    size: 18,
                    "aria-hidden": "true",
                    className: `nls-accordion__chevron${H ? " is-open" : ""}`,
                  }),
                ],
              }),
              H
                ? e.jsx("div", {
                    id: nlsChatPanelId,
                    className: "nls-accordion__panel",
                    children: e.jsx(AiLogsPanel, {}),
                  })
                : null,
            ],
          }),
          e.jsxs("div", {
            className: "nls-card nexulesuite_activities-wrap",
            children: [
              e.jsxs("div", {
                className: "nls-accordion__trigger",
                role: "button",
                tabIndex: 0,
                "aria-expanded": I,
                "aria-controls": nlsLogBodyId,
                onClick: () => C((O) => !O),
                onKeyDown: (O) => {
                  (O.key === "Enter" || O.key === " ") && (O.preventDefault(), C((te) => !te));
                },
                children: [
                  e.jsx("span", {
                    className: "nls-section__ico",
                    "aria-hidden": "true",
                    children: e.jsx(vi, { size: 16 }),
                  }),
                  e.jsxs("span", {
                    className: "nls-accordion__text",
                    children: [
                      e.jsx("span", { className: "nls-section__title", children: "Activity Log" }),
                      e.jsx("span", {
                        className: "nls-section__desc",
                        children: "Filter by type, date range, or keyword. Export a PDF report or share it by email.",
                      }),
                    ],
                  }),
                  e.jsx(Qs, {
                    size: 18,
                    "aria-hidden": "true",
                    className: `nls-accordion__chevron${I ? " is-open" : ""}`,
                  }),
                ],
              }),
              I &&
                e.jsxs("div", {
                  id: nlsLogBodyId,
                  className: "nls-card__body nls-stack nls-stack--tight",
                  children: [
                    e.jsxs("div", {
                      className: "nls-toolbar nexulesuite_act-toolbar",
                      children: [
                        e.jsx("div", {
                          className: "nls-pills",
                          role: "group",
                          "aria-label": "Activity type",
                          children: Qm.map((O) =>
                            e.jsx(FilterTabs, { active: a === O.id, onClick: () => o(O.id), children: O.label }, O.id),
                          ),
                        }),
                        e.jsx("span", { className: "nls-toolbar__spacer" }),
                        e.jsxs("div", {
                          className: "nls-toolbar nexulesuite_act-filters",
                          children: [
                            e.jsxs("label", {
                              className: "nls-inline-field",
                              htmlFor: nlsFromId,
                              children: [
                                e.jsx("span", { children: "From" }),
                                e.jsx("input", {
                                  id: nlsFromId,
                                  type: "date",
                                  value: h,
                                  onChange: (O) => x(O.target.value),
                                }),
                              ],
                            }),
                            e.jsxs("label", {
                              className: "nls-inline-field",
                              htmlFor: nlsToId,
                              children: [
                                e.jsx("span", { children: "To" }),
                                e.jsx("input", {
                                  id: nlsToId,
                                  type: "date",
                                  value: f,
                                  onChange: (O) => S(O.target.value),
                                }),
                              ],
                            }),
                            e.jsx("button", {
                              type: "button",
                              onClick: ie,
                              className: "nls-btn nls-btn--ghost nls-btn--sm",
                              children: "Clear",
                            }),
                            M
                              ? e.jsx("span", {
                                  className: "nls-muted nls-text-xs",
                                  role: "status",
                                  children: "Updating…",
                                })
                              : null,
                            e.jsx("span", { className: "nls-toolbar__divider", "aria-hidden": "true" }),
                            e.jsxs("button", {
                              type: "button",
                              onClick: () => N(!0),
                              className: "nls-btn nls-btn--secondary nls-btn--sm",
                              children: [
                                e.jsx(Ym, { className: "h-4 w-4" }),
                                e.jsx("span", { className: "hidden sm:inline", children: "Report PDF" }),
                                e.jsx("span", { className: "sm:hidden", children: "PDF" }),
                              ],
                            }),
                            e.jsxs("button", {
                              type: "button",
                              onClick: le,
                              disabled: z,
                              className: "nls-btn nls-btn--danger nls-btn--sm",
                              children: [
                                e.jsx(yt, { "aria-hidden": "true" }),
                                e.jsx("span", {
                                  className: "hidden sm:inline",
                                  children: z ? "Clearing…" : "Clear All",
                                }),
                                e.jsx("span", { className: "sm:hidden", children: z ? "…" : "Clear" }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsx("div", {
                      className: "nls-table-wrap nexulesuite_act-table-wrap",
                      children: e.jsxs("table", {
                        className: "nls-table nexulesuite_act-table",
                        children: [
                          e.jsx("thead", {
                            children: e.jsxs("tr", {
                              children: [
                                e.jsx("th", { scope: "col", children: "Action Name" }),
                                e.jsx("th", { scope: "col", children: "Page URL" }),
                                e.jsx("th", { scope: "col", children: "Purpose" }),
                                e.jsx("th", { scope: "col", children: "Interaction" }),
                                e.jsx("th", { scope: "col", children: "Date/Time" }),
                                e.jsx("th", {
                                  scope: "col",
                                  className: "nexulesuite_act-col-mail",
                                  children: "Mail Status",
                                }),
                                e.jsx("th", { scope: "col", children: "Reference" }),
                              ],
                            }),
                          }),
                          e.jsx("tbody", {
                            children:
                              M && y.length === 0
                                ? e.jsx("tr", {
                                    children: e.jsx("td", {
                                      colSpan: 7,
                                      className: "nls-table__empty",
                                      children: "Loading activities…",
                                    }),
                                  })
                                : e.jsxs(e.Fragment, {
                                    children: [
                                      y.map((O) => {
                                        const te = O.categoryKey || "forms",
                                          pe =
                                            te === "forms"
                                              ? "blue"
                                              : te === "calls"
                                                ? "green"
                                                : te === "consultations"
                                                  ? "purple"
                                                  : "amber",
                                          me = tx(O),
                                          B = me == null ? "slate" : me === !0 || me === 1 ? "green" : "red";
                                        return e.jsxs(
                                          "tr",
                                          {
                                            children: [
                                              e.jsx("td", { className: "is-strong", children: O.actionName }),
                                              e.jsx("td", {
                                                children: O.pageUrl
                                                  ? e.jsxs("a", {
                                                      href: O.pageUrl,
                                                      target: "_blank",
                                                      rel: "noopener noreferrer",
                                                      className: "nls-link nexulesuite_act-link",
                                                      children: [
                                                        e.jsx("span", { className: "truncate", children: O.pageUrl }),
                                                        e.jsx("span", {
                                                          className: "nexulesuite_act-link-ico",
                                                          "aria-hidden": "true",
                                                          children: "↗",
                                                        }),
                                                      ],
                                                    })
                                                  : e.jsx("span", { className: "nls-muted", children: "—" }),
                                              }),
                                              e.jsx("td", { children: e.jsx(wd, { tone: pe, children: O.category }) }),
                                              e.jsx("td", { children: O.context }),
                                              e.jsx("td", { className: "nls-nowrap", children: O.dateTime }),
                                              e.jsx("td", {
                                                className: "nexulesuite_act-col-mail",
                                                children: e.jsx(wd, { tone: B, children: sx(O) }),
                                              }),
                                              e.jsx("td", { className: "nls-mono is-muted", children: O.id }),
                                            ],
                                          },
                                          O.id,
                                        );
                                      }),
                                      !M && y.length === 0
                                        ? e.jsx("tr", {
                                            children: e.jsx("td", {
                                              colSpan: 7,
                                              className: "nls-table__empty",
                                              children: F || "No activities found.",
                                            }),
                                          })
                                        : null,
                                    ],
                                  }),
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
            ],
          }),
        ],
      }),
    ],
  });
}
