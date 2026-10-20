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
  Mx,
  Oi,
  PageFrame,
  Pd,
  Px,
  Qe,
  StickyFooter,
  SuccessModal,
  TemplateCard,
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
  const o =
    {
      presets: "#eab308",
      style: "#8b5cf6",
      colors: "#3b82f6",
      fonts: "#f59e0b",
      layout: "#10b981",
      css: "#64748b",
      email: "#3b82f6",
      integrations: "#22c55e",
      visibility: "#eab308",
      markup: "#a855f7",
      legal: "#3b82f6",
      container: "#64748b",
      indicator: "#64748b",
      success: "#22c55e",
      error: "#ef4444",
      fields: "#eab308",
      input: "#3b82f6",
      button: "#8b5cf6",
      appearance: "#8b5cf6",
      behavior: "#3b82f6",
      notify: "#22c55e",
      settings: "#64748b",
    }[a] || "#2271b1";
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
    style: {
      color: o,
    },
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
    }, [d]);
  return a
    ? v.jsxs(v.Fragment, {
        children: [
          v.jsx("div", {
            className: "fixed inset-0 bg-black/50 z-40 transition-opacity",
            onClick: o,
          }),
          v.jsxs("div", {
            className:
              "nexulesuite_field-picker-modal fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-2xl w-[90vw] max-w-4xl max-h-[85vh] flex flex-col",
            children: [
              v.jsxs("div", {
                className: "flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white",
                children: [
                  v.jsxs("div", {
                    children: [
                      v.jsx("h2", {
                        className: "text-xl font-bold text-gray-900",
                        children: "Insert Form Fields",
                      }),
                      v.jsx("p", {
                        className: "text-xs text-gray-500 mt-0.5",
                        children: "Select a field type to add to your form",
                      }),
                    ],
                  }),
                  v.jsx("button", {
                    onClick: o,
                    className: "p-1.5 hover:bg-gray-100 rounded-lg transition-colors",
                    "aria-label": "Close modal",
                    children: v.jsx(qa, {
                      size: 20,
                      className: "text-gray-600",
                    }),
                  }),
                ],
              }),
              v.jsx("div", {
                className: "px-6 py-4 border-b border-gray-200 bg-white",
                children: v.jsxs("div", {
                  className: "relative",
                  children: [
                    v.jsx(Px, {
                      className:
                        "nexulesuite_field-picker-search-icon absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10",
                      size: 18,
                    }),
                    v.jsx("input", {
                      type: "text",
                      placeholder: "Search fields by name...",
                      value: d,
                      onChange: (h) => u(h.target.value),
                      autoFocus: !0,
                      className:
                        "nexulesuite_field-picker-search-input w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm",
                    }),
                  ],
                }),
              }),
              v.jsx("div", {
                className: "flex-1 overflow-auto p-6",
                children:
                  p.length === 0
                    ? v.jsxs("div", {
                        className: "flex flex-col items-center justify-center h-full text-center",
                        children: [
                          v.jsx("p", {
                            className: "text-gray-500 text-lg",
                            children: "No fields found",
                          }),
                          v.jsx("p", {
                            className: "text-gray-400 text-sm mt-2",
                            children: "Try adjusting your search",
                          }),
                        ],
                      })
                    : (() => {
                        const fields = p.filter((h) => (h.row || 0) !== 0);
                        const layouts = p.filter((h) => (h.row || 0) === 0);
                        return v.jsxs("div", {
                          className: "nexulesuite_fui-picker space-y-5",
                          children: [
                            v.jsx("div", {
                              className: "grid grid-cols-3 gap-3",
                              children: fields.map((h) =>
                                v.jsxs(
                                  "button",
                                  {
                                    type: "button",
                                    onClick: () => {
                                      (i(h), o());
                                    },
                                    className:
                                      "nexulesuite_fui-picker__item p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group flex flex-col items-center text-center min-h-[96px]",
                                    children: [
                                      v.jsx("div", {
                                        className:
                                          "nexulesuite_field-picker-icon mb-2 text-slate-600 group-hover:scale-110 transition-transform",
                                        children: h.icon,
                                      }),
                                      v.jsx("h3", {
                                        className: "font-semibold text-gray-900 text-xs leading-tight",
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
                                  className: "grid grid-cols-3 gap-3",
                                  children: layouts.map((h) =>
                                    v.jsxs(
                                      "button",
                                      {
                                        type: "button",
                                        onClick: () => {
                                          (i(h), o());
                                        },
                                        className:
                                          "nexulesuite_fui-picker__item p-3 border border-dashed border-gray-200 rounded-lg hover:border-blue-400 hover:bg-slate-50 flex flex-col items-center text-center min-h-[96px]",
                                        children: [
                                          v.jsx("div", {
                                            className: "mb-2 text-slate-500",
                                            children: h.icon,
                                          }),
                                          v.jsx("h3", {
                                            className: "font-semibold text-gray-800 text-xs",
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
      () =>
        U && (i === "top" || i === "bottom" || i === "left" || i === "right") ? "ring-2 ring-blue-400 ring-inset" : "",
      [U, i],
    );
  return v.jsxs("div", {
    className: "relative group",
    children: [
      v.jsx("button", {
        type: "button",
        onClick: u,
        className:
          "absolute -top-2.5 -right-2.5 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-10",
        "aria-label": "Remove field",
        children: v.jsx(qa, {
          size: 18,
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
        className: [
          "flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-400 hover:shadow-lg transition-all group-hover:bg-blue-50 cursor-pointer",
          w,
        ].join(" "),
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
            className: "text-gray-400 mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing",
            "aria-label": "Drag to move",
            title: "Drag to move",
            children: v.jsx(Tx, {
              size: 20,
            }),
          }),
          v.jsx("div", {
            className: "flex-1 min-w-0",
            children: v.jsxs("div", {
              className: "flex items-start gap-3",
              children: [
                v.jsx("div", {
                  className: "p-2 rounded-lg flex-shrink-0 mt-0.5",
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
                  className: "flex-1",
                  children: [
                    v.jsx("h3", {
                      className: "font-semibold text-sm",
                      style: {
                        color: ((M = a == null ? void 0 : a.settings) == null ? void 0 : M.textColor) || "#000000",
                      },
                      children:
                        ((T = a == null ? void 0 : a.settings) == null ? void 0 : T.label) ||
                        ((F = a == null ? void 0 : a.module) == null ? void 0 : F.name),
                    }),
                    ((V = a == null ? void 0 : a.settings) == null ? void 0 : V.helpText) &&
                      v.jsx("p", {
                        className: "text-xs text-gray-600 mt-1",
                        children: a.settings.helpText,
                      }),
                    v.jsxs("div", {
                      className: "flex items-center gap-2 mt-2 text-xs text-gray-500",
                      children: [
                        v.jsxs("span", {
                          children: ["Width: ", (a == null ? void 0 : a.columnSpan) || 1, "/4"],
                        }),
                        ((z = a == null ? void 0 : a.settings) == null ? void 0 : z.required) &&
                          v.jsx("span", {
                            className: "text-red-600 font-semibold",
                            children: "Required",
                          }),
                        (a == null ? void 0 : a.settings) != null &&
                        a.settings.conditional &&
                        a.settings.conditional.enabled &&
                        Array.isArray(a.settings.conditional.rules) &&
                        a.settings.conditional.rules.length
                          ? v.jsxs("span", {
                              className: "inline-flex items-center gap-1 font-semibold text-violet-600",
                              children: [
                                v.jsx(Ex, {
                                  size: 12,
                                  className: "rotate-90",
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
    className: "rounded-xl border border-slate-200 bg-white p-4",
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
  return v.jsx("div", {
    className: "bg-white rounded-lg border border-gray-200 shadow-sm",
    children: v.jsxs("div", {
      className: "p-6 sm:p-8",
      children: [
        v.jsx("h2", {
          className: "text-lg font-semibold text-gray-900 mb-6",
          children: "Form Fields",
        }),
        p.length === 0
          ? v.jsxs("div", {
              className: "py-10",
              children: [
                v.jsxs("div", {
                  className: "text-center",
                  children: [
                    v.jsx("div", {
                      className:
                        "mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500",
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
                      className: "text-xs text-slate-500",
                      children: "You haven't added any fields yet. Add form fields to get started.",
                    }),
                  ],
                }),
                v.jsxs("button", {
                  type: "button",
                  onClick: () => d(null),
                  className:
                    "mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-4 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-50",
                  children: [
                    v.jsx("span", {
                      className: "text-slate-500",
                      children: "+",
                    }),
                    v.jsx("span", {
                      children: "Insert Form Fields",
                    }),
                  ],
                }),
              ],
            })
          : v.jsxs("div", {
              className: "space-y-4",
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
                  className:
                    "mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-50",
                  children: [
                    v.jsx("span", {
                      className: "text-slate-500",
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
    }),
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
          className: "flex flex-wrap items-center gap-2 mb-4",
          children: [
            v.jsx("div", {
              className: "flex flex-wrap items-center gap-2",
              children: T.map((I, C) =>
                v.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => M(I.id),
                    className: [
                      "rounded-lg px-3 py-2 text-xs font-semibold border transition-colors",
                      P === I.id
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
                    ].join(" "),
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
              className:
                "ml-auto inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700",
              children: [
                v.jsx(Ax, {
                  size: 16,
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
    className: "space-y-6",
    children: [
      v.jsxs("div", {
        className: "flex items-center justify-between",
        children: [
          v.jsxs("div", {
            className: "min-w-0",
            children: [
              v.jsx("p", {
                className: "text-sm font-semibold text-slate-800",
                children: "Field Settings",
              }),
              v.jsx("p", {
                className: "mt-0.5 text-xs text-slate-400 truncate",
                children: ((d = a == null ? void 0 : a.module) == null ? void 0 : d.name) || "Field",
              }),
            ],
          }),
          v.jsx("button", {
            type: "button",
            onClick: i,
            className:
              "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700",
            "aria-label": "Close field settings",
            children: v.jsx(qa, {
              className: "h-4 w-4",
            }),
          }),
        ],
      }),
      v.jsxs("div", {
        className: "rounded-xl border border-slate-200 bg-white",
        children: [
          v.jsx("div", {
            className: "border-b border-slate-200 px-4 py-3",
            children: v.jsx("p", {
              className: "text-sm font-semibold text-slate-800",
              children: "Field Labels",
            }),
          }),
          v.jsxs("div", {
            className: "p-4 space-y-4",
            children: [
              v.jsxs("div", {
                children: [
                  v.jsx("label", {
                    className: "mb-1.5 block text-sm font-semibold text-slate-700",
                    children: "Field Label",
                  }),
                  v.jsx("input", {
                    type: "text",
                    value: j.label || "",
                    onChange: (B) => C("label", B.target.value),
                    className:
                      "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                    placeholder: "Field label",
                  }),
                  v.jsxs("label", {
                    className: "mt-3 flex items-center gap-2 text-sm text-slate-700",
                    children: [
                      v.jsx("input", {
                        type: "checkbox",
                        checked: j.showLabel !== !1,
                        onChange: (B) => C("showLabel", B.target.checked),
                        className: "h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-200",
                      }),
                      "Show label",
                    ],
                  }),
                ],
              }),
              v.jsxs("div", {
                children: [
                  v.jsx("label", {
                    className: "mb-1.5 block text-sm font-semibold text-slate-700",
                    children: "Placeholder",
                  }),
                  v.jsx("input", {
                    type: "text",
                    value: j.placeholder || "",
                    onChange: (B) => C("placeholder", B.target.value),
                    className:
                      "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                    placeholder: "Placeholder text",
                  }),
                ],
              }),
              v.jsxs("div", {
                children: [
                  v.jsx("label", {
                    className: "mb-1.5 block text-sm font-semibold text-slate-700",
                    children: "Help Text",
                  }),
                  v.jsx("textarea", {
                    value: j.helpText || "",
                    onChange: (B) => C("helpText", B.target.value),
                    className:
                      "w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-violet-200 focus:ring-2",
                    rows: 2,
                    placeholder: "Help text for users",
                  }),
                ],
              }),
              v.jsxs("label", {
                className: "flex items-center gap-2 text-sm text-slate-700",
                children: [
                  v.jsx("input", {
                    type: "checkbox",
                    checked: !!j.required,
                    onChange: (B) => C("required", B.target.checked),
                    className: "h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-200",
                  }),
                  "Required",
                ],
              }),
            ],
          }),
        ],
      }),
      (u === "radio" || u === "checkbox" || u === "dropdown") &&
        v.jsxs("div", {
          className: "space-y-4 rounded-xl border border-slate-200 bg-white p-4",
          children: [
            v.jsxs("div", {
              className: "flex items-center justify-between gap-3",
              children: [
                v.jsx("p", {
                  className: "text-sm font-semibold text-slate-800",
                  children: "Options",
                }),
                (u === "radio" || u === "checkbox") &&
                  v.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      v.jsx("span", {
                        className: "text-xs font-semibold text-slate-400",
                        children: "Layout",
                      }),
                      v.jsxs("select", {
                        value: j.optionLayout || "vertical",
                        onChange: (B) => C("optionLayout", B.target.value),
                        className: "h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none",
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
              className: "space-y-3",
              children: te.map((B, ee) =>
                v.jsxs(
                  "div",
                  {
                    className: "flex items-end gap-2",
                    children: [
                      v.jsxs("div", {
                        className: "grid grid-cols-2 gap-3 min-w-0 flex-1",
                        children: [
                          v.jsxs("div", {
                            children: [
                              v.jsx("label", {
                                className: "mb-1 block text-xs font-semibold text-slate-400",
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
                                className:
                                  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none",
                              }),
                            ],
                          }),
                          v.jsxs("div", {
                            children: [
                              v.jsx("label", {
                                className: "mb-1 block text-xs font-semibold text-slate-400",
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
                                className:
                                  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none font-mono",
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
                        className:
                          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:pointer-events-none disabled:opacity-40",
                        children: v.jsx(yt, {
                          size: 16,
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
              className:
                "mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700",
              children: "+ Add Option",
            }),
          ],
        }),
      u === "address" &&
        v.jsxs("div", {
          className: "rounded-xl border border-slate-200 bg-white",
          children: [
            v.jsx("div", {
              className: "border-b border-slate-200 px-4 py-3",
              children: v.jsx("p", {
                className: "text-sm font-semibold text-slate-800",
                children: "Customize Address Field",
              }),
            }),
            v.jsx("div", {
              className: "divide-y divide-slate-200",
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
                    className: "px-4 py-3",
                    children: [
                      v.jsxs("div", {
                        className: "flex items-center justify-between gap-3",
                        children: [
                          v.jsxs("label", {
                            className: "flex items-center gap-3 text-sm font-semibold text-slate-700",
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
                                className: "h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-200",
                              }),
                              v.jsx("span", {
                                children: ee,
                              }),
                            ],
                          }),
                          v.jsx("span", {
                            className: "text-slate-400",
                            children: "▾",
                          }),
                        ],
                      }),
                      v.jsx("div", {
                        className: "mt-3",
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
                          className: [
                            "h-10 w-full rounded-lg border px-3 text-sm outline-none",
                            _.enabled
                              ? "border-slate-200 bg-white ring-violet-200 focus:ring-2"
                              : "border-slate-100 bg-slate-50 text-slate-400",
                          ].join(" "),
                          placeholder: ee,
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
        v.jsxs("div", {
          className: "rounded-xl border border-slate-200 bg-white",
          children: [
            v.jsx("div", {
              className: "border-b border-slate-200 px-4 py-3",
              children: v.jsx("p", {
                className: "text-sm font-semibold text-slate-800",
                children: "Customize Consent Field",
              }),
            }),
            v.jsxs("div", {
              className: "p-4 space-y-4",
              children: [
                v.jsxs("div", {
                  children: [
                    v.jsx("label", {
                      className: "mb-1.5 block text-sm font-semibold text-slate-700",
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
                      className:
                        "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                      placeholder: "Terms & Condition",
                    }),
                  ],
                }),
                v.jsxs("div", {
                  className: "rounded-xl border border-slate-200 overflow-hidden",
                  children: [
                    v.jsxs("div", {
                      className: "flex items-center justify-between border-b border-slate-200 bg-white",
                      children: [
                        v.jsx("div", {
                          className: "flex",
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
                                className: [
                                  "px-4 py-2 text-sm font-semibold",
                                  (le.mode || "visual") === B
                                    ? "text-slate-800 bg-slate-50"
                                    : "text-slate-400 hover:text-slate-700",
                                ].join(" "),
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
                          className: "px-4 py-2 text-sm font-semibold text-sky-600 hover:text-sky-700",
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
                          className: "w-full min-h-40 resize-none bg-white px-4 py-3 font-mono text-sm outline-none",
                          placeholder: "Yes, I agree with the privacy policy...",
                        })
                      : v.jsxs("div", {
                          className: "border-t border-slate-200 bg-white",
                          children: [
                            v.jsxs("div", {
                              className:
                                "flex items-center gap-2 px-4 py-2 border-b border-slate-200 text-slate-500 text-sm",
                              children: [
                                v.jsx("button", {
                                  type: "button",
                                  onClick: () =>
                                    C("consent", {
                                      ...le,
                                      html: `<strong>${le.html || ""}</strong>`,
                                    }),
                                  className: "px-2 py-1 rounded hover:bg-slate-50 font-semibold",
                                  children: "B",
                                }),
                                v.jsx("button", {
                                  type: "button",
                                  onClick: () =>
                                    C("consent", {
                                      ...le,
                                      html: `<em>${le.html || ""}</em>`,
                                    }),
                                  className: "px-2 py-1 rounded hover:bg-slate-50 italic",
                                  children: "I",
                                }),
                                v.jsx("button", {
                                  type: "button",
                                  onClick: () =>
                                    C("consent", {
                                      ...le,
                                      html: `<a href="#" target="_blank" rel="noopener noreferrer">${le.html || "link"}</a>`,
                                    }),
                                  className: "px-2 py-1 rounded hover:bg-slate-50",
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
                              className: "w-full min-h-40 resize-none bg-white px-4 py-3 text-sm outline-none",
                              placeholder: "Yes, I agree with the privacy policy...",
                            }),
                          ],
                        }),
                  ],
                }),
                v.jsx("p", {
                  className: "text-xs text-slate-400",
                  children: "Describe what your users should consent to.",
                }),
              ],
            }),
          ],
        }),
      ,
      u === "recaptcha" &&
        v.jsxs("div", {
          className: "rounded-xl border border-slate-200 bg-white p-4",
          children: [
            v.jsx("p", {
              className: "text-sm font-semibold text-slate-800",
              children: "Google reCAPTCHA",
            }),
            v.jsx("p", {
              className: "mt-1 text-xs text-slate-400",
              children:
                "Use reCAPTCHA v2 (checkbox) or v3 (invisible score). Keys must match the type you select in Google Admin.",
            }),
            v.jsxs("div", {
              className: "mt-4 space-y-4",
              children: [
                v.jsxs("div", {
                  children: [
                    v.jsx("label", {
                      className: "mb-1.5 block text-sm font-semibold text-slate-700",
                      children: "API version",
                    }),
                    v.jsxs("select", {
                      value: N,
                      onChange: (B) => H(B.target.value),
                      className:
                        "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
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
                  ? v.jsxs("div", {
                      children: [
                        v.jsx("label", {
                          className: "mb-1.5 block text-sm font-semibold text-slate-700",
                          children: "Minimum score (0–1)",
                        }),
                        v.jsx("input", {
                          type: "number",
                          min: "0",
                          max: "1",
                          step: "0.05",
                          value: W,
                          onChange: (B) => I(B.target.value),
                          className:
                            "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                        }),
                        v.jsx("p", {
                          className: "mt-1 text-xs text-slate-400",
                          children: "Higher = stricter (typical: 0.5; try 0.7 to block more bots).",
                        }),
                      ],
                    })
                  : null,
                v.jsxs("div", {
                  children: [
                    v.jsx("label", {
                      className: "mb-1.5 block text-sm font-semibold text-slate-700",
                      children: "Site Key",
                    }),
                    v.jsx("input", {
                      type: "text",
                      value: T,
                      onChange: (B) => F(B.target.value),
                      className:
                        "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                      placeholder: "Enter your site key here",
                    }),
                  ],
                }),
                v.jsxs("div", {
                  children: [
                    v.jsx("label", {
                      className: "mb-1.5 block text-sm font-semibold text-slate-700",
                      children: "Secret Key",
                    }),
                    v.jsx("input", {
                      type: "password",
                      value: V,
                      onChange: (B) => z(B.target.value),
                      className:
                        "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                      placeholder: "Enter your secret key here",
                    }),
                    U
                      ? v.jsxs("p", {
                          className: "mt-1 text-xs text-slate-400",
                          children: ["Saved secret: ", U],
                        })
                      : null,
                  ],
                }),
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
                  className:
                    "nexulesuite_fp-save-btn rounded-lg px-4 py-2 text-sm font-semibold" + (x ? " is-loading" : ""),
                  children: x ? "Saving…" : "Save Keys",
                }),
                S
                  ? v.jsx("p", {
                      className: "text-xs font-semibold text-rose-600",
                      children: S,
                    })
                  : null,
                P
                  ? v.jsx("p", {
                      className: "text-xs font-semibold text-emerald-600",
                      children: P,
                    })
                  : null,
              ],
            }),
            v.jsxs("div", {
              className: "mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4",
              children: [
                v.jsx("p", {
                  className: "text-xs font-semibold text-slate-500",
                  children: "reCAPTCHA Preview",
                }),
                v.jsx("p", {
                  className: "mt-1 text-xs text-slate-400",
                  children: "Preview is shown on the frontend using your saved Site Key (v2 Checkbox).",
                }),
              ],
            }),
          ],
        }),
      u === "cloudflare" &&
        v.jsxs("div", {
          className: "rounded-xl border border-slate-200 bg-white p-4",
          children: [
            v.jsx("p", {
              className: "text-sm font-semibold text-slate-800",
              children: "Turnstile API Keys",
            }),
            v.jsx("p", {
              className: "mt-1 text-xs text-slate-400",
              children:
                "Enter your Turnstile API keys below to enable Cloudflare Turnstile option in your form’s CAPTCHA field.",
            }),
            v.jsxs("div", {
              className: "mt-4 space-y-4",
              children: [
                v.jsxs("div", {
                  children: [
                    v.jsx("label", {
                      className: "mb-1.5 block text-sm font-semibold text-slate-700",
                      children: "Site Key",
                    }),
                    v.jsx("input", {
                      type: "text",
                      value: T,
                      onChange: (B) => F(B.target.value),
                      className:
                        "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                      placeholder: "Enter your site key here",
                    }),
                  ],
                }),
                v.jsxs("div", {
                  children: [
                    v.jsx("label", {
                      className: "mb-1.5 block text-sm font-semibold text-slate-700",
                      children: "Secret Key",
                    }),
                    v.jsx("input", {
                      type: "password",
                      value: V,
                      onChange: (B) => z(B.target.value),
                      className:
                        "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                      placeholder: "Enter your secret key here",
                    }),
                    U
                      ? v.jsxs("p", {
                          className: "mt-1 text-xs text-slate-400",
                          children: ["Saved secret: ", U],
                        })
                      : null,
                  ],
                }),
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
                  className:
                    "nexulesuite_fp-save-btn rounded-lg px-4 py-2 text-sm font-semibold" + (x ? " is-loading" : ""),
                  children: x ? "Saving…" : "Save Keys",
                }),
                S
                  ? v.jsx("p", {
                      className: "text-xs font-semibold text-rose-600",
                      children: S,
                    })
                  : null,
                P
                  ? v.jsx("p", {
                      className: "text-xs font-semibold text-emerald-600",
                      children: P,
                    })
                  : null,
              ],
            }),
            v.jsxs("div", {
              className: "mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4",
              children: [
                v.jsx("p", {
                  className: "text-xs font-semibold text-slate-500",
                  children: "Turnstile widget preview",
                }),
                v.jsx("p", {
                  className: "mt-1 text-xs text-slate-400",
                  children: "Widget renders on the frontend using your saved Site Key.",
                }),
              ],
            }),
          ],
        }),
      u === "name" &&
        v.jsxs("div", {
          className: "rounded-xl border border-slate-200 bg-slate-50/40",
          children: [
            v.jsxs("div", {
              className: "border-b border-slate-200 bg-white px-4 py-3",
              children: [
                v.jsx("p", {
                  className: "text-sm font-semibold text-slate-800",
                  children: "Customize Name Field",
                }),
                v.jsx("p", {
                  className: "mt-0.5 text-xs text-slate-400",
                  children: "Field Labels",
                }),
              ],
            }),
            v.jsx("div", {
              className: "space-y-4 p-4",
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
                    className: "grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3",
                    children: [
                      v.jsxs("div", {
                        className: "flex items-center justify-between",
                        children: [
                          v.jsx("p", {
                            className: "text-sm font-semibold text-slate-700",
                            children: ee,
                          }),
                          v.jsxs("label", {
                            className: "flex items-center gap-2 text-sm text-slate-700",
                            children: [
                              v.jsx("input", {
                                type: "checkbox",
                                checked: !!X.enabled,
                                onChange: (L) =>
                                  O(B, {
                                    enabled: L.target.checked,
                                  }),
                                className: "h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-200",
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
                        className: [
                          "h-10 w-full rounded-lg border px-3 text-sm outline-none",
                          X.enabled
                            ? "border-slate-200 bg-white ring-violet-200 focus:ring-2"
                            : "border-slate-100 bg-slate-50 text-slate-400",
                        ].join(" "),
                        placeholder: ee,
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
        v.jsxs("div", {
          className: "rounded-xl border border-slate-200 bg-white p-4",
          children: [
            v.jsx("p", {
              className: "text-sm font-semibold text-slate-800",
              children: "Validation",
            }),
            v.jsx("p", {
              className: "mt-1 text-xs text-slate-400",
              children:
                "Make sure the users fill this field as per the selected validation and warn them when they haven't",
            }),
            v.jsxs("div", {
              className: "mt-4",
              children: [
                v.jsx("p", {
                  className: "mb-2 text-xs font-semibold text-slate-400",
                  children: "Type",
                }),
                v.jsx("div", {
                  className: "inline-flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50",
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
                        className: [
                          "px-4 py-2 text-xs font-semibold transition-colors",
                          _ ? "bg-sky-100 text-sky-700" : "bg-white text-slate-500 hover:bg-slate-50",
                        ].join(" "),
                        children: ee,
                      },
                      B,
                    );
                  }),
                }),
              ],
            }),
            pe.type === "character_limit" &&
              v.jsxs("div", {
                className: "mt-4",
                children: [
                  v.jsx("label", {
                    className: "mb-1.5 block text-sm font-semibold text-slate-700",
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
                    className:
                      "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                    placeholder: "e.g. 11",
                  }),
                  v.jsx("p", {
                    className: "mt-1 text-xs text-slate-400",
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
    className: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
    children: [
      e.jsxs("button", {
        type: "button",
        onClick: () => S(!d.enabled),
        "aria-pressed": d.enabled,
        className:
          "flex w-full items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50",
        children: [
          e.jsxs("span", {
            className: "flex items-center gap-2",
            children: [
              e.jsx("span", {
                className: "flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-violet-50 text-violet-600",
                children: e.jsx(ji, {
                  size: 15,
                }),
              }),
              e.jsxs("span", {
                className: "block",
                children: [
                  e.jsx("span", {
                    className: "block text-sm font-semibold text-slate-800",
                    children: "Conditional Logic",
                  }),
                  e.jsx("span", {
                    className: "block text-xs text-slate-400",
                    children: "Show or hide this field based on other answers.",
                  }),
                ],
              }),
            ],
          }),
          e.jsx("span", {
            role: "switch",
            "aria-checked": d.enabled,
            className: `relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors ${d.enabled ? "bg-violet-600" : "bg-slate-300"}`,
            children: e.jsx("span", {
              className: `inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${d.enabled ? "translate-x-[22px]" : "translate-x-0.5"}`,
            }),
          }),
        ],
      }),
      d.enabled &&
        e.jsx("div", {
          className: "space-y-4 p-4",
          children:
            u.length === 0
              ? e.jsx("p", {
                  className:
                    "rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-center text-xs text-slate-500",
                  children: "Add at least one more field to this step to build a condition.",
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsxs("div", {
                      className: "flex flex-wrap items-center gap-2 text-sm text-slate-700",
                      children: [
                        e.jsxs("select", {
                          value: d.action,
                          onChange: (P) =>
                            p({
                              action: P.target.value,
                            }),
                          className:
                            "h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold outline-none ring-violet-200 focus:ring-2",
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
                          className:
                            "h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold outline-none ring-violet-200 focus:ring-2",
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
                      className: "space-y-2",
                      children: d.rules.map((P, M) => {
                        const T = u.find((z) => z.id === P.field),
                          F = T && T.options && T.options.length > 0,
                          V = !Jx.has(P.operator);
                        return e.jsxs(
                          "div",
                          {
                            className:
                              "grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-2 sm:grid-cols-[1fr_auto]",
                            children: [
                              e.jsxs("div", {
                                className: "grid grid-cols-1 gap-2 sm:grid-cols-3",
                                children: [
                                  e.jsxs("select", {
                                    value: P.field,
                                    onChange: (z) =>
                                      h(M, {
                                        field: z.target.value,
                                      }),
                                    className:
                                      "h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none ring-violet-200 focus:ring-2",
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
                                    className:
                                      "h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none ring-violet-200 focus:ring-2",
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
                                          className:
                                            "h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none ring-violet-200 focus:ring-2",
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
                                          className:
                                            "h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none ring-violet-200 focus:ring-2",
                                        })
                                    : e.jsx("span", {
                                        className: "flex h-9 items-center px-2 text-xs italic text-slate-400",
                                        children: "no value needed",
                                      }),
                                ],
                              }),
                              e.jsx("button", {
                                type: "button",
                                onClick: () => f(M),
                                className:
                                  "inline-flex h-9 w-9 items-center justify-center justify-self-end rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600",
                                title: "Remove condition",
                                "aria-label": "Remove condition",
                                children: e.jsx(yt, {
                                  size: 15,
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
                      className:
                        "inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-violet-300 hover:text-violet-700",
                      children: [
                        e.jsx(dt, {
                          size: 14,
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
        className:
          "rounded-lg border border-dashed border-slate-200 bg-white px-3 py-3 text-center text-xs text-slate-500",
        children: "Add fields to the form to build conditions.",
      })
    : e.jsxs("div", {
        className: "space-y-2",
        children: [
          e.jsxs("div", {
            className: "flex flex-wrap items-center gap-2 text-xs text-slate-600",
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
                className: "h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold",
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
                className: "grid grid-cols-[1fr_auto] gap-2 rounded-xl border border-slate-200 bg-white p-2",
                children: [
                  e.jsxs("div", {
                    className: "grid grid-cols-1 gap-2 sm:grid-cols-3",
                    children: [
                      e.jsxs("select", {
                        value: f.field,
                        onChange: (T) =>
                          p(S, {
                            field: T.target.value,
                          }),
                        className: "h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs",
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
                        className: "h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs",
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
                              className: "h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs",
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
                              className: "h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs",
                            })
                        : e.jsx("span", {
                            className: "flex h-8 items-center px-2 text-[11px] italic text-slate-400",
                            children: "no value",
                          }),
                    ],
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => x(S),
                    className:
                      "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600",
                    title: "Remove condition",
                    "aria-label": "Remove condition",
                    children: e.jsx(yt, {
                      size: 14,
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
            className:
              "inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-violet-300 hover:text-violet-700",
            children: [
              e.jsx(dt, {
                size: 14,
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
    className: "space-y-6",
    children: [
      e.jsxs("section", {
        className: "nexulesuite_fb-section is-first",
        children: [
          e.jsxs("div", {
            className: "nexulesuite_fb-sec-head",
            children: [
              e.jsx("span", {
                className: "nexulesuite_fb-sec-ico",
                children: e.jsx(Xn, {
                  size: 16,
                }),
              }),
              e.jsx("span", {
                className: "nexulesuite_fb-sec-title",
                children: "Submission Behavior",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "nexulesuite_fui-method",
            style: {
              marginBottom: "8px",
            },
            children: [
              e.jsx("p", {
                className: "lbl",
                style: {
                  fontWeight: 500,
                  marginBottom: "4px",
                },
                children: "Method",
              }),
              e.jsxs("div", {
                style: {
                  display: "flex",
                  gap: "8px",
                },
                children: [
                  e.jsx("button", {
                    type: "button",
                    className: "button" + (a.submissionMethod !== "reload" ? " button-primary" : ""),
                    onClick: () =>
                      o({
                        submissionMethod: "ajax",
                      }),
                    children: "Ajax",
                  }),
                  e.jsx("button", {
                    type: "button",
                    className: "button" + (a.submissionMethod === "reload" ? " button-primary" : ""),
                    onClick: () =>
                      o({
                        submissionMethod: "reload",
                      }),
                    children: "Page Reload",
                  }),
                ],
              }),
              e.jsx("p", {
                className: "hint",
                style: {
                  marginTop: "6px",
                },
                children: "Ajax submits without reloading the page (recommended).",
              }),
            ],
          }),
          e.jsx("p", {
            className: "lbl",
            style: {
              fontWeight: 500,
              marginBottom: "4px",
            },
            children: "After submission",
          }),
          e.jsx("p", {
            className: "hint",
            style: {
              marginTop: "-2px",
              marginBottom: "12px",
            },
            children:
              "After a submit, the first confirmation whose conditions match (top to bottom) is used. If none match, the default is shown.",
          }),
          e.jsx("div", {
            className: "space-y-3",
            children: d.map((F) =>
              e.jsxs(
                "div",
                {
                  className: "overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 shadow-sm",
                  children: [
                    e.jsxs("div", {
                      className: "flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2",
                      children: [
                        F.isDefault
                          ? e.jsx("span", {
                              className:
                                "rounded-md bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700",
                              children: "Default",
                            })
                          : e.jsxs("span", {
                              className: "flex flex-col leading-none text-slate-400",
                              children: [
                                e.jsx("button", {
                                  type: "button",
                                  onClick: () => S(F.id, -1),
                                  className: "px-1 hover:text-slate-700",
                                  title: "Move up",
                                  "aria-label": "Move up",
                                  children: "▲",
                                }),
                                e.jsx("button", {
                                  type: "button",
                                  onClick: () => S(F.id, 1),
                                  className: "px-1 hover:text-slate-700",
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
                          className:
                            "min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-sm font-semibold text-slate-800 hover:border-slate-200 focus:border-slate-300 focus:bg-white focus:outline-none",
                        }),
                        e.jsxs("select", {
                          value: F.type,
                          onChange: (V) =>
                            h(F.id, {
                              type: V.target.value,
                            }),
                          className:
                            "h-8 flex-none rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold",
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
                            className:
                              "inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600",
                            title: "Delete confirmation",
                            "aria-label": "Delete confirmation",
                            children: e.jsx(yt, {
                              size: 15,
                            }),
                          }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "space-y-3 p-3",
                      children: [
                        F.type === "redirect"
                          ? e.jsxs("label", {
                              className: "block",
                              children: [
                                e.jsx("span", {
                                  className: "mb-1 block text-xs font-semibold text-slate-600",
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
                                  className: "h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm",
                                }),
                                e.jsx("span", {
                                  className: "mt-1 block text-[11px] text-slate-400",
                                  children:
                                    "Visitor is sent here after submit — a page URL on your site or any external URL.",
                                }),
                              ],
                            })
                          : e.jsxs("div", {
                              className: "block",
                              children: [
                                e.jsx("span", {
                                  className: "mb-1.5 block text-xs font-semibold text-slate-600",
                                  children: "Success message",
                                }),
                                (function () {
                                  const msg = (F.message || "").trim(),
                                    isShort = msg === nlsSuccessMsgShort,
                                    isDefault = !msg || msg === nlsSuccessMsgDefault;
                                  return e.jsxs("div", {
                                    className: "mb-2 space-y-1.5",
                                    role: "radiogroup",
                                    "aria-label": "Success message",
                                    children: [
                                      e.jsxs("label", {
                                        className:
                                          "flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2 text-[11px] leading-snug " +
                                          (isDefault
                                            ? "border-violet-400 bg-violet-50 text-slate-800"
                                            : "border-slate-200 bg-white text-slate-600"),
                                        children: [
                                          e.jsx("input", {
                                            type: "radio",
                                            name: "nls-success-msg-" + F.id,
                                            className: "mt-0.5",
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
                                        className:
                                          "flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2 text-[11px] leading-snug " +
                                          (isShort
                                            ? "border-violet-400 bg-violet-50 text-slate-800"
                                            : "border-slate-200 bg-white text-slate-600"),
                                        children: [
                                          e.jsx("input", {
                                            type: "radio",
                                            name: "nls-success-msg-" + F.id,
                                            className: "mt-0.5",
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
                                  className: "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm",
                                }),
                                e.jsx("span", {
                                  className: "mt-1 block text-[11px] text-slate-400",
                                  children: "Select a preset or edit the message. Shown after submit.",
                                }),
                              ],
                            }),
                        !F.isDefault &&
                          e.jsx("div", {
                            className: "rounded-xl border border-slate-200 bg-white p-2.5",
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
            className:
              "mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-violet-300 hover:text-violet-700",
            children: [
              e.jsx(dt, {
                size: 14,
              }),
              "+ ADD BEHAVIOR",
            ],
          }),
        ],
      }),
      e.jsxs("section", {
        className: "nexulesuite_fb-section",
        children: [
          e.jsxs("div", {
            className: "nexulesuite_fb-sec-head",
            children: [
              e.jsx("span", {
                className: "nexulesuite_fb-sec-ico is-amber",
                children: e.jsx(qt, {
                  size: 16,
                }),
              }),
              e.jsx("span", {
                className: "nexulesuite_fb-sec-title",
                children: "Conditional email routing",
              }),
            ],
          }),
          e.jsx("p", {
            className: "hint",
            style: {
              marginTop: "-6px",
              marginBottom: "12px",
            },
            children:
              "Also send the submission notification to extra recipient(s) when conditions match — on top of the base notification email.",
          }),
          e.jsx("div", {
            className: "space-y-3",
            children: u.map((F) =>
              e.jsxs(
                "div",
                {
                  className: "overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 shadow-sm",
                  children: [
                    e.jsxs("div", {
                      className: "flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2",
                      children: [
                        e.jsx("input", {
                          type: "text",
                          value: F.recipient,
                          onChange: (V) =>
                            P(F.id, {
                              recipient: V.target.value,
                            }),
                          placeholder: "sales@example.com, other@example.com",
                          className: "min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm",
                        }),
                        e.jsx("button", {
                          type: "button",
                          onClick: () => M(F.id),
                          className:
                            "inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600",
                          title: "Delete route",
                          "aria-label": "Delete route",
                          children: e.jsx(yt, {
                            size: 15,
                          }),
                        }),
                      ],
                    }),
                    e.jsx("div", {
                      className: "p-3",
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
            className:
              "mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-amber-300 hover:text-amber-700",
            children: [
              e.jsx(dt, {
                size: 14,
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
function AddFormModal({ open: a, onClose: o, onSelect: i, onPreview: d }) {
  if (!a) return null;
  const u = cf;
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("div", {
        className: "fixed inset-0 z-40 bg-black/50 transition-opacity",
        onClick: o,
      }),
      e.jsxs("div", {
        className:
          "fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white shadow-2xl",
        children: [
          e.jsxs("div", {
            className: "flex items-start justify-between border-b border-slate-200 px-6 py-5",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h2", {
                    className: "text-xl font-bold text-slate-900",
                    children: "Add a Form",
                  }),
                  e.jsx("p", {
                    className: "mt-0.5 text-xs text-slate-500",
                    children: "Start from a ready-made template or build one from scratch.",
                  }),
                ],
              }),
              e.jsx("button", {
                type: "button",
                onClick: o,
                className: "rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100",
                "aria-label": "Close",
                children: e.jsx(_t, {
                  size: 20,
                }),
              }),
            ],
          }),
          e.jsxs("div", {
            className: "grid grid-cols-1 gap-3 overflow-y-auto px-6 py-5 sm:grid-cols-2 lg:grid-cols-3",
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
    className: "nexulesuite_fb-color-field",
    children: [
      e.jsx("span", {
        className: "lbl",
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
    ? e.jsx("li", {
        className: "nexulesuite_form-builder-wrap",
        children: e.jsxs("div", {
          className: `nexulesuite_fb-card${o ? " is-expanded" : ""}`,
          children: [
            e.jsxs("div", {
              className: "nexulesuite_fb-head",
              children: [
                e.jsxs("button", {
                  type: "button",
                  onClick: d,
                  className: "nexulesuite_fb-head-main",
                  children: [
                    e.jsx("span", {
                      className: "nexulesuite_fb-title",
                      children: a.name || "Untitled Form",
                    }),
                    e.jsx("span", {
                      className: "nexulesuite_fb-badge",
                      children: "Simple",
                    }),
                    a.published === !1
                      ? e.jsx("span", {
                          className: "nexulesuite_fb-badge is-muted",
                          children: "Hidden",
                        })
                      : null,
                  ],
                }),
                e.jsxs("div", {
                  className: "nexulesuite_fb-actions",
                  onClick: (w) => w.stopPropagation(),
                  children: [
                    e.jsx("button", {
                      type: "button",
                      onClick: () => (y == null ? void 0 : y(a.id)),
                      className: "nexulesuite_fb-icon-btn",
                      title: "Preview",
                      children: e.jsx(Rt, {
                        size: 16,
                      }),
                    }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => (P == null ? void 0 : P(a.id, a.published === !1)),
                      className: `nexulesuite_fb-icon-btn${a.published === !1 ? " is-warn" : ""}`,
                      title: a.published === !1 ? "Show form on website" : "Hide form on website",
                      children:
                        a.published === !1
                          ? e.jsx(Rt, {
                              size: 16,
                            })
                          : e.jsx(za, {
                              size: 16,
                            }),
                    }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => copyShortcode(a.id, S),
                      className: `nexulesuite_fb-icon-btn${f === a.id ? " is-success" : ""}`,
                      title: "Copy shortcode",
                      children: e.jsx(Jc, {
                        size: 16,
                      }),
                    }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => p(a.id),
                      className: "nexulesuite_fb-icon-btn",
                      title: "Duplicate",
                      children: e.jsx($s, {
                        size: 16,
                      }),
                    }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => u(a.id),
                      className: "nexulesuite_fb-icon-btn is-danger",
                      title: "Delete",
                      children: e.jsx(yt, {
                        size: 16,
                      }),
                    }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => nlsExportFormConfig(a),
                      className: "nexulesuite_fb-icon-btn",
                      title: "Export form",
                      children: e.jsx(Ol, {
                        size: 16,
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
                      className: "nexulesuite_fb-icon-btn",
                      title: "Import form",
                      children: e.jsx(Vl, {
                        size: 16,
                      }),
                    }),
                    e.jsx("button", {
                      type: "button",
                      onClick: d,
                      className: "nexulesuite_fb-icon-btn nexulesuite_fb-chevron",
                      title: o ? "Collapse" : "Expand",
                      children: e.jsx(Qs, {
                        size: 16,
                        className: o ? "is-open" : "",
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
                    className: "nexulesuite_fb-name-row",
                    children: [
                      e.jsxs("div", {
                        className: "nexulesuite_fb-field",
                        children: [
                          e.jsx("span", {
                            className: "lbl",
                            children: "Form Name",
                          }),
                          e.jsx("input", {
                            type: "text",
                            className: "inp",
                            value: a.name,
                            onChange: (w) =>
                              h(a.id, {
                                name: w.target.value,
                              }),
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "nexulesuite_fb-shortcode-col",
                        children: [
                          e.jsx("span", {
                            className: "lbl",
                            children: "Shortcode",
                          }),
                          e.jsxs("div", {
                            className: "nexulesuite_fb-shortcode-row",
                            children: [
                              e.jsxs("code", {
                                className: "nexulesuite_fb-shortcode",
                                children: ['[nexulesuite_form id="', a.id, '"]'],
                              }),
                              e.jsx("button", {
                                type: "button",
                                onClick: () => copyShortcode(a.id, S),
                                className: `nexulesuite_fb-copy-btn${f === a.id ? " is-copied" : ""}`,
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
                        className: "nexulesuite_fui-canvas-card",
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
                          className: "nexulesuite_fui-next",
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
                        className: "nexulesuite_fui-side__label",
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
                                                                            className: "nexulesuite_fui-acc__clear",
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
                                                                                                    "nexulesuite_fb-color-grid",
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
                                                                                                        "nexulesuite_fb-color-grid",
                                                                                                      children: [
                                                                                                        e.jsxs("div", {
                                                                                                          className:
                                                                                                            "nexulesuite_fb-field",
                                                                                                          style: {
                                                                                                            gridColumn:
                                                                                                              "1 / -1",
                                                                                                            marginBottom:
                                                                                                              "4px",
                                                                                                          },
                                                                                                          children: [
                                                                                                            e.jsx(
                                                                                                              "span",
                                                                                                              {
                                                                                                                className:
                                                                                                                  "lbl",
                                                                                                                children:
                                                                                                                  "Button text",
                                                                                                              },
                                                                                                            ),
                                                                                                            e.jsx(
                                                                                                              "input",
                                                                                                              {
                                                                                                                type: "text",
                                                                                                                className:
                                                                                                                  "inp",
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
                                                                                                        label:
                                                                                                          "Success",
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
                                                                                                          "nexulesuite_fb-color-grid",
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
                                                                                                      : sk ===
                                                                                                            "fields" ||
                                                                                                          sk === "input"
                                                                                                        ? e.jsxs(
                                                                                                            "div",
                                                                                                            {
                                                                                                              className:
                                                                                                                "nexulesuite_fb-color-grid",
                                                                                                              children:
                                                                                                                [
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
                                                                                                            },
                                                                                                          )
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
                                                                          className: "nexulesuite_cust-field",
                                                                          children: [
                                                                            e.jsx("span", {
                                                                              className: "lbl",
                                                                              children: "Design",
                                                                            }),
                                                                            e.jsxs("select", {
                                                                              className: "inp",
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
                                                                          className: "nexulesuite_cust-field",
                                                                          children: [
                                                                            e.jsx("span", {
                                                                              className: "lbl",
                                                                              children: "Theme",
                                                                            }),
                                                                            e.jsxs("select", {
                                                                              className: "inp",
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
                                                                                      "nexulesuite_fui-global-style__btn nexulesuite_fui-global-style__btn--primary",
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
                                                                                      "nexulesuite_fui-global-style__btn",
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
                                                                                      "nexulesuite_fui-global-style__btn",
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
                                                                                      "nexulesuite_fui-global-style__msg",
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
                                                                            style: {
                                                                              margin: "0 0 10px",
                                                                              fontSize: "12px",
                                                                              fontWeight: 700,
                                                                            },
                                                                            children: "Borders & shadows",
                                                                          }),
                                                                          (() => {
                                                                            const base = "fieldBorderRadius";
                                                                            const val = nlsDevNum(
                                                                              M,
                                                                              base,
                                                                              nlsDevice,
                                                                              6,
                                                                            );
                                                                            return e.jsxs("div", {
                                                                              className: "nexulesuite_fb-field",
                                                                              style: {
                                                                                marginBottom: "6px",
                                                                              },
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className: "lbl",
                                                                                  style: {
                                                                                    display: "flex",
                                                                                    justifyContent: "space-between",
                                                                                    alignItems: "center",
                                                                                    gap: "8px",
                                                                                  },
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
                                                                            const val = nlsDevNum(
                                                                              M,
                                                                              base,
                                                                              nlsDevice,
                                                                              1,
                                                                            );
                                                                            return e.jsxs("div", {
                                                                              className: "nexulesuite_fb-field",
                                                                              style: {
                                                                                marginBottom: "6px",
                                                                              },
                                                                              children: [
                                                                                e.jsxs("span", {
                                                                                  className: "lbl",
                                                                                  style: {
                                                                                    display: "flex",
                                                                                    justifyContent: "space-between",
                                                                                    alignItems: "center",
                                                                                    gap: "8px",
                                                                                  },
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
                                                                            className: "nexulesuite_fb-field",
                                                                            style: {
                                                                              marginBottom: "6px",
                                                                            },
                                                                            children: [
                                                                              e.jsxs("span", {
                                                                                className: "lbl",
                                                                                style: {
                                                                                  display: "flex",
                                                                                  justifyContent: "space-between",
                                                                                  alignItems: "center",
                                                                                  gap: "8px",
                                                                                },
                                                                                children: ["Border style"],
                                                                              }),
                                                                              e.jsx("select", {
                                                                                className: "inp",
                                                                                value: M["fieldBorderStyle"] || "solid",
                                                                                onChange: (H) =>
                                                                                  nlsCommitDesign(h, a, M, {
                                                                                    ["fieldBorderStyle"]:
                                                                                      H.target.value,
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
                                                                            className: "nexulesuite_fb-color-grid",
                                                                            style: {
                                                                              marginBottom: "6px",
                                                                            },
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
                                                                            className: "nexulesuite_fb-field",
                                                                            style: {
                                                                              marginBottom: "6px",
                                                                            },
                                                                            children: [
                                                                              e.jsxs("span", {
                                                                                className: "lbl",
                                                                                style: {
                                                                                  display: "flex",
                                                                                  justifyContent: "space-between",
                                                                                  alignItems: "center",
                                                                                  gap: "8px",
                                                                                },
                                                                                children: ["Input box shadow"],
                                                                              }),
                                                                              e.jsx("input", {
                                                                                type: "text",
                                                                                className: "inp",
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
                                                                            className: "nexulesuite_fb-field",
                                                                            style: {
                                                                              marginBottom: "6px",
                                                                            },
                                                                            children: [
                                                                              e.jsxs("span", {
                                                                                className: "lbl",
                                                                                style: {
                                                                                  display: "flex",
                                                                                  justifyContent: "space-between",
                                                                                  alignItems: "center",
                                                                                  gap: "8px",
                                                                                },
                                                                                children: ["Form container shadow"],
                                                                              }),
                                                                              e.jsx("input", {
                                                                                type: "text",
                                                                                className: "inp",
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
                                                                            style: {
                                                                              margin: "14px 0 10px",
                                                                              fontSize: "12px",
                                                                              fontWeight: 700,
                                                                            },
                                                                            children: "Interactive states",
                                                                          }),
                                                                          e.jsx("div", {
                                                                            className: "nexulesuite_fb-color-grid",
                                                                            style: {
                                                                              marginBottom: "6px",
                                                                            },
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
                                                                            className: "nexulesuite_fb-field",
                                                                            style: {
                                                                              marginBottom: "6px",
                                                                            },
                                                                            children: [
                                                                              e.jsxs("span", {
                                                                                className: "lbl",
                                                                                style: {
                                                                                  display: "flex",
                                                                                  justifyContent: "space-between",
                                                                                  alignItems: "center",
                                                                                  gap: "8px",
                                                                                },
                                                                                children: ["Focus shadow"],
                                                                              }),
                                                                              e.jsx("input", {
                                                                                type: "text",
                                                                                className: "inp",
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
                                                                                className: "nexulesuite_cust__devices",
                                                                                style: {
                                                                                  display: "flex",
                                                                                  gap: "6px",
                                                                                  marginBottom: "6px",
                                                                                  flexWrap: "wrap",
                                                                                },
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
                                                                                        "nexulesuite_cust__device" +
                                                                                        (nlsDevice === k
                                                                                          ? " is-active"
                                                                                          : ""),
                                                                                      style: {
                                                                                        fontSize: "12px",
                                                                                        padding: "4px 10px",
                                                                                      },
                                                                                      onClick: () => nlsSetDevice(k),
                                                                                      children: l,
                                                                                    },
                                                                                    k,
                                                                                  ),
                                                                                ),
                                                                              }),
                                                                              e.jsx("button", {
                                                                                type: "button",
                                                                                className: "nexulesuite_cust__apply",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
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
                                                                                style: {
                                                                                  margin: "16px 0 10px",
                                                                                  fontSize: "13px",
                                                                                  fontWeight: 700,
                                                                                },
                                                                                children: "2. Field labels",
                                                                              }),
                                                                              e.jsxs("div", {
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Font family"],
                                                                                  }),
                                                                                  e.jsx("select", {
                                                                                    className: "inp",
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
                                                                                        value:
                                                                                          '"Courier New", monospace',
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
                                                                                  className: "nexulesuite_fb-field",
                                                                                  style: {
                                                                                    marginBottom: "6px",
                                                                                  },
                                                                                  children: [
                                                                                    e.jsxs("span", {
                                                                                      className: "lbl",
                                                                                      style: {
                                                                                        display: "flex",
                                                                                        justifyContent: "space-between",
                                                                                        alignItems: "center",
                                                                                        gap: "8px",
                                                                                      },
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
                                                                                        const v = Number(
                                                                                          H.target.value,
                                                                                        );
                                                                                        if (nlsDevice === "desktop") {
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
                                                                              e.jsxs("div", {
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Font weight"],
                                                                                  }),
                                                                                  e.jsx("select", {
                                                                                    className: "inp",
                                                                                    value:
                                                                                      M["labelFontWeight"] || "400",
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
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Line height"],
                                                                                  }),
                                                                                  e.jsx("input", {
                                                                                    type: "text",
                                                                                    className: "inp",
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
                                                                                className: "nexulesuite_fb-color-grid",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsx(
                                                                                    FormColorField,
                                                                                    {
                                                                                      label: "Text color",
                                                                                      value:
                                                                                        M["labelColor"] || "#334155",
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
                                                                                style: {
                                                                                  margin: "16px 0 10px",
                                                                                  fontSize: "13px",
                                                                                  fontWeight: 700,
                                                                                },
                                                                                children: "3. Placeholder text",
                                                                              }),
                                                                              e.jsxs("div", {
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Font family"],
                                                                                  }),
                                                                                  e.jsx("select", {
                                                                                    className: "inp",
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
                                                                                        value:
                                                                                          '"Courier New", monospace',
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
                                                                                  className: "nexulesuite_fb-field",
                                                                                  style: {
                                                                                    marginBottom: "6px",
                                                                                  },
                                                                                  children: [
                                                                                    e.jsxs("span", {
                                                                                      className: "lbl",
                                                                                      style: {
                                                                                        display: "flex",
                                                                                        justifyContent: "space-between",
                                                                                        alignItems: "center",
                                                                                        gap: "8px",
                                                                                      },
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
                                                                                        const v = Number(
                                                                                          H.target.value,
                                                                                        );
                                                                                        if (nlsDevice === "desktop") {
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
                                                                              e.jsxs("div", {
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Font weight"],
                                                                                  }),
                                                                                  e.jsx("select", {
                                                                                    className: "inp",
                                                                                    value:
                                                                                      M["placeholderFontWeight"] ||
                                                                                      "400",
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
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Line height"],
                                                                                  }),
                                                                                  e.jsx("input", {
                                                                                    type: "text",
                                                                                    className: "inp",
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
                                                                                className: "nexulesuite_fb-color-grid",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
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
                                                                                style: {
                                                                                  margin: "16px 0 10px",
                                                                                  fontSize: "13px",
                                                                                  fontWeight: 700,
                                                                                },
                                                                                children: "4. Input text",
                                                                              }),
                                                                              e.jsxs("div", {
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Font family"],
                                                                                  }),
                                                                                  e.jsx("select", {
                                                                                    className: "inp",
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
                                                                                        value:
                                                                                          '"Courier New", monospace',
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
                                                                                  className: "nexulesuite_fb-field",
                                                                                  style: {
                                                                                    marginBottom: "6px",
                                                                                  },
                                                                                  children: [
                                                                                    e.jsxs("span", {
                                                                                      className: "lbl",
                                                                                      style: {
                                                                                        display: "flex",
                                                                                        justifyContent: "space-between",
                                                                                        alignItems: "center",
                                                                                        gap: "8px",
                                                                                      },
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
                                                                                        const v = Number(
                                                                                          H.target.value,
                                                                                        );
                                                                                        if (nlsDevice === "desktop") {
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
                                                                              e.jsxs("div", {
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Font weight"],
                                                                                  }),
                                                                                  e.jsx("select", {
                                                                                    className: "inp",
                                                                                    value:
                                                                                      M["inputFontWeight"] || "400",
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
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Line height"],
                                                                                  }),
                                                                                  e.jsx("input", {
                                                                                    type: "text",
                                                                                    className: "inp",
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
                                                                                className: "nexulesuite_fb-color-grid",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsx(
                                                                                    FormColorField,
                                                                                    {
                                                                                      label: "Text color",
                                                                                      value:
                                                                                        M["inputColor"] || "#000000",
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
                                                                                style: {
                                                                                  margin: "16px 0 10px",
                                                                                  fontSize: "13px",
                                                                                  fontWeight: 700,
                                                                                },
                                                                                children: "5. Description / sub-label",
                                                                              }),
                                                                              e.jsxs("div", {
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Font family"],
                                                                                  }),
                                                                                  e.jsx("select", {
                                                                                    className: "inp",
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
                                                                                        value:
                                                                                          '"Courier New", monospace',
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
                                                                                  className: "nexulesuite_fb-field",
                                                                                  style: {
                                                                                    marginBottom: "6px",
                                                                                  },
                                                                                  children: [
                                                                                    e.jsxs("span", {
                                                                                      className: "lbl",
                                                                                      style: {
                                                                                        display: "flex",
                                                                                        justifyContent: "space-between",
                                                                                        alignItems: "center",
                                                                                        gap: "8px",
                                                                                      },
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
                                                                                        const v = Number(
                                                                                          H.target.value,
                                                                                        );
                                                                                        if (nlsDevice === "desktop") {
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
                                                                              e.jsxs("div", {
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Font weight"],
                                                                                  }),
                                                                                  e.jsx("select", {
                                                                                    className: "inp",
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
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Line height"],
                                                                                  }),
                                                                                  e.jsx("input", {
                                                                                    type: "text",
                                                                                    className: "inp",
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
                                                                                className: "nexulesuite_fb-color-grid",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsx(
                                                                                    FormColorField,
                                                                                    {
                                                                                      label: "Text color",
                                                                                      value:
                                                                                        M["descColor"] || "#64748b",
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
                                                                                style: {
                                                                                  margin: "16px 0 10px",
                                                                                  fontSize: "13px",
                                                                                  fontWeight: 700,
                                                                                },
                                                                                children: "6. Error messages",
                                                                              }),
                                                                              e.jsxs("div", {
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Font family"],
                                                                                  }),
                                                                                  e.jsx("select", {
                                                                                    className: "inp",
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
                                                                                        value:
                                                                                          '"Courier New", monospace',
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
                                                                                  className: "nexulesuite_fb-field",
                                                                                  style: {
                                                                                    marginBottom: "6px",
                                                                                  },
                                                                                  children: [
                                                                                    e.jsxs("span", {
                                                                                      className: "lbl",
                                                                                      style: {
                                                                                        display: "flex",
                                                                                        justifyContent: "space-between",
                                                                                        alignItems: "center",
                                                                                        gap: "8px",
                                                                                      },
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
                                                                                        const v = Number(
                                                                                          H.target.value,
                                                                                        );
                                                                                        if (nlsDevice === "desktop") {
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
                                                                              e.jsxs("div", {
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Font weight"],
                                                                                  }),
                                                                                  e.jsx("select", {
                                                                                    className: "inp",
                                                                                    value:
                                                                                      M["errorFontWeight"] || "400",
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
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Line height"],
                                                                                  }),
                                                                                  e.jsx("input", {
                                                                                    type: "text",
                                                                                    className: "inp",
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
                                                                                className: "nexulesuite_fb-color-grid",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsx(
                                                                                    FormColorField,
                                                                                    {
                                                                                      label: "Error text",
                                                                                      value:
                                                                                        M["errorColor"] || "#dc2626",
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
                                                                                style: {
                                                                                  margin: "16px 0 10px",
                                                                                  fontSize: "13px",
                                                                                  fontWeight: 700,
                                                                                },
                                                                                children: "7. Success messages",
                                                                              }),
                                                                              e.jsxs("div", {
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Font family"],
                                                                                  }),
                                                                                  e.jsx("select", {
                                                                                    className: "inp",
                                                                                    value:
                                                                                      M["successFontFamily"] ||
                                                                                      "inherit",
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
                                                                                        value:
                                                                                          '"Courier New", monospace',
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
                                                                                  className: "nexulesuite_fb-field",
                                                                                  style: {
                                                                                    marginBottom: "6px",
                                                                                  },
                                                                                  children: [
                                                                                    e.jsxs("span", {
                                                                                      className: "lbl",
                                                                                      style: {
                                                                                        display: "flex",
                                                                                        justifyContent: "space-between",
                                                                                        alignItems: "center",
                                                                                        gap: "8px",
                                                                                      },
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
                                                                                        const v = Number(
                                                                                          H.target.value,
                                                                                        );
                                                                                        if (nlsDevice === "desktop") {
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
                                                                              e.jsxs("div", {
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Font weight"],
                                                                                  }),
                                                                                  e.jsx("select", {
                                                                                    className: "inp",
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
                                                                                className: "nexulesuite_fb-field",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
                                                                                children: [
                                                                                  e.jsxs("span", {
                                                                                    className: "lbl",
                                                                                    style: {
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      alignItems: "center",
                                                                                      gap: "8px",
                                                                                    },
                                                                                    children: ["Line height"],
                                                                                  }),
                                                                                  e.jsx("input", {
                                                                                    type: "text",
                                                                                    className: "inp",
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
                                                                                className: "nexulesuite_fb-color-grid",
                                                                                style: {
                                                                                  marginBottom: "6px",
                                                                                },
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
                                                                                className: "nexulesuite_cust__devices",
                                                                                style: {
                                                                                  display: "flex",
                                                                                  gap: "6px",
                                                                                  marginBottom: "10px",
                                                                                  flexWrap: "wrap",
                                                                                },
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
                                                                                        "nexulesuite_cust__device" +
                                                                                        (nlsDevice === dk
                                                                                          ? " is-active"
                                                                                          : ""),
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
                                                                                  className: "nexulesuite_fb-field",
                                                                                  style: {
                                                                                    marginBottom: "6px",
                                                                                  },
                                                                                  children: [
                                                                                    e.jsxs("span", {
                                                                                      className: "lbl",
                                                                                      style: {
                                                                                        display: "flex",
                                                                                        justifyContent: "space-between",
                                                                                        alignItems: "center",
                                                                                        gap: "8px",
                                                                                      },
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
                                                                                        const v = Number(
                                                                                          H.target.value,
                                                                                        );
                                                                                        if (nlsDevice === "desktop") {
                                                                                          nlsCommitDesign(h, a, M, {
                                                                                            [base]: v,
                                                                                            fieldGap: Number(
                                                                                              H.target.value,
                                                                                            ),
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
                                                                              (() => {
                                                                                const base = "columnGap";
                                                                                const val = nlsDevNum(
                                                                                  M,
                                                                                  base,
                                                                                  nlsDevice,
                                                                                  16,
                                                                                );
                                                                                return e.jsxs("div", {
                                                                                  className: "nexulesuite_fb-field",
                                                                                  style: {
                                                                                    marginBottom: "6px",
                                                                                  },
                                                                                  children: [
                                                                                    e.jsxs("span", {
                                                                                      className: "lbl",
                                                                                      style: {
                                                                                        display: "flex",
                                                                                        justifyContent: "space-between",
                                                                                        alignItems: "center",
                                                                                        gap: "8px",
                                                                                      },
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
                                                                                        const v = Number(
                                                                                          H.target.value,
                                                                                        );
                                                                                        if (nlsDevice === "desktop") {
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
                                                                              (() => {
                                                                                const base =
                                                                                  nlsDevice === "desktop"
                                                                                    ? "fieldPadding"
                                                                                    : nlsDevice === "tablet"
                                                                                      ? "inputPaddingTablet"
                                                                                      : "inputPaddingMobile";
                                                                                const _fp = parseInt(
                                                                                  M.fieldPadding,
                                                                                  10,
                                                                                );
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
                                                                                  className: "nexulesuite_fb-field",
                                                                                  style: {
                                                                                    marginBottom: "6px",
                                                                                  },
                                                                                  children: [
                                                                                    e.jsxs("span", {
                                                                                      className: "lbl",
                                                                                      style: {
                                                                                        display: "flex",
                                                                                        justifyContent: "space-between",
                                                                                        alignItems: "center",
                                                                                        gap: "8px",
                                                                                      },
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
                                                                                        const v = Number(
                                                                                          H.target.value,
                                                                                        );
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
                                                                                  className: "nexulesuite_fb-field",
                                                                                  style: {
                                                                                    marginBottom: "6px",
                                                                                  },
                                                                                  children: [
                                                                                    e.jsxs("span", {
                                                                                      className: "lbl",
                                                                                      style: {
                                                                                        display: "flex",
                                                                                        justifyContent: "space-between",
                                                                                        alignItems: "center",
                                                                                        gap: "8px",
                                                                                      },
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
                                                                                        const v = Number(
                                                                                          H.target.value,
                                                                                        );
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
                                                                                      style: {
                                                                                        margin: "16px 0 10px",
                                                                                        fontSize: "13px",
                                                                                        fontWeight: 700,
                                                                                      },
                                                                                      children: "11. Responsive",
                                                                                    }),
                                                                                    e.jsxs("div", {
                                                                                      className: "nexulesuite_fb-field",
                                                                                      style: {
                                                                                        marginBottom: "6px",
                                                                                      },
                                                                                      children: [
                                                                                        e.jsxs("span", {
                                                                                          className: "lbl",
                                                                                          style: {
                                                                                            display: "flex",
                                                                                            justifyContent:
                                                                                              "space-between",
                                                                                            alignItems: "center",
                                                                                            gap: "8px",
                                                                                          },
                                                                                          children: [
                                                                                            "Auto-stack columns on small screens",
                                                                                          ],
                                                                                        }),
                                                                                        e.jsx("label", {
                                                                                          style: {
                                                                                            display: "flex",
                                                                                            alignItems: "center",
                                                                                            gap: "8px",
                                                                                          },
                                                                                          children: [
                                                                                            e.jsx("input", {
                                                                                              type: "checkbox",
                                                                                              checked:
                                                                                                M.autoStack !== false,
                                                                                              onChange: (H) =>
                                                                                                nlsCommitDesign(
                                                                                                  h,
                                                                                                  a,
                                                                                                  M,
                                                                                                  {
                                                                                                    autoStack:
                                                                                                      !!H.target
                                                                                                        .checked,
                                                                                                  },
                                                                                                ),
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
                                                                                        className:
                                                                                          "nexulesuite_fb-field",
                                                                                        style: {
                                                                                          marginBottom: "6px",
                                                                                        },
                                                                                        children: [
                                                                                          e.jsxs("span", {
                                                                                            className: "lbl",
                                                                                            style: {
                                                                                              display: "flex",
                                                                                              justifyContent:
                                                                                                "space-between",
                                                                                              alignItems: "center",
                                                                                              gap: "8px",
                                                                                            },
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
                                                                                                nlsCommitDesign(
                                                                                                  h,
                                                                                                  a,
                                                                                                  M,
                                                                                                  {
                                                                                                    [base]: v,
                                                                                                  },
                                                                                                );
                                                                                              } else {
                                                                                                nlsCommitDesign(
                                                                                                  h,
                                                                                                  a,
                                                                                                  M,
                                                                                                  {
                                                                                                    [nlsDevKey(
                                                                                                      base,
                                                                                                      nlsDevice,
                                                                                                    )]: v,
                                                                                                  },
                                                                                                );
                                                                                              }
                                                                                            },
                                                                                          }),
                                                                                        ],
                                                                                      });
                                                                                    })(),
                                                                                    e.jsx("h4", {
                                                                                      style: {
                                                                                        margin: "0 0 10px",
                                                                                        fontSize: "13px",
                                                                                        fontWeight: 700,
                                                                                      },
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
                                                                          className: "nexulesuite_fb-field",
                                                                          children: [
                                                                            e.jsx("span", {
                                                                              className: "lbl",
                                                                              children: "Admin Email",
                                                                            }),
                                                                            e.jsx("input", {
                                                                              className: "inp",
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
                                                                          className: "nexulesuite_fb-field",
                                                                          children: [
                                                                            e.jsx("span", {
                                                                              className: "lbl",
                                                                              children: "CRM / Webhook URL (this form)",
                                                                            }),
                                                                            e.jsx("input", {
                                                                              type: "url",
                                                                              className: "inp",
                                                                              value: a.crmWebhookUrl || "",
                                                                              onChange: function (w) {
                                                                                return h(a.id, {
                                                                                  crmWebhookUrl: w.target.value,
                                                                                });
                                                                              },
                                                                              placeholder:
                                                                                "https://hooks.zapier.com/...",
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
                                                        className:
                                                          "nexulesuite_fui-acc__item" + (open ? " is-open" : ""),
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
                                                                            className: "nexulesuite_fb-toggle-card",
                                                                            children: [
                                                                              e.jsxs("div", {
                                                                                className:
                                                                                  "nexulesuite_fb-toggle-card-body",
                                                                                children: [
                                                                                  e.jsx("span", {
                                                                                    className:
                                                                                      "nexulesuite_fb-toggle-card-title",
                                                                                    children: "Show form on website",
                                                                                  }),
                                                                                  e.jsx("p", {
                                                                                    className: "hint",
                                                                                    children:
                                                                                      "Turn off to hide everywhere on the front (shortcodes, popups, widgets). The form stays in the builder for editing.",
                                                                                  }),
                                                                                ],
                                                                              }),
                                                                              e.jsx("div", {
                                                                                className: `nexulesuite_fb-toggle${a.published !== !1 ? " on" : ""}`,
                                                                                role: "switch",
                                                                                "aria-checked": a.published !== !1,
                                                                                tabIndex: 0,
                                                                                onClick: () =>
                                                                                  h(a.id, {
                                                                                    published: a.published === !1,
                                                                                  }),
                                                                                onKeyDown: (w) => {
                                                                                  (w.key === " " ||
                                                                                    w.key === "Enter") &&
                                                                                    (w.preventDefault(),
                                                                                    h(a.id, {
                                                                                      published: a.published === !1,
                                                                                    }));
                                                                                },
                                                                                children: e.jsx("span", {
                                                                                  className: "track",
                                                                                  children: e.jsx("span", {
                                                                                    className: "knob",
                                                                                  }),
                                                                                }),
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
                                                                              className: "nexulesuite_fb-field",
                                                                              children: [
                                                                                e.jsx("span", {
                                                                                  className: "lbl",
                                                                                  children: "Terms & Conditions Text",
                                                                                }),
                                                                                e.jsx("textarea", {
                                                                                  className: "ta",
                                                                                  value: a.termsConditionText || "",
                                                                                  onChange: (w) =>
                                                                                    h(a.id, {
                                                                                      termsConditionText:
                                                                                        w.target.value,
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
                                                    className:
                                                      "nexulesuite_fui-acc__content-inner nexulesuite_fb-tab-panel nexulesuite_fb-advanced",
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
        }),
      })
    : e.jsxs("li", {
        className: "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        children: [
          e.jsxs("button", {
            type: "button",
            onClick: d,
            className: "flex w-full items-center justify-between border-b border-slate-200 px-3 py-3 text-left sm:px-4",
            children: [
              e.jsxs("div", {
                className: "flex min-w-0 items-center gap-2",
                children: [
                  e.jsx("span", {
                    className: "truncate text-sm font-semibold text-slate-800",
                    children: a.name || "Untitled Form",
                  }),
                  e.jsx("span", {
                    className: "rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700",
                    children: a.formType === "multi" ? "Multi-Step" : "Simple",
                  }),
                  a.published === !1
                    ? e.jsx("span", {
                        className: "rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600",
                        children: "Hidden",
                      })
                    : null,
                ],
              }),
              e.jsxs("div", {
                className: "flex items-center gap-1",
                onClick: (w) => w.stopPropagation(),
                children: [
                  e.jsx("button", {
                    type: "button",
                    onClick: () => (y == null ? void 0 : y(a.id)),
                    className:
                      "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                    title: "Preview",
                    children: e.jsx(Rt, {
                      className: "h-4 w-4",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => (P == null ? void 0 : P(a.id, a.published === !1)),
                    className: [
                      "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                      a.published === !1
                        ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                    ].join(" "),
                    title: a.published === !1 ? "Show form on website" : "Hide form on website",
                    children:
                      a.published === !1
                        ? e.jsx(Rt, {
                            className: "h-4 w-4",
                          })
                        : e.jsx(za, {
                            className: "h-4 w-4",
                          }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => copyShortcode(a.id, S),
                    className: [
                      "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                      f === a.id
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                    ].join(" "),
                    title: "Copy shortcode",
                    children: e.jsx(Jc, {
                      className: "h-4 w-4",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => p(a.id),
                    className:
                      "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                    title: "Duplicate",
                    children: e.jsx($s, {
                      className: "h-4 w-4",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => u(a.id),
                    className:
                      "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700",
                    title: "Delete",
                    children: e.jsx(yt, {
                      className: "h-4 w-4",
                    }),
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => nlsExportFormConfig(a),
                    className:
                      "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                    title: "Export form",
                    children: e.jsx(Ol, {
                      className: "h-4 w-4",
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
                    className:
                      "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                    title: "Import form",
                    children: e.jsx(Vl, {
                      className: "h-4 w-4",
                    }),
                  }),
                  e.jsx(Qs, {
                    className: ["h-4 w-4 text-slate-400 transition-transform", o ? "rotate-180" : ""].join(" "),
                  }),
                ],
              }),
            ],
          }),
          o &&
            e.jsxs("div", {
              className: "space-y-4 px-3 py-4 sm:space-y-6 sm:px-4",
              children: [
                e.jsxs("div", {
                  className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("label", {
                          className: "mb-1.5 block text-sm font-semibold text-slate-700",
                          children: "Form Name",
                        }),
                        e.jsx("input", {
                          type: "text",
                          value: a.name,
                          onChange: (w) =>
                            h(a.id, {
                              name: w.target.value,
                            }),
                          className:
                            "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("label", {
                          className: "mb-1.5 block text-sm font-semibold text-slate-700",
                          children: "Shortcode",
                        }),
                        e.jsxs("div", {
                          className: "flex items-center gap-2",
                          children: [
                            e.jsxs("code", {
                              className:
                                "flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700",
                              children: ['[nexulesuite_form id="', a.id, '"]'],
                            }),
                            e.jsx("button", {
                              type: "button",
                              onClick: () => copyShortcode(a.id, S),
                              className: [
                                "rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                                f === a.id
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-violet-600 text-white hover:bg-violet-700",
                              ].join(" "),
                              children: f === a.id ? "Copied!" : "Copy",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx("div", {
                  className: "flex border-b border-slate-200",
                  children: ["fields", "styling", "customization", "confirmations", "advanced"].map((w) =>
                    e.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => x(w),
                        className: [
                          "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                          i === w
                            ? "border-violet-600 text-violet-700"
                            : "border-transparent text-slate-400 hover:text-slate-700",
                        ].join(" "),
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
                    className: "space-y-4",
                    children: [
                      e.jsx("div", {
                        className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
                        children: [
                          ["Background Color", "backgroundColor"],
                          ["Text Color", "textColor"],
                          ["Button Color", "buttonColor"],
                          ["Stepper Color", "stepperColor"],
                        ].map(([w, N]) =>
                          e.jsxs(
                            "div",
                            {
                              children: [
                                e.jsx("label", {
                                  className: "mb-1.5 block text-sm font-semibold text-slate-700",
                                  children: w,
                                }),
                                e.jsxs("div", {
                                  className: "flex items-center gap-2",
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
                                      className: "h-10 w-10 cursor-pointer rounded border border-slate-200",
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
                                      className:
                                        "h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm outline-none",
                                    }),
                                  ],
                                }),
                              ],
                            },
                            N,
                          ),
                        ),
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsx("label", {
                            className: "mb-1.5 block text-sm font-semibold text-slate-700",
                            children: "Submit Button Text",
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: a.submitBtnText || "",
                            onChange: (w) =>
                              h(a.id, {
                                submitBtnText: w.target.value,
                              }),
                            className:
                              "h-10 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                          }),
                        ],
                      }),
                    ],
                  }),
                i === "customization" &&
                  e.jsxs("div", {
                    className: "space-y-4 nexulesuite_cust nexulesuite_cust--tw",
                    children: [
                      e.jsxs("div", {
                        className: "nexulesuite_cust-card nexulesuite_cust-card--wide",
                        children: [
                          e.jsxs("div", {
                            className: "nexulesuite_cust-card__head",
                            children: [
                              e.jsxs("div", {
                                children: [
                                  e.jsx("h4", {
                                    className: "nexulesuite_cust-card__title",
                                    children: "Appearance presets",
                                  }),
                                  e.jsx("p", {
                                    className: "nexulesuite_cust-card__sub",
                                    children: "Forminator-style design & theme for the live form",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "nexulesuite_cust-row",
                            children: [
                              e.jsxs("div", {
                                className: "nexulesuite_cust-field",
                                children: [
                                  e.jsx("span", {
                                    className: "lbl",
                                    children: "Design",
                                  }),
                                  e.jsx("select", {
                                    className: "inp",
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
                              e.jsxs("div", {
                                className: "nexulesuite_cust-field",
                                children: [
                                  e.jsx("span", {
                                    className: "lbl",
                                    children: "Theme",
                                  }),
                                  e.jsx("select", {
                                    className: "inp",
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
                      e.jsx("p", {
                        className: "nexulesuite_cust__hint text-xs text-slate-500",
                        style: {
                          marginBottom: "6px",
                        },
                        children:
                          "Advanced global design: typography, spacing, responsive sizes, borders, states, and colors. Use Desktop / Tablet / Mobile for device-specific sizes and gaps.",
                      }),
                      e.jsxs("div", {
                        style: {
                          display: "flex",
                          gap: "6px",
                          marginBottom: "6px",
                          flexWrap: "wrap",
                        },
                        children: [
                          ["desktop", "Desktop"],
                          ["tablet", "Tablet"],
                          ["mobile", "Mobile"],
                        ].map(([k, l]) =>
                          e.jsx(
                            "button",
                            {
                              type: "button",
                              className: nlsDevice === k ? "button button-primary" : "button",
                              style: {
                                fontSize: "12px",
                                padding: "4px 10px",
                              },
                              onClick: () => nlsSetDevice(k),
                              children: l,
                            },
                            k,
                          ),
                        ),
                      }),
                      e.jsx("h4", {
                        className: "text-sm font-semibold text-slate-800 mt-3",
                        children: "1. Color palette",
                      }),
                      e.jsx("div", {
                        className: "grid grid-cols-2 gap-3",
                        style: {
                          marginBottom: "6px",
                        },
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
                        className: "text-sm font-semibold text-slate-800 mt-3",
                        children: "2. Field labels",
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Font family"],
                          }),
                          e.jsx("select", {
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                          children: [
                            e.jsxs("label", {
                              className:
                                "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
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
                              className: "w-full",
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Font weight"],
                          }),
                          e.jsx("select", {
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Line height"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        className: "grid grid-cols-2 gap-3",
                        style: {
                          marginBottom: "6px",
                        },
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
                        className: "text-sm font-semibold text-slate-800 mt-3",
                        children: "3. Placeholder text",
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Font family"],
                          }),
                          e.jsx("select", {
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                          children: [
                            e.jsxs("label", {
                              className:
                                "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
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
                              className: "w-full",
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Font weight"],
                          }),
                          e.jsx("select", {
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Line height"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        className: "grid grid-cols-2 gap-3",
                        style: {
                          marginBottom: "6px",
                        },
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
                        className: "text-sm font-semibold text-slate-800 mt-3",
                        children: "4. Input text",
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Font family"],
                          }),
                          e.jsx("select", {
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                          children: [
                            e.jsxs("label", {
                              className:
                                "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
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
                              className: "w-full",
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Font weight"],
                          }),
                          e.jsx("select", {
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Line height"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        className: "grid grid-cols-2 gap-3",
                        style: {
                          marginBottom: "6px",
                        },
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
                        className: "text-sm font-semibold text-slate-800 mt-3",
                        children: "5. Description / sub-label",
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Font family"],
                          }),
                          e.jsx("select", {
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                          children: [
                            e.jsxs("label", {
                              className:
                                "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
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
                              className: "w-full",
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Font weight"],
                          }),
                          e.jsx("select", {
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Line height"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        className: "grid grid-cols-2 gap-3",
                        style: {
                          marginBottom: "6px",
                        },
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
                        className: "text-sm font-semibold text-slate-800 mt-3",
                        children: "6. Error messages",
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Font family"],
                          }),
                          e.jsx("select", {
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                          children: [
                            e.jsxs("label", {
                              className:
                                "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
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
                              className: "w-full",
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Font weight"],
                          }),
                          e.jsx("select", {
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Line height"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        className: "grid grid-cols-2 gap-3",
                        style: {
                          marginBottom: "6px",
                        },
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
                        className: "text-sm font-semibold text-slate-800 mt-3",
                        children: "7. Success messages",
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Font family"],
                          }),
                          e.jsx("select", {
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                          children: [
                            e.jsxs("label", {
                              className:
                                "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
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
                              className: "w-full",
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Font weight"],
                          }),
                          e.jsx("select", {
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Line height"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        className: "grid grid-cols-2 gap-3",
                        style: {
                          marginBottom: "6px",
                        },
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
                        className: "text-sm font-semibold text-slate-800 mt-3",
                        children: "9. Borders & shadows",
                      }),
                      (() => {
                        const base = "fieldBorderRadius";
                        const val = nlsDevNum(M, base, nlsDevice, 6);
                        return e.jsxs("div", {
                          children: [
                            e.jsxs("label", {
                              className:
                                "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
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
                              className: "w-full",
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
                          children: [
                            e.jsxs("label", {
                              className:
                                "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
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
                              className: "w-full",
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Border style"],
                          }),
                          e.jsx("select", {
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        className: "grid grid-cols-2 gap-3",
                        style: {
                          marginBottom: "6px",
                        },
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Input box shadow"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Form container shadow"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        className: "text-sm font-semibold text-slate-800 mt-3",
                        children: "10. Interactive states",
                      }),
                      e.jsx("div", {
                        className: "grid grid-cols-2 gap-3",
                        style: {
                          marginBottom: "6px",
                        },
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
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Focus shadow"],
                          }),
                          e.jsx("input", {
                            type: "text",
                            className: "w-full rounded border border-slate-200 px-2 py-1.5 text-sm",
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
                        className: "text-sm font-semibold text-slate-800 mt-3",
                        children: "11. Responsive",
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsxs("label", {
                            className:
                              "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
                            children: ["Auto-stack columns on small screens"],
                          }),
                          e.jsx("label", {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            },
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
                          children: [
                            e.jsxs("label", {
                              className:
                                "mb-1.5 flex justify-between items-center gap-2 text-sm font-semibold text-slate-700",
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
                              className: "w-full",
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
                    className: "nexulesuite_fb-tab-panel nexulesuite_fb-advanced",
                    children: e.jsx(FormBehaviorSettings, {
                      form: a,
                      onUpdate: (w) => h(a.id, w),
                    }),
                  }),
                i === "advanced" &&
                  e.jsxs("div", {
                    className: "space-y-4",
                    children: [
                      e.jsx("div", {
                        className: "rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-3",
                        children: e.jsxs("label", {
                          className: "flex cursor-pointer items-start gap-3",
                          children: [
                            e.jsx("input", {
                              type: "checkbox",
                              className: "mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500",
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
                                  className: "block text-sm font-semibold text-slate-800",
                                  children: "Show form on website",
                                }),
                                e.jsx("span", {
                                  className: "mt-0.5 block text-xs text-slate-500",
                                  children:
                                    "Turn off to hide everywhere on the front (shortcodes, popups, widgets). The form stays in the builder for editing.",
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsx("label", {
                            className: "mb-1.5 block text-sm font-semibold text-slate-700",
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
                            className:
                              "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                          }),
                          e.jsx("p", {
                            className: "mt-1.5 text-xs text-slate-500",
                            children: "Comma-separated. Submissions go here. If empty, the site admin email is used.",
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "space-y-1.5",
                        children: [
                          e.jsx("label", {
                            className: "mb-1.5 block text-sm font-semibold text-slate-700",
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
                            className:
                              "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                          }),
                          e.jsx("p", {
                            className: "mt-1.5 text-xs text-slate-500",
                            children:
                              "Optional. Per-form JSON webhook; set a global URL in Settings for all forms too.",
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsx("label", {
                            className: "mb-1.5 block text-sm font-semibold text-slate-700",
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
                            className:
                              "w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-violet-200 focus:ring-2",
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
    headerRight: e.jsx("div", {
      className: "relative",
      children: e.jsx("input", {
        value: o,
        onChange: (_) => i(_.target.value),
        placeholder: "Search...",
        className:
          "h-9 w-44 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none ring-violet-200 focus:ring-2 sm:w-56 md:w-72 md:text-sm",
      }),
    }),
    footer: e.jsx(StickyFooter, {
      actions: e.jsxs("button", {
        type: "button",
        disabled: P,
        onClick: () => pe(),
        className:
          "flex items-center gap-2 rounded-xl bg-[#2563EB] px-8 py-3 text-xs font-bold text-white shadow-lg transition-all hover:bg-blue-600 active:scale-95 disabled:opacity-60",
        children: [
          e.jsx(bn, {
            size: 18,
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
        className: "mt-4 space-y-4 md:space-y-6",
        children: [
          e.jsx("div", {
            children: e.jsxs("div", {
              className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
              children: [
                W &&
                  e.jsx("div", {
                    className:
                      "mb-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs font-semibold text-slate-500",
                    children: "Loading saved forms…",
                  }),
                e.jsx("ul", {
                  className: "space-y-3",
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
                    className: "rounded-xl border border-dashed border-slate-200 bg-slate-50/40 p-8 text-center",
                    children: [
                      e.jsx("p", {
                        className: "text-sm font-semibold text-slate-700",
                        children: "No forms yet",
                      }),
                      e.jsx("p", {
                        className: "mt-1 text-xs text-slate-400",
                        children: "Create your first form and save it.",
                      }),
                    ],
                  }),
                e.jsx("div", {
                  className: "nexulesuite_form-builder-wrap nexulesuite_fb-add-wrap",
                  children: e.jsxs("button", {
                    type: "button",
                    onClick: () => J(!0),
                    className: "nexulesuite_fb-add-dash",
                    children: [
                      e.jsx(mm, {
                        size: 16,
                      }),
                      "Add Form / Template",
                    ],
                  }),
                }),
              ],
            }),
          }),
          U != null && U.field
            ? e.jsxs("aside", {
                className: "space-y-4",
                children: [
                  e.jsxs("div", {
                    className: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
                    children: [
                      e.jsx("div", {
                        className: "border-b border-slate-200 px-4 py-3",
                        children: e.jsx("p", {
                          className: "text-sm font-semibold text-slate-800",
                          children: "Field Settings",
                        }),
                      }),
                      e.jsx("div", {
                        className: "p-4",
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
                    ],
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
      e.jsx(FormPreviewModal, {
        isOpen: !!N,
        onClose: () => H(null),
        form: te,
      }),
      e.jsx(AddFormModal, {
        open: C,
        onClose: () => J(!1),
        onSelect: ie,
        onPreview: (_) => le(formFromTemplate(_, "template-preview")),
      }),
      e.jsx(FormPreviewModal, {
        isOpen: !!j,
        onClose: () => le(null),
        form: j,
      }),
    ],
  });
}
