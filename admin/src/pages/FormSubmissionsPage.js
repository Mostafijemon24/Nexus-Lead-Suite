import * as b from "react";
import * as e from "react/jsx-runtime";
import {
  Calendar as qn,
  ClipboardList as im,
  Download as Ol,
  Eye as Rt,
  EyeOff as za,
  FileText as Xs,
  Mail as qt,
  RefreshCw as ad,
  Search as Yn,
  Trash2 as yt,
} from "lucide-react";
import { PageFrame, StickyFooter, restFetch } from "../shared/common.js";

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
      const list = Array.isArray(res?.data?.items) ? res.data.items : [];
      setItems(list);
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
  const stat = ({ label, value, tone }) =>
    e.jsxs("div", {
      className: ["nls-stat", tone || ""].filter(Boolean).join(" "),
      children: [
        e.jsx("div", { className: "nls-stat__label", children: label }),
        e.jsx("div", { className: "nls-stat__value", children: value }),
      ],
    });
  const mailBadge = (v) =>
    v === !0
      ? e.jsx("span", { className: "nls-badge nls-badge--success", children: "Sent" })
      : v === !1
        ? e.jsx("span", { className: "nls-badge nls-badge--danger", children: "Failed" })
        : e.jsx("span", { className: "nls-badge nls-badge--muted", children: "—" });
  const menuItem = (key, { icon, label, value, active, popupClass, children }) =>
    e.jsxs(
      "div",
      {
        className: "nls-sub-menubar__item" + (menuOpen === key ? " is-open" : "") + (active ? " is-active" : ""),
        children: [
          e.jsxs("button", {
            type: "button",
            role: "menuitem",
            className: "nls-sub-menubar__trigger nls-btn nls-btn--secondary nls-btn--sm",
            "aria-haspopup": "true",
            "aria-expanded": menuOpen === key,
            onClick: () => setMenuOpen(menuOpen === key ? "" : key),
            children: [icon, e.jsx("span", { children: label }), value ? e.jsx("em", { children: value }) : null],
          }),
          menuOpen === key
            ? e.jsx("div", {
                className: ["nls-sub-menubar__popup", popupClass || ""].filter(Boolean).join(" "),
                role: "menu",
                children: e.jsxs("div", { className: "nls-sub-menubar__panel nls-card", children }),
              })
            : null,
        ],
      },
      "m-" + key,
    );
  return e.jsxs(PageFrame, {
    title: "Form Submissions",
    subtitle: "Live submission report — filter, inspect, export, or clean up entries.",
    icon: e.jsx(im, { size: 20 }),
    footer: e.jsx(StickyFooter, {}),
    headerRight: e.jsxs(e.Fragment, {
      children: [
        e.jsxs("button", {
          type: "button",
          disabled: loading || busy,
          onClick: () => load(),
          className: "nls-btn nls-btn--secondary",
          children: [e.jsx(ad, { "aria-hidden": "true", className: loading ? "animate-spin" : "" }), "Refresh"],
        }),
        e.jsxs("button", {
          type: "button",
          disabled: !rows.length,
          onClick: exportCsv,
          className: "nls-btn nls-btn--primary",
          children: [e.jsx(Ol, { "aria-hidden": "true" }), "Export CSV"],
        }),
      ],
    }),
    children: e.jsxs("div", {
      className: "nls-submissions-report nls-stack nls-stack--tight",
      children: [
        e.jsxs("div", {
          className: "nls-stats",
          children: [
            stat({ label: "Total shown", value: stats.total }),
            stat({ label: "Email sent", value: stats.sent, tone: "nls-stat--success" }),
            stat({ label: "Email failed", value: stats.failed, tone: "nls-stat--danger" }),
            stat({ label: "Forms", value: stats.forms, tone: "nls-stat--primary" }),
          ],
        }),
        e.jsxs("div", {
          className: "nls-sub-menubar-wrap",
          ref: nlsMenuRef,
          children: [
            e.jsxs("div", {
              className: "nls-sub-menubar nls-toolbar",
              role: "menubar",
              "aria-label": "Submission filters",
              children: [
                menuItem("search", {
                  icon: e.jsx(Yn, { "aria-hidden": "true" }),
                  label: "Search",
                  value: q ? (q.length > 18 ? q.slice(0, 18) + "…" : q) : "",
                  active: !!q,
                  popupClass: "nls-sub-menubar__popup--wide",
                  children: [
                    e.jsx("div", {
                      className: "nls-sub-menubar__panel-title nls-eyebrow",
                      children: "Search submissions",
                    }),
                    e.jsx("input", {
                      autoFocus: !0,
                      value: q,
                      onChange: (ev) => setQ(ev.target.value),
                      placeholder: "Form, field values, page…",
                      "aria-label": "Search submissions",
                      className: "nls-sub-menubar__input",
                    }),
                    q
                      ? e.jsx("button", {
                          type: "button",
                          className: "nls-sub-menubar__clear nls-btn nls-btn--ghost nls-btn--sm",
                          onClick: () => setQ(""),
                          children: "Clear search",
                        })
                      : null,
                  ],
                }),
                menuItem("form", {
                  icon: e.jsx(Xs, { "aria-hidden": "true" }),
                  label: "Form",
                  value:
                    formKey === "all"
                      ? "All forms"
                      : (formOptions.find(([k]) => k === formKey) || [formKey, formKey])[1],
                  active: formKey !== "all",
                  children: [
                    e.jsx("div", { className: "nls-sub-menubar__panel-title nls-eyebrow", children: "Filter by form" }),
                    e.jsx("button", {
                      type: "button",
                      className: "nls-sub-menubar__option" + (formKey === "all" ? " is-selected" : ""),
                      "aria-pressed": formKey === "all",
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
                          "aria-pressed": formKey === k,
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
                menuItem("email", {
                  icon: e.jsx(qt, { "aria-hidden": "true" }),
                  label: "Email",
                  value: mail === "all" ? "All" : mail === "sent" ? "Sent" : mail === "failed" ? "Failed" : "Unknown",
                  active: mail !== "all",
                  children: [
                    e.jsx("div", { className: "nls-sub-menubar__panel-title nls-eyebrow", children: "Email status" }),
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
                          "aria-pressed": mail === v,
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
                menuItem("from", {
                  icon: e.jsx(qn, { "aria-hidden": "true" }),
                  label: "From",
                  value: from,
                  active: !!from,
                  children: [
                    e.jsx("div", { className: "nls-sub-menubar__panel-title nls-eyebrow", children: "From date" }),
                    e.jsx("input", {
                      type: "date",
                      value: from,
                      onChange: (ev) => setFrom(ev.target.value),
                      "aria-label": "From date",
                      className: "nls-sub-menubar__input",
                    }),
                    from
                      ? e.jsx("button", {
                          type: "button",
                          className: "nls-sub-menubar__clear nls-btn nls-btn--ghost nls-btn--sm",
                          onClick: () => setFrom(""),
                          children: "Clear",
                        })
                      : null,
                  ],
                }),
                menuItem("to", {
                  icon: e.jsx(qn, { "aria-hidden": "true" }),
                  label: "To",
                  value: to,
                  active: !!to,
                  children: [
                    e.jsx("div", { className: "nls-sub-menubar__panel-title nls-eyebrow", children: "To date" }),
                    e.jsx("input", {
                      type: "date",
                      value: to,
                      onChange: (ev) => setTo(ev.target.value),
                      "aria-label": "To date",
                      className: "nls-sub-menubar__input",
                    }),
                    to
                      ? e.jsx("button", {
                          type: "button",
                          className: "nls-sub-menubar__clear nls-btn nls-btn--ghost nls-btn--sm",
                          onClick: () => setTo(""),
                          children: "Clear",
                        })
                      : null,
                  ],
                }),
              ],
            }),
            selectedIds.length
              ? e.jsxs("div", {
                  className: "nls-notice nls-notice--info nls-sub-bulk",
                  role: "status",
                  children: [
                    e.jsx("strong", { children: `${selectedIds.length} selected` }),
                    e.jsxs("button", {
                      type: "button",
                      disabled: busy,
                      onClick: () => deleteIds(selectedIds),
                      className: "nls-btn nls-btn--danger-solid nls-btn--sm",
                      children: [e.jsx(yt, { "aria-hidden": "true" }), "Delete selected"],
                    }),
                  ],
                })
              : null,
          ],
        }),
        err ? e.jsx("div", { className: "nls-notice nls-notice--danger", role: "alert", children: err }) : null,
        e.jsxs("div", {
          className: "nls-sub-layout",
          children: [
            e.jsxs("div", {
              className: "nls-table-wrap nls-sub-table-wrap",
              children: [
                loading ? e.jsx("div", { className: "nls-empty-inline", children: "Loading submissions…" }) : null,
                !loading && rows.length === 0
                  ? e.jsxs("div", {
                      className: "nls-empty-inline nls-sub-empty",
                      children: [
                        e.jsx("p", { className: "nls-sub-empty__title", children: "No submissions match" }),
                        e.jsx("p", { children: "Try clearing filters or submit a form on the site." }),
                      ],
                    })
                  : null,
                rows.length
                  ? e.jsxs("table", {
                      className: "nls-table nls-sub-table",
                      children: [
                        e.jsx("thead", {
                          children: e.jsxs("tr", {
                            children: [
                              e.jsx("th", {
                                scope: "col",
                                className: "nls-sub-table__check",
                                children: e.jsx("input", {
                                  type: "checkbox",
                                  checked: allChecked,
                                  onChange: toggleAll,
                                  "aria-label": "Select all",
                                }),
                              }),
                              e.jsx("th", { scope: "col", children: "Date" }),
                              e.jsx("th", { scope: "col", children: "Form" }),
                              e.jsx("th", { scope: "col", children: "Preview" }),
                              e.jsx("th", { scope: "col", children: "Page" }),
                              e.jsx("th", { scope: "col", children: "Email" }),
                              e.jsx("th", { scope: "col", className: "nls-sub-table__actions", children: "Actions" }),
                            ],
                          }),
                        }),
                        e.jsx("tbody", {
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
                                className: active ? "is-active" : "",
                                children: [
                                  e.jsx("td", {
                                    className: "nls-sub-table__check",
                                    children: e.jsx("input", {
                                      type: "checkbox",
                                      checked: !!selected[r.id],
                                      onChange: () => toggleOne(r.id),
                                      "aria-label": "Select row",
                                    }),
                                  }),
                                  e.jsx("td", { className: "nls-sub-table__date", children: r.submittedAt || "—" }),
                                  e.jsxs("td", {
                                    children: [
                                      e.jsx("div", {
                                        className: "nls-sub-table__form",
                                        children: r.formName || r.formKey || "—",
                                      }),
                                      r.formKey
                                        ? e.jsx("div", {
                                            className: "nls-mono nls-text-xs nls-muted",
                                            children: r.formKey,
                                          })
                                        : null,
                                    ],
                                  }),
                                  e.jsx("td", {
                                    className: "nls-sub-table__preview",
                                    children:
                                      preview || e.jsx("span", { className: "nls-muted", children: "No fields" }),
                                  }),
                                  e.jsx("td", {
                                    className: "nls-sub-table__page",
                                    children: r.pageUrl
                                      ? e.jsx("a", {
                                          href: r.pageUrl,
                                          target: "_blank",
                                          rel: "noopener noreferrer",
                                          className: "nls-link",
                                          title: r.pageUrl,
                                          children: e.jsx("span", {
                                            className: "truncate",
                                            children: r.pageUrl.replace(/^https?:\/\//, ""),
                                          }),
                                        })
                                      : e.jsx("span", { className: "nls-muted", children: "—" }),
                                  }),
                                  e.jsx("td", { children: mailBadge(r.mailSent) }),
                                  e.jsx("td", {
                                    className: "nls-sub-table__actions",
                                    children: e.jsxs("div", {
                                      className: "nls-sub-table__btns",
                                      children: [
                                        e.jsx("button", {
                                          type: "button",
                                          onClick: () => setOpenId(active ? null : r.id),
                                          className: [
                                            "nls-icon-btn nls-icon-btn--sm nls-icon-btn--primary",
                                            active ? "is-on" : "",
                                          ]
                                            .filter(Boolean)
                                            .join(" "),
                                          "aria-pressed": active,
                                          title: active ? "Hide" : "View",
                                          "aria-label": active ? "Hide" : "View",
                                          children: active
                                            ? e.jsx(za, { "aria-hidden": "true" })
                                            : e.jsx(Rt, { "aria-hidden": "true" }),
                                        }),
                                        e.jsx("button", {
                                          type: "button",
                                          disabled: busy,
                                          onClick: () => deleteIds([r.id]),
                                          className: "nls-icon-btn nls-icon-btn--sm nls-icon-btn--danger",
                                          title: "Delete",
                                          "aria-label": "Delete",
                                          children: e.jsx(yt, { "aria-hidden": "true" }),
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
                    })
                  : null,
              ],
            }),
            e.jsxs("aside", {
              className: "nls-card nls-sub-detail",
              "aria-labelledby": "nls-sub-detail-title",
              children: [
                e.jsx("div", {
                  className: "nls-card__header",
                  children: e.jsxs("div", {
                    className: "min-w-0",
                    children: [
                      e.jsx("h3", {
                        id: "nls-sub-detail-title",
                        className: "nls-card__title",
                        children: "Submission details",
                      }),
                      e.jsx("p", {
                        className: "nls-card__desc",
                        children: openRow ? "Field-by-field view" : "Select a row to inspect",
                      }),
                    ],
                  }),
                }),
                openRow
                  ? e.jsxs("div", {
                      className: "nls-card__body nls-stack nls-stack--tight",
                      children: [
                        e.jsx("div", {
                          className: "nls-table-wrap",
                          children: e.jsx("table", {
                            className: "nls-table nls-sub-kv",
                            children: e.jsxs("tbody", {
                              children: [
                                e.jsxs("tr", {
                                  children: [
                                    e.jsx("th", { scope: "row", children: "When" }),
                                    e.jsx("td", { children: openRow.submittedAt || "—" }),
                                  ],
                                }),
                                e.jsxs("tr", {
                                  children: [
                                    e.jsx("th", { scope: "row", children: "Form" }),
                                    e.jsx("td", {
                                      className: "is-strong",
                                      children: openRow.formName || openRow.formKey || "—",
                                    }),
                                  ],
                                }),
                                e.jsxs("tr", {
                                  children: [
                                    e.jsx("th", { scope: "row", children: "Form key" }),
                                    e.jsx("td", { className: "nls-mono", children: openRow.formKey || "—" }),
                                  ],
                                }),
                                e.jsxs("tr", {
                                  children: [
                                    e.jsx("th", { scope: "row", children: "Email" }),
                                    e.jsx("td", { children: mailBadge(openRow.mailSent) }),
                                  ],
                                }),
                              ],
                            }),
                          }),
                        }),
                        e.jsxs("div", {
                          children: [
                            e.jsx("div", { className: "nls-eyebrow nls-sub-detail__eyebrow", children: "Fields" }),
                            e.jsx("div", {
                              className: "nls-table-wrap",
                              children: e.jsxs("table", {
                                className: "nls-table nls-sub-kv nls-sub-fields",
                                children: [
                                  e.jsx("thead", {
                                    children: e.jsxs("tr", {
                                      children: [
                                        e.jsx("th", { scope: "col", children: "Field" }),
                                        e.jsx("th", { scope: "col", children: "Value" }),
                                      ],
                                    }),
                                  }),
                                  e.jsx("tbody", {
                                    children: (Array.isArray(openRow.fields) ? openRow.fields : []).length
                                      ? (Array.isArray(openRow.fields) ? openRow.fields : []).map((f, idx) =>
                                          e.jsxs(
                                            "tr",
                                            {
                                              children: [
                                                e.jsx("th", { scope: "row", children: f.label || "Field" }),
                                                e.jsx("td", {
                                                  className: "nls-sub-fields__value",
                                                  children: f.value || "",
                                                }),
                                              ],
                                            },
                                            idx,
                                          ),
                                        )
                                      : e.jsx("tr", {
                                          children: e.jsx("td", {
                                            colSpan: 2,
                                            className: "nls-table__empty",
                                            children: "No fields",
                                          }),
                                        }),
                                  }),
                                ],
                              }),
                            }),
                          ],
                        }),
                        openRow.pageUrl
                          ? e.jsx("a", {
                              href: openRow.pageUrl,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              className: "nls-link nls-sub-detail__link nls-text-sm",
                              title: openRow.pageUrl,
                              children: e.jsx("span", { className: "truncate", children: openRow.pageUrl }),
                            })
                          : null,
                        e.jsxs("button", {
                          type: "button",
                          disabled: busy,
                          onClick: () => deleteIds([openRow.id]),
                          className: "nls-btn nls-btn--danger nls-btn--block",
                          children: [e.jsx(yt, { "aria-hidden": "true" }), "Delete submission"],
                        }),
                      ],
                    })
                  : e.jsx("div", {
                      className: "nls-empty-inline",
                      children: "Click View on any submission to see the full entry here.",
                    }),
              ],
            }),
          ],
        }),
        e.jsx("p", {
          className: "nls-muted nls-text-xs",
          children: `Showing ${rows.length} of ${items.length} loaded submission(s). Entries older than the retention window are removed automatically.`,
        }),
      ],
    }),
  });
}
