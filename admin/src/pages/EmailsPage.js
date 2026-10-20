import {
  Activity as vi,
  Calendar as qn,
  Check as Lt,
  Code as Dl,
  Copy as $s,
  Database as Gn,
  Eye as Rt,
  Globe as Bl,
  Hash as Ul,
  Layers as Wl,
  Mail as qt,
  MapPin as $a,
  MousePointer2 as sd,
  PanelsTopLeft as Si,
  Plus as dt,
  Save as bn,
  Smartphone as od,
  Terminal as ud,
  Trash2 as yt,
  User as Fa,
  UserPlus as hd,
  X as _t,
} from "lucide-react";
import * as b from "react";
import * as e from "react/jsx-runtime";
import { SuccessModal } from "../shared/common.js";

function jx(a) {
  var o;
  (o = navigator == null ? void 0 : navigator.clipboard) != null && o.writeText && navigator.clipboard.writeText(a);
}
function emailTemplatesUrl(a) {
  var d;
  const o = (
      ((d = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : d.restUrl) || "/wp-json/"
    ).replace(/\/?$/, "/"),
    i = String(a).replace(/^\//, "");
  return `${o}${i}`;
}
function encodeUtf8Base64(a) {
  const o = new TextEncoder().encode(String(a ?? ""));
  let i = "";
  return (
    o.forEach((d) => {
      i += String.fromCharCode(d);
    }),
    btoa(i)
  );
}
async function parseEmailResponse(a) {
  const o = await a.text(),
    i = o.trim();
  if (i.startsWith("<")) {
    const d =
      a.status === 403 || a.status === 406
        ? "The server security layer blocked this save (HTML email content). Try again or ask your host to allow REST POST to wp-json."
        : `The server returned an HTML page instead of JSON (HTTP ${a.status}). Check that WordPress REST API and permalinks are working.`;
    throw new Error(d);
  }
  try {
    return i ? JSON.parse(o) : {};
  } catch {
    throw new Error("Invalid response from server while saving email templates.");
  }
}
function createDefaultTemplate() {
  var i;
  const a = Date.now(),
    o =
      (i = window == null ? void 0 : window.crypto) != null && i.randomUUID ? window.crypto.randomUUID() : `uuid-${a}`;
  return {
    id: `template-${a}`,
    name: "Untitled Template",
    uuid: o,
    recipients: [],
    subject: "Notification from {siteName}",
    content: DEFAULT_EMAIL_HTML,
  };
}
const DEFAULT_EMAIL_HTML = `<html lang="en">
<head><meta charset="UTF-8" /><title>Activity notification</title></head>
<body>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#eef2ff;padding:24px 10px;font-family:'Segoe UI',Roboto,Arial,sans-serif">
<tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;border:1px solid #e2e8f0">
<tr>
<td style="background:#1e293b;padding:26px 28px;text-align:left">
<p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;font-weight:600">Activity notification</p>
<p style="margin:10px 0 0;font-size:22px;font-weight:700;color:#f8fafc;line-height:1.25">{siteName}</p>
</td>
</tr>
<tr>
<td style="padding:28px 28px 8px;color:#334155;font-size:15px;line-height:1.65">
<p style="margin:0 0 14px;font-size:17px;color:#0f172a"><strong>Hi,</strong></p>
<p style="margin:0 0 22px">Someone has triggered <strong style="color:#0f172a">{btnName}</strong>. Here are the relevant details:</p>
<p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.06em;color:#64748b;text-transform:uppercase">Event details</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
<tr>
<td style="padding:12px 16px;background:#f8fafc;font-size:12px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0">Purpose</td>
<td style="padding:12px 16px;font-size:14px;color:#334155;border-bottom:1px solid #e2e8f0">{purpose}</td>
</tr>
<tr>
<td style="padding:12px 16px;background:#f8fafc;font-size:12px;font-weight:600;color:#64748b">Date &#038; time</td>
<td style="padding:12px 16px;font-size:14px;color:#334155">{dateTime}</td>
</tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px"><tr><td style="border-radius:10px;background:#2563eb">
<a href="{pageUrl}" style="display:inline-block;padding:12px 22px;color:#ffffff!important;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px">View related page</a>
</td></tr></table>
</td>
</tr>
<tr>
<td style="padding:22px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;line-height:1.6">
<p style="margin:0">This message was sent from <a href="{siteUrl}" style="color:#2563eb;text-decoration:none">{siteName}</a>.</p>
<p style="margin:14px 0 0">Copyright &copy; {year} <a href="{siteUrl}" style="color:#2563eb;text-decoration:none">{siteName}</a>. All rights reserved.</p>
</td>
</tr>
</table>
</td></tr>
</table>
</body></html>`,
  kx = [
    {
      label: "Button Name",
      val: "{btnName}",
      Icon: sd,
    },
    {
      label: "Event ID",
      val: "{eventId}",
      Icon: vi,
    },
    {
      label: "Date/Time",
      val: "{dateTime}",
      Icon: qn,
    },
    {
      label: "Local Date/Time",
      val: "{localDateTime}",
      Icon: qn,
    },
    {
      label: "Timezone",
      val: "{timezoneLabel}",
      Icon: Bl,
    },
    {
      label: "Recipient Name",
      val: "{recipientName}",
      Icon: hd,
    },
    {
      label: "User Name",
      val: "{userName}",
      Icon: Fa,
    },
    {
      label: "User Email",
      val: "{userEmail}",
      Icon: qt,
    },
    {
      label: "Submitted By",
      val: "{submittedByName}",
      Icon: Fa,
    },
    {
      label: "Submitted Email",
      val: "{submittedByEmail}",
      Icon: qt,
    },
    {
      label: "IP Address",
      val: "{ipAddress}",
      Icon: Bl,
    },
    {
      label: "Location",
      val: "{userLocation}",
      Icon: $a,
    },
    {
      label: "Submit Location",
      val: "{submitLocation}",
      Icon: $a,
    },
    {
      label: "Site Name",
      val: "{siteName}",
      Icon: Si,
    },
    {
      label: "Site Initial",
      val: "{siteInitial}",
      Icon: Ul,
    },
    {
      label: "Site URL",
      val: "{siteUrl}",
      Icon: Bl,
    },
    {
      label: "Page URL",
      val: "{pageUrl}",
      Icon: Dl,
    },
    {
      label: "Form Name",
      val: "{formName}",
      Icon: ud,
    },
    {
      label: "Reference",
      val: "{reference}",
      Icon: Ul,
    },
    {
      label: "Step No",
      val: "{stepNo}",
      Icon: Wl,
    },
  ].sort((a, o) => a.label.localeCompare(o.label));
export function EmailsPage() {
  const [a, o] = b.useState([]),
    i = b.useRef(a);
  b.useEffect(() => {
    i.current = a;
  }, [a]);
  const [d, u] = b.useState(null),
    [p, h] = b.useState(""),
    [x, f] = b.useState(!1),
    [S, y] = b.useState(!1),
    [P, M] = b.useState(null),
    [T, F] = b.useState({
      loading: !0,
      saving: !1,
      error: "",
    }),
    [V, z] = b.useState(!1),
    [U, w] = b.useState([]),
    N = b.useMemo(() => a.find((O) => O.id === d) || a[0], [a, d]),
    H = b.useMemo(() => JSON.stringify(a) !== JSON.stringify(U), [a, U]);
  b.useEffect(() => {
    let O = !1;
    async function te() {
      var pe, me, B;
      F({
        loading: !0,
        saving: !1,
        error: "",
      });
      try {
        const ee = await fetch(emailTemplatesUrl("nexulesuite_/v1/emails/templates"), {
            method: "GET",
            credentials: "same-origin",
            headers: {
              "X-WP-Nonce":
                ((pe = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : pe.nonce) || "",
            },
          }),
          _ = await parseEmailResponse(ee),
          X = Array.isArray((me = _ == null ? void 0 : _.data) == null ? void 0 : me.templates) ? _.data.templates : [];
        if (O) return;
        const L = X.length ? X : [createDefaultTemplate()];
        (o(L),
          w(X),
          u(((B = L[0]) == null ? void 0 : B.id) || null),
          F({
            loading: !1,
            saving: !1,
            error: "",
          }));
      } catch (ee) {
        if (O) return;
        const _ = [createDefaultTemplate()];
        (o(_),
          w([]),
          u(_[0].id),
          F({
            loading: !1,
            saving: !1,
            error: (ee == null ? void 0 : ee.message) || "Failed to load templates.",
          }));
      }
    }
    return (
      te(),
      () => {
        O = !0;
      }
    );
  }, []);
  const W = (O) => {
      if (!N) {
        const te = {
          ...createDefaultTemplate(),
          ...O,
        };
        (o((pe) => [...pe, te]), u(te.id));
        return;
      }
      o((te) =>
        te.map((pe) =>
          pe.id === N.id
            ? {
                ...pe,
                ...O,
              }
            : pe,
        ),
      );
    },
    I = () => {
      const O = createDefaultTemplate();
      (o((te) => [...te, O]), u(O.id));
    },
    C = (O) => {
      o((te) => {
        const pe = te.filter((me) => me.id !== O);
        return (
          u((me) => {
            var B;
            return me === O ? ((B = pe[0]) == null ? void 0 : B.id) || null : me;
          }),
          pe
        );
      });
    },
    J = (O) => {
      if (O.key !== "Enter" && O.key !== ",") return;
      O.preventDefault();
      const te = p.trim().replace(",", "");
      if (!te || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(te)) return;
      const me = Array.isArray(N == null ? void 0 : N.recipients) ? N.recipients : [];
      if (me.includes(te)) {
        h("");
        return;
      }
      (W({
        recipients: [...me, te],
      }),
        h(""));
    },
    j = () => {
      var O;
      (o(U), u(((O = U[0]) == null ? void 0 : O.id) || null));
    },
    le = async () => {
      var te, pe, me;
      F((B) => ({
        ...B,
        saving: !0,
        error: "",
      }));
      const O = Array.isArray(i.current) ? i.current : [];
      try {
        const B = await fetch(emailTemplatesUrl("nexulesuite_/v1/emails/templates"), {
            method: "POST",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
              "X-WP-Nonce":
                ((te = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : te.nonce) || "",
            },
            body: JSON.stringify({
              contentEncoding: "base64",
              templates: O.map((X) => ({
                ...X,
                content: encodeUtf8Base64((X == null ? void 0 : X.content) || ""),
              })),
            }),
          }),
          ee = await parseEmailResponse(B);
        if (!B.ok || (ee == null ? void 0 : ee.success) !== !0)
          throw new Error((ee == null ? void 0 : ee.message) || "Save failed.");
        const _ = Array.isArray((pe = ee == null ? void 0 : ee.data) == null ? void 0 : pe.templates)
          ? ee.data.templates
          : a;
        (o(_),
          w(_),
          u(((me = _[0]) == null ? void 0 : me.id) || null),
          F({
            loading: !1,
            saving: !1,
            error: "",
          }),
          z(!0));
      } catch (B) {
        F((ee) => ({
          ...ee,
          saving: !1,
          error: (B == null ? void 0 : B.message) || "Save failed.",
        }));
      }
    },
    ie = (O) => {
      var pe, me;
      const te = new Date().toLocaleString();
      return ((O == null ? void 0 : O.content) || "")
        .replace(/{userName}/g, "Demo User")
        .replace(/{userEmail}/g, "demo@example.com")
        .replace(/{btnName}/g, "Contact Us")
        .replace(/{dateTime}/g, te)
        .replace(/{ipAddress}/g, "192.0.2.10")
        .replace(/{pageUrl}/g, "/contact-us")
        .replace(
          /{siteName}/g,
          ((pe = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : pe.siteTitle) || "Site",
        )
        .replace(/{siteUrl}/g, ((me = window == null ? void 0 : window.location) == null ? void 0 : me.origin) || "");
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(SuccessModal, {
        open: V,
        message: "Your settings have been successfully updated. All changes are now live.",
        onDismiss: () => z(!1),
      }),
      e.jsxs("div", {
        className: "min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900",
        children: [
          e.jsxs("div", {
            className:
              "w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh]",
            children: [
              e.jsxs("header", {
                className: "p-6 border-b border-slate-200 bg-white flex justify-between items-center shrink-0",
                children: [
                  e.jsxs("div", {
                    className: "flex items-center gap-4",
                    children: [
                      e.jsx("div", {
                        className: "bg-indigo-600 p-3 rounded-2xl text-white shadow-lg",
                        children: e.jsx(qt, {
                          size: 24,
                        }),
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsx("h1", {
                            className: "text-xl font-bold tracking-tight",
                            children: "Email Automation Builder",
                          }),
                          e.jsx("p", {
                            className: "text-xs text-slate-400",
                            children: "Manage dynamic email triggers and contents",
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("button", {
                    type: "button",
                    onClick: I,
                    className:
                      "flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl transition-all text-sm font-bold shadow-xl active:scale-95",
                    children: [
                      e.jsx(dt, {
                        size: 18,
                      }),
                      " Create New Template",
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "flex flex-1 overflow-hidden",
                children: [
                  e.jsxs("aside", {
                    className: "w-72 border-r border-slate-100 bg-slate-50 flex flex-col shrink-0",
                    children: [
                      e.jsxs("div", {
                        className: "p-4 border-b border-slate-100 flex items-center justify-between",
                        children: [
                          e.jsx("h2", {
                            className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest",
                            children: "Template Layers",
                          }),
                          e.jsx(Wl, {
                            size: 14,
                            className: "text-slate-300",
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "flex-1 overflow-y-auto p-3 space-y-2",
                        children: [
                          T.loading
                            ? e.jsx("div", {
                                className: "px-2 py-3 text-sm text-slate-500",
                                children: "Loading…",
                              })
                            : null,
                          a.map((O) => {
                            const te = O.id === d;
                            return e.jsxs(
                              "div",
                              {
                                onClick: () => u(O.id),
                                className: [
                                  "group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                                  te
                                    ? "bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/5"
                                    : "bg-transparent border-transparent hover:bg-slate-200/50",
                                ].join(" "),
                                children: [
                                  e.jsxs("div", {
                                    className: "flex items-center gap-3 truncate",
                                    children: [
                                      e.jsx(qt, {
                                        size: 16,
                                        className: te ? "text-indigo-600" : "text-slate-400",
                                      }),
                                      e.jsx("span", {
                                        className: [
                                          "text-sm font-bold truncate",
                                          te ? "text-slate-900" : "text-slate-500",
                                        ].join(" "),
                                        children: O.name,
                                      }),
                                    ],
                                  }),
                                  e.jsxs("div", {
                                    className:
                                      "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                    onClick: (pe) => pe.stopPropagation(),
                                    children: [
                                      e.jsx("button", {
                                        type: "button",
                                        onClick: () => M(O),
                                        className:
                                          "p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white shadow-sm",
                                        "aria-label": "Preview",
                                        children: e.jsx(Rt, {
                                          size: 12,
                                        }),
                                      }),
                                      e.jsx("button", {
                                        type: "button",
                                        onClick: () => C(O.id),
                                        className:
                                          "p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white shadow-sm",
                                        "aria-label": "Delete",
                                        children: e.jsx(yt, {
                                          size: 12,
                                        }),
                                      }),
                                    ],
                                  }),
                                ],
                              },
                              O.id,
                            );
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsx("main", {
                    className: "flex-1 overflow-y-auto p-8",
                    style: {
                      background: "#f4f5f8",
                    },
                    children: e.jsxs("div", {
                      className: "nexulesuite_emails-editor-wrap max-w-[1080px] mx-auto pb-20",
                      children: [
                        T.error
                          ? e.jsx("div", {
                              className: "nexulesuite_em-alert",
                              children: T.error,
                            })
                          : null,
                        e.jsxs("div", {
                          className: "nexulesuite_em-card",
                          children: [
                            e.jsx("section", {
                              className: "nexulesuite_em-section is-first",
                              children: e.jsxs("div", {
                                className: "nexulesuite_em-name-row",
                                children: [
                                  e.jsxs("div", {
                                    className: "nexulesuite_em-field",
                                    children: [
                                      e.jsx("span", {
                                        className: "lbl",
                                        children: "Template Name",
                                      }),
                                      e.jsx("input", {
                                        type: "text",
                                        className: "inp",
                                        value: (N == null ? void 0 : N.name) || "",
                                        onChange: (O) =>
                                          W({
                                            name: O.target.value,
                                          }),
                                        placeholder: "Template Name...",
                                      }),
                                    ],
                                  }),
                                  e.jsxs("div", {
                                    className: "nexulesuite_em-uuid-badge",
                                    children: [
                                      e.jsx(Ul, {
                                        size: 14,
                                      }),
                                      e.jsxs("span", {
                                        className: "nexulesuite_em-uuid-text",
                                        children: ["# ", ((N == null ? void 0 : N.uuid) || "").substring(0, 18), "..."],
                                      }),
                                      e.jsx("button", {
                                        type: "button",
                                        onClick: () => {
                                          (jx((N == null ? void 0 : N.uuid) || ""),
                                            f(!0),
                                            setTimeout(() => f(!1), 1800));
                                        },
                                        className: "nexulesuite_em-uuid-copy",
                                        "aria-label": "Copy UUID",
                                        children: x
                                          ? e.jsx(Lt, {
                                              size: 14,
                                              className: "nexulesuite_em-uuid-copied",
                                            })
                                          : e.jsx($s, {
                                              size: 14,
                                            }),
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            }),
                            e.jsxs("section", {
                              className: "nexulesuite_em-section",
                              children: [
                                e.jsxs("div", {
                                  className: "nexulesuite_em-sec-head",
                                  children: [
                                    e.jsx("span", {
                                      className: "nexulesuite_em-sec-ico",
                                      children: e.jsx(hd, {
                                        size: 16,
                                      }),
                                    }),
                                    e.jsx("span", {
                                      className: "nexulesuite_em-sec-title",
                                      children: "Recipients Management",
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "nexulesuite_em-recipients-box",
                                  children: [
                                    e.jsxs("div", {
                                      className: "nexulesuite_em-recipients-inner",
                                      children: [
                                        ((N == null ? void 0 : N.recipients) || []).map((O, te) =>
                                          e.jsxs(
                                            "span",
                                            {
                                              className: "nexulesuite_em-recipient-chip",
                                              children: [
                                                O,
                                                e.jsx("button", {
                                                  type: "button",
                                                  onClick: () =>
                                                    W({
                                                      recipients: N.recipients.filter((pe, me) => me !== te),
                                                    }),
                                                  className: "nexulesuite_em-recipient-remove",
                                                  "aria-label": "Remove recipient",
                                                  children: e.jsx(_t, {
                                                    size: 12,
                                                  }),
                                                }),
                                              ],
                                            },
                                            `${O}-${te}`,
                                          ),
                                        ),
                                        e.jsx("input", {
                                          type: "text",
                                          value: p,
                                          onChange: (O) => h(O.target.value),
                                          onKeyDown: J,
                                          placeholder: "Enter email address...",
                                          className: "nexulesuite_em-recipients-inp",
                                        }),
                                      ],
                                    }),
                                    e.jsx("span", {
                                      className: "nexulesuite_em-recipients-mail",
                                      "aria-hidden": "true",
                                      children: e.jsx(qt, {
                                        size: 16,
                                      }),
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsxs("section", {
                              className: "nexulesuite_em-section",
                              children: [
                                e.jsxs("div", {
                                  className: "nexulesuite_em-sec-head",
                                  children: [
                                    e.jsx("span", {
                                      className: "nexulesuite_em-sec-ico",
                                      children: e.jsx(ud, {
                                        size: 16,
                                      }),
                                    }),
                                    e.jsx("span", {
                                      className: "nexulesuite_em-sec-title",
                                      children: "Email Subject Line",
                                    }),
                                  ],
                                }),
                                e.jsx("input", {
                                  type: "text",
                                  className: "inp",
                                  value: (N == null ? void 0 : N.subject) || "",
                                  onChange: (O) =>
                                    W({
                                      subject: O.target.value,
                                    }),
                                  placeholder: "Enter Subject...",
                                }),
                              ],
                            }),
                            e.jsxs("section", {
                              className: "nexulesuite_em-section",
                              children: [
                                e.jsxs("div", {
                                  className: "nexulesuite_em-tags-head",
                                  children: [
                                    e.jsxs("div", {
                                      className: "nexulesuite_em-sec-head nexulesuite_em-sec-head--dense",
                                      children: [
                                        e.jsx("span", {
                                          className: "nexulesuite_em-sec-ico",
                                          children: e.jsx(Gn, {
                                            size: 16,
                                          }),
                                        }),
                                        e.jsx("span", {
                                          className: "nexulesuite_em-sec-title",
                                          children: "Data Injection Library",
                                        }),
                                      ],
                                    }),
                                    e.jsx("span", {
                                      className: "nexulesuite_em-tags-hint",
                                      children: "Click tag to auto-insert into subject",
                                    }),
                                  ],
                                }),
                                e.jsx("div", {
                                  className: "nexulesuite_em-tags",
                                  children: kx.map((O) =>
                                    e.jsxs(
                                      "button",
                                      {
                                        type: "button",
                                        onClick: () =>
                                          W({
                                            subject: ((N == null ? void 0 : N.subject) || "") + O.val,
                                          }),
                                        className: "nexulesuite_em-tag",
                                        children: [
                                          e.jsx(O.Icon, {
                                            size: 12,
                                          }),
                                          e.jsx("span", {
                                            children: O.label,
                                          }),
                                          e.jsx("code", {
                                            children: O.val,
                                          }),
                                        ],
                                      },
                                      O.val,
                                    ),
                                  ),
                                }),
                              ],
                            }),
                            e.jsxs("section", {
                              className: "nexulesuite_em-section nexulesuite_em-html-panel",
                              children: [
                                e.jsx("div", {
                                  className: "nexulesuite_em-html-ico",
                                  children: e.jsx(Dl, {
                                    size: 28,
                                  }),
                                }),
                                e.jsxs("div", {
                                  className: "nexulesuite_em-html-copy",
                                  children: [
                                    e.jsx("h4", {
                                      children: "HTML Source Controller",
                                    }),
                                    e.jsx("p", {
                                      children: "Manage the visual structure and dynamic content mapping here.",
                                    }),
                                  ],
                                }),
                                e.jsxs("button", {
                                  type: "button",
                                  onClick: () => y(!0),
                                  className: "nexulesuite_em-html-btn",
                                  children: [
                                    e.jsx(Dl, {
                                      size: 18,
                                    }),
                                    " Open Source Code Editor",
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                ],
              }),
              e.jsxs("footer", {
                className: "p-6 border-t border-slate-100 bg-white flex justify-between items-center px-12 shrink-0",
                children: [
                  e.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      e.jsx("div", {
                        className: "w-2 h-2 bg-green-500 rounded-full",
                      }),
                      e.jsx("span", {
                        className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest",
                        children: "Workflow Ready",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "flex gap-4",
                    children: [
                      e.jsx("button", {
                        type: "button",
                        onClick: j,
                        disabled: !H || T.saving,
                        className:
                          "px-6 py-2.5 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors disabled:opacity-50",
                        children: "Discard",
                      }),
                      e.jsxs("button", {
                        type: "button",
                        onClick: le,
                        disabled: T.saving || !H,
                        className:
                          "flex items-center gap-2 px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-60",
                        children: [
                          e.jsx(bn, {
                            size: 18,
                          }),
                          " ",
                          T.saving ? "Saving…" : "Save & Deploy Template",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          S &&
            e.jsx("div", {
              className:
                "fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-200",
              children: e.jsxs("div", {
                className:
                  "bg-[#0f172a] rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden border border-slate-800/50 animate-in zoom-in-95",
                children: [
                  e.jsxs("div", {
                    className: "px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50",
                    children: [
                      e.jsxs("div", {
                        className: "flex items-center gap-4",
                        children: [
                          e.jsx("div", {
                            className: "bg-indigo-500/10 p-2 rounded-xl text-indigo-400",
                            children: e.jsx(Dl, {
                              size: 20,
                            }),
                          }),
                          e.jsxs("div", {
                            children: [
                              e.jsx("h4", {
                                className: "text-white font-bold",
                                children: "HTML Code Editor",
                              }),
                              e.jsx("p", {
                                className: "text-[10px] text-slate-500 font-bold uppercase tracking-widest",
                                children: N == null ? void 0 : N.name,
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsx("button", {
                        type: "button",
                        onClick: () => y(!1),
                        className: "p-3 bg-white/5 text-slate-400 hover:text-white rounded-full transition-all",
                        "aria-label": "Close",
                        children: e.jsx(_t, {
                          size: 24,
                        }),
                      }),
                    ],
                  }),
                  e.jsx("textarea", {
                    value: (N == null ? void 0 : N.content) || "",
                    onChange: (O) =>
                      W({
                        content: O.target.value,
                      }),
                    className:
                      "flex-1 bg-transparent p-10 text-indigo-300 font-mono text-sm leading-relaxed outline-none resize-none",
                    spellCheck: "false",
                  }),
                  e.jsxs("div", {
                    className: "p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50",
                    children: [
                      e.jsx("button", {
                        type: "button",
                        onClick: () => y(!1),
                        className: "px-8 py-3 text-slate-400 font-bold text-sm",
                        children: "Cancel",
                      }),
                      e.jsx("button", {
                        type: "button",
                        onClick: () => y(!1),
                        className:
                          "px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95",
                        children: "Apply Changes",
                      }),
                    ],
                  }),
                ],
              }),
            }),
          P &&
            e.jsx("div", {
              className:
                "fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200",
              children: e.jsxs("div", {
                className:
                  "bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl h-full flex flex-col overflow-hidden animate-in zoom-in-95",
                children: [
                  e.jsxs("div", {
                    className: "px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50",
                    children: [
                      e.jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                          e.jsx(Rt, {
                            className: "text-indigo-600",
                            size: 20,
                          }),
                          e.jsx("h4", {
                            className: "font-bold text-slate-800 text-lg",
                            children: "Render Preview",
                          }),
                        ],
                      }),
                      e.jsx("button", {
                        type: "button",
                        onClick: () => M(null),
                        className: "p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400",
                        "aria-label": "Close",
                        children: e.jsx(_t, {
                          size: 24,
                        }),
                      }),
                    ],
                  }),
                  e.jsx("div", {
                    className: "flex-1 bg-slate-100 p-8 overflow-y-auto",
                    children: e.jsxs("div", {
                      className: "max-w-[600px] mx-auto bg-white shadow-2xl rounded-2xl min-h-full overflow-hidden",
                      children: [
                        e.jsxs("div", {
                          className:
                            "p-4 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-mono flex justify-between",
                          children: [
                            e.jsxs("span", {
                              children: ["Subject: ", (P.subject || "").substring(0, 50), "..."],
                            }),
                            e.jsxs("div", {
                              className: "flex gap-2",
                              children: [
                                e.jsx(Bl, {
                                  size: 10,
                                }),
                                " ",
                                e.jsx(od, {
                                  size: 10,
                                }),
                              ],
                            }),
                          ],
                        }),
                        e.jsx("div", {
                          className: "p-1",
                          dangerouslySetInnerHTML: {
                            __html: ie(P),
                          },
                        }),
                      ],
                    }),
                  }),
                  e.jsx("div", {
                    className: "p-6 border-t border-slate-100 flex justify-center",
                    children: e.jsx("button", {
                      type: "button",
                      onClick: () => M(null),
                      className: "px-10 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm",
                      children: "Close Preview",
                    }),
                  }),
                ],
              }),
            }),
        ],
      }),
    ],
  });
}
