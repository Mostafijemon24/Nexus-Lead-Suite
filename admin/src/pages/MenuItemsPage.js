import * as e from "react/jsx-runtime";
import {
  ArrowRight as qc,
  Bell as em,
  Calendar as qn,
  ChevronLeft as bi,
  Copy as $s,
  Download as Ol,
  Eye as Rt,
  GripVertical as Ni,
  Mail as qt,
  MapPin as $a,
  MessageSquare as Xn,
  MousePointerClick as nd,
  Phone as ld,
  Plus as dt,
  Settings2 as wm,
  Target as dd,
  Trash2 as yt,
  X as _t,
} from "lucide-react";
import * as b from "react";
import {
  ColorField,
  DisplayConditions,
  ModalShell,
  PageFrame,
  StickyFooter,
  SuccessModal,
  nlsRange,
} from "../shared/common.js";

const BUTTON_ICON_MAP = {
  none: null,
  call: e.jsx(ld, {
    size: 16,
  }),
  mail: e.jsx(qt, {
    size: 16,
  }),
  message: e.jsx(Xn, {
    size: 16,
  }),
  location: e.jsx($a, {
    size: 16,
  }),
  appointment: e.jsx(qn, {
    size: 16,
  }),
  download: e.jsx(Ol, {
    size: 16,
  }),
  popup: e.jsx(dd, {
    size: 16,
  }),
  cta: e.jsx(nd, {
    size: 16,
  }),
  event: e.jsx(em, {
    size: 16,
  }),
  arrow: e.jsx(qc, {
    size: 16,
  }),
};
function createButtonModel() {
  return {
    id: `btn-${Date.now()}`,
    label: "New Action Button",
    url: "",
    eventName: "",
    icon: "none",
    displayMode: "inline",
    cssId: "",
    cssClass: "",
    style: {
      bg: "#10b981",
      text: "#ffffff",
      paddingVertical: "12",
      paddingHorizontal: "24",
      radius: "8",
      hoverEffect: "glow",
    },
  };
}
function createGroupModel() {
  return {
    id: `group-${Date.now()}`,
    name: "New Button Group",
    priority: 50,
    enabled: !0,
    conditions: {
      match: "any",
      rules: [],
    },
    buttons: [],
  };
}
function px(a) {
  var o, i;
  return !a || typeof a != "object"
    ? createGroupModel()
    : {
        ...a,
        buttons: Array.isArray(a.buttons) ? a.buttons : [],
        conditions: {
          match: ((o = a.conditions) == null ? void 0 : o.match) === "all" ? "all" : "any",
          rules: Array.isArray((i = a.conditions) == null ? void 0 : i.rules) ? a.conditions.rules : [],
        },
      };
}
function RangeSlider({ label: a, accent: o, value: i, min: d, max: u, unit: p, onChange: h }) {
  const [x, f] = b.useState(!1);
  const S = !isNaN(parseInt(i, 10)) ? Math.max(d, Math.min(u, parseInt(i, 10))) : d,
    y = u === d ? 0 : ((S - d) / (u - d)) * 100;
  return e.jsxs("div", {
    className: `slide-field${x ? " dragging" : ""}`,
    children: [
      e.jsxs("label", {
        children: [
          e.jsxs("span", {
            children: [
              a,
              o
                ? e.jsx("span", {
                    className: "accent",
                    children: o,
                  })
                : null,
            ],
          }),
          e.jsxs("span", {
            className: "val",
            children: [S, p],
          }),
        ],
      }),
      e.jsx(nlsRange, {
        min: d,
        max: u,
        value: S,
        style: {
          "--pct": `${y}%`,
        },
        onChange: (P) => h(P.target.value),
        onPointerDown: () => f(!0),
        onPointerUp: () => f(!1),
        onPointerCancel: () => f(!1),
        onBlur: () => f(!1),
      }),
    ],
  });
}
function HOVER_EFFECT_CLASSES(a) {
  switch (a) {
    case "lift":
      return "hover:-translate-y-1 hover:shadow-xl";
    case "glow":
      return "hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]";
    case "shake":
      return "hover:animate-bounce";
    case "scale":
      return "hover:scale-105";
    case "rotate":
      return "hover:rotate-3";
    case "darken":
      return "hover:brightness-90";
    default:
      return "";
  }
}
export function MenuItemsPage() {
  var fs, ns;
  const [a, o] = b.useState([]),
    [i, d] = b.useState([]),
    [u, p] = b.useState(null),
    [h, x] = b.useState(null),
    [f, S] = b.useState("group"),
    [y, P] = b.useState(14),
    [M, T] = b.useState(14),
    [F, V] = b.useState([]),
    [z, U] = b.useState({
      postTypes: [],
      categories: [],
      tags: [],
    }),
    [w, N] = b.useState({}),
    [H, W] = b.useState({
      loading: !0,
      saving: !1,
      error: "",
    }),
    [I, C] = b.useState(!1),
    [J, j] = b.useState(null),
    [le, ie] = b.useState(null),
    [O, te] = b.useState(null),
    [pe, me] = b.useState(null),
    [B, ee] = b.useState(null),
    _ = b.useMemo(() => a.find((Y) => Y.id === u) || null, [a, u]),
    X = b.useMemo(() => (_ && _.buttons.find((Y) => Y.id === h)) || null, [_, h]),
    L = b.useMemo(() => JSON.stringify(a) !== JSON.stringify(i) || y !== M, [a, i, y, M]),
    A = ((fs = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : fs.restUrl) || "/wp-json/",
    k = ((ns = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : ns.nonce) || "";
  b.useEffect(() => {
    let Y = !1;
    return (
      (async () => {
        var _e, ge, fe, Te;
        W((Pe) => ({
          ...Pe,
          loading: !0,
          error: "",
        }));
        try {
          const [Pe, Oe, $e] = await Promise.all([
              fetch(`${A}nexulesuite_/v1/menu-items`, {
                credentials: "same-origin",
                headers: {
                  "X-WP-Nonce": k,
                },
              }),
              fetch(`${A}nexulesuite_/v1/popups`, {
                credentials: "same-origin",
                headers: {
                  "X-WP-Nonce": k,
                },
              }),
              fetch(`${A}nexulesuite_/v1/menu-items/condition-meta`, {
                credentials: "same-origin",
                headers: {
                  "X-WP-Nonce": k,
                },
              }),
            ]),
            st = await Pe.json(),
            Gt = await Oe.json(),
            Ot = await $e.json();
          if (Y) return;
          const gs = Array.isArray((_e = st == null ? void 0 : st.data) == null ? void 0 : _e.groups)
              ? st.data.groups.map(px)
              : [],
            Js =
              typeof ((ge = st == null ? void 0 : st.data) == null ? void 0 : ge.globalFontSize) == "number"
                ? st.data.globalFontSize
                : 14;
          (o(gs),
            d(gs),
            P(Js),
            T(Js),
            p(((fe = gs[0]) == null ? void 0 : fe.id) ?? null),
            x(null),
            S("group"),
            V(Array.isArray((Te = Gt == null ? void 0 : Gt.data) == null ? void 0 : Te.popups) ? Gt.data.popups : []),
            Ot != null &&
              Ot.data &&
              U({
                postTypes: Array.isArray(Ot.data.postTypes) ? Ot.data.postTypes : [],
                categories: Array.isArray(Ot.data.categories) ? Ot.data.categories : [],
                tags: Array.isArray(Ot.data.tags) ? Ot.data.tags : [],
              }));
        } catch {
          Y ||
            W((Pe) => ({
              ...Pe,
              error: "Failed to load menu items.",
            }));
        } finally {
          Y ||
            W((Pe) => ({
              ...Pe,
              loading: !1,
            }));
        }
      })(),
      () => {
        Y = !0;
      }
    );
  }, [A, k]);
  const Z = b.useCallback((Y, _e) => {
      o((ge) =>
        ge.map((fe) =>
          fe.id === Y
            ? {
                ...fe,
                ..._e,
              }
            : fe,
        ),
      );
    }, []),
    ue = b.useCallback((Y, _e, ge) => {
      o((fe) =>
        fe.map((Te) =>
          Te.id === Y
            ? {
                ...Te,
                [_e]: ge,
              }
            : Te,
        ),
      );
    }, []),
    Q = b.useCallback((Y, _e, ge, fe) => {
      o((Te) =>
        Te.map((Pe) =>
          Pe.id !== Y
            ? Pe
            : {
                ...Pe,
                buttons: Pe.buttons.map((Oe) =>
                  Oe.id === _e
                    ? {
                        ...Oe,
                        [ge]: fe,
                      }
                    : Oe,
                ),
              },
        ),
      );
    }, []),
    he = b.useCallback((Y, _e, ge, fe) => {
      o((Te) =>
        Te.map((Pe) =>
          Pe.id !== Y
            ? Pe
            : {
                ...Pe,
                buttons: Pe.buttons.map((Oe) =>
                  Oe.id === _e
                    ? {
                        ...Oe,
                        style: {
                          ...Oe.style,
                          [ge]: fe,
                        },
                      }
                    : Oe,
                ),
              },
        ),
      );
    }, []),
    oe = () => {
      const Y = createGroupModel();
      (o((_e) => [..._e, Y]), p(Y.id), x(null), S("group"));
    },
    xe = (Y) => {
      window.confirm("Delete this button group and all its buttons?") &&
        o((_e) => {
          const ge = _e.filter((fe) => fe.id !== Y);
          return (
            p((fe) => {
              var Te;
              return fe === Y ? (((Te = ge[0]) == null ? void 0 : Te.id) ?? null) : fe;
            }),
            x(null),
            S("group"),
            ge
          );
        });
    },
    ve = () => {
      if (!_) return;
      const Y = createButtonModel();
      (Z(_.id, {
        buttons: [...(_.buttons || []), Y],
      }),
        x(Y.id),
        S("button"));
    },
    Ke = (Y) => {
      if (!_ || !window.confirm("Delete this menu button?")) return;
      const _e = _.buttons.filter((ge) => ge.id !== Y);
      (Z(_.id, {
        buttons: _e,
      }),
        x((ge) => {
          var fe;
          return ge === Y ? (((fe = _e[0]) == null ? void 0 : fe.id) ?? null) : ge;
        }),
        _e.length || S("group"));
    },
    Xe = (Y) => {
      if (!_) return;
      const _e = _.buttons.findIndex((Te) => Te.id === Y);
      if (_e === -1) return;
      const ge = {
          ..._.buttons[_e],
          id: `btn-${Date.now()}`,
          label: _.buttons[_e].label ? `${_.buttons[_e].label} (Copy)` : "New Action Button (Copy)",
          style: {
            ..._.buttons[_e].style,
          },
          cssId: "",
        },
        fe = [..._.buttons];
      (fe.splice(_e + 1, 0, ge),
        Z(_.id, {
          buttons: fe,
        }),
        x(ge.id),
        S("button"));
    },
    St = (Y, _e) => {
      !Y ||
        !_e ||
        Y === _e ||
        o((ge) => {
          const fe = ge.findIndex(($e) => $e.id === Y),
            Te = ge.findIndex(($e) => $e.id === _e);
          if (fe === -1 || Te === -1) return ge;
          const Pe = [...ge],
            [Oe] = Pe.splice(fe, 1);
          return (Pe.splice(Te, 0, Oe), Pe);
        });
    },
    De = (Y, _e) => {
      if (!_ || !Y || !_e || Y === _e) return;
      const ge = _.buttons.findIndex((Oe) => Oe.id === Y),
        fe = _.buttons.findIndex((Oe) => Oe.id === _e);
      if (ge === -1 || fe === -1) return;
      const Te = [..._.buttons],
        [Pe] = Te.splice(ge, 1);
      (Te.splice(fe, 0, Pe),
        Z(_.id, {
          buttons: Te,
        }));
    },
    xs = async (Y, _e, ge) => {
      var fe;
      N((Te) => {
        var Pe;
        return {
          ...Te,
          [Y]: {
            loading: !0,
            results: ((Pe = Te[Y]) == null ? void 0 : Pe.results) || [],
          },
        };
      });
      try {
        const Te = new URLSearchParams({
            search: ge,
            types: _e,
          }),
          Oe = await (
            await fetch(`${A}nexulesuite_/v1/menu-items/content-search?${Te}`, {
              credentials: "same-origin",
              headers: {
                "X-WP-Nonce": k,
              },
            })
          ).json(),
          $e = Array.isArray((fe = Oe == null ? void 0 : Oe.data) == null ? void 0 : fe.results) ? Oe.data.results : [];
        N((st) => ({
          ...st,
          [Y]: {
            loading: !1,
            results: $e,
          },
        }));
      } catch {
        N((Te) => ({
          ...Te,
          [Y]: {
            loading: !1,
            results: [],
          },
        }));
      }
    },
    _n = async () => {
      var Y, _e;
      W((ge) => ({
        ...ge,
        saving: !0,
        error: "",
      }));
      try {
        const ge = await fetch(`${A}nexulesuite_/v1/menu-items`, {
            method: "POST",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
              "X-WP-Nonce": k,
            },
            body: JSON.stringify({
              groups: a,
              globalFontSize: y,
            }),
          }),
          fe = await ge.json();
        if (!ge.ok || (fe == null ? void 0 : fe.success) !== !0)
          throw new Error((fe == null ? void 0 : fe.message) || "Save failed.");
        const Te = Array.isArray((Y = fe == null ? void 0 : fe.data) == null ? void 0 : Y.groups) ? fe.data.groups : a,
          Pe =
            typeof ((_e = fe == null ? void 0 : fe.data) == null ? void 0 : _e.globalFontSize) == "number"
              ? fe.data.globalFontSize
              : y;
        (o(Te),
          d(Te),
          P(Pe),
          T(Pe),
          W({
            loading: !1,
            saving: !1,
            error: "",
          }),
          C(!0));
      } catch (ge) {
        W((fe) => ({
          ...fe,
          saving: !1,
          error: (ge == null ? void 0 : ge.message) || "Save failed.",
        }));
      }
    },
    Sn = () => {
      var Y;
      (o(i), P(M), p(((Y = i[0]) == null ? void 0 : Y.id) ?? null), x(null), S("group"));
    },
    Fs = ({ btn: Y, isPopout: _e = !1 }) => {
      var ge, fe, Te, Pe, Oe, $e;
      return e.jsxs("a", {
        href: Y.url || "#",
        id: Y.cssId,
        className: `
      flex items-center justify-center gap-3 transition-all duration-300 font-bold select-none
      ${Y.displayMode === "block" && !_e ? "w-full" : "w-auto"}
      ${HOVER_EFFECT_CLASSES((ge = Y.style) == null ? void 0 : ge.hoverEffect)}
      ${Y.cssClass || ""}
    `,
        style: {
          backgroundColor: ((fe = Y.style) == null ? void 0 : fe.bg) || "#2563eb",
          color: ((Te = Y.style) == null ? void 0 : Te.text) || "#ffffff",
          padding: `${((Pe = Y.style) == null ? void 0 : Pe.paddingVertical) || 12}px ${((Oe = Y.style) == null ? void 0 : Oe.paddingHorizontal) || 24}px`,
          borderRadius: `${(($e = Y.style) == null ? void 0 : $e.radius) || 8}px`,
          fontSize: `${y}px`,
          textDecoration: "none",
        },
        onClick: (st) => st.preventDefault(),
        children: [
          BUTTON_ICON_MAP[Y.icon || "none"],
          e.jsx("span", {
            children: Y.label || "Button",
          }),
        ],
      });
    },
    Cn = () => {
      var ge;
      if (!_) return null;
      const Y = _.enabled !== !1,
        _e = () => {
          ue(_.id, "enabled", !Y);
        };
      return e.jsxs("div", {
        className: "nexulesuite_group-details-wrap nls-stack",
        children: [
          e.jsxs("div", {
            className: "nls-card",
            children: [
              e.jsx("div", {
                className: "nls-card__header",
                children: e.jsxs("h2", {
                  className: "nls-card__title",
                  children: [
                    e.jsxs("svg", {
                      width: "16",
                      height: "16",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      "aria-hidden": "true",
                      children: [
                        e.jsx("path", {
                          d: "M12 3l9 5-9 5-9-5 9-5z",
                        }),
                        e.jsx("path", {
                          d: "M3 13l9 5 9-5",
                        }),
                      ],
                    }),
                    "Group Details",
                  ],
                }),
              }),
              e.jsxs("div", {
                className: "nls-card__body nls-stack nls-stack--tight",
                children: [
                  e.jsxs("div", {
                    className: "nls-grid-2 nls-menus-gd-grid",
                    children: [
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsx("label", {
                            htmlFor: `nexulesuite_group-name-${_.id}`,
                            className: "nls-field__label",
                            children: "Group name",
                          }),
                          e.jsx("input", {
                            id: `nexulesuite_group-name-${_.id}`,
                            type: "text",
                            value: _.name || "",
                            onChange: (fe) => ue(_.id, "name", fe.target.value),
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsx("label", {
                            htmlFor: `nexulesuite_group-priority-${_.id}`,
                            className: "nls-field__label",
                            children: "Priority",
                          }),
                          e.jsx("input", {
                            id: `nexulesuite_group-priority-${_.id}`,
                            type: "number",
                            min: "0",
                            max: "999",
                            value: _.priority ?? 0,
                            onChange: (fe) => ue(_.id, "priority", Number(fe.target.value)),
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: `nexulesuite_gd-toggle${Y ? " on" : ""}`,
                    role: "switch",
                    "aria-checked": Y,
                    tabIndex: 0,
                    onClick: _e,
                    onKeyDown: (fe) => {
                      (fe.key === " " || fe.key === "Enter") && (fe.preventDefault(), _e());
                    },
                    children: [
                      e.jsx("span", {
                        className: "track",
                        children: e.jsx("span", {
                          className: "knob",
                        }),
                      }),
                      e.jsx("span", {
                        className: "lbl",
                        children: "Group enabled",
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "nls-card__footer",
                children: [
                  e.jsxs("button", {
                    type: "button",
                    onClick: () => {
                      var fe;
                      (S("button"), (fe = _.buttons) != null && fe.length && !h && x(_.buttons[0].id));
                    },
                    className: "nls-btn nls-btn--secondary",
                    children: [
                      e.jsx("svg", {
                        width: "15",
                        height: "15",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: "2",
                        "aria-hidden": "true",
                        children: e.jsx("path", {
                          d: "M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4",
                        }),
                      }),
                      "Manage buttons",
                      (ge = _.buttons) != null && ge.length
                        ? e.jsx("span", {
                            className: "nls-badge nls-badge--primary",
                            children: _.buttons.length,
                          })
                        : null,
                    ],
                  }),
                  e.jsxs("button", {
                    type: "button",
                    onClick: ve,
                    className: "nls-btn nls-btn--primary",
                    children: [
                      e.jsx("svg", {
                        width: "15",
                        height: "15",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: "2.4",
                        "aria-hidden": "true",
                        children: e.jsx("path", {
                          d: "M12 5v14M5 12h14",
                        }),
                      }),
                      "Add button",
                    ],
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
                children: e.jsxs("h2", {
                  className: "nls-card__title",
                  children: [
                    e.jsx("svg", {
                      width: "16",
                      height: "16",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      "aria-hidden": "true",
                      children: e.jsx("path", {
                        d: "M4 6h16M7 12h10M10 18h4",
                      }),
                    }),
                    "Display Conditions",
                  ],
                }),
              }),
              e.jsx("div", {
                className: "nls-card__body",
                children: e.jsx(DisplayConditions, {
                  variant: "reference",
                  conditions: _.conditions || {
                    match: "any",
                    rules: [],
                  },
                  onChange: (fe) =>
                    Z(_.id, {
                      conditions: fe,
                    }),
                  conditionMeta: z,
                  contentSearch: w,
                  onSearchContent: xs,
                  searchKeyPrefix: _.id,
                  description:
                    "Multiple groups can be active on the same page. Leave all rules unchecked to show on every page.",
                }),
              }),
            ],
          }),
        ],
      });
    },
    Es = () => {
      var _e, ge, fe, Te, Pe, Oe;
      if (!_ || !X) return null;
      const Y = X;
      return e.jsxs("div", {
        className: "nexulesuite_btn-editor-wrap nls-stack",
        children: [
          e.jsxs("div", {
            className: "nls-card",
            children: [
              e.jsx("div", {
                className: "nls-card__header",
                children: e.jsxs("h2", {
                  className: "nls-card__title",
                  children: [
                    e.jsx("svg", {
                      width: "16",
                      height: "16",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      "aria-hidden": "true",
                      children: e.jsx("path", {
                        d: "M4 7V4h16v3M9 20h6M12 4v16",
                      }),
                    }),
                    "Content & Action",
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
                          e.jsx("span", {
                            className: "lbl nls-field__label",
                            children: "Button text",
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: Y.label || "",
                            onChange: ($e) => Q(_.id, Y.id, "label", $e.target.value),
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsx("span", {
                            className: "lbl nls-field__label",
                            children: "Action icon",
                          }),
                          e.jsxs("select", {
                            value: Y.icon || "none",
                            onChange: ($e) => Q(_.id, Y.id, "icon", $e.target.value),
                            children: [
                              e.jsx("option", {
                                value: "none",
                                children: "No Icon",
                              }),
                              e.jsx("option", {
                                value: "call",
                                children: "Call (Phone)",
                              }),
                              e.jsx("option", {
                                value: "mail",
                                children: "Email (Envelope)",
                              }),
                              e.jsx("option", {
                                value: "message",
                                children: "Message (Chat)",
                              }),
                              e.jsx("option", {
                                value: "location",
                                children: "Location (Map)",
                              }),
                              e.jsx("option", {
                                value: "appointment",
                                children: "Appointment (Calendar)",
                              }),
                              e.jsx("option", {
                                value: "download",
                                children: "Download",
                              }),
                              e.jsx("option", {
                                value: "popup",
                                children: "Trigger Pop-up",
                              }),
                              e.jsx("option", {
                                value: "cta",
                                children: "Action (Pointer)",
                              }),
                              e.jsx("option", {
                                value: "event",
                                children: "Event (Bell)",
                              }),
                              e.jsx("option", {
                                value: "arrow",
                                children: "Next (Arrow)",
                              }),
                            ],
                          }),
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
                          e.jsx("span", {
                            className: "lbl nls-field__label",
                            children: "Link URL",
                          }),
                          e.jsx("input", {
                            type: "text",
                            value: Y.url || "",
                            placeholder: "https://example.com",
                            onChange: ($e) => Q(_.id, Y.id, "url", $e.target.value),
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsx("span", {
                            className: "lbl nls-field__label",
                            children: "Popup event id (manual click)",
                          }),
                          F.length > 0
                            ? e.jsxs("select", {
                                value: Y.eventName || "",
                                onChange: ($e) => Q(_.id, Y.id, "eventName", $e.target.value),
                                children: [
                                  e.jsx("option", {
                                    value: "",
                                    children: "— No popup (use Link URL) —",
                                  }),
                                  F.map(($e) => {
                                    const st = String($e.eventName || "").trim() || String($e.id || "").trim();
                                    return e.jsxs(
                                      "option",
                                      {
                                        value: st,
                                        children: [st, " · ", $e.name || "Unnamed"],
                                      },
                                      $e.id,
                                    );
                                  }),
                                ],
                              })
                            : e.jsx("input", {
                                type: "text",
                                className: "nls-mono",
                                value: Y.eventName || "",
                                placeholder: "e.g. nexus-pop",
                                onChange: ($e) => Q(_.id, Y.id, "eventName", $e.target.value),
                              }),
                          e.jsxs("div", {
                            className: "nls-field__hint",
                            children: [
                              "Select a popup from the list, or go to the ",
                              e.jsx("b", {
                                children: "Popups page",
                              }),
                              " to create one first.",
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
          e.jsxs("div", {
            className: "nls-card",
            children: [
              e.jsx("div", {
                className: "nls-card__header",
                children: e.jsxs("h2", {
                  className: "nls-card__title",
                  children: [
                    e.jsxs("svg", {
                      width: "16",
                      height: "16",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      "aria-hidden": "true",
                      children: [
                        e.jsx("circle", {
                          cx: "13.5",
                          cy: "6.5",
                          r: "2.5",
                        }),
                        e.jsx("circle", {
                          cx: "6.5",
                          cy: "12",
                          r: "2.5",
                        }),
                        e.jsx("circle", {
                          cx: "15",
                          cy: "16",
                          r: "2.5",
                        }),
                        e.jsx("path", {
                          d: "M3 21c2-4 4-6 8-7",
                        }),
                      ],
                    }),
                    "Visual Styling",
                  ],
                }),
              }),
              e.jsxs("div", {
                className: "nls-card__body nls-stack nls-stack--tight",
                children: [
                  e.jsxs("div", {
                    className: "nls-grid-3",
                    children: [
                      e.jsx(ColorField, {
                        label: "Background",
                        value: ((_e = Y.style) == null ? void 0 : _e.bg) || "#10b981",
                        onChange: ($e) => he(_.id, Y.id, "bg", $e),
                      }),
                      e.jsx(ColorField, {
                        label: "Text color",
                        value: ((ge = Y.style) == null ? void 0 : ge.text) || "#ffffff",
                        onChange: ($e) => he(_.id, Y.id, "text", $e),
                      }),
                      e.jsxs("div", {
                        className: "nls-field",
                        children: [
                          e.jsx("span", {
                            className: "lbl nls-field__label",
                            children: "Hover animation",
                          }),
                          e.jsxs("select", {
                            value: ((fe = Y.style) == null ? void 0 : fe.hoverEffect) || "glow",
                            onChange: ($e) => he(_.id, Y.id, "hoverEffect", $e.target.value),
                            children: [
                              e.jsx("option", {
                                value: "none",
                                children: "None",
                              }),
                              e.jsx("option", {
                                value: "glow",
                                children: "Outer Glow",
                              }),
                              e.jsx("option", {
                                value: "lift",
                                children: "Lift",
                              }),
                              e.jsx("option", {
                                value: "scale",
                                children: "Scale up",
                              }),
                              e.jsx("option", {
                                value: "shake",
                                children: "Wobble/Shake",
                              }),
                              e.jsx("option", {
                                value: "rotate",
                                children: "Slight Rotate",
                              }),
                              e.jsx("option", {
                                value: "darken",
                                children: "Color Shift",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "slide-grid",
                    children: [
                      e.jsx(RangeSlider, {
                        label: "Vertical padding",
                        value: ((Te = Y.style) == null ? void 0 : Te.paddingVertical) || 12,
                        min: 0,
                        max: 100,
                        unit: "px",
                        onChange: ($e) => he(_.id, Y.id, "paddingVertical", $e),
                      }),
                      e.jsx(RangeSlider, {
                        label: "Border radius",
                        value: ((Pe = Y.style) == null ? void 0 : Pe.radius) || 8,
                        min: 0,
                        max: 100,
                        unit: "px",
                        onChange: ($e) => he(_.id, Y.id, "radius", $e),
                      }),
                      e.jsx(RangeSlider, {
                        label: "Horizontal padding",
                        value: ((Oe = Y.style) == null ? void 0 : Oe.paddingHorizontal) || 24,
                        min: 0,
                        max: 100,
                        unit: "px",
                        onChange: ($e) => he(_.id, Y.id, "paddingHorizontal", $e),
                      }),
                      e.jsx(RangeSlider, {
                        label: "Font size",
                        accent: "(all buttons)",
                        value: y,
                        min: 10,
                        max: 24,
                        unit: "px",
                        onChange: ($e) => P(Number($e)),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    };
  return e.jsxs(PageFrame, {
    title: "Smart Buttons",
    subtitle: "Configure triggers, styles and actions",
    icon: e.jsx(wm, {
      size: 20,
    }),
    headerRight: e.jsxs(e.Fragment, {
      children: [
        e.jsxs("button", {
          type: "button",
          onClick: oe,
          className: "nls-btn nls-btn--secondary",
          children: [
            e.jsx(dt, {
              size: 16,
              "aria-hidden": "true",
            }),
            " Add Group",
          ],
        }),
        e.jsxs("button", {
          type: "button",
          onClick: ve,
          disabled: !_,
          className: "nls-btn nls-btn--primary",
          children: [
            e.jsx(dt, {
              size: 18,
              "aria-hidden": "true",
            }),
            " Add New Button",
          ],
        }),
      ],
    }),
    footer: e.jsx(StickyFooter, {
      actions: e.jsxs(e.Fragment, {
        children: [
          e.jsx("button", {
            type: "button",
            onClick: Sn,
            disabled: !L || H.saving,
            className: "nls-btn nls-btn--ghost",
            children: "Discard",
          }),
          e.jsx("button", {
            type: "button",
            onClick: _n,
            disabled: H.saving || !L,
            className: "nls-btn nls-btn--primary",
            children: H.saving ? "Saving…" : "Save All Buttons",
          }),
        ],
      }),
    }),
    children: [
      e.jsx(SuccessModal, {
        open: I,
        message: "Your settings have been successfully updated. All changes are now live.",
        onDismiss: () => C(!1),
      }),
      e.jsxs("div", {
        className: "nls-split nls-menus-split",
        children: [
          e.jsx("aside", {
            className: "nls-split__aside nls-card",
            children:
              f === "group"
                ? e.jsxs(e.Fragment, {
                    children: [
                      e.jsxs("div", {
                        className: "nls-split__aside-head",
                        children: [
                          e.jsxs("div", {
                            className: "min-w-0",
                            children: [
                              e.jsx("h2", {
                                className: "nls-split__aside-title",
                                children: "Button Groups",
                              }),
                              e.jsx("p", {
                                className: "nls-split__aside-sub",
                                children: "Drag to reorder",
                              }),
                            ],
                          }),
                          e.jsx("button", {
                            type: "button",
                            onClick: oe,
                            className: "nls-icon-btn nls-icon-btn--primary",
                            title: "Add group",
                            "aria-label": "Add group",
                            children: e.jsx(dt, {
                              size: 16,
                            }),
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "nls-split__aside-body nls-menus-list",
                        children: H.loading
                          ? e.jsxs("div", {
                              className: "nls-loading nls-menus-loading",
                              children: [
                                e.jsx("span", {
                                  className: "nls-spinner",
                                  "aria-hidden": "true",
                                }),
                                "Loading…",
                              ],
                            })
                          : a.length === 0
                            ? e.jsx("div", {
                                className: "nls-empty-inline",
                                children: "No groups yet.",
                              })
                            : a.map((Y) => {
                                var ge, fe;
                                const _e = u === Y.id;
                                return e.jsxs(
                                  "div",
                                  {
                                    onClick: () => {
                                      (p(Y.id), x(null), S("group"));
                                    },
                                    onDragOver: (Te) => {
                                      (Te.preventDefault(), me(Y.id));
                                    },
                                    onDragLeave: () => me(null),
                                    onDrop: (Te) => {
                                      (Te.preventDefault(), Te.stopPropagation(), St(le, Y.id), ie(null), me(null));
                                    },
                                    className: `nls-list-row${_e ? " is-active" : ""}${pe === Y.id && le !== Y.id ? " is-drop-target" : ""}${le === Y.id ? " is-dragging" : ""}`,
                                    children: [
                                      e.jsx("button", {
                                        type: "button",
                                        draggable: !0,
                                        onDragStart: (Te) => {
                                          (ie(Y.id), (Te.dataTransfer.effectAllowed = "move"));
                                        },
                                        onDragEnd: () => {
                                          (ie(null), me(null));
                                        },
                                        onClick: (Te) => Te.stopPropagation(),
                                        className: "nls-list-row__handle",
                                        title: "Drag to reorder",
                                        "aria-label": "Drag to reorder",
                                        children: e.jsx(Ni, {
                                          size: 16,
                                        }),
                                      }),
                                      e.jsx("div", {
                                        className: "nls-list-row__main",
                                        children: e.jsxs("div", {
                                          className: "min-w-0",
                                          children: [
                                            e.jsx("div", {
                                              className: "nls-list-row__title",
                                              children: Y.name || "Untitled group",
                                            }),
                                            e.jsxs("div", {
                                              className: "nls-list-row__meta",
                                              children: [
                                                "Priority ",
                                                Y.priority ?? 0,
                                                " · ",
                                                ((ge = Y.buttons) == null ? void 0 : ge.length) || 0,
                                                " button",
                                                (((fe = Y.buttons) == null ? void 0 : fe.length) || 0) === 1 ? "" : "s",
                                              ],
                                            }),
                                          ],
                                        }),
                                      }),
                                      e.jsx("div", {
                                        className: "nls-list-row__actions",
                                        children: e.jsx("button", {
                                          type: "button",
                                          onClick: (Te) => {
                                            (Te.stopPropagation(), xe(Y.id));
                                          },
                                          className: "nls-icon-btn nls-icon-btn--sm nls-icon-btn--danger",
                                          title: "Delete group",
                                          "aria-label": "Delete group",
                                          children: e.jsx(yt, {
                                            size: 14,
                                          }),
                                        }),
                                      }),
                                    ],
                                  },
                                  Y.id,
                                );
                              }),
                      }),
                    ],
                  })
                : e.jsxs(e.Fragment, {
                    children: [
                      e.jsxs("div", {
                        className: "nls-split__aside-head nls-menus-aside-head",
                        children: [
                          e.jsxs("div", {
                            className: "min-w-0",
                            children: [
                              e.jsxs("button", {
                                type: "button",
                                onClick: () => {
                                  (S("group"), x(null));
                                },
                                className: "nls-btn nls-btn--ghost nls-btn--sm nls-menus-back",
                                children: [
                                  e.jsx(bi, {
                                    size: 14,
                                    "aria-hidden": "true",
                                  }),
                                  "Back to groups",
                                ],
                              }),
                              e.jsx("h2", {
                                className: "nls-split__aside-title",
                                children: "Button Layers",
                              }),
                              e.jsxs("p", {
                                className: "nls-split__aside-sub truncate",
                                title: _ == null ? void 0 : _.name,
                                children: [(_ == null ? void 0 : _.name) || "Group", " · Drag to reorder"],
                              }),
                            ],
                          }),
                          e.jsx("button", {
                            type: "button",
                            onClick: ve,
                            disabled: !_,
                            className: "nls-icon-btn nls-icon-btn--primary",
                            title: "Add button",
                            "aria-label": "Add button",
                            children: e.jsx(dt, {
                              size: 16,
                            }),
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "nls-split__aside-body nls-menus-list",
                        children: _
                          ? _.buttons.length === 0
                            ? e.jsxs("div", {
                                className: "nls-empty-inline",
                                children: [
                                  e.jsx("p", {
                                    children: "No buttons in this group.",
                                  }),
                                  e.jsxs("button", {
                                    type: "button",
                                    onClick: ve,
                                    className: "nls-btn nls-btn--primary nls-btn--sm nls-menus-empty-action",
                                    children: [
                                      e.jsx(dt, {
                                        size: 14,
                                        "aria-hidden": "true",
                                      }),
                                      " Add button",
                                    ],
                                  }),
                                ],
                              })
                            : _.buttons.map((Y) => {
                                const _e = h === Y.id;
                                return e.jsxs(
                                  "div",
                                  {
                                    onClick: () => {
                                      (x(Y.id), S("button"));
                                    },
                                    onDragOver: (ge) => {
                                      (ge.preventDefault(), ee(Y.id));
                                    },
                                    onDragLeave: () => ee(null),
                                    onDrop: (ge) => {
                                      (ge.preventDefault(), ge.stopPropagation(), De(O, Y.id), te(null), ee(null));
                                    },
                                    className: `nls-list-row${_e ? " is-active" : ""}${B === Y.id && O !== Y.id ? " is-drop-target" : ""}${O === Y.id ? " is-dragging" : ""}`,
                                    children: [
                                      e.jsx("button", {
                                        type: "button",
                                        draggable: !0,
                                        onDragStart: (ge) => {
                                          (te(Y.id), (ge.dataTransfer.effectAllowed = "move"));
                                        },
                                        onDragEnd: () => {
                                          (te(null), ee(null));
                                        },
                                        onClick: (ge) => ge.stopPropagation(),
                                        className: "nls-list-row__handle",
                                        title: "Drag to reorder",
                                        "aria-label": "Drag to reorder",
                                        children: e.jsx(Ni, {
                                          size: 16,
                                        }),
                                      }),
                                      e.jsxs("div", {
                                        className: "nls-list-row__main",
                                        children: [
                                          BUTTON_ICON_MAP[Y.icon || "none"]
                                            ? e.jsx("span", {
                                                className: "nls-menus-row-ico",
                                                "aria-hidden": "true",
                                                children: BUTTON_ICON_MAP[Y.icon || "none"],
                                              })
                                            : null,
                                          e.jsx("div", {
                                            className: "nls-list-row__title",
                                            children: Y.label,
                                          }),
                                        ],
                                      }),
                                      e.jsxs("div", {
                                        className: "nls-list-row__actions",
                                        onClick: (ge) => ge.stopPropagation(),
                                        children: [
                                          e.jsx("button", {
                                            type: "button",
                                            onClick: () => j(Y),
                                            className: "nls-icon-btn nls-icon-btn--sm nls-icon-btn--primary",
                                            title: "Quick Preview",
                                            "aria-label": "Quick Preview",
                                            children: e.jsx(Rt, {
                                              size: 14,
                                            }),
                                          }),
                                          e.jsx("button", {
                                            type: "button",
                                            onClick: () => Xe(Y.id),
                                            className: "nls-icon-btn nls-icon-btn--sm nls-icon-btn--primary",
                                            title: "Duplicate",
                                            "aria-label": "Duplicate",
                                            children: e.jsx($s, {
                                              size: 14,
                                            }),
                                          }),
                                          e.jsx("button", {
                                            type: "button",
                                            onClick: () => Ke(Y.id),
                                            className: "nls-icon-btn nls-icon-btn--sm nls-icon-btn--danger",
                                            title: "Delete button",
                                            "aria-label": "Delete button",
                                            children: e.jsx(yt, {
                                              size: 14,
                                            }),
                                          }),
                                        ],
                                      }),
                                    ],
                                  },
                                  Y.id,
                                );
                              })
                          : e.jsx("div", {
                              className: "nls-empty-inline",
                              children: "Select a group first.",
                            }),
                      }),
                    ],
                  }),
          }),
          e.jsxs("div", {
            className: "nls-split__main nls-stack nls-stack--tight",
            children: [
              H.error
                ? e.jsx("div", {
                    className: "nls-notice nls-notice--danger",
                    role: "alert",
                    children: H.error,
                  })
                : null,
              _
                ? f === "group"
                  ? Cn()
                  : f === "button" && X
                    ? Es()
                    : e.jsx("p", {
                        className: "nls-empty-inline",
                        children: "Select a button from the sidebar or add a new one.",
                      })
                : e.jsxs("div", {
                    className: "nls-empty",
                    children: [
                      e.jsx("div", {
                        className: "nls-empty__icon",
                        "aria-hidden": "true",
                        children: e.jsx(wm, {
                          size: 22,
                        }),
                      }),
                      e.jsx("p", {
                        className: "nls-empty__desc",
                        children: "Create a button group to get started.",
                      }),
                      e.jsx("div", {
                        className: "nls-empty__actions",
                        children: e.jsxs("button", {
                          type: "button",
                          onClick: oe,
                          className: "nls-btn nls-btn--primary",
                          children: [
                            e.jsx(dt, {
                              size: 16,
                              "aria-hidden": "true",
                            }),
                            " Add Group",
                          ],
                        }),
                      }),
                    ],
                  }),
            ],
          }),
        ],
      }),
      e.jsx(ModalShell, {
        open: !!J,
        onClose: () => j(null),
        size: "md",
        labelledBy: "nexulesuite_menus-preview-title",
        children: J
          ? e.jsxs(e.Fragment, {
              children: [
                e.jsxs("div", {
                  className: "nls-modal__header",
                  children: [
                    e.jsxs("h4", {
                      id: "nexulesuite_menus-preview-title",
                      className: "nls-modal__title nls-row",
                      children: [
                        e.jsx(Rt, {
                          size: 18,
                          "aria-hidden": "true",
                        }),
                        "Quick Preview: ",
                        J.label,
                      ],
                    }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => j(null),
                      className: "nls-icon-btn",
                      "aria-label": "Close",
                      children: e.jsx(_t, {
                        size: 20,
                      }),
                    }),
                  ],
                }),
                e.jsx("div", {
                  className: "nls-modal__body",
                  children: e.jsxs("div", {
                    className: "nls-menus-preview-stage",
                    children: [
                      e.jsx(Fs, {
                        btn: J,
                        isPopout: !0,
                      }),
                      e.jsx("p", {
                        className: "nls-menus-preview-note",
                        children: "This is how your button looks in isolation.",
                      }),
                    ],
                  }),
                }),
                e.jsx("div", {
                  className: "nls-modal__footer",
                  children: e.jsx("button", {
                    type: "button",
                    onClick: () => j(null),
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
