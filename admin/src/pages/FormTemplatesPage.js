import * as b from "react";
import * as e from "react/jsx-runtime";
import { Eye as Rt, LayoutTemplate as mm } from "lucide-react";
import {
  Di,
  FIELD_CATALOG,
  FORM_TEMPLATES_PAGE,
  Fi,
  FormPreviewModal,
  Gl,
  Jd,
  Oi,
  PageFrame,
  StickyFooter,
  cf,
  formFromTemplate,
  normalizeForm,
  restFetch,
} from "../shared/common.js";

const nlsFieldNames = new Map(FIELD_CATALOG.map((f) => [f.id, f.name]));

export function nlsFormTemplatesPage({ onNavigate: nlsNav }) {
  const [nlsBusy, nlsSetBusy] = b.useState(!1),
    [nlsErr, nlsSetErr] = b.useState(""),
    [nlsPreview, nlsSetPreview] = b.useState(null);
  const nlsUse = async (tpl) => {
    (nlsSetBusy(!0), nlsSetErr(""));
    try {
      const res = await restFetch("/nexulesuite_/v1/forms");
      const existing = Array.isArray(res?.data?.payload?.forms) ? res.data.payload.forms : [];
      const normalized = existing.map(normalizeForm);
      const id = Jd(normalized);
      const form = formFromTemplate(tpl, id);
      const next = [...normalized, form];
      await restFetch("/nexulesuite_/v1/forms", {
        method: "POST",
        body: JSON.stringify({
          payload: {
            forms: next,
          },
        }),
      });
      typeof nlsNav == "function" && nlsNav("form-builder");
    } catch (err) {
      nlsSetErr((err && err.message) || "Could not create form from template.");
    } finally {
      nlsSetBusy(!1);
    }
  };
  const nlsTpls = FORM_TEMPLATES_PAGE.slice(0, 4);
  return e.jsxs(PageFrame, {
    title: "Form Templates",
    subtitle: "Start from a ready-made template — fields, behavior, and notifications included.",
    icon: e.jsx(mm, { size: 20 }),
    footer: e.jsx(StickyFooter, {}),
    children: [
      e.jsxs("div", {
        className: "nls-stack nls-stack--tight",
        children: [
          nlsErr ? e.jsx("div", { className: "nls-notice nls-notice--danger", role: "alert", children: nlsErr }) : null,
          nlsBusy
            ? e.jsxs("div", {
                className: "nls-notice nls-notice--info",
                role: "status",
                children: [e.jsx("span", { className: "nls-spinner", "aria-hidden": "true" }), "Creating form…"],
              })
            : null,
          e.jsx("div", {
            className: "nls-tpl-grid",
            children: nlsTpls.map((tpl) => {
              const Icon = tpl.Icon;
              const fields = (tpl.fields || []).map(([mod]) => ({ moduleId: mod }));
              return e.jsxs(
                "div",
                {
                  className: "nls-card nls-tpl-card",
                  children: [
                    e.jsxs("button", {
                      type: "button",
                      onClick: () => nlsUse(tpl),
                      className: "nls-tpl-card__main",
                      children: [
                        e.jsxs("span", {
                          className: "nls-tpl-card__head",
                          children: [
                            e.jsx("span", {
                              className: "nls-tpl-card__icon",
                              "aria-hidden": "true",
                              children: e.jsx(Icon, { size: 20 }),
                            }),
                            e.jsxs("span", {
                              className: "min-w-0",
                              children: [
                                e.jsx("span", { className: "nls-tpl-card__name", children: tpl.name }),
                                e.jsx("span", { className: "nls-tpl-card__tagline", children: tpl.tagline }),
                              ],
                            }),
                          ],
                        }),
                        fields.length
                          ? e.jsx("span", {
                              className: "nls-tpl-card__fields",
                              children: fields.map((f, idx) =>
                                e.jsx(
                                  "span",
                                  {
                                    className: "nls-badge nls-badge--muted",
                                    children: nlsFieldNames.get(f.moduleId) || f.moduleId,
                                  },
                                  idx,
                                ),
                              ),
                            })
                          : e.jsx("span", {
                              className: "nls-tpl-card__fields nls-muted",
                              children: "Start from scratch",
                            }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "nls-card__footer nls-tpl-card__foot",
                      children: [
                        e.jsx("span", { className: "nls-muted nls-text-xs", children: "Click card to use" }),
                        e.jsxs("button", {
                          type: "button",
                          onClick: () => nlsSetPreview(formFromTemplate(tpl, "template-preview")),
                          className: "nls-btn nls-btn--ghost nls-btn--sm",
                          children: [e.jsx(Rt, { "aria-hidden": "true" }), "Preview"],
                        }),
                      ],
                    }),
                  ],
                },
                tpl.id,
              );
            }),
          }),
          e.jsx("p", {
            className: "nls-muted nls-text-xs",
            children:
              "Using a template creates a new form and opens the Form Builder. Remember to Save if you edit further.",
          }),
        ],
      }),
      nlsPreview
        ? e.jsx(FormPreviewModal, {
            isOpen: !0,
            form: nlsPreview,
            onClose: () => nlsSetPreview(null),
          })
        : null,
    ],
  });
}
