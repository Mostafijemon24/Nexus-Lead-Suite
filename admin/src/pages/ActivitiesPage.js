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
import { ICON_OPTIONS, PageFrame, ResultModal, StickyFooter, getAdminConfig, jn, restFetch } from "../shared/common.js";

function StatCard({ icon: a, label: o, value: i, tone: d = "blue" }) {
  const u = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return e.jsxs("div", {
    className: "flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
    children: [
      e.jsx("div", {
        className: `flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${u[d] || u.blue}`,
        children: a,
      }),
      e.jsxs("div", {
        className: "min-w-0",
        children: [
          e.jsx("div", {
            className: "text-2xl font-bold leading-none text-slate-900",
            children: i,
          }),
          e.jsx("div", {
            className: "mt-1 truncate text-xs font-medium uppercase tracking-wide text-slate-400",
            children: o,
          }),
        ],
      }),
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
    H = b.useCallback(async () => {
      d(!0);
      try {
        const C = new URLSearchParams();
        (y && C.set("dateFrom", y), M && C.set("dateTo", M), F && C.set("search", F));
        const j = await (
          await fetch(`${a}${jn}/ai/logs?${C}`, {
            headers: {
              "X-WP-Nonce": o,
            },
          })
        ).json();
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
      (U({
        sessionId: C,
        transcript: null,
      }),
        N(!0));
      try {
        const j = await (
          await fetch(`${a}${jn}/ai/logs/detail?session=${encodeURIComponent(C)}`, {
            headers: {
              "X-WP-Nonce": o,
            },
          })
        ).json();
        j &&
          j.success &&
          U({
            sessionId: C,
            transcript: j.data.transcript || [],
          });
      } catch {
        U({
          sessionId: C,
          transcript: [],
        });
      } finally {
        N(!1);
      }
    },
    I = async () => {
      if (window.confirm("Permanently delete ALL stored chat transcripts? This cannot be undone."))
        try {
          (await fetch(`${a}${jn}/ai/logs/clear`, {
            method: "POST",
            headers: {
              "X-WP-Nonce": o,
            },
          }),
            U(null),
            H());
        } catch {}
    };
  return e.jsxs("div", {
    className: "space-y-5",
    children: [
      !h &&
        e.jsxs("div", {
          className: "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800",
          children: [
            "Transcript storage is ",
            e.jsx("b", {
              children: "off",
            }),
            ". Turn on ",
            e.jsx("b", {
              children: "“Store chat transcripts”",
            }),
            " in Settings → AI Chatbot → FAQ & Buttons to start collecting conversations here. Existing rows still display below.",
          ],
        }),
      e.jsxs("div", {
        className: "grid grid-cols-2 gap-3 lg:grid-cols-5",
        children: [
          e.jsx(StatCard, {
            tone: "blue",
            icon: e.jsx(Da, {
              className: "h-5 w-5",
            }),
            label: "Conversations",
            value: u ? u.conversations : "—",
          }),
          e.jsx(StatCard, {
            tone: "green",
            icon: e.jsx(Xn, {
              className: "h-5 w-5",
            }),
            label: "Messages",
            value: u ? u.messages : "—",
          }),
          e.jsx(StatCard, {
            tone: "purple",
            icon: e.jsx(Qc, {
              className: "h-5 w-5",
            }),
            label: "Today",
            value: u ? u.today : "—",
          }),
          e.jsx(StatCard, {
            tone: "amber",
            icon: e.jsx(Qc, {
              className: "h-5 w-5",
            }),
            label: "Last 7 days",
            value: u ? u.last7 : "—",
          }),
          e.jsx(StatCard, {
            tone: "slate",
            icon: e.jsx(Hl, {
              className: "h-5 w-5",
            }),
            label: "With images",
            value: u ? u.withImages : "—",
          }),
        ],
      }),
      u && ((u.intents && u.intents.length) || (u.sentiments && Object.keys(u.sentiments).length))
        ? e.jsxs("div", {
            className: "grid gap-4 md:grid-cols-2",
            children: [
              e.jsxs("div", {
                className: "rounded-2xl border border-slate-200 bg-white p-4",
                children: [
                  e.jsx("div", {
                    className: "mb-3 text-xs font-bold uppercase tracking-wide text-slate-400",
                    children: "Top intents",
                  }),
                  e.jsxs("div", {
                    className: "space-y-2",
                    children: [
                      (u.intents || []).map((C) => {
                        const J = Math.max(...u.intents.map((j) => j.count), 1);
                        return e.jsxs(
                          "div",
                          {
                            className: "flex items-center gap-3",
                            children: [
                              e.jsx("span", {
                                className: "w-24 shrink-0 truncate text-sm capitalize text-slate-600",
                                children: C.label,
                              }),
                              e.jsx("span", {
                                className: "h-2 flex-1 overflow-hidden rounded-full bg-slate-100",
                                children: e.jsx("span", {
                                  className: "block h-full rounded-full bg-blue-500",
                                  style: {
                                    width: `${Math.round((C.count / J) * 100)}%`,
                                  },
                                }),
                              }),
                              e.jsx("span", {
                                className: "w-8 shrink-0 text-right text-sm font-semibold text-slate-700",
                                children: C.count,
                              }),
                            ],
                          },
                          C.label,
                        );
                      }),
                      (u.intents || []).length
                        ? null
                        : e.jsx("div", {
                            className: "text-sm text-slate-400",
                            children: "No data yet.",
                          }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "rounded-2xl border border-slate-200 bg-white p-4",
                children: [
                  e.jsx("div", {
                    className: "mb-3 text-xs font-bold uppercase tracking-wide text-slate-400",
                    children: "Sentiment",
                  }),
                  e.jsx("div", {
                    className: "flex flex-wrap gap-2",
                    children: ["positive", "neutral", "negative", "urgent"].map((C) => {
                      const J = {
                          positive: "bg-emerald-50 text-emerald-700",
                          neutral: "bg-slate-100 text-slate-600",
                          negative: "bg-red-50 text-red-700",
                          urgent: "bg-amber-50 text-amber-700",
                        },
                        j = (u.sentiments && u.sentiments[C]) || 0;
                      return e.jsxs(
                        "span",
                        {
                          className: `rounded-xl px-3 py-2 text-sm font-semibold capitalize ${J[C]}`,
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
        className: "flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4",
        children: [
          e.jsxs("label", {
            className: "flex flex-col gap-1 text-xs font-medium text-slate-500",
            children: [
              "From",
              e.jsx("input", {
                type: "date",
                value: y,
                onChange: (C) => P(C.target.value),
                className: "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800",
              }),
            ],
          }),
          e.jsxs("label", {
            className: "flex flex-col gap-1 text-xs font-medium text-slate-500",
            children: [
              "To",
              e.jsx("input", {
                type: "date",
                value: M,
                onChange: (C) => T(C.target.value),
                className: "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800",
              }),
            ],
          }),
          e.jsxs("label", {
            className: "flex flex-1 flex-col gap-1 text-xs font-medium text-slate-500",
            children: [
              "Search",
              e.jsxs("span", {
                className: "relative",
                children: [
                  e.jsx(Yn, {
                    className: "pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",
                  }),
                  e.jsx("input", {
                    type: "text",
                    value: F,
                    onChange: (C) => V(C.target.value),
                    onKeyDown: (C) => C.key === "Enter" && H(),
                    placeholder: "Message text…",
                    className: "w-full rounded-lg border border-slate-300 py-2 pr-3 text-sm text-slate-800",
                    style: {
                      paddingLeft: "2.25rem",
                    },
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("button", {
            type: "button",
            onClick: H,
            className:
              "inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700",
            children: [
              e.jsx(ad, {
                className: "h-4 w-4",
              }),
              " Apply",
            ],
          }),
          e.jsxs("button", {
            type: "button",
            onClick: I,
            className:
              "inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100",
            children: [
              e.jsx(yt, {
                className: "h-4 w-4",
              }),
              " Clear all",
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "grid gap-4 lg:grid-cols-2",
        children: [
          e.jsxs("div", {
            className: "rounded-2xl border border-slate-200 bg-white",
            children: [
              e.jsxs("div", {
                className: "border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700",
                children: ["Conversations ", f.length ? `(${f.length})` : ""],
              }),
              e.jsx("div", {
                className: "max-h-[46vh] overflow-y-auto",
                children: i
                  ? e.jsx("div", {
                      className: "p-6 text-center text-sm text-slate-400",
                      children: "Loading…",
                    })
                  : f.length === 0
                    ? e.jsx("div", {
                        className: "p-6 text-center text-sm text-slate-400",
                        children: "No conversations yet.",
                      })
                    : f.map((C) =>
                        e.jsxs(
                          "button",
                          {
                            type: "button",
                            onClick: () => W(C.sessionId),
                            className: `flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50 ${z && z.sessionId === C.sessionId ? "bg-blue-50/60" : ""}`,
                            children: [
                              e.jsxs("div", {
                                className: "min-w-0 flex-1",
                                children: [
                                  e.jsx("div", {
                                    className: "truncate text-sm font-medium text-slate-800",
                                    children: C.firstQuestion || "(image / no text)",
                                  }),
                                  e.jsxs("div", {
                                    className: "mt-0.5 flex items-center gap-2 text-xs text-slate-400",
                                    children: [
                                      e.jsx("span", {
                                        children: jd(C.lastAt),
                                      }),
                                      e.jsx("span", {
                                        children: "·",
                                      }),
                                      e.jsxs("span", {
                                        children: [C.messageCount, " msg", C.messageCount === 1 ? "" : "s"],
                                      }),
                                      C.imageCount > 0
                                        ? e.jsxs("span", {
                                            children: ["· 📎 ", C.imageCount],
                                          })
                                        : null,
                                    ],
                                  }),
                                ],
                              }),
                              e.jsx(Xc, {
                                className: "h-4 w-4 shrink-0 text-slate-300",
                              }),
                            ],
                          },
                          C.sessionId,
                        ),
                      ),
              }),
            ],
          }),
          e.jsxs("div", {
            className: "rounded-2xl border border-slate-200 bg-white",
            children: [
              e.jsxs("div", {
                className:
                  "flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700",
                children: [
                  e.jsx("span", {
                    children: "Transcript",
                  }),
                  z
                    ? e.jsx("button", {
                        type: "button",
                        onClick: () => U(null),
                        className: "text-slate-400 hover:text-slate-600",
                        children: e.jsx(_t, {
                          className: "h-4 w-4",
                        }),
                      })
                    : null,
                ],
              }),
              e.jsx("div", {
                className: "max-h-[46vh] overflow-y-auto p-4",
                children: z
                  ? w
                    ? e.jsx("div", {
                        className: "p-6 text-center text-sm text-slate-400",
                        children: "Loading…",
                      })
                    : !z.transcript || z.transcript.length === 0
                      ? e.jsx("div", {
                          className: "p-6 text-center text-sm text-slate-400",
                          children: "Empty transcript.",
                        })
                      : e.jsx("div", {
                          className: "space-y-4",
                          children: z.transcript.map((C, J) =>
                            e.jsxs(
                              "div",
                              {
                                className: "space-y-2",
                                children: [
                                  e.jsx("div", {
                                    className: "flex justify-end",
                                    children: e.jsx("div", {
                                      className:
                                        "max-w-[85%] rounded-2xl rounded-br-sm bg-blue-600 px-3 py-2 text-sm text-white",
                                      children: C.question || (C.hasImage ? "🖼️ (image attached)" : "—"),
                                    }),
                                  }),
                                  e.jsx("div", {
                                    className: "flex justify-start",
                                    children: e.jsxs("div", {
                                      className:
                                        "max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2 text-sm text-slate-800 whitespace-pre-wrap",
                                      children: [
                                        C.answer,
                                        C.sources && C.sources.length
                                          ? e.jsx("div", {
                                              className: "mt-2 flex flex-wrap gap-1.5",
                                              children: C.sources.map((j, le) =>
                                                e.jsx(
                                                  "a",
                                                  {
                                                    href: j.url,
                                                    target: "_blank",
                                                    rel: "noopener noreferrer",
                                                    className:
                                                      "rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] text-blue-600 hover:border-blue-400",
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
                                  e.jsx("div", {
                                    className: "text-center text-[11px] text-slate-300",
                                    children: jd(C.createdAt),
                                  }),
                                ],
                              },
                              J,
                            ),
                          ),
                        })
                  : e.jsx("div", {
                      className: "p-6 text-center text-sm text-slate-400",
                      children: "Select a conversation to read it.",
                    }),
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
    className: `nexulesuite_act-tab${a ? " is-active" : ""}`,
    children: o,
  });
}
function wd({ tone: a, children: o }) {
  const i = {
    blue: "is-blue",
    green: "is-green",
    purple: "is-purple",
    amber: "is-amber",
    red: "is-red",
    slate: "is-slate",
  };
  return e.jsx("span", {
    className: `nexulesuite_act-badge ${i[a] || i.slate}`,
    children: o,
  });
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
    [H, W] = b.useState({
      open: !1,
      variant: "success",
      title: "",
      message: "",
    });
  (b.useEffect(() => {
    if (!a) return;
    const ie = new AbortController();
    return (
      (async () => {
        var O;
        try {
          const pe = await (
              await fetch(`${d}nexulesuite_/v1/emails/templates`, {
                headers: {
                  "X-WP-Nonce": u,
                },
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
  }, [a, d, u]),
    b.useEffect(() => {
      if (!a) return;
      const ie = (O) => {
        O.key === "Escape" && o();
      };
      return (window.addEventListener("keydown", ie), () => window.removeEventListener("keydown", ie));
    }, [a, o]));
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
              headers: {
                "Content-Type": "application/json",
                "X-WP-Nonce": u,
              },
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
            W({
              open: !0,
              variant: "error",
              title: "Error!",
              message: "Failed to generate PDF.",
            });
            return;
          }
          window.open(pe, "_blank", "noopener,noreferrer");
        } catch {
          W({
            open: !0,
            variant: "error",
            title: "Error!",
            message: "Failed to generate PDF.",
          });
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
        W({
          open: !0,
          variant: "error",
          title: "Error!",
          message: "Please select or enter at least one recipient.",
        });
        return;
      }
      P(!0);
      try {
        const me = await fetch(`${d}nexulesuite_/v1/reports/activities/email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-WP-Nonce": u,
            },
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
        W({
          open: !0,
          variant: "success",
          title: "Success!",
          message: "Email sent successfully.",
        });
      } catch {
        W({
          open: !0,
          variant: "error",
          title: "Error!",
          message: "Failed to send email.",
        });
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
            onDismiss: () =>
              W((ie) => ({
                ...ie,
                open: !1,
              })),
          }),
          e.jsxs("div", {
            className: "nexulesuite_act-modal",
            children: [
              e.jsx("button", {
                type: "button",
                className: "nexulesuite_act-modal-backdrop",
                "aria-label": "Close modal",
                onClick: o,
              }),
              e.jsxs("div", {
                className: "nexulesuite_act-modal-panel",
                role: "dialog",
                "aria-modal": "true",
                "aria-labelledby": "nexulesuite_act-report-title",
                children: [
                  e.jsxs("div", {
                    className: "nexulesuite_act-modal-head",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("h2", {
                            id: "nexulesuite_act-report-title",
                            className: "nexulesuite_act-modal-title",
                            children: "Activities Report",
                          }),
                          e.jsx("p", {
                            className: "nexulesuite_act-modal-date",
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
                        className: "nexulesuite_act-modal-close",
                        "aria-label": "Close",
                        children: e.jsx(_t, {
                          className: "h-5 w-5",
                        }),
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "nexulesuite_act-modal-body",
                    children: [
                      e.jsx("h3", {
                        className: "nexulesuite_act-modal-subtitle",
                        children: "Include in report",
                      }),
                      e.jsx("div", {
                        className: "nexulesuite_act-sections",
                        children: Xm.map((ie) =>
                          e.jsxs(
                            "label",
                            {
                              className: "nexulesuite_act-section",
                              children: [
                                e.jsx("input", {
                                  type: "checkbox",
                                  checked: f.includes(ie.id),
                                  onChange: () => J(ie.id),
                                }),
                                e.jsx("span", {
                                  children: ie.label,
                                }),
                              ],
                            },
                            ie.id,
                          ),
                        ),
                      }),
                      e.jsx("button", {
                        type: "button",
                        onClick: j,
                        disabled: h || f.length === 0,
                        className: "nexulesuite_act-btn-primary nexulesuite_act-btn-primary--block",
                        children: h ? "Generating…" : "Preview PDF Report",
                      }),
                      e.jsx("div", {
                        className: "nexulesuite_act-modal-divider",
                      }),
                      e.jsx("h3", {
                        className: "nexulesuite_act-modal-subtitle",
                        children: "Share via Email",
                      }),
                      e.jsxs("div", {
                        className: "nexulesuite_act-modal-fields",
                        children: [
                          e.jsxs("div", {
                            children: [
                              e.jsx("label", {
                                className: "nexulesuite_act-field-label",
                                htmlFor: "nexulesuite_act-custom-message",
                                children: "Custom Message (Optional)",
                              }),
                              e.jsx("textarea", {
                                id: "nexulesuite_act-custom-message",
                                value: F,
                                onChange: (ie) => V(ie.target.value),
                                rows: 3,
                                placeholder: "Add a personal message to include in the email...",
                                className: "nexulesuite_act-textarea",
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            children: [
                              e.jsx("label", {
                                className: "nexulesuite_act-field-label",
                                htmlFor: "nexulesuite_act-custom-emails",
                                children: "Custom Email Addresses",
                              }),
                              e.jsx("input", {
                                id: "nexulesuite_act-custom-emails",
                                value: z,
                                onChange: (ie) => U(ie.target.value),
                                placeholder: "Enter email addresses separated by commas",
                                className: "nexulesuite_act-input",
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            children: [
                              e.jsx("p", {
                                className: "nexulesuite_act-field-label",
                                children: "Or Select from Email Settings:",
                              }),
                              e.jsxs("div", {
                                className: "nexulesuite_act-recipient-box",
                                children: [
                                  e.jsx("p", {
                                    className: "nexulesuite_act-recipient-site",
                                    children: p,
                                  }),
                                  e.jsx("div", {
                                    className: "nexulesuite_act-recipient-list",
                                    children:
                                      I.length === 0
                                        ? e.jsx("p", {
                                            className: "nexulesuite_act-recipient-empty",
                                            children: "No saved email recipients yet. Save Emails settings first.",
                                          })
                                        : I.map((ie) =>
                                            e.jsxs(
                                              "label",
                                              {
                                                className: "nexulesuite_act-recipient-item",
                                                children: [
                                                  e.jsx("input", {
                                                    type: "checkbox",
                                                    checked: !!w[ie],
                                                    onChange: (O) =>
                                                      N((te) => ({
                                                        ...te,
                                                        [ie]: O.target.checked,
                                                      })),
                                                  }),
                                                  ie,
                                                ],
                                              },
                                              ie,
                                            ),
                                          ),
                                  }),
                                ],
                              }),
                              e.jsxs("p", {
                                className: "nexulesuite_act-recipient-count",
                                children: [C, " recipients selected"],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "nexulesuite_act-modal-foot",
                    children: [
                      e.jsx("button", {
                        type: "button",
                        onClick: o,
                        className: "nexulesuite_act-btn-secondary",
                        children: "Cancel",
                      }),
                      e.jsx("button", {
                        type: "button",
                        onClick: le,
                        disabled: y,
                        className: "nexulesuite_act-btn-primary",
                        children: y ? "Sending…" : "Send Email",
                      }),
                    ],
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
        body: JSON.stringify({
          enabled: u,
        }),
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
    className: [
      "h-9 inline-flex items-center gap-2 rounded-xl border px-3 transition focus:outline-none focus:ring-2 focus:ring-violet-200",
      a ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50",
      i ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
    ].join(" "),
    children: [
      e.jsxs("span", {
        className: "flex items-center gap-2",
        children: [
          e.jsx("span", {
            className: ["h-2 w-2 rounded-full", a ? "bg-emerald-500" : "bg-slate-300"].join(" "),
            "aria-hidden": "true",
          }),
          e.jsx("span", {
            className: "text-xs font-extrabold text-slate-700 leading-none",
            children: "Visual Editor",
          }),
        ],
      }),
      e.jsx("span", {
        className: [
          "relative inline-flex shrink-0 rounded-full transition-colors",
          a ? "bg-emerald-500" : "bg-slate-300",
        ].join(" "),
        "aria-hidden": "true",
        style: {
          width: 36,
          height: 20,
        },
        children: e.jsx("span", {
          className: "absolute rounded-full bg-white shadow transition-all",
          style: {
            top: 2,
            left: a ? 16 : 2,
            width: 16,
            height: 16,
          },
        }),
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
    [J, j] = b.useState({
      open: !1,
      variant: "success",
      title: "",
      message: "",
    });
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
              B = new URLSearchParams({
                tab: a,
                dateFrom: h,
                dateTo: f,
                search: u,
              }),
              ee = await fetch(`${pe}nexulesuite_/v1/reports/activities/list?${B}`, {
                headers: {
                  "X-WP-Nonce": me,
                },
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
              headers: {
                "X-WP-Nonce": te,
              },
              credentials: "same-origin",
            }),
            me = await pe.json().catch(() => ({}));
          if (!pe.ok || !(me != null && me.success)) {
            const B =
              typeof (me == null ? void 0 : me.message) == "string"
                ? me.message
                : (me == null ? void 0 : me.code) || "Could not clear activities.";
            j({
              open: !0,
              variant: "error",
              title: "Error!",
              message: B,
            });
            return;
          }
          (P([]),
            j({
              open: !0,
              variant: "success",
              title: "Success!",
              message: "All activities have been cleared.",
            }));
        } catch {
          j({
            open: !0,
            variant: "error",
            title: "Error!",
            message: "Could not clear activities.",
          });
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
    icon: e.jsx(vi, {
      size: 18,
    }),
    footer: e.jsx(StickyFooter, {}),
    headerRight: e.jsxs("div", {
      className: "flex items-center gap-2",
      children: [
        e.jsx(nlsVeToggle, {}),
        e.jsxs("div", {
          className: "nexulesuite_act-search",
          children: [
            e.jsx("input", {
              value: i,
              onChange: (O) => d(O.target.value),
              placeholder: "Search...",
              className: "nexulesuite_act-search-input",
            }),
            e.jsx("span", {
              className: "nexulesuite_act-search-ico",
              "aria-hidden": "true",
              children: e.jsx(Yn, {
                size: 16,
              }),
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
        onDismiss: () =>
          j((O) => ({
            ...O,
            open: !1,
          })),
      }),
      e.jsx(ActivitiesReportModal, {
        open: w,
        onClose: () => N(!1),
        filters: {
          tab: a,
          fromDate: h,
          toDate: f,
          search: i,
        },
      }),
      e.jsxs("div", {
        className: "relative z-[1] mb-14 overflow-hidden rounded-2xl border border-slate-200 bg-white",
        children: [
          e.jsxs("button", {
            type: "button",
            onClick: () => W((O) => !O),
            "aria-expanded": H,
            className:
              "flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50",
            children: [
              e.jsxs("span", {
                className: "flex items-center gap-3",
                children: [
                  e.jsx("span", {
                    className: "flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600",
                    children: e.jsx(Gs, {
                      size: 18,
                    }),
                  }),
                  e.jsxs("span", {
                    className: "flex flex-col",
                    children: [
                      e.jsx("span", {
                        className: "text-sm font-bold text-slate-800",
                        children: "Chatbot Reports",
                      }),
                      e.jsx("span", {
                        className: "text-xs text-slate-500",
                        children: "Conversations, messages, intents & sentiment from the AI assistant",
                      }),
                    ],
                  }),
                ],
              }),
              e.jsx(Qs, {
                size: 18,
                className: `shrink-0 text-slate-400 transition-transform ${H ? "rotate-180" : ""}`,
              }),
            ],
          }),
          H
            ? e.jsx("div", {
                className: "border-t border-slate-200 bg-slate-50/60 p-4 md:p-5",
                children: e.jsx(AiLogsPanel, {}),
              })
            : null,
        ],
      }),
      e.jsx("div", {
        className: "nexulesuite_activities-wrap",
        children: e.jsxs("div", {
          className: "nexulesuite_act-card",
          children: [
            e.jsxs("section", {
              className: "nexulesuite_act-section is-first",
              children: [
                e.jsxs("div", {
                  className: "nexulesuite_act-sec-head",
                  role: "button",
                  tabIndex: 0,
                  style: {
                    cursor: "pointer",
                  },
                  onClick: () => C((O) => !O),
                  onKeyDown: (O) => {
                    (O.key === "Enter" || O.key === " ") && (O.preventDefault(), C((te) => !te));
                  },
                  children: [
                    e.jsx("span", {
                      className: "nexulesuite_act-sec-ico",
                      "aria-hidden": "true",
                      children: e.jsx(vi, {
                        size: 16,
                      }),
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("span", {
                          className: "nexulesuite_act-sec-title",
                          children: "Activity Log",
                        }),
                        e.jsx("p", {
                          className: "nexulesuite_act-sec-desc",
                          children: "Filter by type, date range, or keyword. Export a PDF report or share it by email.",
                        }),
                      ],
                    }),
                    e.jsx(Qs, {
                      size: 18,
                      className: "ml-auto shrink-0 text-slate-400 transition-transform " + (I ? "rotate-180" : ""),
                      style: {
                        marginTop: "2px",
                      },
                    }),
                  ],
                }),
                I &&
                  e.jsxs("div", {
                    className: "nexulesuite_act-toolbar",
                    children: [
                      e.jsx("div", {
                        className: "nexulesuite_act-tabs",
                        children: Qm.map((O) =>
                          e.jsx(
                            FilterTabs,
                            {
                              active: a === O.id,
                              onClick: () => o(O.id),
                              children: O.label,
                            },
                            O.id,
                          ),
                        ),
                      }),
                      e.jsxs("div", {
                        className: "nexulesuite_act-filters",
                        children: [
                          e.jsxs("label", {
                            className: "nexulesuite_act-date",
                            children: [
                              e.jsx("span", {
                                children: "From:",
                              }),
                              e.jsx("input", {
                                type: "date",
                                value: h,
                                onChange: (O) => x(O.target.value),
                              }),
                            ],
                          }),
                          e.jsxs("label", {
                            className: "nexulesuite_act-date",
                            children: [
                              e.jsx("span", {
                                children: "To:",
                              }),
                              e.jsx("input", {
                                type: "date",
                                value: f,
                                onChange: (O) => S(O.target.value),
                              }),
                            ],
                          }),
                          e.jsx("button", {
                            type: "button",
                            onClick: ie,
                            className: "nexulesuite_act-btn-ghost",
                            children: "Clear",
                          }),
                          M
                            ? e.jsx("span", {
                                className: "nexulesuite_act-updating",
                                children: "Updating…",
                              })
                            : null,
                          e.jsx("span", {
                            className: "nexulesuite_act-filter-divider",
                            "aria-hidden": "true",
                          }),
                          e.jsxs("button", {
                            type: "button",
                            onClick: () => N(!0),
                            className: "nexulesuite_act-btn-pdf",
                            children: [
                              e.jsx(Ym, {
                                className: "h-3.5 w-3.5",
                              }),
                              e.jsx("span", {
                                className: "hidden sm:inline",
                                children: "Report PDF",
                              }),
                              e.jsx("span", {
                                className: "sm:hidden",
                                children: "PDF",
                              }),
                            ],
                          }),
                          e.jsxs("button", {
                            type: "button",
                            onClick: le,
                            disabled: z,
                            className: "nexulesuite_act-btn-danger",
                            children: [
                              e.jsx(yt, {
                                className: "h-3.5 w-3.5",
                              }),
                              e.jsx("span", {
                                className: "hidden sm:inline",
                                children: z ? "Clearing…" : "Clear All",
                              }),
                              e.jsx("span", {
                                className: "sm:hidden",
                                children: z ? "…" : "Clear",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
              ],
            }),
            I &&
              e.jsx("section", {
                className: "nexulesuite_act-section",
                children: e.jsx("div", {
                  className: "nexulesuite_act-table-wrap",
                  children: e.jsxs("table", {
                    className: "nexulesuite_act-table",
                    children: [
                      e.jsx("thead", {
                        children: e.jsxs("tr", {
                          children: [
                            e.jsx("th", {
                              children: "Action Name",
                            }),
                            e.jsx("th", {
                              children: "Page URL",
                            }),
                            e.jsx("th", {
                              children: "Purpose",
                            }),
                            e.jsx("th", {
                              children: "Interaction",
                            }),
                            e.jsx("th", {
                              children: "Date/Time",
                            }),
                            e.jsx("th", {
                              className: "nexulesuite_act-col-mail",
                              children: "Mail Status",
                            }),
                            e.jsx("th", {
                              children: "Reference",
                            }),
                          ],
                        }),
                      }),
                      e.jsx("tbody", {
                        children:
                          M && y.length === 0
                            ? e.jsx("tr", {
                                children: e.jsx("td", {
                                  colSpan: 7,
                                  className: "nexulesuite_act-empty",
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
                                          e.jsx("td", {
                                            className: "nexulesuite_act-cell-strong",
                                            children: O.actionName,
                                          }),
                                          e.jsx("td", {
                                            children: O.pageUrl
                                              ? e.jsxs("a", {
                                                  href: O.pageUrl,
                                                  target: "_blank",
                                                  rel: "noopener noreferrer",
                                                  className: "nexulesuite_act-link",
                                                  children: [
                                                    e.jsx("span", {
                                                      className: "truncate",
                                                      children: O.pageUrl,
                                                    }),
                                                    e.jsx("span", {
                                                      className: "nexulesuite_act-link-ico",
                                                      "aria-hidden": "true",
                                                      children: "↗",
                                                    }),
                                                  ],
                                                })
                                              : e.jsx("span", {
                                                  className: "nexulesuite_act-muted",
                                                  children: "—",
                                                }),
                                          }),
                                          e.jsx("td", {
                                            children: e.jsx(wd, {
                                              tone: pe,
                                              children: O.category,
                                            }),
                                          }),
                                          e.jsx("td", {
                                            children: O.context,
                                          }),
                                          e.jsx("td", {
                                            children: O.dateTime,
                                          }),
                                          e.jsx("td", {
                                            className: "nexulesuite_act-col-mail",
                                            children: e.jsx(wd, {
                                              tone: B,
                                              children: sx(O),
                                            }),
                                          }),
                                          e.jsx("td", {
                                            className: "nexulesuite_act-ref",
                                            children: O.id,
                                          }),
                                        ],
                                      },
                                      O.id,
                                    );
                                  }),
                                  !M && y.length === 0
                                    ? e.jsx("tr", {
                                        children: e.jsx("td", {
                                          colSpan: 7,
                                          className: "nexulesuite_act-empty",
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
              }),
          ],
        }),
      }),
    ],
  });
}
