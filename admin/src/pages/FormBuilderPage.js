import * as e from "react/jsx-runtime";
import {
  ChevronDown as Qs,
  Clipboard as Jc,
  ClipboardList as im,
  Copy as $s,
  Download as Ol,
  Eye as Rt,
  EyeOff as za,
  GitBranch as ji,
  LayoutTemplate as mm,
  Mail as qt,
  MessageSquare as Xn,
  Plus as dt,
  Save as bn,
  Trash2 as yt,
  Upload as Vl,
  X as _t,
} from "lucide-react";
import * as b from "react";
import {
  Ax,
  Cx,
  DEFAULT_FORM,
  DEFAULT_FORM_STYLING,
  Di,
  ErrorModal,
  Ex,
  FIELD_CATALOG,
  FORM_TEMPLATES_PAGE,
  Fi,
  FormPreviewModal,
  Gl,
  Jd,
  Li,
  Lx,
  Md,
  ModalShell,
  Mx,
  Oi,
  PageFrame,
  Pd,
  Px,
  Qe,
  StickyFooter,
  SuccessModal,
  Tx,
  Ui,
  cf,
  formFromTemplate,
  nlsRange,
  nlsSuccessMsgDefault,
  nlsWalkFormFields,
  normalizeForm,
  qa,
  restFetch,
  v,
} from "../shared/common.js";

function nlsAccPlus(a) {
  return e.jsxs("span", {
    className: "nexulesuite_fui-acc__plus" + (a ? " is-open" : ""),
    "aria-hidden": "true",
    children: [
      e.jsx("span", {
        className: "nexulesuite_fui-acc__plus-h",
      }),
      e.jsx("span", {
        className: "nexulesuite_fui-acc__plus-v",
      }),
    ],
  });
}
function nlsAccIcon(a) {
  const i =
    {
      presets: e.jsx("path", {
        d: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z",
      }),
      style: e.jsxs(e.Fragment, {
        children: [
          e.jsx("path", {
            d: "M12 20h9",
          }),
          e.jsx("path", {
            d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
          }),
        ],
      }),
      colors: e.jsxs(e.Fragment, {
        children: [
          e.jsx("circle", {
            cx: "12",
            cy: "12",
            r: "3",
          }),
          e.jsx("path", {
            d: "M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
          }),
        ],
      }),
      fonts: e.jsx("path", {
        d: "M4 7V5h16v2M9 20h6M12 5v15",
      }),
      layout: e.jsxs(e.Fragment, {
        children: [
          e.jsx("rect", {
            x: "3",
            y: "3",
            width: "7",
            height: "7",
            rx: "1",
          }),
          e.jsx("rect", {
            x: "14",
            y: "3",
            width: "7",
            height: "7",
            rx: "1",
          }),
          e.jsx("rect", {
            x: "3",
            y: "14",
            width: "7",
            height: "7",
            rx: "1",
          }),
          e.jsx("rect", {
            x: "14",
            y: "14",
            width: "7",
            height: "7",
            rx: "1",
          }),
        ],
      }),
      css: e.jsxs(e.Fragment, {
        children: [
          e.jsx("polyline", {
            points: "16 18 22 12 16 6",
          }),
          e.jsx("polyline", {
            points: "8 6 2 12 8 18",
          }),
        ],
      }),
      email: e.jsxs(e.Fragment, {
        children: [
          e.jsx("path", {
            d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
          }),
          e.jsx("polyline", {
            points: "22,6 12,13 2,6",
          }),
        ],
      }),
      integrations: e.jsxs(e.Fragment, {
        children: [
          e.jsx("path", {
            d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
          }),
          e.jsx("path", {
            d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
          }),
        ],
      }),
      visibility: e.jsxs(e.Fragment, {
        children: [
          e.jsx("path", {
            d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",
          }),
          e.jsx("circle", {
            cx: "12",
            cy: "12",
            r: "3",
          }),
        ],
      }),
      markup: e.jsxs(e.Fragment, {
        children: [
          e.jsx("polyline", {
            points: "16 18 22 12 16 6",
          }),
          e.jsx("polyline", {
            points: "8 6 2 12 8 18",
          }),
        ],
      }),
      legal: e.jsx("path", {
        d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
      }),
      container: e.jsx("rect", {
        x: "3",
        y: "3",
        width: "18",
        height: "18",
        rx: "2",
      }),
      indicator: e.jsx("path", {
        d: "M12 2v20M2 12h20",
      }),
      success: e.jsx("path", {
        d: "M22 11.08V12a10 10 0 1 1-5.93-9.14",
      }),
      error: e.jsxs(e.Fragment, {
        children: [
          e.jsx("circle", {
            cx: "12",
            cy: "12",
            r: "10",
          }),
          e.jsx("line", {
            x1: "15",
            y1: "9",
            x2: "9",
            y2: "15",
          }),
          e.jsx("line", {
            x1: "9",
            y1: "9",
            x2: "15",
            y2: "15",
          }),
        ],
      }),
      fields: e.jsxs(e.Fragment, {
        children: [
          e.jsx("rect", {
            x: "3",
            y: "5",
            width: "18",
            height: "4",
            rx: "1",
          }),
          e.jsx("rect", {
            x: "3",
            y: "11",
            width: "18",
            height: "4",
            rx: "1",
          }),
          e.jsx("rect", {
            x: "3",
            y: "17",
            width: "18",
            height: "4",
            rx: "1",
          }),
        ],
      }),
      input: e.jsx("rect", {
        x: "3",
        y: "8",
        width: "18",
        height: "8",
        rx: "2",
      }),
      button: e.jsx("rect", {
        x: "4",
        y: "8",
        width: "16",
        height: "8",
        rx: "4",
      }),
      appearance: e.jsxs(e.Fragment, {
        children: [
          e.jsx("circle", {
            cx: "13.5",
            cy: "6.5",
            r: "2.5",
          }),
          e.jsx("circle", {
            cx: "17.5",
            cy: "10.5",
            r: "2.5",
          }),
          e.jsx("circle", {
            cx: "8.5",
            cy: "7.5",
            r: "2.5",
          }),
          e.jsx("circle", {
            cx: "6.5",
            cy: "12.5",
            r: "2.5",
          }),
        ],
      }),
      behavior: e.jsx("path", {
        d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
      }),
      notify: e.jsxs(e.Fragment, {
        children: [
          e.jsx("path", {
            d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",
          }),
          e.jsx("path", {
            d: "M13.73 21a2 2 0 0 1-3.46 0",
          }),
        ],
      }),
      settings: e.jsxs(e.Fragment, {
        children: [
          e.jsx("circle", {
            cx: "12",
            cy: "12",
            r: "3",
          }),
          e.jsx("path", {
            d: "M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
          }),
        ],
      }),
    }[a] ||
    e.jsx("circle", {
      cx: "12",
      cy: "12",
      r: "4",
    });
  return e.jsx("span", {
    className: "nexulesuite_fui-acc__ico",
    children: e.jsxs("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: i,
    }),
  });
}
function Ld(a, o) {
  const i = [],
    d = (u) => {
      if (!u || !u.id || u.id === o || u.kind === "layout") return;
      const p = u.settings || {};
      i.push({
        id: u.id,
        moduleId: u.moduleId || "",
        label: (p.label && String(p.label).trim()) || u.moduleId || "Field",
        options: Array.isArray(p.options)
          ? p.options
              .filter((h) => h && (h.label || h.value))
              .map((h) => ({
                label: h.label || h.value,
                value: h.value != null ? h.value : h.label,
              }))
          : [],
      });
    };
  for (const u of Array.isArray(a) ? a : [])
    if (u && u.kind === "layout") {
      const p = (u.layout && u.layout.items) || [];
      for (const h of p) for (const x of h || []) d(x);
    } else d(u);
  return i;
}
function FieldPickerModal({ isOpen: a, onClose: o, onSelect: i }) {
  const [d, u] = Qe.useState(""),
    p = Qe.useMemo(() => {
      const h = d.trim().toLowerCase();
      return Li.filter(
        (x) =>
          h.length === 0 ||
          x.name.toLowerCase().includes(h) ||
          (x.description && x.description.toLowerCase().includes(h)),
      );
    }, [d]),
    nlsTitleId = Qe.useId();
  return a
    ? v.jsxs(ModalShell, {
        open: a,
        onClose: o,
        labelledBy: nlsTitleId,
        size: "lg",
        className: "nls-fb-picker-modal",
        children: [
          v.jsxs("div", {
            className: "nls-modal__header",
            children: [
              v.jsxs("div", {
                className: "min-w-0",
                children: [
                  v.jsx("h2", {
                    id: nlsTitleId,
                    className: "nls-modal__title",
                    children: "Insert Form Fields",
                  }),
                  v.jsx("p", {
                    className: "nls-modal__desc",
                    children: "Select a field type to add to your form",
                  }),
                ],
              }),
              v.jsx("button", {
                type: "button",
                onClick: o,
                className: "nls-icon-btn",
                "aria-label": "Close modal",
                children: v.jsx(qa, {
                  size: 18,
                  "aria-hidden": "true",
                }),
              }),
            ],
          }),
          v.jsx("div", {
            className: "nls-fb-picker__search",
            children: v.jsxs("div", {
              className: "nls-input-icon",
              children: [
                v.jsx(Px, {
                  "aria-hidden": "true",
                }),
                v.jsx("input", {
                  type: "text",
                  placeholder: "Search fields by name...",
                  value: d,
                  onChange: (h) => u(h.target.value),
                  autoFocus: !0,
                  "data-autofocus": "",
                  "aria-label": "Search fields",
                }),
              ],
            }),
          }),
          v.jsx("div", {
            className: "nls-modal__body nls-fb-picker__body",
            children:
              p.length === 0
                ? v.jsxs("div", {
                    className: "nls-empty-inline",
                    children: [
                      v.jsx("p", {
                        className: "nls-fb-empty-title",
                        children: "No fields found",
                      }),
                      v.jsx("p", {
                        children: "Try adjusting your search",
                      }),
                    ],
                  })
                : (() => {
                    const fields = p.filter((h) => (h.row || 0) !== 0);
                    const layouts = p.filter((h) => (h.row || 0) === 0);
                    return v.jsxs("div", {
                      className: "nexulesuite_fui-picker nls-fb-picker",
                      children: [
                        v.jsx("div", {
                          className: "nls-fb-picker__grid",
                          children: fields.map((h) =>
                            v.jsxs(
                              "button",
                              {
                                type: "button",
                                onClick: () => {
                                  (i(h), o());
                                },
                                className: "nexulesuite_fui-picker__item nls-fb-picker__item",
                                children: [
                                  v.jsx("span", {
                                    className: "nls-fb-picker__icon",
                                    "aria-hidden": "true",
                                    children: h.icon,
                                  }),
                                  v.jsx("h3", {
                                    className: "nls-fb-picker__name",
                                    children: h.name,
                                  }),
                                ],
                              },
                              h.id,
                            ),
                          ),
                        }),
                        layouts.length
                          ? v.jsx("div", {
                              className: "nls-fb-picker__grid",
                              children: layouts.map((h) =>
                                v.jsxs(
                                  "button",
                                  {
                                    type: "button",
                                    onClick: () => {
                                      (i(h), o());
                                    },
                                    className: "nexulesuite_fui-picker__item nls-fb-picker__item is-layout",
                                    children: [
                                      v.jsx("span", {
                                        className: "nls-fb-picker__icon",
                                        "aria-hidden": "true",
                                        children: h.icon,
                                      }),
                                      v.jsx("h3", {
                                        className: "nls-fb-picker__name",
                                        children: h.name,
                                      }),
                                    ],
                                  },
                                  h.id,
                                ),
                              ),
                            })
                          : null,
                      ],
                    });
                  })(),
          }),
        ],
      })
    : null;
}
function zd(a) {
  const o = a.currentTarget;
  if (!(o != null && o.getBoundingClientRect)) return "bottom";
  const i = o.getBoundingClientRect(),
    d = a.clientX - i.left,
    u = a.clientY - i.top,
    p = i.height * 0.25,
    h = i.height * 0.25;
  return u <= p ? "top" : u >= i.height - h ? "bottom" : d < i.width / 2 ? "left" : "right";
}
function FieldCard({
  field: a,
  draggingId: o,
  hoverEdge: i,
  hoverTargetId: d,
  onRemove: u,
  onEdit: p,
  onDragStart: h,
  onDragEnd: x,
  onHoverEdge: f,
  onDropEdge: S,
}) {
  var y, P, M, T, F, V, z;
  const U = d === (a == null ? void 0 : a.id) && !!i,
    w = Qe.useMemo(
      () => (U && (i === "top" || i === "bottom" || i === "left" || i === "right") ? "is-drop-target" : ""),
      [U, i],
    );
  return v.jsxs("div", {
    className: "nls-fb-field-wrap group",
    children: [
      v.jsx("button", {
        type: "button",
        onClick: u,
        className: "nls-icon-btn nls-icon-btn--sm nls-icon-btn--danger nls-fb-field__remove",
        "aria-label": "Remove field",
        children: v.jsx(qa, {
          size: 14,
          "aria-hidden": "true",
        }),
      }),
      v.jsxs("div", {
        role: "button",
        tabIndex: 0,
        onClick: p,
        onKeyDown: (N) => {
          (N.key === "Enter" || N.key === " ") && (N.preventDefault(), p == null || p());
        },
        onDragOver: (N) => {
          (N.preventDefault(),
            !(!o || o === (a == null ? void 0 : a.id)) && (f == null || f(a == null ? void 0 : a.id, zd(N))));
        },
        onDragLeave: () => (f == null ? void 0 : f(null, null)),
        onDrop: (N) => {
          var H;
          N.preventDefault();
          const W = ((H = N.dataTransfer) == null ? void 0 : H.getData("text/plain")) || "",
            I = zd(N);
          (f == null || f(null, null),
            W && W !== (a == null ? void 0 : a.id) && (S == null || S(W, a == null ? void 0 : a.id, I)));
        },
        className: ["nls-fb-field", w].join(" "),
        children: [
          v.jsx("div", {
            draggable: !0,
            onClick: (N) => {
              (N.preventDefault(), N.stopPropagation());
            },
            onMouseDown: (N) => N.stopPropagation(),
            onDragStart: (N) => {
              var H, W, I;
              ((H = N.dataTransfer) == null || H.setData("text/plain", String((a == null ? void 0 : a.id) || "")),
                (I = (W = N.dataTransfer) == null ? void 0 : W.setDragImage) == null ||
                  I.call(W, N.currentTarget, 10, 10),
                h == null || h(a == null ? void 0 : a.id));
            },
            onDragEnd: () => (x == null ? void 0 : x()),
            className: "nls-fb-field__handle",
            "aria-label": "Drag to move",
            title: "Drag to move",
            children: v.jsx(Tx, {
              size: 18,
            }),
          }),
          v.jsx("div", {
            className: "flex-1 min-w-0",
            children: v.jsxs("div", {
              className: "flex items-start gap-3",
              children: [
                v.jsx("div", {
                  className: "nls-fb-field__ico",
                  style: {
                    backgroundColor:
                      ((y = a == null ? void 0 : a.settings) == null ? void 0 : y.backgroundColor) || "#ffffff",
                  },
                  children: v.jsx("div", {
                    style: {
                      color: ((P = a == null ? void 0 : a.settings) == null ? void 0 : P.textColor) || "#000000",
                    },
                    children: (() => {
                      const N = Zn(a == null ? void 0 : a.moduleId, a == null ? void 0 : a.module);
                      return (N == null ? void 0 : N.icon) || Pd(a == null ? void 0 : a.moduleId);
                    })(),
                  }),
                }),
                v.jsxs("div", {
                  className: "flex-1 min-w-0",
                  children: [
                    v.jsx("h3", {
                      className: "nls-fb-field__title",
                      style: {
                        color: ((M = a == null ? void 0 : a.settings) == null ? void 0 : M.textColor) || "#000000",
                      },
                      children:
                        ((T = a == null ? void 0 : a.settings) == null ? void 0 : T.label) ||
                        ((F = a == null ? void 0 : a.module) == null ? void 0 : F.name),
                    }),
                    ((V = a == null ? void 0 : a.settings) == null ? void 0 : V.helpText) &&
                      v.jsx("p", {
                        className: "nls-fb-field__hint",
                        children: a.settings.helpText,
                      }),
                    v.jsxs("div", {
                      className: "nls-fb-field__meta",
                      children: [
                        v.jsxs("span", {
                          children: ["Width: ", (a == null ? void 0 : a.columnSpan) || 1, "/4"],
                        }),
                        ((z = a == null ? void 0 : a.settings) == null ? void 0 : z.required) &&
                          v.jsx("span", {
                            className: "nls-badge nls-badge--danger",
                            children: "Required",
                          }),
                        (a == null ? void 0 : a.settings) != null &&
                        a.settings.conditional &&
                        a.settings.conditional.enabled &&
                        Array.isArray(a.settings.conditional.rules) &&
                        a.settings.conditional.rules.length
                          ? v.jsxs("span", {
                              className: "nls-badge nls-badge--primary",
                              children: [
                                v.jsx(Ex, {
                                  size: 12,
                                  className: "rotate-90",
                                  "aria-hidden": "true",
                                }),
                                "Conditional",
                              ],
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
    ],
  });
}
function $x({ block: a, dnd: o, onSelectField: i, onRemoveField: d }) {
  var u, p;
  const h = Math.max(
      1,
      Math.min(4, parseInt(((u = a == null ? void 0 : a.layout) == null ? void 0 : u.columns) || 1, 10) || 1),
    ),
    x = Array.isArray((p = a == null ? void 0 : a.layout) == null ? void 0 : p.items) ? a.layout.items : [],
    f = h === 1 ? "grid-cols-1" : h === 2 ? "grid-cols-2" : h === 3 ? "grid-cols-3" : "grid-cols-4";
  return v.jsx("div", {
    className: "nls-fb-layout",
    children: v.jsx("div", {
      className: ["grid gap-3", f].join(" "),
      children: Array.from({
        length: h,
      }).map((S, y) => {
        const P = x[y] || [];
        return v.jsx(
          "div",
          {
            className: "space-y-3",
            children: P.map((M) =>
              v.jsx(
                FieldCard,
                {
                  field: M,
                  draggingId: o.draggingId,
                  hoverEdge: o.hoverEdge,
                  hoverTargetId: o.hoverTargetId,
                  onDragStart: o.onDragStart,
                  onDragEnd: o.onDragEnd,
                  onHoverEdge: o.onHoverEdge,
                  onDropEdge: o.onDropEdge,
                  onRemove: () => d(M.id),
                  onEdit: () => i(M.id),
                },
                M.id,
              ),
            ),
          },
          y,
        );
      }),
    }),
  });
}
function FieldList({ blocks: a, onSelectField: o, onRemoveField: i, onInsertFields: d, onDropField: u }) {
  const p = Array.isArray(a) ? a : [],
    [h, x] = Qe.useState(null),
    [f, S] = Qe.useState(null),
    [y, P] = Qe.useState(null),
    M = Qe.useMemo(
      () => ({
        draggingId: h,
        hoverTargetId: f,
        hoverEdge: y,
        onDragStart: (T) => {
          (x(T || null), S(null), P(null));
        },
        onDragEnd: () => {
          (x(null), S(null), P(null));
        },
        onHoverEdge: (T, F) => {
          (S(T || null), P(F || null));
        },
        onDropEdge: (T, F, V) => {
          (x(null), S(null), P(null), u == null || u(T, F, V));
        },
      }),
      [h, f, y, u],
    );
  return v.jsxs("div", {
    className: "nls-fb-canvas",
    children: [
      v.jsx("h2", {
        className: "nls-fb-canvas__title",
        children: "Form Fields",
      }),
      p.length === 0
        ? v.jsxs("div", {
            className: "nls-empty nls-fb-canvas__empty",
            children: [
              v.jsx("div", {
                className: "nls-empty__icon",
                "aria-hidden": "true",
                children: v.jsx("svg", {
                  className: "h-5 w-5",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  children: v.jsx("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M7 7h10M7 12h10M7 17h10",
                  }),
                }),
              }),
              v.jsx("p", {
                className: "nls-empty__desc",
                children: "You haven't added any fields yet. Add form fields to get started.",
              }),
              v.jsx("div", {
                className: "nls-empty__actions nls-fb-canvas__empty-actions",
                children: v.jsxs("button", {
                  type: "button",
                  onClick: () => d(null),
                  className: "nls-btn nls-btn--dashed nls-btn--block",
                  children: [
                    v.jsx("span", {
                      "aria-hidden": "true",
                      children: "+",
                    }),
                    v.jsx("span", {
                      children: "Insert Form Fields",
                    }),
                  ],
                }),
              }),
            ],
          })
        : v.jsxs("div", {
            className: "nls-stack nls-stack--tight nls-fb-canvas__list",
            children: [
              p.map((T) =>
                (T == null ? void 0 : T.kind) === "layout"
                  ? v.jsx(
                      $x,
                      {
                        block: T,
                        dnd: M,
                        onSelectField: o,
                        onRemoveField: i,
                      },
                      T.id,
                    )
                  : v.jsx(
                      FieldCard,
                      {
                        field: T,
                        draggingId: M.draggingId,
                        hoverEdge: M.hoverEdge,
                        hoverTargetId: M.hoverTargetId,
                        onDragStart: M.onDragStart,
                        onDragEnd: M.onDragEnd,
                        onHoverEdge: M.onHoverEdge,
                        onDropEdge: M.onDropEdge,
                        onRemove: () => i(T.id),
                        onEdit: () => o(T.id),
                      },
                      T.id,
                    ),
              ),
              v.jsxs("button", {
                type: "button",
                onClick: () => d(null),
                className: "nls-btn nls-btn--dashed nls-btn--block",
                children: [
                  v.jsx("span", {
                    "aria-hidden": "true",
                    children: "+",
                  }),
                  v.jsx("span", {
                    children: "Insert Form Fields",
                  }),
                ],
              }),
            ],
          }),
    ],
  });
}
function Zn(a, o = null) {
  const i = a || (o == null ? void 0 : o.id) || (o == null ? void 0 : o.moduleId) || "",
    d = Li.find((u) => u.id === i) || null;
  return d
    ? o && typeof o == "object"
      ? {
          ...d,
          ...o,
          icon: d.icon,
        }
      : d
    : o || null;
}
function Id(a) {
  return Zn(a);
}
function Rx(a) {
  return !!a && a.category === "layout";
}
function Rd(a) {
  return {
    id: `step-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: `Step ${a + 1}`,
    subtitle: "",
    fields: [],
  };
}
function Fx(a) {
  const o = Math.max(1, Math.min(4, parseInt(a.columnSpan || 1, 10) || 1));
  return {
    id: `layout-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    kind: "layout",
    moduleId: a.id,
    module: a,
    layout: {
      columns: o,
      items: Array.from({
        length: o,
      }).map(() => []),
    },
  };
}
function zi(a, o) {
  var i;
  for (let d = 0; d < a.length; d++) {
    const u = a[d];
    if ((u == null ? void 0 : u.kind) === "layout") {
      const p = ((i = u == null ? void 0 : u.layout) == null ? void 0 : i.items) || [];
      for (let h = 0; h < p.length; h++) {
        const x = p[h] || [],
          f = x.findIndex((S) => (S == null ? void 0 : S.id) === o);
        if (f !== -1)
          return {
            field: x[f],
            path: {
              bi: d,
              ci: h,
              fi: f,
              kind: "layout",
            },
          };
      }
    } else if ((u == null ? void 0 : u.id) === o)
      return {
        field: u,
        path: {
          bi: d,
          kind: "field",
        },
      };
  }
  return null;
}
function Dx(a, o, i) {
  return a.map((d) => {
    var u;
    if ((d == null ? void 0 : d.kind) === "layout") {
      const p = (((u = d.layout) == null ? void 0 : u.items) || []).map((h) =>
        (h || []).map((x) =>
          (x == null ? void 0 : x.id) === o
            ? {
                ...x,
                settings: i,
              }
            : x,
        ),
      );
      return {
        ...d,
        layout: {
          ...(d.layout || {}),
          items: p,
        },
      };
    }
    return (d == null ? void 0 : d.id) === o
      ? {
          ...d,
          settings: i,
        }
      : d;
  });
}
function Ox(a, o) {
  var i;
  const d = [];
  for (const u of a)
    if ((u == null ? void 0 : u.kind) === "layout") {
      const p = (((i = u.layout) == null ? void 0 : i.items) || []).map((h) =>
        (h || []).filter((x) => (x == null ? void 0 : x.id) !== o),
      );
      d.push({
        ...u,
        layout: {
          ...(u.layout || {}),
          items: p,
        },
      });
    } else (u == null ? void 0 : u.id) !== o && d.push(u);
  return d;
}
function Fd(a) {
  var o;
  const i = ((o = a == null ? void 0 : a.layout) == null ? void 0 : o.items) || [],
    d = [];
  for (let u = 0; u < i.length; u++) {
    const p = i[u] || [];
    for (const h of p) d.push(h);
  }
  return d;
}
function $i(a, o) {
  const i = Math.max(1, Math.min(4, o)),
    d = Array.from({
      length: i,
    }).map(() => []);
  return (
    a.forEach((u, p) => {
      d[p % i].push(u);
    }),
    {
      columns: i,
      items: d,
    }
  );
}
function Nn(a) {
  const o = [];
  for (const i of a) {
    if ((i == null ? void 0 : i.kind) !== "layout") {
      o.push(i);
      continue;
    }
    const d = Fd(i);
    if (d.length === 0) continue;
    if (d.length === 1) {
      o.push(d[0]);
      continue;
    }
    const u = Math.min(4, d.length),
      p = {
        ...i,
        layout: $i(d, u),
      };
    o.push(p);
  }
  return o;
}
function Bx(a, o) {
  var i;
  let d = null;
  const u = [];
  for (const p of a)
    if ((p == null ? void 0 : p.kind) === "layout") {
      const h = (((i = p.layout) == null ? void 0 : i.items) || []).map((x) =>
        (x || []).filter((f) => ((f == null ? void 0 : f.id) === o ? ((d = f), !1) : !0)),
      );
      u.push({
        ...p,
        layout: {
          ...(p.layout || {}),
          items: h,
        },
      });
    } else {
      if ((p == null ? void 0 : p.id) === o) {
        d = p;
        continue;
      }
      u.push(p);
    }
  return {
    blocks: Nn(u),
    removed: d,
  };
}
function Ux(a, o, i, d) {
  if (!o || !i || o === i) return a;
  const u = zi(a, i);
  if (!(u != null && u.path)) return a;
  const { blocks: p, removed: h } = Bx(a, o);
  if (!h) return a;
  const x = zi(p, i);
  if (!(x != null && x.path)) return Nn([...p, h]);
  const f = x.path;
  if (d === "top" || d === "bottom") {
    const w = (f.kind, f.bi),
      N = d === "top" ? w : w + 1,
      H = [...p];
    return (H.splice(N, 0, h), Nn(H));
  }
  const S = (f.kind, f.bi),
    y = p[S];
  if (!y) return Nn([...p, h]);
  if (y.kind !== "layout") {
    const w = d === "left" ? [h, y] : [y, h],
      N = {
        id: `layout-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        kind: "layout",
        moduleId: "2-column",
        module: Id("2-column"),
        layout: $i(w, 2),
      },
      H = [...p];
    return (H.splice(S, 1, N), Nn(H));
  }
  const P = Fd(y);
  if (P.length >= 4) {
    const w = [...p];
    return (w.splice(S + 1, 0, h), Nn(w));
  }
  const M = P.findIndex((w) => (w == null ? void 0 : w.id) === i),
    T = Math.max(0, M + (d === "right" ? 1 : 0)),
    F = [...P];
  F.splice(T, 0, h);
  const V = Math.min(4, F.length),
    z = {
      ...y,
      moduleId: `${V}-column`,
      module: Id(`${V}-column`),
      layout: $i(F, V),
    },
    U = [...p];
  return (U.splice(S, 1, z), Nn(U));
}
function FormCanvas({ form: a, onPatchForm: o, onSelectionChange: i }) {
  var d, u;
  const [p, h] = Qe.useState(!1),
    [x, f] = Qe.useState(null),
    [S, y] = Qe.useState(null),
    [P, M] = Qe.useState(
      ((u = (d = a == null ? void 0 : a.steps) == null ? void 0 : d[0]) == null ? void 0 : u.id) || "step-1",
    ),
    T = Array.isArray(a == null ? void 0 : a.steps) ? a.steps : [],
    F = Math.max(
      0,
      T.findIndex((I) => I.id === P),
    ),
    V = T[F] ||
      T[0] || {
        fields: [],
      },
    z = Array.isArray(V.fields) ? V.fields : [],
    U = Qe.useMemo(() => {
      if (!x) return null;
      const I = zi(z, x);
      if (!(I != null && I.field)) return null;
      const C = Zn(I.field.moduleId, I.field.module);
      return {
        ...I.field,
        module: C,
      };
    }, [z, x]);
  Qe.useEffect(() => {
    if (typeof i == "function") {
      if (!x || !U) {
        i(null);
        return;
      }
      i({
        field: U,
        fields: Ld(z, x),
        updateSettings: (I) => H(x, I),
        clear: () => f(null),
      });
    }
  }, [x, U]);
  const w = (I) => {
      const C = T.map((J, j) =>
        j === F
          ? {
              ...J,
              ...I,
            }
          : J,
      );
      o({
        steps: C,
      });
    },
    N = (I) => {
      var C, J;
      if ((I == null ? void 0 : I.id) === "page-break") {
        const le = [...T];
        le.length === 0 && le.push(Rd(0));
        const ie = Math.max(0, F + 1);
        le.splice(ie, 0, Rd(ie));
        const O = le.map((te, pe) => ({
          ...te,
          title: te.title && te.title.trim() ? te.title : `Step ${pe + 1}`,
        }));
        (o({
          formType: "multi",
          steps: O,
        }),
          f(null),
          y(null),
          h(!1),
          M(((C = O[ie]) == null ? void 0 : C.id) || ((J = O[0]) == null ? void 0 : J.id) || "step-1"));
        return;
      }
      if (Rx(I)) {
        const le = Fx(I);
        (w({
          fields: [...z, le],
        }),
          f(null),
          y(null),
          h(!1));
        return;
      }
      const j = {
        id: `field-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        kind: "field",
        moduleId: I.id,
        module: I,
        columnSpan: I.columnSpan,
        settings: Md(I.columnSpan),
      };
      (w({
        fields: [...z, j],
      }),
        f(j.id),
        y(null),
        h(!1));
    },
    H = (I, C) => {
      w({
        fields: Dx(z, I, C),
      });
    },
    W = (I) => {
      (w({
        fields: Ox(z, I),
      }),
        x === I && f(null));
    };
  return v.jsxs("div", {
    className: "relative",
    children: [
      (a == null ? void 0 : a.formType) === "multi" &&
        v.jsxs("div", {
          className: "nls-fb-steps",
          children: [
            v.jsx("div", {
              className: "nls-pills",
              role: "group",
              "aria-label": "Steps",
              children: T.map((I, C) =>
                v.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => M(I.id),
                    className: ["nls-pill", P === I.id ? "is-active" : ""].join(" "),
                    "aria-pressed": P === I.id,
                    title: I.title || `Step ${C + 1}`,
                    children: I.title || `Step ${C + 1}`,
                  },
                  I.id,
                ),
              ),
            }),
            v.jsxs("button", {
              type: "button",
              onClick: () => {
                const I = `step-${Date.now()}`,
                  C = [
                    ...T,
                    {
                      id: I,
                      title: `Step ${T.length + 1}`,
                      subtitle: "",
                      fields: [],
                    },
                  ];
                (o({
                  steps: C,
                }),
                  M(I));
              },
              className: "nls-btn nls-btn--primary nls-btn--sm nls-fb-steps__add",
              children: [
                v.jsx(Ax, {
                  size: 16,
                  "aria-hidden": "true",
                }),
                "Add Step",
              ],
            }),
          ],
        }),
      v.jsx(FieldList, {
        blocks: z.map((I) => {
          var C;
          return (I == null ? void 0 : I.kind) === "layout"
            ? {
                ...I,
                module: Zn(I.moduleId, I.module),
                layout: {
                  ...(I.layout || {}),
                  items: (((C = I.layout) == null ? void 0 : C.items) || []).map((J) =>
                    (J || []).map((j) => ({
                      ...j,
                      module: Zn(j.moduleId, j.module),
                    })),
                  ),
                },
              }
            : {
                ...I,
                module: Zn(I.moduleId, I.module),
              };
        }),
        onSelectField: f,
        onRemoveField: W,
        onDropField: (I, C, J) => {
          w({
            fields: Ux(z, I, C, J),
          });
        },
        onInsertFields: (I) => {
          (y(I || null), h(!0));
        },
      }),
      v.jsx(FieldPickerModal, {
        isOpen: p,
        onClose: () => h(!1),
        onSelect: N,
      }),
    ],
  });
}
function FieldSettingsPanel({ field: a, onUpdate: o, onClose: i }) {
  var d;
  if (!a) return null;
  const u = (a == null ? void 0 : a.moduleId) || "",
    [x, f] = Qe.useState(!1),
    [S, y] = Qe.useState(""),
    [P, M] = Qe.useState(""),
    [T, F] = Qe.useState(""),
    [V, z] = Qe.useState(""),
    [U, w] = Qe.useState(""),
    [N, H] = Qe.useState("v2"),
    [W, I] = Qe.useState("0.5"),
    C = (B, ee) => {
      const _ = {
        ...(a.settings || {}),
        [B]: ee,
      };
      o(a.id, _);
    },
    J = async (B, ee = {}) => {
      var _, X, L;
      const A =
          (((_ = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : _.restUrl) || "").replace(
            /\/$/,
            "",
          ) + B,
        k = await fetch(A, {
          ...ee,
          headers: {
            "Content-Type": "application/json",
            "X-WP-Nonce": ((X = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : X.nonce) || "",
            ...(ee.headers || {}),
          },
        }),
        Z = await k.json().catch(() => null);
      if (!k.ok) {
        const ue =
          (Z == null ? void 0 : Z.message) ||
          ((L = Z == null ? void 0 : Z.data) == null ? void 0 : L.message) ||
          `Request failed (${k.status})`;
        throw new Error(ue);
      }
      return Z;
    };
  Qe.useEffect(() => {
    if (!(u === "recaptcha" || u === "cloudflare")) return;
    let B = !0;
    return (
      y(""),
      M(""),
      f(!0),
      (async () => {
        try {
          const ee = await J(
            u === "recaptcha" ? "/nexulesuite_/v1/captcha/recaptcha" : "/nexulesuite_/v1/captcha/turnstile",
          );
          if (!B) return;
          const _ = (ee == null ? void 0 : ee.data) || {};
          (F(_.siteKey || ""),
            z(""),
            w(_.secretMasked || ""),
            u === "recaptcha" &&
              (H(_.apiVersion === "v3" ? "v3" : "v2"),
              I(
                String(
                  ["number", "string"].includes(typeof _.scoreThreshold) && !isNaN(parseFloat(_.scoreThreshold))
                    ? parseFloat(_.scoreThreshold)
                    : 0.5,
                ),
              )));
        } catch (ee) {
          B && y((ee == null ? void 0 : ee.message) || "Failed to load keys.");
        } finally {
          B && f(!1);
        }
      })(),
      () => {
        B = !1;
      }
    );
  }, [u]);
  const j = a.settings || {},
    le = j.consent || {
      label: "Terms & Condition",
      html: "",
      mode: "visual",
    },
    O = (B, ee) => {
      const _ = j.nameParts || {},
        X = _[B] || {};
      C("nameParts", {
        ..._,
        [B]: {
          ...X,
          ...ee,
        },
      });
    },
    te = Array.isArray(j.options) ? j.options : [],
    pe = j.phoneValidation || {
      type: "none",
      characterLimit: 0,
    },
    me = j.addressParts || {};
  return v.jsxs("div", {
    className: "nls-fb-fs",
    children: [
      v.jsxs("div", {
        className: "nls-fb-fs__head",
        children: [
          v.jsxs("div", {
            className: "min-w-0",
            children: [
              v.jsx("p", {
                className: "nls-fb-fs__title",
                children: "Field Settings",
              }),
              v.jsx("p", {
                className: "nls-fb-fs__sub truncate",
                children: ((d = a == null ? void 0 : a.module) == null ? void 0 : d.name) || "Field",
              }),
            ],
          }),
          v.jsx("button", {
            type: "button",
            onClick: i,
            className: "nls-icon-btn",
            "aria-label": "Close field settings",
            children: v.jsx(qa, {
              size: 16,
              "aria-hidden": "true",
            }),
          }),
        ],
      }),
      v.jsxs("section", {
        className: "nls-fb-fs__group",
        children: [
          v.jsx("p", {
            className: "nls-fb-fs__group-title",
            children: "Field Labels",
          }),
          v.jsxs("div", {
            className: "nls-stack nls-stack--tight",
            children: [
              v.jsxs("div", {
                className: "nls-field",
                children: [
                  v.jsxs("label", {
                    className: "nls-field",
                    children: [
                      v.jsx("span", {
                        className: "nls-field__label",
                        children: "Field Label",
                      }),
                      v.jsx("input", {
                        type: "text",
                        value: j.label || "",
                        onChange: (B) => C("label", B.target.value),
                        placeholder: "Field label",
                      }),
                    ],
                  }),
                  v.jsxs("label", {
                    className: "nls-check",
                    children: [
                      v.jsx("input", {
                        type: "checkbox",
                        checked: j.showLabel !== !1,
                        onChange: (B) => C("showLabel", B.target.checked),
                      }),
                      "Show label",
                    ],
                  }),
                ],
              }),
              v.jsxs("label", {
                className: "nls-field",
                children: [
                  v.jsx("span", {
                    className: "nls-field__label",
                    children: "Placeholder",
                  }),
                  v.jsx("input", {
                    type: "text",
                    value: j.placeholder || "",
                    onChange: (B) => C("placeholder", B.target.value),
                    placeholder: "Placeholder text",
                  }),
                ],
              }),
              v.jsxs("label", {
                className: "nls-field",
                children: [
                  v.jsx("span", {
                    className: "nls-field__label",
                    children: "Help Text",
                  }),
                  v.jsx("textarea", {
                    value: j.helpText || "",
                    onChange: (B) => C("helpText", B.target.value),
                    className: "nls-fb-ta-sm",
                    rows: 2,
                    placeholder: "Help text for users",
                  }),
                ],
              }),
              v.jsxs("label", {
                className: "nls-check",
                children: [
                  v.jsx("input", {
                    type: "checkbox",
                    checked: !!j.required,
                    onChange: (B) => C("required", B.target.checked),
                  }),
                  "Required",
                ],
              }),
            ],
          }),
        ],
      }),
      (u === "radio" || u === "checkbox" || u === "dropdown") &&
        v.jsxs("section", {
          className: "nls-fb-fs__group",
          children: [
            v.jsxs("div", {
              className: "nls-between",
              children: [
                v.jsx("p", {
                  className: "nls-fb-fs__group-title",
                  children: "Options",
                }),
                (u === "radio" || u === "checkbox") &&
                  v.jsxs("label", {
                    className: "nls-inline-field",
                    children: [
                      v.jsx("span", {
                        children: "Layout",
                      }),
                      v.jsxs("select", {
                        value: j.optionLayout || "vertical",
                        onChange: (B) => C("optionLayout", B.target.value),
                        className: "nls-fb-sel-auto",
                        children: [
                          v.jsx("option", {
                            value: "vertical",
                            children: "Vertical",
                          }),
                          v.jsx("option", {
                            value: "inline",
                            children: "Inline",
                          }),
                        ],
                      }),
                    ],
                  }),
              ],
            }),
            v.jsx("div", {
              className: "nls-stack nls-stack--tight",
              children: te.map((B, ee) =>
                v.jsxs(
                  "div",
                  {
                    className: "nls-input-group nls-fb-option-row",
                    children: [
                      v.jsxs("div", {
                        className: "nls-grid-2 nls-fb-option-row__fields",
                        children: [
                          v.jsxs("label", {
                            className: "nls-field",
                            children: [
                              v.jsx("span", {
                                className: "nls-field__label",
                                children: "Label",
                              }),
                              v.jsx("input", {
                                type: "text",
                                value: (B == null ? void 0 : B.label) || "",
                                onChange: (_) => {
                                  const X = te.map((L, A) =>
                                    A === ee
                                      ? {
                                          ...L,
                                          label: _.target.value,
                                        }
                                      : L,
                                  );
                                  C("options", X);
                                },
                              }),
                            ],
                          }),
                          v.jsxs("label", {
                            className: "nls-field",
                            children: [
                              v.jsx("span", {
                                className: "nls-field__label",
                                children: "Value",
                              }),
                              v.jsx("input", {
                                type: "text",
                                value: (B == null ? void 0 : B.value) || "",
                                onChange: (_) => {
                                  const X = te.map((L, A) =>
                                    A === ee
                                      ? {
                                          ...L,
                                          value: _.target.value,
                                        }
                                      : L,
                                  );
                                  C("options", X);
                                },
                                className: "nls-mono",
                              }),
                            ],
                          }),
                        ],
                      }),
                      v.jsx("button", {
                        type: "button",
                        disabled: te.length <= 1,
                        onClick: () => {
                          if (te.length <= 1) return;
                          const _ = te.filter((X, L) => L !== ee);
                          C("options", _);
                        },
                        "aria-label": "Remove option",
                        title: te.length <= 1 ? "At least one option is required" : "Remove option",
                        className: "nls-icon-btn nls-icon-btn--sm nls-icon-btn--danger nls-fb-option-row__remove",
                        children: v.jsx(yt, {
                          size: 14,
                          "aria-hidden": "true",
                        }),
                      }),
                    ],
                  },
                  ee,
                ),
              ),
            }),
            v.jsx("button", {
              type: "button",
              onClick: () => {
                const B = [
                  ...te,
                  {
                    label: `Option ${te.length + 1}`,
                    value: `option_${te.length + 1}`,
                  },
                ];
                C("options", B);
              },
              className: "nls-btn nls-btn--dashed nls-btn--sm nls-btn--block",
              children: "+ Add Option",
            }),
          ],
        }),
      u === "address" &&
        v.jsxs("section", {
          className: "nls-fb-fs__group",
          children: [
            v.jsx("p", {
              className: "nls-fb-fs__group-title",
              children: "Customize Address Field",
            }),
            v.jsx("div", {
              className: "nls-fb-fs__rows",
              children: [
                ["address1", "Address"],
                ["address2", "Apartment, suite, etc."],
                ["city", "City"],
                ["state", "State / Province"],
                ["zip", "ZIP / Postal code"],
                ["country", "Country"],
              ].map(([B, ee]) => {
                const _ = me[B] || {
                  enabled: !0,
                  label: ee,
                };
                return v.jsxs(
                  "div",
                  {
                    className: "nls-fb-fs__row",
                    children: [
                      v.jsxs("div", {
                        className: "nls-between",
                        children: [
                          v.jsxs("label", {
                            className: "nls-check nls-fb-fs__row-check",
                            children: [
                              v.jsx("input", {
                                type: "checkbox",
                                checked: !!_.enabled,
                                onChange: (X) => {
                                  C("addressParts", {
                                    ...me,
                                    [B]: {
                                      ..._,
                                      enabled: X.target.checked,
                                    },
                                  });
                                },
                              }),
                              v.jsx("span", {
                                children: ee,
                              }),
                            ],
                          }),
                          v.jsx("span", {
                            className: "nls-muted",
                            "aria-hidden": "true",
                            children: "▾",
                          }),
                        ],
                      }),
                      v.jsx("div", {
                        className: "nls-fb-fs__row-input",
                        children: v.jsx("input", {
                          type: "text",
                          disabled: !_.enabled,
                          value: _.label || "",
                          onChange: (X) => {
                            C("addressParts", {
                              ...me,
                              [B]: {
                                ..._,
                                label: X.target.value,
                              },
                            });
                          },
                          placeholder: ee,
                          "aria-label": ee + " label",
                        }),
                      }),
                    ],
                  },
                  B,
                );
              }),
            }),
          ],
        }),
      u === "terms-conditions" &&
        v.jsxs("section", {
          className: "nls-fb-fs__group",
          children: [
            v.jsx("p", {
              className: "nls-fb-fs__group-title",
              children: "Customize Consent Field",
            }),
            v.jsxs("div", {
              className: "nls-stack nls-stack--tight",
              children: [
                v.jsxs("label", {
                  className: "nls-field",
                  children: [
                    v.jsx("span", {
                      className: "nls-field__label",
                      children: "Label",
                    }),
                    v.jsx("input", {
                      type: "text",
                      value: le.label || "",
                      onChange: (B) =>
                        C("consent", {
                          ...le,
                          label: B.target.value,
                        }),
                      placeholder: "Terms & Condition",
                    }),
                  ],
                }),
                v.jsxs("div", {
                  className: "nls-fb-editor",
                  children: [
                    v.jsxs("div", {
                      className: "nls-fb-editor__bar",
                      children: [
                        v.jsx("div", {
                          className: "nls-seg",
                          role: "group",
                          "aria-label": "Editor mode",
                          children: [
                            ["visual", "Visual"],
                            ["code", "Code"],
                          ].map(([B, ee]) =>
                            v.jsx(
                              "button",
                              {
                                type: "button",
                                onClick: () =>
                                  C("consent", {
                                    ...le,
                                    mode: B,
                                  }),
                                className: ["nls-seg__btn", (le.mode || "visual") === B ? "is-active" : ""].join(" "),
                                "aria-pressed": (le.mode || "visual") === B,
                                children: ee,
                              },
                              B,
                            ),
                          ),
                        }),
                        v.jsx("button", {
                          type: "button",
                          onClick: () => {
                            C("consent", {
                              ...le,
                              html: (le.html || "") + " {field}",
                            });
                          },
                          className: "nls-btn nls-btn--ghost nls-btn--sm",
                          children: "+ Insert form fields",
                        }),
                      ],
                    }),
                    (le.mode || "visual") === "code"
                      ? v.jsx("textarea", {
                          value: le.html || "",
                          onChange: (B) =>
                            C("consent", {
                              ...le,
                              html: B.target.value,
                            }),
                          className: "nls-fb-editor__ta nls-mono",
                          placeholder: "Yes, I agree with the privacy policy...",
                        })
                      : v.jsxs("div", {
                          className: "nls-fb-editor__visual",
                          children: [
                            v.jsxs("div", {
                              className: "nls-fb-editor__tools",
                              children: [
                                v.jsx("button", {
                                  type: "button",
                                  onClick: () =>
                                    C("consent", {
                                      ...le,
                                      html: `<strong>${le.html || ""}</strong>`,
                                    }),
                                  className: "nls-icon-btn nls-icon-btn--sm nls-fb-editor__tool is-bold",
                                  "aria-label": "Bold",
                                  title: "Bold",
                                  children: "B",
                                }),
                                v.jsx("button", {
                                  type: "button",
                                  onClick: () =>
                                    C("consent", {
                                      ...le,
                                      html: `<em>${le.html || ""}</em>`,
                                    }),
                                  className: "nls-icon-btn nls-icon-btn--sm nls-fb-editor__tool is-italic",
                                  "aria-label": "Italic",
                                  title: "Italic",
                                  children: "I",
                                }),
                                v.jsx("button", {
                                  type: "button",
                                  onClick: () =>
                                    C("consent", {
                                      ...le,
                                      html: `<a href="#" target="_blank" rel="noopener noreferrer">${le.html || "link"}</a>`,
                                    }),
                                  className: "nls-icon-btn nls-icon-btn--sm nls-fb-editor__tool",
                                  "aria-label": "Insert link",
                                  title: "Insert link",
                                  children: "🔗",
                                }),
                              ],
                            }),
                            v.jsx("textarea", {
                              value: le.html || "",
                              onChange: (B) =>
                                C("consent", {
                                  ...le,
                                  html: B.target.value,
                                }),
                              className: "nls-fb-editor__ta",
                              placeholder: "Yes, I agree with the privacy policy...",
                            }),
                          ],
                        }),
                  ],
                }),
                v.jsx("p", {
                  className: "nls-field__hint",
                  children: "Describe what your users should consent to.",
                }),
              ],
            }),
          ],
        }),
      ,
      u === "recaptcha" &&
        v.jsxs("section", {
          className: "nls-fb-fs__group",
          children: [
            v.jsx("p", {
              className: "nls-fb-fs__group-title",
              children: "Google reCAPTCHA",
            }),
            v.jsx("p", {
              className: "nls-field__hint",
              children:
                "Use reCAPTCHA v2 (checkbox) or v3 (invisible score). Keys must match the type you select in Google Admin.",
            }),
            v.jsxs("div", {
              className: "nls-stack nls-stack--tight nls-fb-fs__stack",
              children: [
                v.jsxs("label", {
                  className: "nls-field",
                  children: [
                    v.jsx("span", {
                      className: "nls-field__label",
                      children: "API version",
                    }),
                    v.jsxs("select", {
                      value: N,
                      onChange: (B) => H(B.target.value),
                      children: [
                        v.jsx("option", {
                          value: "v2",
                          children: "reCAPTCHA v2 (checkbox)",
                        }),
                        v.jsx("option", {
                          value: "v3",
                          children: "reCAPTCHA v3 (score)",
                        }),
                      ],
                    }),
                  ],
                }),
                N === "v3"
                  ? v.jsxs("label", {
                      className: "nls-field",
                      children: [
                        v.jsx("span", {
                          className: "nls-field__label",
                          children: "Minimum score (0–1)",
                        }),
                        v.jsx("input", {
                          type: "number",
                          min: "0",
                          max: "1",
                          step: "0.05",
                          value: W,
                          onChange: (B) => I(B.target.value),
                        }),
                        v.jsx("span", {
                          className: "nls-field__hint",
                          children: "Higher = stricter (typical: 0.5; try 0.7 to block more bots).",
                        }),
                      ],
                    })
                  : null,
                v.jsxs("label", {
                  className: "nls-field",
                  children: [
                    v.jsx("span", {
                      className: "nls-field__label",
                      children: "Site Key",
                    }),
                    v.jsx("input", {
                      type: "text",
                      value: T,
                      onChange: (B) => F(B.target.value),
                      placeholder: "Enter your site key here",
                    }),
                  ],
                }),
                v.jsxs("label", {
                  className: "nls-field",
                  children: [
                    v.jsx("span", {
                      className: "nls-field__label",
                      children: "Secret Key",
                    }),
                    v.jsx("input", {
                      type: "password",
                      value: V,
                      onChange: (B) => z(B.target.value),
                      placeholder: "Enter your secret key here",
                    }),
                    U
                      ? v.jsxs("span", {
                          className: "nls-field__hint",
                          children: ["Saved secret: ", U],
                        })
                      : null,
                  ],
                }),
                v.jsxs("div", {
                  className: "nls-row",
                  children: [
                    v.jsx("button", {
                      type: "button",
                      disabled: x,
                      onClick: async () => {
                        (f(!0), y(""), M(""));
                        try {
                          const B = await J("/nexulesuite_/v1/captcha/recaptcha", {
                              method: "POST",
                              body: JSON.stringify({
                                siteKey: T,
                                secretKey: V,
                                apiVersion: N,
                                scoreThreshold: parseFloat(W) || 0.5,
                              }),
                            }),
                            ee = (B == null ? void 0 : B.data) || {};
                          (z(""), w(ee.secretMasked || ""), M("Saved."), window.setTimeout(() => M(""), 1500));
                        } catch (B) {
                          y((B == null ? void 0 : B.message) || "Save failed.");
                        } finally {
                          f(!1);
                        }
                      },
                      className: "nls-btn nls-btn--primary nls-btn--sm" + (x ? " is-loading" : ""),
                      children: x ? "Saving…" : "Save Keys",
                    }),
                    v.jsxs("span", {
                      className: "nls-fb-fs__status",
                      "aria-live": "polite",
                      children: [
                        S
                          ? v.jsx("span", {
                              className: "nls-field__error",
                              children: S,
                            })
                          : null,
                        P
                          ? v.jsx("span", {
                              className: "nls-fb-fs__ok",
                              children: P,
                            })
                          : null,
                      ],
                    }),
                  ],
                }),
              ],
            }),
            v.jsxs("div", {
              className: "nls-fb-fs__preview",
              children: [
                v.jsx("p", {
                  className: "nls-fb-fs__preview-title",
                  children: "reCAPTCHA Preview",
                }),
                v.jsx("p", {
                  className: "nls-field__hint",
                  children: "Preview is shown on the frontend using your saved Site Key (v2 Checkbox).",
                }),
              ],
            }),
          ],
        }),
      u === "cloudflare" &&
        v.jsxs("section", {
          className: "nls-fb-fs__group",
          children: [
            v.jsx("p", {
              className: "nls-fb-fs__group-title",
              children: "Turnstile API Keys",
            }),
            v.jsx("p", {
              className: "nls-field__hint",
              children:
                "Enter your Turnstile API keys below to enable Cloudflare Turnstile option in your form’s CAPTCHA field.",
            }),
            v.jsxs("div", {
              className: "nls-stack nls-stack--tight nls-fb-fs__stack",
              children: [
                v.jsxs("label", {
                  className: "nls-field",
                  children: [
                    v.jsx("span", {
                      className: "nls-field__label",
                      children: "Site Key",
                    }),
                    v.jsx("input", {
                      type: "text",
                      value: T,
                      onChange: (B) => F(B.target.value),
                      placeholder: "Enter your site key here",
                    }),
                  ],
                }),
                v.jsxs("label", {
                  className: "nls-field",
                  children: [
                    v.jsx("span", {
                      className: "nls-field__label",
                      children: "Secret Key",
                    }),
                    v.jsx("input", {
                      type: "password",
                      value: V,
                      onChange: (B) => z(B.target.value),
                      placeholder: "Enter your secret key here",
                    }),
                    U
                      ? v.jsxs("span", {
                          className: "nls-field__hint",
                          children: ["Saved secret: ", U],
                        })
                      : null,
                  ],
                }),
                v.jsxs("div", {
                  className: "nls-row",
                  children: [
                    v.jsx("button", {
                      type: "button",
                      disabled: x,
                      onClick: async () => {
                        (f(!0), y(""), M(""));
                        try {
                          const B = await J("/nexulesuite_/v1/captcha/turnstile", {
                              method: "POST",
                              body: JSON.stringify({
                                siteKey: T,
                                secretKey: V,
                              }),
                            }),
                            ee = (B == null ? void 0 : B.data) || {};
                          (z(""), w(ee.secretMasked || ""), M("Saved."), window.setTimeout(() => M(""), 1500));
                        } catch (B) {
                          y((B == null ? void 0 : B.message) || "Save failed.");
                        } finally {
                          f(!1);
                        }
                      },
                      className: "nls-btn nls-btn--primary nls-btn--sm" + (x ? " is-loading" : ""),
                      children: x ? "Saving…" : "Save Keys",
                    }),
                    v.jsxs("span", {
                      className: "nls-fb-fs__status",
                      "aria-live": "polite",
                      children: [
                        S
                          ? v.jsx("span", {
                              className: "nls-field__error",
                              children: S,
                            })
                          : null,
                        P
                          ? v.jsx("span", {
                              className: "nls-fb-fs__ok",
                              children: P,
                            })
                          : null,
                      ],
                    }),
                  ],
                }),
              ],
            }),
            v.jsxs("div", {
              className: "nls-fb-fs__preview",
              children: [
                v.jsx("p", {
                  className: "nls-fb-fs__preview-title",
                  children: "Turnstile widget preview",
                }),
                v.jsx("p", {
                  className: "nls-field__hint",
                  children: "Widget renders on the frontend using your saved Site Key.",
                }),
              ],
            }),
          ],
        }),
      u === "name" &&
        v.jsxs("section", {
          className: "nls-fb-fs__group",
          children: [
            v.jsxs("div", {
              children: [
                v.jsx("p", {
                  className: "nls-fb-fs__group-title",
                  children: "Customize Name Field",
                }),
                v.jsx("p", {
                  className: "nls-field__hint",
                  children: "Field Labels",
                }),
              ],
            }),
            v.jsx("div", {
              className: "nls-stack nls-stack--tight nls-fb-fs__stack",
              children: [
                ["prefix", "Prefix"],
                ["first", "First Name"],
                ["middle", "Middle Name"],
                ["last", "Last Name"],
              ].map(([B, ee]) => {
                var _;
                const X = ((_ = j == null ? void 0 : j.nameParts) == null ? void 0 : _[B]) || {
                  enabled: B !== "prefix" && B !== "middle",
                  label: ee,
                };
                return v.jsxs(
                  "div",
                  {
                    className: "nls-fb-part",
                    children: [
                      v.jsxs("div", {
                        className: "nls-between",
                        children: [
                          v.jsx("p", {
                            className: "nls-fb-part__title",
                            children: ee,
                          }),
                          v.jsxs("label", {
                            className: "nls-check",
                            children: [
                              v.jsx("input", {
                                type: "checkbox",
                                checked: !!X.enabled,
                                onChange: (L) =>
                                  O(B, {
                                    enabled: L.target.checked,
                                  }),
                              }),
                              "Enabled",
                            ],
                          }),
                        ],
                      }),
                      v.jsx("input", {
                        type: "text",
                        disabled: !X.enabled,
                        value: X.label || "",
                        onChange: (L) =>
                          O(B, {
                            label: L.target.value,
                          }),
                        placeholder: ee,
                        "aria-label": ee + " label",
                      }),
                    ],
                  },
                  B,
                );
              }),
            }),
          ],
        }),
      u === "phone" &&
        v.jsxs("section", {
          className: "nls-fb-fs__group",
          children: [
            v.jsx("p", {
              className: "nls-fb-fs__group-title",
              children: "Validation",
            }),
            v.jsx("p", {
              className: "nls-field__hint",
              children:
                "Make sure the users fill this field as per the selected validation and warn them when they haven't",
            }),
            v.jsxs("div", {
              className: "nls-field nls-fb-fs__stack",
              children: [
                v.jsx("p", {
                  className: "nls-field__label",
                  children: "Type",
                }),
                v.jsx("div", {
                  className: "nls-seg nls-fb-seg-wrap",
                  role: "group",
                  "aria-label": "Validation type",
                  children: [
                    ["none", "None"],
                    ["national", "National"],
                    ["international", "International"],
                    ["character_limit", "Character Limit"],
                  ].map(([B, ee]) => {
                    const _ = (pe.type || "none") === B;
                    return v.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () =>
                          C("phoneValidation", {
                            ...pe,
                            type: B,
                          }),
                        className: ["nls-seg__btn", _ ? "is-active" : ""].join(" "),
                        "aria-pressed": _,
                        children: ee,
                      },
                      B,
                    );
                  }),
                }),
              ],
            }),
            pe.type === "character_limit" &&
              v.jsxs("label", {
                className: "nls-field nls-fb-fs__stack",
                children: [
                  v.jsx("span", {
                    className: "nls-field__label",
                    children: "Character Limit",
                  }),
                  v.jsx("input", {
                    type: "number",
                    min: 1,
                    max: 64,
                    value: pe.characterLimit || "",
                    onChange: (B) =>
                      C("phoneValidation", {
                        ...pe,
                        characterLimit: B.target.value ? parseInt(B.target.value, 10) : 0,
                      }),
                    placeholder: "e.g. 11",
                  }),
                  v.jsx("span", {
                    className: "nls-field__hint",
                    children: "When enabled, the value should be exactly this length (digits-only recommended).",
                  }),
                ],
              }),
          ],
        }),
    ],
  });
}
const Yx = [
    {
      value: "is",
      label: "is",
    },
    {
      value: "is_not",
      label: "is not",
    },
    {
      value: "contains",
      label: "contains",
    },
    {
      value: "starts_with",
      label: "starts with",
    },
    {
      value: "ends_with",
      label: "ends with",
    },
    {
      value: "greater_than",
      label: "greater than",
    },
    {
      value: "less_than",
      label: "less than",
    },
    {
      value: "is_empty",
      label: "is empty",
    },
    {
      value: "is_not_empty",
      label: "is not empty",
    },
  ],
  Jx = new Set(["is_empty", "is_not_empty"]),
  Vd = {
    field: "",
    operator: "is",
    value: "",
  };
function Zx(a) {
  const o = a && typeof a == "object" ? a : {};
  return {
    enabled: !!o.enabled,
    action: o.action === "hide" ? "hide" : "show",
    match: o.match === "any" ? "any" : "all",
    rules: Array.isArray(o.rules) ? o.rules : [],
  };
}
function ConditionalLogicEditor({ field: a, fields: o = [], onChange: i }) {
  var y;
  if (!a) return null;
  const d = Zx((y = a.settings) == null ? void 0 : y.conditional),
    u = Array.isArray(o) ? o : [],
    p = (P) => {
      i == null ||
        i({
          ...d,
          ...P,
        });
    },
    h = (P, M) => {
      const T = d.rules.map((F, V) =>
        V === P
          ? {
              ...F,
              ...M,
            }
          : F,
      );
      p({
        rules: T,
      });
    },
    x = () => {
      var P;
      p({
        rules: [
          ...d.rules,
          {
            ...Vd,
            field: ((P = u[0]) == null ? void 0 : P.id) || "",
          },
        ],
      });
    },
    f = (P) => {
      p({
        rules: d.rules.filter((M, T) => T !== P),
      });
    },
    S = (P) => {
      var M;
      P && d.rules.length === 0
        ? p({
            enabled: !0,
            rules: [
              {
                ...Vd,
                field: ((M = u[0]) == null ? void 0 : M.id) || "",
              },
            ],
          })
        : p({
            enabled: P,
          });
    };
  return e.jsxs("div", {
    className: "nls-card nls-fb-cl",
    children: [
      e.jsxs("button", {
        type: "button",
        onClick: () => S(!d.enabled),
        "aria-pressed": d.enabled,
        className: "nls-fb-cl__head",
        children: [
          e.jsxs("span", {
            className: "nls-section__head",
            children: [
              e.jsx("span", {
                className: "nls-section__ico",
                "aria-hidden": "true",
                children: e.jsx(ji, {
                  size: 15,
                }),
              }),
              e.jsxs("span", {
                className: "min-w-0",
                children: [
                  e.jsx("span", {
                    className: "nls-fb-cl__title",
                    children: "Conditional Logic",
                  }),
                  e.jsx("span", {
                    className: "nls-fb-cl__desc",
                    children: "Show or hide this field based on other answers.",
                  }),
                ],
              }),
            ],
          }),
          e.jsx("span", {
            role: "switch",
            "aria-checked": d.enabled,
            className: "nls-switch" + (d.enabled ? " is-on" : ""),
          }),
        ],
      }),
      d.enabled &&
        e.jsx("div", {
          className: "nls-card__body nls-fb-cl__body",
          children:
            u.length === 0
              ? e.jsx("p", {
                  className: "nls-empty-inline nls-fb-cl__empty",
                  children: "Add at least one more field to this step to build a condition.",
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsxs("div", {
                      className: "nls-row nls-fb-cl__sentence",
                      children: [
                        e.jsxs("select", {
                          value: d.action,
                          onChange: (P) =>
                            p({
                              action: P.target.value,
                            }),
                          className: "nls-fb-sel-auto",
                          "aria-label": "Action",
                          children: [
                            e.jsx("option", {
                              value: "show",
                              children: "Show",
                            }),
                            e.jsx("option", {
                              value: "hide",
                              children: "Hide",
                            }),
                          ],
                        }),
                        e.jsx("span", {
                          children: "this field when",
                        }),
                        e.jsxs("select", {
                          value: d.match,
                          onChange: (P) =>
                            p({
                              match: P.target.value,
                            }),
                          className: "nls-fb-sel-auto",
                          "aria-label": "Match",
                          children: [
                            e.jsx("option", {
                              value: "all",
                              children: "all",
                            }),
                            e.jsx("option", {
                              value: "any",
                              children: "any",
                            }),
                          ],
                        }),
                        e.jsx("span", {
                          children: "of these match:",
                        }),
                      ],
                    }),
                    e.jsx("div", {
                      className: "nls-stack nls-stack--tight nls-fb-rules",
                      children: d.rules.map((P, M) => {
                        const T = u.find((z) => z.id === P.field),
                          F = T && T.options && T.options.length > 0,
                          V = !Jx.has(P.operator);
                        return e.jsxs(
                          "div",
                          {
                            className: "nls-fb-rule",
                            children: [
                              e.jsxs("div", {
                                className: "nls-row nls-fb-rule__fields",
                                children: [
                                  e.jsxs("select", {
                                    value: P.field,
                                    onChange: (z) =>
                                      h(M, {
                                        field: z.target.value,
                                      }),
                                    "aria-label": "Field",
                                    children: [
                                      e.jsx("option", {
                                        value: "",
                                        disabled: !0,
                                        children: "Select field…",
                                      }),
                                      u.map((z) =>
                                        e.jsx(
                                          "option",
                                          {
                                            value: z.id,
                                            children: z.label,
                                          },
                                          z.id,
                                        ),
                                      ),
                                    ],
                                  }),
                                  e.jsx("select", {
                                    value: P.operator,
                                    onChange: (z) =>
                                      h(M, {
                                        operator: z.target.value,
                                      }),
                                    "aria-label": "Operator",
                                    children: Yx.map((z) =>
                                      e.jsx(
                                        "option",
                                        {
                                          value: z.value,
                                          children: z.label,
                                        },
                                        z.value,
                                      ),
                                    ),
                                  }),
                                  V
                                    ? F
                                      ? e.jsxs("select", {
                                          value: P.value,
                                          onChange: (z) =>
                                            h(M, {
                                              value: z.target.value,
                                            }),
                                          "aria-label": "Value",
                                          children: [
                                            e.jsx("option", {
                                              value: "",
                                              disabled: !0,
                                              children: "Select value…",
                                            }),
                                            T.options.map((z, U) =>
                                              e.jsx(
                                                "option",
                                                {
                                                  value: z.value,
                                                  children: z.label,
                                                },
                                                U,
                                              ),
                                            ),
                                          ],
                                        })
                                      : e.jsx("input", {
                                          type: "text",
                                          value: P.value,
                                          onChange: (z) =>
                                            h(M, {
                                              value: z.target.value,
                                            }),
                                          placeholder: "Value",
                                          "aria-label": "Value",
                                        })
                                    : e.jsx("span", {
                                        className: "nls-fb-rule__novalue",
                                        children: "no value needed",
                                      }),
                                ],
                              }),
                              e.jsx("button", {
                                type: "button",
                                onClick: () => f(M),
                                className: "nls-icon-btn nls-icon-btn--sm nls-icon-btn--danger",
                                title: "Remove condition",
                                "aria-label": "Remove condition",
                                children: e.jsx(yt, {
                                  size: 15,
                                  "aria-hidden": "true",
                                }),
                              }),
                            ],
                          },
                          M,
                        );
                      }),
                    }),
                    e.jsxs("button", {
                      type: "button",
                      onClick: x,
                      className: "nls-btn nls-btn--dashed nls-btn--sm",
                      children: [
                        e.jsx(dt, {
                          size: 14,
                          "aria-hidden": "true",
                        }),
                        "Add condition",
                      ],
                    }),
                  ],
                }),
        }),
    ],
  });
}
const tf = [
    {
      value: "is",
      label: "is",
    },
    {
      value: "is_not",
      label: "is not",
    },
    {
      value: "contains",
      label: "contains",
    },
    {
      value: "starts_with",
      label: "starts with",
    },
    {
      value: "ends_with",
      label: "ends with",
    },
    {
      value: "greater_than",
      label: "greater than",
    },
    {
      value: "less_than",
      label: "less than",
    },
    {
      value: "is_empty",
      label: "is empty",
    },
    {
      value: "is_not_empty",
      label: "is not empty",
    },
  ],
  sf = new Set(["is_empty", "is_not_empty"]),
  Ri = {
    field: "",
    operator: "is",
    value: "",
  };
function nf(a) {
  const o = [];
  return (
    ((a == null ? void 0 : a.steps) || []).forEach((i) => {
      Ld((i == null ? void 0 : i.fields) || []).forEach((d) => o.push(d));
    }),
    o
  );
}
function ConditionRulesEditor({ cond: a, fields: o, onChange: i }) {
  const d = {
      enabled: !!(a != null && a.enabled),
      match: (a == null ? void 0 : a.match) === "any" ? "any" : "all",
      rules: Array.isArray(a == null ? void 0 : a.rules) ? a.rules : [],
    },
    u = (f) =>
      i({
        ...d,
        ...f,
      }),
    p = (f, S) =>
      u({
        rules: d.rules.map((y, P) =>
          P === f
            ? {
                ...y,
                ...S,
              }
            : y,
        ),
      }),
    h = () => {
      var f;
      return u({
        enabled: !0,
        rules: [
          ...d.rules,
          {
            ...Ri,
            field: ((f = o[0]) == null ? void 0 : f.id) || "",
          },
        ],
      });
    },
    x = (f) => {
      const S = d.rules.filter((y, P) => P !== f);
      u({
        rules: S,
        enabled: S.length > 0,
      });
    };
  return o.length === 0
    ? e.jsx("p", {
        className: "nls-empty-inline nls-fb-cl__empty",
        children: "Add fields to the form to build conditions.",
      })
    : e.jsxs("div", {
        className: "nls-stack nls-stack--tight nls-fb-rules",
        children: [
          e.jsxs("div", {
            className: "nls-row nls-fb-cl__sentence nls-text-sm",
            children: [
              e.jsx("span", {
                children: "Use this when",
              }),
              e.jsxs("select", {
                value: d.match,
                onChange: (f) =>
                  u({
                    match: f.target.value,
                  }),
                className: "nls-fb-sel-auto",
                "aria-label": "Match",
                children: [
                  e.jsx("option", {
                    value: "all",
                    children: "all",
                  }),
                  e.jsx("option", {
                    value: "any",
                    children: "any",
                  }),
                ],
              }),
              e.jsx("span", {
                children: "of these match:",
              }),
            ],
          }),
          d.rules.map((f, S) => {
            const y = o.find((T) => T.id === f.field),
              P = y && y.options && y.options.length > 0,
              M = !sf.has(f.operator);
            return e.jsxs(
              "div",
              {
                className: "nls-fb-rule",
                children: [
                  e.jsxs("div", {
                    className: "nls-row nls-fb-rule__fields",
                    children: [
                      e.jsxs("select", {
                        value: f.field,
                        onChange: (T) =>
                          p(S, {
                            field: T.target.value,
                          }),
                        "aria-label": "Field",
                        children: [
                          e.jsx("option", {
                            value: "",
                            disabled: !0,
                            children: "Select field…",
                          }),
                          o.map((T) =>
                            e.jsx(
                              "option",
                              {
                                value: T.id,
                                children: T.label,
                              },
                              T.id,
                            ),
                          ),
                        ],
                      }),
                      e.jsx("select", {
                        value: f.operator,
                        onChange: (T) =>
                          p(S, {
                            operator: T.target.value,
                          }),
                        "aria-label": "Operator",
                        children: tf.map((T) =>
                          e.jsx(
                            "option",
                            {
                              value: T.value,
                              children: T.label,
                            },
                            T.value,
                          ),
                        ),
                      }),
                      M
                        ? P
                          ? e.jsxs("select", {
                              value: f.value,
                              onChange: (T) =>
                                p(S, {
                                  value: T.target.value,
                                }),
                              "aria-label": "Value",
                              children: [
                                e.jsx("option", {
                                  value: "",
                                  disabled: !0,
                                  children: "Select value…",
                                }),
                                y.options.map((T, F) =>
                                  e.jsx(
                                    "option",
                                    {
                                      value: T.value,
                                      children: T.label,
                                    },
                                    F,
                                  ),
                                ),
                              ],
                            })
                          : e.jsx("input", {
                              type: "text",
                              value: f.value,
                              onChange: (T) =>
                                p(S, {
                                  value: T.target.value,
                                }),
                              placeholder: "Value",
                              "aria-label": "Value",
                            })
                        : e.jsx("span", {
                            className: "nls-fb-rule__novalue",
                            children: "no value",
                          }),
                    ],
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => x(S),
                    className: "nls-icon-btn nls-icon-btn--sm nls-icon-btn--danger",
                    title: "Remove condition",
                    "aria-label": "Remove condition",
                    children: e.jsx(yt, {
                      size: 14,
                      "aria-hidden": "true",
                    }),
                  }),
                ],
              },
              S,
            );
          }),
          e.jsxs("button", {
            type: "button",
            onClick: h,
            className: "nls-btn nls-btn--dashed nls-btn--sm",
            children: [
              e.jsx(dt, {
                size: 14,
                "aria-hidden": "true",
              }),
              "Add condition",
            ],
          }),
        ],
      });
}
const nlsSuccessMsgShort = "Thanks! We\'ve received your submission and will get back to you shortly.";
function FormBehaviorSettings({ form: a, onUpdate: o }) {
  const i = nf(a),
    d = Array.isArray(a == null ? void 0 : a.confirmations) ? a.confirmations : [],
    u = Array.isArray(a == null ? void 0 : a.emailRoutes) ? a.emailRoutes : [],
    p = (F) =>
      o({
        confirmations: F,
      }),
    h = (F, V) =>
      p(
        d.map((z) =>
          z.id === F
            ? {
                ...z,
                ...V,
              }
            : z,
        ),
      ),
    x = (F) => p(d.filter((V) => V.id !== F)),
    f = () => {
      var F;
      return p([
        ...d,
        {
          id: `confirm-${Date.now().toString(36)}`,
          name: `Confirmation ${d.length + 1}`,
          isDefault: !1,
          type: "message",
          message: "",
          redirectUrl: "",
          conditional: {
            enabled: !0,
            match: "all",
            rules: [
              {
                ...Ri,
                field: ((F = i[0]) == null ? void 0 : F.id) || "",
              },
            ],
          },
        },
      ]);
    },
    S = (F, V) => {
      const z = d.findIndex((N) => N.id === F),
        U = z + V;
      if (z < 0 || U < 0 || U >= d.length || d[z].isDefault || d[U].isDefault) return;
      const w = d.slice();
      (([w[z], w[U]] = [w[U], w[z]]), p(w));
    },
    y = (F) =>
      o({
        emailRoutes: F,
      }),
    P = (F, V) =>
      y(
        u.map((z) =>
          z.id === F
            ? {
                ...z,
                ...V,
              }
            : z,
        ),
      ),
    M = (F) => y(u.filter((V) => V.id !== F)),
    T = () => {
      var F;
      return y([
        ...u,
        {
          id: `route-${Date.now().toString(36)}`,
          recipient: "",
          conditional: {
            enabled: !0,
            match: "all",
            rules: [
              {
                ...Ri,
                field: ((F = i[0]) == null ? void 0 : F.id) || "",
              },
            ],
          },
        },
      ]);
    };
  return e.jsxs("div", {
    className: "nls-stack nls-fb-behavior",
    children: [
      e.jsxs("section", {
        className: "nls-section",
        children: [
          e.jsxs("div", {
            className: "nls-section__head",
            children: [
              e.jsx("span", {
                className: "nls-section__ico",
                "aria-hidden": "true",
                children: e.jsx(Xn, {
                  size: 16,
                }),
              }),
              e.jsx("div", {
                children: e.jsx("p", {
                  className: "nls-section__title",
                  children: "Submission Behavior",
                }),
              }),
            ],
          }),
          e.jsxs("div", {
            className: "nls-field nexulesuite_fui-method",
            children: [
              e.jsx("p", {
                className: "nls-field__label",
                children: "Method",
              }),
              e.jsxs("div", {
                className: "nls-seg nls-fb-seg-wrap",
                role: "group",
                "aria-label": "Submission method",
                children: [
                  e.jsx("button", {
                    type: "button",
                    className: "nls-seg__btn" + (a.submissionMethod !== "reload" ? " is-active" : ""),
                    "aria-pressed": a.submissionMethod !== "reload",
                    onClick: () =>
                      o({
                        submissionMethod: "ajax",
                      }),
                    children: "Ajax",
                  }),
                  e.jsx("button", {
                    type: "button",
                    className: "nls-seg__btn" + (a.submissionMethod === "reload" ? " is-active" : ""),
                    "aria-pressed": a.submissionMethod === "reload",
                    onClick: () =>
                      o({
                        submissionMethod: "reload",
                      }),
                    children: "Page Reload",
                  }),
                ],
              }),
              e.jsx("p", {
                className: "nls-field__hint",
                children: "Ajax submits without reloading the page (recommended).",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "nls-field",
            children: [
              e.jsx("p", {
                className: "nls-field__label",
                children: "After submission",
              }),
              e.jsx("p", {
                className: "nls-field__hint",
                children:
                  "After a submit, the first confirmation whose conditions match (top to bottom) is used. If none match, the default is shown.",
              }),
            ],
          }),
          e.jsx("div", {
            className: "nls-stack nls-stack--tight",
            children: d.map((F) =>
              e.jsxs(
                "div",
                {
                  className: "nls-fb-rule-card",
                  children: [
                    e.jsxs("div", {
                      className: "nls-fb-rule-card__head",
                      children: [
                        F.isDefault
                          ? e.jsx("span", {
                              className: "nls-badge nls-badge--primary",
                              children: "Default",
                            })
                          : e.jsxs("span", {
                              className: "nls-fb-reorder",
                              children: [
                                e.jsx("button", {
                                  type: "button",
                                  onClick: () => S(F.id, -1),
                                  className: "nls-icon-btn nls-icon-btn--sm nls-fb-reorder__btn",
                                  title: "Move up",
                                  "aria-label": "Move up",
                                  children: "▲",
                                }),
                                e.jsx("button", {
                                  type: "button",
                                  onClick: () => S(F.id, 1),
                                  className: "nls-icon-btn nls-icon-btn--sm nls-fb-reorder__btn",
                                  title: "Move down",
                                  "aria-label": "Move down",
                                  children: "▼",
                                }),
                              ],
                            }),
                        e.jsx("input", {
                          type: "text",
                          value: F.name,
                          onChange: (V) =>
                            h(F.id, {
                              name: V.target.value,
                            }),
                          className: "nls-fb-rule-card__name",
                          "aria-label": "Confirmation name",
                        }),
                        e.jsxs("select", {
                          value: F.type,
                          onChange: (V) =>
                            h(F.id, {
                              type: V.target.value,
                            }),
                          className: "nls-fb-sel-auto",
                          "aria-label": "Confirmation type",
                          children: [
                            e.jsx("option", {
                              value: "message",
                              children: "Message",
                            }),
                            e.jsx("option", {
                              value: "redirect",
                              children: "Redirect",
                            }),
                          ],
                        }),
                        !F.isDefault &&
                          e.jsx("button", {
                            type: "button",
                            onClick: () => x(F.id),
                            className: "nls-icon-btn nls-icon-btn--sm nls-icon-btn--danger",
                            title: "Delete confirmation",
                            "aria-label": "Delete confirmation",
                            children: e.jsx(yt, {
                              size: 15,
                              "aria-hidden": "true",
                            }),
                          }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "nls-fb-rule-card__body nls-stack nls-stack--tight",
                      children: [
                        F.type === "redirect"
                          ? e.jsxs("label", {
                              className: "nls-field",
                              children: [
                                e.jsx("span", {
                                  className: "nls-field__label",
                                  children: "Redirect URL",
                                }),
                                e.jsx("input", {
                                  type: "url",
                                  value: F.redirectUrl,
                                  onChange: (V) =>
                                    h(F.id, {
                                      redirectUrl: V.target.value,
                                    }),
                                  placeholder: "https://example.com/thank-you",
                                }),
                                e.jsx("span", {
                                  className: "nls-field__hint",
                                  children:
                                    "Visitor is sent here after submit — a page URL on your site or any external URL.",
                                }),
                              ],
                            })
                          : e.jsxs("div", {
                              className: "nls-field",
                              children: [
                                e.jsx("span", {
                                  className: "nls-field__label",
                                  children: "Success message",
                                }),
                                (function () {
                                  const msg = (F.message || "").trim(),
                                    isShort = msg === nlsSuccessMsgShort,
                                    isDefault = !msg || msg === nlsSuccessMsgDefault;
                                  return e.jsxs("div", {
                                    className: "nls-fb-presets",
                                    role: "radiogroup",
                                    "aria-label": "Success message",
                                    children: [
                                      e.jsxs("label", {
                                        className: "nls-fb-preset" + (isDefault ? " is-active" : ""),
                                        children: [
                                          e.jsx("input", {
                                            type: "radio",
                                            name: "nls-success-msg-" + F.id,
                                            checked: !!isDefault,
                                            onChange: () =>
                                              h(F.id, {
                                                message: nlsSuccessMsgDefault,
                                              }),
                                          }),
                                          e.jsx("span", {
                                            children: nlsSuccessMsgDefault,
                                          }),
                                        ],
                                      }),
                                      e.jsxs("label", {
                                        className: "nls-fb-preset" + (isShort ? " is-active" : ""),
                                        children: [
                                          e.jsx("input", {
                                            type: "radio",
                                            name: "nls-success-msg-" + F.id,
                                            checked: !!isShort,
                                            onChange: () =>
                                              h(F.id, {
                                                message: nlsSuccessMsgShort,
                                              }),
                                          }),
                                          e.jsx("span", {
                                            children: nlsSuccessMsgShort,
                                          }),
                                        ],
                                      }),
                                    ],
                                  });
                                })(),
                                e.jsx("textarea", {
                                  value: F.message || nlsSuccessMsgDefault,
                                  onChange: (V) =>
                                    h(F.id, {
                                      message: V.target.value,
                                    }),
                                  rows: 5,
                                  placeholder: nlsSuccessMsgDefault,
                                  "aria-label": "Success message text",
                                }),
                                e.jsx("span", {
                                  className: "nls-field__hint",
                                  children: "Select a preset or edit the message. Shown after submit.",
                                }),
                              ],
                            }),
                        !F.isDefault &&
                          e.jsx("div", {
                            className: "nls-fb-rule-card__cond",
                            children: e.jsx(ConditionRulesEditor, {
                              cond: F.conditional,
                              fields: i,
                              onChange: (V) =>
                                h(F.id, {
                                  conditional: V,
                                }),
                            }),
                          }),
                      ],
                    }),
                  ],
                },
                F.id,
              ),
            ),
          }),
          e.jsxs("button", {
            type: "button",
            onClick: f,
            className: "nls-btn nls-btn--dashed nls-btn--sm nls-fb-self-start",
            children: [
              e.jsx(dt, {
                size: 14,
                "aria-hidden": "true",
              }),
              "+ ADD BEHAVIOR",
            ],
          }),
        ],
      }),
      e.jsxs("section", {
        className: "nls-section",
        children: [
          e.jsxs("div", {
            className: "nls-section__head",
            children: [
              e.jsx("span", {
                className: "nls-section__ico nls-section__ico--warning",
                "aria-hidden": "true",
                children: e.jsx(qt, {
                  size: 16,
                }),
              }),
              e.jsxs("div", {
                children: [
                  e.jsx("p", {
                    className: "nls-section__title",
                    children: "Conditional email routing",
                  }),
                  e.jsx("p", {
                    className: "nls-section__desc",
                    children:
                      "Also send the submission notification to extra recipient(s) when conditions match — on top of the base notification email.",
                  }),
                ],
              }),
            ],
          }),
          e.jsx("div", {
            className: "nls-stack nls-stack--tight",
            children: u.map((F) =>
              e.jsxs(
                "div",
                {
                  className: "nls-fb-rule-card",
                  children: [
                    e.jsxs("div", {
                      className: "nls-fb-rule-card__head",
                      children: [
                        e.jsx("input", {
                          type: "text",
                          value: F.recipient,
                          onChange: (V) =>
                            P(F.id, {
                              recipient: V.target.value,
                            }),
                          placeholder: "sales@example.com, other@example.com",
                          className: "nls-fb-rule-card__name",
                          "aria-label": "Recipients",
                        }),
                        e.jsx("button", {
                          type: "button",
                          onClick: () => M(F.id),
                          className: "nls-icon-btn nls-icon-btn--sm nls-icon-btn--danger",
                          title: "Delete route",
                          "aria-label": "Delete route",
                          children: e.jsx(yt, {
                            size: 15,
                            "aria-hidden": "true",
                          }),
                        }),
                      ],
                    }),
                    e.jsx("div", {
                      className: "nls-fb-rule-card__body",
                      children: e.jsx(ConditionRulesEditor, {
                        cond: F.conditional,
                        fields: i,
                        onChange: (V) =>
                          P(F.id, {
                            conditional: V,
                          }),
                      }),
                    }),
                  ],
                },
                F.id,
              ),
            ),
          }),
          e.jsxs("button", {
            type: "button",
            onClick: T,
            className: "nls-btn nls-btn--dashed nls-btn--sm nls-fb-self-start",
            children: [
              e.jsx(dt, {
                size: 14,
                "aria-hidden": "true",
              }),
              "+ ADD EMAIL NOTIFICATION",
            ],
          }),
        ],
      }),
    ],
  });
}
function nlsDesignPatch(a, o) {
  const i = {
    ...(a || DEFAULT_FORM_STYLING),
    ...(o || {}),
  };
  if (o && o.primaryColor != null) {
    i.buttonColor = o.primaryColor;
    if (o.focusBorderColor == null) i.focusBorderColor = o.primaryColor;
  }
  if (o && o.inputColor != null) i.fieldTextColor = o.inputColor;
  if (o && o.inputFontSize != null) {
    i.fieldFontSize = o.inputFontSize;
  }
  if (o && o.fieldFontSize != null && o.inputFontSize == null) i.inputFontSize = o.fieldFontSize;
  if (o && o.inputFontWeight != null) i.fieldFontWeight = o.inputFontWeight;
  if (o && o.fieldFontWeight != null && o.inputFontWeight == null) i.inputFontWeight = o.fieldFontWeight;
  if (o && o.rowGap != null) i.fieldGap = o.rowGap;
  if (o && o.fieldGap != null && o.rowGap == null) i.rowGap = o.fieldGap;
  if (o && o.fieldTextColor != null && o.inputColor == null) i.inputColor = o.fieldTextColor;
  return i;
}
function nlsDevKey(a, o) {
  return o === "tablet" ? a + "Tablet" : o === "mobile" ? a + "Mobile" : a;
}
function nlsDevNum(a, o, i, d) {
  const u = nlsDevKey(o, i);
  if (i !== "desktop" && a[u] != null && a[u] !== "") {
    const p = parseInt(a[u], 10);
    if (!isNaN(p)) return Math.max(0, p);
  }
  if (a[o] != null && a[o] !== "") {
    const v = parseInt(a[o], 10);
    if (!isNaN(v)) return Math.max(0, v);
  }
  return Math.max(0, d);
}
function nlsCommitDesign(a, o, i, d) {
  const u = nlsDesignPatch(i, d);
  a(o.id, {
    styling: u,
    steps: nlsApplyGlobalToAllFields(o.steps, u),
  });
}
function nlsApplyStylingToForm(a, o) {
  const i = nlsDesignPatch(a.styling || DEFAULT_FORM_STYLING, o || {});
  return Object.assign({}, a, {
    styling: i,
    steps: nlsApplyGlobalToAllFields(a.steps, i),
  });
}
async function nlsSaveGlobalAppearance(a) {
  const o = await restFetch("/nexulesuite_/v1/forms/global-appearance", {
    method: "POST",
    body: JSON.stringify({
      styling: a || {},
    }),
  });
  var i = (o || {}).data || o || {};
  if (window.nexulesuite_Admin) {
    window.nexulesuite_Admin.globalAppearance = {
      styling: i.styling || a || {},
      updatedAt: i.updatedAt || "",
    };
  }
  return i;
}
async function nlsFetchGlobalAppearance() {
  const o = await restFetch("/nexulesuite_/v1/forms/global-appearance");
  var i = (o || {}).data || o || {};
  return i.styling && typeof i.styling === "object" ? i.styling : null;
}
function nlsApplyTypoToAllModules(a, o) {
  const i = o || {};
  const d = i.fontFamily || a.labelFontFamily || "inherit";
  const u = Math.max(10, parseInt(i.fontSize != null ? i.fontSize : a.labelFontSize, 10) || 13);
  const p = String(i.fontWeight || a.labelFontWeight || "600");
  const h = String(i.lineHeight || a.labelLineHeight || "1.4");
  const f = i.color || a.labelColor || "#334155";
  const m = Math.max(10, u - 2);
  return nlsDesignPatch(a, {
    labelFontFamily: d,
    placeholderFontFamily: d,
    inputFontFamily: d,
    descFontFamily: d,
    errorFontFamily: d,
    successFontFamily: d,
    labelFontSize: u,
    placeholderFontSize: u,
    inputFontSize: u,
    fieldFontSize: u,
    descFontSize: m,
    errorFontSize: m,
    successFontSize: u,
    labelFontWeight: p,
    placeholderFontWeight: p,
    inputFontWeight: p,
    fieldFontWeight: p,
    descFontWeight: p,
    errorFontWeight: p,
    successFontWeight: p,
    labelLineHeight: h,
    placeholderLineHeight: h,
    inputLineHeight: h,
    descLineHeight: h,
    errorLineHeight: h,
    successLineHeight: h,
    labelColor: f,
    inputColor: f,
    fieldTextColor: f,
  });
}
function nlsFieldStyleFromGlobal(a) {
  const o = a || DEFAULT_FORM_STYLING;
  const i = o.inputColor || o.fieldTextColor || "#000000";
  const d = o.inputFontSize != null ? o.inputFontSize : o.fieldFontSize;
  const u = o.inputFontWeight || o.fieldFontWeight || "500";
  return {
    backgroundColor: o.fieldBackgroundColor || "#ffffff",
    textColor: i,
    borderColor: o.fieldBorderColor || "#cbd5e1",
    borderRadius: (() => {
      const _r = parseInt(o.fieldBorderRadius, 10);
      return !isNaN(_r) && _r >= 0 ? _r : 6;
    })(),
    borderWidth: (() => {
      const _w = parseInt(o.fieldBorderWidth, 10);
      return !isNaN(_w) && _w >= 0 ? _w : 1;
    })(),
    padding: (() => {
      const _p = parseInt(o.fieldPadding, 10);
      return !isNaN(_p) && _p >= 0 ? _p : 12;
    })(),
    fontSize: Math.max(10, parseInt(d, 10) || 14),
    fontWeight: String(u),
  };
}
function nlsApplyGlobalToAllFields(a, o) {
  const i = nlsFieldStyleFromGlobal(o);
  return nlsWalkFormFields(a, (d) => ({
    ...d,
    settings: {
      ...(d.settings || {}),
      ...i,
    },
  }));
}
function nlsTemplateFields({ fields: a }) {
  return a != null && a.length
    ? e.jsx("div", {
        className: "nls-fb-tpl__fields",
        children: a.map((o, i) => {
          const d = Zn(o.moduleId);
          return e.jsx(
            "span",
            {
              className: "nls-badge nls-badge--muted",
              children: (d && d.name) || o.moduleId,
            },
            i,
          );
        }),
      })
    : e.jsxs("div", {
        className: "nls-fb-tpl__empty",
        children: [
          e.jsx("span", {
            className: "nls-fb-tpl__empty-ico",
            "aria-hidden": "true",
            children: e.jsx(dt, {
              size: 18,
            }),
          }),
          e.jsx("span", {
            className: "nls-fb-tpl__empty-title",
            children: "Start from scratch",
          }),
          e.jsx("span", {
            className: "nls-fb-tpl__empty-sub",
            children: "Add your own fields",
          }),
        ],
      });
}
function TemplateCard({ icon: a, name: o, tagline: i, fields: d, onClick: u, onPreview: p }) {
  return e.jsxs("div", {
    className: "nls-card nls-fb-tpl",
    children: [
      e.jsxs("button", {
        type: "button",
        onClick: u,
        className: "nls-fb-tpl__main",
        children: [
          e.jsxs("span", {
            className: "nls-fb-tpl__head",
            children: [
              e.jsx("span", {
                className: "nls-fb-tpl__ico",
                "aria-hidden": "true",
                children: a.node,
              }),
              e.jsxs("span", {
                className: "min-w-0",
                children: [
                  e.jsx("span", {
                    className: "nls-fb-tpl__name truncate",
                    children: o,
                  }),
                  e.jsx("span", {
                    className: "nls-fb-tpl__tagline truncate",
                    children: i,
                  }),
                ],
              }),
            ],
          }),
          e.jsx(nlsTemplateFields, {
            fields: d,
          }),
        ],
      }),
      p
        ? e.jsxs("div", {
            className: "nls-fb-tpl__foot",
            children: [
              e.jsx("span", {
                className: "nls-fb-tpl__hint",
                children: "Click card to use",
              }),
              e.jsxs("button", {
                type: "button",
                onClick: p,
                className: "nls-btn nls-btn--ghost nls-btn--sm",
                children: [
                  e.jsx(Rt, {
                    size: 14,
                    "aria-hidden": "true",
                  }),
                  "Preview",
                ],
              }),
            ],
          })
        : null,
    ],
  });
}
function AddFormModal({ open: a, onClose: o, onSelect: i, onPreview: d }) {
  const nlsTitleId = b.useId();
  if (!a) return null;
  const u = cf;
  return e.jsxs(ModalShell, {
    open: a,
    onClose: o,
    labelledBy: nlsTitleId,
    size: "lg",
    className: "nls-fb-add-modal",
    children: [
      e.jsxs("div", {
        className: "nls-modal__header",
        children: [
          e.jsxs("div", {
            className: "min-w-0",
            children: [
              e.jsx("h2", {
                id: nlsTitleId,
                className: "nls-modal__title",
                children: "Add a Form",
              }),
              e.jsx("p", {
                className: "nls-modal__desc",
                children: "Start from a ready-made template or build one from scratch.",
              }),
            ],
          }),
          e.jsx("button", {
            type: "button",
            onClick: o,
            className: "nls-icon-btn",
            "aria-label": "Close",
            children: e.jsx(_t, {
              size: 18,
              "aria-hidden": "true",
            }),
          }),
        ],
      }),
      e.jsxs("div", {
        className: "nls-modal__body nls-fb-templates",
        children: [
          e.jsx(TemplateCard, {
            icon: {
              node: e.jsx(u, {
                size: 20,
              }),
              accent: Ui.slate,
            },
            name: "Blank Simple Form",
            tagline: "Start from scratch",
            fields: [],
            onClick: () => i(null),
          }),
          FORM_TEMPLATES_PAGE.map((p) => {
            const h = p.Icon;
            return e.jsx(
              TemplateCard,
              {
                icon: {
                  node: e.jsx(h, {
                    size: 20,
                  }),
                  accent: Ui[p.accent] || Ui.violet,
                },
                name: p.name,
                tagline: p.tagline,
                fields: p.fields.map(([x]) => ({
                  moduleId: x,
                })),
                onClick: () => i(p),
                onPreview: () => (d == null ? void 0 : d(p)),
              },
              p.id,
            );
          }),
        ],
      }),
    ],
  });
}
function copyShortcode(a, o) {
  const i = `[nexulesuite_form id="${a}"]`,
    d = () => {
      (o(a), window.setTimeout(() => o(null), 2e3));
    },
    u = () => {
      let h = null;
      try {
        return (
          (h = document.createElement("textarea")),
          (h.value = i),
          h.setAttribute("readonly", ""),
          (h.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0"),
          document.body.appendChild(h),
          h.focus(),
          h.select(),
          document.execCommand("copy")
        );
      } catch {
        return !1;
      } finally {
        h != null && h.parentNode && h.parentNode.removeChild(h);
      }
    },
    p = navigator == null ? void 0 : navigator.clipboard;
  p && typeof p.writeText == "function"
    ? p
        .writeText(i)
        .then(d)
        .catch(() => {
          u() && d();
        })
    : u() && d();
}
function FormColorField({ label: a, value: o, onChange: i }) {
  const d = o || "#ffffff";
  return e.jsxs("div", {
    className: "nls-field nexulesuite_fb-color-field",
    children: [
      e.jsx("span", {
        className: "nls-field__label",
        children: a,
      }),
      e.jsxs("div", {
        className: "cgroup",
        children: [
          e.jsx("span", {
            className: "cswatch",
            style: {
              background: d,
            },
            children: e.jsx("input", {
              type: "color",
              value: d,
              onChange: (u) => i(u.target.value),
              "aria-label": a,
            }),
          }),
          e.jsx("input", {
            type: "text",
            className: "chex",
            value: d,
            onChange: (u) => {
              let p = u.target.value.trim();
              (p && !p.startsWith("#") && (p = `#${p}`), i(p));
            },
            "aria-label": a + " hex value",
          }),
        ],
      }),
    ],
  });
}
function nlsStripFormUi(a) {
  if (!a || typeof a !== "object") return {};
  const { onSelectionChange: o, ...i } = a;
  return i;
}
function nlsExportFormConfig(a) {
  const i = nlsStripFormUi(a),
    d = {
      nexulesuite_form_export: 1,
      schema: "nexulesuite-form/1",
      exported_at: new Date().toISOString(),
      form: i,
    },
    u = new Blob([JSON.stringify(d, null, 2)], {
      type: "application/json",
    }),
    p = URL.createObjectURL(u),
    h = document.createElement("a"),
    x =
      String(i.name || i.id || "form")
        .replace(/[^\w\-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "form";
  ((h.href = p),
    (h.download = x + "-export.json"),
    document.body.appendChild(h),
    h.click(),
    h.remove(),
    URL.revokeObjectURL(p));
}
function nlsPickFormImport(a) {
  const o = document.createElement("input");
  ((o.type = "file"),
    (o.accept = "application/json,.json"),
    (o.style.display = "none"),
    o.addEventListener("change", async () => {
      var i;
      const d = (i = o.files) == null ? void 0 : i[0];
      if ((o.remove(), !d)) return;
      try {
        const u = JSON.parse(await d.text());
        let p = null;
        if (u && typeof u == "object" && !Array.isArray(u)) {
          if (u.form && typeof u.form == "object" && !Array.isArray(u.form)) p = u.form;
          else if (!u.nexulesuite_form_export && !u.schema && (u.steps || u.fields || u.name)) p = u;
        }
        if (!p) {
          window.alert("Invalid form export file.");
          return;
        }
        a(p);
      } catch {
        window.alert("Could not read the form export file.");
      }
    }),
    document.body.appendChild(o),
    o.click());
}
function FormCard({
  form: a,
  expanded: o,
  activeTab: i,
  onToggle: d,
  onDelete: u,
  onDuplicate: p,
  onUpdate: h,
  onTabChange: x,
  copiedId: f,
  onCopiedIdChange: S,
  onPreview: y,
  onPublishPersist: P,
  onImportForm: nlsOnImport,
  onApplyToAllForms: nlsOnApplyAll,
}) {
  var F, V, z, U;
  const M = a.styling || DEFAULT_FORM_STYLING;
  const [nlsSelField, nlsSetSelField] = b.useState("");
  const [nlsDevice, nlsSetDevice] = b.useState("desktop");
  const [nlsFuiView, nlsSetFuiView] = b.useState("menu");
  const [nlsNavOpen, nlsSetNavOpen] = b.useState("fields");
  const [nlsAccOpen, nlsSetAccOpen] = b.useState("");
  const [nlsColorSub, nlsSetColorSub] = b.useState("");
  const [nlsColorOn, nlsSetColorOn] = b.useState(!0);
  const [nlsNotifyAcc, nlsSetNotifyAcc] = b.useState("");
  const [nlsSettingsAcc, nlsSetSettingsAcc] = b.useState("");
  const [nlsGlobalBusy, nlsSetGlobalBusy] = b.useState(!1);
  const [nlsGlobalMsg, nlsSetGlobalMsg] = b.useState("");
  return a.formType !== "multi"
    ? e.jsxs("li", {
        className: `nls-card nls-fb-card${o ? " is-expanded" : ""}`,
        children: [
          e.jsxs("div", {
            className: "nls-fb-head",
            children: [
              e.jsxs("button", {
                type: "button",
                onClick: d,
                className: "nls-fb-head__main",
                "aria-expanded": !!o,
                children: [
                  e.jsx("span", {
                    className: "nls-fb-head__title",
                    children: a.name || "Untitled Form",
                  }),
                  e.jsx("span", {
                    className: "nls-badge nls-badge--primary",
                    children: "Simple",
                  }),
                  a.published === !1
                    ? e.jsx("span", {
                        className: "nls-badge nls-badge--muted",
                        children: "Hidden",
                      })
                    : null,
                ],
              }),
              e.jsxs("div", {
                className: "nls-fb-head__actions",
                onClick: (w) => w.stopPropagation(),
                children: [
                  e.jsx("button", {
                    type: "button",
                    onClick: () => (y == null ? void 0 : y(a.id)),
                    className: "nls-icon-btn",
                    title: "Preview",
                    "aria-label": "Preview",
                    children: e.jsx(Rt, {
                      size: 16,
                      "aria-hidden": "true",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => (P == null ? void 0 : P(a.id, a.published === !1)),
                    className: `nls-icon-btn${a.published === !1 ? " is-warn" : ""}`,
                    title: a.published === !1 ? "Show form on website" : "Hide form on website",
                    "aria-label": a.published === !1 ? "Show form on website" : "Hide form on website",
                    children:
                      a.published === !1
                        ? e.jsx(Rt, {
                            size: 16,
                            "aria-hidden": "true",
                          })
                        : e.jsx(za, {
                            size: 16,
                            "aria-hidden": "true",
                          }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => copyShortcode(a.id, S),
                    className: `nls-icon-btn${f === a.id ? " is-success" : ""}`,
                    title: "Copy shortcode",
                    "aria-label": "Copy shortcode",
                    children: e.jsx(Jc, {
                      size: 16,
                      "aria-hidden": "true",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => p(a.id),
                    className: "nls-icon-btn",
                    title: "Duplicate",
                    "aria-label": "Duplicate",
                    children: e.jsx($s, {
                      size: 16,
                      "aria-hidden": "true",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => u(a.id),
                    className: "nls-icon-btn nls-icon-btn--danger",
                    title: "Delete",
                    "aria-label": "Delete",
                    children: e.jsx(yt, {
                      size: 16,
                      "aria-hidden": "true",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => nlsExportFormConfig(a),
                    className: "nls-icon-btn",
                    title: "Export form",
                    "aria-label": "Export form",
                    children: e.jsx(Ol, {
                      size: 16,
                      "aria-hidden": "true",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () =>
                      nlsPickFormImport((w) =>
                        nlsOnImport
                          ? nlsOnImport(a.id, w)
                          : h(
                              a.id,
                              normalizeForm({
                                ...w,
                                id: a.id,
                              }),
                            ),
                      ),
                    className: "nls-icon-btn",
                    title: "Import form",
                    "aria-label": "Import form",
                    children: e.jsx(Vl, {
                      size: 16,
                      "aria-hidden": "true",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: d,
                    className: "nls-icon-btn nls-fb-chevron",
                    title: o ? "Collapse" : "Expand",
                    "aria-label": o ? "Collapse" : "Expand",
                    "aria-expanded": !!o,
                    children: e.jsx(Qs, {
                      size: 16,
                      className: o ? "is-open" : "",
                      "aria-hidden": "true",
                    }),
                  }),
                ],
              }),
            ],
          }),
          o &&
            e.jsxs("div", {
              className: "nexulesuite_fui-workspace",
              children: [
                e.jsxs("div", {
                  className: "nls-fb-name-row nls-grid-2",
                  children: [
                    e.jsxs("label", {
                      className: "nls-field",
                      children: [
                        e.jsx("span", {
                          className: "nls-field__label",
                          children: "Form Name",
                        }),
                        e.jsx("input", {
                          type: "text",
                          value: a.name,
                          onChange: (w) =>
                            h(a.id, {
                              name: w.target.value,
                            }),
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "nls-field",
                      children: [
                        e.jsx("span", {
                          className: "nls-field__label",
                          children: "Shortcode",
                        }),
                        e.jsxs("div", {
                          className: "nls-row nls-fb-shortcode",
                          children: [
                            e.jsxs("code", {
                              className: "nls-code",
                              children: ['[nexulesuite_form id="', a.id, '"]'],
                            }),
                            e.jsx("button", {
                              type: "button",
                              onClick: () => copyShortcode(a.id, S),
                              className: "nls-btn nls-btn--secondary nls-btn--sm",
                              "aria-live": "polite",
                              children: f === a.id ? "Copied!" : "Copy",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs("div", {
                  className: "nexulesuite_fui-canvas",
                  children: [
                    e.jsx("div", {
                      className: "nexulesuite_fui-canvas-card nls-card",
                      children: e.jsx(FormCanvas, {
                        form: a,
                        onPatchForm: (w) => h(a.id, w),
                        onSelectionChange: a.onSelectionChange,
                      }),
                    }),
                    e.jsx("div", {
                      className: "nexulesuite_fui-canvas-foot",
                      children: e.jsx("button", {
                        type: "button",
                        className: "nls-btn nls-btn--secondary",
                        onClick: () => {
                          nlsSetNavOpen("appearance");
                          nlsSetFuiView("appearance");
                          nlsSetAccOpen("");
                          nlsSetColorSub("");
                          x("customization");
                        },
                        children: "Appearance →",
                      }),
                    }),
                  ],
                }),
                e.jsxs("aside", {
                  className: "nexulesuite_fui-side",
                  children: [
                    e.jsx("p", {
                      className: "nls-eyebrow nexulesuite_fui-side__label",
                      children: "Customize form",
                    }),
                    e.jsxs("div", {
                      className: "nexulesuite_fui-acc nexulesuite_fui-nav-acc",
                      children: [
                        ["fields", "Form Fields"],
                        ["appearance", "Appearance"],
                        ["behavior", "Behavior"],
                        ["notify", "Notifications & Integrations"],
                        ["settings", "Settings"],
                      ].map(function (pair) {
                        var mk = pair[0],
                          lab = pair[1];
                        var open = nlsNavOpen === mk;
                        return e.jsxs(
                          "div",
                          {
                            className: "nexulesuite_fui-acc__item" + (open ? " is-open" : ""),
                            children: [
                              e.jsxs("button", {
                                type: "button",
                                className: "nexulesuite_fui-acc__head nexulesuite_fui-acc__trigger",
                                "aria-expanded": !!open,
                                "aria-controls": "nls-acc-panel-" + mk,
                                id: "nls-acc-trigger-" + mk,
                                onClick: function () {
                                  if (open) {
                                    nlsSetNavOpen("");
                                    return;
                                  }
                                  nlsSetNavOpen(mk);
                                  nlsSetAccOpen("");
                                  nlsSetColorSub("");
                                  nlsSetNotifyAcc("");
                                  nlsSetSettingsAcc("");
                                  if (mk === "fields") {
                                    nlsSetFuiView("menu");
                                    x("fields");
                                  } else if (mk === "appearance") {
                                    nlsSetFuiView("appearance");
                                    nlsSetAccOpen("colors");
                                    x("styling");
                                  } else if (mk === "behavior") {
                                    nlsSetFuiView("behavior");
                                    x("confirmations");
                                  } else if (mk === "notify") {
                                    nlsSetFuiView("notify");
                                    nlsSetNotifyAcc("email");
                                    x("advanced");
                                  } else {
                                    nlsSetFuiView("settings");
                                    nlsSetSettingsAcc("visibility");
                                    x("advanced");
                                  }
                                },
                                children: [
                                  e.jsx("span", {
                                    className: "nexulesuite_fui-acc__label",
                                    children: lab,
                                  }),
                                  e.jsx("span", {
                                    className: "nexulesuite_fui-acc__indicator",
                                    "aria-hidden": "true",
                                    children: nlsAccPlus(open),
                                  }),
                                ],
                              }),
                              open
                                ? e.jsx("div", {
                                    id: "nls-acc-panel-" + mk,
                                    role: "region",
                                    "aria-labelledby": "nls-acc-trigger-" + mk,
                                    className:
                                      "nexulesuite_fui-acc__body nexulesuite_fui-acc__content nexulesuite_fui-nav-acc__panel",
                                    children:
                                      mk === "appearance"
                                        ? e.jsxs("div", {
                                            className: "nexulesuite_fui-acc",
                                            children: [
                                              ["presets", "Global Appearance Presets"],
                                              ["style", "Style"],
                                              ["colors", "Colors"],
                                              ["fonts", "Fonts"],
                                              ["layout", "Layout and Spacing"],
                                            ].map(function (pair) {
                                              var k = pair[0];
                                              var lab = pair[1];
                                              var open = nlsAccOpen === k;
                                              return e.jsxs(
                                                "div",
                                                {
                                                  className: "nexulesuite_fui-acc__item" + (open ? " is-open" : ""),
                                                  children: [
                                                    e.jsxs("button", {
                                                      type: "button",
                                                      className: "nexulesuite_fui-acc__head",
                                                      onClick: function () {
                                                        nlsSetAccOpen(open ? "" : k);
                                                        nlsSetColorSub("");
                                                        if (k === "colors" || k === "style") x("styling");
                                                        else if (k === "css") x("advanced");
                                                        else x("customization");
                                                      },
                                                      children: [
                                                        e.jsxs("span", {
                                                          className: "nexulesuite_fui-acc__left",
                                                          children: [
                                                            nlsAccIcon(k),
                                                            e.jsx("span", {
                                                              className: "nexulesuite_fui-acc__label",
                                                              children: lab,
                                                            }),
                                                          ],
                                                        }),
                                                        nlsAccPlus(open),
                                                      ],
                                                    }),
                                                    open
                                                      ? e.jsx("div", {
                                                          className: "nexulesuite_fui-acc__body",
                                                          children:
                                                            k === "colors"
                                                              ? e.jsxs("div", {
                                                                  children: [
                                                                    e.jsxs("label", {
                                                                      className: "nexulesuite_fui-toggle",
                                                                      children: [
                                                                        e.jsx("input", {
                                                                          type: "checkbox",
                                                                          checked: nlsColorOn,
                                                                          onChange: function (H) {
                                                                            nlsSetColorOn(!!H.target.checked);
                                                                          },
                                                                        }),
                                                                        e.jsx("span", {
                                                                          className: "nexulesuite_fui-toggle__track",
                                                                        }),
                                                                        e.jsx("span", {
                                                                          className: "nexulesuite_fui-toggle__text",
                                                                          children: "Customize colors",
                                                                        }),
                                                                      ],
                                                                    }),
                                                                    e.jsxs("div", {
                                                                      className: "nexulesuite_fui-acc__toolbar",
                                                                      children: [
                                                                        e.jsx("span", {
                                                                          className:
                                                                            "nexulesuite_fui-acc__toolbar-label",
                                                                          children: "Element",
                                                                        }),
                                                                        e.jsx("button", {
                                                                          type: "button",
                                                                          className:
                                                                            "nls-btn nls-btn--ghost nls-btn--sm nexulesuite_fui-acc__clear",
                                                                          onClick: function () {
                                                                            nlsSetColorSub("");
                                                                          },
                                                                          children: "CLEAR CUSTOMIZATION",
                                                                        }),
                                                                      ],
                                                                    }),
                                                                    nlsColorOn
                                                                      ? e.jsx("div", {
                                                                          className: "nexulesuite_fui-acc__nest",
                                                                          children: [
                                                                            ["container", "Form Container"],
                                                                            ["indicator", "Submission Indicator"],
                                                                            ["success", "Response Success"],
                                                                            ["error", "Response Error"],
                                                                            ["fields", "Fields Basics"],
                                                                            ["input", "Input and Textarea"],
                                                                            ["button", "Submit Button"],
                                                                          ].map(function (sp) {
                                                                            var sk = sp[0];
                                                                            var sl = sp[1];
                                                                            var so = nlsColorSub === sk;
                                                                            return e.jsxs(
                                                                              "div",
                                                                              {
                                                                                className:
                                                                                  "nexulesuite_fui-acc__nest-item" +
                                                                                  (so ? " is-open" : ""),
                                                                                children: [
                                                                                  e.jsxs("button", {
                                                                                    type: "button",
                                                                                    className:
                                                                                      "nexulesuite_fui-acc__nest-head",
                                                                                    onClick: function () {
                                                                                      nlsSetColorSub(so ? "" : sk);
                                                                                    },
                                                                                    children: [
                                                                                      e.jsxs("span", {
                                                                                        className:
                                                                                          "nexulesuite_fui-acc__left",
                                                                                        children: [
                                                                                          nlsAccIcon(sk),
                                                                                          e.jsx("span", {
                                                                                            className:
                                                                                              "nexulesuite_fui-acc__label",
                                                                                            children: sl,
                                                                                          }),
                                                                                        ],
                                                                                      }),
                                                                                      nlsAccPlus(so),
                                                                                    ],
                                                                                  }),
                                                                                  so
                                                                                    ? e.jsx("div", {
                                                                                        className:
                                                                                          "nexulesuite_fui-acc__nest-body",
                                                                                        children:
                                                                                          sk === "container"
                                                                                            ? e.jsxs("div", {
                                                                                                className:
                                                                                                  "nls-fb-color-grid",
                                                                                                children: [
                                                                                                  e.jsx(
                                                                                                    FormColorField,
                                                                                                    {
                                                                                                      label:
                                                                                                        "Form background",
                                                                                                      value:
                                                                                                        M.backgroundColor ||
                                                                                                        "#ffffff",
                                                                                                      onChange:
                                                                                                        function (H) {
                                                                                                          h(a.id, {
                                                                                                            styling:
                                                                                                              Object.assign(
                                                                                                                {},
                                                                                                                M,
                                                                                                                {
                                                                                                                  backgroundColor:
                                                                                                                    H,
                                                                                                                },
                                                                                                              ),
                                                                                                          });
                                                                                                        },
                                                                                                    },
                                                                                                    "c-bg",
                                                                                                  ),
                                                                                                  e.jsx(
                                                                                                    FormColorField,
                                                                                                    {
                                                                                                      label:
                                                                                                        "Form text",
                                                                                                      value:
                                                                                                        M.textColor ||
                                                                                                        "#1e293b",
                                                                                                      onChange:
                                                                                                        function (H) {
                                                                                                          h(a.id, {
                                                                                                            styling:
                                                                                                              Object.assign(
                                                                                                                {},
                                                                                                                M,
                                                                                                                {
                                                                                                                  textColor:
                                                                                                                    H,
                                                                                                                },
                                                                                                              ),
                                                                                                          });
                                                                                                        },
                                                                                                    },
                                                                                                    "c-tx",
                                                                                                  ),
                                                                                                ],
                                                                                              })
                                                                                            : sk === "button"
                                                                                              ? e.jsxs(
                                                                                                  "div",
                                                                                                  {
                                                                                                    className:
                                                                                                      "nls-fb-color-grid",
                                                                                                    children: [
                                                                                                      e.jsxs("div", {
                                                                                                        className:
                                                                                                          "nls-field nls-fb-span-all",
                                                                                                        children: [
                                                                                                          e.jsx(
                                                                                                            "span",
                                                                                                            {
                                                                                                              className:
                                                                                                                "nls-field__label",
                                                                                                              children:
                                                                                                                "Button text",
                                                                                                            },
                                                                                                          ),
                                                                                                          e.jsx(
                                                                                                            "input",
                                                                                                            {
                                                                                                              type: "text",
                                                                                                              value:
                                                                                                                a.submitBtnText ||
                                                                                                                "",
                                                                                                              placeholder:
                                                                                                                "Submit",
                                                                                                              onChange:
                                                                                                                function (
                                                                                                                  w,
                                                                                                                ) {
                                                                                                                  h(
                                                                                                                    a.id,
                                                                                                                    {
                                                                                                                      submitBtnText:
                                                                                                                        w
                                                                                                                          .target
                                                                                                                          .value,
                                                                                                                    },
                                                                                                                  );
                                                                                                                },
                                                                                                            },
                                                                                                          ),
                                                                                                        ],
                                                                                                      }),
                                                                                                      e.jsx(
                                                                                                        FormColorField,
                                                                                                        {
                                                                                                          label:
                                                                                                            "Button color",
                                                                                                          value:
                                                                                                            M.primaryColor ||
                                                                                                            M.buttonColor ||
                                                                                                            "#7c3aed",
                                                                                                          onChange:
                                                                                                            function (
                                                                                                              H,
                                                                                                            ) {
                                                                                                              nlsCommitDesign(
                                                                                                                h,
                                                                                                                a,
                                                                                                                M,
                                                                                                                {
                                                                                                                  primaryColor:
                                                                                                                    H,
                                                                                                                  buttonColor:
                                                                                                                    H,
                                                                                                                },
                                                                                                              );
                                                                                                            },
                                                                                                        },
                                                                                                        "c-btn",
                                                                                                      ),
                                                                                                    ],
                                                                                                  },
                                                                                                  "c-btn-wrap",
                                                                                                )
                                                                                              : sk === "success"
                                                                                                ? e.jsx(
                                                                                                    FormColorField,
                                                                                                    {
                                                                                                      label: "Success",
                                                                                                      value:
                                                                                                        M.successColor ||
                                                                                                        "#16a34a",
                                                                                                      onChange:
                                                                                                        function (H) {
                                                                                                          nlsCommitDesign(
                                                                                                            h,
                                                                                                            a,
                                                                                                            M,
                                                                                                            {
                                                                                                              successColor:
                                                                                                                H,
                                                                                                            },
                                                                                                          );
                                                                                                        },
                                                                                                    },
                                                                                                    "c-ok",
                                                                                                  )
                                                                                                : sk === "error"
                                                                                                  ? e.jsxs("div", {
                                                                                                      className:
                                                                                                        "nls-fb-color-grid",
                                                                                                      children: [
                                                                                                        e.jsx(
                                                                                                          FormColorField,
                                                                                                          {
                                                                                                            label:
                                                                                                              "Error text",
                                                                                                            value:
                                                                                                              M.errorColor ||
                                                                                                              "#dc2626",
                                                                                                            onChange:
                                                                                                              function (
                                                                                                                H,
                                                                                                              ) {
                                                                                                                nlsCommitDesign(
                                                                                                                  h,
                                                                                                                  a,
                                                                                                                  M,
                                                                                                                  {
                                                                                                                    errorColor:
                                                                                                                      H,
                                                                                                                  },
                                                                                                                );
                                                                                                              },
                                                                                                          },
                                                                                                          "c-er",
                                                                                                        ),
                                                                                                        e.jsx(
                                                                                                          FormColorField,
                                                                                                          {
                                                                                                            label:
                                                                                                              "Error border",
                                                                                                            value:
                                                                                                              M.errorBorderColor ||
                                                                                                              "#dc2626",
                                                                                                            onChange:
                                                                                                              function (
                                                                                                                H,
                                                                                                              ) {
                                                                                                                nlsCommitDesign(
                                                                                                                  h,
                                                                                                                  a,
                                                                                                                  M,
                                                                                                                  {
                                                                                                                    errorBorderColor:
                                                                                                                      H,
                                                                                                                  },
                                                                                                                );
                                                                                                              },
                                                                                                          },
                                                                                                          "c-erb",
                                                                                                        ),
                                                                                                      ],
                                                                                                    })
                                                                                                  : sk === "indicator"
                                                                                                    ? e.jsx(
                                                                                                        FormColorField,
                                                                                                        {
                                                                                                          label:
                                                                                                            "Submission indicator",
                                                                                                          value:
                                                                                                            M.stepperColor ||
                                                                                                            M.primaryColor ||
                                                                                                            M.buttonColor ||
                                                                                                            "#7c3aed",
                                                                                                          onChange:
                                                                                                            function (
                                                                                                              H,
                                                                                                            ) {
                                                                                                              nlsCommitDesign(
                                                                                                                h,
                                                                                                                a,
                                                                                                                M,
                                                                                                                {
                                                                                                                  stepperColor:
                                                                                                                    H,
                                                                                                                },
                                                                                                              );
                                                                                                            },
                                                                                                        },
                                                                                                        "c-ind",
                                                                                                      )
                                                                                                    : sk === "fields" ||
                                                                                                        sk === "input"
                                                                                                      ? e.jsxs("div", {
                                                                                                          className:
                                                                                                            "nls-fb-color-grid",
                                                                                                          children: [
                                                                                                            e.jsx(
                                                                                                              FormColorField,
                                                                                                              {
                                                                                                                label:
                                                                                                                  "Input background",
                                                                                                                value:
                                                                                                                  M.fieldBackgroundColor ||
                                                                                                                  "#ffffff",
                                                                                                                onChange:
                                                                                                                  function (
                                                                                                                    H,
                                                                                                                  ) {
                                                                                                                    nlsCommitDesign(
                                                                                                                      h,
                                                                                                                      a,
                                                                                                                      M,
                                                                                                                      {
                                                                                                                        fieldBackgroundColor:
                                                                                                                          H,
                                                                                                                      },
                                                                                                                    );
                                                                                                                  },
                                                                                                              },
                                                                                                              "c-ib",
                                                                                                            ),
                                                                                                            e.jsx(
                                                                                                              FormColorField,
                                                                                                              {
                                                                                                                label:
                                                                                                                  "Input text",
                                                                                                                value:
                                                                                                                  M.inputColor ||
                                                                                                                  M.fieldTextColor ||
                                                                                                                  "#000000",
                                                                                                                onChange:
                                                                                                                  function (
                                                                                                                    H,
                                                                                                                  ) {
                                                                                                                    nlsCommitDesign(
                                                                                                                      h,
                                                                                                                      a,
                                                                                                                      M,
                                                                                                                      {
                                                                                                                        inputColor:
                                                                                                                          H,
                                                                                                                      },
                                                                                                                    );
                                                                                                                  },
                                                                                                              },
                                                                                                              "c-it",
                                                                                                            ),
                                                                                                            e.jsx(
                                                                                                              FormColorField,
                                                                                                              {
                                                                                                                label:
                                                                                                                  "Border",
                                                                                                                value:
                                                                                                                  M.fieldBorderColor ||
                                                                                                                  "#cbd5e1",
                                                                                                                onChange:
                                                                                                                  function (
                                                                                                                    H,
                                                                                                                  ) {
                                                                                                                    nlsCommitDesign(
                                                                                                                      h,
                                                                                                                      a,
                                                                                                                      M,
                                                                                                                      {
                                                                                                                        fieldBorderColor:
                                                                                                                          H,
                                                                                                                      },
                                                                                                                    );
                                                                                                                  },
                                                                                                              },
                                                                                                              "c-bd",
                                                                                                            ),
                                                                                                            e.jsx(
                                                                                                              FormColorField,
                                                                                                              {
                                                                                                                label:
                                                                                                                  "Focus",
                                                                                                                value:
                                                                                                                  M.focusBorderColor ||
                                                                                                                  "#7c3aed",
                                                                                                                onChange:
                                                                                                                  function (
                                                                                                                    H,
                                                                                                                  ) {
                                                                                                                    nlsCommitDesign(
                                                                                                                      h,
                                                                                                                      a,
                                                                                                                      M,
                                                                                                                      {
                                                                                                                        focusBorderColor:
                                                                                                                          H,
                                                                                                                      },
                                                                                                                    );
                                                                                                                  },
                                                                                                              },
                                                                                                              "c-fc",
                                                                                                            ),
                                                                                                          ],
                                                                                                        })
                                                                                                      : e.jsx("p", {
                                                                                                          className:
                                                                                                            "nexulesuite_fui-hint",
                                                                                                          children:
                                                                                                            "No color options for this element.",
                                                                                                        }),
                                                                                      })
                                                                                    : null,
                                                                                ],
                                                                              },
                                                                              sk,
                                                                            );
                                                                          }),
                                                                        })
                                                                      : e.jsx("p", {
                                                                          className: "nexulesuite_fui-hint",
                                                                          children:
                                                                            "Enable Customize colors to edit elements.",
                                                                        }),
                                                                  ],
                                                                })
                                                              : k === "presets"
                                                                ? e.jsxs("div", {
                                                                    className: "nexulesuite_fui-acc__stack",
                                                                    children: [
                                                                      e.jsxs("label", {
                                                                        className: "nls-field",
                                                                        children: [
                                                                          e.jsx("span", {
                                                                            className: "nls-field__label",
                                                                            children: "Design",
                                                                          }),
                                                                          e.jsxs("select", {
                                                                            value: M.forminatorDesign || "default",
                                                                            onChange: function (H) {
                                                                              nlsCommitDesign(h, a, M, {
                                                                                forminatorDesign: H.target.value,
                                                                              });
                                                                            },
                                                                            children: [
                                                                              e.jsx("option", {
                                                                                value: "default",
                                                                                children: "Default",
                                                                              }),
                                                                              e.jsx("option", {
                                                                                value: "flat",
                                                                                children: "Flat",
                                                                              }),
                                                                              e.jsx("option", {
                                                                                value: "bold",
                                                                                children: "Bold",
                                                                              }),
                                                                              e.jsx("option", {
                                                                                value: "material",
                                                                                children: "Material",
                                                                              }),
                                                                            ],
                                                                          }),
                                                                        ],
                                                                      }),
                                                                      e.jsxs("label", {
                                                                        className: "nls-field",
                                                                        children: [
                                                                          e.jsx("span", {
                                                                            className: "nls-field__label",
                                                                            children: "Theme",
                                                                          }),
                                                                          e.jsxs("select", {
                                                                            value: M.forminatorTheme || "default",
                                                                            onChange: function (H) {
                                                                              nlsCommitDesign(h, a, M, {
                                                                                forminatorTheme: H.target.value,
                                                                              });
                                                                            },
                                                                            children: [
                                                                              e.jsx("option", {
                                                                                value: "default",
                                                                                children: "Default",
                                                                              }),
                                                                              e.jsx("option", {
                                                                                value: "light",
                                                                                children: "Light",
                                                                              }),
                                                                              e.jsx("option", {
                                                                                value: "dark",
                                                                                children: "Dark",
                                                                              }),
                                                                            ],
                                                                          }),
                                                                        ],
                                                                      }),
                                                                      e.jsx("div", {
                                                                        className: "nexulesuite_fui-global-style",
                                                                        children: e.jsxs("div", {
                                                                          className:
                                                                            "nexulesuite_fui-global-style__box",
                                                                          children: [
                                                                            e.jsx("p", {
                                                                              className: "nexulesuite_fui-hint",
                                                                              children:
                                                                                "Save this form’s colors, style, fonts and layout as the site-wide global style. All fields on this form — and every other form — can use the same look.",
                                                                            }),
                                                                            e.jsxs("div", {
                                                                              className:
                                                                                "nexulesuite_fui-global-style__actions",
                                                                              children: [
                                                                                e.jsx("button", {
                                                                                  type: "button",
                                                                                  className:
                                                                                    "nls-btn nls-btn--primary nls-btn--sm nls-btn--block",
                                                                                  disabled: nlsGlobalBusy,
                                                                                  onClick: async function () {
                                                                                    nlsSetGlobalBusy(!0);
                                                                                    nlsSetGlobalMsg("");
                                                                                    try {
                                                                                      var styling = nlsDesignPatch(
                                                                                        M,
                                                                                        {},
                                                                                      );
                                                                                      h(a.id, {
                                                                                        styling: styling,
                                                                                        steps:
                                                                                          nlsApplyGlobalToAllFields(
                                                                                            a.steps,
                                                                                            styling,
                                                                                          ),
                                                                                      });
                                                                                      await nlsSaveGlobalAppearance(
                                                                                        styling,
                                                                                      );
                                                                                      if (
                                                                                        typeof nlsOnApplyAll ===
                                                                                        "function"
                                                                                      ) {
                                                                                        nlsOnApplyAll(styling);
                                                                                      }
                                                                                      nlsSetGlobalMsg(
                                                                                        "Global style saved and applied to all forms.",
                                                                                      );
                                                                                    } catch (err) {
                                                                                      nlsSetGlobalMsg(
                                                                                        (err && err.message) ||
                                                                                          "Could not save global style.",
                                                                                      );
                                                                                    } finally {
                                                                                      nlsSetGlobalBusy(!1);
                                                                                    }
                                                                                  },
                                                                                  children: nlsGlobalBusy
                                                                                    ? "Saving…"
                                                                                    : "Save global style",
                                                                                }),
                                                                                e.jsx("button", {
                                                                                  type: "button",
                                                                                  className:
                                                                                    "nls-btn nls-btn--secondary nls-btn--sm nls-btn--block",
                                                                                  disabled: nlsGlobalBusy,
                                                                                  onClick: async function () {
                                                                                    nlsSetGlobalBusy(!0);
                                                                                    nlsSetGlobalMsg("");
                                                                                    try {
                                                                                      var g =
                                                                                        await nlsFetchGlobalAppearance();
                                                                                      if (!g) {
                                                                                        nlsSetGlobalMsg(
                                                                                          "No global style saved yet.",
                                                                                        );
                                                                                        return;
                                                                                      }
                                                                                      nlsCommitDesign(h, a, M, g);
                                                                                      nlsSetGlobalMsg(
                                                                                        "Global style applied to this form’s fields.",
                                                                                      );
                                                                                    } catch (err) {
                                                                                      nlsSetGlobalMsg(
                                                                                        (err && err.message) ||
                                                                                          "Could not load global style.",
                                                                                      );
                                                                                    } finally {
                                                                                      nlsSetGlobalBusy(!1);
                                                                                    }
                                                                                  },
                                                                                  children: "Apply to this form",
                                                                                }),
                                                                                e.jsx("button", {
                                                                                  type: "button",
                                                                                  className:
                                                                                    "nls-btn nls-btn--secondary nls-btn--sm nls-btn--block",
                                                                                  disabled: nlsGlobalBusy,
                                                                                  onClick: async function () {
                                                                                    nlsSetGlobalBusy(!0);
                                                                                    nlsSetGlobalMsg("");
                                                                                    try {
                                                                                      var g =
                                                                                        await nlsFetchGlobalAppearance();
                                                                                      if (!g) {
                                                                                        nlsSetGlobalMsg(
                                                                                          "No global style saved yet.",
                                                                                        );
                                                                                        return;
                                                                                      }
                                                                                      if (
                                                                                        typeof nlsOnApplyAll ===
                                                                                        "function"
                                                                                      ) {
                                                                                        nlsOnApplyAll(g);
                                                                                        nlsSetGlobalMsg(
                                                                                          "Global style applied to all forms.",
                                                                                        );
                                                                                      } else {
                                                                                        nlsCommitDesign(h, a, M, g);
                                                                                        nlsSetGlobalMsg(
                                                                                          "Global style applied to this form’s fields.",
                                                                                        );
                                                                                      }
                                                                                    } catch (err) {
                                                                                      nlsSetGlobalMsg(
                                                                                        (err && err.message) ||
                                                                                          "Could not apply global style.",
                                                                                      );
                                                                                    } finally {
                                                                                      nlsSetGlobalBusy(!1);
                                                                                    }
                                                                                  },
                                                                                  children: "Apply to all forms",
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            nlsGlobalMsg
                                                                              ? e.jsx("p", {
                                                                                  className:
                                                                                    "nls-field__hint nls-fb-global__msg",
                                                                                  role: "status",
                                                                                  children: nlsGlobalMsg,
                                                                                })
                                                                              : null,
                                                                          ],
                                                                        }),
                                                                      }),
                                                                    ],
                                                                  })
                                                                : k === "style"
                                                                  ? e.jsxs("div", {
                                                                      className: "nexulesuite_fui-acc__stack",
                                                                      children: [
                                                                        e.jsx("h4", {
                                                                          className: "nls-fb-h4",
                                                                          children: "Borders & shadows",
                                                                        }),
                                                                        (() => {
                                                                          const base = "fieldBorderRadius";
                                                                          const val = nlsDevNum(M, base, nlsDevice, 6);
                                                                          return e.jsxs("div", {
                                                                            className: "nls-field",
                                                                            children: [
                                                                              e.jsxs("span", {
                                                                                className:
                                                                                  "nls-field__label nls-fb-range-label",
                                                                                children: [
                                                                                  "Border radius",
                                                                                  e.jsxs("span", {
                                                                                    children: [val, "px"],
                                                                                  }),
                                                                                ],
                                                                              }),
                                                                              e.jsx(nlsRange, {
                                                                                min: 0,
                                                                                max: 100,
                                                                                step: 1,
                                                                                value: val,
                                                                                onChange: (H) => {
                                                                                  const v = Number(H.target.value);
                                                                                  if (nlsDevice === "desktop") {
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      [base]: v,
                                                                                    });
                                                                                  } else {
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      [nlsDevKey(base, nlsDevice)]: v,
                                                                                    });
                                                                                  }
                                                                                },
                                                                              }),
                                                                            ],
                                                                          });
                                                                        })(),
                                                                        (() => {
                                                                          const base = "fieldBorderWidth";
                                                                          const val = nlsDevNum(M, base, nlsDevice, 1);
                                                                          return e.jsxs("div", {
                                                                            className: "nls-field",
                                                                            children: [
                                                                              e.jsxs("span", {
                                                                                className:
                                                                                  "nls-field__label nls-fb-range-label",
                                                                                children: [
                                                                                  "Border width",
                                                                                  e.jsxs("span", {
                                                                                    children: [val, "px"],
                                                                                  }),
                                                                                ],
                                                                              }),
                                                                              e.jsx(nlsRange, {
                                                                                min: 0,
                                                                                max: 100,
                                                                                step: 1,
                                                                                value: val,
                                                                                onChange: (H) => {
                                                                                  const v = Number(H.target.value);
                                                                                  if (nlsDevice === "desktop") {
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      [base]: v,
                                                                                    });
                                                                                  } else {
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      [nlsDevKey(base, nlsDevice)]: v,
                                                                                    });
                                                                                  }
                                                                                },
                                                                              }),
                                                                            ],
                                                                          });
                                                                        })(),
                                                                        e.jsxs("div", {
                                                                          className: "nls-field",
                                                                          children: [
                                                                            e.jsxs("span", {
                                                                              className:
                                                                                "nls-field__label nls-fb-range-label",
                                                                              children: ["Border style"],
                                                                            }),
                                                                            e.jsx("select", {
                                                                              value: M["fieldBorderStyle"] || "solid",
                                                                              onChange: (H) =>
                                                                                nlsCommitDesign(h, a, M, {
                                                                                  ["fieldBorderStyle"]: H.target.value,
                                                                                }),
                                                                              children: [
                                                                                e.jsx("option", {
                                                                                  value: "solid",
                                                                                  children: "Solid",
                                                                                }),
                                                                                e.jsx("option", {
                                                                                  value: "dashed",
                                                                                  children: "Dashed",
                                                                                }),
                                                                                e.jsx("option", {
                                                                                  value: "dotted",
                                                                                  children: "Dotted",
                                                                                }),
                                                                                e.jsx("option", {
                                                                                  value: "double",
                                                                                  children: "Double",
                                                                                }),
                                                                                e.jsx("option", {
                                                                                  value: "none",
                                                                                  children: "None",
                                                                                }),
                                                                              ],
                                                                            }),
                                                                          ],
                                                                        }),
                                                                        e.jsx("div", {
                                                                          className: "nls-fb-color-grid",
                                                                          children: [
                                                                            e.jsx(
                                                                              FormColorField,
                                                                              {
                                                                                label: "Border color",
                                                                                value:
                                                                                  M["fieldBorderColor"] || "#cbd5e1",
                                                                                onChange: (H) =>
                                                                                  nlsCommitDesign(h, a, M, {
                                                                                    ["fieldBorderColor"]: H,
                                                                                  }),
                                                                              },
                                                                              "fieldBorderColor",
                                                                            ),
                                                                          ],
                                                                        }),
                                                                        e.jsxs("div", {
                                                                          className: "nls-field",
                                                                          children: [
                                                                            e.jsxs("span", {
                                                                              className:
                                                                                "nls-field__label nls-fb-range-label",
                                                                              children: ["Input box shadow"],
                                                                            }),
                                                                            e.jsx("input", {
                                                                              type: "text",
                                                                              value: M["fieldShadow"] ?? "",
                                                                              placeholder:
                                                                                "none or 0 2px 8px rgba(0,0,0,.08)",
                                                                              onChange: (H) =>
                                                                                nlsCommitDesign(h, a, M, {
                                                                                  ["fieldShadow"]: H.target.value,
                                                                                }),
                                                                            }),
                                                                          ],
                                                                        }),
                                                                        e.jsxs("div", {
                                                                          className: "nls-field",
                                                                          children: [
                                                                            e.jsxs("span", {
                                                                              className:
                                                                                "nls-field__label nls-fb-range-label",
                                                                              children: ["Form container shadow"],
                                                                            }),
                                                                            e.jsx("input", {
                                                                              type: "text",
                                                                              value: M["formShadow"] ?? "",
                                                                              placeholder:
                                                                                "0 2px 8px rgba(15,23,42,.07)",
                                                                              onChange: (H) =>
                                                                                nlsCommitDesign(h, a, M, {
                                                                                  ["formShadow"]: H.target.value,
                                                                                }),
                                                                            }),
                                                                          ],
                                                                        }),
                                                                        e.jsx("h4", {
                                                                          className: "nls-fb-h4",
                                                                          children: "Interactive states",
                                                                        }),
                                                                        e.jsx("div", {
                                                                          className: "nls-fb-color-grid",
                                                                          children: [
                                                                            e.jsx(
                                                                              FormColorField,
                                                                              {
                                                                                label: "Focus border",
                                                                                value:
                                                                                  M["focusBorderColor"] || "#7c3aed",
                                                                                onChange: (H) =>
                                                                                  nlsCommitDesign(h, a, M, {
                                                                                    ["focusBorderColor"]: H,
                                                                                  }),
                                                                              },
                                                                              "focusBorderColor",
                                                                            ),
                                                                            e.jsx(
                                                                              FormColorField,
                                                                              {
                                                                                label: "Error border",
                                                                                value:
                                                                                  M["errorBorderColor"] || "#dc2626",
                                                                                onChange: (H) =>
                                                                                  nlsCommitDesign(h, a, M, {
                                                                                    ["errorBorderColor"]: H,
                                                                                  }),
                                                                              },
                                                                              "errorBorderColor",
                                                                            ),
                                                                          ],
                                                                        }),
                                                                        e.jsxs("div", {
                                                                          className: "nls-field",
                                                                          children: [
                                                                            e.jsxs("span", {
                                                                              className:
                                                                                "nls-field__label nls-fb-range-label",
                                                                              children: ["Focus shadow"],
                                                                            }),
                                                                            e.jsx("input", {
                                                                              type: "text",
                                                                              value: M["focusShadow"] ?? "",
                                                                              placeholder:
                                                                                "0 0 0 3px rgba(124,58,237,.25)",
                                                                              onChange: (H) =>
                                                                                nlsCommitDesign(h, a, M, {
                                                                                  ["focusShadow"]: H.target.value,
                                                                                }),
                                                                            }),
                                                                          ],
                                                                        }),
                                                                      ],
                                                                    })
                                                                  : k === "css"
                                                                    ? null
                                                                    : k === "fonts"
                                                                      ? e.jsxs("div", {
                                                                          className: "nexulesuite_fui-acc__stack",
                                                                          children: [
                                                                            e.jsxs("div", {
                                                                              className: "nls-seg nls-fb-devices",
                                                                              role: "group",
                                                                              "aria-label": "Device",
                                                                              children: [
                                                                                ["desktop", "Desktop"],
                                                                                ["tablet", "Tablet"],
                                                                                ["mobile", "Mobile"],
                                                                              ].map(([k, l]) =>
                                                                                e.jsx(
                                                                                  "button",
                                                                                  {
                                                                                    type: "button",
                                                                                    className:
                                                                                      "nls-seg__btn" +
                                                                                      (nlsDevice === k
                                                                                        ? " is-active"
                                                                                        : ""),
                                                                                    "aria-pressed": nlsDevice === k,
                                                                                    onClick: () => nlsSetDevice(k),
                                                                                    children: l,
                                                                                  },
                                                                                  k,
                                                                                ),
                                                                              ),
                                                                            }),
                                                                            e.jsx("button", {
                                                                              type: "button",
                                                                              className:
                                                                                "nls-btn nls-btn--secondary nls-btn--block",
                                                                              onClick: () => {
                                                                                const styling =
                                                                                  nlsApplyTypoToAllModules(M, {});
                                                                                h(a.id, {
                                                                                  styling,
                                                                                  steps: nlsApplyGlobalToAllFields(
                                                                                    a.steps,
                                                                                    styling,
                                                                                  ),
                                                                                });
                                                                              },
                                                                              children:
                                                                                "Apply global typography to all modules",
                                                                            }),
                                                                            e.jsx("h4", {
                                                                              className: "nls-fb-h4",
                                                                              children: "2. Field labels",
                                                                            }),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Font family"],
                                                                                }),
                                                                                e.jsx("select", {
                                                                                  value:
                                                                                    M["labelFontFamily"] || "inherit",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["labelFontFamily"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                  children: [
                                                                                    e.jsx("option", {
                                                                                      value: "inherit",
                                                                                      children: "Inherit",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        "system-ui, -apple-system, sans-serif",
                                                                                      children: "System UI",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        "Arial, Helvetica, sans-serif",
                                                                                      children: "Arial",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "Georgia, serif",
                                                                                      children: "Georgia",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        '"Times New Roman", Times, serif',
                                                                                      children: "Times",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: '"Courier New", monospace',
                                                                                      children: "Courier",
                                                                                    }),
                                                                                  ],
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            (() => {
                                                                              const base = "labelFontSize";
                                                                              const val = nlsDevNum(
                                                                                M,
                                                                                base,
                                                                                nlsDevice,
                                                                                13,
                                                                              );
                                                                              return e.jsxs("div", {
                                                                                className: "nls-field",
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className:
                                                                                      "nls-field__label nls-fb-range-label",
                                                                                    children: [
                                                                                      "Font size",
                                                                                      e.jsxs("span", {
                                                                                        children: [val, "px"],
                                                                                      }),
                                                                                    ],
                                                                                  }),
                                                                                  e.jsx(nlsRange, {
                                                                                    min: 10,
                                                                                    max: 28,
                                                                                    value: val,
                                                                                    onChange: (H) => {
                                                                                      const v = Number(H.target.value);
                                                                                      if (nlsDevice === "desktop") {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [base]: v,
                                                                                        });
                                                                                      } else {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [nlsDevKey(base, nlsDevice)]:
                                                                                            v,
                                                                                        });
                                                                                      }
                                                                                    },
                                                                                  }),
                                                                                ],
                                                                              });
                                                                            })(),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Font weight"],
                                                                                }),
                                                                                e.jsx("select", {
                                                                                  value: M["labelFontWeight"] || "400",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["labelFontWeight"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                  children: [
                                                                                    e.jsx("option", {
                                                                                      value: "400",
                                                                                      children: "Normal",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "500",
                                                                                      children: "Medium",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "600",
                                                                                      children: "Semi Bold",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "700",
                                                                                      children: "Bold",
                                                                                    }),
                                                                                  ],
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Line height"],
                                                                                }),
                                                                                e.jsx("input", {
                                                                                  type: "text",
                                                                                  value: M["labelLineHeight"] ?? "",
                                                                                  placeholder: "1.4",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["labelLineHeight"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            e.jsx("div", {
                                                                              className: "nls-fb-color-grid",
                                                                              children: [
                                                                                e.jsx(
                                                                                  FormColorField,
                                                                                  {
                                                                                    label: "Text color",
                                                                                    value: M["labelColor"] || "#334155",
                                                                                    onChange: (H) =>
                                                                                      nlsCommitDesign(h, a, M, {
                                                                                        ["labelColor"]: H,
                                                                                      }),
                                                                                  },
                                                                                  "labelColor",
                                                                                ),
                                                                              ],
                                                                            }),
                                                                            e.jsx("h4", {
                                                                              className: "nls-fb-h4",
                                                                              children: "3. Placeholder text",
                                                                            }),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Font family"],
                                                                                }),
                                                                                e.jsx("select", {
                                                                                  value:
                                                                                    M["placeholderFontFamily"] ||
                                                                                    "inherit",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["placeholderFontFamily"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                  children: [
                                                                                    e.jsx("option", {
                                                                                      value: "inherit",
                                                                                      children: "Inherit",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        "system-ui, -apple-system, sans-serif",
                                                                                      children: "System UI",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        "Arial, Helvetica, sans-serif",
                                                                                      children: "Arial",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "Georgia, serif",
                                                                                      children: "Georgia",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        '"Times New Roman", Times, serif',
                                                                                      children: "Times",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: '"Courier New", monospace',
                                                                                      children: "Courier",
                                                                                    }),
                                                                                  ],
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            (() => {
                                                                              const base = "placeholderFontSize";
                                                                              const val = nlsDevNum(
                                                                                M,
                                                                                base,
                                                                                nlsDevice,
                                                                                14,
                                                                              );
                                                                              return e.jsxs("div", {
                                                                                className: "nls-field",
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className:
                                                                                      "nls-field__label nls-fb-range-label",
                                                                                    children: [
                                                                                      "Font size",
                                                                                      e.jsxs("span", {
                                                                                        children: [val, "px"],
                                                                                      }),
                                                                                    ],
                                                                                  }),
                                                                                  e.jsx(nlsRange, {
                                                                                    min: 10,
                                                                                    max: 28,
                                                                                    value: val,
                                                                                    onChange: (H) => {
                                                                                      const v = Number(H.target.value);
                                                                                      if (nlsDevice === "desktop") {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [base]: v,
                                                                                        });
                                                                                      } else {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [nlsDevKey(base, nlsDevice)]:
                                                                                            v,
                                                                                        });
                                                                                      }
                                                                                    },
                                                                                  }),
                                                                                ],
                                                                              });
                                                                            })(),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Font weight"],
                                                                                }),
                                                                                e.jsx("select", {
                                                                                  value:
                                                                                    M["placeholderFontWeight"] || "400",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["placeholderFontWeight"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                  children: [
                                                                                    e.jsx("option", {
                                                                                      value: "400",
                                                                                      children: "Normal",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "500",
                                                                                      children: "Medium",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "600",
                                                                                      children: "Semi Bold",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "700",
                                                                                      children: "Bold",
                                                                                    }),
                                                                                  ],
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Line height"],
                                                                                }),
                                                                                e.jsx("input", {
                                                                                  type: "text",
                                                                                  value:
                                                                                    M["placeholderLineHeight"] ?? "",
                                                                                  placeholder: "1.4",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["placeholderLineHeight"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            e.jsx("div", {
                                                                              className: "nls-fb-color-grid",
                                                                              children: [
                                                                                e.jsx(
                                                                                  FormColorField,
                                                                                  {
                                                                                    label: "Text color",
                                                                                    value:
                                                                                      M["placeholderColor"] ||
                                                                                      "#94a3b8",
                                                                                    onChange: (H) =>
                                                                                      nlsCommitDesign(h, a, M, {
                                                                                        ["placeholderColor"]: H,
                                                                                      }),
                                                                                  },
                                                                                  "placeholderColor",
                                                                                ),
                                                                              ],
                                                                            }),
                                                                            e.jsx("h4", {
                                                                              className: "nls-fb-h4",
                                                                              children: "4. Input text",
                                                                            }),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Font family"],
                                                                                }),
                                                                                e.jsx("select", {
                                                                                  value:
                                                                                    M["inputFontFamily"] || "inherit",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["inputFontFamily"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                  children: [
                                                                                    e.jsx("option", {
                                                                                      value: "inherit",
                                                                                      children: "Inherit",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        "system-ui, -apple-system, sans-serif",
                                                                                      children: "System UI",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        "Arial, Helvetica, sans-serif",
                                                                                      children: "Arial",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "Georgia, serif",
                                                                                      children: "Georgia",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        '"Times New Roman", Times, serif',
                                                                                      children: "Times",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: '"Courier New", monospace',
                                                                                      children: "Courier",
                                                                                    }),
                                                                                  ],
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            (() => {
                                                                              const base = "inputFontSize";
                                                                              const val = nlsDevNum(
                                                                                M,
                                                                                base,
                                                                                nlsDevice,
                                                                                14,
                                                                              );
                                                                              return e.jsxs("div", {
                                                                                className: "nls-field",
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className:
                                                                                      "nls-field__label nls-fb-range-label",
                                                                                    children: [
                                                                                      "Font size",
                                                                                      e.jsxs("span", {
                                                                                        children: [val, "px"],
                                                                                      }),
                                                                                    ],
                                                                                  }),
                                                                                  e.jsx(nlsRange, {
                                                                                    min: 10,
                                                                                    max: 28,
                                                                                    value: val,
                                                                                    onChange: (H) => {
                                                                                      const v = Number(H.target.value);
                                                                                      if (nlsDevice === "desktop") {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [base]: v,
                                                                                        });
                                                                                      } else {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [nlsDevKey(base, nlsDevice)]:
                                                                                            v,
                                                                                        });
                                                                                      }
                                                                                    },
                                                                                  }),
                                                                                ],
                                                                              });
                                                                            })(),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Font weight"],
                                                                                }),
                                                                                e.jsx("select", {
                                                                                  value: M["inputFontWeight"] || "400",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["inputFontWeight"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                  children: [
                                                                                    e.jsx("option", {
                                                                                      value: "400",
                                                                                      children: "Normal",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "500",
                                                                                      children: "Medium",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "600",
                                                                                      children: "Semi Bold",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "700",
                                                                                      children: "Bold",
                                                                                    }),
                                                                                  ],
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Line height"],
                                                                                }),
                                                                                e.jsx("input", {
                                                                                  type: "text",
                                                                                  value: M["inputLineHeight"] ?? "",
                                                                                  placeholder: "1.4",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["inputLineHeight"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            e.jsx("div", {
                                                                              className: "nls-fb-color-grid",
                                                                              children: [
                                                                                e.jsx(
                                                                                  FormColorField,
                                                                                  {
                                                                                    label: "Text color",
                                                                                    value: M["inputColor"] || "#000000",
                                                                                    onChange: (H) =>
                                                                                      nlsCommitDesign(h, a, M, {
                                                                                        ["inputColor"]: H,
                                                                                      }),
                                                                                  },
                                                                                  "inputColor",
                                                                                ),
                                                                              ],
                                                                            }),
                                                                            e.jsx("h4", {
                                                                              className: "nls-fb-h4",
                                                                              children: "5. Description / sub-label",
                                                                            }),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Font family"],
                                                                                }),
                                                                                e.jsx("select", {
                                                                                  value:
                                                                                    M["descFontFamily"] || "inherit",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["descFontFamily"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                  children: [
                                                                                    e.jsx("option", {
                                                                                      value: "inherit",
                                                                                      children: "Inherit",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        "system-ui, -apple-system, sans-serif",
                                                                                      children: "System UI",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        "Arial, Helvetica, sans-serif",
                                                                                      children: "Arial",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "Georgia, serif",
                                                                                      children: "Georgia",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        '"Times New Roman", Times, serif',
                                                                                      children: "Times",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: '"Courier New", monospace',
                                                                                      children: "Courier",
                                                                                    }),
                                                                                  ],
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            (() => {
                                                                              const base = "descFontSize";
                                                                              const val = nlsDevNum(
                                                                                M,
                                                                                base,
                                                                                nlsDevice,
                                                                                12,
                                                                              );
                                                                              return e.jsxs("div", {
                                                                                className: "nls-field",
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className:
                                                                                      "nls-field__label nls-fb-range-label",
                                                                                    children: [
                                                                                      "Font size",
                                                                                      e.jsxs("span", {
                                                                                        children: [val, "px"],
                                                                                      }),
                                                                                    ],
                                                                                  }),
                                                                                  e.jsx(nlsRange, {
                                                                                    min: 10,
                                                                                    max: 28,
                                                                                    value: val,
                                                                                    onChange: (H) => {
                                                                                      const v = Number(H.target.value);
                                                                                      if (nlsDevice === "desktop") {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [base]: v,
                                                                                        });
                                                                                      } else {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [nlsDevKey(base, nlsDevice)]:
                                                                                            v,
                                                                                        });
                                                                                      }
                                                                                    },
                                                                                  }),
                                                                                ],
                                                                              });
                                                                            })(),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Font weight"],
                                                                                }),
                                                                                e.jsx("select", {
                                                                                  value: M["descFontWeight"] || "400",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["descFontWeight"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                  children: [
                                                                                    e.jsx("option", {
                                                                                      value: "400",
                                                                                      children: "Normal",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "500",
                                                                                      children: "Medium",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "600",
                                                                                      children: "Semi Bold",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "700",
                                                                                      children: "Bold",
                                                                                    }),
                                                                                  ],
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Line height"],
                                                                                }),
                                                                                e.jsx("input", {
                                                                                  type: "text",
                                                                                  value: M["descLineHeight"] ?? "",
                                                                                  placeholder: "1.4",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["descLineHeight"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            e.jsx("div", {
                                                                              className: "nls-fb-color-grid",
                                                                              children: [
                                                                                e.jsx(
                                                                                  FormColorField,
                                                                                  {
                                                                                    label: "Text color",
                                                                                    value: M["descColor"] || "#64748b",
                                                                                    onChange: (H) =>
                                                                                      nlsCommitDesign(h, a, M, {
                                                                                        ["descColor"]: H,
                                                                                      }),
                                                                                  },
                                                                                  "descColor",
                                                                                ),
                                                                              ],
                                                                            }),
                                                                            e.jsx("h4", {
                                                                              className: "nls-fb-h4",
                                                                              children: "6. Error messages",
                                                                            }),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Font family"],
                                                                                }),
                                                                                e.jsx("select", {
                                                                                  value:
                                                                                    M["errorFontFamily"] || "inherit",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["errorFontFamily"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                  children: [
                                                                                    e.jsx("option", {
                                                                                      value: "inherit",
                                                                                      children: "Inherit",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        "system-ui, -apple-system, sans-serif",
                                                                                      children: "System UI",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        "Arial, Helvetica, sans-serif",
                                                                                      children: "Arial",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "Georgia, serif",
                                                                                      children: "Georgia",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        '"Times New Roman", Times, serif',
                                                                                      children: "Times",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: '"Courier New", monospace',
                                                                                      children: "Courier",
                                                                                    }),
                                                                                  ],
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            (() => {
                                                                              const base = "errorFontSize";
                                                                              const val = nlsDevNum(
                                                                                M,
                                                                                base,
                                                                                nlsDevice,
                                                                                12,
                                                                              );
                                                                              return e.jsxs("div", {
                                                                                className: "nls-field",
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className:
                                                                                      "nls-field__label nls-fb-range-label",
                                                                                    children: [
                                                                                      "Font size",
                                                                                      e.jsxs("span", {
                                                                                        children: [val, "px"],
                                                                                      }),
                                                                                    ],
                                                                                  }),
                                                                                  e.jsx(nlsRange, {
                                                                                    min: 10,
                                                                                    max: 24,
                                                                                    value: val,
                                                                                    onChange: (H) => {
                                                                                      const v = Number(H.target.value);
                                                                                      if (nlsDevice === "desktop") {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [base]: v,
                                                                                        });
                                                                                      } else {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [nlsDevKey(base, nlsDevice)]:
                                                                                            v,
                                                                                        });
                                                                                      }
                                                                                    },
                                                                                  }),
                                                                                ],
                                                                              });
                                                                            })(),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Font weight"],
                                                                                }),
                                                                                e.jsx("select", {
                                                                                  value: M["errorFontWeight"] || "400",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["errorFontWeight"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                  children: [
                                                                                    e.jsx("option", {
                                                                                      value: "400",
                                                                                      children: "Normal",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "500",
                                                                                      children: "Medium",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "600",
                                                                                      children: "Semi Bold",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "700",
                                                                                      children: "Bold",
                                                                                    }),
                                                                                  ],
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Line height"],
                                                                                }),
                                                                                e.jsx("input", {
                                                                                  type: "text",
                                                                                  value: M["errorLineHeight"] ?? "",
                                                                                  placeholder: "1.4",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["errorLineHeight"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            e.jsx("div", {
                                                                              className: "nls-fb-color-grid",
                                                                              children: [
                                                                                e.jsx(
                                                                                  FormColorField,
                                                                                  {
                                                                                    label: "Error text",
                                                                                    value: M["errorColor"] || "#dc2626",
                                                                                    onChange: (H) =>
                                                                                      nlsCommitDesign(h, a, M, {
                                                                                        ["errorColor"]: H,
                                                                                      }),
                                                                                  },
                                                                                  "errorColor",
                                                                                ),
                                                                              ],
                                                                            }),
                                                                            e.jsx("h4", {
                                                                              className: "nls-fb-h4",
                                                                              children: "7. Success messages",
                                                                            }),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Font family"],
                                                                                }),
                                                                                e.jsx("select", {
                                                                                  value:
                                                                                    M["successFontFamily"] || "inherit",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["successFontFamily"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                  children: [
                                                                                    e.jsx("option", {
                                                                                      value: "inherit",
                                                                                      children: "Inherit",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        "system-ui, -apple-system, sans-serif",
                                                                                      children: "System UI",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        "Arial, Helvetica, sans-serif",
                                                                                      children: "Arial",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "Georgia, serif",
                                                                                      children: "Georgia",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value:
                                                                                        '"Times New Roman", Times, serif',
                                                                                      children: "Times",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: '"Courier New", monospace',
                                                                                      children: "Courier",
                                                                                    }),
                                                                                  ],
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            (() => {
                                                                              const base = "successFontSize";
                                                                              const val = nlsDevNum(
                                                                                M,
                                                                                base,
                                                                                nlsDevice,
                                                                                14,
                                                                              );
                                                                              return e.jsxs("div", {
                                                                                className: "nls-field",
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className:
                                                                                      "nls-field__label nls-fb-range-label",
                                                                                    children: [
                                                                                      "Font size",
                                                                                      e.jsxs("span", {
                                                                                        children: [val, "px"],
                                                                                      }),
                                                                                    ],
                                                                                  }),
                                                                                  e.jsx(nlsRange, {
                                                                                    min: 10,
                                                                                    max: 28,
                                                                                    value: val,
                                                                                    onChange: (H) => {
                                                                                      const v = Number(H.target.value);
                                                                                      if (nlsDevice === "desktop") {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [base]: v,
                                                                                        });
                                                                                      } else {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [nlsDevKey(base, nlsDevice)]:
                                                                                            v,
                                                                                        });
                                                                                      }
                                                                                    },
                                                                                  }),
                                                                                ],
                                                                              });
                                                                            })(),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Font weight"],
                                                                                }),
                                                                                e.jsx("select", {
                                                                                  value:
                                                                                    M["successFontWeight"] || "400",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["successFontWeight"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                  children: [
                                                                                    e.jsx("option", {
                                                                                      value: "400",
                                                                                      children: "Normal",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "500",
                                                                                      children: "Medium",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "600",
                                                                                      children: "Semi Bold",
                                                                                    }),
                                                                                    e.jsx("option", {
                                                                                      value: "700",
                                                                                      children: "Bold",
                                                                                    }),
                                                                                  ],
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            e.jsxs("div", {
                                                                              className: "nls-field",
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className:
                                                                                    "nls-field__label nls-fb-range-label",
                                                                                  children: ["Line height"],
                                                                                }),
                                                                                e.jsx("input", {
                                                                                  type: "text",
                                                                                  value: M["successLineHeight"] ?? "",
                                                                                  placeholder: "1.45",
                                                                                  onChange: (H) =>
                                                                                    nlsCommitDesign(h, a, M, {
                                                                                      ["successLineHeight"]:
                                                                                        H.target.value,
                                                                                    }),
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            e.jsx("div", {
                                                                              className: "nls-fb-color-grid",
                                                                              children: [
                                                                                e.jsx(
                                                                                  FormColorField,
                                                                                  {
                                                                                    label: "Success text",
                                                                                    value:
                                                                                      M["successColor"] || "#16a34a",
                                                                                    onChange: (H) =>
                                                                                      nlsCommitDesign(h, a, M, {
                                                                                        ["successColor"]: H,
                                                                                      }),
                                                                                  },
                                                                                  "successColor",
                                                                                ),
                                                                              ],
                                                                            }),
                                                                          ],
                                                                        })
                                                                      : e.jsxs("div", {
                                                                          className: "nexulesuite_fui-acc__stack",
                                                                          children: [
                                                                            e.jsxs("div", {
                                                                              className: "nls-seg nls-fb-devices",
                                                                              role: "group",
                                                                              "aria-label": "Device",
                                                                              children: [
                                                                                ["desktop", "Desktop"],
                                                                                ["tablet", "Tablet"],
                                                                                ["mobile", "Mobile"],
                                                                              ].map(([dk, dl]) =>
                                                                                e.jsx(
                                                                                  "button",
                                                                                  {
                                                                                    type: "button",
                                                                                    className:
                                                                                      "nls-seg__btn" +
                                                                                      (nlsDevice === dk
                                                                                        ? " is-active"
                                                                                        : ""),
                                                                                    "aria-pressed": nlsDevice === dk,
                                                                                    onClick: () => nlsSetDevice(dk),
                                                                                    children: dl,
                                                                                  },
                                                                                  dk,
                                                                                ),
                                                                              ),
                                                                            }),
                                                                            (() => {
                                                                              const base = "rowGap";
                                                                              const val = nlsDevNum(
                                                                                M,
                                                                                base,
                                                                                nlsDevice,
                                                                                16,
                                                                              );
                                                                              return e.jsxs("div", {
                                                                                className: "nls-field",
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className:
                                                                                      "nls-field__label nls-fb-range-label",
                                                                                    children: [
                                                                                      "Row gap (vertical)",
                                                                                      e.jsxs("span", {
                                                                                        children: [val, "px"],
                                                                                      }),
                                                                                    ],
                                                                                  }),
                                                                                  e.jsx(nlsRange, {
                                                                                    min: 0,
                                                                                    max: 100,
                                                                                    step: 1,
                                                                                    value: val,
                                                                                    onChange: (H) => {
                                                                                      const v = Number(H.target.value);
                                                                                      if (nlsDevice === "desktop") {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [base]: v,
                                                                                          fieldGap: Number(
                                                                                            H.target.value,
                                                                                          ),
                                                                                        });
                                                                                      } else {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [nlsDevKey(base, nlsDevice)]:
                                                                                            v,
                                                                                        });
                                                                                      }
                                                                                    },
                                                                                  }),
                                                                                ],
                                                                              });
                                                                            })(),
                                                                            (() => {
                                                                              const base = "columnGap";
                                                                              const val = nlsDevNum(
                                                                                M,
                                                                                base,
                                                                                nlsDevice,
                                                                                16,
                                                                              );
                                                                              return e.jsxs("div", {
                                                                                className: "nls-field",
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className:
                                                                                      "nls-field__label nls-fb-range-label",
                                                                                    children: [
                                                                                      "Column gap (horizontal)",
                                                                                      e.jsxs("span", {
                                                                                        children: [val, "px"],
                                                                                      }),
                                                                                    ],
                                                                                  }),
                                                                                  e.jsx(nlsRange, {
                                                                                    min: 0,
                                                                                    max: 100,
                                                                                    step: 1,
                                                                                    value: val,
                                                                                    onChange: (H) => {
                                                                                      const v = Number(H.target.value);
                                                                                      if (nlsDevice === "desktop") {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [base]: v,
                                                                                        });
                                                                                      } else {
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [nlsDevKey(base, nlsDevice)]:
                                                                                            v,
                                                                                        });
                                                                                      }
                                                                                    },
                                                                                  }),
                                                                                ],
                                                                              });
                                                                            })(),
                                                                            (() => {
                                                                              const base =
                                                                                nlsDevice === "desktop"
                                                                                  ? "fieldPadding"
                                                                                  : nlsDevice === "tablet"
                                                                                    ? "inputPaddingTablet"
                                                                                    : "inputPaddingMobile";
                                                                              const _fp = parseInt(M.fieldPadding, 10);
                                                                              const desktop =
                                                                                !isNaN(_fp) && _fp >= 0 ? _fp : 12;
                                                                              const raw = parseInt(M[base], 10);
                                                                              const val =
                                                                                nlsDevice === "desktop"
                                                                                  ? desktop
                                                                                  : M[base] != null &&
                                                                                      M[base] !== "" &&
                                                                                      !isNaN(raw) &&
                                                                                      raw >= 0
                                                                                    ? raw
                                                                                    : desktop;
                                                                              return e.jsxs("div", {
                                                                                className: "nls-field",
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className:
                                                                                      "nls-field__label nls-fb-range-label",
                                                                                    children: [
                                                                                      "Input padding",
                                                                                      e.jsxs("span", {
                                                                                        children: [val, "px"],
                                                                                      }),
                                                                                    ],
                                                                                  }),
                                                                                  e.jsx(nlsRange, {
                                                                                    min: 0,
                                                                                    max: 100,
                                                                                    step: 1,
                                                                                    value: val,
                                                                                    onChange: (H) => {
                                                                                      const v = Number(H.target.value);
                                                                                      if (nlsDevice === "desktop")
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          fieldPadding: v,
                                                                                        });
                                                                                      else
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [base]: v,
                                                                                        });
                                                                                    },
                                                                                  }),
                                                                                ],
                                                                              });
                                                                            })(),
                                                                            (() => {
                                                                              const baseKey = "labelSpacing";
                                                                              const val = nlsDevNum(
                                                                                M,
                                                                                baseKey,
                                                                                nlsDevice,
                                                                                6,
                                                                              );
                                                                              return e.jsxs("div", {
                                                                                className: "nls-field",
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className:
                                                                                      "nls-field__label nls-fb-range-label",
                                                                                    children: [
                                                                                      "Label spacing",
                                                                                      e.jsxs("span", {
                                                                                        children: [val, "px"],
                                                                                      }),
                                                                                    ],
                                                                                  }),
                                                                                  e.jsx(nlsRange, {
                                                                                    min: 0,
                                                                                    max: 100,
                                                                                    step: 1,
                                                                                    value: val,
                                                                                    onChange: (H) => {
                                                                                      const v = Number(H.target.value);
                                                                                      if (nlsDevice === "desktop")
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          labelSpacing: v,
                                                                                        });
                                                                                      else
                                                                                        nlsCommitDesign(h, a, M, {
                                                                                          [nlsDevKey(
                                                                                            baseKey,
                                                                                            nlsDevice,
                                                                                          )]: v,
                                                                                        });
                                                                                    },
                                                                                  }),
                                                                                  e.jsx("h4", {
                                                                                    className: "nls-fb-h4",
                                                                                    children: "11. Responsive",
                                                                                  }),
                                                                                  e.jsxs("div", {
                                                                                    className: "nls-field",
                                                                                    children: [
                                                                                      e.jsxs("span", {
                                                                                        className:
                                                                                          "nls-field__label nls-fb-range-label",
                                                                                        children: [
                                                                                          "Auto-stack columns on small screens",
                                                                                        ],
                                                                                      }),
                                                                                      e.jsx("label", {
                                                                                        className: "nls-check",
                                                                                        children: [
                                                                                          e.jsx("input", {
                                                                                            type: "checkbox",
                                                                                            checked:
                                                                                              M.autoStack !== false,
                                                                                            onChange: (H) =>
                                                                                              nlsCommitDesign(h, a, M, {
                                                                                                autoStack:
                                                                                                  !!H.target.checked,
                                                                                              }),
                                                                                          }),
                                                                                          " Stack multi-column layouts to 1 column",
                                                                                        ],
                                                                                      }),
                                                                                    ],
                                                                                  }),
                                                                                  (() => {
                                                                                    const base = "stackBreakpoint";
                                                                                    const val = nlsDevNum(
                                                                                      M,
                                                                                      base,
                                                                                      nlsDevice,
                                                                                      640,
                                                                                    );
                                                                                    return e.jsxs("div", {
                                                                                      className: "nls-field",
                                                                                      children: [
                                                                                        e.jsxs("span", {
                                                                                          className:
                                                                                            "nls-field__label nls-fb-range-label",
                                                                                          children: [
                                                                                            "Stack breakpoint",
                                                                                            e.jsxs("span", {
                                                                                              children: [val, "px"],
                                                                                            }),
                                                                                          ],
                                                                                        }),
                                                                                        e.jsx(nlsRange, {
                                                                                          min: 220,
                                                                                          max: 1200,
                                                                                          step: 1,
                                                                                          value: val,
                                                                                          onChange: (H) => {
                                                                                            const v = Number(
                                                                                              H.target.value,
                                                                                            );
                                                                                            if (
                                                                                              nlsDevice === "desktop"
                                                                                            ) {
                                                                                              nlsCommitDesign(h, a, M, {
                                                                                                [base]: v,
                                                                                              });
                                                                                            } else {
                                                                                              nlsCommitDesign(h, a, M, {
                                                                                                [nlsDevKey(
                                                                                                  base,
                                                                                                  nlsDevice,
                                                                                                )]: v,
                                                                                              });
                                                                                            }
                                                                                          },
                                                                                        }),
                                                                                      ],
                                                                                    });
                                                                                  })(),
                                                                                  e.jsx("h4", {
                                                                                    className: "nls-fb-h4",
                                                                                    children: "Per-field design",
                                                                                  }),
                                                                                ],
                                                                              });
                                                                            })(),
                                                                          ],
                                                                        }),
                                                        })
                                                      : null,
                                                  ],
                                                },
                                                k,
                                              );
                                            }),
                                          })
                                        : mk === "notify"
                                          ? e.jsxs("div", {
                                              className: "nexulesuite_fui-acc",
                                              children: [
                                                ["email", "Email Notifications"],
                                                ["integrations", "Integrations"],
                                              ].map(function (pair) {
                                                var nk = pair[0],
                                                  lab = pair[1];
                                                var open = nlsNotifyAcc === nk;
                                                return e.jsxs(
                                                  "div",
                                                  {
                                                    className: "nexulesuite_fui-acc__item" + (open ? " is-open" : ""),
                                                    children: [
                                                      e.jsxs("button", {
                                                        type: "button",
                                                        className: "nexulesuite_fui-acc__head",
                                                        onClick: function () {
                                                          nlsSetNotifyAcc(open ? "" : nk);
                                                          x("advanced");
                                                        },
                                                        children: [
                                                          e.jsxs("span", {
                                                            className: "nexulesuite_fui-acc__left",
                                                            children: [
                                                              nlsAccIcon(nk),
                                                              e.jsx("span", {
                                                                className: "nexulesuite_fui-acc__label",
                                                                children: lab,
                                                              }),
                                                            ],
                                                          }),
                                                          nlsAccPlus(open),
                                                        ],
                                                      }),
                                                      open
                                                        ? e.jsx("div", {
                                                            className: "nexulesuite_fui-acc__body",
                                                            children:
                                                              nk === "email"
                                                                ? e.jsxs("div", {
                                                                    className: "nexulesuite_fui-acc__stack",
                                                                    children: [
                                                                      e.jsx("p", {
                                                                        className: "nexulesuite_fui-hint",
                                                                        children:
                                                                          "Send customized email notifications to the site admin and visitors after a successful submission. For reliable delivery, set up SMTP on your site.",
                                                                      }),
                                                                      e.jsxs("div", {
                                                                        className: "nls-field",
                                                                        children: [
                                                                          e.jsx("span", {
                                                                            className: "nls-field__label",
                                                                            children: "Admin Email",
                                                                          }),
                                                                          e.jsx("input", {
                                                                            type: "text",
                                                                            value: a.notificationEmail || "",
                                                                            placeholder:
                                                                              "Leave blank to use site admin email",
                                                                            onChange: function (w) {
                                                                              return h(a.id, {
                                                                                notificationEmail: w.target.value,
                                                                              });
                                                                            },
                                                                          }),
                                                                        ],
                                                                      }),
                                                                      e.jsx("p", {
                                                                        className: "nexulesuite_fui-hint",
                                                                        children:
                                                                          "Add conditional email routes in the panel below for visitor thank-you emails and extra recipients.",
                                                                      }),
                                                                    ],
                                                                  })
                                                                : e.jsxs("div", {
                                                                    className: "nexulesuite_fui-acc__stack",
                                                                    children: [
                                                                      e.jsxs("div", {
                                                                        className: "nls-field",
                                                                        children: [
                                                                          e.jsx("span", {
                                                                            className: "nls-field__label",
                                                                            children: "CRM / Webhook URL (this form)",
                                                                          }),
                                                                          e.jsx("input", {
                                                                            type: "url",
                                                                            value: a.crmWebhookUrl || "",
                                                                            onChange: function (w) {
                                                                              return h(a.id, {
                                                                                crmWebhookUrl: w.target.value,
                                                                              });
                                                                            },
                                                                            placeholder: "https://hooks.zapier.com/...",
                                                                          }),
                                                                        ],
                                                                      }),
                                                                      e.jsx("p", {
                                                                        className: "nexulesuite_fui-hint",
                                                                        children:
                                                                          "Optional. Per-form JSON webhook; set a global URL in Settings for all forms too.",
                                                                      }),
                                                                    ],
                                                                  }),
                                                          })
                                                        : null,
                                                    ],
                                                  },
                                                  nk,
                                                );
                                              }),
                                            })
                                          : mk === "settings"
                                            ? e.jsxs("div", {
                                                className: "nexulesuite_fui-acc",
                                                children: [
                                                  ["visibility", "Visibility"],
                                                  ["legal", "Legal"],
                                                ].map(function (pair) {
                                                  var sk = pair[0],
                                                    lab = pair[1];
                                                  var open = nlsSettingsAcc === sk;
                                                  return e.jsxs(
                                                    "div",
                                                    {
                                                      className: "nexulesuite_fui-acc__item" + (open ? " is-open" : ""),
                                                      children: [
                                                        e.jsxs("button", {
                                                          type: "button",
                                                          className: "nexulesuite_fui-acc__head",
                                                          onClick: function () {
                                                            nlsSetSettingsAcc(open ? "" : sk);
                                                            x("advanced");
                                                          },
                                                          children: [
                                                            e.jsxs("span", {
                                                              className: "nexulesuite_fui-acc__left",
                                                              children: [
                                                                nlsAccIcon(sk),
                                                                e.jsx("span", {
                                                                  className: "nexulesuite_fui-acc__label",
                                                                  children: lab,
                                                                }),
                                                              ],
                                                            }),
                                                            nlsAccPlus(open),
                                                          ],
                                                        }),
                                                        open
                                                          ? e.jsx("div", {
                                                              className: "nexulesuite_fui-acc__body",
                                                              children:
                                                                sk === "visibility"
                                                                  ? e.jsxs("div", {
                                                                      className: "nexulesuite_fui-acc__stack",
                                                                      children: [
                                                                        e.jsxs("div", {
                                                                          className: "nls-toggle-card",
                                                                          children: [
                                                                            e.jsxs("div", {
                                                                              className: "nls-toggle-card__body",
                                                                              children: [
                                                                                e.jsx("span", {
                                                                                  className: "nls-toggle-card__title",
                                                                                  children: "Show form on website",
                                                                                }),
                                                                                e.jsx("p", {
                                                                                  className: "nls-toggle-card__hint",
                                                                                  children:
                                                                                    "Turn off to hide everywhere on the front (shortcodes, popups, widgets). The form stays in the builder for editing.",
                                                                                }),
                                                                              ],
                                                                            }),
                                                                            e.jsx("div", {
                                                                              className: `nls-switch${a.published !== !1 ? " is-on" : ""}`,
                                                                              "aria-label": "Show form on website",
                                                                              role: "switch",
                                                                              "aria-checked": a.published !== !1,
                                                                              tabIndex: 0,
                                                                              onClick: () =>
                                                                                h(a.id, {
                                                                                  published: a.published === !1,
                                                                                }),
                                                                              onKeyDown: (w) => {
                                                                                (w.key === " " || w.key === "Enter") &&
                                                                                  (w.preventDefault(),
                                                                                  h(a.id, {
                                                                                    published: a.published === !1,
                                                                                  }));
                                                                              },
                                                                            }),
                                                                          ],
                                                                        }),
                                                                      ],
                                                                    })
                                                                  : sk === "markup"
                                                                    ? null
                                                                    : e.jsxs("div", {
                                                                        className: "nexulesuite_fui-acc__stack",
                                                                        children: [
                                                                          e.jsxs("div", {
                                                                            className: "nls-field",
                                                                            children: [
                                                                              e.jsx("span", {
                                                                                className: "nls-field__label",
                                                                                children: "Terms & Conditions Text",
                                                                              }),
                                                                              e.jsx("textarea", {
                                                                                value: a.termsConditionText || "",
                                                                                onChange: (w) =>
                                                                                  h(a.id, {
                                                                                    termsConditionText: w.target.value,
                                                                                  }),
                                                                                rows: 2,
                                                                                placeholder:
                                                                                  "I agree to the terms and conditions",
                                                                              }),
                                                                            ],
                                                                          }),
                                                                        ],
                                                                      }),
                                                            })
                                                          : null,
                                                      ],
                                                    },
                                                    sk,
                                                  );
                                                }),
                                              })
                                            : mk === "behavior"
                                              ? e.jsx("div", {
                                                  className: "nexulesuite_fui-acc__content-inner nls-fb-panel",
                                                  children: e.jsx(FormBehaviorSettings, {
                                                    form: a,
                                                    onUpdate: (w) => h(a.id, w),
                                                  }),
                                                })
                                              : e.jsx("div", {
                                                  className: "nexulesuite_fui-acc__content-inner",
                                                  children: e.jsx("p", {
                                                    className: "nexulesuite_fui-hint",
                                                    children: "Add and arrange fields on the canvas.",
                                                  }),
                                                }),
                                  })
                                : null,
                            ],
                          },
                          mk,
                        );
                      }),
                    }),
                  ],
                }),
              ],
            }),
        ],
      })
    : e.jsxs("li", {
        className: `nls-card nls-fb-card${o ? " is-expanded" : ""}`,
        children: [
          e.jsxs("div", {
            className: "nls-fb-head",
            children: [
              e.jsxs("button", {
                type: "button",
                onClick: d,
                className: "nls-fb-head__main",
                "aria-expanded": !!o,
                children: [
                  e.jsx("span", {
                    className: "nls-fb-head__title",
                    children: a.name || "Untitled Form",
                  }),
                  e.jsx("span", {
                    className: "nls-badge nls-badge--primary",
                    children: a.formType === "multi" ? "Multi-Step" : "Simple",
                  }),
                  a.published === !1
                    ? e.jsx("span", {
                        className: "nls-badge nls-badge--muted",
                        children: "Hidden",
                      })
                    : null,
                ],
              }),
              e.jsxs("div", {
                className: "nls-fb-head__actions",
                onClick: (w) => w.stopPropagation(),
                children: [
                  e.jsx("button", {
                    type: "button",
                    onClick: () => (y == null ? void 0 : y(a.id)),
                    className: "nls-icon-btn",
                    title: "Preview",
                    "aria-label": "Preview",
                    children: e.jsx(Rt, {
                      size: 16,
                      "aria-hidden": "true",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => (P == null ? void 0 : P(a.id, a.published === !1)),
                    className: `nls-icon-btn${a.published === !1 ? " is-warn" : ""}`,
                    title: a.published === !1 ? "Show form on website" : "Hide form on website",
                    "aria-label": a.published === !1 ? "Show form on website" : "Hide form on website",
                    children:
                      a.published === !1
                        ? e.jsx(Rt, {
                            size: 16,
                            "aria-hidden": "true",
                          })
                        : e.jsx(za, {
                            size: 16,
                            "aria-hidden": "true",
                          }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => copyShortcode(a.id, S),
                    className: `nls-icon-btn${f === a.id ? " is-success" : ""}`,
                    title: "Copy shortcode",
                    "aria-label": "Copy shortcode",
                    children: e.jsx(Jc, {
                      size: 16,
                      "aria-hidden": "true",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => p(a.id),
                    className: "nls-icon-btn",
                    title: "Duplicate",
                    "aria-label": "Duplicate",
                    children: e.jsx($s, {
                      size: 16,
                      "aria-hidden": "true",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => u(a.id),
                    className: "nls-icon-btn nls-icon-btn--danger",
                    title: "Delete",
                    "aria-label": "Delete",
                    children: e.jsx(yt, {
                      size: 16,
                      "aria-hidden": "true",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => nlsExportFormConfig(a),
                    className: "nls-icon-btn",
                    title: "Export form",
                    "aria-label": "Export form",
                    children: e.jsx(Ol, {
                      size: 16,
                      "aria-hidden": "true",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () =>
                      nlsPickFormImport((w) =>
                        nlsOnImport
                          ? nlsOnImport(a.id, w)
                          : h(
                              a.id,
                              normalizeForm({
                                ...w,
                                id: a.id,
                              }),
                            ),
                      ),
                    className: "nls-icon-btn",
                    title: "Import form",
                    "aria-label": "Import form",
                    children: e.jsx(Vl, {
                      size: 16,
                      "aria-hidden": "true",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: d,
                    className: "nls-icon-btn nls-fb-chevron",
                    title: o ? "Collapse" : "Expand",
                    "aria-label": o ? "Collapse" : "Expand",
                    "aria-expanded": !!o,
                    children: e.jsx(Qs, {
                      size: 16,
                      className: o ? "is-open" : "",
                      "aria-hidden": "true",
                    }),
                  }),
                ],
              }),
            ],
          }),
          o &&
            e.jsxs("div", {
              className: "nls-fb-body nls-stack nls-stack--tight",
              children: [
                e.jsxs("div", {
                  className: "nls-fb-name-row nls-grid-2",
                  children: [
                    e.jsxs("label", {
                      className: "nls-field",
                      children: [
                        e.jsx("span", {
                          className: "nls-field__label",
                          children: "Form Name",
                        }),
                        e.jsx("input", {
                          type: "text",
                          value: a.name,
                          onChange: (w) =>
                            h(a.id, {
                              name: w.target.value,
                            }),
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "nls-field",
                      children: [
                        e.jsx("span", {
                          className: "nls-field__label",
                          children: "Shortcode",
                        }),
                        e.jsxs("div", {
                          className: "nls-row nls-fb-shortcode",
                          children: [
                            e.jsxs("code", {
                              className: "nls-code",
                              children: ['[nexulesuite_form id="', a.id, '"]'],
                            }),
                            e.jsx("button", {
                              type: "button",
                              onClick: () => copyShortcode(a.id, S),
                              className: "nls-btn nls-btn--secondary nls-btn--sm",
                              "aria-live": "polite",
                              children: f === a.id ? "Copied!" : "Copy",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx("div", {
                  className: "nls-tabs",
                  role: "tablist",
                  "aria-label": "Form sections",
                  children: ["fields", "styling", "customization", "confirmations", "advanced"].map((w) =>
                    e.jsx(
                      "button",
                      {
                        type: "button",
                        role: "tab",
                        "aria-selected": i === w,
                        onClick: () => x(w),
                        className: ["nls-tab", i === w ? "is-active" : ""].join(" "),
                        children: w.charAt(0).toUpperCase() + w.slice(1),
                      },
                      w,
                    ),
                  ),
                }),
                i === "fields" &&
                  e.jsx("div", {
                    className: "space-y-4",
                    children: e.jsx(FormCanvas, {
                      form: a,
                      onPatchForm: (w) => h(a.id, w),
                      onSelectionChange: a.onSelectionChange,
                    }),
                  }),
                i === "styling" &&
                  e.jsxs("div", {
                    className: "nls-stack nls-stack--tight",
                    children: [
                      e.jsx("div", {
                        className: "nls-grid-2",
                        children: [
                          ["Background Color", "backgroundColor"],
                          ["Text Color", "textColor"],
                          ["Button Color", "buttonColor"],
                          ["Stepper Color", "stepperColor"],
                        ].map(([w, N]) =>
                          e.jsxs(
                            "div",
                            {
                              className: "nls-field",
                              children: [
                                e.jsx("span", {
                                  className: "nls-field__label",
                                  children: w,
                                }),
                                e.jsxs("div", {
                                  className: "nls-input-group nls-fb-color-row",
                                  children: [
                                    e.jsx("input", {
                                      type: "color",
                                      value: M[N],
                                      onChange: (H) =>
                                        h(a.id, {
                                          styling: {
                                            ...M,
                                            [N]: H.target.value,
                                          },
                                        }),
                                      "aria-label": w,
                                    }),
                                    e.jsx("input", {
                                      type: "text",
                                      value: M[N],
                                      onChange: (H) =>
                                        h(a.id, {
                                          styling: {
                                            ...M,
                                            [N]: H.target.value,
                                          },
                                        }),
                                      className: "nls-mono",
                                      "aria-label": w + " hex value",
                                    }),
                                  ],
                                }),
                              ],
                            },
                            N,
                          ),
                        ),
                      }),
                      e.jsxs("label", {
                        className: "nls-field nls-fb-maxw",
                        children: [
                          e.jsx("span", {
                            className: "nls-field__label",
                            children: "Submit Button Text",
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: a.submitBtnText || "",
                            onChange: (w) =>
                              h(a.id, {
                                submitBtnText: w.target.value,
                              }),
                          }),
                        ],
                      }),
                    ],
                  }),
                i === "customization" &&
                  e.jsxs("div", {
                    className: "nls-stack nls-stack--tight nexulesuite_cust",
                    children: [
                      e.jsx("div", {
                        className: "nls-card nls-card--soft",
                        children: e.jsxs("div", {
                          className: "nls-card__body nls-stack nls-stack--tight",
                          children: [
                            e.jsxs("div", {
                              children: [
                                e.jsx("h4", {
                                  className: "nls-fb-h4",
                                  children: "Appearance presets",
                                }),
                                e.jsx("p", {
                                  className: "nls-field__hint",
                                  children: "Forminator-style design & theme for the live form",
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              className: "nls-grid-2",
                              children: [
                                e.jsxs("label", {
                                  className: "nls-field",
                                  children: [
                                    e.jsx("span", {
                                      className: "nls-field__label",
                                      children: "Design",
                                    }),
                                    e.jsx("select", {
                                      value: M.forminatorDesign || "default",
                                      onChange: (H) =>
                                        nlsCommitDesign(h, a, M, {
                                          forminatorDesign: H.target.value,
                                        }),
                                      children: [
                                        e.jsx("option", {
                                          value: "default",
                                          children: "Default",
                                        }),
                                        e.jsx("option", {
                                          value: "flat",
                                          children: "Flat",
                                        }),
                                        e.jsx("option", {
                                          value: "bold",
                                          children: "Bold",
                                        }),
                                        e.jsx("option", {
                                          value: "material",
                                          children: "Material",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsxs("label", {
                                  className: "nls-field",
                                  children: [
                                    e.jsx("span", {
                                      className: "nls-field__label",
                                      children: "Theme",
                                    }),
                                    e.jsx("select", {
                                      value: M.forminatorTheme || "default",
                                      onChange: (H) =>
                                        nlsCommitDesign(h, a, M, {
                                          forminatorTheme: H.target.value,
                                        }),
                                      children: [
                                        e.jsx("option", {
                                          value: "default",
                                          children: "Default",
                                        }),
                                        e.jsx("option", {
                                          value: "light",
                                          children: "Light",
                                        }),
                                        e.jsx("option", {
                                          value: "dark",
                                          children: "Dark",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                      e.jsx("p", {
                        className: "nls-field__hint",
                        children:
                          "Advanced global design: typography, spacing, responsive sizes, borders, states, and colors. Use Desktop / Tablet / Mobile for device-specific sizes and gaps.",
                      }),
                      e.jsx("div", {
                        className: "nls-seg nls-fb-devices",
                        role: "group",
                        "aria-label": "Device",
                        children: [
                          ["desktop", "Desktop"],
                          ["tablet", "Tablet"],
                          ["mobile", "Mobile"],
                        ].map(([k, l]) =>
                          e.jsx(
                            "button",
                            {
                              type: "button",
                              className: "nls-seg__btn" + (nlsDevice === k ? " is-active" : ""),
                              "aria-pressed": nlsDevice === k,
                              onClick: () => nlsSetDevice(k),
                              children: l,
                            },
                            k,
                          ),
                        ),
                      }),
                      e.jsx("h4", {
                        className: "nls-fb-h4",
                        children: "1. Color palette",
                      }),
                      e.jsx("div", {
                        className: "nls-fb-color-grid",
                        children: [
                          e.jsx(
                            FormColorField,
                            {
                              label: "Primary color",
                              value: M["primaryColor"] || "#7c3aed",
                              onChange: (H) =>
                                nlsCommitDesign(h, a, M, {
                                  ["primaryColor"]: H,
                                }),
                            },
                            "primaryColor",
                          ),
                          e.jsx(
                            FormColorField,
                            {
                              label: "Input background",
                              value: M["fieldBackgroundColor"] || "#ffffff",
                              onChange: (H) =>
                                nlsCommitDesign(h, a, M, {
                                  ["fieldBackgroundColor"]: H,
                                }),
                            },
                            "fieldBackgroundColor",
                          ),
                        ],
                      }),
                      e.jsx("h4", {
                        className: "nls-fb-h4",
                        children: "2. Field labels",
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Font family"],
                          }),
                          e.jsx("select", {
                            value: M["labelFontFamily"] || "inherit",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["labelFontFamily"]: H.target.value,
                              }),
                            children: [
                              e.jsx("option", {
                                value: "inherit",
                                children: "Inherit",
                              }),
                              e.jsx("option", {
                                value: "system-ui, -apple-system, sans-serif",
                                children: "System UI",
                              }),
                              e.jsx("option", {
                                value: "Arial, Helvetica, sans-serif",
                                children: "Arial",
                              }),
                              e.jsx("option", {
                                value: "Georgia, serif",
                                children: "Georgia",
                              }),
                              e.jsx("option", {
                                value: '"Times New Roman", Times, serif',
                                children: "Times",
                              }),
                              e.jsx("option", {
                                value: '"Courier New", monospace',
                                children: "Courier",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (() => {
                        const base = "labelFontSize";
                        const val = nlsDevNum(M, base, nlsDevice, 13);
                        return e.jsxs("div", {
                          className: "nls-field",
                          children: [
                            e.jsxs("label", {
                              className: "nls-field__label nls-fb-range-label",
                              children: [
                                "Font size",
                                e.jsxs("span", {
                                  children: [val, "px"],
                                }),
                              ],
                            }),
                            e.jsx(nlsRange, {
                              min: 10,
                              max: 28,
                              value: val,
                              onChange: (H) => {
                                const v = Number(H.target.value);
                                if (nlsDevice === "desktop") {
                                  nlsCommitDesign(h, a, M, {
                                    [base]: v,
                                  });
                                } else {
                                  nlsCommitDesign(h, a, M, {
                                    [nlsDevKey(base, nlsDevice)]: v,
                                  });
                                }
                              },
                            }),
                          ],
                        });
                      })(),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Font weight"],
                          }),
                          e.jsx("select", {
                            value: M["labelFontWeight"] || "400",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["labelFontWeight"]: H.target.value,
                              }),
                            children: [
                              e.jsx("option", {
                                value: "400",
                                children: "Normal",
                              }),
                              e.jsx("option", {
                                value: "500",
                                children: "Medium",
                              }),
                              e.jsx("option", {
                                value: "600",
                                children: "Semi Bold",
                              }),
                              e.jsx("option", {
                                value: "700",
                                children: "Bold",
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Line height"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: M["labelLineHeight"] ?? "",
                            placeholder: "1.4",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["labelLineHeight"]: H.target.value,
                              }),
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "nls-fb-color-grid",
                        children: [
                          e.jsx(
                            FormColorField,
                            {
                              label: "Text color",
                              value: M["labelColor"] || "#334155",
                              onChange: (H) =>
                                nlsCommitDesign(h, a, M, {
                                  ["labelColor"]: H,
                                }),
                            },
                            "labelColor",
                          ),
                        ],
                      }),
                      e.jsx("h4", {
                        className: "nls-fb-h4",
                        children: "3. Placeholder text",
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Font family"],
                          }),
                          e.jsx("select", {
                            value: M["placeholderFontFamily"] || "inherit",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["placeholderFontFamily"]: H.target.value,
                              }),
                            children: [
                              e.jsx("option", {
                                value: "inherit",
                                children: "Inherit",
                              }),
                              e.jsx("option", {
                                value: "system-ui, -apple-system, sans-serif",
                                children: "System UI",
                              }),
                              e.jsx("option", {
                                value: "Arial, Helvetica, sans-serif",
                                children: "Arial",
                              }),
                              e.jsx("option", {
                                value: "Georgia, serif",
                                children: "Georgia",
                              }),
                              e.jsx("option", {
                                value: '"Times New Roman", Times, serif',
                                children: "Times",
                              }),
                              e.jsx("option", {
                                value: '"Courier New", monospace',
                                children: "Courier",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (() => {
                        const base = "placeholderFontSize";
                        const val = nlsDevNum(M, base, nlsDevice, 14);
                        return e.jsxs("div", {
                          className: "nls-field",
                          children: [
                            e.jsxs("label", {
                              className: "nls-field__label nls-fb-range-label",
                              children: [
                                "Font size",
                                e.jsxs("span", {
                                  children: [val, "px"],
                                }),
                              ],
                            }),
                            e.jsx(nlsRange, {
                              min: 10,
                              max: 28,
                              value: val,
                              onChange: (H) => {
                                const v = Number(H.target.value);
                                if (nlsDevice === "desktop") {
                                  nlsCommitDesign(h, a, M, {
                                    [base]: v,
                                  });
                                } else {
                                  nlsCommitDesign(h, a, M, {
                                    [nlsDevKey(base, nlsDevice)]: v,
                                  });
                                }
                              },
                            }),
                          ],
                        });
                      })(),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Font weight"],
                          }),
                          e.jsx("select", {
                            value: M["placeholderFontWeight"] || "400",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["placeholderFontWeight"]: H.target.value,
                              }),
                            children: [
                              e.jsx("option", {
                                value: "400",
                                children: "Normal",
                              }),
                              e.jsx("option", {
                                value: "500",
                                children: "Medium",
                              }),
                              e.jsx("option", {
                                value: "600",
                                children: "Semi Bold",
                              }),
                              e.jsx("option", {
                                value: "700",
                                children: "Bold",
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Line height"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: M["placeholderLineHeight"] ?? "",
                            placeholder: "1.4",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["placeholderLineHeight"]: H.target.value,
                              }),
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "nls-fb-color-grid",
                        children: [
                          e.jsx(
                            FormColorField,
                            {
                              label: "Text color",
                              value: M["placeholderColor"] || "#94a3b8",
                              onChange: (H) =>
                                nlsCommitDesign(h, a, M, {
                                  ["placeholderColor"]: H,
                                }),
                            },
                            "placeholderColor",
                          ),
                        ],
                      }),
                      e.jsx("h4", {
                        className: "nls-fb-h4",
                        children: "4. Input text",
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Font family"],
                          }),
                          e.jsx("select", {
                            value: M["inputFontFamily"] || "inherit",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["inputFontFamily"]: H.target.value,
                              }),
                            children: [
                              e.jsx("option", {
                                value: "inherit",
                                children: "Inherit",
                              }),
                              e.jsx("option", {
                                value: "system-ui, -apple-system, sans-serif",
                                children: "System UI",
                              }),
                              e.jsx("option", {
                                value: "Arial, Helvetica, sans-serif",
                                children: "Arial",
                              }),
                              e.jsx("option", {
                                value: "Georgia, serif",
                                children: "Georgia",
                              }),
                              e.jsx("option", {
                                value: '"Times New Roman", Times, serif',
                                children: "Times",
                              }),
                              e.jsx("option", {
                                value: '"Courier New", monospace',
                                children: "Courier",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (() => {
                        const base = "inputFontSize";
                        const val = nlsDevNum(M, base, nlsDevice, 14);
                        return e.jsxs("div", {
                          className: "nls-field",
                          children: [
                            e.jsxs("label", {
                              className: "nls-field__label nls-fb-range-label",
                              children: [
                                "Font size",
                                e.jsxs("span", {
                                  children: [val, "px"],
                                }),
                              ],
                            }),
                            e.jsx(nlsRange, {
                              min: 10,
                              max: 28,
                              value: val,
                              onChange: (H) => {
                                const v = Number(H.target.value);
                                if (nlsDevice === "desktop") {
                                  nlsCommitDesign(h, a, M, {
                                    [base]: v,
                                  });
                                } else {
                                  nlsCommitDesign(h, a, M, {
                                    [nlsDevKey(base, nlsDevice)]: v,
                                  });
                                }
                              },
                            }),
                          ],
                        });
                      })(),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Font weight"],
                          }),
                          e.jsx("select", {
                            value: M["inputFontWeight"] || "400",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["inputFontWeight"]: H.target.value,
                              }),
                            children: [
                              e.jsx("option", {
                                value: "400",
                                children: "Normal",
                              }),
                              e.jsx("option", {
                                value: "500",
                                children: "Medium",
                              }),
                              e.jsx("option", {
                                value: "600",
                                children: "Semi Bold",
                              }),
                              e.jsx("option", {
                                value: "700",
                                children: "Bold",
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Line height"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: M["inputLineHeight"] ?? "",
                            placeholder: "1.4",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["inputLineHeight"]: H.target.value,
                              }),
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "nls-fb-color-grid",
                        children: [
                          e.jsx(
                            FormColorField,
                            {
                              label: "Text color",
                              value: M["inputColor"] || "#000000",
                              onChange: (H) =>
                                nlsCommitDesign(h, a, M, {
                                  ["inputColor"]: H,
                                }),
                            },
                            "inputColor",
                          ),
                        ],
                      }),
                      e.jsx("h4", {
                        className: "nls-fb-h4",
                        children: "5. Description / sub-label",
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Font family"],
                          }),
                          e.jsx("select", {
                            value: M["descFontFamily"] || "inherit",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["descFontFamily"]: H.target.value,
                              }),
                            children: [
                              e.jsx("option", {
                                value: "inherit",
                                children: "Inherit",
                              }),
                              e.jsx("option", {
                                value: "system-ui, -apple-system, sans-serif",
                                children: "System UI",
                              }),
                              e.jsx("option", {
                                value: "Arial, Helvetica, sans-serif",
                                children: "Arial",
                              }),
                              e.jsx("option", {
                                value: "Georgia, serif",
                                children: "Georgia",
                              }),
                              e.jsx("option", {
                                value: '"Times New Roman", Times, serif',
                                children: "Times",
                              }),
                              e.jsx("option", {
                                value: '"Courier New", monospace',
                                children: "Courier",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (() => {
                        const base = "descFontSize";
                        const val = nlsDevNum(M, base, nlsDevice, 12);
                        return e.jsxs("div", {
                          className: "nls-field",
                          children: [
                            e.jsxs("label", {
                              className: "nls-field__label nls-fb-range-label",
                              children: [
                                "Font size",
                                e.jsxs("span", {
                                  children: [val, "px"],
                                }),
                              ],
                            }),
                            e.jsx(nlsRange, {
                              min: 10,
                              max: 28,
                              value: val,
                              onChange: (H) => {
                                const v = Number(H.target.value);
                                if (nlsDevice === "desktop") {
                                  nlsCommitDesign(h, a, M, {
                                    [base]: v,
                                  });
                                } else {
                                  nlsCommitDesign(h, a, M, {
                                    [nlsDevKey(base, nlsDevice)]: v,
                                  });
                                }
                              },
                            }),
                          ],
                        });
                      })(),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Font weight"],
                          }),
                          e.jsx("select", {
                            value: M["descFontWeight"] || "400",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["descFontWeight"]: H.target.value,
                              }),
                            children: [
                              e.jsx("option", {
                                value: "400",
                                children: "Normal",
                              }),
                              e.jsx("option", {
                                value: "500",
                                children: "Medium",
                              }),
                              e.jsx("option", {
                                value: "600",
                                children: "Semi Bold",
                              }),
                              e.jsx("option", {
                                value: "700",
                                children: "Bold",
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Line height"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: M["descLineHeight"] ?? "",
                            placeholder: "1.4",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["descLineHeight"]: H.target.value,
                              }),
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "nls-fb-color-grid",
                        children: [
                          e.jsx(
                            FormColorField,
                            {
                              label: "Text color",
                              value: M["descColor"] || "#64748b",
                              onChange: (H) =>
                                nlsCommitDesign(h, a, M, {
                                  ["descColor"]: H,
                                }),
                            },
                            "descColor",
                          ),
                        ],
                      }),
                      e.jsx("h4", {
                        className: "nls-fb-h4",
                        children: "6. Error messages",
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Font family"],
                          }),
                          e.jsx("select", {
                            value: M["errorFontFamily"] || "inherit",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["errorFontFamily"]: H.target.value,
                              }),
                            children: [
                              e.jsx("option", {
                                value: "inherit",
                                children: "Inherit",
                              }),
                              e.jsx("option", {
                                value: "system-ui, -apple-system, sans-serif",
                                children: "System UI",
                              }),
                              e.jsx("option", {
                                value: "Arial, Helvetica, sans-serif",
                                children: "Arial",
                              }),
                              e.jsx("option", {
                                value: "Georgia, serif",
                                children: "Georgia",
                              }),
                              e.jsx("option", {
                                value: '"Times New Roman", Times, serif',
                                children: "Times",
                              }),
                              e.jsx("option", {
                                value: '"Courier New", monospace',
                                children: "Courier",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (() => {
                        const base = "errorFontSize";
                        const val = nlsDevNum(M, base, nlsDevice, 12);
                        return e.jsxs("div", {
                          className: "nls-field",
                          children: [
                            e.jsxs("label", {
                              className: "nls-field__label nls-fb-range-label",
                              children: [
                                "Font size",
                                e.jsxs("span", {
                                  children: [val, "px"],
                                }),
                              ],
                            }),
                            e.jsx(nlsRange, {
                              min: 10,
                              max: 24,
                              value: val,
                              onChange: (H) => {
                                const v = Number(H.target.value);
                                if (nlsDevice === "desktop") {
                                  nlsCommitDesign(h, a, M, {
                                    [base]: v,
                                  });
                                } else {
                                  nlsCommitDesign(h, a, M, {
                                    [nlsDevKey(base, nlsDevice)]: v,
                                  });
                                }
                              },
                            }),
                          ],
                        });
                      })(),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Font weight"],
                          }),
                          e.jsx("select", {
                            value: M["errorFontWeight"] || "400",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["errorFontWeight"]: H.target.value,
                              }),
                            children: [
                              e.jsx("option", {
                                value: "400",
                                children: "Normal",
                              }),
                              e.jsx("option", {
                                value: "500",
                                children: "Medium",
                              }),
                              e.jsx("option", {
                                value: "600",
                                children: "Semi Bold",
                              }),
                              e.jsx("option", {
                                value: "700",
                                children: "Bold",
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Line height"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: M["errorLineHeight"] ?? "",
                            placeholder: "1.4",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["errorLineHeight"]: H.target.value,
                              }),
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "nls-fb-color-grid",
                        children: [
                          e.jsx(
                            FormColorField,
                            {
                              label: "Error text",
                              value: M["errorColor"] || "#dc2626",
                              onChange: (H) =>
                                nlsCommitDesign(h, a, M, {
                                  ["errorColor"]: H,
                                }),
                            },
                            "errorColor",
                          ),
                        ],
                      }),
                      e.jsx("h4", {
                        className: "nls-fb-h4",
                        children: "7. Success messages",
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Font family"],
                          }),
                          e.jsx("select", {
                            value: M["successFontFamily"] || "inherit",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["successFontFamily"]: H.target.value,
                              }),
                            children: [
                              e.jsx("option", {
                                value: "inherit",
                                children: "Inherit",
                              }),
                              e.jsx("option", {
                                value: "system-ui, -apple-system, sans-serif",
                                children: "System UI",
                              }),
                              e.jsx("option", {
                                value: "Arial, Helvetica, sans-serif",
                                children: "Arial",
                              }),
                              e.jsx("option", {
                                value: "Georgia, serif",
                                children: "Georgia",
                              }),
                              e.jsx("option", {
                                value: '"Times New Roman", Times, serif',
                                children: "Times",
                              }),
                              e.jsx("option", {
                                value: '"Courier New", monospace',
                                children: "Courier",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (() => {
                        const base = "successFontSize";
                        const val = nlsDevNum(M, base, nlsDevice, 14);
                        return e.jsxs("div", {
                          className: "nls-field",
                          children: [
                            e.jsxs("label", {
                              className: "nls-field__label nls-fb-range-label",
                              children: [
                                "Font size",
                                e.jsxs("span", {
                                  children: [val, "px"],
                                }),
                              ],
                            }),
                            e.jsx(nlsRange, {
                              min: 10,
                              max: 28,
                              value: val,
                              onChange: (H) => {
                                const v = Number(H.target.value);
                                if (nlsDevice === "desktop") {
                                  nlsCommitDesign(h, a, M, {
                                    [base]: v,
                                  });
                                } else {
                                  nlsCommitDesign(h, a, M, {
                                    [nlsDevKey(base, nlsDevice)]: v,
                                  });
                                }
                              },
                            }),
                          ],
                        });
                      })(),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Font weight"],
                          }),
                          e.jsx("select", {
                            value: M["successFontWeight"] || "400",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["successFontWeight"]: H.target.value,
                              }),
                            children: [
                              e.jsx("option", {
                                value: "400",
                                children: "Normal",
                              }),
                              e.jsx("option", {
                                value: "500",
                                children: "Medium",
                              }),
                              e.jsx("option", {
                                value: "600",
                                children: "Semi Bold",
                              }),
                              e.jsx("option", {
                                value: "700",
                                children: "Bold",
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Line height"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: M["successLineHeight"] ?? "",
                            placeholder: "1.45",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["successLineHeight"]: H.target.value,
                              }),
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "nls-fb-color-grid",
                        children: [
                          e.jsx(
                            FormColorField,
                            {
                              label: "Success text",
                              value: M["successColor"] || "#16a34a",
                              onChange: (H) =>
                                nlsCommitDesign(h, a, M, {
                                  ["successColor"]: H,
                                }),
                            },
                            "successColor",
                          ),
                        ],
                      }),
                      e.jsx("h4", {
                        className: "nls-fb-h4",
                        children: "9. Borders & shadows",
                      }),
                      (() => {
                        const base = "fieldBorderRadius";
                        const val = nlsDevNum(M, base, nlsDevice, 6);
                        return e.jsxs("div", {
                          className: "nls-field",
                          children: [
                            e.jsxs("label", {
                              className: "nls-field__label nls-fb-range-label",
                              children: [
                                "Border radius",
                                e.jsxs("span", {
                                  children: [val, "px"],
                                }),
                              ],
                            }),
                            e.jsx(nlsRange, {
                              min: 0,
                              max: 100,
                              step: 1,
                              value: val,
                              onChange: (H) => {
                                const v = Number(H.target.value);
                                if (nlsDevice === "desktop") {
                                  nlsCommitDesign(h, a, M, {
                                    [base]: v,
                                  });
                                } else {
                                  nlsCommitDesign(h, a, M, {
                                    [nlsDevKey(base, nlsDevice)]: v,
                                  });
                                }
                              },
                            }),
                          ],
                        });
                      })(),
                      (() => {
                        const base = "fieldBorderWidth";
                        const val = nlsDevNum(M, base, nlsDevice, 1);
                        return e.jsxs("div", {
                          className: "nls-field",
                          children: [
                            e.jsxs("label", {
                              className: "nls-field__label nls-fb-range-label",
                              children: [
                                "Border width",
                                e.jsxs("span", {
                                  children: [val, "px"],
                                }),
                              ],
                            }),
                            e.jsx(nlsRange, {
                              min: 0,
                              max: 100,
                              step: 1,
                              value: val,
                              onChange: (H) => {
                                const v = Number(H.target.value);
                                if (nlsDevice === "desktop") {
                                  nlsCommitDesign(h, a, M, {
                                    [base]: v,
                                  });
                                } else {
                                  nlsCommitDesign(h, a, M, {
                                    [nlsDevKey(base, nlsDevice)]: v,
                                  });
                                }
                              },
                            }),
                          ],
                        });
                      })(),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Border style"],
                          }),
                          e.jsx("select", {
                            value: M["fieldBorderStyle"] || "solid",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["fieldBorderStyle"]: H.target.value,
                              }),
                            children: [
                              e.jsx("option", {
                                value: "solid",
                                children: "Solid",
                              }),
                              e.jsx("option", {
                                value: "dashed",
                                children: "Dashed",
                              }),
                              e.jsx("option", {
                                value: "dotted",
                                children: "Dotted",
                              }),
                              e.jsx("option", {
                                value: "double",
                                children: "Double",
                              }),
                              e.jsx("option", {
                                value: "none",
                                children: "None",
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "nls-fb-color-grid",
                        children: [
                          e.jsx(
                            FormColorField,
                            {
                              label: "Border color",
                              value: M["fieldBorderColor"] || "#cbd5e1",
                              onChange: (H) =>
                                nlsCommitDesign(h, a, M, {
                                  ["fieldBorderColor"]: H,
                                }),
                            },
                            "fieldBorderColor",
                          ),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Input box shadow"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: M["fieldShadow"] ?? "",
                            placeholder: "none or 0 2px 8px rgba(0,0,0,.08)",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["fieldShadow"]: H.target.value,
                              }),
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Form container shadow"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: M["formShadow"] ?? "",
                            placeholder: "0 2px 8px rgba(15,23,42,.07)",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["formShadow"]: H.target.value,
                              }),
                          }),
                        ],
                      }),
                      e.jsx("h4", {
                        className: "nls-fb-h4",
                        children: "10. Interactive states",
                      }),
                      e.jsx("div", {
                        className: "nls-fb-color-grid",
                        children: [
                          e.jsx(
                            FormColorField,
                            {
                              label: "Focus border",
                              value: M["focusBorderColor"] || "#7c3aed",
                              onChange: (H) =>
                                nlsCommitDesign(h, a, M, {
                                  ["focusBorderColor"]: H,
                                }),
                            },
                            "focusBorderColor",
                          ),
                          e.jsx(
                            FormColorField,
                            {
                              label: "Error border",
                              value: M["errorBorderColor"] || "#dc2626",
                              onChange: (H) =>
                                nlsCommitDesign(h, a, M, {
                                  ["errorBorderColor"]: H,
                                }),
                            },
                            "errorBorderColor",
                          ),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Focus shadow"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: M["focusShadow"] ?? "",
                            placeholder: "0 0 0 3px rgba(124,58,237,.25)",
                            onChange: (H) =>
                              nlsCommitDesign(h, a, M, {
                                ["focusShadow"]: H.target.value,
                              }),
                          }),
                        ],
                      }),
                      e.jsx("h4", {
                        className: "nls-fb-h4",
                        children: "11. Responsive",
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsxs("label", {
                            className: "nls-field__label nls-fb-range-label",
                            children: ["Auto-stack columns on small screens"],
                          }),
                          e.jsx("label", {
                            className: "nls-check",
                            children: [
                              e.jsx("input", {
                                type: "checkbox",
                                checked: M.autoStack !== false,
                                onChange: (H) =>
                                  nlsCommitDesign(h, a, M, {
                                    autoStack: !!H.target.checked,
                                  }),
                              }),
                              " Stack multi-column layouts to 1 column",
                            ],
                          }),
                        ],
                      }),
                      (() => {
                        const base = "stackBreakpoint";
                        const val = nlsDevNum(M, base, nlsDevice, 640);
                        return e.jsxs("div", {
                          className: "nls-field",
                          children: [
                            e.jsxs("label", {
                              className: "nls-field__label nls-fb-range-label",
                              children: [
                                "Stack breakpoint",
                                e.jsxs("span", {
                                  children: [val, "px"],
                                }),
                              ],
                            }),
                            e.jsx(nlsRange, {
                              min: 220,
                              max: 1200,
                              step: 1,
                              value: val,
                              onChange: (H) => {
                                const v = Number(H.target.value);
                                if (nlsDevice === "desktop") {
                                  nlsCommitDesign(h, a, M, {
                                    [base]: v,
                                  });
                                } else {
                                  nlsCommitDesign(h, a, M, {
                                    [nlsDevKey(base, nlsDevice)]: v,
                                  });
                                }
                              },
                            }),
                          ],
                        });
                      })(),
                    ],
                  }),
                i === "confirmations" &&
                  e.jsx("div", {
                    className: "nls-fb-panel",
                    children: e.jsx(FormBehaviorSettings, {
                      form: a,
                      onUpdate: (w) => h(a.id, w),
                    }),
                  }),
                i === "advanced" &&
                  e.jsxs("div", {
                    className: "nls-stack nls-stack--tight",
                    children: [
                      e.jsx("div", {
                        className: "nls-toggle-card",
                        children: e.jsxs("label", {
                          className: "nls-check",
                          children: [
                            e.jsx("input", {
                              type: "checkbox",
                              checked: a.published !== !1,
                              onChange: (w) =>
                                h(a.id, {
                                  published: w.target.checked,
                                }),
                            }),
                            e.jsxs("span", {
                              className: "min-w-0",
                              children: [
                                e.jsx("span", {
                                  className: "nls-toggle-card__title",
                                  children: "Show form on website",
                                }),
                                e.jsx("span", {
                                  className: "nls-toggle-card__hint",
                                  children:
                                    "Turn off to hide everywhere on the front (shortcodes, popups, widgets). The form stays in the builder for editing.",
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                      e.jsxs("label", {
                        className: "nls-field",
                        children: [
                          e.jsx("span", {
                            className: "nls-field__label",
                            children: "Submission notification email(s)",
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: a.notificationEmail || "",
                            onChange: (w) =>
                              h(a.id, {
                                notificationEmail: w.target.value,
                              }),
                            placeholder: "team@example.com, other@example.com",
                          }),
                          e.jsx("span", {
                            className: "nls-field__hint",
                            children: "Comma-separated. Submissions go here. If empty, the site admin email is used.",
                          }),
                        ],
                      }),
                      e.jsxs("label", {
                        className: "nls-field",
                        children: [
                          e.jsx("span", {
                            className: "nls-field__label",
                            children: "CRM / Webhook URL (this form)",
                          }),
                          e.jsx("input", {
                            type: "url",
                            value: a.crmWebhookUrl || "",
                            onChange: (w) =>
                              h(a.id, {
                                crmWebhookUrl: w.target.value,
                              }),
                            placeholder: "https://hooks.zapier.com/...",
                          }),
                          e.jsx("span", {
                            className: "nls-field__hint",
                            children:
                              "Optional. Per-form JSON webhook; set a global URL in Settings for all forms too.",
                          }),
                        ],
                      }),
                      e.jsxs("label", {
                        className: "nls-field",
                        children: [
                          e.jsx("span", {
                            className: "nls-field__label",
                            children: "Terms & Conditions Text",
                          }),
                          e.jsx("textarea", {
                            value: a.termsConditionText || "",
                            onChange: (w) =>
                              h(a.id, {
                                termsConditionText: w.target.value,
                              }),
                            rows: 2,
                            placeholder: "I agree to the terms and conditions",
                            className: "nls-fb-ta-sm",
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
export function FormBuilderPage() {
  var B, ee;
  const a =
      (ee = (B = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : B.formsPayload) == null
        ? void 0
        : ee.forms,
    [o, i] = b.useState(""),
    [d, u] = b.useState(Array.isArray(a) ? a.map(normalizeForm) : []),
    [p, h] = b.useState(null),
    [x, f] = b.useState(null),
    [S, y] = b.useState("fields"),
    [P, M] = b.useState(!1),
    [T, F] = b.useState(""),
    [V, z] = b.useState(!1),
    [U, w] = b.useState(null),
    [N, H] = b.useState(null),
    [W, I] = b.useState(!1),
    [C, J] = b.useState(!1),
    [j, le] = b.useState(null),
    ie = (_) => {
      const X = Jd(d);
      (u((L) => [...L, formFromTemplate(_, X)]), h(X), y("fields"), w(null), J(!1));
    };
  b.useEffect(() => {
    let _ = !0;
    return (
      I(!0),
      (async () => {
        var X, L;
        try {
          const A = await restFetch("/nexulesuite_/v1/forms"),
            k = (L = (X = A == null ? void 0 : A.data) == null ? void 0 : X.payload) == null ? void 0 : L.forms;
          _ && Array.isArray(k) && u(k.map(normalizeForm));
        } catch {
        } finally {
          _ && I(!1);
        }
      })(),
      () => {
        _ = !1;
      }
    );
  }, []);
  const O = b.useMemo(() => {
      const _ = o.trim().toLowerCase();
      return _ ? d.filter((X) => (X.name + " " + X.id).toLowerCase().includes(_)) : d;
    }, [d, o]),
    te = b.useMemo(() => (N && d.find((_) => _.id === N)) || null, [d, N]),
    pe = async (_ = d) => {
      (M(!0), F(""));
      try {
        (await restFetch("/nexulesuite_/v1/forms", {
          method: "POST",
          body: JSON.stringify({
            payload: {
              forms: _,
            },
          }),
        }),
          z(!0));
      } catch (X) {
        F((X == null ? void 0 : X.message) || "Save failed.");
      } finally {
        M(!1);
      }
    },
    me = async (_, X) => {
      const L = d.map((A) =>
        A.id === _
          ? {
              ...A,
              published: X,
            }
          : A,
      );
      (u(L), await pe(L));
    };
  return e.jsxs(PageFrame, {
    title: "Form Builder",
    subtitle: "Build multi-step forms and copy shortcodes",
    icon: e.jsx(im, {
      size: 18,
    }),
    headerRight: e.jsxs("div", {
      className: "nls-input-icon nls-fb-search",
      children: [
        e.jsx(Px, {
          "aria-hidden": "true",
        }),
        e.jsx("input", {
          value: o,
          onChange: (_) => i(_.target.value),
          placeholder: "Search...",
          "aria-label": "Search forms",
        }),
      ],
    }),
    footer: e.jsx(StickyFooter, {
      actions: e.jsxs("button", {
        type: "button",
        disabled: P,
        onClick: () => pe(),
        className: "nls-btn nls-btn--primary",
        children: [
          e.jsx(bn, {
            size: 16,
            "aria-hidden": "true",
          }),
          P ? "Saving…" : "Save",
        ],
      }),
    }),
    children: [
      e.jsx(SuccessModal, {
        open: V,
        onDismiss: () => z(!1),
      }),
      e.jsx(ErrorModal, {
        open: !!T,
        message: T,
        title: "Error!",
        onDismiss: () => F(""),
      }),
      e.jsxs("div", {
        className: "nls-stack nls-fb-page",
        children: [
          e.jsxs("div", {
            className: "nls-stack nls-stack--tight",
            children: [
              W &&
                e.jsxs("div", {
                  className: "nls-loading",
                  role: "status",
                  children: [
                    e.jsx("span", {
                      className: "nls-spinner",
                      "aria-hidden": "true",
                    }),
                    "Loading saved forms…",
                  ],
                }),
              e.jsx("ul", {
                className: "nls-stack nls-stack--tight nls-fb-list",
                children: O.map((_) =>
                  e.jsx(
                    FormCard,
                    {
                      form: {
                        ..._,
                        onSelectionChange: w,
                      },
                      expanded: p === _.id,
                      activeTab: S,
                      onToggle: () => h((X) => (X === _.id ? null : _.id)),
                      onPreview: (X) => H(X),
                      onDelete: (X) => {
                        (u((L) => L.filter((A) => A.id !== X)),
                          h((L) => (L === X ? null : L)),
                          w(null),
                          H((L) => (L === X ? null : L)));
                      },
                      onDuplicate: (X) => {
                        const L = d.find((k) => k.id === X);
                        if (!L) return;
                        const A = Jd(d);
                        (u((k) => [
                          ...k,
                          {
                            ...L,
                            id: A,
                            name: `${L.name} (Copy)`,
                          },
                        ]),
                          h(A),
                          w(null));
                      },
                      onUpdate: (X, L) =>
                        u((A) =>
                          A.map((k) =>
                            k.id === X
                              ? {
                                  ...k,
                                  ...L,
                                }
                              : k,
                          ),
                        ),
                      onImportForm: (X, L) => {
                        const A = normalizeForm({
                            ...L,
                            id: X,
                          }),
                          re = d.map((Y) => (Y.id === X ? A : Y));
                        (u(re), h(X), w(null), pe(re));
                      },
                      onApplyToAllForms: (X) => {
                        const re = d.map((Y) => nlsApplyStylingToForm(Y, X));
                        u(re);
                        pe(re);
                      },
                      onPublishPersist: me,
                      onTabChange: y,
                      copiedId: x,
                      onCopiedIdChange: f,
                    },
                    _.id,
                  ),
                ),
              }),
              O.length === 0 &&
                e.jsxs("div", {
                  className: "nls-empty",
                  children: [
                    e.jsx("div", {
                      className: "nls-empty__icon",
                      "aria-hidden": "true",
                      children: e.jsx(im, {
                        size: 22,
                      }),
                    }),
                    e.jsx("p", {
                      className: "nls-empty__title",
                      children: "No forms yet",
                    }),
                    e.jsx("p", {
                      className: "nls-empty__desc",
                      children: "Create your first form and save it.",
                    }),
                    e.jsx("div", {
                      className: "nls-empty__actions nls-fb-empty-actions",
                      children: e.jsxs("button", {
                        type: "button",
                        onClick: () => J(!0),
                        className: "nls-btn nls-btn--dashed nls-btn--block",
                        children: [
                          e.jsx(mm, {
                            size: 16,
                            "aria-hidden": "true",
                          }),
                          "Add Form / Template",
                        ],
                      }),
                    }),
                  ],
                }),
              O.length > 0
                ? e.jsxs("button", {
                    type: "button",
                    onClick: () => J(!0),
                    className: "nls-btn nls-btn--dashed nls-btn--block",
                    children: [
                      e.jsx(mm, {
                        size: 16,
                        "aria-hidden": "true",
                      }),
                      "Add Form / Template",
                    ],
                  })
                : null,
            ],
          }),
          U != null && U.field
            ? e.jsxs("aside", {
                className: "nls-stack nls-stack--tight nls-fb-aside",
                "aria-label": "Field Settings",
                children: [
                  e.jsx("div", {
                    className: "nls-card",
                    children: e.jsx("div", {
                      className: "nls-card__body",
                      children: e.jsx(FieldSettingsPanel, {
                        field: U.field,
                        onUpdate: (_, X) => {
                          U.updateSettings(X);
                        },
                        onClose: () => {
                          var _;
                          ((_ = U.clear) == null || _.call(U), w(null));
                        },
                      }),
                    }),
                  }),
                  e.jsx(ConditionalLogicEditor, {
                    field: U.field,
                    fields: U.fields || [],
                    onChange: (_) => {
                      U.updateSettings({
                        ...(U.field.settings || {}),
                        conditional: _,
                      });
                    },
                  }),
                ],
              })
            : null,
        ],
      }),
      e.jsx("div", {
        className: "nls-fb-preview-host",
        children: e.jsx(FormPreviewModal, {
          isOpen: !!N,
          onClose: () => H(null),
          form: te,
        }),
      }),
      e.jsx(AddFormModal, {
        open: C,
        onClose: () => J(!1),
        onSelect: ie,
        onPreview: (_) => le(formFromTemplate(_, "template-preview")),
      }),
      e.jsx("div", {
        className: "nls-fb-preview-host",
        children: e.jsx(FormPreviewModal, {
          isOpen: !!j,
          onClose: () => le(null),
          form: j,
        }),
      }),
    ],
  });
}
