import * as b from "react";
import * as e from "react/jsx-runtime";
import {
  Code as Dl,
  Eye as Rt,
  Laptop as pm,
  Layers as Wl,
  Plus as dt,
  Save as bn,
  Smartphone as od,
  Sparkles as Ra,
  Tablet as Sm,
  Target as dd,
  Trash2 as yt,
  X as _t,
} from "lucide-react";
import { DisplayConditions, SuccessModal, nlsRange } from "../shared/common.js";

const Is = "nexus-heading-mce";
function HeadingEditor({ heading: a, onChange: o, disabled: i }) {
  const [d, u] = b.useState("visual"),
    [p, h] = b.useState(!1),
    x = b.useRef(null),
    f = b.useRef(null),
    S = b.useRef(null),
    y = b.useRef(null),
    P = b.useRef(null),
    M = b.useRef(o);
  M.current = o;
  const T = b.useCallback(() => {
    const z = S.current,
      U = d === "code" ? P.current : y.current,
      w = z == null ? void 0 : z.querySelector(".glider");
    !z ||
      !U ||
      !w ||
      ((w.style.width = `${U.offsetWidth}px`), (w.style.transform = `translateX(${U.offsetLeft - 4}px)`));
  }, [d]);
  (b.useEffect(() => (T(), window.addEventListener("resize", T), () => window.removeEventListener("resize", T)), [T]),
    b.useEffect(() => {
      var N;
      if (i) {
        const H = x.current || ((N = window == null ? void 0 : window.tinymce) == null ? void 0 : N.get(Is));
        if (H)
          try {
            H.remove();
          } catch {}
        x.current = null;
        return;
      }
      let z = !1,
        U;
      const w = () => {
        if (z) return;
        if (!(window != null && window.tinymce)) {
          U = setTimeout(w, 300);
          return;
        }
        if (!document.getElementById(Is)) {
          U = setTimeout(w, 100);
          return;
        }
        const H = window.tinymce.get(Is);
        if (H)
          try {
            H.remove();
          } catch {}
        window.tinymce.init({
          selector: `textarea#${Is}`,
          height: 170,
          menubar: !1,
          statusbar: !1,
          branding: !1,
          wpautop: !1,
          plugins: "lists link hr charmap paste textcolor colorpicker",
          toolbar:
            "formatselect | bold italic underline strikethrough | alignleft aligncenter alignright | bullist numlist | link | forecolor backcolor | removeformat | undo redo",
          content_style:
            'body { font-family: "Plus Jakarta Sans", system-ui, sans-serif; font-size: 20px; line-height: 1.35; color: #0f172a; padding: 18px; margin: 0; }',
          setup: (W) => {
            ((x.current = W),
              W.on("init", () => {
                W.setContent(a || "");
              }),
              W.on("change keyup input", () => {
                M.current(W.getContent());
              }),
              W.on("focus", () => h(!0)),
              W.on("blur", () => h(!1)));
          },
        });
      };
      return (
        (U = setTimeout(w, 200)),
        () => {
          var W;
          ((z = !0), U && clearTimeout(U));
          const H = x.current || ((W = window == null ? void 0 : window.tinymce) == null ? void 0 : W.get(Is));
          if (H)
            try {
              H.remove();
            } catch {}
          x.current = null;
        }
      );
    }, [i]),
    b.useEffect(() => {
      var U;
      const z = x.current || ((U = window == null ? void 0 : window.tinymce) == null ? void 0 : U.get(Is));
      (z != null && z.initialized && d === "visual" && z.setContent(a || ""),
        d === "code" && f.current && (f.current.value = a || ""));
    }, [a, d]));
  const F = () => {
      var w;
      const z = x.current || ((w = window == null ? void 0 : window.tinymce) == null ? void 0 : w.get(Is)),
        U = z != null && z.initialized ? z.getContent() : a || "";
      (f.current && (f.current.value = U), o(U), u("code"));
    },
    V = () => {
      var U;
      const z = ((U = f.current) == null ? void 0 : U.value) ?? (a || "");
      (o(z),
        u("visual"),
        setTimeout(() => {
          var N;
          const w = x.current || ((N = window == null ? void 0 : window.tinymce) == null ? void 0 : N.get(Is));
          w != null && w.initialized && w.setContent(z);
        }, 50));
    };
  return e.jsxs("div", {
    className: ["rte nexus-mce-wrap", p ? "focused" : ""].filter(Boolean).join(" "),
    children: [
      e.jsx("div", {
        style: {
          display: d === "visual" ? "block" : "none",
        },
        children: e.jsx("textarea", {
          id: Is,
          defaultValue: a || "",
          className: "nexus-mce-textarea",
        }),
      }),
      d === "code" &&
        e.jsx("textarea", {
          ref: f,
          defaultValue: a || "",
          onChange: (z) => o(z.target.value),
          onFocus: () => h(!0),
          onBlur: () => h(!1),
          className: "rte-code",
        }),
      e.jsx("div", {
        className: "rte-foot",
        children: e.jsxs("div", {
          className: "seg auto-width",
          ref: S,
          role: "tablist",
          "aria-label": "Edit mode",
          children: [
            e.jsx("span", {
              className: "glider",
            }),
            e.jsx("button", {
              ref: y,
              type: "button",
              className: d === "visual" ? "active" : "",
              role: "tab",
              "aria-selected": d === "visual",
              onClick: V,
              children: "Visual",
            }),
            e.jsx("button", {
              ref: P,
              type: "button",
              className: d === "code" ? "active" : "",
              role: "tab",
              "aria-selected": d === "code",
              onClick: F,
              children: "Code",
            }),
          ],
        }),
      }),
    ],
  });
}
const fx = [
    {
      id: "left",
      label: "Align left",
      icon: e.jsx("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        children: e.jsx("path", {
          d: "M4 6h16M4 12h10M4 18h13",
        }),
      }),
    },
    {
      id: "center",
      label: "Align center",
      icon: e.jsx("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        children: e.jsx("path", {
          d: "M4 6h16M7 12h10M5 18h14",
        }),
      }),
    },
    {
      id: "right",
      label: "Align right",
      icon: e.jsx("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        children: e.jsx("path", {
          d: "M4 6h16M10 12h10M7 18h13",
        }),
      }),
    },
  ],
  gx = [
    {
      key: "headingBgColor",
      label: "Header",
      badge: "Area 1",
    },
    {
      key: "bodyBgColor",
      label: "Body",
      badge: "Area 2",
    },
    {
      key: "buttonColor",
      label: "Button",
    },
    {
      key: "closeIconColor",
      label: "Icon color",
    },
    {
      key: "closeIconBg",
      label: "Icon bg",
    },
  ];
function SegmentedControl({ value: a, onChange: o }) {
  const i = b.useRef(null),
    d = b.useRef({}),
    u = b.useCallback(() => {
      const p = i.current,
        h = d.current[a],
        x = p == null ? void 0 : p.querySelector(".glider");
      !p ||
        !h ||
        !x ||
        ((x.style.width = `${h.offsetWidth}px`), (x.style.transform = `translateX(${h.offsetLeft - 4}px)`));
    }, [a]);
  return (
    b.useEffect(() => (u(), window.addEventListener("resize", u), () => window.removeEventListener("resize", u)), [u]),
    e.jsxs("div", {
      className: "seg icononly",
      ref: i,
      role: "tablist",
      "aria-label": "Text alignment",
      children: [
        e.jsx("span", {
          className: "glider",
        }),
        fx.map((p) =>
          e.jsx(
            "button",
            {
              ref: (h) => {
                d.current[p.id] = h;
              },
              type: "button",
              className: a === p.id ? "active" : "",
              role: "tab",
              "aria-label": p.label,
              onClick: () => o(p.id),
              children: p.icon,
            },
            p.id,
          ),
        ),
      ],
    })
  );
}
function PopupSlider({ label: a, value: o, min: i, max: d, unit: u, onChange: p }) {
  const [h, x] = b.useState(!1);
  const f = !isNaN(parseInt(o, 10)) ? Math.max(i, Math.min(d, parseInt(o, 10))) : i,
    S = d === i ? 0 : ((f - i) / (d - i)) * 100;
  return e.jsxs("div", {
    className: `slide-field${h ? " dragging" : ""}`,
    children: [
      e.jsxs("label", {
        children: [
          a,
          " ",
          e.jsxs("span", {
            className: "val",
            children: [f, u],
          }),
        ],
      }),
      e.jsx(nlsRange, {
        min: i,
        max: d,
        value: f,
        style: {
          "--pct": `${S}%`,
        },
        onChange: (y) => p(y.target.value),
        onPointerDown: () => x(!0),
        onPointerUp: () => x(!1),
        onPointerCancel: () => x(!1),
        onBlur: () => x(!1),
      }),
    ],
  });
}
function PopupColorField({ label: a, badge: o, colorKey: i, value: d, onChange: u }) {
  const p = d || "#ffffff",
    h = (x) => {
      u(i, x);
    };
  return e.jsxs("div", {
    children: [
      e.jsxs("div", {
        className: "clab",
        children: [
          e.jsx("span", {
            className: "t",
            children: a,
          }),
          o
            ? e.jsx("span", {
                className: "badge",
                children: o,
              })
            : null,
        ],
      }),
      e.jsxs("div", {
        className: "cgroup",
        children: [
          e.jsx("span", {
            className: "cswatch",
            style: {
              background: p,
            },
            children: e.jsx("input", {
              type: "color",
              value: p,
              onChange: (x) => h(x.target.value),
            }),
          }),
          e.jsx("input", {
            type: "text",
            className: "chex",
            value: p,
            onChange: (x) => {
              let f = x.target.value.trim();
              (f && !f.startsWith("#") && (f = `#${f}`), h(f));
            },
          }),
        ],
      }),
    ],
  });
}
export function PopupsPage() {
  var B, ee, _, X, nlsPopBodyFs;
  const a = () => ({
      id: `pop-${Date.now()}`,
      name: "New Popup",
      eventName: `nexus-pop-${Date.now()}`,
      heading: '<h2 style="margin:0; font-weight:500;">New Campaign Heading</h2>',
      headingEditMode: "visual",
      subHeading: "Sub-text here",
      textAlign: "left",
      content: "<p>Content...</p>",
      style: {
        buttonColor: "#2563eb",
        buttonWidth: "100",
        headingTextColor: "#ffffff",
        headingBgColor: "#1e3a8a",
        headingFontSize: "20",
        bodyFontSize: "14",
        bodyBgColor: "#ffffff",
        width: "600",
        radius: "16",
        padding: "30",
        closeIconSize: "20",
        closeIconColor: "#ffffff",
        closeIconBg: "#ff4444",
      },
      logic: [
        {
          id: "L1",
          trigger: "scroll",
          delay: "0",
          scrollPercentage: "0",
        },
      ],
      conditions: {
        match: "any",
        rules: [],
      },
    }),
    [o, i] = b.useState([]),
    [d, u] = b.useState(null),
    [p, h] = b.useState(null),
    [x, f] = b.useState("desktop"),
    [S, y] = b.useState({
      loading: !0,
      saving: !1,
      error: "",
    }),
    [P, M] = b.useState(!1),
    [T, F] = b.useState([]),
    [V, z] = b.useState({
      postTypes: [],
      categories: [],
      tags: [],
    }),
    [U, w] = b.useState({}),
    N = b.useMemo(() => o.find((L) => L.id === d) || o[0], [o, d]),
    H = b.useMemo(() => JSON.stringify(o) !== JSON.stringify(T), [o, T]);
  b.useEffect(() => {
    let L = !1;
    async function A() {
      var k, Z, ue, Q, he;
      y({
        loading: !0,
        saving: !1,
        error: "",
      });
      try {
        const oe =
            ((k = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : k.restUrl) || "/wp-json/",
          [xe, ve] = await Promise.all([
            fetch(`${oe}nexulesuite_/v1/popups`, {
              method: "GET",
              credentials: "same-origin",
              headers: {
                "X-WP-Nonce":
                  ((Z = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : Z.nonce) || "",
              },
            }),
            fetch(`${oe}nexulesuite_/v1/menu-items/condition-meta`, {
              method: "GET",
              credentials: "same-origin",
              headers: {
                "X-WP-Nonce":
                  ((ue = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : ue.nonce) || "",
              },
            }),
          ]),
          Ke = await xe.json(),
          Xe = await ve.json(),
          St = Array.isArray((Q = Ke == null ? void 0 : Ke.data) == null ? void 0 : Q.popups) ? Ke.data.popups : [];
        if (L) return;
        (i(St),
          F(St),
          u(((he = St[0]) == null ? void 0 : he.id) || null),
          Xe != null &&
            Xe.data &&
            z({
              postTypes: Array.isArray(Xe.data.postTypes) ? Xe.data.postTypes : [],
              categories: Array.isArray(Xe.data.categories) ? Xe.data.categories : [],
              tags: Array.isArray(Xe.data.tags) ? Xe.data.tags : [],
            }),
          y({
            loading: !1,
            saving: !1,
            error: "",
          }));
      } catch (oe) {
        if (L) return;
        (i([]),
          F([]),
          u(null),
          y({
            loading: !1,
            saving: !1,
            error: (oe == null ? void 0 : oe.message) || "Failed to load popups.",
          }));
      }
    }
    return (
      A(),
      () => {
        L = !0;
      }
    );
  }, []);
  const W = (L) => {
      N &&
        i((A) =>
          A.map((k) =>
            k.id === N.id
              ? {
                  ...k,
                  ...L,
                }
              : k,
          ),
        );
    },
    I = (L) => {
      N &&
        i((A) =>
          A.map((k) =>
            k.id === N.id
              ? {
                  ...k,
                  style: {
                    ...k.style,
                    ...L,
                  },
                }
              : k,
          ),
        );
    },
    C = (L, A) => {
      if (!N) return;
      const k = (N.logic || []).map((Z) =>
        Z.id === L
          ? {
              ...Z,
              ...A,
            }
          : Z,
      );
      W({
        logic: k,
      });
    },
    J = () => {
      if (!N) return;
      const L = [
        ...(N.logic || []),
        {
          id: `L-${Date.now()}`,
          trigger: "timer",
          delay: "5",
          scrollPercentage: "0",
        },
      ];
      W({
        logic: L,
      });
    },
    j = (L) => {
      N &&
        ((N.logic || []).length <= 1 ||
          W({
            logic: N.logic.filter((A) => A.id !== L),
          }));
    },
    le = () => {
      const L = a();
      (i((A) => [...A, L]), u(L.id));
    },
    ie = (L) => {
      i((A) => {
        const k = A.filter((Z) => Z.id !== L);
        return (
          u((Z) => {
            var ue;
            return Z === L ? ((ue = k[0]) == null ? void 0 : ue.id) || null : Z;
          }),
          k
        );
      });
    },
    O = async (L, A, k) => {
      var Z, ue, Q;
      w((he) => {
        var oe;
        return {
          ...he,
          [L]: {
            loading: !0,
            results: ((oe = he[L]) == null ? void 0 : oe.results) || [],
          },
        };
      });
      try {
        const he =
            ((Z = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : Z.restUrl) || "/wp-json/",
          oe = new URLSearchParams({
            search: k,
            types: A,
          }),
          ve = await (
            await fetch(`${he}nexulesuite_/v1/menu-items/content-search?${oe}`, {
              credentials: "same-origin",
              headers: {
                "X-WP-Nonce":
                  ((ue = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : ue.nonce) || "",
              },
            })
          ).json(),
          Ke = Array.isArray((Q = ve == null ? void 0 : ve.data) == null ? void 0 : Q.results) ? ve.data.results : [];
        w((Xe) => ({
          ...Xe,
          [L]: {
            loading: !1,
            results: Ke,
          },
        }));
      } catch {
        w((he) => ({
          ...he,
          [L]: {
            loading: !1,
            results: [],
          },
        }));
      }
    },
    te = () => {
      var L;
      (i(T), u(((L = T[0]) == null ? void 0 : L.id) || null));
    },
    pe = async () => {
      var L, A, k, Z;
      y((ue) => ({
        ...ue,
        saving: !0,
        error: "",
      }));
      try {
        const ue =
            ((L = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : L.restUrl) || "/wp-json/",
          Q = await fetch(`${ue}nexulesuite_/v1/popups`, {
            method: "POST",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
              "X-WP-Nonce": ((A = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : A.nonce) || "",
            },
            body: JSON.stringify({
              popups: o,
            }),
          }),
          he = await Q.json();
        if (!Q.ok || (he == null ? void 0 : he.success) !== !0)
          throw new Error((he == null ? void 0 : he.message) || "Save failed.");
        const oe = Array.isArray((k = he == null ? void 0 : he.data) == null ? void 0 : k.popups) ? he.data.popups : o;
        (i(oe),
          F(oe),
          u(((Z = oe[0]) == null ? void 0 : Z.id) || null),
          y({
            loading: !1,
            saving: !1,
            error: "",
          }),
          M(!0));
      } catch (ue) {
        y((Q) => ({
          ...Q,
          saving: !1,
          error: (ue == null ? void 0 : ue.message) || "Save failed.",
        }));
      }
    },
    me = (L) =>
      typeof L != "string"
        ? ""
        : L.replace(
            /\[forminator_form.*?\]/g,
            '<div style="background:#f8fafc; border:2px dashed #cbd5e1; height:100px; display:flex; align-items:center; justify-content:center; border-radius:12px; color:#94a3b8; font-weight:600; font-size:11px;">FORM INTEGRATION PREVIEW</div>',
          );
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(SuccessModal, {
        open: P,
        message: "Your settings have been successfully updated. All changes are now live.",
        onDismiss: () => M(!1),
      }),
      e.jsxs("div", {
        className: "min-h-screen bg-page px-4 py-4 md:px-8 md:py-8 font-sans font-medium text-ink leading-relaxed",
        style: {
          backgroundImage:
            "radial-gradient(900px 420px at 12% -8%, rgba(139, 92, 246, 0.10), transparent 60%), radial-gradient(800px 380px at 92% -6%, rgba(99, 102, 241, 0.09), transparent 55%), radial-gradient(700px 420px at 55% 115%, rgba(6, 182, 212, 0.07), transparent 55%)",
        },
        children: [
          e.jsxs("div", {
            className:
              "w-full bg-white rounded-card shadow-card border border-line overflow-hidden flex flex-col h-[92vh]",
            children: [
              e.jsxs("header", {
                className: "px-6 py-6 border-b border-line-soft bg-white flex justify-between items-center shrink-0",
                children: [
                  e.jsxs("div", {
                    className: "flex items-center gap-4",
                    children: [
                      e.jsx("div", {
                        className: "p-3 rounded-tile text-white",
                        style: {
                          background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                          boxShadow: "0 8px 18px -8px #8b5cf6",
                        },
                        children: e.jsx(Ra, {
                          size: 24,
                        }),
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsx("h1", {
                            className: "font-display text-xl font-bold tracking-tight",
                            children: "Popups",
                          }),
                          e.jsx("p", {
                            className: "text-[10px] font-bold text-faint uppercase tracking-widest",
                            children: "Advanced Automation Logic",
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("button", {
                    type: "button",
                    onClick: le,
                    className:
                      "flex items-center gap-2 text-white px-6 py-3 rounded-tile transition-all text-sm font-bold hover:brightness-110 active:scale-95",
                    style: {
                      background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                      boxShadow: "0 8px 18px -8px #8b5cf6",
                    },
                    children: [
                      e.jsx(dt, {
                        size: 18,
                      }),
                      " Add New PopUp",
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "flex flex-1 overflow-hidden",
                children: [
                  e.jsxs("aside", {
                    className: "w-72 border-r border-line-soft bg-[#fbfcfe] flex flex-col shrink-0",
                    children: [
                      e.jsxs("div", {
                        className: "p-4 border-b border-line-soft flex items-center justify-between",
                        children: [
                          e.jsx("h2", {
                            className: "text-[10px] font-bold text-faint uppercase tracking-widest",
                            children: "PopUp Layers",
                          }),
                          e.jsx(Wl, {
                            size: 14,
                            className: "text-faint",
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "flex-1 overflow-y-auto p-3 space-y-2",
                        children: [
                          S.loading
                            ? e.jsx("div", {
                                className: "px-2 py-3 text-sm text-muted",
                                children: "Loading…",
                              })
                            : null,
                          o.map((L) => {
                            const A = L.id === d;
                            return e.jsxs(
                              "div",
                              {
                                onClick: () => u(L.id),
                                className: [
                                  "group relative px-4 py-4 rounded-tile border transition-all cursor-pointer flex items-center justify-between",
                                  A
                                    ? "bg-white border-pop shadow-card ring-2 ring-pop/5"
                                    : "bg-transparent border-transparent hover:bg-line-soft",
                                ].join(" "),
                                children: [
                                  e.jsxs("div", {
                                    className: "flex items-center gap-3 truncate",
                                    children: [
                                      e.jsx(dd, {
                                        size: 16,
                                        className: A ? "text-pop" : "text-faint",
                                      }),
                                      e.jsx("span", {
                                        className: "text-sm font-semibold truncate",
                                        children: L.name || "Popup",
                                      }),
                                    ],
                                  }),
                                  e.jsxs("div", {
                                    className:
                                      "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                    onClick: (k) => k.stopPropagation(),
                                    children: [
                                      e.jsx("button", {
                                        type: "button",
                                        onClick: () => h(L),
                                        className: "p-1 text-faint hover:text-pop",
                                        "aria-label": "Preview",
                                        children: e.jsx(Rt, {
                                          size: 14,
                                        }),
                                      }),
                                      e.jsx("button", {
                                        type: "button",
                                        onClick: () => ie(L.id),
                                        className: "p-1 text-faint hover:text-mail",
                                        "aria-label": "Delete",
                                        children: e.jsx(yt, {
                                          size: 14,
                                        }),
                                      }),
                                    ],
                                  }),
                                ],
                              },
                              L.id,
                            );
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsx("main", {
                    className: "flex-1 overflow-y-auto p-8",
                    style: {
                      background: "#f3f5fa",
                    },
                    children: e.jsxs("div", {
                      className: "nexulesuite_popups-editor-wrap max-w-[1080px] mx-auto pb-20",
                      children: [
                        S.error
                          ? e.jsx("div", {
                              className:
                                "mb-6 rounded-card border border-[#fbd0da] bg-mail-soft px-4 py-3 text-sm text-[#e11d48]",
                              children: S.error,
                            })
                          : null,
                        !S.loading && !N
                          ? e.jsxs("div", {
                              className:
                                "nexulesuite_pop-card flex flex-col items-center justify-center gap-4 py-20 text-center",
                              children: [
                                e.jsx("span", {
                                  className:
                                    "flex h-14 w-14 items-center justify-center rounded-tile bg-pop-soft text-pop",
                                  children: e.jsx(Ra, {
                                    size: 26,
                                  }),
                                }),
                                e.jsxs("div", {
                                  children: [
                                    e.jsx("h3", {
                                      className: "font-display text-base font-bold text-ink",
                                      children: "No popups yet",
                                    }),
                                    e.jsx("p", {
                                      className: "mt-1 max-w-sm text-sm text-muted",
                                      children:
                                        "Create your first popup, then wire its triggers in Advanced Automation Logic below.",
                                    }),
                                  ],
                                }),
                                e.jsxs("button", {
                                  type: "button",
                                  onClick: le,
                                  className:
                                    "mt-2 flex items-center gap-2 rounded-tile px-6 py-3 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95",
                                  style: {
                                    background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                                    boxShadow: "0 8px 18px -8px #8b5cf6",
                                  },
                                  children: [
                                    e.jsx(dt, {
                                      size: 16,
                                    }),
                                    " Create first popup",
                                  ],
                                }),
                              ],
                            })
                          : null,
                        N
                          ? e.jsxs("div", {
                              className: "nexulesuite_pop-card",
                              children: [
                                e.jsxs("section", {
                                  className: "nexulesuite_pop-section is-first",
                                  children: [
                                    e.jsxs("div", {
                                      className: "nexulesuite_pop-sec-head",
                                      children: [
                                        e.jsx("span", {
                                          className: "nexulesuite_pop-sec-ico",
                                          children: e.jsxs("svg", {
                                            width: "16",
                                            height: "16",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            children: [
                                              e.jsx("rect", {
                                                x: "3",
                                                y: "4",
                                                width: "18",
                                                height: "16",
                                                rx: "2",
                                              }),
                                              e.jsx("path", {
                                                d: "M3 9h18M9 9v11",
                                              }),
                                            ],
                                          }),
                                        }),
                                        e.jsx("span", {
                                          className: "nexulesuite_pop-sec-title",
                                          children: "Identity & Core Structure",
                                        }),
                                      ],
                                    }),
                                    e.jsxs("div", {
                                      className: "id-row",
                                      children: [
                                        e.jsxs("div", {
                                          children: [
                                            e.jsx("span", {
                                              className: "lbl",
                                              children: "Internal name",
                                            }),
                                            e.jsx("input", {
                                              type: "text",
                                              className: "inp",
                                              value: (N == null ? void 0 : N.name) || "",
                                              onChange: (L) =>
                                                W({
                                                  name: L.target.value,
                                                }),
                                            }),
                                          ],
                                        }),
                                        e.jsxs("div", {
                                          children: [
                                            e.jsx("span", {
                                              className: "lbl",
                                              children: "Event name (unique id)",
                                            }),
                                            e.jsx("input", {
                                              type: "text",
                                              className: "inp mono",
                                              value: (N == null ? void 0 : N.eventName) || "",
                                              onChange: (L) =>
                                                W({
                                                  eventName: L.target.value,
                                                }),
                                              placeholder: "e.g. nexus-pop-contact",
                                            }),
                                            e.jsxs("div", {
                                              className: "hint",
                                              children: [
                                                "This ID is used to link a ",
                                                e.jsx("b", {
                                                  children: "Menu Item button",
                                                }),
                                                " to this popup (Manual Click trigger).",
                                              ],
                                            }),
                                          ],
                                        }),
                                        e.jsxs("div", {
                                          children: [
                                            e.jsx("span", {
                                              className: "lbl",
                                              children: "Text alignment",
                                            }),
                                            e.jsx(SegmentedControl, {
                                              value: (N == null ? void 0 : N.textAlign) || "left",
                                              onChange: (L) =>
                                                W({
                                                  textAlign: L,
                                                }),
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsxs("section", {
                                  className: "nexulesuite_pop-section",
                                  children: [
                                    e.jsxs("div", {
                                      className: "nexulesuite_pop-sec-head",
                                      children: [
                                        e.jsx("span", {
                                          className: "nexulesuite_pop-sec-ico pink",
                                          children: e.jsx("svg", {
                                            width: "16",
                                            height: "16",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            children: e.jsx("path", {
                                              d: "M6 4v16M18 4v16M6 12h12M4 4h4M16 4h4M4 20h4M16 20h4",
                                            }),
                                          }),
                                        }),
                                        e.jsx("span", {
                                          className: "nexulesuite_pop-sec-title",
                                          children: "Main Heading Editor",
                                        }),
                                      ],
                                    }),
                                    e.jsx(HeadingEditor, {
                                      heading: (N == null ? void 0 : N.heading) || "",
                                      onChange: (L) =>
                                        W({
                                          heading: L,
                                        }),
                                      disabled: !N,
                                    }),
                                  ],
                                }),
                                e.jsxs("section", {
                                  className: "nexulesuite_pop-section",
                                  children: [
                                    e.jsxs("div", {
                                      className: "nexulesuite_pop-sec-head",
                                      children: [
                                        e.jsx("span", {
                                          className: "nexulesuite_pop-sec-ico",
                                          children: e.jsx("svg", {
                                            width: "16",
                                            height: "16",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            children: e.jsx("path", {
                                              d: "M4 7h16M4 12h12M4 17h8",
                                            }),
                                          }),
                                        }),
                                        e.jsx("span", {
                                          className: "nexulesuite_pop-sec-title",
                                          children: "Sub Heading Text",
                                        }),
                                      ],
                                    }),
                                    e.jsx("input", {
                                      type: "text",
                                      className: "inp",
                                      value: (N == null ? void 0 : N.subHeading) || "",
                                      onChange: (L) =>
                                        W({
                                          subHeading: L.target.value,
                                        }),
                                      style: {
                                        textAlign: (N == null ? void 0 : N.textAlign) || "left",
                                      },
                                    }),
                                  ],
                                }),
                                e.jsxs("section", {
                                  className: "nexulesuite_pop-section",
                                  children: [
                                    e.jsxs("div", {
                                      className: "nexulesuite_pop-sec-head",
                                      children: [
                                        e.jsx("span", {
                                          className: "nexulesuite_pop-sec-ico",
                                          children: e.jsxs("svg", {
                                            width: "16",
                                            height: "16",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
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
                                        }),
                                        e.jsx("span", {
                                          className: "nexulesuite_pop-sec-title",
                                          children: "Visual Styling & Area Controls",
                                        }),
                                      ],
                                    }),
                                    e.jsx("div", {
                                      className: "color-row5",
                                      children: gx.map((L) => {
                                        var A;
                                        return e.jsx(
                                          PopupColorField,
                                          {
                                            label: L.label,
                                            badge: L.badge,
                                            colorKey: L.key,
                                            value:
                                              ((A = N == null ? void 0 : N.style) == null ? void 0 : A[L.key]) ||
                                              "#ffffff",
                                            onChange: (k, Z) =>
                                              I({
                                                [k]: Z,
                                              }),
                                          },
                                          L.key,
                                        );
                                      }),
                                    }),
                                    e.jsx("div", {
                                      className: "slider-panel",
                                      children: e.jsxs("div", {
                                        className: "slider-grid",
                                        children: [
                                          e.jsx(PopupSlider, {
                                            label: "Button width (%)",
                                            value:
                                              ((B = N == null ? void 0 : N.style) == null ? void 0 : B.buttonWidth) ||
                                              100,
                                            min: 40,
                                            max: 100,
                                            unit: "%",
                                            onChange: (L) =>
                                              I({
                                                buttonWidth: L,
                                              }),
                                          }),
                                          e.jsx(PopupSlider, {
                                            label: "Popup radius (px)",
                                            value:
                                              ((ee = N == null ? void 0 : N.style) == null ? void 0 : ee.radius) || 16,
                                            min: 0,
                                            max: 40,
                                            unit: "px",
                                            onChange: (L) =>
                                              I({
                                                radius: L,
                                              }),
                                          }),
                                          e.jsx(PopupSlider, {
                                            label: "Close icon size (px)",
                                            value:
                                              ((_ = N == null ? void 0 : N.style) == null ? void 0 : _.closeIconSize) ||
                                              20,
                                            min: 14,
                                            max: 36,
                                            unit: "px",
                                            onChange: (L) =>
                                              I({
                                                closeIconSize: L,
                                              }),
                                          }),
                                          e.jsx(PopupSlider, {
                                            label: "Heading font size (px)",
                                            value:
                                              ((X = N == null ? void 0 : N.style) == null
                                                ? void 0
                                                : X.headingFontSize) || 20,
                                            min: 14,
                                            max: 40,
                                            unit: "px",
                                            onChange: (L) =>
                                              I({
                                                headingFontSize: L,
                                              }),
                                          }),
                                          e.jsx(PopupSlider, {
                                            label: "Body & field font size (px)",
                                            value:
                                              ((nlsPopBodyFs = N == null ? void 0 : N.style) == null
                                                ? void 0
                                                : nlsPopBodyFs.bodyFontSize) || 14,
                                            min: 10,
                                            max: 24,
                                            unit: "px",
                                            onChange: (L) =>
                                              I({
                                                bodyFontSize: L,
                                              }),
                                          }),
                                        ],
                                      }),
                                    }),
                                  ],
                                }),
                                e.jsxs("section", {
                                  className: "nexulesuite_pop-section",
                                  children: [
                                    e.jsxs("div", {
                                      className: "nexulesuite_pop-sec-head dense",
                                      children: [
                                        e.jsx("span", {
                                          className: "nexulesuite_pop-sec-ico",
                                          children: e.jsx("svg", {
                                            width: "16",
                                            height: "16",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            children: e.jsx("path", {
                                              d: "M4 6h16M7 12h10M10 18h4",
                                            }),
                                          }),
                                        }),
                                        e.jsx("span", {
                                          className: "nexulesuite_pop-sec-title",
                                          children: "Display Conditions",
                                        }),
                                      ],
                                    }),
                                    e.jsx(DisplayConditions, {
                                      variant: "popup-reference",
                                      conditions: (N == null ? void 0 : N.conditions) || {
                                        match: "any",
                                        rules: [],
                                      },
                                      onChange: (L) =>
                                        W({
                                          conditions: L,
                                        }),
                                      conditionMeta: V,
                                      contentSearch: U,
                                      onSearchContent: O,
                                      searchKeyPrefix: `popup-${(N == null ? void 0 : N.id) || "new"}`,
                                      description:
                                        "Where this popup is allowed to appear. Leave all rules unchecked to show on every page.",
                                    }),
                                  ],
                                }),
                                e.jsxs("section", {
                                  className: "nexulesuite_pop-section",
                                  children: [
                                    e.jsxs("div", {
                                      className: "nexulesuite_pop-sec-head dense",
                                      children: [
                                        e.jsx("span", {
                                          className: "nexulesuite_pop-sec-ico pink",
                                          children: e.jsx("svg", {
                                            width: "16",
                                            height: "16",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            children: e.jsx("path", {
                                              d: "M13 2L4 14h6l-1 8 9-12h-6z",
                                            }),
                                          }),
                                        }),
                                        e.jsx("span", {
                                          className: "nexulesuite_pop-sec-title",
                                          children: "Advanced Automation Logic",
                                        }),
                                        e.jsxs("span", {
                                          className: "nexulesuite_pop-sec-pill",
                                          children: [
                                            ((N == null ? void 0 : N.logic) || []).length,
                                            " trigger",
                                            ((N == null ? void 0 : N.logic) || []).length !== 1 ? "s" : "",
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsx("p", {
                                      className: "nexulesuite_pop-sec-sub",
                                      children:
                                        "When the popup fires. Add multiple triggers to fire on whichever happens first.",
                                    }),
                                    e.jsx("div", {
                                      className: "nexulesuite_pop-logic-list",
                                      children: ((N == null ? void 0 : N.logic) || []).map((L, A) =>
                                        e.jsxs(
                                          "div",
                                          {
                                            className: "nexulesuite_pop-logic-row",
                                            children: [
                                              e.jsxs("div", {
                                                className: "nexulesuite_pop-logic-top",
                                                children: [
                                                  e.jsx("span", {
                                                    className: "ln",
                                                    children: A + 1,
                                                  }),
                                                  e.jsxs("span", {
                                                    className: "lt",
                                                    children: ["Trigger ", A + 1],
                                                  }),
                                                  ((N == null ? void 0 : N.logic) || []).length > 1
                                                    ? e.jsx("button", {
                                                        type: "button",
                                                        onClick: () => j(L.id),
                                                        className: "nexulesuite_pop-icon-btn danger",
                                                        "aria-label": "Remove trigger",
                                                        children: e.jsx("svg", {
                                                          width: "15",
                                                          height: "15",
                                                          viewBox: "0 0 24 24",
                                                          fill: "none",
                                                          stroke: "currentColor",
                                                          strokeWidth: "2",
                                                          children: e.jsx("path", {
                                                            d: "M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14",
                                                          }),
                                                        }),
                                                      })
                                                    : null,
                                                ],
                                              }),
                                              e.jsxs("div", {
                                                className: "nexulesuite_pop-logic-grid",
                                                children: [
                                                  e.jsxs("div", {
                                                    className: "nexulesuite_pop-field",
                                                    children: [
                                                      e.jsx("label", {
                                                        children: "Event",
                                                      }),
                                                      e.jsxs("select", {
                                                        value: L.trigger,
                                                        onChange: (k) =>
                                                          C(L.id, {
                                                            trigger: k.target.value,
                                                          }),
                                                        children: [
                                                          e.jsx("option", {
                                                            value: "scroll",
                                                            children: "On scroll",
                                                          }),
                                                          e.jsx("option", {
                                                            value: "timer",
                                                            children: "After delay",
                                                          }),
                                                          e.jsx("option", {
                                                            value: "exit",
                                                            children: "Exit intent",
                                                          }),
                                                          e.jsx("option", {
                                                            value: "click",
                                                            children: "Manual Click",
                                                          }),
                                                        ],
                                                      }),
                                                    ],
                                                  }),
                                                  e.jsxs("div", {
                                                    className: "nexulesuite_pop-field",
                                                    style: {
                                                      display: L.trigger === "timer" ? "" : "none",
                                                    },
                                                    children: [
                                                      e.jsx("label", {
                                                        children: "Delay (sec)",
                                                      }),
                                                      e.jsx("input", {
                                                        type: "number",
                                                        value: L.delay,
                                                        min: "0",
                                                        onChange: (k) =>
                                                          C(L.id, {
                                                            delay: k.target.value,
                                                          }),
                                                      }),
                                                    ],
                                                  }),
                                                  e.jsxs("div", {
                                                    className: "nexulesuite_pop-field",
                                                    style: {
                                                      display: L.trigger === "scroll" ? "" : "none",
                                                    },
                                                    children: [
                                                      e.jsx("label", {
                                                        children: "Scroll depth (%)",
                                                      }),
                                                      e.jsx("input", {
                                                        type: "number",
                                                        value: L.scrollPercentage,
                                                        min: "0",
                                                        max: "100",
                                                        onChange: (k) =>
                                                          C(L.id, {
                                                            scrollPercentage: k.target.value,
                                                          }),
                                                      }),
                                                    ],
                                                  }),
                                                  e.jsxs("div", {
                                                    className: "nexulesuite_pop-field",
                                                    style: {
                                                      display: L.trigger === "click" ? "" : "none",
                                                    },
                                                    children: [
                                                      e.jsx("label", {
                                                        children: "Fires on event name",
                                                      }),
                                                      e.jsx("input", {
                                                        type: "text",
                                                        readOnly: !0,
                                                        value: (N == null ? void 0 : N.eventName) || "",
                                                        title:
                                                          "Link a Menu Item button to this event name to open the popup on click.",
                                                      }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                            ],
                                          },
                                          L.id,
                                        ),
                                      ),
                                    }),
                                    e.jsxs("button", {
                                      type: "button",
                                      onClick: J,
                                      className: "nexulesuite_pop-add-dash",
                                      children: [
                                        e.jsx("svg", {
                                          width: "15",
                                          height: "15",
                                          viewBox: "0 0 24 24",
                                          fill: "none",
                                          stroke: "currentColor",
                                          strokeWidth: "2.2",
                                          children: e.jsx("path", {
                                            d: "M12 5v14M5 12h14",
                                          }),
                                        }),
                                        "Add trigger",
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsxs("section", {
                                  className: "nexulesuite_pop-section",
                                  children: [
                                    e.jsxs("div", {
                                      className: "nexulesuite_pop-sec-head dense",
                                      children: [
                                        e.jsx("span", {
                                          className: "nexulesuite_pop-sec-ico",
                                          children: e.jsx(Dl, {
                                            size: 16,
                                            strokeWidth: 2,
                                          }),
                                        }),
                                        e.jsx("span", {
                                          className: "nexulesuite_pop-sec-title",
                                          children: "Popup Body (HTML / Shortcode)",
                                        }),
                                      ],
                                    }),
                                    e.jsxs("p", {
                                      className: "content-hint",
                                      children: [
                                        "Put the form you want here (e.g. ",
                                        e.jsx("code", {
                                          children: '[nexulesuite_form id="…"]',
                                        }),
                                        "). If this box has any content, Settings → Default Nexus forms (ordered list) are ",
                                        e.jsx("b", {
                                          children: "not",
                                        }),
                                        " prepended — you will not get duplicate forms. Leave it empty only if you rely on those global defaults for timer/scroll/exit.",
                                      ],
                                    }),
                                    e.jsx("textarea", {
                                      className: "content-code",
                                      value: (N == null ? void 0 : N.content) || "",
                                      onChange: (L) =>
                                        W({
                                          content: L.target.value,
                                        }),
                                    }),
                                  ],
                                }),
                              ],
                            })
                          : null,
                      ],
                    }),
                  }),
                ],
              }),
              e.jsxs("footer", {
                className: "px-12 py-6 border-t border-line-soft bg-white flex justify-between items-center shrink-0",
                children: [
                  e.jsxs("div", {
                    className: "flex items-center gap-2 text-faint text-[10px] font-bold uppercase tracking-widest",
                    children: [
                      e.jsx("span", {
                        className: "inline-flex h-2 w-2 rounded-full bg-form",
                      }),
                      "System Ready & Synchronized",
                    ],
                  }),
                  e.jsxs("div", {
                    className: "flex gap-4",
                    children: [
                      e.jsx("button", {
                        type: "button",
                        onClick: te,
                        disabled: !H || S.saving,
                        className: "px-6 py-2.5 text-muted hover:text-ink-2 font-bold text-sm disabled:opacity-50",
                        children: "Discard",
                      }),
                      e.jsxs("button", {
                        type: "button",
                        onClick: pe,
                        disabled: S.saving || !H,
                        className:
                          "flex items-center gap-3 px-12 py-3 text-white font-bold rounded-tile text-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-60",
                        style: {
                          background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                          boxShadow: "0 8px 18px -8px #8b5cf6",
                        },
                        children: [
                          e.jsx(bn, {
                            size: 18,
                          }),
                          " ",
                          S.saving ? "Saving…" : "Save Popup Configuration",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          p &&
            e.jsx("div", {
              className:
                "fixed inset-0 z-[1000] flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-300 backdrop-blur-md bg-navy/60",
              children: e.jsxs("div", {
                className:
                  "bg-white rounded-card shadow-lift w-full max-w-[1200px] h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20",
                children: [
                  e.jsxs("div", {
                    className: "p-6 border-b border-line-soft flex justify-between items-center bg-[#fbfcfe]",
                    children: [
                      e.jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                          e.jsx(Rt, {
                            className: "text-pop",
                            size: 20,
                          }),
                          e.jsx("h4", {
                            className: "font-display font-bold text-ink text-lg",
                            children: "Pop-Up Simulator",
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "flex bg-line-soft p-1 rounded-tile",
                        children: [
                          {
                            id: "desktop",
                            Icon: pm,
                          },
                          {
                            id: "tablet",
                            Icon: Sm,
                          },
                          {
                            id: "mobile",
                            Icon: od,
                          },
                        ].map((L) => {
                          const A = x === L.id;
                          return e.jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => f(L.id),
                              className: [
                                "p-2 rounded-lg transition-all",
                                A ? "bg-white shadow-sm text-pop" : "text-faint hover:text-ink-2",
                              ].join(" "),
                              "aria-label": L.id,
                              children: e.jsx(L.Icon, {
                                size: 16,
                              }),
                            },
                            L.id,
                          );
                        }),
                      }),
                      e.jsx("button", {
                        type: "button",
                        onClick: () => h(null),
                        className:
                          "p-3 bg-white border border-line hover:bg-mail-soft text-muted rounded-full transition-all",
                        "aria-label": "Close",
                        children: e.jsx(_t, {
                          size: 20,
                        }),
                      }),
                    ],
                  }),
                  e.jsx("div", {
                    className: "flex-1 bg-slate-200/20 p-12 overflow-y-auto flex items-center justify-center",
                    children: [
                      e.jsx("style", {
                        dangerouslySetInnerHTML: {
                          __html:
                            ".nls-pop-sim-heading,:where(.nls-pop-sim-heading) :is(h1,h2,h3,h4,h5,h6,p,div,span,strong,em,b,i,a){font-size:inherit!important;line-height:inherit;margin:0;padding:0;}",
                        },
                      }),
                      e.jsxs("div", {
                        className: [
                          "transition-all duration-500 ease-out shadow-2xl overflow-hidden relative",
                          x === "mobile" ? "max-w-[320px]" : x === "tablet" ? "max-w-[500px]" : "",
                        ].join(" "),
                        style: {
                          backgroundColor: p.style.bodyBgColor,
                          width: x === "desktop" ? `${p.style.width}px` : "100%",
                          borderRadius: `${p.style.radius}px`,
                        },
                        children: [
                          e.jsx("button", {
                            type: "button",
                            className:
                              "absolute top-4 right-4 flex items-center justify-center transition-transform hover:rotate-90",
                            style: {
                              width: `${parseInt(p.style.closeIconSize, 10) + 12}px`,
                              height: `${parseInt(p.style.closeIconSize, 10) + 12}px`,
                              backgroundColor: p.style.closeIconBg,
                              color: p.style.closeIconColor,
                              borderRadius: "9999px",
                              zIndex: 10,
                            },
                            children: e.jsx(_t, {
                              size: p.style.closeIconSize,
                            }),
                          }),
                          e.jsxs("div", {
                            style: {
                              backgroundColor: p.style.headingBgColor,
                              color: p.style.headingTextColor,
                              padding: `${p.style.padding}px`,
                              textAlign: p.textAlign,
                            },
                            children: [
                              e.jsx("div", {
                                className: "nls-pop-sim-heading font-bold max-w-none",
                                style: {
                                  fontSize: `${parseInt((p.style && p.style.headingFontSize) || 20, 10) || 20}px`,
                                },
                                dangerouslySetInnerHTML: {
                                  __html: p.heading,
                                },
                              }),
                              e.jsx("p", {
                                className: "text-xs opacity-80 font-semibold mt-1 uppercase tracking-wider",
                                children: p.subHeading,
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "p-10",
                            style: {
                              backgroundColor: p.style.bodyBgColor,
                              fontSize: `${parseInt((p.style && p.style.bodyFontSize) || 14, 10) || 14}px`,
                            },
                            children: [
                              e.jsx("div", {
                                className: "prose prose-slate max-w-none mb-8 font-medium",
                                dangerouslySetInnerHTML: {
                                  __html: me(p.content),
                                },
                              }),
                              e.jsx("div", {
                                className: "flex justify-center",
                                children: e.jsx("button", {
                                  type: "button",
                                  className:
                                    "py-4 text-white font-bold text-sm rounded-xl shadow-xl hover:brightness-90 transition-all active:scale-95",
                                  style: {
                                    backgroundColor: p.style.buttonColor,
                                    width: `${p.style.buttonWidth}%`,
                                  },
                                  children: "Complete Action",
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
            }),
        ],
      }),
    ],
  });
}
