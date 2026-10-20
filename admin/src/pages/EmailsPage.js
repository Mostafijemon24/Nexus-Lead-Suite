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
import { ModalShell, PageFrame, StickyFooter, SuccessModal } from "../shared/common.js";

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
  return e.jsxs(PageFrame, {
    title: "Email Automation Builder",
    subtitle: "Manage dynamic email triggers and contents",
    icon: e.jsx(qt, { size: 20 }),
    headerRight: e.jsxs("button", {
      type: "button",
      onClick: I,
      className: "nls-btn nls-btn--primary",
      children: [e.jsx(dt, { size: 16, "aria-hidden": "true" }), " Create New Template"],
    }),
    footer: e.jsx(StickyFooter, {
      status: "Ready",
      actions: e.jsxs(e.Fragment, {
        children: [
          e.jsx("button", {
            type: "button",
            onClick: j,
            disabled: !H || T.saving,
            className: "nls-btn nls-btn--ghost",
            children: "Discard",
          }),
          e.jsxs("button", {
            type: "button",
            onClick: le,
            disabled: T.saving || !H,
            className: "nls-btn nls-btn--primary",
            children: [
              e.jsx(bn, { size: 16, "aria-hidden": "true" }),
              " ",
              T.saving ? "Saving…" : "Save & Deploy Template",
            ],
          }),
        ],
      }),
    }),
    children: [
      e.jsx(SuccessModal, {
        open: V,
        message: "Your settings have been successfully updated. All changes are now live.",
        onDismiss: () => z(!1),
      }),
      e.jsxs("div", {
        className: "nls-split",
        children: [
          e.jsxs("aside", {
            className: "nls-split__aside nls-card",
            children: [
              e.jsxs("div", {
                className: "nls-split__aside-head",
                children: [
                  e.jsx("h2", { className: "nls-split__aside-title", children: "Template Layers" }),
                  e.jsx(Wl, { size: 14, "aria-hidden": "true", className: "nls-muted" }),
                ],
              }),
              e.jsxs("div", {
                className: "nls-split__aside-body",
                children: [
                  T.loading
                    ? e.jsxs("div", {
                        className: "nls-loading",
                        children: [e.jsx("span", { className: "nls-spinner", "aria-hidden": "true" }), "Loading…"],
                      })
                    : null,
                  a.map((O) => {
                    const te = O.id === d;
                    return e.jsxs(
                      "div",
                      {
                        onClick: () => u(O.id),
                        className: ["nls-list-row", te ? "is-active" : ""].filter(Boolean).join(" "),
                        children: [
                          e.jsxs("button", {
                            type: "button",
                            className: "nls-list-row__main nls-em-row-select",
                            "aria-current": te ? "true" : void 0,
                            children: [
                              e.jsx(qt, { size: 16, "aria-hidden": "true" }),
                              e.jsx("span", { className: "nls-list-row__title", children: O.name }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "nls-list-row__actions",
                            onClick: (pe) => pe.stopPropagation(),
                            children: [
                              e.jsx("button", {
                                type: "button",
                                onClick: () => M(O),
                                className: "nls-icon-btn nls-icon-btn--sm nls-icon-btn--primary",
                                "aria-label": "Preview",
                                children: e.jsx(Rt, { size: 14 }),
                              }),
                              e.jsx("button", {
                                type: "button",
                                onClick: () => C(O.id),
                                className: "nls-icon-btn nls-icon-btn--sm nls-icon-btn--danger",
                                "aria-label": "Delete",
                                children: e.jsx(yt, { size: 14 }),
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
          e.jsxs("div", {
            className: "nls-split__main nls-stack nls-stack--tight",
            children: [
              T.error
                ? e.jsx("div", { className: "nls-notice nls-notice--danger", role: "alert", children: T.error })
                : null,
              e.jsx("div", {
                className: "nls-card",
                children: e.jsxs("div", {
                  className: "nls-card__body nls-stack nls-stack--tight",
                  children: [
                    e.jsxs("div", {
                      className: "nls-em-name-row",
                      children: [
                        e.jsxs("div", {
                          className: "nls-field",
                          children: [
                            e.jsx("label", {
                              className: "nls-field__label",
                              htmlFor: "nexulesuite_em-name",
                              children: "Template Name",
                            }),
                            e.jsx("input", {
                              id: "nexulesuite_em-name",
                              type: "text",
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
                          className: "nls-em-uuid",
                          children: [
                            e.jsx(Ul, { size: 14, "aria-hidden": "true" }),
                            e.jsxs("span", {
                              className: "nls-em-uuid__text",
                              children: ["# ", ((N == null ? void 0 : N.uuid) || "").substring(0, 18), "..."],
                            }),
                            e.jsx("button", {
                              type: "button",
                              onClick: () => {
                                (jx((N == null ? void 0 : N.uuid) || ""), f(!0), setTimeout(() => f(!1), 1800));
                              },
                              className: ["nls-icon-btn nls-icon-btn--sm nls-em-uuid__copy", x ? "is-success" : ""]
                                .filter(Boolean)
                                .join(" "),
                              "aria-label": "Copy UUID",
                              children: x
                                ? e.jsx(Lt, { size: 14, className: "nls-em-uuid__copied" })
                                : e.jsx($s, { size: 14 }),
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "nls-section",
                      children: [
                        e.jsxs("div", {
                          className: "nls-section__head nls-em-sec-head",
                          children: [
                            e.jsx("span", {
                              className: "nls-section__ico",
                              "aria-hidden": "true",
                              children: e.jsx(hd, { size: 16 }),
                            }),
                            e.jsx("label", {
                              className: "nls-section__title",
                              htmlFor: "nexulesuite_em-recipient-input",
                              children: "Recipients Management",
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "nls-em-recipients",
                          children: [
                            e.jsxs("div", {
                              className: "nls-em-recipients__inner",
                              children: [
                                ((N == null ? void 0 : N.recipients) || []).map((O, te) =>
                                  e.jsxs(
                                    "span",
                                    {
                                      className: "nls-em-chip",
                                      children: [
                                        e.jsx("span", { className: "nls-em-chip__text", children: O }),
                                        e.jsx("button", {
                                          type: "button",
                                          onClick: () =>
                                            W({
                                              recipients: N.recipients.filter((pe, me) => me !== te),
                                            }),
                                          className: "nls-em-chip__remove",
                                          "aria-label": "Remove recipient",
                                          children: e.jsx(_t, { size: 12 }),
                                        }),
                                      ],
                                    },
                                    `${O}-${te}`,
                                  ),
                                ),
                                e.jsx("input", {
                                  id: "nexulesuite_em-recipient-input",
                                  type: "text",
                                  value: p,
                                  onChange: (O) => h(O.target.value),
                                  onKeyDown: J,
                                  placeholder: "Enter email address...",
                                  className: "nls-em-recipients__input",
                                }),
                              ],
                            }),
                            e.jsx("span", {
                              className: "nls-em-recipients__mail",
                              "aria-hidden": "true",
                              children: e.jsx(qt, { size: 16 }),
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "nls-section",
                      children: [
                        e.jsxs("div", {
                          className: "nls-section__head nls-em-sec-head",
                          children: [
                            e.jsx("span", {
                              className: "nls-section__ico",
                              "aria-hidden": "true",
                              children: e.jsx(ud, { size: 16 }),
                            }),
                            e.jsx("label", {
                              className: "nls-section__title",
                              htmlFor: "nexulesuite_em-subject",
                              children: "Email Subject Line",
                            }),
                          ],
                        }),
                        e.jsx("input", {
                          id: "nexulesuite_em-subject",
                          type: "text",
                          value: (N == null ? void 0 : N.subject) || "",
                          onChange: (O) =>
                            W({
                              subject: O.target.value,
                            }),
                          placeholder: "Enter Subject...",
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              e.jsxs("div", {
                className: "nls-card",
                children: [
                  e.jsx("div", {
                    className: "nls-card__header",
                    children: e.jsxs("div", {
                      className: "min-w-0",
                      children: [
                        e.jsxs("h3", {
                          className: "nls-card__title",
                          children: [e.jsx(Gn, { size: 18, "aria-hidden": "true" }), "Data Injection Library"],
                        }),
                        e.jsx("p", { className: "nls-card__desc", children: "Click tag to auto-insert into subject" }),
                      ],
                    }),
                  }),
                  e.jsx("div", {
                    className: "nls-card__body",
                    children: e.jsx("div", {
                      className: "nls-em-tags",
                      children: kx.map((O) =>
                        e.jsxs(
                          "button",
                          {
                            type: "button",
                            onClick: () =>
                              W({
                                subject: ((N == null ? void 0 : N.subject) || "") + O.val,
                              }),
                            className: "nls-btn nls-btn--secondary nls-btn--sm",
                            children: [
                              e.jsx(O.Icon, { size: 14, "aria-hidden": "true" }),
                              e.jsx("span", { children: O.label }),
                              e.jsx("code", { className: "nls-code", children: O.val }),
                            ],
                          },
                          O.val,
                        ),
                      ),
                    }),
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "nls-card nls-card--soft nls-em-html",
                children: [
                  e.jsx("div", {
                    className: "nls-em-html__ico",
                    "aria-hidden": "true",
                    children: e.jsx(Dl, { size: 24 }),
                  }),
                  e.jsxs("div", {
                    className: "nls-em-html__copy",
                    children: [
                      e.jsx("h3", { className: "nls-section__title", children: "HTML Source Controller" }),
                      e.jsx("p", {
                        className: "nls-section__desc",
                        children: "Manage the visual structure and dynamic content mapping here.",
                      }),
                    ],
                  }),
                  e.jsxs("button", {
                    type: "button",
                    onClick: () => y(!0),
                    className: "nls-btn nls-btn--secondary",
                    children: [e.jsx(Dl, { size: 16, "aria-hidden": "true" }), " Open Source Code Editor"],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsxs(ModalShell, {
        open: S,
        onClose: () => y(!1),
        size: "xl",
        labelledBy: "nexulesuite_em-code-title",
        className: "nls-em-code-panel",
        children: [
          e.jsxs("div", {
            className: "nls-modal__header",
            children: [
              e.jsxs("div", {
                className: "min-w-0",
                children: [
                  e.jsx("h2", {
                    id: "nexulesuite_em-code-title",
                    className: "nls-modal__title",
                    children: "HTML Code Editor",
                  }),
                  e.jsx("p", { className: "nls-modal__desc truncate", children: N == null ? void 0 : N.name }),
                ],
              }),
              e.jsx("button", {
                type: "button",
                onClick: () => y(!1),
                className: "nls-icon-btn",
                "aria-label": "Close",
                children: e.jsx(_t, { size: 18 }),
              }),
            ],
          }),
          e.jsxs("div", {
            className: "nls-modal__body nls-em-code-body",
            children: [
              e.jsx("label", { htmlFor: "nexulesuite_em-code", className: "sr-only", children: "HTML source" }),
              e.jsx("textarea", {
                id: "nexulesuite_em-code",
                value: (N == null ? void 0 : N.content) || "",
                onChange: (O) =>
                  W({
                    content: O.target.value,
                  }),
                className: "nls-mono nls-em-code",
                spellCheck: "false",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "nls-modal__footer",
            children: [
              e.jsx("button", {
                type: "button",
                onClick: () => y(!1),
                className: "nls-btn nls-btn--ghost",
                children: "Cancel",
              }),
              e.jsx("button", {
                type: "button",
                onClick: () => y(!1),
                className: "nls-btn nls-btn--primary",
                children: "Apply Changes",
              }),
            ],
          }),
        ],
      }),
      e.jsx(ModalShell, {
        open: !!P,
        onClose: () => M(null),
        size: "lg",
        labelledBy: "nexulesuite_em-preview-title",
        className: "nls-em-preview-panel",
        children: P
          ? e.jsxs(e.Fragment, {
              children: [
                e.jsxs("div", {
                  className: "nls-modal__header",
                  children: [
                    e.jsxs("h2", {
                      id: "nexulesuite_em-preview-title",
                      className: "nls-modal__title nls-row",
                      children: [
                        e.jsx(Rt, { size: 18, "aria-hidden": "true", className: "nls-em-title-ico" }),
                        "Render Preview",
                      ],
                    }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => M(null),
                      className: "nls-icon-btn",
                      "aria-label": "Close",
                      children: e.jsx(_t, { size: 18 }),
                    }),
                  ],
                }),
                e.jsx("div", {
                  className: "nls-modal__body nls-em-preview-body",
                  children: e.jsxs("div", {
                    className: "nls-card nls-card--soft nls-em-preview",
                    children: [
                      e.jsxs("div", {
                        className: "nls-em-preview__meta",
                        children: [
                          e.jsxs("span", {
                            className: "nls-mono truncate",
                            children: ["Subject: ", (P.subject || "").substring(0, 50), "..."],
                          }),
                          e.jsxs("span", {
                            className: "nls-em-preview__devices",
                            "aria-hidden": "true",
                            children: [e.jsx(Bl, { size: 14 }), " ", e.jsx(od, { size: 14 })],
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "nls-em-preview__frame",
                        dangerouslySetInnerHTML: {
                          __html: ie(P),
                        },
                      }),
                    ],
                  }),
                }),
                e.jsx("div", {
                  className: "nls-modal__footer",
                  children: e.jsx("button", {
                    type: "button",
                    onClick: () => M(null),
                    className: "nls-btn nls-btn--secondary",
                    children: "Close Preview",
                  }),
                }),
              ],
            })
          : null,
      }),
    ],
  });
}
