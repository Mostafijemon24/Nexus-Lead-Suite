import * as b from "react";
import * as e from "react/jsx-runtime";
import {
  Calendar as qn,
  ClipboardList as im,
  Download as Ol,
  FileText as Xs,
  Mail as qt,
  RefreshCw as ad,
  Search as Yn,
  Trash2 as yt,
} from "lucide-react";
import { PageFrame, restFetch } from "../shared/common.js";

export function nlsFormSubmissionsPage() {
  const [items, setItems] = b.useState([]);
  const [loading, setLoading] = b.useState(!0);
  const [err, setErr] = b.useState("");
  const [q, setQ] = b.useState("");
  const [qDeb, setQDeb] = b.useState("");
  const [from, setFrom] = b.useState("");
  const [to, setTo] = b.useState("");
  const [formKey, setFormKey] = b.useState("all");
  const [mail, setMail] = b.useState("all");
  const [openId, setOpenId] = b.useState(null);
  const [selected, setSelected] = b.useState({});
  const [busy, setBusy] = b.useState(!1);
  const [menuOpen, setMenuOpen] = b.useState("");
  const nlsMenuRef = b.useRef(null);
  b.useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (ev) => {
      const el = nlsMenuRef.current;
      if (el && !el.contains(ev.target)) setMenuOpen("");
    };
    const onKey = (ev) => {
      ev.key === "Escape" && setMenuOpen("");
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);
  b.useEffect(() => {
    const t = window.setTimeout(() => setQDeb(q.trim()), 300);
    return () => window.clearTimeout(t);
  }, [q]);
  const load = b.useCallback(async () => {
    (setLoading(!0), setErr(""));
    try {
      const params = new URLSearchParams();
      qDeb && params.set("search", qDeb);
      from && params.set("from", from);
      to && params.set("to", to);
      params.set("limit", "500");
      const res = await restFetch("/nexulesuite_/v1/form-submissions?" + params.toString());
      setItems(Array.isArray(res?.data?.items) ? res.data.items : []);
    } catch (e) {
      (setErr((e && e.message) || "Could not load submissions."), setItems([]));
    } finally {
      setLoading(!1);
    }
  }, [qDeb, from, to]);
  b.useEffect(() => {
    load();
  }, [load]);
  const formOptions = b.useMemo(() => {
    const map = new Map();
    items.forEach((r) => {
      if (r.formKey) map.set(r.formKey, r.formName || r.formKey);
    });
    return Array.from(map.entries()).sort((a, c) => String(a[1]).localeCompare(String(c[1])));
  }, [items]);
  const rows = b.useMemo(
    () =>
      items.filter((r) => {
        if (formKey !== "all" && r.formKey !== formKey) return !1;
        if (mail === "sent" && r.mailSent !== !0) return !1;
        if (mail === "failed" && r.mailSent !== !1) return !1;
        if (mail === "unknown" && r.mailSent != null) return !1;
        return !0;
      }),
    [items, formKey, mail],
  );
  const stats = b.useMemo(() => {
    let sent = 0,
      failed = 0;
    const forms = new Set();
    rows.forEach((r) => {
      (r.mailSent === !0 && sent++, r.mailSent === !1 && failed++, r.formKey && forms.add(r.formKey));
    });
    return {
      total: rows.length,
      sent,
      failed,
      forms: forms.size,
    };
  }, [rows]);
  const selectedIds = b.useMemo(
    () =>
      Object.keys(selected)
        .filter((k) => selected[k])
        .map(Number),
    [selected],
  );
  const allChecked = rows.length > 0 && rows.every((r) => selected[r.id]);
  const toggleAll = () => {
    if (allChecked) {
      setSelected({});
      return;
    }
    const n = {};
    rows.forEach((r) => {
      n[r.id] = !0;
    });
    setSelected(n);
  };
  const toggleOne = (id) =>
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const headers = ["ID", "Date", "Form", "Form Key", "Page", "Email Status", "Fields"];
    const lines = [headers.join(",")];
    rows.forEach((r) => {
      const fields = (Array.isArray(r.fields) ? r.fields : []).map((f) => `${f.label}: ${f.value}`).join(" | ");
      const st = r.mailSent === !0 ? "Sent" : r.mailSent === !1 ? "Failed" : "";
      lines.push([r.id, r.submittedAt, r.formName, r.formKey, r.pageUrl, st, fields].map(esc).join(","));
    });
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    ((a.href = url),
      (a.download = "form-submissions.csv"),
      document.body.appendChild(a),
      a.click(),
      a.remove(),
      URL.revokeObjectURL(url));
  };
  const deleteIds = async (ids) => {
    if (
      !ids.length ||
      !window.confirm(ids.length > 1 ? `Delete ${ids.length} submissions?` : "Delete this submission?")
    )
      return;
    (setBusy(!0), setErr(""));
    try {
      await restFetch("/nexulesuite_/v1/form-submissions/delete", {
        method: "POST",
        body: JSON.stringify({
          ids,
        }),
      });
      (setSelected({}), setOpenId(null), await load());
    } catch (e) {
      setErr((e && e.message) || "Delete failed.");
    } finally {
      setBusy(!1);
    }
  };
  const openRow = rows.find((r) => r.id === openId) || null;
  const inp =
    "h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none ring-violet-200 focus:ring-2";
  const stat = ({ label, value, tone }) =>
    e.jsxs("div", {
      className: "rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-4 py-3 shadow-sm",
      children: [
        e.jsx("div", {
          className: "text-[11px] font-semibold uppercase tracking-wide text-slate-400",
          children: label,
        }),
        e.jsx("div", {
          className: ["mt-1 text-2xl font-bold tabular-nums", tone || "text-slate-800"].join(" "),
          children: value,
        }),
      ],
    });
  const mailBadge = (v) =>
    v === !0
      ? e.jsx("span", {
          className:
            "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100",
          children: "Sent",
        })
      : v === !1
        ? e.jsx("span", {
            className:
              "inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-100",
            children: "Failed",
          })
        : e.jsx("span", {
            className:
              "inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500",
            children: "—",
          });
  return e.jsxs(PageFrame, {
    title: "Form Submissions",
    subtitle: "Live submission report — filter, inspect, export, or clean up entries.",
    icon: e.jsx(im, {
      size: 18,
    }),
    headerRight: e.jsxs("div", {
      className: "flex flex-wrap items-center gap-2",
      children: [
        e.jsxs("button", {
          type: "button",
          disabled: loading || busy,
          onClick: () => load(),
          className:
            "inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-violet-300 hover:text-violet-700 disabled:opacity-50",
          children: [
            e.jsx(ad, {
              size: 14,
              className: loading ? "animate-spin" : "",
            }),
            "Refresh",
          ],
        }),
        e.jsxs("button", {
          type: "button",
          disabled: !rows.length,
          onClick: exportCsv,
          className:
            "inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50",
          children: [
            e.jsx(Ol, {
              size: 14,
            }),
            "Export CSV",
          ],
        }),
      ],
    }),
    children: e.jsxs("div", {
      className: "nls-submissions-report flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4 md:p-6",
      children: [
        e.jsxs("div", {
          className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
          children: [
            stat({
              label: "Total shown",
              value: stats.total,
            }),
            stat({
              label: "Email sent",
              value: stats.sent,
              tone: "text-emerald-600",
            }),
            stat({
              label: "Email failed",
              value: stats.failed,
              tone: "text-rose-600",
            }),
            stat({
              label: "Forms",
              value: stats.forms,
              tone: "text-violet-600",
            }),
          ],
        }),
        e.jsxs("div", {
          className: "nls-sub-menubar-wrap",
          ref: nlsMenuRef,
          children: [
            e.jsxs("div", {
              className: "nls-sub-menubar",
              role: "menubar",
              "aria-label": "Submission filters",
              children: [
                e.jsxs(
                  "div",
                  {
                    className:
                      "nls-sub-menubar__item" + (menuOpen === "search" ? " is-open" : "") + (q ? " is-active" : ""),
                    children: [
                      e.jsxs("button", {
                        type: "button",
                        role: "menuitem",
                        className: "nls-sub-menubar__trigger",
                        "aria-haspopup": "true",
                        "aria-expanded": menuOpen === "search",
                        onClick: () => setMenuOpen(menuOpen === "search" ? "" : "search"),
                        children: [
                          e.jsx(Yn, {
                            size: 14,
                          }),
                          e.jsx("span", {
                            children: "Search",
                          }),
                          q
                            ? e.jsx("em", {
                                children: q.length > 18 ? q.slice(0, 18) + "…" : q,
                              })
                            : null,
                        ],
                      }),
                      menuOpen === "search"
                        ? e.jsx("div", {
                            className: "nls-sub-menubar__popup nls-sub-menubar__popup--wide",
                            role: "menu",
                            children: e.jsxs("div", {
                              className: "nls-sub-menubar__panel",
                              children: [
                                e.jsx("div", {
                                  className: "nls-sub-menubar__panel-title",
                                  children: "Search submissions",
                                }),
                                e.jsx("input", {
                                  autoFocus: !0,
                                  value: q,
                                  onChange: (ev) => setQ(ev.target.value),
                                  placeholder: "Form, field values, page…",
                                  className: "nls-sub-menubar__input",
                                }),
                                q
                                  ? e.jsx("button", {
                                      type: "button",
                                      className: "nls-sub-menubar__clear",
                                      onClick: () => setQ(""),
                                      children: "Clear search",
                                    })
                                  : null,
                              ],
                            }),
                          })
                        : null,
                    ],
                  },
                  "m-search",
                ),
                e.jsxs(
                  "div",
                  {
                    className:
                      "nls-sub-menubar__item" +
                      (menuOpen === "form" ? " is-open" : "") +
                      (formKey !== "all" ? " is-active" : ""),
                    children: [
                      e.jsxs("button", {
                        type: "button",
                        role: "menuitem",
                        className: "nls-sub-menubar__trigger",
                        "aria-haspopup": "true",
                        "aria-expanded": menuOpen === "form",
                        onClick: () => setMenuOpen(menuOpen === "form" ? "" : "form"),
                        children: [
                          e.jsx(Xs, {
                            size: 14,
                          }),
                          e.jsx("span", {
                            children: "Form",
                          }),
                          e.jsx("em", {
                            children:
                              formKey === "all"
                                ? "All forms"
                                : (formOptions.find(([k]) => k === formKey) || [formKey, formKey])[1],
                          }),
                        ],
                      }),
                      menuOpen === "form"
                        ? e.jsx("div", {
                            className: "nls-sub-menubar__popup",
                            role: "menu",
                            children: e.jsxs("div", {
                              className: "nls-sub-menubar__panel",
                              children: [
                                e.jsx("div", {
                                  className: "nls-sub-menubar__panel-title",
                                  children: "Filter by form",
                                }),
                                e.jsx("button", {
                                  type: "button",
                                  className: "nls-sub-menubar__option" + (formKey === "all" ? " is-selected" : ""),
                                  onClick: () => {
                                    (setFormKey("all"), setMenuOpen(""));
                                  },
                                  children: "All forms",
                                }),
                                formOptions.map(([k, n]) =>
                                  e.jsx(
                                    "button",
                                    {
                                      type: "button",
                                      className: "nls-sub-menubar__option" + (formKey === k ? " is-selected" : ""),
                                      onClick: () => {
                                        (setFormKey(k), setMenuOpen(""));
                                      },
                                      children: n,
                                    },
                                    k,
                                  ),
                                ),
                              ],
                            }),
                          })
                        : null,
                    ],
                  },
                  "m-form",
                ),
                e.jsxs(
                  "div",
                  {
                    className:
                      "nls-sub-menubar__item" +
                      (menuOpen === "email" ? " is-open" : "") +
                      (mail !== "all" ? " is-active" : ""),
                    children: [
                      e.jsxs("button", {
                        type: "button",
                        role: "menuitem",
                        className: "nls-sub-menubar__trigger",
                        "aria-haspopup": "true",
                        "aria-expanded": menuOpen === "email",
                        onClick: () => setMenuOpen(menuOpen === "email" ? "" : "email"),
                        children: [
                          e.jsx(qt, {
                            size: 14,
                          }),
                          e.jsx("span", {
                            children: "Email",
                          }),
                          e.jsx("em", {
                            children:
                              mail === "all"
                                ? "All"
                                : mail === "sent"
                                  ? "Sent"
                                  : mail === "failed"
                                    ? "Failed"
                                    : "Unknown",
                          }),
                        ],
                      }),
                      menuOpen === "email"
                        ? e.jsx("div", {
                            className: "nls-sub-menubar__popup",
                            role: "menu",
                            children: e.jsxs("div", {
                              className: "nls-sub-menubar__panel",
                              children: [
                                e.jsx("div", {
                                  className: "nls-sub-menubar__panel-title",
                                  children: "Email status",
                                }),
                                [
                                  ["all", "All"],
                                  ["sent", "Sent"],
                                  ["failed", "Failed"],
                                  ["unknown", "Unknown"],
                                ].map(([v, lab]) =>
                                  e.jsx(
                                    "button",
                                    {
                                      type: "button",
                                      className: "nls-sub-menubar__option" + (mail === v ? " is-selected" : ""),
                                      onClick: () => {
                                        (setMail(v), setMenuOpen(""));
                                      },
                                      children: lab,
                                    },
                                    v,
                                  ),
                                ),
                              ],
                            }),
                          })
                        : null,
                    ],
                  },
                  "m-email",
                ),
                e.jsxs(
                  "div",
                  {
                    className:
                      "nls-sub-menubar__item" + (menuOpen === "from" ? " is-open" : "") + (from ? " is-active" : ""),
                    children: [
                      e.jsxs("button", {
                        type: "button",
                        role: "menuitem",
                        className: "nls-sub-menubar__trigger",
                        "aria-haspopup": "true",
                        "aria-expanded": menuOpen === "from",
                        onClick: () => setMenuOpen(menuOpen === "from" ? "" : "from"),
                        children: [
                          e.jsx(qn, {
                            size: 14,
                          }),
                          e.jsx("span", {
                            children: "From",
                          }),
                          from
                            ? e.jsx("em", {
                                children: from,
                              })
                            : null,
                        ],
                      }),
                      menuOpen === "from"
                        ? e.jsx("div", {
                            className: "nls-sub-menubar__popup",
                            role: "menu",
                            children: e.jsxs("div", {
                              className: "nls-sub-menubar__panel",
                              children: [
                                e.jsx("div", {
                                  className: "nls-sub-menubar__panel-title",
                                  children: "From date",
                                }),
                                e.jsx("input", {
                                  type: "date",
                                  value: from,
                                  onChange: (ev) => setFrom(ev.target.value),
                                  className: "nls-sub-menubar__input",
                                }),
                                from
                                  ? e.jsx("button", {
                                      type: "button",
                                      className: "nls-sub-menubar__clear",
                                      onClick: () => setFrom(""),
                                      children: "Clear",
                                    })
                                  : null,
                              ],
                            }),
                          })
                        : null,
                    ],
                  },
                  "m-from",
                ),
                e.jsxs(
                  "div",
                  {
                    className:
                      "nls-sub-menubar__item" + (menuOpen === "to" ? " is-open" : "") + (to ? " is-active" : ""),
                    children: [
                      e.jsxs("button", {
                        type: "button",
                        role: "menuitem",
                        className: "nls-sub-menubar__trigger",
                        "aria-haspopup": "true",
                        "aria-expanded": menuOpen === "to",
                        onClick: () => setMenuOpen(menuOpen === "to" ? "" : "to"),
                        children: [
                          e.jsx(qn, {
                            size: 14,
                          }),
                          e.jsx("span", {
                            children: "To",
                          }),
                          to
                            ? e.jsx("em", {
                                children: to,
                              })
                            : null,
                        ],
                      }),
                      menuOpen === "to"
                        ? e.jsx("div", {
                            className: "nls-sub-menubar__popup",
                            role: "menu",
                            children: e.jsxs("div", {
                              className: "nls-sub-menubar__panel",
                              children: [
                                e.jsx("div", {
                                  className: "nls-sub-menubar__panel-title",
                                  children: "To date",
                                }),
                                e.jsx("input", {
                                  type: "date",
                                  value: to,
                                  onChange: (ev) => setTo(ev.target.value),
                                  className: "nls-sub-menubar__input",
                                }),
                                to
                                  ? e.jsx("button", {
                                      type: "button",
                                      className: "nls-sub-menubar__clear",
                                      onClick: () => setTo(""),
                                      children: "Clear",
                                    })
                                  : null,
                              ],
                            }),
                          })
                        : null,
                    ],
                  },
                  "m-to",
                ),
              ],
            }),
            selectedIds.length
              ? e.jsxs("div", {
                  className:
                    "mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2",
                  children: [
                    e.jsx("span", {
                      className: "text-xs font-semibold text-violet-700",
                      children: `${selectedIds.length} selected`,
                    }),
                    e.jsx("button", {
                      type: "button",
                      disabled: busy,
                      onClick: () => deleteIds(selectedIds),
                      className:
                        "inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-rose-700 disabled:opacity-50",
                      children: [
                        e.jsx(yt, {
                          size: 13,
                        }),
                        "Delete selected",
                      ],
                    }),
                  ],
                })
              : null,
          ],
        }),
        err
          ? e.jsx("div", {
              className: "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700",
              children: err,
            })
          : null,
        e.jsxs("div", {
          className: "grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]",
          children: [
            e.jsxs("div", {
              className: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
              children: [
                loading
                  ? e.jsx("div", {
                      className: "px-4 py-8 text-center text-xs font-semibold text-slate-400",
                      children: "Loading submissions…",
                    })
                  : null,
                !loading && rows.length === 0
                  ? e.jsxs("div", {
                      className: "px-4 py-12 text-center",
                      children: [
                        e.jsx("p", {
                          className: "text-sm font-semibold text-slate-700",
                          children: "No submissions match",
                        }),
                        e.jsx("p", {
                          className: "mt-1 text-xs text-slate-400",
                          children: "Try clearing filters or submit a form on the site.",
                        }),
                      ],
                    })
                  : null,
                rows.length
                  ? e.jsx("div", {
                      className: "overflow-x-auto",
                      children: e.jsxs("table", {
                        className: "min-w-full text-left text-sm",
                        children: [
                          e.jsx("thead", {
                            className:
                              "sticky top-0 z-10 bg-slate-50/95 text-[11px] uppercase tracking-wide text-slate-500 backdrop-blur",
                            children: e.jsxs("tr", {
                              children: [
                                e.jsx("th", {
                                  className: "w-10 px-3 py-3",
                                  children: e.jsx("input", {
                                    type: "checkbox",
                                    checked: allChecked,
                                    onChange: toggleAll,
                                    "aria-label": "Select all",
                                  }),
                                }),
                                e.jsx("th", {
                                  className: "px-3 py-3 font-semibold",
                                  children: "Date",
                                }),
                                e.jsx("th", {
                                  className: "px-3 py-3 font-semibold",
                                  children: "Form",
                                }),
                                e.jsx("th", {
                                  className: "px-3 py-3 font-semibold",
                                  children: "Preview",
                                }),
                                e.jsx("th", {
                                  className: "px-3 py-3 font-semibold",
                                  children: "Page",
                                }),
                                e.jsx("th", {
                                  className: "px-3 py-3 font-semibold",
                                  children: "Email",
                                }),
                                e.jsx("th", {
                                  className: "px-3 py-3 font-semibold text-right",
                                  children: "Actions",
                                }),
                              ],
                            }),
                          }),
                          e.jsx("tbody", {
                            className: "divide-y divide-slate-100",
                            children: rows.map((r) => {
                              const fields = Array.isArray(r.fields) ? r.fields : [];
                              const preview = fields
                                .slice(0, 2)
                                .map((f) => `${f.label}: ${f.value}`)
                                .join(" · ");
                              const active = openId === r.id;
                              return e.jsxs(
                                "tr",
                                {
                                  className: [
                                    "align-top transition-colors",
                                    active ? "bg-violet-50/70" : "hover:bg-slate-50/90",
                                  ].join(" "),
                                  children: [
                                    e.jsx("td", {
                                      className: "px-3 py-3",
                                      children: e.jsx("input", {
                                        type: "checkbox",
                                        checked: !!selected[r.id],
                                        onChange: () => toggleOne(r.id),
                                        "aria-label": "Select row",
                                      }),
                                    }),
                                    e.jsx("td", {
                                      className: "whitespace-nowrap px-3 py-3 text-xs font-medium text-slate-600",
                                      children: r.submittedAt || "—",
                                    }),
                                    e.jsxs("td", {
                                      className: "px-3 py-3",
                                      children: [
                                        e.jsx("div", {
                                          className: "text-sm font-semibold text-slate-800",
                                          children: r.formName || r.formKey || "—",
                                        }),
                                        e.jsx("div", {
                                          className: "mt-0.5 font-mono text-[10px] text-slate-400",
                                          children: r.formKey || "",
                                        }),
                                      ],
                                    }),
                                    e.jsx("td", {
                                      className: "max-w-[240px] px-3 py-3 text-xs text-slate-600",
                                      children:
                                        preview ||
                                        e.jsx("span", {
                                          className: "text-slate-300",
                                          children: "No fields",
                                        }),
                                    }),
                                    e.jsx("td", {
                                      className: "max-w-[160px] px-3 py-3 text-xs",
                                      children: r.pageUrl
                                        ? e.jsx("a", {
                                            href: r.pageUrl,
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                            className: "truncate text-violet-600 hover:underline",
                                            title: r.pageUrl,
                                            children: r.pageUrl.replace(/^https?:\/\//, ""),
                                          })
                                        : e.jsx("span", {
                                            className: "text-slate-300",
                                            children: "—",
                                          }),
                                    }),
                                    e.jsx("td", {
                                      className: "px-3 py-3",
                                      children: mailBadge(r.mailSent),
                                    }),
                                    e.jsxs("td", {
                                      className: "px-3 py-3",
                                      children: e.jsxs("div", {
                                        className: "flex items-center justify-end gap-1",
                                        children: [
                                          e.jsx("button", {
                                            type: "button",
                                            onClick: () => setOpenId(active ? null : r.id),
                                            className:
                                              "rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:border-violet-300 hover:text-violet-700",
                                            children: active ? "Hide" : "View",
                                          }),
                                          e.jsx("button", {
                                            type: "button",
                                            disabled: busy,
                                            onClick: () => deleteIds([r.id]),
                                            className:
                                              "inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600",
                                            title: "Delete",
                                            "aria-label": "Delete",
                                            children: e.jsx(yt, {
                                              size: 14,
                                            }),
                                          }),
                                        ],
                                      }),
                                    }),
                                  ],
                                },
                                r.id,
                              );
                            }),
                          }),
                        ],
                      }),
                    })
                  : null,
              ],
            }),
            e.jsxs("aside", {
              className: "rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-2 xl:self-start",
              children: [
                e.jsxs("div", {
                  className: "border-b border-slate-100 px-4 py-3",
                  children: [
                    e.jsx("h3", {
                      className: "text-sm font-bold text-slate-800",
                      children: "Submission details",
                    }),
                    e.jsx("p", {
                      className: "mt-0.5 text-[11px] text-slate-400",
                      children: openRow ? "Field-by-field view" : "Select a row to inspect",
                    }),
                  ],
                }),
                openRow
                  ? e.jsxs("div", {
                      className: "space-y-3 p-4",
                      children: [
                        e.jsxs("div", {
                          className: "rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600",
                          children: [
                            e.jsxs("div", {
                              children: [
                                e.jsx("span", {
                                  className: "font-semibold text-slate-400",
                                  children: "When · ",
                                }),
                                openRow.submittedAt || "—",
                              ],
                            }),
                            e.jsxs("div", {
                              className: "mt-1",
                              children: [
                                e.jsx("span", {
                                  className: "font-semibold text-slate-400",
                                  children: "Form · ",
                                }),
                                openRow.formName || openRow.formKey || "—",
                              ],
                            }),
                            e.jsxs("div", {
                              className: "mt-1 flex items-center gap-2",
                              children: [
                                e.jsx("span", {
                                  className: "font-semibold text-slate-400",
                                  children: "Email",
                                }),
                                mailBadge(openRow.mailSent),
                              ],
                            }),
                          ],
                        }),
                        e.jsx("div", {
                          className: "space-y-2",
                          children: (Array.isArray(openRow.fields) ? openRow.fields : []).map((f, idx) =>
                            e.jsxs(
                              "div",
                              {
                                className: "rounded-xl border border-slate-200 px-3 py-2",
                                children: [
                                  e.jsx("div", {
                                    className: "text-[10px] font-bold uppercase tracking-wide text-slate-400",
                                    children: f.label || "Field",
                                  }),
                                  e.jsx("div", {
                                    className: "mt-1 whitespace-pre-wrap text-sm font-medium text-slate-800",
                                    children: f.value || "",
                                  }),
                                ],
                              },
                              idx,
                            ),
                          ),
                        }),
                        openRow.pageUrl
                          ? e.jsx("a", {
                              href: openRow.pageUrl,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              className: "block truncate text-xs font-semibold text-violet-600 hover:underline",
                              children: openRow.pageUrl,
                            })
                          : null,
                        e.jsx("button", {
                          type: "button",
                          disabled: busy,
                          onClick: () => deleteIds([openRow.id]),
                          className:
                            "inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50",
                          children: [
                            e.jsx(yt, {
                              size: 14,
                            }),
                            "Delete submission",
                          ],
                        }),
                      ],
                    })
                  : e.jsx("div", {
                      className: "px-4 py-10 text-center text-xs text-slate-400",
                      children: "Click View on any submission to see the full entry here.",
                    }),
              ],
            }),
          ],
        }),
        e.jsx("p", {
          className: "text-[11px] text-slate-400",
          children: `Showing ${rows.length} of ${items.length} loaded submission(s). Entries older than the retention window are removed automatically.`,
        }),
      ],
    }),
  });
}
