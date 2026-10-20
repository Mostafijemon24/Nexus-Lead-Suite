import * as b from "react";
import * as e from "react/jsx-runtime";
import { LayoutTemplate as mm } from "lucide-react";
import {
  Di,
  FORM_TEMPLATES_PAGE,
  Fi,
  FormPreviewModal,
  Gl,
  Jd,
  Oi,
  PageFrame,
  TemplateCard,
  Ui,
  cf,
  formFromTemplate,
  normalizeForm,
  restFetch,
} from "../shared/common.js";

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
    icon: e.jsx(mm, {
      size: 18,
    }),
    children: [
      e.jsxs("div", {
        className: "p-4 md:p-6 space-y-4",
        children: [
          nlsErr
            ? e.jsx("div", {
                className: "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700",
                children: nlsErr,
              })
            : null,
          nlsBusy
            ? e.jsx("div", {
                className:
                  "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500",
                children: "Creating form…",
              })
            : null,
          e.jsx("div", {
            className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
            children: nlsTpls.map((tpl) => {
              const Icon = tpl.Icon;
              return e.jsx(
                TemplateCard,
                {
                  icon: {
                    node: e.jsx(Icon, {
                      size: 20,
                    }),
                    accent: Ui[tpl.accent] || Ui.violet,
                  },
                  name: tpl.name,
                  tagline: tpl.tagline,
                  fields: (tpl.fields || []).map(([mod]) => ({
                    moduleId: mod,
                  })),
                  onClick: () => nlsUse(tpl),
                  onPreview: () => nlsSetPreview(formFromTemplate(tpl, "template-preview")),
                },
                tpl.id,
              );
            }),
          }),
          e.jsx("p", {
            className: "text-[11px] text-slate-400",
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
