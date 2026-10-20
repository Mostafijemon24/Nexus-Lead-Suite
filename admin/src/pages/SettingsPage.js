import * as e from "react/jsx-runtime";
import {
  Bot as Gs,
  Check as Lt,
  CodeXml as Zc,
  Copy as $s,
  Database as Gn,
  Download as Ol,
  FileX as um,
  Globe as Bl,
  Image as Hl,
  Info as Ys,
  Layers as Wl,
  Link as wi,
  LoaderCircle as Qn,
  Lock as ki,
  Mail as qt,
  MousePointer2 as sd,
  PanelsTopLeft as Si,
  Plus as dt,
  RefreshCw as ad,
  Save as bn,
  Send as rd,
  Server as Ia,
  Settings as id,
  ShieldCheck as Ci,
  Sparkles as Ra,
  Trash2 as yt,
  TriangleAlert as Ss,
  Type as pd,
  Upload as Vl,
  User as Fa,
  WandSparkles as md,
  X as _t,
  Zap as Ei,
} from "lucide-react";
import * as b from "react";
import {
  ColorField,
  ErrorModal,
  ICON_OPTIONS,
  ModalShell,
  PageFrame,
  StickyFooter,
  SuccessModal,
  getAdminConfig,
  jn,
  nlsFabPreview,
  nlsRange,
  settingsFetch,
  useGoogleFontLink,
  wpFetch,
} from "../shared/common.js";

function Tooltip({ text: a, label: o = "More information" }) {
  return e.jsxs("button", {
    type: "button",
    className: "nls-tip",
    "aria-label": o,
    children: [
      e.jsx(Ys, {
        size: 13,
        "aria-hidden": "true",
      }),
      e.jsx("span", {
        className: "nls-tip__bubble",
        role: "tooltip",
        children: a,
      }),
    ],
  });
}
function ConfirmModal({ open: a, onCancel: o, onConfirm: i, title: d, description: u }) {
  const p = d || "Reset to defaults?",
    h =
      u ||
      "This clears the current editor and restores this page to its default values. Nothing is saved to the server until you click Save.";
  return e.jsx(ModalShell, {
    open: a,
    onClose: o,
    labelledBy: "nexulesuite_settings-confirm-title",
    children: e.jsxs("div", {
      className: "nls-dialog",
      children: [
        e.jsx("div", {
          className: "nls-dialog__icon nls-dialog__icon--warning",
          "aria-hidden": "true",
          children: e.jsx(Ss, {
            size: 22,
          }),
        }),
        e.jsx("h3", {
          id: "nexulesuite_settings-confirm-title",
          className: "nls-dialog__title",
          children: p,
        }),
        e.jsx("p", {
          className: "nls-dialog__message",
          children: h,
        }),
        e.jsxs("div", {
          className: "nls-dialog__actions",
          children: [
            e.jsx("button", {
              type: "button",
              onClick: o,
              className: "nls-btn nls-btn--ghost",
              children: "Cancel",
            }),
            e.jsx("button", {
              type: "button",
              onClick: i,
              className: "nls-btn nls-btn--danger-solid",
              children: "Yes, Discard",
            }),
          ],
        }),
      ],
    }),
  });
}
function IconSelect({ value: a, onChange: o, className: i = "" }) {
  return e.jsx("select", {
    value: a || "",
    onChange: (d) => o(d.target.value),
    className: i,
    "aria-label": "Icon",
    children: ICON_OPTIONS.map((d) =>
      e.jsx(
        "option",
        {
          value: d.key,
          children: d.label,
        },
        d.key,
      ),
    ),
  });
}
function ToggleSwitch({ checked: a, onChange: o, label: i, hint: d }) {
  return e.jsxs("label", {
    className: "nls-toggle-card nls-set-toggle",
    children: [
      e.jsxs("span", {
        className: "nls-toggle-card__body",
        children: [
          e.jsx("span", {
            className: "nls-toggle-card__title",
            children: i,
          }),
          d
            ? e.jsx("span", {
                className: "nls-toggle-card__hint",
                children: d,
              })
            : null,
        ],
      }),
      e.jsx("button", {
        type: "button",
        role: "switch",
        "aria-checked": !!a,
        onClick: () => o(!a),
        className: "nls-switch",
      }),
    ],
  });
}
function FollowUpRow({ value: a, onChange: o, onRemove: i }) {
  return e.jsxs("div", {
    className: "nls-card nls-set-followup",
    children: [
      e.jsxs("div", {
        className: "nls-set-row",
        children: [
          e.jsx("input", {
            type: "text",
            value: a.label,
            onChange: (d) =>
              o({
                ...a,
                label: d.target.value,
              }),
            placeholder: "Follow-up button label (e.g. PPO plans)",
            maxLength: 120,
            className: "nls-set-grow",
          }),
          e.jsx("button", {
            type: "button",
            onClick: i,
            className: "nls-icon-btn nls-icon-btn--danger",
            "aria-label": "Remove follow-up button",
            children: e.jsx(yt, {
              size: 16,
            }),
          }),
        ],
      }),
      e.jsx("textarea", {
        value: a.answer,
        onChange: (d) =>
          o({
            ...a,
            answer: d.target.value,
          }),
        placeholder: "Answer shown when this button is tapped",
        rows: 2,
        maxLength: 2e3,
        className: "nls-set-textarea-sm",
      }),
    ],
  });
}
function QuickReplyItem({ item: a, index: o, onChange: i, onRemove: d }) {
  const u = (f) =>
      i({
        ...a,
        ...f,
      }),
    p = (f, S) => {
      const y = a.followups.slice();
      ((y[f] = S),
        u({
          followups: y,
        }));
    },
    h = () =>
      u({
        followups: [
          ...a.followups,
          {
            label: "",
            answer: "",
          },
        ],
      }),
    x = (f) =>
      u({
        followups: a.followups.filter((S, y) => y !== f),
      });
  return e.jsx("div", {
    className: "nls-card",
    children: e.jsxs("div", {
      className: "nls-card__body nls-stack nls-stack--tight",
      children: [
        e.jsxs("div", {
          className: "nls-set-row nls-set-row--wrap",
          children: [
            e.jsx("span", {
              className: "nls-badge nls-badge--primary nls-set-num",
              children: o + 1,
            }),
            e.jsx("input", {
              type: "text",
              value: a.label,
              onChange: (f) =>
                u({
                  label: f.target.value,
                }),
              placeholder: "Button label (e.g. Do you accept my insurance?)",
              maxLength: 120,
              className: "nls-set-grow min-w-[12rem]",
            }),
            e.jsx(IconSelect, {
              value: a.icon,
              onChange: (f) =>
                u({
                  icon: f,
                }),
              className: "nls-set-iconsel",
            }),
            e.jsx("button", {
              type: "button",
              onClick: d,
              className: "nls-icon-btn nls-icon-btn--danger",
              "aria-label": "Delete quick-reply button",
              children: e.jsx(yt, {
                size: 16,
              }),
            }),
          ],
        }),
        e.jsx("textarea", {
          value: a.answer,
          onChange: (f) =>
            u({
              answer: f.target.value,
            }),
          placeholder: "Answer shown when this button is tapped",
          rows: 2,
          maxLength: 2e3,
          className: "nls-set-textarea-sm",
        }),
        e.jsxs("div", {
          className: "nls-set-followups",
          children: [
            e.jsx("div", {
              className: "nls-eyebrow",
              children: "Conditional follow-up buttons",
            }),
            e.jsx("div", {
              className: "nls-set-followup-list",
              children: a.followups.map((f, S) =>
                e.jsx(
                  FollowUpRow,
                  {
                    value: f,
                    onChange: (y) => p(S, y),
                    onRemove: () => x(S),
                  },
                  S,
                ),
              ),
            }),
            e.jsxs("button", {
              type: "button",
              onClick: h,
              className: "nls-btn nls-btn--dashed nls-btn--sm",
              children: [
                e.jsx(dt, {
                  size: 14,
                }),
                " Add follow-up",
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function QuickActionRow({ value: a, index: o, onChange: i, onRemove: d }) {
  const u = (p) =>
    i({
      ...a,
      ...p,
    });
  return e.jsxs("div", {
    className: "nls-card nls-card--soft nls-set-row nls-set-row--wrap nls-set-action",
    children: [
      e.jsx("span", {
        className: "nls-badge nls-set-num",
        children: o + 1,
      }),
      e.jsx("input", {
        type: "text",
        value: a.label,
        onChange: (p) =>
          u({
            label: p.target.value,
          }),
        placeholder: "Button (e.g. Book a visit)",
        maxLength: 60,
        className: "nls-set-grow min-w-[9rem]",
      }),
      e.jsx(IconSelect, {
        value: a.icon,
        onChange: (p) =>
          u({
            icon: p,
          }),
        className: "nls-set-iconsel",
      }),
      e.jsx("input", {
        type: "text",
        value: a.url,
        onChange: (p) =>
          u({
            url: p.target.value,
          }),
        placeholder: 'Link (tel:713…, https://…, #form, or paste a form shortcode like [nexulesuite_form id="5"])',
        className: "nls-set-grow min-w-[11rem]",
      }),
      e.jsx("button", {
        type: "button",
        onClick: d,
        className: "nls-icon-btn nls-icon-btn--danger",
        "aria-label": "Delete action button",
        children: e.jsx(yt, {
          size: 16,
        }),
      }),
    ],
  });
}
function AiFaqPage() {
  const { restUrl: a, nonce: o } = getAdminConfig(),
    [i, d] = b.useState(!0),
    [u, p] = b.useState(!1),
    [h, x] = b.useState(!1),
    [f, S] = b.useState(!1),
    [y, P] = b.useState(!1),
    [M, T] = b.useState([]),
    [F, V] = b.useState([]),
    [z, U] = b.useState(""),
    [w, N] = b.useState(""),
    [H, W] = b.useState(!1),
    [I, C] = b.useState(""),
    [J, j] = b.useState(""),
    [le, ie] = b.useState(!0),
    [O, te] = b.useState(!1),
    [pe, me] = b.useState(""),
    [B, ee] = b.useState(""),
    [_, X] = b.useState("");
  b.useEffect(() => {
    (async () => {
      try {
        const xe = await (
          await fetch(`${a}${jn}/ai/faq`, {
            headers: {
              "X-WP-Nonce": o,
            },
          })
        ).json();
        xe &&
          xe.success &&
          (S(!!xe.data.enabled),
          P(!!xe.data.logChats),
          T(
            (xe.data.items || []).map((ve) => ({
              ...ve,
              icon: ve.icon || "",
              followups: ve.followups || [],
            })),
          ),
          V(
            (xe.data.actions || []).map((ve) => ({
              label: ve.label || "",
              icon: ve.icon || "",
              url: ve.url || "",
            })),
          ),
          U(xe.data.disclaimer || ""),
          N(xe.data.triggerLabel || ""),
          W(!!xe.data.leadEnabled),
          C(xe.data.leadOffer || ""),
          j(xe.data.leadRecipient || ""),
          ie(xe.data.wooCards !== !1),
          te(!!xe.data.wooActive),
          me(xe.data.extraUrls || ""),
          ee(xe.data.contactShortcode || ""),
          X(xe.data.examples || ""));
      } catch {
      } finally {
        d(!1);
      }
    })();
  }, [a, o]);
  const L = () =>
      T([
        ...M,
        {
          id: "",
          label: "",
          answer: "",
          icon: "",
          followups: [],
        },
      ]),
    A = (oe, xe) => {
      const ve = M.slice();
      ((ve[oe] = xe), T(ve));
    },
    k = (oe) => T(M.filter((xe, ve) => ve !== oe)),
    Z = () =>
      V([
        ...F,
        {
          label: "",
          icon: "",
          url: "",
        },
      ]),
    ue = (oe, xe) => {
      const ve = F.slice();
      ((ve[oe] = xe), V(ve));
    },
    Q = (oe) => V(F.filter((xe, ve) => ve !== oe)),
    he = async () => {
      (p(!0), x(!1));
      try {
        const xe = await (
          await fetch(`${a}${jn}/ai/faq`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-WP-Nonce": o,
            },
            body: JSON.stringify({
              enabled: f,
              logChats: y,
              items: M,
              actions: F,
              disclaimer: z,
              triggerLabel: w,
              leadEnabled: H,
              leadOffer: I,
              leadRecipient: J,
              wooCards: le,
              extraUrls: pe,
              contactShortcode: B,
              examples: _,
            }),
          })
        ).json();
        xe && xe.success
          ? (T(
              (xe.data.items || []).map((ve) => ({
                ...ve,
                icon: ve.icon || "",
                followups: ve.followups || [],
              })),
            ),
            V(
              (xe.data.actions || []).map((ve) => ({
                label: ve.label || "",
                icon: ve.icon || "",
                url: ve.url || "",
              })),
            ),
            typeof xe.data.disclaimer == "string" && U(xe.data.disclaimer),
            typeof xe.data.triggerLabel == "string" && N(xe.data.triggerLabel),
            typeof xe.data.examples == "string" && X(xe.data.examples),
            typeof xe.data.extraUrls == "string" && me(xe.data.extraUrls),
            typeof xe.data.contactShortcode == "string" && ee(xe.data.contactShortcode),
            xe.data.wooCards != null && ie(xe.data.wooCards !== !1),
            x(!0),
            setTimeout(() => x(!1), 2500))
          : alert(
              (xe && xe.message) || "Could not save FAQ & Buttons. Unlock the plugin (password gate) and try again.",
            );
      } catch {
        alert("Could not save FAQ & Buttons. Reload the page and try again.");
      } finally {
        p(!1);
      }
    };
  return i
    ? e.jsxs("div", {
        className: "nls-loading",
        children: [
          e.jsx("span", {
            className: "nls-spinner",
            "aria-hidden": "true",
          }),
          "Loading…",
        ],
      })
    : e.jsxs("div", {
        className: "nls-stack",
        children: [
          e.jsxs("div", {
            className: "nls-grid-2",
            children: [
              e.jsx(ToggleSwitch, {
                checked: y,
                onChange: P,
                label: "Store chat transcripts",
                hint: "Save visitor↔assistant conversations so they appear in the Reports tab. On a medical site, add a consent notice first.",
              }),
              e.jsx(ToggleSwitch, {
                checked: f,
                onChange: S,
                label: "Show quick-reply buttons",
                hint: "Display the buttons below at the top of the AI chat. Requires the AI Chatbot to be enabled in Settings.",
              }),
            ],
          }),
          e.jsx("div", {
            className: "nls-stack nls-stack--tight",
            children:
              M.length === 0
                ? e.jsx("div", {
                    className: "nls-empty",
                    children: e.jsx("p", {
                      className: "nls-empty__desc",
                      children: "No buttons yet. Add your first quick-reply question below.",
                    }),
                  })
                : M.map((oe, xe) =>
                    e.jsx(
                      QuickReplyItem,
                      {
                        item: oe,
                        index: xe,
                        onChange: (ve) => A(xe, ve),
                        onRemove: () => k(xe),
                      },
                      xe,
                    ),
                  ),
          }),
          e.jsx("div", {
            className: "nls-row",
            children: e.jsxs("button", {
              type: "button",
              onClick: L,
              className: "nls-btn nls-btn--dashed",
              children: [
                e.jsx(dt, {
                  size: 16,
                }),
                " Add quick-reply button",
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
                    e.jsx("h3", {
                      className: "nls-card__title",
                      children: "Quick-action buttons",
                    }),
                    e.jsxs("p", {
                      className: "nls-card__desc",
                      children: [
                        "Shown under the suggestions (like “Book a visit / Call / Directions”). The first button is highlighted. Link can be ",
                        e.jsx("span", {
                          className: "nls-code",
                          children: "tel:713…",
                        }),
                        ", ",
                        e.jsx("span", {
                          className: "nls-code",
                          children: "https://…",
                        }),
                        ". Links: ",
                        e.jsx("span", {
                          className: "nls-code",
                          children: "#lead",
                        }),
                        " (built-in contact form), ",
                        e.jsx("span", {
                          className: "nls-code",
                          children: "#form",
                        }),
                        " (the single shortcode below), or ",
                        e.jsx("span", {
                          className: "nls-code",
                          children: "tel:",
                        }),
                        " / ",
                        e.jsx("span", {
                          className: "nls-code",
                          children: "mailto:",
                        }),
                        " / ",
                        e.jsx("span", {
                          className: "nls-code",
                          children: "https://",
                        }),
                        ". To open a specific form inside the chat, paste its shortcode straight into the link box — e.g. ",
                        e.jsx("span", {
                          className: "nls-code",
                          children: '[nexulesuite_form id="5"]',
                        }),
                        ". Each button can open a different form this way.",
                      ],
                    }),
                  ],
                }),
              }),
              e.jsxs("div", {
                className: "nls-card__body nls-stack nls-stack--tight",
                children: [
                  e.jsx("div", {
                    className: "nls-set-followup-list",
                    children: F.map((oe, xe) =>
                      e.jsx(
                        QuickActionRow,
                        {
                          value: oe,
                          index: xe,
                          onChange: (ve) => ue(xe, ve),
                          onRemove: () => Q(xe),
                        },
                        xe,
                      ),
                    ),
                  }),
                  e.jsx("div", {
                    className: "nls-row",
                    children: e.jsxs("button", {
                      type: "button",
                      onClick: Z,
                      className: "nls-btn nls-btn--dashed nls-btn--sm",
                      children: [
                        e.jsx(dt, {
                          size: 14,
                        }),
                        " Add action button",
                      ],
                    }),
                  }),
                ],
              }),
            ],
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
                      children: [
                        "Contact form for “Get in Touch” (",
                        e.jsx("span", {
                          className: "nls-code",
                          children: "#form",
                        }),
                        ")",
                      ],
                    }),
                    e.jsxs("p", {
                      className: "nls-card__desc",
                      children: [
                        "Paste any form shortcode — your Form Builder form ",
                        e.jsx("span", {
                          className: "nls-code",
                          children: '[nexulesuite_form id="…"]',
                        }),
                        ", Contact Form 7, WPForms, Fluent Forms, etc. An action button with link ",
                        e.jsx("span", {
                          className: "nls-code",
                          children: "#form",
                        }),
                        " opens it right inside the chat. Leave blank and use ",
                        e.jsx("span", {
                          className: "nls-code",
                          children: "#lead",
                        }),
                        " for the built-in name/email/phone form instead.",
                      ],
                    }),
                  ],
                }),
              }),
              e.jsx("div", {
                className: "nls-card__body",
                children: e.jsx("input", {
                  type: "text",
                  value: B,
                  onChange: (oe) => ee(oe.target.value),
                  placeholder: '[nexulesuite_form id="123"]',
                  className: "nls-mono",
                }),
              }),
            ],
          }),
          e.jsxs("div", {
            className: "nls-card",
            children: [
              e.jsx("div", {
                className: "nls-card__header",
                children: e.jsxs("div", {
                  className: "min-w-0",
                  children: [
                    e.jsx("h3", {
                      className: "nls-card__title",
                      children: "Response examples (few-shot)",
                    }),
                    e.jsxs("p", {
                      className: "nls-card__desc",
                      children: [
                        "Teach the AI your tone and how short/precise to answer. A built-in universal set (greetings, thanks, pricing, booking, handoff…) is always active — add your own business examples here to make replies more on-brand. Format: ",
                        e.jsx("span", {
                          className: "nls-code",
                          children: "User:",
                        }),
                        " / ",
                        e.jsx("span", {
                          className: "nls-code",
                          children: "Assistant:",
                        }),
                        " blocks separated by ",
                        e.jsx("span", {
                          className: "nls-code",
                          children: "---",
                        }),
                        ".",
                      ],
                    }),
                  ],
                }),
              }),
              e.jsx("div", {
                className: "nls-card__body",
                children: e.jsx("textarea", {
                  value: _,
                  onChange: (oe) => X(oe.target.value),
                  rows: 8,
                  placeholder: `User: Do you deliver on weekends?
Assistant: Yes — we deliver Saturday and Sunday, 9 AM–5 PM.
---
User: Where are you located?
Assistant: We're at 12 Main Street, Dhaka. Would you like directions?`,
                  className: "nls-mono",
                }),
              }),
            ],
          }),
          e.jsx("div", {
            className: "nls-card",
            children: e.jsxs("div", {
              className: "nls-card__body nls-grid-2",
              children: [
                e.jsxs("label", {
                  className: "nls-field",
                  children: [
                    e.jsx("span", {
                      className: "nls-field__label",
                      children: "Footer disclaimer",
                    }),
                    e.jsx("span", {
                      className: "nls-field__hint",
                      children:
                        "Small print under the chat input (e.g. “Not medical advice. For emergencies call 911.”).",
                    }),
                    e.jsx("textarea", {
                      value: z,
                      onChange: (oe) => U(oe.target.value),
                      rows: 2,
                      maxLength: 300,
                      placeholder: "Not medical advice. For emergencies call 911.",
                      className: "nls-set-textarea-sm mt-auto",
                    }),
                  ],
                }),
                e.jsxs("label", {
                  className: "nls-field",
                  children: [
                    e.jsx("span", {
                      className: "nls-field__label",
                      children: "Launcher label",
                    }),
                    e.jsx("span", {
                      className: "nls-field__hint",
                      children: "Text shown on the floating bubble (e.g. “Ask us”). Leave blank for icon-only.",
                    }),
                    e.jsx("input", {
                      type: "text",
                      value: w,
                      onChange: (oe) => N(oe.target.value),
                      maxLength: 40,
                      placeholder: "Ask us",
                      className: "mt-auto",
                    }),
                  ],
                }),
              ],
            }),
          }),
          e.jsx("div", {
            className: "nls-card",
            children: e.jsxs("div", {
              className: "nls-card__body nls-stack nls-stack--tight",
              children: [
                e.jsx(ToggleSwitch, {
                  checked: H,
                  onChange: W,
                  label: "Smart lead capture & human handoff",
                  hint: "When the AI can't confidently answer, it offers to take the visitor's contact details, saves a lead, and emails you. Also triggered by an action button with link #lead.",
                }),
                H
                  ? e.jsxs("div", {
                      className: "nls-grid-2",
                      children: [
                        e.jsxs("label", {
                          className: "nls-field",
                          children: [
                            e.jsx("span", {
                              className: "nls-field__label",
                              children: "Offer message",
                            }),
                            e.jsx("span", {
                              className: "nls-field__hint",
                              children: "Shown when the bot offers to collect the visitor's contact details.",
                            }),
                            e.jsx("input", {
                              type: "text",
                              value: I,
                              onChange: (oe) => C(oe.target.value),
                              maxLength: 200,
                              placeholder: "Would you like our team to reach out to you?",
                              className: "mt-auto",
                            }),
                          ],
                        }),
                        e.jsxs("label", {
                          className: "nls-field",
                          children: [
                            e.jsx("span", {
                              className: "nls-field__label",
                              children: "Notify email",
                            }),
                            e.jsx("span", {
                              className: "nls-field__hint",
                              children: "Where new leads are sent. Blank = site admin email.",
                            }),
                            e.jsx("input", {
                              type: "email",
                              value: J,
                              onChange: (oe) => j(oe.target.value),
                              placeholder: "you@example.com",
                              className: "mt-auto",
                            }),
                          ],
                        }),
                      ],
                    })
                  : null,
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
                    e.jsx("h3", {
                      className: "nls-card__title",
                      children: "Extra pages to learn from (URLs)",
                    }),
                    e.jsxs("p", {
                      className: "nls-card__desc",
                      children: [
                        "Your whole WordPress site (pages, posts, products) is already learned when you click ",
                        e.jsx("b", {
                          children: "Train Now",
                        }),
                        " in Settings → AI Chatbot — you don’t need to paste it here. Use this only for ",
                        e.jsx("b", {
                          children: "external",
                        }),
                        " pages (a booking/Calendly page, a Google Maps link, a partner site). One URL per line; re-run ",
                        e.jsx("b", {
                          children: "Train Now",
                        }),
                        " after saving.",
                      ],
                    }),
                  ],
                }),
              }),
              e.jsx("div", {
                className: "nls-card__body",
                children: e.jsx("textarea", {
                  value: pe,
                  onChange: (oe) => me(oe.target.value),
                  rows: 3,
                  placeholder: `https://calendly.com/your-clinic
https://maps.google.com/…`,
                  className: "nls-mono",
                }),
              }),
            ],
          }),
          O
            ? e.jsx(ToggleSwitch, {
                checked: le,
                onChange: ie,
                label: "WooCommerce product cards",
                hint: "When a visitor asks about products/pricing, show matching product cards (image, price, sale badge) under the answer. Run Train Now so products are indexed.",
              })
            : null,
          e.jsx("div", {
            className: "nls-card",
            children: e.jsxs("div", {
              className: "nls-card__footer",
              children: [
                h
                  ? e.jsx("span", {
                      className: "nls-badge nls-badge--success",
                      children: "Saved ✓",
                    })
                  : null,
                e.jsxs("button", {
                  type: "button",
                  onClick: he,
                  disabled: u,
                  className: "nls-btn nls-btn--primary",
                  children: [
                    e.jsx(bn, {
                      size: 16,
                    }),
                    " ",
                    u ? "Saving…" : "Save configuration",
                  ],
                }),
              ],
            }),
          }),
        ],
      });
}
function Nd(a) {
  const o = ICON_OPTIONS.find((i) => i.key === a);
  return o && o.key ? o.label.split(" ")[0] : "•";
}
function AiAutoSetupPage() {
  const { restUrl: a, nonce: o } = getAdminConfig(),
    [i, d] = b.useState(!1),
    [u, p] = b.useState(!1),
    [h, x] = b.useState(""),
    [f, S] = b.useState(""),
    [y, P] = b.useState(null),
    [M, T] = b.useState(""),
    [F, V] = b.useState(!0),
    [z, U] = b.useState(!0),
    [w, N] = b.useState(!0),
    H = async () => {
      (d(!0), x(""), S(""), P(null));
      try {
        const C = await (
          await fetch(`${a}${jn}/ai/autogen`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-WP-Nonce": o,
            },
          })
        ).json();
        C && C.success
          ? (P(C.data), T(C.data.systemPrompt || ""))
          : x((C && C.message) || "Analysis failed. Is the AI server running?");
      } catch {
        x("Could not reach the server. Check the AI server URL in Settings.");
      } finally {
        d(!1);
      }
    },
    W = async () => {
      if (y) {
        (p(!0), S(""));
        try {
          const C = await (
            await fetch(`${a}${jn}/ai/autogen/apply`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-WP-Nonce": o,
              },
              body: JSON.stringify({
                applyPrompt: F,
                applyQuestions: z,
                applyActions: w,
                systemPrompt: M,
                questions: y.questions || [],
                actions: y.actions || [],
              }),
            })
          ).json();
          if (C && C.success) {
            const J = C.data.applied || [];
            try {
              window.dispatchEvent(
                new CustomEvent("nexulesuite-ai-config-applied", {
                  detail: C.data || {},
                }),
              );
            } catch (__e) {}
            S(J.length ? `Applied: ${J.join(", ")}. Open “FAQ & Buttons” to review.` : "Nothing selected to apply.");
          } else x((C && C.message) || "Apply failed.");
        } catch {
          x("Apply request failed.");
        } finally {
          p(!1);
        }
      }
    };
  return e.jsxs("div", {
    className: "nls-stack",
    children: [
      e.jsxs("div", {
        className: "nls-card",
        children: [
          e.jsx("div", {
            className: "nls-card__header",
            children: e.jsxs("h3", {
              className: "nls-card__title",
              children: [
                e.jsx(Ra, {
                  size: 18,
                  "aria-hidden": "true",
                }),
                "Auto-adapt to your business",
              ],
            }),
          }),
          e.jsxs("div", {
            className: "nls-card__body nls-stack nls-stack--tight",
            children: [
              e.jsxs("div", {
                className: "nls-notice nls-notice--info",
                children: [
                  e.jsx(Ys, {
                    size: 16,
                    "aria-hidden": "true",
                  }),
                  e.jsxs("div", {
                    className: "min-w-0",
                    children: [
                      e.jsx("p", {
                        children:
                          "The AI reads your trained website content, detects what your business does, and proposes a tailored assistant persona, suggested questions, and quick-action buttons. Review, then apply.",
                      }),
                      e.jsxs("p", {
                        className: "nls-text-xs nls-set-mt-1",
                        children: [
                          "Tip: run ",
                          e.jsx("b", {
                            children: "Train Now",
                          }),
                          " (Settings → AI Chatbot) first so the analysis reflects your latest content.",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsx("div", {
                className: "nls-row",
                children: e.jsxs("button", {
                  type: "button",
                  onClick: H,
                  disabled: i,
                  className: "nls-btn nls-btn--primary",
                  children: [
                    e.jsx(Ra, {
                      size: 16,
                    }),
                    " ",
                    i ? "Analyzing your website…" : "Analyze my website",
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
      h
        ? e.jsxs("div", {
            className: "nls-notice nls-notice--danger",
            role: "alert",
            children: [
              e.jsx(Ss, {
                size: 16,
                "aria-hidden": "true",
              }),
              e.jsx("span", {
                children: h,
              }),
            ],
          })
        : null,
      y
        ? e.jsxs("div", {
            className: "nls-stack",
            children: [
              e.jsx("div", {
                className: "nls-card",
                children: e.jsxs("div", {
                  className: "nls-card__body nls-row",
                  children: [
                    e.jsx("span", {
                      className: "nls-badge nls-badge--primary",
                      children: y.businessType || "Business",
                    }),
                    e.jsx("span", {
                      className: "nls-text-sm",
                      children: y.summary,
                    }),
                  ],
                }),
              }),
              e.jsx("div", {
                className: "nls-card",
                children: e.jsxs("div", {
                  className: "nls-card__body nls-stack nls-stack--tight",
                  children: [
                    e.jsxs("label", {
                      className: "nls-check",
                      children: [
                        e.jsx("input", {
                          type: "checkbox",
                          checked: F,
                          onChange: (I) => V(I.target.checked),
                        }),
                        e.jsx("span", {
                          className: "nls-field__label",
                          children: "Assistant persona (system prompt)",
                        }),
                      ],
                    }),
                    e.jsx("textarea", {
                      value: M,
                      onChange: (I) => T(I.target.value),
                      rows: 4,
                      "aria-label": "Assistant persona (system prompt)",
                    }),
                  ],
                }),
              }),
              e.jsx("div", {
                className: "nls-card",
                children: e.jsxs("div", {
                  className: "nls-card__body nls-stack nls-stack--tight",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsxs("label", {
                          className: "nls-check",
                          children: [
                            e.jsx("input", {
                              type: "checkbox",
                              checked: z,
                              onChange: (I) => U(I.target.checked),
                            }),
                            e.jsxs("span", {
                              className: "nls-field__label",
                              children: ["Suggested questions (", (y.questions || []).length, ")"],
                            }),
                          ],
                        }),
                        e.jsx("p", {
                          className: "nls-field__hint nls-set-mt-1",
                          children: "These appear as tappable chips; tapping one asks the AI directly.",
                        }),
                      ],
                    }),
                    e.jsx("div", {
                      className: "nls-row",
                      children: (y.questions || []).map((I, C) =>
                        e.jsxs(
                          "span",
                          {
                            className: "nls-badge nls-set-chip",
                            children: [
                              e.jsx("span", {
                                children: Nd(I.icon),
                              }),
                              " ",
                              I.label,
                            ],
                          },
                          C,
                        ),
                      ),
                    }),
                  ],
                }),
              }),
              (y.actions || []).length
                ? e.jsx("div", {
                    className: "nls-card",
                    children: e.jsxs("div", {
                      className: "nls-card__body nls-stack nls-stack--tight",
                      children: [
                        e.jsxs("div", {
                          children: [
                            e.jsxs("label", {
                              className: "nls-check",
                              children: [
                                e.jsx("input", {
                                  type: "checkbox",
                                  checked: w,
                                  onChange: (I) => N(I.target.checked),
                                }),
                                e.jsxs("span", {
                                  className: "nls-field__label",
                                  children: ["Quick-action buttons (", y.actions.length, ")"],
                                }),
                              ],
                            }),
                            e.jsx("p", {
                              className: "nls-field__hint nls-set-mt-1",
                              children: "Add the links (tel:, https:, #form) afterwards in “FAQ & Buttons”.",
                            }),
                          ],
                        }),
                        e.jsx("div", {
                          className: "nls-row",
                          children: y.actions.map((I, C) =>
                            e.jsxs(
                              "span",
                              {
                                className: "nls-badge nls-set-chip",
                                children: [
                                  e.jsx("span", {
                                    children: Nd(I.icon),
                                  }),
                                  " ",
                                  I.label,
                                ],
                              },
                              C,
                            ),
                          ),
                        }),
                      ],
                    }),
                  })
                : null,
              f
                ? e.jsxs("div", {
                    className: "nls-notice nls-notice--success",
                    role: "status",
                    children: [
                      e.jsx(Lt, {
                        size: 16,
                        "aria-hidden": "true",
                      }),
                      e.jsx("span", {
                        children: f,
                      }),
                    ],
                  })
                : null,
              e.jsx("div", {
                className: "nls-row",
                children: e.jsxs("button", {
                  type: "button",
                  onClick: W,
                  disabled: u,
                  className: "nls-btn nls-btn--primary",
                  children: [
                    e.jsx(bn, {
                      size: 16,
                    }),
                    " ",
                    u ? "Applying…" : "Apply selected",
                  ],
                }),
              }),
            ],
          })
        : null,
    ],
  });
}
const GLOBAL_FONT_LIST = [
    {
      family: "Inter",
      category: "Sans-serif",
    },
    {
      family: "Roboto",
      category: "Sans-serif",
    },
    {
      family: "Open Sans",
      category: "Sans-serif",
    },
    {
      family: "Lato",
      category: "Sans-serif",
    },
    {
      family: "Montserrat",
      category: "Sans-serif",
    },
    {
      family: "Poppins",
      category: "Sans-serif",
    },
    {
      family: "Raleway",
      category: "Sans-serif",
    },
    {
      family: "Nunito",
      category: "Sans-serif",
    },
    {
      family: "Rubik",
      category: "Sans-serif",
    },
    {
      family: "Work Sans",
      category: "Sans-serif",
    },
    {
      family: "Figtree",
      category: "Sans-serif",
    },
    {
      family: "Outfit",
      category: "Sans-serif",
    },
    {
      family: "Manrope",
      category: "Sans-serif",
    },
    {
      family: "Lexend",
      category: "Sans-serif",
    },
    {
      family: "Oswald",
      category: "Display",
    },
    {
      family: "Bebas Neue",
      category: "Display",
    },
    {
      family: "Playfair Display",
      category: "Serif",
    },
    {
      family: "Merriweather",
      category: "Serif",
    },
    {
      family: "Lora",
      category: "Serif",
    },
    {
      family: "Dancing Script",
      category: "Handwriting",
    },
    {
      family: "Pacifico",
      category: "Handwriting",
    },
    {
      family: "Source Code Pro",
      category: "Monospace",
    },
    {
      family: "JetBrains Mono",
      category: "Monospace",
    },
  ],
  yf = [
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
  ],
  Hi = (a) => a.aiProviders || {},
  bf = (a, o) =>
    Object.entries(Hi(a))
      .filter(([, i]) => i.chat && (o === "direct" ? i.direct : i.server))
      .map(([i, d]) => ({
        id: i,
        ...d,
      })),
  jf = (a) =>
    Object.entries(Hi(a))
      .filter(([, o]) => o.embed && o.direct)
      .map(([o, i]) => ({
        id: o,
        ...i,
      })),
  ss = (a, o) => Hi(a)[o] || null,
  er = (a, o) => {
    var i;
    return ((i = ss(a, o)) == null ? void 0 : i.label) || o || "—";
  },
  Wi = (a) => ({
    connMode: a.aiConnMode || "direct",
    serverUrl: a.aiServerUrl || "",
    llmProvider: a.aiLlmProvider || "",
    llmModel: a.aiLlmModel || "",
    embedProvider: a.aiEmbedProvider || "",
    embedModel: a.aiEmbedModel || "",
  }),
  SETTINGS_DEFAULTS = {
    enableNavigation: !1,
    selectedEmailTemplate: "",
    allowClientAccess: !1,
    tokenTTL: "5",
    clientAccessSlug: "report-access",
    globalFont: "Inter",
    enableAutoPopup: !1,
    autoPopupFormId: "",
    activityButtonClasses: "",
    excludePosts: [],
    excludePages: [],
    enableLivechat: !1,
    chatButtonImage: "",
    chatTitle: "Customer Support",
    chatBadge: "Online",
    chatContent: "Hello! How can we help you today?",
    chatFormButton: "",
    chatFormButtonLink: "",
    chatButtonTwo: "",
    chatButtonTwoLink: "",
    chatButtonThird: "",
    chatButtonThirdLink: "",
    chatAlign: "right",
    chatPadding: "12",
    chatBorderRadius: "12",
    primaryBtnBg: "#2563eb",
    primaryBtnText: "#ffffff",
    chatBlinkDotColor: "#ffffff",
    chatHoverEffect: "lift",
    reportLogo: "",
    reportLogoPdfMax: 400,
    formFieldFontSize: 14,
    formLabelFontSize: 13,
    formPlaceholderFontSize: 14,
    formFieldGap: 16,
    autoPopupFormIds: [],
    aiEnabled: !1,
    aiConnMode: "direct",
    aiServerUrl: "",
    aiApiKey: "",
    hasAiKey: !1,
    aiLlmProvider: "",
    aiLlmModel: "",
    aiLlmApiKey: "",
    hasLlmKey: !1,
    aiLlmProviders: [],
    aiProviders: {},
    aiEmbedProvider: "",
    aiEmbedModel: "",
    aiEmbedApiKey: "",
    hasEmbedKey: !1,
    aiIndex: {
      chunks: 0,
      documents: 0,
      dims: 0,
    },
    aiSystemPrompt: "",
    aiWelcomeMessage: "Hi! Ask me anything about our site and I'll help right away.",
    aiInputPlaceholder: "",
    aiChatModel: "",
    aiVisionModel: "llava",
    aiAllowImages: !1,
    aiMaxChunks: 4,
    aiManualQa: "",
  },
  Nf = {
    enabled: !1,
    mailer: "other",
    host: "",
    port: "587",
    secure: "tls",
    username: "",
    password: "",
    from_email: "",
    from_name: "",
    force_from_name: !1,
    oauth_client_id: "",
    oauth_client_secret: "",
  },
  wf = {
    connected: !1,
    oauth_email: "",
    hasClientSecret: !1,
    redirect_uri: "",
    authorize_urls: {},
    disconnect_url: "",
  },
  MAILER_OPTIONS = [
    {
      id: "default",
      name: "Default (PHP)",
      tagline: "WordPress built-in mail()",
      accent: "slate",
    },
    {
      id: "gmail",
      name: "Google / Gmail",
      tagline: "Gmail & Workspace · OAuth 2.0",
      accent: "rose",
    },
    {
      id: "outlook",
      name: "Microsoft / Outlook",
      tagline: "Microsoft 365 · OAuth 2.0",
      accent: "blue",
    },
    {
      id: "other",
      name: "Other SMTP",
      tagline: "Any SMTP server",
      accent: "violet",
    },
  ],
  MAILER_ACCENT_CLASSES = {
    slate: "border-slate-300 bg-slate-50 text-slate-600",
    rose: "border-rose-300 bg-rose-50 text-rose-600",
    blue: "border-blue-300 bg-blue-50 text-blue-600",
    violet: "border-violet-300 bg-violet-50 text-violet-600",
  },
  el = 100,
  Ql = 1e3,
  Vi = 400;
function nu(a) {
  const o = Math.round(Number(a));
  return Number.isFinite(o) ? Math.max(el, Math.min(Ql, o)) : Vi;
}
function lu() {
  var o;
  return {
    rowKey:
      typeof window < "u" && (o = window.crypto) != null && o.randomUUID
        ? window.crypto.randomUUID()
        : `apf-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    formId: "",
  };
}
function au(a) {
  return (Array.isArray(a) ? a : a && typeof a == "object" ? Object.values(a) : [])
    .filter((i) => i && typeof i == "object" && i.id != null && !Number.isNaN(Number(i.id)))
    .map((i) => ({
      id: Number(i.id),
      title: String(i.title ?? ""),
    }));
}
function Ki(a) {
  if (!a || typeof a != "object") return {};
  const o = {};
  return (
    "excludePosts" in a && (o.excludePosts = au(a.excludePosts)),
    "excludePages" in a && (o.excludePages = au(a.excludePages)),
    o
  );
}
function ru(a) {
  if (!a || typeof a != "object") return [];
  const o = Array.isArray(a.autoPopupFormIds) ? a.autoPopupFormIds : [];
  return o.length > 0
    ? o.map((i, d) => ({
        rowKey: `srv-${String(i)}-${d}`,
        formId: String(i),
      }))
    : a.autoPopupFormId
      ? [
          {
            rowKey: "legacy",
            formId: String(a.autoPopupFormId),
          },
        ]
      : [];
}
async function ou(a, o = 512) {
  return new Promise((i, d) => {
    const u = new Image(),
      p = URL.createObjectURL(a);
    ((u.onload = () => {
      URL.revokeObjectURL(p);
      let h = u.naturalWidth,
        x = u.naturalHeight;
      if (!h || !x) {
        d(new Error("Could not read image dimensions."));
        return;
      }
      let f = h,
        S = x;
      (f > o || S > o) && (f > S ? ((S = Math.round((S * o) / f)), (f = o)) : ((f = Math.round((f * o) / S)), (S = o)));
      const y = document.createElement("canvas");
      ((y.width = f), (y.height = S));
      const P = y.getContext("2d");
      if (!P) {
        d(new Error("Your browser cannot process images here."));
        return;
      }
      ((P.fillStyle = "#ffffff"),
        P.fillRect(0, 0, f, S),
        P.drawImage(u, 0, 0, f, S),
        y.toBlob(
          (M) => {
            if (!M) {
              d(new Error("Could not convert image to JPEG."));
              return;
            }
            i(
              new File([M], "nexus-chat-avatar.jpg", {
                type: "image/jpeg",
                lastModified: Date.now(),
              }),
            );
          },
          "image/jpeg",
          0.92,
        ));
    }),
      (u.onerror = () => {
        (URL.revokeObjectURL(p), d(new Error("Could not load image. Use JPEG or PNG.")));
      }),
      (u.src = p));
  });
}
export function SettingsPage() {
  var sn, An, ur, pr, ml, na, xl, nn, hr, fl, qe, la, aa;
  const a = ((sn = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : sn.pluginVersion) || "",
    [o, i] = b.useState("general"),
    [d, u] = b.useState("setup"),
    [p, h] = b.useState(""),
    [x, f] = b.useState(!1),
    [S, y] = b.useState([]),
    [P, M] = b.useState(""),
    [T, F] = b.useState("0"),
    [V, z] = b.useState(["summary", "activities"]),
    U = b.useRef(null),
    [w, N] = b.useState(!1),
    H = b.useRef(null),
    [W, I] = b.useState(!1),
    [C, J] = b.useState(""),
    [j, le] = b.useState(SETTINGS_DEFAULTS),
    [ie, O] = b.useState(!0),
    [te, pe] = b.useState(!1),
    [me, B] = b.useState({
      open: !1,
      text: "",
    }),
    [ee, _] = b.useState(!1),
    [X, L] = b.useState(!1),
    [A, k] = b.useState([]),
    [Z, ue] = b.useState([]),
    [Q, he] = b.useState([]),
    [nlsExPostQ, setNlsExPostQ] = b.useState(""),
    [nlsExPageQ, setNlsExPageQ] = b.useState(""),
    [nlsExPostLink, setNlsExPostLink] = b.useState(""),
    [nlsExPageLink, setNlsExPageLink] = b.useState(""),
    [nlsExPostHits, setNlsExPostHits] = b.useState([]),
    [nlsExPageHits, setNlsExPageHits] = b.useState([]),
    [nlsExPostBusy, setNlsExPostBusy] = b.useState(!1),
    [nlsExPageBusy, setNlsExPageBusy] = b.useState(!1),
    [oe, xe] = b.useState([]),
    [ve, Ke] = b.useState([]),
    [Xe, St] = b.useState([]),
    [De, xs] = b.useState(Nf),
    [_n, Sn] = b.useState(!1),
    [Fs, Cn] = b.useState(!1),
    [Es, fs] = b.useState(!1),
    [ns, Y] = b.useState(""),
    [_e, ge] = b.useState(null),
    [fe, Te] = b.useState(!0),
    [Pe, Oe] = b.useState(wf),
    [$e, st] = b.useState(!1),
    [gs, Js] = b.useState(!1),
    [tl, vs] = b.useState(null),
    [ls, sl] = b.useState(() => Wi(SETTINGS_DEFAULTS)),
    [Ds, nl] = b.useState(!1),
    [ys, Qt] = b.useState(null),
    [Zs, Zl] = b.useState(!1),
    pt = (g, G) => {
      if (g === "success") return;
      const re = typeof G == "string" && G.trim() !== "" ? G.trim() : "An error occurred.";
      B({
        open: !0,
        text: re,
      });
    },
    nr = () =>
      B({
        open: !1,
        text: "",
      });
  (b.useEffect(() => {
    if (!j.globalFont) return;
    const g = GLOBAL_FONT_LIST.find((G) => G.family === j.globalFont);
    g && useGoogleFontLink(g.family, g.weights);
  }, [j.globalFont]),
    b.useEffect(() => {
      (async () => {
        var g, G, re, be, je, Ae, Ue, Be, Se, ft, mt, ot;
        try {
          const [Ie, Yt, He, ra, Pn, As, Mn] = await Promise.allSettled([
            settingsFetch("/settings/general", {
              method: "GET",
            }),
            settingsFetch("/emails/templates", {
              method: "GET",
            }),
            wpFetch("wp/v2/posts?per_page=50&_fields=id,title"),
            wpFetch("wp/v2/pages?per_page=50&_fields=id,title"),
            settingsFetch("/popups", {
              method: "GET",
            }),
            settingsFetch("/forms", {
              method: "GET",
            }),
            settingsFetch("/smtp/settings", {
              method: "GET",
            }),
          ]);
          if (Ie.status === "fulfilled" && Ie.value.res.ok && (g = Ie.value.json) != null && g.success) {
            const Ye = ((re = (G = Ie.value.json) == null ? void 0 : G.data) == null ? void 0 : re.settings) || {};
            (le((Je) => ({
              ...Je,
              ...Ye,
              ...Ki(Ye),
            })),
              sl(Wi(Ye)),
              St(ru(Ye)));
          }
          if (
            (Yt.status === "fulfilled" &&
              Yt.value.res.ok &&
              (be = Yt.value.json) != null &&
              be.success &&
              k(((je = Yt.value.json.data) == null ? void 0 : je.templates) || []),
            Pn.status === "fulfilled" &&
              Pn.value.res.ok &&
              (Ae = Pn.value.json) != null &&
              Ae.success &&
              xe(((Ue = Pn.value.json.data) == null ? void 0 : Ue.popups) || []),
            As.status === "fulfilled" && As.value.res.ok && (Be = As.value.json) != null && Be.success)
          ) {
            const Ye = Array.isArray(
              (ft = (Se = As.value.json.data) == null ? void 0 : Se.payload) == null ? void 0 : ft.forms,
            )
              ? As.value.json.data.payload.forms
              : [];
            Ke(
              Ye.filter((Je) => Je != null && String(Je.id ?? "").trim() !== "").map((Je) => ({
                id: String(Je.id).trim(),
                name: typeof Je.name == "string" && Je.name.trim() !== "" ? Je.name.trim() : "Untitled form",
              })),
            );
          }
          if (Mn.status === "fulfilled" && Mn.value.res.ok && (mt = Mn.value.json) != null && mt.success) {
            const Ye = ((ot = Mn.value.json) == null ? void 0 : ot.data) || {},
              Je = Ye.settings || {};
            (xs((zn) => ({
              ...zn,
              ...Je,
              port: Je.port != null ? String(Je.port) : zn.port,
              password: "",
              oauth_client_secret: "",
            })),
              Sn(!!Ye.hasPassword),
              Oe({
                connected: !!Ye.connected,
                oauth_email: Ye.oauth_email || "",
                hasClientSecret: !!Ye.hasClientSecret,
                redirect_uri: Ye.redirect_uri || "",
                authorize_urls: Ye.authorize_urls || {},
                disconnect_url: Ye.disconnect_url || "",
              }));
          }
          const ro = He.status === "fulfilled" && Array.isArray(He.value) ? He.value : [],
            Ln = ra.status === "fulfilled" && Array.isArray(ra.value) ? ra.value : [];
          (ue(
            ro.map((Ye) => {
              var Je;
              return {
                id: Ye.id,
                title: ((Je = Ye.title) == null ? void 0 : Je.rendered) || "",
              };
            }),
          ),
            he(
              Ln.map((Ye) => {
                var Je;
                return {
                  id: Ye.id,
                  title: ((Je = Ye.title) == null ? void 0 : Je.rendered) || "",
                };
              }),
            ));
        } catch {
        } finally {
          O(!1);
        }
      })();
    }, []));
  b.useEffect(() => {
    const g = setTimeout(() => {
      String(nlsExPostQ || "").trim() && nlsExSearch("post", nlsExPostQ, setNlsExPostHits, setNlsExPostBusy);
    }, 320);
    return () => clearTimeout(g);
  }, [nlsExPostQ]);
  b.useEffect(() => {
    const g = setTimeout(() => {
      String(nlsExPageQ || "").trim() && nlsExSearch("page", nlsExPageQ, setNlsExPageHits, setNlsExPageBusy);
    }, 320);
    return () => clearTimeout(g);
  }, [nlsExPageQ]);
  b.useEffect(() => {
    const g = (G) => {
      const re = (G && G.detail) || {};
      le((be) => {
        const je = {
          ...be,
        };
        if (typeof re.systemPrompt == "string") je.aiSystemPrompt = re.systemPrompt;
        if (Array.isArray(re.items)) je.aiFaqFlows = re.items;
        if (Array.isArray(re.actions)) je.aiActions = re.actions;
        if (re.faqEnabled != null) je.aiFaqEnabled = !!re.faqEnabled;
        return je;
      });
    };
    window.addEventListener("nexulesuite-ai-config-applied", g);
    return () => window.removeEventListener("nexulesuite-ai-config-applied", g);
  }, []);
  const Ee = (g, G) =>
      le((re) => ({
        ...re,
        [g]: G,
      })),
    Bt = (g, G) =>
      xs((re) => ({
        ...re,
        [g]: G,
      }));
  b.useEffect(() => {
    (async () => {
      const g = new URLSearchParams(window.location.search),
        G = g.get("nls_smtp");
      if (!G) return;
      i("smtp");
      try {
        const { res: nlsSmtpRes, json: nlsSmtpJson } = await settingsFetch("/smtp/settings", {
          method: "GET",
        });
        if (nlsSmtpRes.ok && nlsSmtpJson != null && nlsSmtpJson.success) {
          const Ye = nlsSmtpJson.data || {},
            Je = Ye.settings || {};
          (xs((zn) => ({
            ...zn,
            ...Je,
            port: Je.port != null ? String(Je.port) : zn.port,
            password: "",
            oauth_client_secret: "",
          })),
            Sn(!!Ye.hasPassword),
            Oe({
              connected: !!Ye.connected,
              oauth_email: Ye.oauth_email || "",
              hasClientSecret: !!Ye.hasClientSecret,
              redirect_uri: Ye.redirect_uri || "",
              authorize_urls: Ye.authorize_urls || {},
              disconnect_url: Ye.disconnect_url || "",
            }));
        }
      } catch (nlsSmtpErr) {}
      if (G === "connected" || G === "disconnected") _(!0);
      else if (G === "error") {
        const be = g.get("nls_smtp_msg");
        pt("error", be ? decodeURIComponent(be) : "OAuth authorization failed.");
      }
      (g.delete("nls_smtp"), g.delete("nls_smtp_msg"));
      const re = g.toString();
      window.history.replaceState({}, "", window.location.pathname + (re ? `?${re}` : "") + window.location.hash);
    })();
  }, []);
  const lr = () => {
      var G;
      const g = Pe.redirect_uri || "";
      !g ||
        !((G = navigator == null ? void 0 : navigator.clipboard) != null && G.writeText) ||
        navigator.clipboard
          .writeText(g)
          .then(() => {
            (st(!0), window.setTimeout(() => st(!1), 2e3));
          })
          .catch(() => {});
    },
    Ct = De.enabled ? De.mailer || "other" : "default",
    ll = (g) => {
      if (g === "default") {
        xs((G) => ({
          ...G,
          enabled: !1,
        }));
        return;
      }
      xs((G) => ({
        ...G,
        enabled: !0,
        mailer: g,
      }));
    },
    al = async () => {
      if (!Fs) {
        (Cn(!0), ge(null));
        try {
          const g = parseInt(De.port, 10),
            G = {
              enabled: !!De.enabled,
              mailer: De.mailer || "other",
              host: (De.host || "").trim(),
              port: Number.isFinite(g) && g > 0 ? g : 587,
              secure: De.secure || "tls",
              username: (De.username || "").trim(),
              from_email: (De.from_email || "").trim(),
              from_name: (De.from_name || "").trim(),
              force_from_name: !!De.force_from_name,
              oauth_client_id: (De.oauth_client_id || "").trim(),
            };
          (De.password && (G.password = De.password),
            De.oauth_client_secret && (G.oauth_client_secret = De.oauth_client_secret));
          const { res: re, json: be } = await settingsFetch("/smtp/settings", {
            method: "POST",
            body: JSON.stringify({
              settings: G,
            }),
          });
          if (!re.ok || !(be != null && be.success))
            throw new Error((be == null ? void 0 : be.message) || "Save failed.");
          De.password && Sn(!0);
          const je = (be == null ? void 0 : be.data) || {};
          (Oe({
            connected: !!je.connected,
            oauth_email: je.oauth_email || "",
            hasClientSecret: !!je.hasClientSecret,
            redirect_uri: je.redirect_uri || Pe.redirect_uri,
            authorize_urls: je.authorize_urls || Pe.authorize_urls,
            disconnect_url: je.disconnect_url || Pe.disconnect_url,
          }),
            xs((Ae) => ({
              ...Ae,
              password: "",
              oauth_client_secret: "",
            })),
            _(!0));
        } catch (g) {
          pt("error", (g == null ? void 0 : g.message) || "Could not save SMTP settings.");
        } finally {
          Cn(!1);
        }
      }
    },
    ea = async () => {
      if (Es) return;
      const g = (ns || "").trim();
      if (!g || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g)) {
        ge({
          ok: !1,
          text: "Enter a valid email address to send the test to.",
        });
        return;
      }
      (fs(!0), ge(null));
      try {
        const { res: G, json: re } = await settingsFetch("/smtp/test", {
          method: "POST",
          body: JSON.stringify({
            to: g,
            html: !!fe,
          }),
        });
        if (!G.ok || !(re != null && re.success))
          throw new Error((re == null ? void 0 : re.message) || `Test email failed (${G.status}).`);
        ge({
          ok: !0,
          text: re && re.note ? String(re.note) : `Test email sent to ${g}. Check the inbox (and spam).`,
        });
      } catch (G) {
        ge({
          ok: !1,
          text: (G == null ? void 0 : G.message) || "Test email failed.",
        });
      } finally {
        fs(!1);
      }
    },
    eo = async () => {
      var g, G, re;
      if (!gs) {
        if (no) {
          vs({
            ok: !1,
            text: "Unsaved changes: Test uses your saved settings. Click Save Configuration first, then Test.",
          });
          return;
        }
        (Js(!0), vs(null));
        try {
          const { res: be, json: je } = await settingsFetch("/ai/test", {
              method: "POST",
            }),
            Ae = (je == null ? void 0 : je.data) || {};
          if (!be.ok || !(je != null && je.success))
            throw new Error((je == null ? void 0 : je.message) || "Connection failed.");
          if (Ae.mode === "direct") {
            const mt = [`Provider: ${Ae.provider}`, `Model: ${Ae.chat_model}`];
            ((g = Ae.providerTest) != null &&
              g.latency_ms &&
              mt.push(`key verified in ${Ae.providerTest.latency_ms} ms`),
              mt.push(`Images: ${(G = Ae.capabilities) != null && G.vision ? "yes" : "no"}`),
              (re = Ae.embed) != null && re.ok && mt.push(`Embeddings: ${Ae.embed.provider} (${Ae.embed.dims}d)`),
              mt.push(`Knowledge base: ${Ae.documents || 0} doc(s), ${Ae.chunks || 0} chunk(s)`));
            const ot = Ae.chunks ? "" : " Click Train Now to index your site content.";
            vs({
              ok: !0,
              text: `Connected. ${mt.join(" · ")}.${ot}`,
            });
            return;
          }
          const Ue = Ae.capabilities || {},
            Be = Ae.providerTest || null,
            Se = [`Provider: ${Ae.provider || "—"}`, `Model: ${Ae.chat_model || "—"}`];
          (Se.push(`Tools: ${Ue.tools ? "yes" : "no"}`),
            Se.push(`Images: ${Ue.vision ? "yes" : "no"}`),
            Be != null && Be.ok && Be.latency_ms && Se.push(`key verified in ${Be.latency_ms} ms`));
          const ft = [];
          (Ae.ollama || ft.push("Ollama is not responding — training/retrieval will fail until it is running."),
            !Be && !Ae.has_credential && ft.push("No provider key configured here or on the server."),
            Ue.tools || ft.push("This model cannot call tools — the assistant will use the basic reply path."),
            vs({
              ok: ft.length === 0,
              text: `Connected. ${Se.join(" · ")}${ft.length ? ". " + ft.join(" ") : "."}`,
            }));
        } catch (be) {
          vs({
            ok: !1,
            text: (be == null ? void 0 : be.message) || "Connection failed.",
          });
        } finally {
          Js(!1);
        }
      }
    },
    to = async () => {
      if (!Ds) {
        (nl(!0), Qt(null));
        try {
          let g = 0,
            G = !0,
            re = 0,
            be = 0,
            je = 0;
          for (let Ae = 0; Ae < 500; Ae++) {
            const { res: Ue, json: Be } = await settingsFetch("/ai/train", {
              method: "POST",
              body: JSON.stringify({
                offset: g,
                reset: G,
              }),
            });
            if (!Ue.ok || !(Be != null && Be.success))
              throw new Error((Be == null ? void 0 : Be.message) || "Training failed.");
            const Se = Be.data || {};
            if (
              ((re = Se.totalChunks || re),
              (be = Se.total || be),
              (je += Se.processed || 0),
              Qt({
                ok: !0,
                text: `Training… ${je}/${be || "?"} items processed.`,
              }),
              (G = !1),
              Se.done || Se.nextOffset == null)
            )
              break;
            g = Se.nextOffset;
          }
          Qt({
            ok: !0,
            text: `Training complete — ${be} item(s) indexed, ${re} chunk(s) in memory.`,
          });
        } catch (g) {
          Qt({
            ok: !1,
            text:
              (g == null ? void 0 : g.message) || "Training failed. Save your settings and test the connection first.",
          });
        } finally {
          nl(!1);
        }
      }
    },
    so = async () => {
      if (!Zs) {
        Zl(!0);
        try {
          const { res: g, json: G } = await settingsFetch("/ai/reset", {
            method: "POST",
          });
          if (!g.ok || !(G != null && G.success))
            throw new Error((G == null ? void 0 : G.message) || "Failed to clear memory.");
          Qt({
            ok: !0,
            text: "Memory cleared. Re-train to rebuild the knowledge base.",
          });
        } catch (g) {
          Qt({
            ok: !1,
            text: (g == null ? void 0 : g.message) || "Failed to clear memory.",
          });
        } finally {
          Zl(!1);
        }
      }
    },
    as = j.aiConnMode || "direct",
    ht = ss(j, j.aiLlmProvider),
    Ts = j.aiEmbedProvider || (ht != null && ht.embed ? j.aiLlmProvider : ""),
    Et = ss(j, Ts),
    En = !!Ts && Ts === j.aiLlmProvider,
    rl = !!j.hasLlmKey && (j.aiLlmProvider || "") === ls.llmProvider,
    il = !!j.hasEmbedKey && (j.aiEmbedProvider || "") === ls.embedProvider,
    ir = En ? rl || !!j.aiLlmApiKey : il || !!j.aiEmbedApiKey,
    or = !!Ts && ir,
    no =
      as !== ls.connMode ||
      (j.aiServerUrl || "") !== ls.serverUrl ||
      (j.aiLlmProvider || "") !== ls.llmProvider ||
      (j.aiLlmModel || "") !== ls.llmModel ||
      (j.aiEmbedProvider || "") !== ls.embedProvider ||
      (j.aiEmbedModel || "") !== ls.embedModel ||
      !!j.aiApiKey ||
      !!j.aiLlmApiKey ||
      !!j.aiEmbedApiKey,
    nt = nu(j.reportLogoPdfMax),
    ol = Math.round(40 + ((nt - el) / (Ql - el)) * 80),
    ta = async () => {
      var g;
      if (!te) {
        pe(!0);
        try {
          const G = (({
            aiFaqEnabled: __e,
            aiFaqFlows: __f,
            aiActions: __a,
            aiLogChats: __l,
            aiDisclaimer: __d,
            aiTriggerLabel: __t,
            aiLeadEnabled: __le,
            aiLeadOffer: __lo,
            aiLeadRecipient: __lr,
            aiWooCards: __w,
            aiExtraUrls: __u,
            aiContactShortcode: __c,
            aiExamples: __x,
            ...__rest
          }) => __rest)(j);
          G.autoPopupFormIds = Xe.map((Ae) => Ae.formId).filter((Ae) => typeof Ae == "string" && Ae.trim() !== "");
          const { res: re, json: be } = await settingsFetch("/settings/general", {
            method: "POST",
            body: JSON.stringify({
              settings: G,
            }),
          });
          if (!re.ok || !(be != null && be.success))
            throw new Error((be == null ? void 0 : be.message) || "Save failed.");
          const je = (g = be == null ? void 0 : be.data) == null ? void 0 : g.settings;
          (je &&
            typeof je == "object" &&
            (le((Ae) => ({
              ...Ae,
              ...je,
              ...Ki(je),
              aiApiKey: "",
              aiLlmApiKey: "",
              aiEmbedApiKey: "",
            })),
            sl(Wi(je)),
            St(ru(je))),
            _(!0));
        } catch (G) {
          pt("error", (G == null ? void 0 : G.message) || "Save failed.");
        } finally {
          pe(!1);
        }
      }
    },
    cr = () => {
      const g =
        typeof structuredClone == "function"
          ? structuredClone(SETTINGS_DEFAULTS)
          : JSON.parse(JSON.stringify(SETTINGS_DEFAULTS));
      (le(g), St([]), h(""), f(!1));
    },
    cl = async (g) => {
      var be, je, Ae, Ue, Be;
      const G = g.target,
        re = (be = G.files) == null ? void 0 : be[0];
      if (re) {
        if (!re.type.startsWith("image/")) {
          (pt("error", "Please choose an image file."), (G.value = ""));
          return;
        }
        if (re.size > 3 * 1024 * 1024) {
          (pt("error", "Image must be under 3 MB."), (G.value = ""));
          return;
        }
        N(!0);
        try {
          let Se;
          try {
            Se = await ou(re);
          } catch (He) {
            throw He instanceof Error ? He : new Error(String(He));
          }
          const ft = (
              ((je = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : je.restUrl) || ""
            ).replace(/\/?$/, ""),
            mt = new FormData();
          mt.append("file", Se);
          const ot = await fetch(`${ft}/nexulesuite_/v1/settings/upload-chat-image`, {
              method: "POST",
              credentials: "same-origin",
              headers: {
                "X-WP-Nonce":
                  ((Ae = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : Ae.nonce) || "",
              },
              body: mt,
            }),
            Ie = await ot.json().catch(() => null);
          if (!ot.ok) {
            let He =
              (Ie == null ? void 0 : Ie.message) ?? (Ie == null ? void 0 : Ie.code) ?? `Upload failed (${ot.status})`;
            throw (
              typeof He == "object" && He !== null && (He = He.message || He.code || "Upload failed."),
              new Error(typeof He == "string" ? He : "Upload failed.")
            );
          }
          const Yt =
            ((Ue = Ie == null ? void 0 : Ie.data) == null ? void 0 : Ue.url) ||
            (Ie == null ? void 0 : Ie.source_url) ||
            ((Be = Ie == null ? void 0 : Ie.guid) == null ? void 0 : Be.rendered);
          if (!Yt) throw new Error("No image URL returned.");
          (Ee("chatButtonImage", Yt),
            pt("success", "Image uploaded. Save configuration if you have other unsaved changes."));
        } catch (Se) {
          pt(
            "error",
            (Se == null ? void 0 : Se.message) || "Could not upload image. Try pasting an image URL instead.",
          );
        } finally {
          (N(!1), (G.value = ""));
        }
      }
    },
    lo = async (g) => {
      var be, je, Ae, Ue, Be;
      const G = g.target,
        re = (be = G.files) == null ? void 0 : be[0];
      if (re) {
        if (!re.type.startsWith("image/")) {
          (pt("error", "Please choose an image file."), (G.value = ""));
          return;
        }
        if (re.size > 3 * 1024 * 1024) {
          (pt("error", "Image must be under 3 MB."), (G.value = ""));
          return;
        }
        I(!0);
        try {
          let Se;
          try {
            Se = await ou(re);
          } catch (He) {
            throw He instanceof Error ? He : new Error(String(He));
          }
          const ft = (
              ((je = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : je.restUrl) || ""
            ).replace(/\/?$/, ""),
            mt = new FormData();
          mt.append("file", Se);
          const ot = await fetch(`${ft}/nexulesuite_/v1/settings/upload-report-logo`, {
              method: "POST",
              credentials: "same-origin",
              headers: {
                "X-WP-Nonce":
                  ((Ae = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : Ae.nonce) || "",
              },
              body: mt,
            }),
            Ie = await ot.json().catch(() => null);
          if (!ot.ok) {
            let He =
              (Ie == null ? void 0 : Ie.message) ?? (Ie == null ? void 0 : Ie.code) ?? `Upload failed (${ot.status})`;
            throw (
              typeof He == "object" && He !== null && (He = He.message || He.code || "Upload failed."),
              new Error(typeof He == "string" ? He : "Upload failed.")
            );
          }
          const Yt =
            ((Ue = Ie == null ? void 0 : Ie.data) == null ? void 0 : Ue.url) ||
            (Ie == null ? void 0 : Ie.source_url) ||
            ((Be = Ie == null ? void 0 : Ie.guid) == null ? void 0 : Be.rendered);
          if (!Yt) throw new Error("No image URL returned.");
          (Ee("reportLogo", Yt), pt("success", "Report logo uploaded. Save configuration to apply it in PDF reports."));
        } catch (Se) {
          pt(
            "error",
            (Se == null ? void 0 : Se.message) || "Could not upload image. Try pasting an image URL instead.",
          );
        } finally {
          (I(!1), (G.value = ""));
        }
      }
    },
    Tn = b.useCallback(async () => {
      try {
        const { res: g, json: G } = await settingsFetch("/settings/client-links");
        g.ok && G != null && G.success && y(G.data.links || []);
      } catch {}
    }, []);
  b.useEffect(() => {
    Tn();
  }, [Tn]);
  const dl = (g) => {
      z((G) => (G.includes(g) ? G.filter((re) => re !== g) : [...G, g]));
    },
    rs = async (g) => {
      var G;
      g && g.preventDefault();
      try {
        const re = parseInt(String(T || "0"), 10),
          { res: be, json: je } = await settingsFetch("/settings/client-links", {
            method: "POST",
            body: JSON.stringify({
              label: P,
              expiresDays: Number.isFinite(re) ? re : 0,
              sections: V,
            }),
          });
        if (!be.ok || !(je != null && je.success)) {
          let Ue = (je == null ? void 0 : je.message) || (je == null ? void 0 : je.code) || "Could not generate link.";
          throw (
            typeof Ue == "object" && Ue !== null && (Ue = Ue.message || Ue.code || "Could not generate link."),
            new Error(typeof Ue == "string" ? Ue : "Could not generate link.")
          );
        }
        const Ae = ((G = je == null ? void 0 : je.data) == null ? void 0 : G.url) || "";
        (h(Ae), M(""), await Tn(), Ae && pt("success", "Share link created. Copy it now — it is shown only once."));
      } catch (re) {
        pt("error", (re == null ? void 0 : re.message) || "Could not generate link.");
      }
    },
    ao = async (g) => {
      if (window.confirm("Revoke this link? Anyone holding it loses access immediately."))
        try {
          const { res: G, json: re } = await settingsFetch(`/settings/client-links/${g}`, {
            method: "DELETE",
          });
          if (!G.ok || !(re != null && re.success)) throw new Error("Could not revoke link.");
          (h(""), await Tn(), pt("success", "Link revoked."));
        } catch (G) {
          pt("error", (G == null ? void 0 : G.message) || "Could not revoke link.");
        }
    },
    Xt = () => {
      p && (navigator.clipboard.writeText(p), f(!0), setTimeout(() => f(!1), 2e3));
    },
    ul = (g, G) => {
      const re = j[g],
        be = re.find((je) => je.id === G.id);
      Ee(g, be ? re.filter((je) => je.id !== G.id) : [...re, G]);
    },
    nlsExPick = (g, G) => {
      const re = j[g] || [];
      re.some((je) => Number(je.id) === Number(G.id)) ||
        Ee(g, [
          ...re,
          {
            id: Number(G.id),
            title: String(G.title || "Untitled"),
          },
        ]);
    },
    nlsExSearch = async (g, G, re, be) => {
      const je = String(G || "").trim();
      if (je.length < 1) {
        re([]);
        return;
      }
      be(!0);
      try {
        const Ae = new URLSearchParams({
            search: je,
            types: g,
          }),
          { res: Ue, json: Be } = await settingsFetch(`/menu-items/content-search?${Ae}`, {
            method: "GET",
          }),
          Se =
            Ue.ok &&
            (Be == null ? void 0 : Be.success) &&
            Array.isArray((Be == null ? void 0 : Be.data) == null ? void 0 : Be.data.results)
              ? Be.data.results
              : [];
        re(
          Se.map((ft) => ({
            id: Number(ft.id),
            title: String(ft.title || "Untitled"),
            type: String(ft.type || g),
            url: String(ft.url || ""),
          })),
        );
      } catch {
        re([]);
      } finally {
        be(!1);
      }
    },
    nlsExAddLink = async (g, G, re, be, je, Ae) => {
      const Ue = String(G || "").trim();
      if (!Ue) return;
      je(!0);
      try {
        const Be = new URLSearchParams({
            search: Ue,
            types: g,
          }),
          { res: Se, json: ft } = await settingsFetch(`/menu-items/content-search?${Be}`, {
            method: "GET",
          }),
          mt =
            Se.ok &&
            (ft == null ? void 0 : ft.success) &&
            Array.isArray((ft == null ? void 0 : ft.data) == null ? void 0 : ft.data.results)
              ? ft.data.results
              : [],
          ot = mt.map((Ie) => ({
            id: Number(Ie.id),
            title: String(Ie.title || "Untitled"),
            type: String(Ie.type || g),
          }));
        (ot.length === 1 ? (nlsExPick(re, ot[0]), Ae(""), be([])) : be(ot), je(!1));
      } catch {
        (be([]), je(!1));
      }
    },
    dr = GLOBAL_FONT_LIST.filter((g) => !C || g.family.toLowerCase().includes(C.toLowerCase()));
  GLOBAL_FONT_LIST.find((g) => g.family === j.globalFont);
  const pl = {
      general: "#64748b",
      popup: "#8b5cf6",
      ai: "#6366f1",
      smtp: "#f43f5e",
      backup: "#10b981",
    },
    hl = [
      {
        id: "general",
        label: "General & Navigation",
        icon: Si,
      },
      {
        id: "popup",
        label: "Auto PopUp Logic",
        icon: Ei,
      },
      {
        id: "ai",
        label: "AI Chatbot",
        icon: Gs,
      },
      {
        id: "smtp",
        label: "SMTP / Email",
        icon: qt,
      },
      {
        id: "backup",
        label: "Export Settings",
        icon: Gn,
      },
    ];
  return e.jsxs(PageFrame, {
    title: "Settings",
    subtitle: "Global configuration & automation logic",
    icon: e.jsx(id, {
      size: 18,
    }),
    footer:
      ["general", "popup", "chat", "backup", "smtp"].includes(o) || (o === "ai" && d === "setup")
        ? e.jsx(StickyFooter, {
            status: a ? `v${a}` : null,
            actions:
              o === "smtp"
                ? e.jsxs("button", {
                    type: "button",
                    disabled: Fs,
                    onClick: al,
                    className: "nls-btn nls-btn--primary",
                    children: [
                      e.jsx(bn, {
                        size: 16,
                      }),
                      Fs ? "Saving..." : "Save SMTP Settings",
                    ],
                  })
                : e.jsxs(e.Fragment, {
                    children: [
                      e.jsx("button", {
                        type: "button",
                        onClick: () => L(!0),
                        className: "nls-btn nls-btn--ghost",
                        children: "Discard Changes",
                      }),
                      e.jsxs("button", {
                        type: "button",
                        disabled: te,
                        onClick: ta,
                        className: "nls-btn nls-btn--primary",
                        children: [
                          e.jsx(bn, {
                            size: 16,
                          }),
                          te ? "Saving..." : "Save Configuration",
                        ],
                      }),
                    ],
                  }),
          })
        : null,
    children: [
      e.jsx(SuccessModal, {
        open: ee,
        message: "Your settings have been successfully updated. All changes are now live.",
        onDismiss: () => _(!1),
      }),
      e.jsx(ErrorModal, {
        open: me.open,
        message: me.text,
        onDismiss: nr,
      }),
      e.jsx(ConfirmModal, {
        open: X,
        onCancel: () => L(!1),
        onConfirm: () => {
          (L(!1), cr());
        },
        title: "Reset settings to defaults?",
        description:
          "All fields on this page return to factory defaults. Your saved server settings are unchanged until you click Save Configuration.",
      }),
      e.jsxs("div", {
        className: "nls-stack nls-set-page",
        children: [
          e.jsx("div", {
            className: "nls-tabs",
            role: "tablist",
            "aria-label": "Settings sections",
            children: hl.map((g) => {
              const G = o === g.id;
              return e.jsxs(
                "button",
                {
                  type: "button",
                  role: "tab",
                  "aria-selected": G,
                  onClick: () => i(g.id),
                  className: "nls-tab",
                  children: [
                    e.jsx(g.icon, {
                      size: 16,
                      "aria-hidden": "true",
                    }),
                    g.label,
                  ],
                },
                g.id,
              );
            }),
          }),
          ie
            ? e.jsxs("div", {
                className: "nls-loading",
                children: [
                  e.jsx("span", {
                    className: "nls-spinner",
                    "aria-hidden": "true",
                  }),
                  "Loading configuration...",
                ],
              })
            : e.jsxs(e.Fragment, {
                children: [
                  o === "general" &&
                    e.jsxs("div", {
                      className: "nls-stack",
                      children: [
                        e.jsxs("section", {
                          className: "nls-card",
                          children: [
                            e.jsx("div", {
                              className: "nls-card__header",
                              children: e.jsxs("h2", {
                                className: "nls-card__title",
                                children: [
                                  e.jsx(Si, {
                                    size: 18,
                                    "aria-hidden": "true",
                                  }),
                                  "Navigation & Email ",
                                  e.jsx(Tooltip, {
                                    text: "Footer menu behaviour and activity notification routing.",
                                  }),
                                ],
                              }),
                            }),
                            e.jsx("div", {
                              className: "nls-card__body",
                              children: e.jsxs("div", {
                                className: "nls-grid-2",
                                children: [
                                  e.jsxs("div", {
                                    className: "nls-stack nls-stack--tight",
                                    children: [
                                      e.jsxs("div", {
                                        className: "nls-toggle-card",
                                        children: [
                                          e.jsxs("div", {
                                            className: "nls-toggle-card__body",
                                            children: [
                                              e.jsx("span", {
                                                className: "nls-toggle-card__title",
                                                children: "Enable Navigation",
                                              }),
                                              e.jsx("p", {
                                                className: "nls-toggle-card__hint",
                                                children: "Footer navigation menu auto-stack",
                                              }),
                                            ],
                                          }),
                                          e.jsx("div", {
                                            className: "nls-switch",
                                            role: "switch",
                                            "aria-checked": j.enableNavigation,
                                            "aria-label": "Enable Navigation",
                                            tabIndex: 0,
                                            onClick: () => Ee("enableNavigation", !j.enableNavigation),
                                            onKeyDown: (g) => {
                                              (g.key === " " || g.key === "Enter") &&
                                                (g.preventDefault(), Ee("enableNavigation", !j.enableNavigation));
                                            },
                                          }),
                                        ],
                                      }),
                                      e.jsxs("div", {
                                        className: "nls-field",
                                        children: [
                                          e.jsxs("span", {
                                            className: "nls-field__label",
                                            children: [
                                              "Events Email Template ",
                                              e.jsx(Tooltip, {
                                                text: "Used for Activity Notifications only — form submission data is NOT sent via this notification email.",
                                              }),
                                            ],
                                          }),
                                          e.jsxs("select", {
                                            value: j.selectedEmailTemplate,
                                            onChange: (g) => Ee("selectedEmailTemplate", g.target.value),
                                            "aria-label": "Events Email Template",
                                            children: [
                                              e.jsx("option", {
                                                value: "",
                                                children: "No Template Selected",
                                              }),
                                              A.map((g) =>
                                                e.jsx(
                                                  "option",
                                                  {
                                                    value: g.id,
                                                    children: g.name,
                                                  },
                                                  g.id,
                                                ),
                                              ),
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  e.jsxs("div", {
                                    className: "nls-stack nls-stack--tight",
                                    children: [
                                      e.jsxs("div", {
                                        className: "nls-toggle-card",
                                        children: [
                                          e.jsxs("div", {
                                            className: "nls-toggle-card__body",
                                            children: [
                                              e.jsx("span", {
                                                className: "nls-toggle-card__title",
                                                children: "Allow Client Access",
                                              }),
                                              e.jsx("p", {
                                                className: "nls-toggle-card__hint",
                                                children: "Temporary reporting access",
                                              }),
                                            ],
                                          }),
                                          e.jsx("div", {
                                            className: "nls-switch",
                                            role: "switch",
                                            "aria-checked": j.allowClientAccess,
                                            "aria-label": "Allow Client Access",
                                            tabIndex: 0,
                                            onClick: () => Ee("allowClientAccess", !j.allowClientAccess),
                                            onKeyDown: (g) => {
                                              (g.key === " " || g.key === "Enter") &&
                                                (g.preventDefault(), Ee("allowClientAccess", !j.allowClientAccess));
                                            },
                                          }),
                                        ],
                                      }),
                                      e.jsxs("div", {
                                        className: `nls-card nls-card--soft nls-set-client-panel${j.allowClientAccess ? "" : " is-disabled"}`,
                                        children: [
                                          e.jsxs("div", {
                                            className: "nls-field",
                                            children: [
                                              e.jsxs("span", {
                                                className: "nls-field__label",
                                                children: [
                                                  "Report URL slug ",
                                                  e.jsx(Tooltip, {
                                                    text: "Pretty URL path (save settings, then generate the link). Plain permalinks use a query-string URL automatically.",
                                                  }),
                                                ],
                                              }),
                                              e.jsx("input", {
                                                type: "text",
                                                value: j.clientAccessSlug,
                                                onChange: (g) => Ee("clientAccessSlug", g.target.value),
                                                placeholder: "report-access",
                                                "aria-label": "Report URL slug",
                                              }),
                                            ],
                                          }),
                                          e.jsxs("div", {
                                            className: "nls-grid-2",
                                            children: [
                                              e.jsxs("div", {
                                                className: "nls-field",
                                                children: [
                                                  e.jsx("span", {
                                                    className: "nls-field__label",
                                                    children: "Link name",
                                                  }),
                                                  e.jsx("input", {
                                                    type: "text",
                                                    value: P,
                                                    onChange: (g) => M(g.target.value),
                                                    placeholder: "Acme Corp",
                                                    "aria-label": "Link name",
                                                  }),
                                                ],
                                              }),
                                              e.jsxs("div", {
                                                className: "nls-field",
                                                children: [
                                                  e.jsxs("span", {
                                                    className: "nls-field__label",
                                                    children: [
                                                      "Expires in (days) ",
                                                      e.jsx(Tooltip, {
                                                        text: "0 keeps the link alive until you revoke it.",
                                                      }),
                                                    ],
                                                  }),
                                                  e.jsx("input", {
                                                    type: "number",
                                                    min: "0",
                                                    max: "730",
                                                    value: T,
                                                    onChange: (g) => F(g.target.value),
                                                    "aria-label": "Expires in (days)",
                                                  }),
                                                ],
                                              }),
                                            ],
                                          }),
                                          e.jsxs("div", {
                                            className: "nls-field",
                                            children: [
                                              e.jsxs("span", {
                                                className: "nls-field__label",
                                                children: [
                                                  "Sections this client may see ",
                                                  e.jsx(Tooltip, {
                                                    text: "Chat transcripts and form answers contain visitor personal data. The link only exposes what you tick here, and the export endpoint enforces it too.",
                                                  }),
                                                ],
                                              }),
                                              e.jsx("div", {
                                                className: "nls-check-grid",
                                                children: yf.map((g) =>
                                                  e.jsxs(
                                                    "label",
                                                    {
                                                      className: "nls-check",
                                                      children: [
                                                        e.jsx("input", {
                                                          type: "checkbox",
                                                          checked: V.includes(g.id),
                                                          onChange: () => dl(g.id),
                                                        }),
                                                        e.jsx("span", {
                                                          children: g.label,
                                                        }),
                                                      ],
                                                    },
                                                    g.id,
                                                  ),
                                                ),
                                              }),
                                            ],
                                          }),
                                          e.jsx("div", {
                                            className: "nls-row",
                                            children: e.jsxs("button", {
                                              type: "button",
                                              onClick: rs,
                                              className: "nls-btn nls-btn--primary",
                                              children: [
                                                e.jsx(md, {
                                                  size: 14,
                                                }),
                                                " Create share link",
                                              ],
                                            }),
                                          }),
                                          e.jsxs("div", {
                                            className: "nls-set-linkbox",
                                            children: [
                                              e.jsx("span", {
                                                className: "nls-set-linkbox__ico",
                                                "aria-hidden": "true",
                                                children: e.jsx(Bl, {
                                                  size: 16,
                                                }),
                                              }),
                                              p
                                                ? e.jsxs("div", {
                                                    className: "nls-input-group nls-set-grow",
                                                    children: [
                                                      e.jsx("input", {
                                                        readOnly: !0,
                                                        value: p,
                                                        className: "nls-mono",
                                                        "aria-label": "Share link",
                                                      }),
                                                      e.jsx("button", {
                                                        type: "button",
                                                        onClick: Xt,
                                                        className: `nls-icon-btn${x ? " is-success" : ""}`,
                                                        "aria-label": "Copy link",
                                                        children: x
                                                          ? e.jsx(Lt, {
                                                              size: 16,
                                                              className: "is-copied",
                                                            })
                                                          : e.jsx($s, {
                                                              size: 16,
                                                            }),
                                                      }),
                                                    ],
                                                  })
                                                : e.jsx("span", {
                                                    className: "nls-field__hint",
                                                    children: "Copy the link now — it is shown only once.",
                                                  }),
                                            ],
                                          }),
                                          S.length > 0
                                            ? e.jsx("div", {
                                                className: "nls-table-wrap",
                                                children: e.jsxs("table", {
                                                  className: "nls-table",
                                                  children: [
                                                    e.jsx("thead", {
                                                      children: e.jsxs("tr", {
                                                        children: [
                                                          e.jsx("th", {
                                                            children: "Name",
                                                          }),
                                                          e.jsx("th", {
                                                            children: "Sections",
                                                          }),
                                                          e.jsx("th", {
                                                            children: "Expires",
                                                          }),
                                                          e.jsx("th", {
                                                            children: "Opened",
                                                          }),
                                                          e.jsx("th", {
                                                            children: e.jsx("span", {
                                                              className: "sr-only",
                                                              children: "Actions",
                                                            }),
                                                          }),
                                                        ],
                                                      }),
                                                    }),
                                                    e.jsx("tbody", {
                                                      children: S.map((g) =>
                                                        e.jsxs(
                                                          "tr",
                                                          {
                                                            children: [
                                                              e.jsx("td", {
                                                                className: "is-strong",
                                                                children: g.label,
                                                              }),
                                                              e.jsx("td", {
                                                                className: "is-muted",
                                                                children: g.sections.join(", ") || "—",
                                                              }),
                                                              e.jsx("td", {
                                                                children: g.expires
                                                                  ? new Date(g.expires * 1e3).toLocaleDateString()
                                                                  : "Never",
                                                              }),
                                                              e.jsxs("td", {
                                                                children: [g.uses, "×"],
                                                              }),
                                                              e.jsx("td", {
                                                                className: "nls-set-td-end",
                                                                children: e.jsx("button", {
                                                                  type: "button",
                                                                  className: "nls-btn nls-btn--danger nls-btn--sm",
                                                                  onClick: () => ao(g.id),
                                                                  children: "Revoke",
                                                                }),
                                                              }),
                                                            ],
                                                          },
                                                          g.id,
                                                        ),
                                                      ),
                                                    }),
                                                  ],
                                                }),
                                              })
                                            : null,
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            }),
                          ],
                        }),
                        e.jsxs("section", {
                          className: "nls-card",
                          children: [
                            e.jsx("div", {
                              className: "nls-card__header",
                              children: e.jsxs("h2", {
                                className: "nls-card__title",
                                children: [
                                  e.jsx(Hl, {
                                    size: 18,
                                    "aria-hidden": "true",
                                  }),
                                  "Report & PDF Logo ",
                                  e.jsx(Tooltip, {
                                    text: "If uploaded, the logo appears above the site title in PDF reports; otherwise only the title shows.",
                                  }),
                                ],
                              }),
                            }),
                            e.jsx("div", {
                              className: "nls-card__body",
                              children: e.jsxs("div", {
                                className: "nls-grid-2",
                                children: [
                                  e.jsxs("div", {
                                    className: "nls-stack nls-stack--tight",
                                    children: [
                                      e.jsxs("div", {
                                        className: "nls-field",
                                        children: [
                                          e.jsxs("span", {
                                            className: "nls-field__label",
                                            children: [
                                              "Logo URL ",
                                              e.jsx(Tooltip, {
                                                text: "Source file min. 700 × 700 px for sharp PDF · transparent PNG/WebP · max 3 MB · Preview uses 70 × 70 px (no cropping or stretch).",
                                              }),
                                            ],
                                          }),
                                          e.jsxs("div", {
                                            className: "nls-input-group nls-set-wrap",
                                            children: [
                                              e.jsx("input", {
                                                type: "text",
                                                value: j.reportLogo,
                                                onChange: (g) => Ee("reportLogo", g.target.value),
                                                placeholder: "Paste an image URL or upload…",
                                                "aria-label": "Logo URL",
                                              }),
                                              e.jsx("input", {
                                                type: "file",
                                                accept: "image/*",
                                                className: "hidden",
                                                ref: H,
                                                onChange: lo,
                                              }),
                                              e.jsxs("button", {
                                                type: "button",
                                                onClick: () => {
                                                  var g, G;
                                                  return (G = (g = H.current) == null ? void 0 : g.click) == null
                                                    ? void 0
                                                    : G.call(g);
                                                },
                                                disabled: W,
                                                className: "nls-btn nls-btn--primary",
                                                children: [
                                                  W
                                                    ? e.jsx(Qn, {
                                                        size: 16,
                                                        className: "animate-spin",
                                                      })
                                                    : e.jsx(Vl, {
                                                        size: 16,
                                                      }),
                                                  "Upload",
                                                ],
                                              }),
                                              e.jsxs("button", {
                                                type: "button",
                                                onClick: () => Ee("reportLogo", ""),
                                                disabled: !j.reportLogo,
                                                className: "nls-btn nls-btn--secondary",
                                                children: [
                                                  e.jsx(_t, {
                                                    size: 16,
                                                  }),
                                                  " Remove",
                                                ],
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                      e.jsxs("div", {
                                        className: "nls-field",
                                        children: [
                                          e.jsxs("span", {
                                            className: "nls-field__label",
                                            children: [
                                              "Logo size in PDF ",
                                              e.jsx(Tooltip, {
                                                text: `Controls how large the logo prints in PDF reports. Range ${el}–${Ql} · default ${Vi}. The preview updates as you drag.`,
                                              }),
                                            ],
                                          }),
                                          e.jsxs("div", {
                                            className: "nls-set-size-row",
                                            children: [
                                              e.jsx(nlsRange, {
                                                min: el,
                                                max: Ql,
                                                step: "10",
                                                value: nt,
                                                onChange: (g) => Ee("reportLogoPdfMax", Number(g.target.value)),
                                                className: "nls-set-size-range",
                                                "aria-label": "Logo size in PDF reports",
                                              }),
                                              e.jsx("input", {
                                                type: "number",
                                                min: el,
                                                max: Ql,
                                                step: "10",
                                                value: j.reportLogoPdfMax ?? Vi,
                                                onChange: (g) =>
                                                  Ee(
                                                    "reportLogoPdfMax",
                                                    g.target.value === "" ? "" : Number(g.target.value),
                                                  ),
                                                onBlur: () => Ee("reportLogoPdfMax", nu(j.reportLogoPdfMax)),
                                                className: "nls-set-size-num",
                                                "aria-label": "Logo size in PDF reports (points)",
                                              }),
                                              e.jsx("span", {
                                                className: "nls-muted nls-text-sm",
                                                children: "pt",
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  e.jsxs("div", {
                                    className: "nls-field",
                                    children: [
                                      e.jsx("span", {
                                        className: "nls-field__label",
                                        children: "PDF report header preview",
                                      }),
                                      e.jsxs("div", {
                                        className: "nls-card nls-card--soft nls-set-preview",
                                        children: [
                                          e.jsx("div", {
                                            className: "nls-set-preview__logo",
                                            style: {
                                              width: `${ol}px`,
                                              height: `${ol}px`,
                                              minWidth: `${ol}px`,
                                              minHeight: `${ol}px`,
                                            },
                                            children: j.reportLogo
                                              ? e.jsx("img", {
                                                  src: j.reportLogo,
                                                  alt: "Report Logo",
                                                  className: "nls-set-preview__img",
                                                })
                                              : e.jsx(Hl, {
                                                  size: 22,
                                                  className: "nls-set-preview__empty",
                                                  "aria-hidden": !0,
                                                }),
                                          }),
                                          e.jsx("div", {
                                            className: "nls-set-preview__title",
                                            children:
                                              ((ur = window == null ? void 0 : window.nexulesuite_Admin) == null
                                                ? void 0
                                                : ur.siteName) || "Site Title",
                                          }),
                                          e.jsx("div", {
                                            className: "nls-set-preview__sub",
                                            children: "Activities Report",
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
                        e.jsxs("section", {
                          className: "nls-card",
                          children: [
                            e.jsx("div", {
                              className: "nls-card__header",
                              children: e.jsxs("h2", {
                                className: "nls-card__title",
                                children: [
                                  e.jsx(pd, {
                                    size: 18,
                                    "aria-hidden": "true",
                                  }),
                                  "Global Font Settings ",
                                  e.jsx(Tooltip, {
                                    text: "Font, size, weight & line height apply globally to all plugin frontend elements (Forms, Popups, Menu Items & Reports). Font files ship inside the plugin and load from your own server — no external requests.",
                                  }),
                                ],
                              }),
                            }),
                            e.jsx("div", {
                              className: "nls-card__body",
                              children: e.jsxs("div", {
                                className: "nls-grid-2",
                                children: [
                                  e.jsxs("div", {
                                    className: "nls-stack nls-stack--tight",
                                    children: [
                                      e.jsx("input", {
                                        type: "text",
                                        placeholder: "Search fonts...",
                                        value: C,
                                        onChange: (g) => J(g.target.value),
                                        "aria-label": "Search fonts",
                                      }),
                                      e.jsx("div", {
                                        className: "nls-set-font-list",
                                        role: "group",
                                        "aria-label": "Global font",
                                        children:
                                          dr.length === 0
                                            ? e.jsx("div", {
                                                className: "nls-empty-inline",
                                                children: "No fonts found",
                                              })
                                            : dr.map((g) => {
                                                const G = j.globalFont === g.family;
                                                return e.jsxs(
                                                  "button",
                                                  {
                                                    type: "button",
                                                    onClick: () => Ee("globalFont", g.family),
                                                    className: `nls-set-font-item${G ? " is-selected" : ""}`,
                                                    "aria-pressed": G,
                                                    style: {
                                                      fontFamily: `'${g.family}', ${g.category === "Serif" ? "serif" : g.category === "Monospace" ? "monospace" : "sans-serif"}`,
                                                    },
                                                    children: [
                                                      e.jsx("span", {
                                                        className: "nls-set-font-item__name",
                                                        children: g.family,
                                                      }),
                                                      e.jsx("span", {
                                                        className: "nls-set-font-item__cat",
                                                        children: g.category,
                                                      }),
                                                    ],
                                                  },
                                                  g.family,
                                                );
                                              }),
                                      }),
                                      e.jsxs("p", {
                                        className: "nls-field__hint nls-set-center",
                                        children: [
                                          GLOBAL_FONT_LIST.length,
                                          " fonts · bundled with the plugin · no external requests",
                                        ],
                                      }),
                                    ],
                                  }),
                                  e.jsxs("div", {
                                    className: "nls-card nls-card--soft nls-set-font-preview",
                                    style: {
                                      fontFamily: j.globalFont ? `'${j.globalFont}', sans-serif` : "inherit",
                                    },
                                    children: [
                                      e.jsxs("div", {
                                        className: "nls-between",
                                        children: [
                                          e.jsx("span", {
                                            className: "nls-eyebrow",
                                            children: "Live Preview",
                                          }),
                                          e.jsx("span", {
                                            className: "nls-badge nls-badge--primary",
                                            children: j.globalFont || "System Default",
                                          }),
                                        ],
                                      }),
                                      e.jsx("h2", {
                                        className: "nls-set-font-preview__h2",
                                        children: "The quick brown fox",
                                      }),
                                      e.jsx("h4", {
                                        className: "nls-set-font-preview__h4",
                                        children: "Jumps over the lazy dog",
                                      }),
                                      e.jsx("p", {
                                        className: "nls-set-font-preview__body",
                                        children:
                                          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                                      }),
                                      e.jsxs("div", {
                                        className: "nls-row",
                                        children: [
                                          e.jsx("button", {
                                            type: "button",
                                            className: "nls-btn nls-btn--primary",
                                            tabIndex: -1,
                                            "aria-hidden": "true",
                                            children: "Submit Form",
                                          }),
                                          e.jsx("button", {
                                            type: "button",
                                            className: "nls-btn nls-btn--secondary",
                                            tabIndex: -1,
                                            "aria-hidden": "true",
                                            children: "Chat Now",
                                          }),
                                        ],
                                      }),
                                      e.jsxs("div", {
                                        className: "nls-set-font-preview__demo",
                                        children: [
                                          e.jsx("span", {
                                            className: "nls-field__label",
                                            children: "Form Input",
                                          }),
                                          e.jsx("div", {
                                            className: "nls-set-font-preview__fake",
                                            style: {
                                              fontSize: `${Math.max(10, Math.min(24, parseInt(j.formFieldFontSize, 10) || 14))}px`,
                                            },
                                            children: "Type your name here...",
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
                      ],
                    }),
                  o === "popup" &&
                    e.jsxs("div", {
                      className: "nls-stack",
                      children: [
                        e.jsx("div", {
                          className: "nls-card",
                          children: e.jsxs("div", {
                            className: "nls-card__body nls-stack nls-stack--tight",
                            children: [
                              e.jsx(ToggleSwitch, {
                                checked: j.enableAutoPopup,
                                onChange: () => Ee("enableAutoPopup", !j.enableAutoPopup),
                                label: "Enable Auto POPUP",
                              }),
                              e.jsxs("div", {
                                className: "nls-field",
                                children: [
                                  e.jsx("label", {
                                    className: "nls-field__label",
                                    htmlFor: "nexulesuite_settings-button-classes",
                                    children: "Button Classes",
                                  }),
                                  e.jsx("textarea", {
                                    id: "nexulesuite_settings-button-classes",
                                    value: j.activityButtonClasses,
                                    onChange: (g) => Ee("activityButtonClasses", g.target.value),
                                    className: "nls-mono",
                                    rows: 3,
                                    placeholder: "nexas | xyz-pop, xyz-alert",
                                  }),
                                  e.jsxs("p", {
                                    className: "nls-field__hint",
                                    children: [
                                      "Each class should be separated by a comma. Use a pipe (",
                                      e.jsx("span", {
                                        className: "nls-code",
                                        children: "|",
                                      }),
                                      ") before class for popups.",
                                      e.jsx("br", {}),
                                      e.jsx("span", {
                                        className: "font-semibold",
                                        children: "Example:",
                                      }),
                                      " ",
                                      e.jsx("code", {
                                        className: "nls-code",
                                        children: "popupId | className",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                        e.jsxs("div", {
                          className: "nls-grid-2 items-stretch",
                          children: [
                            e.jsxs("section", {
                              className: "nls-card",
                              children: [
                                e.jsx("div", {
                                  className: "nls-card__header",
                                  children: e.jsxs("div", {
                                    className: "min-w-0",
                                    children: [
                                      e.jsxs("h2", {
                                        className: "nls-card__title",
                                        children: [
                                          e.jsx(um, {
                                            size: 18,
                                            "aria-hidden": "true",
                                          }),
                                          "Exclusion Rules",
                                        ],
                                      }),
                                      e.jsx("p", {
                                        className: "nls-card__desc",
                                        children:
                                          "Search or paste a URL, then select — auto popup will not show on those posts/pages.",
                                      }),
                                    ],
                                  }),
                                }),
                                e.jsxs("div", {
                                  className: "nls-card__body nls-stack nls-stack--tight",
                                  children: [
                                    e.jsxs("div", {
                                      className: "nls-field",
                                      children: [
                                        e.jsx("span", {
                                          className: "nls-field__label",
                                          children: "Exclude Posts",
                                        }),
                                        e.jsx("input", {
                                          type: "search",
                                          value: nlsExPostQ,
                                          onChange: (g) => setNlsExPostQ(g.target.value),
                                          placeholder: "Search posts by title…",
                                          autoComplete: "off",
                                          "aria-label": "Search posts by title",
                                        }),
                                        e.jsxs("div", {
                                          className: "nls-input-group",
                                          children: [
                                            e.jsx("input", {
                                              type: "url",
                                              value: nlsExPostLink,
                                              onChange: (g) => setNlsExPostLink(g.target.value),
                                              placeholder: "Paste post URL / link…",
                                              autoComplete: "off",
                                              "aria-label": "Paste post URL",
                                              onKeyDown: (g) => {
                                                g.key === "Enter" &&
                                                  (g.preventDefault(),
                                                  nlsExAddLink(
                                                    "post",
                                                    nlsExPostLink,
                                                    "excludePosts",
                                                    setNlsExPostHits,
                                                    setNlsExPostBusy,
                                                    setNlsExPostLink,
                                                  ));
                                              },
                                            }),
                                            e.jsx("button", {
                                              type: "button",
                                              className: "nls-btn nls-btn--secondary",
                                              disabled: nlsExPostBusy || !String(nlsExPostLink || "").trim(),
                                              onClick: () =>
                                                nlsExAddLink(
                                                  "post",
                                                  nlsExPostLink,
                                                  "excludePosts",
                                                  setNlsExPostHits,
                                                  setNlsExPostBusy,
                                                  setNlsExPostLink,
                                                ),
                                              children: nlsExPostBusy ? "…" : "Add",
                                            }),
                                          ],
                                        }),
                                        nlsExPostBusy &&
                                          e.jsx("p", {
                                            className: "nls-field__hint",
                                            children: "Searching…",
                                          }),
                                        !nlsExPostBusy &&
                                          nlsExPostHits.length > 0 &&
                                          e.jsx("div", {
                                            className: "nls-set-results",
                                            children: nlsExPostHits
                                              .filter((g) => !j.excludePosts.some((G) => Number(G.id) === Number(g.id)))
                                              .map((g) =>
                                                e.jsx(
                                                  "button",
                                                  {
                                                    type: "button",
                                                    className: "nls-list-row",
                                                    onClick: () => {
                                                      (nlsExPick("excludePosts", g),
                                                        setNlsExPostHits((re) =>
                                                          re.filter((be) => Number(be.id) !== Number(g.id)),
                                                        ));
                                                    },
                                                    children: e.jsxs("span", {
                                                      className: "nls-list-row__main",
                                                      children: [
                                                        e.jsx("span", {
                                                          className: "nls-list-row__title",
                                                          children: g.title,
                                                        }),
                                                        e.jsx("span", {
                                                          className: "nls-list-row__meta",
                                                          children: "#" + g.id,
                                                        }),
                                                      ],
                                                    }),
                                                  },
                                                  g.id,
                                                ),
                                              ),
                                          }),
                                        j.excludePosts.length > 0 &&
                                          e.jsx("div", {
                                            className: "nls-row",
                                            children: j.excludePosts.map((g) =>
                                              e.jsxs(
                                                "span",
                                                {
                                                  className: "nls-badge nls-badge--primary nls-set-chip",
                                                  children: [
                                                    g.title,
                                                    e.jsx("button", {
                                                      type: "button",
                                                      className: "nls-icon-btn nls-icon-btn--sm nls-set-chip__remove",
                                                      onClick: () => ul("excludePosts", g),
                                                      "aria-label": `Remove ${g.title}`,
                                                      children: e.jsx(_t, {
                                                        size: 12,
                                                      }),
                                                    }),
                                                  ],
                                                },
                                                g.id,
                                              ),
                                            ),
                                          }),
                                      ],
                                    }),
                                    e.jsxs("div", {
                                      className: "nls-field",
                                      children: [
                                        e.jsx("span", {
                                          className: "nls-field__label",
                                          children: "Exclude Pages",
                                        }),
                                        e.jsx("input", {
                                          type: "search",
                                          value: nlsExPageQ,
                                          onChange: (g) => setNlsExPageQ(g.target.value),
                                          placeholder: "Search pages by title…",
                                          autoComplete: "off",
                                          "aria-label": "Search pages by title",
                                        }),
                                        e.jsxs("div", {
                                          className: "nls-input-group",
                                          children: [
                                            e.jsx("input", {
                                              type: "url",
                                              value: nlsExPageLink,
                                              onChange: (g) => setNlsExPageLink(g.target.value),
                                              placeholder: "Paste page URL / link…",
                                              autoComplete: "off",
                                              "aria-label": "Paste page URL",
                                              onKeyDown: (g) => {
                                                g.key === "Enter" &&
                                                  (g.preventDefault(),
                                                  nlsExAddLink(
                                                    "page",
                                                    nlsExPageLink,
                                                    "excludePages",
                                                    setNlsExPageHits,
                                                    setNlsExPageBusy,
                                                    setNlsExPageLink,
                                                  ));
                                              },
                                            }),
                                            e.jsx("button", {
                                              type: "button",
                                              className: "nls-btn nls-btn--secondary",
                                              disabled: nlsExPageBusy || !String(nlsExPageLink || "").trim(),
                                              onClick: () =>
                                                nlsExAddLink(
                                                  "page",
                                                  nlsExPageLink,
                                                  "excludePages",
                                                  setNlsExPageHits,
                                                  setNlsExPageBusy,
                                                  setNlsExPageLink,
                                                ),
                                              children: nlsExPageBusy ? "…" : "Add",
                                            }),
                                          ],
                                        }),
                                        nlsExPageBusy &&
                                          e.jsx("p", {
                                            className: "nls-field__hint",
                                            children: "Searching…",
                                          }),
                                        !nlsExPageBusy &&
                                          nlsExPageHits.length > 0 &&
                                          e.jsx("div", {
                                            className: "nls-set-results",
                                            children: nlsExPageHits
                                              .filter((g) => !j.excludePages.some((G) => Number(G.id) === Number(g.id)))
                                              .map((g) =>
                                                e.jsx(
                                                  "button",
                                                  {
                                                    type: "button",
                                                    className: "nls-list-row",
                                                    onClick: () => {
                                                      (nlsExPick("excludePages", g),
                                                        setNlsExPageHits((re) =>
                                                          re.filter((be) => Number(be.id) !== Number(g.id)),
                                                        ));
                                                    },
                                                    children: e.jsxs("span", {
                                                      className: "nls-list-row__main",
                                                      children: [
                                                        e.jsx("span", {
                                                          className: "nls-list-row__title",
                                                          children: g.title,
                                                        }),
                                                        e.jsx("span", {
                                                          className: "nls-list-row__meta",
                                                          children: "#" + g.id,
                                                        }),
                                                      ],
                                                    }),
                                                  },
                                                  g.id,
                                                ),
                                              ),
                                          }),
                                        j.excludePages.length > 0 &&
                                          e.jsx("div", {
                                            className: "nls-row",
                                            children: j.excludePages.map((g) =>
                                              e.jsxs(
                                                "span",
                                                {
                                                  className: "nls-badge nls-badge--success nls-set-chip",
                                                  children: [
                                                    g.title,
                                                    e.jsx("button", {
                                                      type: "button",
                                                      className: "nls-icon-btn nls-icon-btn--sm nls-set-chip__remove",
                                                      onClick: () => ul("excludePages", g),
                                                      "aria-label": `Remove ${g.title}`,
                                                      children: e.jsx(_t, {
                                                        size: 12,
                                                      }),
                                                    }),
                                                  ],
                                                },
                                                g.id,
                                              ),
                                            ),
                                          }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsxs("section", {
                              className: ["nls-card nls-set-slots", j.enableAutoPopup ? "" : "is-disabled"].join(" "),
                              children: [
                                e.jsxs("div", {
                                  className: "nls-card__header",
                                  children: [
                                    e.jsxs("div", {
                                      className: "min-w-0",
                                      children: [
                                        e.jsxs("h2", {
                                          className: "nls-card__title",
                                          children: [
                                            e.jsx(Wl, {
                                              size: 18,
                                              "aria-hidden": !0,
                                            }),
                                            "Default Nexus forms (timer / scroll / exit)",
                                          ],
                                        }),
                                        e.jsxs("p", {
                                          className: "nls-card__desc",
                                          children: [
                                            "Add one or more form slots — same idea as ",
                                            e.jsx("strong", {
                                              children: "Emails → template layers",
                                            }),
                                            ". Order is top to bottom in the popup.",
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsxs("button", {
                                      type: "button",
                                      onClick: () => St((g) => [...g, lu()]),
                                      className: "nls-btn nls-btn--dashed nls-btn--sm",
                                      children: [
                                        e.jsx(dt, {
                                          size: 14,
                                        }),
                                        " Add form slot",
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "nls-card__body nls-stack nls-stack--tight nls-set-slots__body",
                                  children: [
                                    Xe.length === 0
                                      ? e.jsxs("div", {
                                          className: "nls-empty nls-set-grow",
                                          children: [
                                            e.jsx("p", {
                                              className: "nls-empty__title",
                                              children: "No default Nexus forms configured",
                                            }),
                                            e.jsxs("p", {
                                              className: "nls-empty__desc",
                                              children: [
                                                "Leave this empty or add slots and pick a Nexus form in each dropdown. Multiple forms append in sequence when ",
                                                e.jsx("strong", {
                                                  children: "Popup Body",
                                                }),
                                                " is empty.",
                                              ],
                                            }),
                                            e.jsx("div", {
                                              className: "nls-empty__actions",
                                              children: e.jsxs("button", {
                                                type: "button",
                                                onClick: () => St([lu()]),
                                                className: "nls-btn nls-btn--dashed",
                                                children: [
                                                  e.jsx(dt, {
                                                    size: 16,
                                                  }),
                                                  " Add first form slot",
                                                ],
                                              }),
                                            }),
                                          ],
                                        })
                                      : e.jsx("ul", {
                                          className: "nls-set-followup-list",
                                          children: Xe.map((g, G) =>
                                            e.jsxs(
                                              "li",
                                              {
                                                className: "nls-set-row",
                                                children: [
                                                  e.jsx("span", {
                                                    className: "nls-badge nls-badge--muted nls-set-num",
                                                    children: G + 1,
                                                  }),
                                                  e.jsxs("select", {
                                                    value: g.formId,
                                                    onChange: (re) => {
                                                      const be = re.target.value;
                                                      St((je) =>
                                                        je.map((Ae) =>
                                                          Ae.rowKey === g.rowKey
                                                            ? {
                                                                ...Ae,
                                                                formId: be,
                                                              }
                                                            : Ae,
                                                        ),
                                                      );
                                                    },
                                                    className: "nls-set-grow",
                                                    "aria-label": `Default Nexus form slot ${G + 1}`,
                                                    children: [
                                                      e.jsx("option", {
                                                        value: "",
                                                        children: "— Skip this slot —",
                                                      }),
                                                      ve.map((re) =>
                                                        e.jsxs(
                                                          "option",
                                                          {
                                                            value: re.id,
                                                            children: [re.name, " (Nexus)"],
                                                          },
                                                          re.id,
                                                        ),
                                                      ),
                                                    ],
                                                  }),
                                                  e.jsx("button", {
                                                    type: "button",
                                                    title: "Remove this slot",
                                                    "aria-label": "Remove this slot",
                                                    onClick: () =>
                                                      St((re) => re.filter((be) => be.rowKey !== g.rowKey)),
                                                    className: "nls-icon-btn nls-icon-btn--danger",
                                                    children: e.jsx(yt, {
                                                      size: 16,
                                                    }),
                                                  }),
                                                ],
                                              },
                                              g.rowKey,
                                            ),
                                          ),
                                        }),
                                    e.jsxs("p", {
                                      className: "nls-field__hint nls-set-slots__note",
                                      children: [
                                        e.jsx("strong", {
                                          children: "Nexus Form Builder",
                                        }),
                                        " only. Prepend runs ",
                                        e.jsx("strong", {
                                          children: "only when the popup body is completely empty",
                                        }),
                                        " and the popup uses timer, scroll, or exit. If ",
                                        e.jsx("strong", {
                                          children: "Popups → Popup Body",
                                        }),
                                        " has any shortcode or HTML, nothing is prepended. Third-party forms: paste their shortcode in the body and remove these slots.",
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  o === "ai" &&
                    e.jsxs(e.Fragment, {
                      children: [
                        e.jsx("div", {
                          className: "nls-pills",
                          role: "group",
                          "aria-label": "AI Chatbot sections",
                          children: [
                            {
                              id: "setup",
                              label: "Model & Knowledge",
                            },
                            {
                              id: "livechat",
                              label: "Live Chat",
                            },
                            {
                              id: "faq",
                              label: "FAQ & Buttons",
                            },
                            {
                              id: "autosetup",
                              label: "Auto-Setup",
                            },
                          ].map((g) =>
                            e.jsx(
                              "button",
                              {
                                type: "button",
                                onClick: () => {
                                  u(g.id);
                                  if (g.id === "setup") {
                                    (async () => {
                                      try {
                                        const { res: __r, json: __j } = await settingsFetch("/settings/general", {
                                          method: "GET",
                                        });
                                        if (__r.ok && __j != null && __j.success) {
                                          const __s = (__j.data || {}).settings || {};
                                          le((__p) => ({
                                            ...__p,
                                            ...__s,
                                            ...Ki(__s),
                                          }));
                                          sl(Wi(__s));
                                        }
                                      } catch (__e) {}
                                    })();
                                  }
                                },
                                className: "nls-pill",
                                "aria-pressed": d === g.id,
                                children: g.label,
                              },
                              g.id,
                            ),
                          ),
                        }),
                        d === "setup" &&
                          e.jsxs("div", {
                            className: "nls-stack",
                            children: [
                              e.jsxs("section", {
                                className: "nls-card",
                                children: [
                                  e.jsx("div", {
                                    className: "nls-card__header",
                                    children: e.jsxs("h2", {
                                      className: "nls-card__title",
                                      children: [
                                        e.jsx(Gs, {
                                          size: 18,
                                          "aria-hidden": "true",
                                        }),
                                        "AI Connection ",
                                        e.jsx(Tooltip, {
                                          text: "Choose which AI model answers your visitors. In Model API mode WordPress calls the provider directly — no server to run. Keys are encrypted at rest and never sent to the browser.",
                                        }),
                                      ],
                                    }),
                                  }),
                                  e.jsxs("div", {
                                    className: "nls-card__body nls-stack nls-stack--tight",
                                    children: [
                                      e.jsxs("div", {
                                        className: "nls-toggle-card nls-set-switch-row",
                                        role: "switch",
                                        "aria-checked": !!j.aiEnabled,
                                        tabIndex: 0,
                                        onClick: () => Ee("aiEnabled", !j.aiEnabled),
                                        onKeyDown: (g) => {
                                          (g.key === " " || g.key === "Enter") &&
                                            (g.preventDefault(), Ee("aiEnabled", !j.aiEnabled));
                                        },
                                        children: [
                                          e.jsx("span", {
                                            className: "nls-toggle-card__body nls-toggle-card__title",
                                            children: "Enable AI chat mode in the Livechat widget",
                                          }),
                                          e.jsx("span", {
                                            className: `nls-switch${j.aiEnabled ? " is-on" : ""}`,
                                          }),
                                        ],
                                      }),
                                      e.jsx("div", {
                                        className: "nls-grid-2",
                                        role: "group",
                                        "aria-label": "Connection mode",
                                        children: [
                                          {
                                            id: "direct",
                                            icon: e.jsx(Gs, {
                                              size: 16,
                                            }),
                                            title: "Model API",
                                            copy: "Connect straight to OpenAI, Claude, Gemini, Groq and more with an API key. Nothing to host.",
                                          },
                                          {
                                            id: "server",
                                            icon: e.jsx(Ia, {
                                              size: 16,
                                            }),
                                            title: "Self-hosted server",
                                            copy: "Proxy through your own Nexus AI Server (FastAPI + Ollama) on a VPS or localhost.",
                                          },
                                        ].map((g) => {
                                          const G = (j.aiConnMode || "direct") === g.id;
                                          return e.jsxs(
                                            "button",
                                            {
                                              type: "button",
                                              onClick: () => Ee("aiConnMode", g.id),
                                              className: `nls-card nls-card--soft nls-set-mode${G ? " is-active" : ""}`,
                                              "aria-pressed": G,
                                              children: [
                                                e.jsxs("span", {
                                                  className: "nls-set-mode__title",
                                                  children: [
                                                    g.icon,
                                                    g.title,
                                                    G
                                                      ? e.jsx(Lt, {
                                                          size: 14,
                                                          className: "ml-auto",
                                                          "aria-hidden": "true",
                                                        })
                                                      : null,
                                                  ],
                                                }),
                                                e.jsx("span", {
                                                  className: "nls-set-mode__copy",
                                                  children: g.copy,
                                                }),
                                              ],
                                            },
                                            g.id,
                                          );
                                        }),
                                      }),
                                      e.jsxs("div", {
                                        className: "nls-notice nls-notice--info",
                                        children: [
                                          e.jsx(Ys, {
                                            size: 16,
                                            "aria-hidden": "true",
                                          }),
                                          e.jsxs("p", {
                                            children: [
                                              "Test & Train use your ",
                                              e.jsx("strong", {
                                                children: "saved",
                                              }),
                                              " settings — click ",
                                              e.jsx("strong", {
                                                children: "Save Configuration",
                                              }),
                                              " (bottom bar) after changing anything here, then Test.",
                                            ],
                                          }),
                                        ],
                                      }),
                                      (j.aiConnMode || "direct") === "server"
                                        ? e.jsxs("div", {
                                            className: "nls-grid-2",
                                            children: [
                                              e.jsxs("div", {
                                                className: "nls-field",
                                                children: [
                                                  e.jsxs("span", {
                                                    className: "nls-field__label",
                                                    children: [
                                                      "Server URL ",
                                                      e.jsx(Tooltip, {
                                                        text: "Base URL of your AI server, e.g. https://ai.your-domain.com — no trailing path.",
                                                      }),
                                                    ],
                                                  }),
                                                  e.jsx("input", {
                                                    type: "url",
                                                    value: j.aiServerUrl,
                                                    onChange: (g) => Ee("aiServerUrl", g.target.value),
                                                    placeholder: "https://ai.your-domain.com",
                                                    autoComplete: "off",
                                                    spellCheck: !1,
                                                    "aria-label": "Server URL",
                                                  }),
                                                ],
                                              }),
                                              e.jsxs("div", {
                                                className: "nls-field",
                                                children: [
                                                  e.jsx("span", {
                                                    className: "nls-field__label",
                                                    children: "Server API Key",
                                                  }),
                                                  e.jsx("input", {
                                                    type: "password",
                                                    value: j.aiApiKey,
                                                    onChange: (g) => Ee("aiApiKey", g.target.value),
                                                    placeholder: j.hasAiKey
                                                      ? "•••••••• saved — leave blank to keep"
                                                      : "Bearer API key (from your server .env)",
                                                    autoComplete: "new-password",
                                                    "aria-label": "Server API Key",
                                                  }),
                                                  e.jsx("p", {
                                                    className: "nls-field__hint",
                                                    children: j.hasAiKey
                                                      ? "A key is saved (encrypted). Leave blank to keep it, or type a new one to replace."
                                                      : "Stored encrypted (AES-256-GCM) — never shown again after saving.",
                                                  }),
                                                ],
                                              }),
                                            ],
                                          })
                                        : null,
                                      e.jsxs("div", {
                                        className: "nls-grid-2",
                                        children: [
                                          e.jsxs("div", {
                                            className: "nls-field",
                                            children: [
                                              e.jsxs("span", {
                                                className: "nls-field__label",
                                                children: [
                                                  "Chat provider ",
                                                  e.jsx(Tooltip, {
                                                    text: "Which company’s model writes the replies. In self-hosted mode only the provider name is sent to your server — it resolves the endpoint itself.",
                                                  }),
                                                ],
                                              }),
                                              e.jsxs("select", {
                                                value: j.aiLlmProvider,
                                                "aria-label": "Chat provider",
                                                onChange: (g) => {
                                                  const G = g.target.value;
                                                  (le((re) => {
                                                    var be;
                                                    return {
                                                      ...re,
                                                      aiLlmProvider: G,
                                                      aiLlmModel:
                                                        ((be = ss(re, G)) == null ? void 0 : be.chatModel) || "",
                                                      aiLlmApiKey: "",
                                                    };
                                                  }),
                                                    vs(null));
                                                },
                                                children: [
                                                  e.jsx("option", {
                                                    value: "",
                                                    children:
                                                      (j.aiConnMode || "direct") === "direct"
                                                        ? "Select a provider…"
                                                        : "Use the AI server's own setting",
                                                  }),
                                                  bf(j, j.aiConnMode || "direct").map((g) =>
                                                    e.jsx(
                                                      "option",
                                                      {
                                                        value: g.id,
                                                        children: g.label,
                                                      },
                                                      g.id,
                                                    ),
                                                  ),
                                                ],
                                              }),
                                            ],
                                          }),
                                          e.jsxs("div", {
                                            className: "nls-field",
                                            children: [
                                              e.jsxs("span", {
                                                className: "nls-field__label",
                                                children: [
                                                  "Model ",
                                                  e.jsx(Tooltip, {
                                                    text: "Exact model id, e.g. gpt-4o-mini. Any id the provider accepts works — the list is only a shortcut.",
                                                  }),
                                                ],
                                              }),
                                              e.jsx("input", {
                                                type: "text",
                                                list: "nexulesuite_ai-model-suggestions",
                                                value: j.aiLlmModel,
                                                onChange: (g) => Ee("aiLlmModel", g.target.value),
                                                placeholder:
                                                  ((pr = ss(j, j.aiLlmProvider)) == null ? void 0 : pr.chatModel) ||
                                                  "gpt-4o-mini",
                                                autoComplete: "off",
                                                spellCheck: !1,
                                                "aria-label": "Model",
                                              }),
                                              e.jsx("datalist", {
                                                id: "nexulesuite_ai-model-suggestions",
                                                children: (
                                                  ((ml = ss(j, j.aiLlmProvider)) == null ? void 0 : ml.chatModels) || []
                                                ).map((g) =>
                                                  e.jsx(
                                                    "option",
                                                    {
                                                      value: g,
                                                    },
                                                    g,
                                                  ),
                                                ),
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                      j.aiLlmProvider && j.aiLlmProvider !== "ollama"
                                        ? e.jsxs("div", {
                                            className: "nls-field",
                                            children: [
                                              e.jsxs("span", {
                                                className: "nls-field__label",
                                                children: [er(j, j.aiLlmProvider), " API Key"],
                                              }),
                                              e.jsx("input", {
                                                type: "password",
                                                value: j.aiLlmApiKey,
                                                onChange: (g) => Ee("aiLlmApiKey", g.target.value),
                                                placeholder: rl
                                                  ? "•••••••• saved — leave blank to keep"
                                                  : ((na = ss(j, j.aiLlmProvider)) == null ? void 0 : na.keyHint) ||
                                                    "Provider API key",
                                                autoComplete: "new-password",
                                                "aria-label": `${er(j, j.aiLlmProvider)} API Key`,
                                              }),
                                              e.jsxs("p", {
                                                className: "nls-field__hint",
                                                children: [
                                                  rl
                                                    ? "A key is saved (encrypted). Leave blank to keep it, or type a new one to replace."
                                                    : `Paste your ${er(j, j.aiLlmProvider)} key — each provider needs its own. Stored encrypted (AES-256-GCM), never sent to the browser.`,
                                                  (xl = ss(j, j.aiLlmProvider)) != null && xl.keyUrl
                                                    ? e.jsxs(e.Fragment, {
                                                        children: [
                                                          " Get one at ",
                                                          e.jsx("a", {
                                                            href: ss(j, j.aiLlmProvider).keyUrl,
                                                            target: "_blank",
                                                            rel: "noreferrer",
                                                            className: "nls-link",
                                                            children: ss(j, j.aiLlmProvider).keyUrl.replace(
                                                              /^https:\/\//,
                                                              "",
                                                            ),
                                                          }),
                                                          ".",
                                                        ],
                                                      })
                                                    : null,
                                                ],
                                              }),
                                            ],
                                          })
                                        : null,
                                      j.aiLlmProvider &&
                                      !((nn = ss(j, j.aiLlmProvider)) != null && nn.vision) &&
                                      j.aiAllowImages
                                        ? e.jsxs("div", {
                                            className: "nls-notice nls-notice--warning",
                                            children: [
                                              e.jsx(Ss, {
                                                size: 16,
                                                "aria-hidden": "true",
                                              }),
                                              e.jsxs("span", {
                                                children: [
                                                  er(j, j.aiLlmProvider),
                                                  " cannot read images with this model. Visitors can still attach one, but the assistant will ask them to describe it instead.",
                                                ],
                                              }),
                                            ],
                                          })
                                        : null,
                                      (j.aiConnMode || "direct") === "server" &&
                                      j.aiLlmProvider &&
                                      j.aiLlmProvider !== "ollama" &&
                                      /^http:\/\//i.test(j.aiServerUrl || "") &&
                                      !/^http:\/\/(localhost|127\.0\.0\.1)/i.test(j.aiServerUrl || "")
                                        ? e.jsxs("div", {
                                            className: "nls-notice nls-notice--warning",
                                            children: [
                                              e.jsx(Ss, {
                                                size: 16,
                                                "aria-hidden": "true",
                                              }),
                                              e.jsx("span", {
                                                children:
                                                  "Your AI server URL is plain http:// — the provider key is sent to it on every message. Use https:// for a remote server.",
                                              }),
                                            ],
                                          })
                                        : null,
                                      e.jsx("div", {
                                        className: "nls-row",
                                        children: e.jsxs("button", {
                                          type: "button",
                                          onClick: eo,
                                          disabled: gs,
                                          className: "nls-btn nls-btn--secondary",
                                          children: [
                                            gs
                                              ? e.jsx(Qn, {
                                                  size: 14,
                                                  className: "animate-spin",
                                                })
                                              : e.jsx(Ci, {
                                                  size: 14,
                                                }),
                                            gs ? "Testing…" : "Test Connection",
                                          ],
                                        }),
                                      }),
                                      tl
                                        ? e.jsxs("div", {
                                            className: `nls-notice ${tl.ok ? "nls-notice--success" : "nls-notice--danger"}`,
                                            role: "status",
                                            children: [
                                              tl.ok
                                                ? e.jsx(Lt, {
                                                    size: 16,
                                                    "aria-hidden": "true",
                                                  })
                                                : e.jsx(Ss, {
                                                    size: 16,
                                                    "aria-hidden": "true",
                                                  }),
                                              e.jsx("span", {
                                                children: tl.text,
                                              }),
                                            ],
                                          })
                                        : null,
                                    ],
                                  }),
                                ],
                              }),
                              e.jsxs("section", {
                                className: "nls-card",
                                children: [
                                  e.jsx("div", {
                                    className: "nls-card__header",
                                    children: e.jsxs("h2", {
                                      className: "nls-card__title",
                                      children: [
                                        e.jsx(Gn, {
                                          size: 18,
                                          "aria-hidden": "true",
                                        }),
                                        "Knowledge Base (Training) ",
                                        e.jsx(Tooltip, {
                                          text: "Train Now chunks your published posts, pages and products, turns each chunk into a vector, and stores it so the chatbot can quote your real content.",
                                        }),
                                      ],
                                    }),
                                  }),
                                  e.jsxs("div", {
                                    className: "nls-card__body nls-stack nls-stack--tight",
                                    children: [
                                      as === "direct"
                                        ? e.jsxs(e.Fragment, {
                                            children: [
                                              e.jsxs("div", {
                                                className: "nls-grid-2",
                                                children: [
                                                  e.jsxs("div", {
                                                    className: "nls-field",
                                                    children: [
                                                      e.jsxs("span", {
                                                        className: "nls-field__label",
                                                        children: [
                                                          "Embedding provider ",
                                                          e.jsx(Tooltip, {
                                                            text: "Turns your content into vectors so the chatbot can find the right passage. OpenRouter, OpenAI, Gemini, Mistral and Voyage can all do this — leave it on “Same as chat provider” to reuse your chat key, so one key powers both. Claude and Groq have no embeddings API, so pair those with one of the above.",
                                                          }),
                                                        ],
                                                      }),
                                                      e.jsxs("select", {
                                                        value: j.aiEmbedProvider,
                                                        "aria-label": "Embedding provider",
                                                        onChange: (g) => {
                                                          const G = g.target.value;
                                                          (le((re) => {
                                                            var be;
                                                            return {
                                                              ...re,
                                                              aiEmbedProvider: G,
                                                              aiEmbedModel:
                                                                ((be = ss(re, G)) == null ? void 0 : be.embedModel) ||
                                                                "",
                                                              aiEmbedApiKey: "",
                                                            };
                                                          }),
                                                            vs(null));
                                                        },
                                                        children: [
                                                          e.jsx("option", {
                                                            value: "",
                                                            children:
                                                              ht != null && ht.embed
                                                                ? `Same as chat provider (${ht.label})`
                                                                : "Select an embedding provider…",
                                                          }),
                                                          jf(j).map((g) =>
                                                            e.jsx(
                                                              "option",
                                                              {
                                                                value: g.id,
                                                                children: g.label,
                                                              },
                                                              g.id,
                                                            ),
                                                          ),
                                                        ],
                                                      }),
                                                    ],
                                                  }),
                                                  e.jsxs("div", {
                                                    className: "nls-field",
                                                    children: [
                                                      e.jsxs("span", {
                                                        className: "nls-field__label",
                                                        children: [
                                                          "Embedding model ",
                                                          e.jsx(Tooltip, {
                                                            text: "Leave blank for the provider default. Changing this changes the vector size, which invalidates everything already indexed — re-train after switching.",
                                                          }),
                                                        ],
                                                      }),
                                                      e.jsx("input", {
                                                        type: "text",
                                                        list: "nexulesuite_ai-embed-suggestions",
                                                        value: j.aiEmbedModel,
                                                        onChange: (g) => Ee("aiEmbedModel", g.target.value),
                                                        placeholder:
                                                          (Et == null ? void 0 : Et.embedModel) ||
                                                          "text-embedding-3-small",
                                                        autoComplete: "off",
                                                        spellCheck: !1,
                                                        "aria-label": "Embedding model",
                                                      }),
                                                      e.jsx("datalist", {
                                                        id: "nexulesuite_ai-embed-suggestions",
                                                        children: ((Et == null ? void 0 : Et.embedModels) || []).map(
                                                          (g) =>
                                                            e.jsx(
                                                              "option",
                                                              {
                                                                value: g,
                                                              },
                                                              g,
                                                            ),
                                                        ),
                                                      }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                              Ts && !En
                                                ? e.jsxs("div", {
                                                    className: "nls-field",
                                                    children: [
                                                      e.jsxs("span", {
                                                        className: "nls-field__label",
                                                        children: [er(j, Ts), " API Key (embeddings)"],
                                                      }),
                                                      e.jsx("input", {
                                                        type: "password",
                                                        value: j.aiEmbedApiKey,
                                                        onChange: (g) => Ee("aiEmbedApiKey", g.target.value),
                                                        placeholder: il
                                                          ? "•••••••• saved — leave blank to keep"
                                                          : (Et == null ? void 0 : Et.keyHint) ||
                                                            "Embedding provider API key",
                                                        autoComplete: "new-password",
                                                        "aria-label": `${er(j, Ts)} API Key (embeddings)`,
                                                      }),
                                                      e.jsxs("p", {
                                                        className: "nls-field__hint",
                                                        children: [
                                                          il
                                                            ? "A key is saved (encrypted). Leave blank to keep it, or type a new one to replace."
                                                            : "Stored encrypted (AES-256-GCM), never sent to the browser.",
                                                          Et != null && Et.keyUrl
                                                            ? e.jsxs(e.Fragment, {
                                                                children: [
                                                                  " Get one at ",
                                                                  e.jsx("a", {
                                                                    href: Et.keyUrl,
                                                                    target: "_blank",
                                                                    rel: "noreferrer",
                                                                    className: "nls-link",
                                                                    children: Et.keyUrl.replace(/^https:\/\//, ""),
                                                                  }),
                                                                  ".",
                                                                ],
                                                              })
                                                            : null,
                                                        ],
                                                      }),
                                                    ],
                                                  })
                                                : null,
                                              or && En
                                                ? e.jsxs("div", {
                                                    className: "nls-notice nls-notice--success",
                                                    children: [
                                                      e.jsx(Ci, {
                                                        size: 16,
                                                        "aria-hidden": "true",
                                                      }),
                                                      e.jsxs("span", {
                                                        children: [
                                                          "One key covers everything — your ",
                                                          ht == null ? void 0 : ht.label,
                                                          " chat key also powers embeddings, so there’s nothing to add here. Just Save, then Train.",
                                                        ],
                                                      }),
                                                    ],
                                                  })
                                                : null,
                                              or
                                                ? null
                                                : e.jsxs("div", {
                                                    className: "nls-notice nls-notice--warning",
                                                    children: [
                                                      e.jsx(Ss, {
                                                        size: 16,
                                                        "aria-hidden": "true",
                                                      }),
                                                      e.jsx("span", {
                                                        children: Ts
                                                          ? En
                                                            ? `Add your ${(ht == null ? void 0 : ht.label) || "chat provider"} key in the Model API section above, then Save — the same key powers training.`
                                                            : "Add the embedding provider’s API key, then Save — until then the chatbot answers without knowing your site content."
                                                          : "Pick an embedding provider, then Save. Without one the chatbot cannot search your pages and will answer from general knowledge only.",
                                                      }),
                                                    ],
                                                  }),
                                              e.jsxs("div", {
                                                className: "nls-notice",
                                                children: [
                                                  e.jsx(Gn, {
                                                    size: 16,
                                                    "aria-hidden": "true",
                                                  }),
                                                  e.jsxs("span", {
                                                    className: "nls-row",
                                                    children: [
                                                      e.jsx("strong", {
                                                        children: "Indexed now:",
                                                      }),
                                                      e.jsxs("span", {
                                                        children: [
                                                          ((hr = j.aiIndex) == null ? void 0 : hr.documents) || 0,
                                                          " document(s)",
                                                        ],
                                                      }),
                                                      e.jsxs("span", {
                                                        children: [
                                                          ((fl = j.aiIndex) == null ? void 0 : fl.chunks) || 0,
                                                          " chunk(s)",
                                                        ],
                                                      }),
                                                      (qe = j.aiIndex) != null && qe.dims
                                                        ? e.jsxs("span", {
                                                            children: [j.aiIndex.dims, "-dimension vectors"],
                                                          })
                                                        : null,
                                                    ],
                                                  }),
                                                ],
                                              }),
                                            ],
                                          })
                                        : null,
                                      e.jsxs("div", {
                                        className: "nls-field",
                                        children: [
                                          e.jsx("label", {
                                            className: "nls-field__label",
                                            htmlFor: "nexulesuite_settings-ai-manual-qa",
                                            children: "Extra notes / Q&A (optional)",
                                          }),
                                          e.jsx("textarea", {
                                            id: "nexulesuite_settings-ai-manual-qa",
                                            rows: 5,
                                            value: j.aiManualQa,
                                            onChange: (g) => Ee("aiManualQa", g.target.value),
                                            placeholder: `Add facts the chatbot should always know, e.g.
Q: What is your refund policy?
A: 30-day money-back guarantee on annual plans.`,
                                          }),
                                          e.jsx("p", {
                                            className: "nls-field__hint",
                                            children:
                                              "Included in training alongside your posts & pages. Save first, then Train.",
                                          }),
                                        ],
                                      }),
                                      e.jsxs("div", {
                                        className: "nls-row",
                                        children: [
                                          e.jsxs("button", {
                                            type: "button",
                                            onClick: to,
                                            disabled: Ds || Zs,
                                            className: "nls-btn nls-btn--primary",
                                            children: [
                                              Ds
                                                ? e.jsx(Qn, {
                                                    size: 14,
                                                    className: "animate-spin",
                                                  })
                                                : e.jsx(ad, {
                                                    size: 14,
                                                  }),
                                              Ds ? "Training…" : "Train Now",
                                            ],
                                          }),
                                          e.jsxs("button", {
                                            type: "button",
                                            onClick: so,
                                            disabled: Ds || Zs,
                                            className: "nls-btn nls-btn--danger",
                                            children: [
                                              Zs
                                                ? e.jsx(Qn, {
                                                    size: 14,
                                                    className: "animate-spin",
                                                  })
                                                : e.jsx(yt, {
                                                    size: 14,
                                                  }),
                                              Zs ? "Clearing…" : "Clear Memory",
                                            ],
                                          }),
                                        ],
                                      }),
                                      ys
                                        ? e.jsxs("div", {
                                            className: `nls-notice ${ys.ok ? "nls-notice--success" : "nls-notice--danger"}`,
                                            role: "status",
                                            children: [
                                              ys.ok
                                                ? e.jsx(Lt, {
                                                    size: 16,
                                                    "aria-hidden": "true",
                                                  })
                                                : e.jsx(Ss, {
                                                    size: 16,
                                                    "aria-hidden": "true",
                                                  }),
                                              e.jsx("span", {
                                                children: ys.text,
                                              }),
                                            ],
                                          })
                                        : null,
                                    ],
                                  }),
                                ],
                              }),
                              e.jsxs("section", {
                                className: "nls-card",
                                children: [
                                  e.jsx("div", {
                                    className: "nls-card__header",
                                    children: e.jsxs("h2", {
                                      className: "nls-card__title",
                                      children: [
                                        e.jsx(md, {
                                          size: 18,
                                          "aria-hidden": "true",
                                        }),
                                        "Assistant Behavior ",
                                        e.jsx(Tooltip, {
                                          text: "Controls how the assistant greets visitors and answers. Leave the system prompt blank to use a safe default that answers only from your content.",
                                        }),
                                      ],
                                    }),
                                  }),
                                  e.jsxs("div", {
                                    className: "nls-card__body nls-stack nls-stack--tight",
                                    children: [
                                      e.jsxs("div", {
                                        className: "nls-field",
                                        children: [
                                          e.jsx("label", {
                                            className: "nls-field__label",
                                            htmlFor: "nexulesuite_settings-ai-welcome",
                                            children: "Welcome message",
                                          }),
                                          e.jsx("input", {
                                            id: "nexulesuite_settings-ai-welcome",
                                            type: "text",
                                            value: j.aiWelcomeMessage,
                                            onChange: (g) => Ee("aiWelcomeMessage", g.target.value),
                                            placeholder: "Hi! Ask me anything about our site.",
                                          }),
                                        ],
                                      }),
                                      e.jsxs("div", {
                                        className: "nls-field",
                                        children: [
                                          e.jsxs("label", {
                                            className: "nls-field__label",
                                            htmlFor: "nexulesuite_settings-ai-placeholder",
                                            children: [
                                              "Input placeholder ",
                                              e.jsx(Tooltip, {
                                                text: 'The hint text shown inside the chat message box. Leave blank for the default "Write a message…".',
                                              }),
                                            ],
                                          }),
                                          e.jsx("input", {
                                            id: "nexulesuite_settings-ai-placeholder",
                                            type: "text",
                                            maxLength: 120,
                                            value: j.aiInputPlaceholder || "",
                                            onChange: (g) => Ee("aiInputPlaceholder", g.target.value),
                                            placeholder: "Write a message…",
                                          }),
                                        ],
                                      }),
                                      e.jsxs("div", {
                                        className: "nls-field",
                                        children: [
                                          e.jsxs("label", {
                                            className: "nls-field__label",
                                            htmlFor: "nexulesuite_settings-ai-system-prompt",
                                            children: [
                                              "System prompt ",
                                              e.jsx(Tooltip, {
                                                text: 'The instruction the model follows. Keep the "answer only from context" rule to reduce made-up answers.',
                                              }),
                                            ],
                                          }),
                                          e.jsx("textarea", {
                                            id: "nexulesuite_settings-ai-system-prompt",
                                            rows: 4,
                                            value: j.aiSystemPrompt,
                                            onChange: (g) => Ee("aiSystemPrompt", g.target.value),
                                            placeholder:
                                              "You are the support assistant for our website. Answer ONLY from the provided context; if unknown, say so and offer a human.",
                                          }),
                                        ],
                                      }),
                                      e.jsxs("div", {
                                        className: "nls-grid-2",
                                        children: [
                                          as === "server"
                                            ? e.jsxs("div", {
                                                className: "nls-field",
                                                children: [
                                                  e.jsxs("label", {
                                                    className: "nls-field__label",
                                                    htmlFor: "nexulesuite_settings-ai-chat-model",
                                                    children: [
                                                      "Ollama model override ",
                                                      e.jsx(Tooltip, {
                                                        text: "Optional. Only used when your AI server falls back to Ollama. Must be pulled on that server.",
                                                      }),
                                                    ],
                                                  }),
                                                  e.jsx("input", {
                                                    id: "nexulesuite_settings-ai-chat-model",
                                                    type: "text",
                                                    value: j.aiChatModel,
                                                    onChange: (g) => Ee("aiChatModel", g.target.value),
                                                    placeholder: "llama3.1:8b (default)",
                                                    autoComplete: "off",
                                                    spellCheck: !1,
                                                  }),
                                                ],
                                              })
                                            : null,
                                          e.jsxs("div", {
                                            className: "nls-field",
                                            children: [
                                              e.jsxs("label", {
                                                className: "nls-field__label",
                                                htmlFor: "nexulesuite_settings-ai-max-chunks",
                                                children: [
                                                  "Context snippets ",
                                                  e.jsx(Tooltip, {
                                                    text: "How many of the most relevant chunks to feed the model per question (1–10). More = richer context but slower.",
                                                  }),
                                                ],
                                              }),
                                              e.jsx("input", {
                                                id: "nexulesuite_settings-ai-max-chunks",
                                                type: "number",
                                                min: 1,
                                                max: 10,
                                                value: j.aiMaxChunks,
                                                onChange: (g) => Ee("aiMaxChunks", g.target.value),
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              e.jsxs("section", {
                                className: "nls-card",
                                children: [
                                  e.jsx("div", {
                                    className: "nls-card__header",
                                    children: e.jsxs("h2", {
                                      className: "nls-card__title",
                                      children: [
                                        e.jsx(Hl, {
                                          size: 18,
                                          "aria-hidden": "true",
                                        }),
                                        "Attachments (Vision & Documents) ",
                                        e.jsx(Tooltip, {
                                          text: "Let visitors attach an image, screenshot, or document (PDF, TXT, MD, CSV, HTML, JSON). Images go to the vision model — in Model API mode the chat model reads them directly, no extra setup. Document text is extracted on your server, so it works with any provider. Scanned PDFs hold no text; attach them as an image instead.",
                                        }),
                                      ],
                                    }),
                                  }),
                                  e.jsxs("div", {
                                    className: "nls-card__body nls-stack nls-stack--tight",
                                    children: [
                                      e.jsxs("div", {
                                        className: "nls-toggle-card nls-set-switch-row",
                                        role: "switch",
                                        "aria-checked": !!j.aiAllowImages,
                                        tabIndex: 0,
                                        onClick: () => Ee("aiAllowImages", !j.aiAllowImages),
                                        onKeyDown: (g) => {
                                          (g.key === " " || g.key === "Enter") &&
                                            (g.preventDefault(), Ee("aiAllowImages", !j.aiAllowImages));
                                        },
                                        children: [
                                          e.jsx("span", {
                                            className: "nls-toggle-card__body nls-toggle-card__title",
                                            children: "Allow visitors to attach images and documents",
                                          }),
                                          e.jsx("span", {
                                            className: `nls-switch${j.aiAllowImages ? " is-on" : ""}`,
                                          }),
                                        ],
                                      }),
                                      as === "server"
                                        ? e.jsxs(e.Fragment, {
                                            children: [
                                              e.jsx("div", {
                                                className: "nls-grid-2",
                                                children: e.jsxs("div", {
                                                  className: "nls-field",
                                                  children: [
                                                    e.jsxs("label", {
                                                      className: "nls-field__label",
                                                      htmlFor: "nexulesuite_settings-ai-vision-model",
                                                      children: [
                                                        "Vision model ",
                                                        e.jsx(Tooltip, {
                                                          text: "The Ollama model used to read attached images (e.g. llava, llava:13b, bakllava). Must be pulled on your server.",
                                                        }),
                                                      ],
                                                    }),
                                                    e.jsx("input", {
                                                      id: "nexulesuite_settings-ai-vision-model",
                                                      type: "text",
                                                      value: j.aiVisionModel,
                                                      onChange: (g) => Ee("aiVisionModel", g.target.value),
                                                      placeholder: "llava",
                                                      autoComplete: "off",
                                                      spellCheck: !1,
                                                    }),
                                                  ],
                                                }),
                                              }),
                                              e.jsxs("div", {
                                                className: "nls-notice nls-notice--info",
                                                children: [
                                                  e.jsx(Ys, {
                                                    size: 16,
                                                    "aria-hidden": "true",
                                                  }),
                                                  e.jsxs("p", {
                                                    children: [
                                                      "On your VPS run ",
                                                      e.jsx("code", {
                                                        className: "nls-code",
                                                        children: "ollama pull llava",
                                                      }),
                                                      " first. Image analysis is slower & uses more memory than text.",
                                                    ],
                                                  }),
                                                ],
                                              }),
                                            ],
                                          })
                                        : e.jsxs("div", {
                                            className: "nls-notice nls-notice--info",
                                            children: [
                                              e.jsx(Ys, {
                                                size: 16,
                                                "aria-hidden": "true",
                                              }),
                                              e.jsx("p", {
                                                children:
                                                  ht != null && ht.vision
                                                    ? e.jsxs(e.Fragment, {
                                                        children: [
                                                          "Images go straight to ",
                                                          e.jsx("strong", {
                                                            children: ht.label,
                                                          }),
                                                          " with the question — nothing else to configure. Image turns cost more tokens than text.",
                                                        ],
                                                      })
                                                    : e.jsx(e.Fragment, {
                                                        children:
                                                          "Pick a provider that supports images (OpenAI, Claude, Gemini, Mistral, OpenRouter or xAI) to enable this. Other providers will ask the visitor to describe the image instead.",
                                                      }),
                                              }),
                                            ],
                                          }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        d === "livechat" && e.jsx(nlsAiLiveChatPage, {}),
                        d === "faq" && e.jsx(AiFaqPage, {}),
                        d === "autosetup" && e.jsx(AiAutoSetupPage, {}),
                      ],
                    }),
                  o === "smtp" &&
                    e.jsxs("div", {
                      className: "nls-stack",
                      children: [
                        e.jsxs("section", {
                          className: "nls-card",
                          children: [
                            e.jsx("div", {
                              className: "nls-card__header",
                              children: e.jsxs("h2", {
                                className: "nls-card__title",
                                children: [
                                  e.jsx(qt, {
                                    size: 18,
                                    "aria-hidden": "true",
                                  }),
                                  "Mail ",
                                  e.jsx(Tooltip, {
                                    text: "The From address & name applied to every email this website sends (forms, reports & all WordPress mail).",
                                  }),
                                ],
                              }),
                            }),
                            e.jsx("div", {
                              className: "nls-card__body",
                              children: e.jsxs("div", {
                                className: "nls-grid-2",
                                children: [
                                  e.jsxs("div", {
                                    className: "nls-field",
                                    children: [
                                      e.jsxs("label", {
                                        className: "nls-field__label",
                                        htmlFor: "nexulesuite_settings-smtp-from-email",
                                        children: [
                                          "From Email ",
                                          e.jsx(Tooltip, {
                                            text: "Use an address on your sending domain — providers reject mismatched From addresses.",
                                          }),
                                        ],
                                      }),
                                      e.jsx("input", {
                                        id: "nexulesuite_settings-smtp-from-email",
                                        type: "email",
                                        value: De.from_email,
                                        onChange: (g) => Bt("from_email", g.target.value),
                                        placeholder: "no-reply@example.com",
                                        autoComplete: "off",
                                        spellCheck: !1,
                                      }),
                                    ],
                                  }),
                                  e.jsxs("div", {
                                    className: "nls-field",
                                    children: [
                                      e.jsx("label", {
                                        className: "nls-field__label",
                                        htmlFor: "nexulesuite_settings-smtp-from-name",
                                        children: "From Name",
                                      }),
                                      e.jsx("input", {
                                        id: "nexulesuite_settings-smtp-from-name",
                                        type: "text",
                                        value: De.from_name,
                                        onChange: (g) => Bt("from_name", g.target.value),
                                        placeholder:
                                          ((la = window == null ? void 0 : window.nexulesuite_Admin) == null
                                            ? void 0
                                            : la.siteTitle) || "Your site name",
                                      }),
                                      e.jsxs("label", {
                                        className: "nls-check nls-text-sm",
                                        children: [
                                          e.jsx("input", {
                                            type: "checkbox",
                                            checked: !!De.force_from_name,
                                            onChange: (g) => Bt("force_from_name", g.target.checked),
                                          }),
                                          e.jsx("span", {
                                            children: "Force From Name — override the name set by other plugins",
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
                        e.jsxs("section", {
                          className: "nls-card",
                          children: [
                            e.jsx("div", {
                              className: "nls-card__header",
                              children: e.jsxs("h2", {
                                className: "nls-card__title",
                                children: [
                                  e.jsx(Ia, {
                                    size: 18,
                                    "aria-hidden": "true",
                                  }),
                                  "Mailer ",
                                  e.jsx(Tooltip, {
                                    text: "Choose how email is delivered. Selecting a provider routes all site mail through it.",
                                  }),
                                ],
                              }),
                            }),
                            e.jsx("div", {
                              className: "nls-card__body",
                              children: e.jsx("div", {
                                className: "nls-set-mailers",
                                role: "group",
                                "aria-label": "Mailer",
                                children: MAILER_OPTIONS.map((g) => {
                                  const G = Ct === g.id;
                                  return e.jsxs(
                                    "button",
                                    {
                                      type: "button",
                                      onClick: () => ll(g.id),
                                      className: `nls-card nls-card--soft nls-set-mailer${G ? " is-active" : ""}`,
                                      "aria-pressed": G,
                                      children: [
                                        e.jsx("span", {
                                          className: "nls-section__ico",
                                          "aria-hidden": "true",
                                          children:
                                            g.id === "gmail" || g.id === "outlook"
                                              ? e.jsx(qt, {
                                                  size: 16,
                                                })
                                              : e.jsx(Ia, {
                                                  size: 16,
                                                }),
                                        }),
                                        e.jsx("span", {
                                          className: "nls-set-mailer__name",
                                          children: g.name,
                                        }),
                                        e.jsx("span", {
                                          className: "nls-set-mailer__tag",
                                          children: g.tagline,
                                        }),
                                      ],
                                    },
                                    g.id,
                                  );
                                }),
                              }),
                            }),
                          ],
                        }),
                        Ct === "default"
                          ? e.jsx("section", {
                              className: "nls-card",
                              children: e.jsx("div", {
                                className: "nls-card__body",
                                children: e.jsxs("div", {
                                  className: "nls-notice nls-notice--info",
                                  children: [
                                    e.jsx(Ys, {
                                      size: 16,
                                      "aria-hidden": "true",
                                    }),
                                    e.jsxs("p", {
                                      children: [
                                        "WordPress will keep using the default PHP ",
                                        e.jsx("code", {
                                          className: "nls-code",
                                          children: "mail()",
                                        }),
                                        " function. Choose a mailer above to deliver email reliably through your own provider.",
                                      ],
                                    }),
                                  ],
                                }),
                              }),
                            })
                          : e.jsxs("section", {
                              className: "nls-card",
                              children: [
                                e.jsx("div", {
                                  className: "nls-card__header",
                                  children: e.jsxs("h2", {
                                    className: "nls-card__title",
                                    children: [
                                      e.jsx(ki, {
                                        size: 18,
                                        "aria-hidden": "true",
                                      }),
                                      ((aa = MAILER_OPTIONS.find((g) => g.id === Ct)) == null ? void 0 : aa.name) ||
                                        "SMTP",
                                      " Settings",
                                      e.jsx(Tooltip, {
                                        text:
                                          Ct === "gmail"
                                            ? "OAuth 2.0 — no password stored. Host auto-set to smtp.gmail.com:465 (SSL). Client secret & OAuth tokens are encrypted at rest and never sent to the browser."
                                            : Ct === "outlook"
                                              ? "OAuth 2.0 — no password stored. Host auto-set to smtp.office365.com:587 (TLS). Client secret & OAuth tokens are encrypted at rest and never sent to the browser."
                                              : "Enter the SMTP host, port & credentials from your provider. Passwords are encrypted at rest; you can also define nexulesuite_SMTP_PASS in wp-config.php to keep them out of the database.",
                                      }),
                                    ],
                                  }),
                                }),
                                e.jsx("div", {
                                  className: "nls-card__body nls-stack nls-stack--tight",
                                  children:
                                    Ct === "other"
                                      ? e.jsxs("div", {
                                          className: "nls-grid-2",
                                          children: [
                                            e.jsxs("div", {
                                              className: "nls-field",
                                              children: [
                                                e.jsx("label", {
                                                  className: "nls-field__label",
                                                  htmlFor: "nexulesuite_settings-smtp-host",
                                                  children: "SMTP Host",
                                                }),
                                                e.jsx("input", {
                                                  id: "nexulesuite_settings-smtp-host",
                                                  type: "text",
                                                  value: De.host,
                                                  onChange: (g) => Bt("host", g.target.value),
                                                  placeholder: "smtp.example.com",
                                                  autoComplete: "off",
                                                  spellCheck: !1,
                                                }),
                                              ],
                                            }),
                                            e.jsxs("div", {
                                              className: "nls-field",
                                              children: [
                                                e.jsx("label", {
                                                  className: "nls-field__label",
                                                  htmlFor: "nexulesuite_settings-smtp-port",
                                                  children: "Port",
                                                }),
                                                e.jsx("input", {
                                                  id: "nexulesuite_settings-smtp-port",
                                                  type: "number",
                                                  value: De.port,
                                                  onChange: (g) => Bt("port", g.target.value),
                                                  placeholder: "587",
                                                }),
                                              ],
                                            }),
                                            e.jsxs("div", {
                                              className: "nls-field",
                                              children: [
                                                e.jsx("label", {
                                                  className: "nls-field__label",
                                                  htmlFor: "nexulesuite_settings-smtp-secure",
                                                  children: "Encryption",
                                                }),
                                                e.jsxs("select", {
                                                  id: "nexulesuite_settings-smtp-secure",
                                                  value: De.secure,
                                                  onChange: (g) => Bt("secure", g.target.value),
                                                  children: [
                                                    e.jsx("option", {
                                                      value: "tls",
                                                      children: "TLS — recommended (port 587)",
                                                    }),
                                                    e.jsx("option", {
                                                      value: "ssl",
                                                      children: "SSL (port 465)",
                                                    }),
                                                    e.jsx("option", {
                                                      value: "",
                                                      children: "None",
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                            e.jsxs("div", {
                                              className: "nls-field",
                                              children: [
                                                e.jsx("label", {
                                                  className: "nls-field__label",
                                                  htmlFor: "nexulesuite_settings-smtp-username",
                                                  children: "SMTP Username",
                                                }),
                                                e.jsx("input", {
                                                  id: "nexulesuite_settings-smtp-username",
                                                  type: "text",
                                                  value: De.username,
                                                  onChange: (g) => Bt("username", g.target.value),
                                                  placeholder: "you@example.com",
                                                  autoComplete: "off",
                                                  spellCheck: !1,
                                                }),
                                              ],
                                            }),
                                            e.jsxs("div", {
                                              className: "nls-field",
                                              children: [
                                                e.jsx("label", {
                                                  className: "nls-field__label",
                                                  htmlFor: "nexulesuite_settings-smtp-password",
                                                  children: "SMTP Password",
                                                }),
                                                e.jsx("input", {
                                                  id: "nexulesuite_settings-smtp-password",
                                                  type: "password",
                                                  value: De.password,
                                                  onChange: (g) => Bt("password", g.target.value),
                                                  placeholder: _n
                                                    ? "•••••••• saved — leave blank to keep"
                                                    : "SMTP password",
                                                  autoComplete: "new-password",
                                                }),
                                                e.jsx("p", {
                                                  className: "nls-field__hint",
                                                  children: _n
                                                    ? "A password is already saved (encrypted). Leave blank to keep it, or type a new one to replace."
                                                    : "Stored encrypted (AES-256-GCM) — never shown again after saving.",
                                                }),
                                              ],
                                            }),
                                          ],
                                        })
                                      : e.jsxs(e.Fragment, {
                                          children: [
                                            e.jsxs("div", {
                                              className: "nls-grid-2",
                                              children: [
                                                e.jsxs("div", {
                                                  className: "nls-field",
                                                  children: [
                                                    e.jsx("label", {
                                                      className: "nls-field__label",
                                                      htmlFor: "nexulesuite_settings-smtp-client-id",
                                                      children: "Client ID",
                                                    }),
                                                    e.jsx("input", {
                                                      id: "nexulesuite_settings-smtp-client-id",
                                                      type: "text",
                                                      value: De.oauth_client_id,
                                                      onChange: (g) => Bt("oauth_client_id", g.target.value),
                                                      placeholder:
                                                        Ct === "gmail"
                                                          ? "xxxx.apps.googleusercontent.com"
                                                          : "Application (client) ID",
                                                      autoComplete: "off",
                                                      spellCheck: !1,
                                                    }),
                                                  ],
                                                }),
                                                e.jsxs("div", {
                                                  className: "nls-field",
                                                  children: [
                                                    e.jsx("label", {
                                                      className: "nls-field__label",
                                                      htmlFor: "nexulesuite_settings-smtp-client-secret",
                                                      children: "Client Secret",
                                                    }),
                                                    e.jsx("input", {
                                                      id: "nexulesuite_settings-smtp-client-secret",
                                                      type: "password",
                                                      value: De.oauth_client_secret,
                                                      onChange: (g) => Bt("oauth_client_secret", g.target.value),
                                                      placeholder: Pe.hasClientSecret
                                                        ? "•••••••• saved — leave blank to keep"
                                                        : "Client secret",
                                                      autoComplete: "new-password",
                                                    }),
                                                    e.jsx("p", {
                                                      className: "nls-field__hint",
                                                      children: "Leave blank to keep the saved one.",
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                            e.jsxs("div", {
                                              className: "nls-field",
                                              children: [
                                                e.jsxs("span", {
                                                  className: "nls-field__label",
                                                  children: [
                                                    "Authorized Redirect URI ",
                                                    e.jsx(Tooltip, {
                                                      text:
                                                        Ct === "gmail"
                                                          ? "Add this exact URL to your Google Cloud Console OAuth client as an authorized redirect URI."
                                                          : "Add this exact URL to your Microsoft Entra app as an authorized redirect URI.",
                                                    }),
                                                  ],
                                                }),
                                                e.jsxs("div", {
                                                  className: "nls-input-group",
                                                  children: [
                                                    e.jsx("input", {
                                                      readOnly: !0,
                                                      value: Pe.redirect_uri,
                                                      className: "nls-mono",
                                                      onFocus: (g) => g.target.select(),
                                                      "aria-label": "Authorized Redirect URI",
                                                    }),
                                                    e.jsx("button", {
                                                      type: "button",
                                                      onClick: lr,
                                                      className: `nls-icon-btn${$e ? " is-success" : ""}`,
                                                      "aria-label": "Copy redirect URI",
                                                      children: $e
                                                        ? e.jsx(Lt, {
                                                            size: 16,
                                                            className: "is-copied",
                                                          })
                                                        : e.jsx($s, {
                                                            size: 16,
                                                          }),
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                            !(function () {
                                              try {
                                                var _raw = String(Pe.redirect_uri || "").trim();
                                                if (!_raw) return !1;
                                                var _h = new URL(_raw).hostname.toLowerCase();
                                                return (
                                                  /\.(local|test|localhost|internal|lan|home|corp)$/i.test(_h) ||
                                                  _h === "localhost" ||
                                                  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(_h)
                                                );
                                              } catch (_e) {
                                                return !1;
                                              }
                                            })()
                                              ? e.jsxs("p", {
                                                  className: "nls-notice nls-notice--warning",
                                                  children: [
                                                    e.jsx(Ss, {
                                                      size: 16,
                                                      "aria-hidden": "true",
                                                    }),
                                                    e.jsx("span", {
                                                      children:
                                                        Ct === "gmail"
                                                          ? "Google rejects .local / private hosts as OAuth redirect URIs. Use a public URL (Local Live Link, ngrok) or switch to Other + Gmail App Password for local testing."
                                                          : "Microsoft rejects .local / private hosts as OAuth redirect URIs. Use a public URL (Local Live Link, ngrok) or App Password SMTP for local testing.",
                                                    }),
                                                  ],
                                                })
                                              : null,
                                            Pe.connected
                                              ? e.jsxs("div", {
                                                  className: "nls-notice nls-notice--success",
                                                  children: [
                                                    e.jsx(Lt, {
                                                      size: 16,
                                                      "aria-hidden": "true",
                                                    }),
                                                    e.jsxs("div", {
                                                      className: "nls-between nls-set-grow",
                                                      children: [
                                                        e.jsxs("span", {
                                                          children: ["Connected as ", Pe.oauth_email || "your account"],
                                                        }),
                                                        e.jsx("button", {
                                                          type: "button",
                                                          onClick: async () => {
                                                            try {
                                                              const { res: re, json: be } = await settingsFetch(
                                                                "/smtp/oauth/disconnect",
                                                                {
                                                                  method: "POST",
                                                                  body: JSON.stringify({}),
                                                                },
                                                              );
                                                              if (!re.ok || !(be != null && be.success))
                                                                throw new Error(
                                                                  (be == null ? void 0 : be.message) ||
                                                                    "Disconnect failed.",
                                                                );
                                                              const je = (be && be.data) || {};
                                                              (Oe({
                                                                connected: !1,
                                                                oauth_email: "",
                                                                hasClientSecret: !!je.hasClientSecret,
                                                                redirect_uri: je.redirect_uri || Pe.redirect_uri,
                                                                authorize_urls: je.authorize_urls || Pe.authorize_urls,
                                                                disconnect_url: je.disconnect_url || "",
                                                              }),
                                                                xs((Ae) => ({
                                                                  ...Ae,
                                                                  enabled: !1,
                                                                  oauth_client_secret: "",
                                                                })),
                                                                pt("success", "Disconnected."));
                                                            } catch (nlsDiscErr) {
                                                              pt(
                                                                "error",
                                                                (nlsDiscErr && nlsDiscErr.message) ||
                                                                  "Disconnect failed.",
                                                              );
                                                            }
                                                          },
                                                          className: "nls-btn nls-btn--danger nls-btn--sm",
                                                          children: "Disconnect",
                                                        }),
                                                      ],
                                                    }),
                                                  ],
                                                })
                                              : e.jsxs("div", {
                                                  className: "nls-field",
                                                  children: [
                                                    e.jsx("div", {
                                                      className: "nls-row",
                                                      children: e.jsxs("button", {
                                                        type: "button",
                                                        onClick: async () => {
                                                          try {
                                                            const { res: re, json: be } = await settingsFetch(
                                                              "/smtp/oauth/start",
                                                              {
                                                                method: "POST",
                                                                body: JSON.stringify({
                                                                  provider: Ct,
                                                                }),
                                                              },
                                                            );
                                                            const nlsUrl = (be && be.url) || "";
                                                            if (!re.ok || !(be != null && be.success) || !nlsUrl)
                                                              throw new Error(
                                                                (be == null ? void 0 : be.message) ||
                                                                  "Could not start authorization.",
                                                              );
                                                            window.location.href = nlsUrl;
                                                          } catch (nlsOauthErr) {
                                                            pt(
                                                              "error",
                                                              (nlsOauthErr && nlsOauthErr.message) ||
                                                                "Could not start authorization.",
                                                            );
                                                          }
                                                        },
                                                        className: "nls-btn nls-btn--primary",
                                                        children: [
                                                          e.jsx(Ci, {
                                                            size: 14,
                                                          }),
                                                          " Authorize with ",
                                                          Ct === "gmail" ? "Google" : "Microsoft",
                                                        ],
                                                      }),
                                                    }),
                                                    e.jsx("p", {
                                                      className: "nls-field__hint",
                                                      children: "Save your Client ID & Secret first, then Authorize.",
                                                    }),
                                                  ],
                                                }),
                                          ],
                                        }),
                                }),
                              ],
                            }),
                        e.jsxs("section", {
                          className: "nls-card",
                          children: [
                            e.jsx("div", {
                              className: "nls-card__header",
                              children: e.jsxs("h2", {
                                className: "nls-card__title",
                                children: [
                                  e.jsx(rd, {
                                    size: 18,
                                    "aria-hidden": "true",
                                  }),
                                  "Send a Test Email ",
                                  e.jsx(Tooltip, {
                                    text: "Sends a real message using the settings above — the result shown is the actual send outcome, not a demo.",
                                  }),
                                ],
                              }),
                            }),
                            e.jsxs("div", {
                              className: "nls-card__body nls-stack nls-stack--tight",
                              children: [
                                De.enabled
                                  ? null
                                  : e.jsxs("div", {
                                      className: "nls-notice nls-notice--info",
                                      children: [
                                        e.jsx(Ys, {
                                          size: 16,
                                          "aria-hidden": "true",
                                        }),
                                        e.jsxs("p", {
                                          children: [
                                            "SMTP is currently ",
                                            e.jsx("strong", {
                                              children: "off",
                                            }),
                                            " — this test uses the default WordPress ",
                                            e.jsx("code", {
                                              className: "nls-code",
                                              children: "mail()",
                                            }),
                                            ". Select and connect a mailer above to test your provider.",
                                          ],
                                        }),
                                      ],
                                    }),
                                e.jsxs("div", {
                                  className: "nls-grid-2",
                                  children: [
                                    e.jsxs("div", {
                                      className: "nls-field",
                                      children: [
                                        e.jsx("label", {
                                          className: "nls-field__label",
                                          htmlFor: "nexulesuite_settings-smtp-test-to",
                                          children: "Send To",
                                        }),
                                        e.jsx("input", {
                                          id: "nexulesuite_settings-smtp-test-to",
                                          type: "email",
                                          value: ns,
                                          onChange: (g) => Y(g.target.value),
                                          placeholder: "you@example.com",
                                          autoComplete: "off",
                                          spellCheck: !1,
                                        }),
                                      ],
                                    }),
                                    e.jsxs("div", {
                                      className: "nls-field",
                                      children: [
                                        e.jsx("span", {
                                          className: "nls-field__label",
                                          children: "Format",
                                        }),
                                        e.jsxs("div", {
                                          className: "nls-toggle-card nls-set-switch-row",
                                          role: "switch",
                                          "aria-checked": fe,
                                          tabIndex: 0,
                                          onClick: () => Te((g) => !g),
                                          onKeyDown: (g) => {
                                            (g.key === " " || g.key === "Enter") && (g.preventDefault(), Te((G) => !G));
                                          },
                                          children: [
                                            e.jsx("span", {
                                              className: "nls-toggle-card__body nls-toggle-card__title",
                                              children: "Send as HTML",
                                            }),
                                            e.jsx("span", {
                                              className: `nls-switch${fe ? " is-on" : ""}`,
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsx("div", {
                                  className: "nls-row",
                                  children: e.jsxs("button", {
                                    type: "button",
                                    onClick: ea,
                                    disabled: Es,
                                    className: "nls-btn nls-btn--secondary",
                                    children: [
                                      Es
                                        ? e.jsx(Qn, {
                                            size: 14,
                                            className: "animate-spin",
                                          })
                                        : e.jsx(rd, {
                                            size: 14,
                                          }),
                                      Es ? "Sending…" : "Send Test Email",
                                    ],
                                  }),
                                }),
                                _e
                                  ? e.jsxs("div", {
                                      className: `nls-notice ${_e.ok ? "nls-notice--success" : "nls-notice--danger"}`,
                                      role: "status",
                                      children: [
                                        _e.ok
                                          ? e.jsx(Lt, {
                                              size: 16,
                                              "aria-hidden": "true",
                                            })
                                          : e.jsx(Ss, {
                                              size: 16,
                                              "aria-hidden": "true",
                                            }),
                                        e.jsx("span", {
                                          children: _e.text,
                                        }),
                                      ],
                                    })
                                  : null,
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  o === "backup" &&
                    e.jsxs("div", {
                      className: "nls-stack",
                      children: [
                        e.jsxs("div", {
                          className: "nls-grid-2",
                          children: [
                            e.jsxs("section", {
                              className: "nls-card",
                              children: [
                                e.jsx("div", {
                                  className: "nls-card__header",
                                  children: e.jsxs("div", {
                                    className: "min-w-0",
                                    children: [
                                      e.jsxs("h2", {
                                        className: "nls-card__title",
                                        children: [
                                          e.jsx(Ol, {
                                            size: 18,
                                            "aria-hidden": "true",
                                          }),
                                          "Export full backup",
                                        ],
                                      }),
                                      e.jsx("p", {
                                        className: "nls-card__desc",
                                        children:
                                          "Settings, forms, popups, emails, nav, analytics & uploads — one JSON file.",
                                      }),
                                    ],
                                  }),
                                }),
                                e.jsx("div", {
                                  className: "nls-card__body",
                                  children: e.jsxs("button", {
                                    type: "button",
                                    onClick: () => {
                                      const g = {
                                          version: a,
                                          settings: j,
                                        },
                                        G = new Blob([JSON.stringify(g, null, 2)], {
                                          type: "application/json",
                                        }),
                                        re = URL.createObjectURL(G),
                                        be = document.createElement("a");
                                      ((be.href = re),
                                        (be.download = "nexus-settings-export.json"),
                                        be.click(),
                                        URL.revokeObjectURL(re));
                                    },
                                    className: "nls-btn nls-btn--secondary nls-btn--block",
                                    children: [
                                      e.jsx(Ol, {
                                        size: 16,
                                      }),
                                      " Export Settings JSON",
                                    ],
                                  }),
                                }),
                              ],
                            }),
                            e.jsxs("section", {
                              className: "nls-card",
                              children: [
                                e.jsx("div", {
                                  className: "nls-card__header",
                                  children: e.jsxs("div", {
                                    className: "min-w-0",
                                    children: [
                                      e.jsxs("h2", {
                                        className: "nls-card__title",
                                        children: [
                                          e.jsx(Vl, {
                                            size: 18,
                                            "aria-hidden": "true",
                                          }),
                                          "Import full backup",
                                        ],
                                      }),
                                      e.jsx("p", {
                                        className: "nls-card__desc",
                                        children:
                                          "Upload a full export (.json). Replaces all plugin data — no Save step.",
                                      }),
                                    ],
                                  }),
                                }),
                                e.jsx("div", {
                                  className: "nls-card__body",
                                  children: e.jsxs("label", {
                                    className: "nls-btn nls-btn--secondary nls-btn--block nls-set-filebtn",
                                    children: [
                                      e.jsx(Vl, {
                                        size: 16,
                                      }),
                                      " Import Settings JSON",
                                      e.jsx("input", {
                                        type: "file",
                                        accept: ".json",
                                        className: "sr-only",
                                        "aria-label": "Import Settings JSON",
                                        onChange: (g) => {
                                          const G = g.target.files[0];
                                          if (!G) return;
                                          const re = new FileReader();
                                          ((re.onload = (be) => {
                                            try {
                                              const je = JSON.parse(be.target.result);
                                              (je.settings &&
                                                le((Ae) => ({
                                                  ...Ae,
                                                  ...je.settings,
                                                  ...Ki(je.settings),
                                                })),
                                                pt(
                                                  "success",
                                                  'Settings imported. Click "Save Configuration" to apply.',
                                                ));
                                            } catch {
                                              pt("error", "Invalid JSON file.");
                                            }
                                          }),
                                            re.readAsText(G),
                                            (g.target.value = ""));
                                        },
                                      }),
                                    ],
                                  }),
                                }),
                              ],
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "nls-notice nls-notice--warning",
                          children: [
                            e.jsx(Ss, {
                              size: 16,
                              "aria-hidden": "true",
                            }),
                            e.jsxs("div", {
                              className: "min-w-0",
                              children: [
                                e.jsx("h6", {
                                  className: "nls-set-notice-title",
                                  children: "Important Notice",
                                }),
                                e.jsx("p", {
                                  children:
                                    "Importing a settings file will overwrite your current configuration. Always export a backup before importing.",
                                }),
                              ],
                            }),
                          ],
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
function nlsAiLiveChatPage() {
  const [a, o] = b.useState({
      enableLivechat: !1,
      liveChatInDock: !0,
      liveChatButtonImage: "",
      liveChatButtonBg: "#2563eb",
      liveChatButtonText: "#ffffff",
      liveChatButtonIconSize: 22,
      accessibilityEnabled: !1,
      chatTitle: "Customer Support",
      chatBadge: "Online",
      chatContent: "",
    }),
    [u, p] = b.useState({
      loading: !0,
      saving: !1,
      error: "",
    }),
    [h, x] = b.useState(!1),
    [nlsChatImgUploading, nlsSetChatImgUploading] = b.useState(!1),
    [nlsEmbedCopied, nlsSetEmbedCopied] = b.useState("");
  const nlsChatImgRef = b.useRef(null);
  const nlsChatShortcode = "[nexulesuite_chat]";
  const nlsChatIframe = (() => {
    var nlsSite = ((window.nexulesuite_Admin || {}).siteUrl || "/").replace(/\/?$/, "/");
    return `<div class="nexulesuite_chat-embed" style="width:100%;max-width:100%;--nls-chat-h:620px;container-type:inline-size;border-radius:22px;overflow:hidden;margin-bottom:36px;"><div style="width:100%;height:clamp(380px,145cqw,var(--nls-chat-h));"><iframe src="${nlsSite}?nexulesuite_chat_embed=1" title="Chat" style="width:100%;height:100%;border:0;display:block;" loading="lazy"></iframe></div></div>`;
  })();
  const nlsCopyEmbed = (nlsKey, nlsText) => {
    if (!nlsText) return;
    const nlsDone = () => {
      nlsSetEmbedCopied(nlsKey);
      window.setTimeout(() => nlsSetEmbedCopied(""), 2e3);
    };
    const nlsFallback = () => {
      let h = null;
      try {
        ((h = document.createElement("textarea")),
          (h.value = nlsText),
          h.setAttribute("readonly", ""),
          (h.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0"),
          document.body.appendChild(h),
          h.focus(),
          h.select());
        const ok = document.execCommand("copy");
        return ok ? (nlsDone(), !0) : !1;
      } catch {
        return !1;
      } finally {
        h != null && h.parentNode && h.parentNode.removeChild(h);
      }
    };
    var nlsClip = navigator == null ? void 0 : navigator.clipboard;
    nlsClip && typeof nlsClip.writeText == "function"
      ? nlsClip
          .writeText(nlsText)
          .then(nlsDone)
          .catch(() => {
            nlsFallback();
          })
      : nlsFallback();
  };
  const nlsUploadDockChatImg = async (M) => {
    var ue, pe, he;
    const y = (ue = M.target) == null ? void 0 : ue.files,
      P = y && y[0];
    if (!P) return;
    if (!P.type.startsWith("image/")) {
      alert("Please choose an image file.");
      M.target.value = "";
      return;
    }
    if (P.size > 3 * 1024 * 1024) {
      alert("Image must be 3MB or smaller.");
      M.target.value = "";
      return;
    }
    nlsSetChatImgUploading(!0);
    try {
      const ft = (
          ((pe = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : pe.restUrl) || ""
        ).replace(/\/?$/, ""),
        mt = new FormData();
      mt.append("file", P);
      const ot = await fetch(`${ft}/nexulesuite_/v1/settings/upload-chat-image`, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "X-WP-Nonce": ((he = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : he.nonce) || "",
          },
          body: mt,
        }),
        Ie = await ot.json().catch(() => null);
      if (!ot.ok) throw new Error((Ie == null ? void 0 : Ie.message) || `Upload failed (${ot.status})`);
      var __d = Ie == null ? void 0 : Ie.data,
        Yt = (__d == null ? void 0 : __d.url) || (Ie == null ? void 0 : Ie.url);
      if (!Yt) throw new Error("No image URL returned.");
      o((P) => ({
        ...P,
        liveChatButtonImage: Yt,
      }));
    } catch (Se) {
      alert((Se && Se.message) || "Upload failed");
    } finally {
      nlsSetChatImgUploading(!1);
      M.target.value = "";
    }
  };
  b.useEffect(() => {
    (async () => {
      p((f) => ({
        ...f,
        loading: !0,
        error: "",
      }));
      try {
        const [{ res: f, json: S }, { res: nlsGenRes, json: nlsGenJson }] = await Promise.all([
          settingsFetch("/settings/accessibility-language", {
            method: "GET",
          }),
          settingsFetch("/settings/general", {
            method: "GET",
          }),
        ]);
        if (!f.ok) throw new Error((S && S.message) || "Failed to load");
        const nlsDock = S.settings || {};
        const nlsGen =
          nlsGenRes && nlsGenRes.ok && nlsGenJson && nlsGenJson.success && nlsGenJson.data && nlsGenJson.data.settings
            ? nlsGenJson.data.settings
            : {};
        o({
          ...a,
          ...nlsDock,
          chatTitle: nlsGen.chatTitle != null ? nlsGen.chatTitle : "Customer Support",
          chatBadge: nlsGen.chatBadge != null ? nlsGen.chatBadge : "Online",
          chatContent: nlsGen.chatContent != null ? nlsGen.chatContent : "",
        });
      } catch (f) {
        p((S) => ({
          ...S,
          error: f.message || "Failed to load",
        }));
      } finally {
        p((f) => ({
          ...f,
          loading: !1,
        }));
      }
    })();
  }, []);
  const f = (S, y) =>
    o((P) => ({
      ...P,
      [S]: y,
    }));
  const nlsSaveLiveChat = async () => {
    p((P) => ({
      ...P,
      saving: !0,
      error: "",
    }));
    try {
      const { chatTitle: nlsT, chatBadge: nlsB, chatContent: nlsC, ...nlsDock } = a;
      const [{ res: P, json: M }, { res: nlsGenRes, json: nlsGenJson }] = await Promise.all([
        settingsFetch("/settings/accessibility-language", {
          method: "POST",
          body: JSON.stringify({
            settings: nlsDock,
          }),
        }),
        settingsFetch("/settings/general", {
          method: "POST",
          body: JSON.stringify({
            settings: {
              chatTitle: nlsT,
              chatBadge: nlsB,
              chatContent: nlsC,
            },
          }),
        }),
      ]);
      if (!P.ok) throw new Error((M && M.message) || "Save failed");
      if (!nlsGenRes.ok || !(nlsGenJson && nlsGenJson.success))
        throw new Error((nlsGenJson && nlsGenJson.message) || "Could not save chat header text");
      const nlsSavedGen = (nlsGenJson.data && nlsGenJson.data.settings) || {};
      o({
        ...(M.settings || nlsDock),
        chatTitle: nlsSavedGen.chatTitle != null ? nlsSavedGen.chatTitle : nlsT,
        chatBadge: nlsSavedGen.chatBadge != null ? nlsSavedGen.chatBadge : nlsB,
        chatContent: nlsSavedGen.chatContent != null ? nlsSavedGen.chatContent : nlsC,
      });
      x(!0);
      window.setTimeout(() => x(!1), 2e3);
    } catch (P) {
      p((M) => ({
        ...M,
        error: P.message || "Save failed",
      }));
    } finally {
      p((M) => ({
        ...M,
        saving: !1,
      }));
    }
  };
  if (u.loading)
    return e.jsxs("div", {
      className: "nls-loading",
      children: [
        e.jsx("span", {
          className: "nls-spinner",
          "aria-hidden": "true",
        }),
        "Loading live chat settings…",
      ],
    });
  return e.jsxs("div", {
    className: "nexulesuite_ai-livechat nls-stack",
    children: [
      u.error
        ? e.jsx("div", {
            className: "nls-notice nls-notice--danger",
            role: "alert",
            children: e.jsx("span", {
              children: u.error,
            }),
          })
        : null,
      h
        ? e.jsx("div", {
            className: "nls-notice nls-notice--success",
            role: "status",
            children: e.jsx("span", {
              children: "Saved.",
            }),
          })
        : null,
      e.jsxs("section", {
        className: "nls-card",
        children: [
          e.jsx("div", {
            className: "nls-card__header",
            children: e.jsxs("h2", {
              className: "nls-card__title",
              children: [
                e.jsx(Fa, {
                  size: 18,
                  "aria-hidden": "true",
                }),
                "Chat header ",
                e.jsx(Tooltip, {
                  text: "Title and status shown at the top of the chat panel (e.g. Customer Support / Online).",
                }),
              ],
            }),
          }),
          e.jsxs("div", {
            className: "nls-card__body nls-stack nls-stack--tight",
            children: [
              e.jsxs("div", {
                className: "nls-grid-2",
                children: [
                  e.jsxs("div", {
                    className: "nls-field",
                    children: [
                      e.jsxs("label", {
                        className: "nls-field__label",
                        htmlFor: "nexulesuite_settings-lc-title",
                        children: [
                          "Chat title ",
                          e.jsx(Tooltip, {
                            text: "The heading next to the avatar in the chat header.",
                          }),
                        ],
                      }),
                      e.jsx("input", {
                        id: "nexulesuite_settings-lc-title",
                        type: "text",
                        maxLength: 80,
                        value: a.chatTitle || "",
                        onChange: (M) => f("chatTitle", M.target.value),
                        placeholder: "Customer Support",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "nls-field",
                    children: [
                      e.jsxs("label", {
                        className: "nls-field__label",
                        htmlFor: "nexulesuite_settings-lc-badge",
                        children: [
                          "Status badge ",
                          e.jsx(Tooltip, {
                            text: "Small label under the title, usually with the green online dot.",
                          }),
                        ],
                      }),
                      e.jsx("input", {
                        id: "nexulesuite_settings-lc-badge",
                        type: "text",
                        maxLength: 40,
                        value: a.chatBadge || "",
                        onChange: (M) => f("chatBadge", M.target.value),
                        placeholder: "Online",
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "nls-field",
                children: [
                  e.jsxs("label", {
                    className: "nls-field__label",
                    htmlFor: "nexulesuite_settings-lc-content",
                    children: [
                      "Greeting text ",
                      e.jsx(Tooltip, {
                        text: "Shown on the home screen before the visitor starts a conversation.",
                      }),
                    ],
                  }),
                  e.jsx("textarea", {
                    id: "nexulesuite_settings-lc-content",
                    rows: 3,
                    maxLength: 500,
                    value: a.chatContent || "",
                    onChange: (M) => f("chatContent", M.target.value),
                    placeholder: "Hello! How can we help you today?",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsxs("section", {
        className: "nls-card",
        children: [
          e.jsx("div", {
            className: "nls-card__header",
            children: e.jsxs("h2", {
              className: "nls-card__title",
              children: [
                e.jsx(sd, {
                  size: 18,
                  "aria-hidden": "true",
                }),
                "Button style ",
                e.jsx(Tooltip, {
                  text: "Image, colors and icon size for the chat button inside the accessibility dock.",
                }),
              ],
            }),
          }),
          e.jsx("div", {
            className: "nls-card__body",
            children: e.jsxs("div", {
              className: "nls-ai-livechat-toolbar",
              children: [
                e.jsxs("div", {
                  className: "nls-ai-livechat-toolbar__image",
                  children: [
                    e.jsxs("span", {
                      className: "lbl nls-field__label",
                      children: [
                        "Button image ",
                        e.jsx(Tooltip, {
                          text: "Optional. Leave empty to use the default chat icon.",
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "nls-ai-livechat-infile",
                      children: [
                        e.jsx("input", {
                          type: "text",
                          className: "inp",
                          value: a.liveChatButtonImage || "",
                          onChange: (M) => f("liveChatButtonImage", M.target.value),
                          placeholder: "Image URL…",
                          "aria-label": "Button image URL",
                        }),
                        e.jsx("input", {
                          type: "file",
                          accept: "image/*",
                          style: {
                            display: "none",
                          },
                          ref: nlsChatImgRef,
                          onChange: nlsUploadDockChatImg,
                        }),
                        e.jsxs("div", {
                          className: "nls-ai-livechat-infile__actions",
                          children: [
                            e.jsx("button", {
                              type: "button",
                              disabled: nlsChatImgUploading,
                              onClick: () => {
                                var r;
                                return (r = nlsChatImgRef.current) == null ? void 0 : r.click();
                              },
                              children: nlsChatImgUploading ? "…" : "Upload",
                            }),
                            e.jsx("button", {
                              type: "button",
                              disabled: !a.liveChatButtonImage,
                              onClick: () => f("liveChatButtonImage", ""),
                              children: "Clear",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx("div", {
                  className: "nls-ai-livechat-toolbar__color",
                  children: e.jsx(ColorField, {
                    label: "Background",
                    value: a.liveChatButtonBg || "#2563eb",
                    onChange: (M) => f("liveChatButtonBg", M),
                  }),
                }),
                e.jsx("div", {
                  className: "nls-ai-livechat-toolbar__color",
                  children: e.jsx(ColorField, {
                    label: "Icon / text",
                    value: a.liveChatButtonText || "#ffffff",
                    onChange: (M) => f("liveChatButtonText", M),
                  }),
                }),
                e.jsx("div", {
                  className: "nls-ai-livechat-toolbar__preview",
                  children: e.jsx(nlsFabPreview, {
                    bg: a.liveChatButtonBg || "#2563eb",
                    text: a.liveChatButtonText || "#ffffff",
                    label: "Live preview",
                    iconSrc: a.liveChatButtonImage || "",
                    iconSize: Math.max(14, Math.min(40, parseInt(a.liveChatButtonIconSize, 10) || 22)),
                  }),
                }),
              ],
            }),
          }),
        ],
      }),
      e.jsxs("section", {
        className: "nls-card",
        children: [
          e.jsx("div", {
            className: "nls-card__header",
            children: e.jsxs("h2", {
              className: "nls-card__title",
              children: [
                e.jsx(Zc, {
                  size: 18,
                  "aria-hidden": "true",
                }),
                "Embed Code ",
                e.jsx(Tooltip, {
                  text: "The floating widget already shows site-wide. Use these to put the same chat inside a specific page.",
                }),
              ],
            }),
          }),
          e.jsx("div", {
            className: "nls-card__body",
            children: e.jsxs("div", {
              className: "nls-grid-2",
              children: [
                e.jsxs("div", {
                  className: "nls-field",
                  children: [
                    e.jsxs("label", {
                      className: "nls-field__label",
                      htmlFor: "nexulesuite_settings-lc-shortcode",
                      children: [
                        "Shortcode ",
                        e.jsx(Tooltip, {
                          text: "Paste into any page, post, widget area or page builder. Optional: height, max_width, full_width, hide_floating, mode.",
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "nls-input-group",
                      children: [
                        e.jsx("input", {
                          id: "nexulesuite_settings-lc-shortcode",
                          readOnly: !0,
                          value: nlsChatShortcode,
                          className: "nls-mono",
                          onFocus: (M) => M.target.select(),
                        }),
                        e.jsx("button", {
                          type: "button",
                          title: "Copy shortcode",
                          onClick: () => nlsCopyEmbed("shortcode", nlsChatShortcode),
                          className: `nls-icon-btn${nlsEmbedCopied === "shortcode" ? " is-success" : ""}`,
                          "aria-label": "Copy shortcode",
                          children:
                            nlsEmbedCopied === "shortcode"
                              ? e.jsx(Lt, {
                                  size: 16,
                                  className: "is-copied",
                                })
                              : e.jsx($s, {
                                  size: 16,
                                }),
                        }),
                      ],
                    }),
                    e.jsxs("p", {
                      className: "nls-field__hint",
                      children: [
                        "Renders into the page and fills its container. Use ",
                        e.jsx("code", {
                          className: "nls-code",
                          children: '[nexulesuite_chat full_width="yes" max_width="1200px"]',
                        }),
                        " to span the page. Floating bubble hides on that page by default; add ",
                        e.jsx("code", {
                          className: "nls-code",
                          children: 'hide_floating="no"',
                        }),
                        " to keep both.",
                      ],
                    }),
                  ],
                }),
                e.jsxs("div", {
                  className: "nls-field",
                  children: [
                    e.jsxs("label", {
                      className: "nls-field__label",
                      htmlFor: "nexulesuite_settings-lc-iframe",
                      children: [
                        "HTML embed ",
                        e.jsx(Tooltip, {
                          text: "Only where a shortcode cannot run. Loads chat in an iframe.",
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "nls-input-group",
                      children: [
                        e.jsx("input", {
                          id: "nexulesuite_settings-lc-iframe",
                          readOnly: !0,
                          value: nlsChatIframe,
                          className: "nls-mono",
                          onFocus: (M) => M.target.select(),
                        }),
                        e.jsx("button", {
                          type: "button",
                          title: "Copy HTML embed",
                          onClick: () => nlsCopyEmbed("iframe", nlsChatIframe),
                          className: `nls-icon-btn${nlsEmbedCopied === "iframe" ? " is-success" : ""}`,
                          "aria-label": "Copy HTML embed code",
                          children:
                            nlsEmbedCopied === "iframe"
                              ? e.jsx(Lt, {
                                  size: 16,
                                  className: "is-copied",
                                })
                              : e.jsx($s, {
                                  size: 16,
                                }),
                        }),
                      ],
                    }),
                    e.jsx("p", {
                      className: "nls-field__hint",
                      children:
                        "Prefer the shortcode for liquid layout. The iframe width follows its host, but the outer box cannot grow with page content the way the shortcode does.",
                    }),
                  ],
                }),
              ],
            }),
          }),
        ],
      }),
      e.jsxs("div", {
        className: "nls-row",
        children: [
          e.jsx("button", {
            type: "button",
            disabled: u.saving,
            onClick: nlsSaveLiveChat,
            className: "nls-btn nls-btn--primary",
            children: u.saving ? "Saving…" : "Save Live Chat Settings",
          }),
          e.jsx("p", {
            className: "nls-field__hint",
            children: "Saves chat header text, button style, and keeps embed codes ready to copy.",
          }),
        ],
      }),
    ],
  });
}
