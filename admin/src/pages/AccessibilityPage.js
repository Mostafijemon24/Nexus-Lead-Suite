import * as e from "react/jsx-runtime";
import {
  ArrowRight as qc,
  Bell as em,
  Calendar as qn,
  ChevronDown as Qs,
  ChevronUp as nm,
  Download as Ol,
  Globe as Bl,
  Link as wi,
  Mail as qt,
  MapPin as $a,
  MessageSquare as Xn,
  MousePointerClick as nd,
  PanelsTopLeft as Si,
  Phone as ld,
  Save as bn,
  Settings as id,
  Target as dd,
  User as Fa,
} from "lucide-react";
import * as b from "react";
import {
  ColorField,
  DisplayConditions,
  PageFrame,
  Sf,
  StickyFooter,
  SuccessModal,
  Tooltip,
  nlsFabPreview,
  nlsRange,
  settingsFetch,
  useGoogleFontLink,
  wpFetch,
} from "../shared/common.js";

function nlsDockPreview(props) {
  const a = props || {};
  const Sraw = parseInt(a.btnSize, 10);
  const S = Math.max(0, Math.min(100, Number.isFinite(Sraw) ? Sraw : 52));
  const yraw = parseInt(a.iconSize, 10);
  const y = Math.max(0, Math.min(100, Number.isFinite(yraw) ? yraw : Math.round(S * 0.5)));
  const Praw = parseInt(a.gap, 10);
  const P = Math.max(0, Math.min(100, Number.isFinite(Praw) ? Praw : 10));
  const M = ((window.nexulesuite_Admin || {}).pluginUrl || "") + "public/images/";
  const T = a.a11yIcon || M + "accessibility-icon.png";
  const F = a.langIcon || M + "translate-icon.png";
  const order = Array.isArray(a.order) && a.order.length ? a.order : ["custom", "chat", "language", "accessibility"];
  const mkBtn = (bg, tx, child, key) =>
    e.jsx(
      "div",
      {
        className: "nls-a11y-dock-preview__btn",
        style: {
          width: S + "px",
          height: S + "px",
          background: bg || "#0f766e",
          color: tx || "#ffffff",
          "--nls-fab-preview-icon": y + "px",
        },
        children: child,
      },
      key,
    );
  const buttons = [];
  order.forEach(function (key) {
    if (key === "custom" && a.showCustom) {
      const ic =
        (typeof nlsDockCustomIconList !== "undefined" ? nlsDockCustomIconList : []).find(function (x) {
          return x.k === (a.customIcon || "link");
        }) || null;
      const Icon = ic && ic.I;
      buttons.push(
        mkBtn(
          a.customBg || "#2563eb",
          a.customText || "#ffffff",
          Icon
            ? e.jsx(Icon, {
                size: y,
              })
            : e.jsx("span", {
                children: "•",
              }),
          "custom",
        ),
      );
    } else if (key === "chat" && a.showChat) {
      const chatImg = a.chatImg || "";
      buttons.push(
        mkBtn(
          a.chatBg || "#2563eb",
          a.chatText || "#ffffff",
          chatImg
            ? e.jsx("img", {
                src: chatImg,
                alt: "",
              })
            : typeof Xn !== "undefined"
              ? e.jsx(Xn, {
                  size: y,
                })
              : e.jsx("span", {
                  children: "C",
                }),
          "chat",
        ),
      );
    } else if (key === "language" && a.showLang !== !1) {
      buttons.push(
        mkBtn(
          a.langBg || a.a11yBg || "#0f766e",
          a.langText || a.a11yText || "#ffffff",
          e.jsx("img", {
            src: F,
            alt: "",
          }),
          "lang",
        ),
      );
    } else if (key === "accessibility" && a.showA11y !== !1) {
      buttons.push(
        mkBtn(
          a.a11yBg || "#0f766e",
          a.a11yText || "#ffffff",
          e.jsx("img", {
            src: T,
            alt: "",
          }),
          "a11y",
        ),
      );
    }
  });
  if (!buttons.length && a.showA11y !== !1) {
    buttons.push(
      mkBtn(
        a.a11yBg || "#0f766e",
        a.a11yText || "#ffffff",
        e.jsx("img", {
          src: T,
          alt: "",
        }),
        "a11y",
      ),
    );
  }
  return e.jsxs("div", {
    className: "nls-a11y-dock-preview" + (a.variant === "panel" ? " nls-a11y-dock-preview--panel" : ""),
    children: [
      e.jsx("span", {
        className: "lbl",
        children: a.label || "Button live preview",
      }),
      e.jsx("div", {
        className: "nls-a11y-dock-preview__stage",
        children: e.jsx("div", {
          className: "nls-a11y-dock-preview__stack",
          style: {
            gap: P + "px",
          },
          children: buttons,
        }),
      }),
      e.jsxs("p", {
        className: "nls-a11y-dock-preview__meta",
        children: [S, "px button · ", y, "px icon · ", P, "px gap"],
      }),
    ],
  });
}
function nlsDockSvgIcon(nlsKids, nlsFill) {
  return function NlsDockIco(nlsP) {
    var nlsSz = (nlsP == null ? void 0 : nlsP.size) || 18;
    return e.jsxs("svg", {
      width: nlsSz,
      height: nlsSz,
      viewBox: "0 0 24 24",
      fill: nlsFill ? "currentColor" : "none",
      stroke: nlsFill ? "none" : "currentColor",
      strokeWidth: nlsFill ? 0 : 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": !0,
      children: nlsKids,
    });
  };
}
const nlsIcoHome = nlsDockSvgIcon([
  e.jsx("path", {
    d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    key: "h1",
  }),
  e.jsx("polyline", {
    points: "9 22 9 12 15 12 15 22",
    key: "h2",
  }),
]);
const nlsIcoHeart = nlsDockSvgIcon([
  e.jsx("path", {
    d: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
    key: "ht",
  }),
]);
const nlsIcoCart = nlsDockSvgIcon([
  e.jsx("circle", {
    cx: "9",
    cy: "21",
    r: "1",
    key: "c1",
  }),
  e.jsx("circle", {
    cx: "20",
    cy: "21",
    r: "1",
    key: "c2",
  }),
  e.jsx("path", {
    d: "M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6",
    key: "c3",
  }),
]);
const nlsIcoHelp = nlsDockSvgIcon([
  e.jsx("circle", {
    cx: "12",
    cy: "12",
    r: "10",
    key: "hp1",
  }),
  e.jsx("path", {
    d: "M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3",
    key: "hp2",
  }),
  e.jsx("line", {
    x1: "12",
    y1: "17",
    x2: "12.01",
    y2: "17",
    key: "hp3",
  }),
]);
const nlsIcoInfo = nlsDockSvgIcon([
  e.jsx("circle", {
    cx: "12",
    cy: "12",
    r: "10",
    key: "i1",
  }),
  e.jsx("line", {
    x1: "12",
    y1: "16",
    x2: "12",
    y2: "12",
    key: "i2",
  }),
  e.jsx("line", {
    x1: "12",
    y1: "8",
    x2: "12.01",
    y2: "8",
    key: "i3",
  }),
]);
const nlsIcoVideo = nlsDockSvgIcon([
  e.jsx("rect", {
    x: "2",
    y: "6",
    width: "14",
    height: "12",
    rx: "2",
    key: "v1",
  }),
  e.jsx("polygon", {
    points: "16 10 22 7 22 17 16 14 16 10",
    key: "v2",
  }),
]);
const nlsIcoWhatsapp = nlsDockSvgIcon(
  [
    e.jsx("path", {
      d: "M20.52 3.48A11.86 11.86 0 0012.04 0C5.5 0 .2 5.3.2 11.82c0 2.08.55 4.11 1.6 5.9L0 24l6.43-1.68a11.8 11.8 0 005.6 1.43h.01c6.54 0 11.84-5.3 11.84-11.82 0-3.16-1.23-6.13-3.46-8.45zM12.04 21.5h-.01a9.8 9.8 0 01-5-1.37l-.36-.21-3.81 1 1.02-3.71-.23-.38a9.77 9.77 0 01-1.5-5.21c0-5.4 4.4-9.8 9.84-9.8 2.63 0 5.1 1.02 6.96 2.88a9.75 9.75 0 012.88 6.95c0 5.4-4.4 9.8-9.79 9.8zm5.4-7.34c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z",
      key: "wa",
    }),
  ],
  !0,
);
const nlsDockCustomIconList = [
  {
    k: "link",
    l: "Link",
    I: wi,
  },
  {
    k: "call",
    l: "Call",
    I: ld,
  },
  {
    k: "mail",
    l: "Email",
    I: qt,
  },
  {
    k: "message",
    l: "Message",
    I: Xn,
  },
  {
    k: "whatsapp",
    l: "WhatsApp",
    I: nlsIcoWhatsapp,
  },
  {
    k: "location",
    l: "Location",
    I: $a,
  },
  {
    k: "appointment",
    l: "Book",
    I: qn,
  },
  {
    k: "download",
    l: "Download",
    I: Ol,
  },
  {
    k: "popup",
    l: "Target",
    I: dd,
  },
  {
    k: "cta",
    l: "CTA",
    I: nd,
  },
  {
    k: "event",
    l: "Notify",
    I: em,
  },
  {
    k: "arrow",
    l: "Arrow",
    I: qc,
  },
  {
    k: "globe",
    l: "Web",
    I: Bl,
  },
  {
    k: "home",
    l: "Home",
    I: nlsIcoHome,
  },
  {
    k: "user",
    l: "Account",
    I: Fa,
  },
  {
    k: "heart",
    l: "Heart",
    I: nlsIcoHeart,
  },
  {
    k: "cart",
    l: "Shop",
    I: nlsIcoCart,
  },
  {
    k: "help",
    l: "Help",
    I: nlsIcoHelp,
  },
  {
    k: "info",
    l: "Info",
    I: nlsIcoInfo,
  },
  {
    k: "video",
    l: "Video",
    I: nlsIcoVideo,
  },
];
export function AccessibilityPage() {
  const nlsEmptyCond = {
    match: "any",
    rules: [],
  };
  const nlsDefaultDockConds = {
    custom: {
      ...nlsEmptyCond,
      rules: [],
    },
    chat: {
      ...nlsEmptyCond,
      rules: [],
    },
    language: {
      ...nlsEmptyCond,
      rules: [],
    },
    accessibility: {
      ...nlsEmptyCond,
      rules: [],
    },
  };
  const [a, o] = b.useState({
      accessibilityEnabled: !1,
      languageEnabled: !1,
      enableLivechat: !1,
      liveChatInDock: !0,
      liveChatButtonImage: "",
      liveChatButtonBg: "#2563eb",
      liveChatButtonText: "#ffffff",
      liveChatButtonIconSize: 22,
      customButtonEnabled: !1,
      customButtonUrl: "",
      customButtonLabel: "Custom",
      customButtonIcon: "link",
      customButtonBg: "#2563eb",
      customButtonText: "#ffffff",
      customButtonOpenNewTab: !0,
      dockButtonOrder: ["custom", "chat", "language", "accessibility"],
      dockButtonConditions: {
        custom: {
          match: "any",
          rules: [],
        },
        chat: {
          match: "any",
          rules: [],
        },
        language: {
          match: "any",
          rules: [],
        },
        accessibility: {
          match: "any",
          rules: [],
        },
      },
      dockButtonOffsets: {
        custom: {
          x: 0,
          y: 0,
        },
        chat: {
          x: 0,
          y: 0,
        },
        language: {
          x: 0,
          y: 0,
        },
        accessibility: {
          x: 0,
          y: 0,
        },
      },
      buttonPosition: "right",
      buttonOffsetX: 0,
      buttonOffsetY: 0,
      buttonOffsetUnit: "px",
      buttonSize: 52,
      buttonIconSize: 26,
      buttonGap: 10,
      accessibilityButtonBg: "#0f766e",
      accessibilityButtonText: "#ffffff",
      languageButtonBg: "#0f766e",
      languageButtonText: "#ffffff",
      defaultLanguage: "en",
      languages: ["en", "bn", "hi", "ar", "es", "fr", "de", "zh-CN", "ja", "ko"],
    }),
    [i, d] = b.useState([]),
    [u, p] = b.useState({
      loading: !0,
      saving: !1,
      error: "",
    }),
    [h, x] = b.useState(!1),
    [nlsCondMeta, nlsSetCondMeta] = b.useState({
      postTypes: [],
      categories: [],
      tags: [],
    }),
    [nlsCondSearch, nlsSetCondSearch] = b.useState({}),
    [nlsDispBtn, nlsSetDispBtn] = b.useState("default"),
    [nlsOffsetBtn, nlsSetOffsetBtn] = b.useState("default");
  b.useEffect(() => {
    (async () => {
      p((f) => ({
        ...f,
        loading: !0,
        error: "",
      }));
      try {
        const [{ res: f, json: S }, metaRes] = await Promise.all([
          settingsFetch("/settings/accessibility-language", {
            method: "GET",
          }),
          settingsFetch("/menu-items/condition-meta", {
            method: "GET",
          }),
        ]);
        if (!f.ok) throw new Error((S && S.message) || "Failed to load");
        const loaded = S.settings || {};
        const conds =
          loaded.dockButtonConditions && typeof loaded.dockButtonConditions === "object"
            ? loaded.dockButtonConditions
            : {};
        const offs =
          loaded.dockButtonOffsets && typeof loaded.dockButtonOffsets === "object" ? loaded.dockButtonOffsets : {};
        const fx = parseInt(loaded.buttonOffsetX, 10) || 0;
        const fy = parseInt(loaded.buttonOffsetY, 10) || 0;
        const nlsOff = (k) => {
          const it = offs[k] && typeof offs[k] === "object" ? offs[k] : {};
          const x = parseInt(it.x, 10);
          const y = parseInt(it.y, 10);
          return {
            x: Number.isFinite(x) ? x : fx,
            y: Number.isFinite(y) ? y : fy,
          };
        };
        o({
          ...a,
          ...loaded,
          dockButtonConditions: {
            custom: conds.custom || {
              match: "any",
              rules: [],
            },
            chat: conds.chat || {
              match: "any",
              rules: [],
            },
            language: conds.language || {
              match: "any",
              rules: [],
            },
            accessibility: conds.accessibility || {
              match: "any",
              rules: [],
            },
          },
          dockButtonOffsets: {
            custom: nlsOff("custom"),
            chat: nlsOff("chat"),
            language: nlsOff("language"),
            accessibility: nlsOff("accessibility"),
          },
        });
        d(S.catalog || []);
        if (metaRes && metaRes.res && metaRes.res.ok) {
          const md = (metaRes.json && metaRes.json.data) || metaRes.json || {};
          nlsSetCondMeta({
            postTypes: Array.isArray(md.postTypes) ? md.postTypes : [],
            categories: Array.isArray(md.categories) ? md.categories : [],
            tags: Array.isArray(md.tags) ? md.tags : [],
          });
        }
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
  const nlsCloneDockCond = (val) => {
    try {
      const v =
        val && typeof val === "object"
          ? val
          : {
              match: "any",
              rules: [],
            };
      const out = JSON.parse(JSON.stringify(v));
      if (out.match !== "all") out.match = "any";
      if (!Array.isArray(out.rules)) out.rules = [];
      return out;
    } catch (e) {
      return {
        match: "any",
        rules: [],
      };
    }
  };
  const nlsGetDockCond = (st, key) => {
    const cur = st.dockButtonConditions && typeof st.dockButtonConditions === "object" ? st.dockButtonConditions : {};
    if (!key || key === "default") {
      const a = cur.accessibility && typeof cur.accessibility === "object" ? cur.accessibility : null;
      return nlsCloneDockCond(
        a || {
          match: "any",
          rules: [],
        },
      );
    }
    const it = cur[key] && typeof cur[key] === "object" ? cur[key] : null;
    return nlsCloneDockCond(
      it || {
        match: "any",
        rules: [],
      },
    );
  };
  const nlsSetDockCond = (key, val) =>
    o((P) => {
      const next = nlsCloneDockCond(
        val || {
          match: "any",
          rules: [],
        },
      );
      if (key === "default") {
        return {
          ...P,
          dockButtonConditions: {
            custom: nlsCloneDockCond(next),
            chat: nlsCloneDockCond(next),
            language: nlsCloneDockCond(next),
            accessibility: nlsCloneDockCond(next),
          },
        };
      }
      const cur = P.dockButtonConditions && typeof P.dockButtonConditions === "object" ? P.dockButtonConditions : {};
      return {
        ...P,
        dockButtonConditions: {
          ...nlsDefaultDockConds,
          ...cur,
          [key]: next,
        },
      };
    });
  const nlsClampOffset = (n) => {
    const v = Number(n);
    return Number.isFinite(v) ? Math.max(-2000, Math.min(2000, Math.round(v))) : 0;
  };
  const nlsGetDockOffset = (st, key) => {
    const def = {
      x: nlsClampOffset(st.buttonOffsetX),
      y: nlsClampOffset(st.buttonOffsetY),
    };
    if (!key || key === "default") return def;
    const map = st.dockButtonOffsets && typeof st.dockButtonOffsets === "object" ? st.dockButtonOffsets : {};
    const it = map[key] && typeof map[key] === "object" ? map[key] : null;
    if (!it) return def;
    return {
      x: nlsClampOffset(it.x != null ? it.x : def.x),
      y: nlsClampOffset(it.y != null ? it.y : def.y),
    };
  };
  const nlsSetDockOffset = (key, patch) =>
    o((P) => {
      const cur = nlsGetDockOffset(P, key);
      let nx = cur.x,
        ny = cur.y;
      if (patch && patch.x != null) nx = nlsClampOffset(patch.x);
      if (patch && patch.y != null) ny = nlsClampOffset(patch.y);
      if (patch && patch.dx != null) nx = nlsClampOffset(cur.x + Number(patch.dx));
      if (patch && patch.dy != null) ny = nlsClampOffset(cur.y + Number(patch.dy));
      const next = {
        x: nx,
        y: ny,
      };
      const copy = () => ({
        x: next.x,
        y: next.y,
      });
      if (key === "default") {
        return {
          ...P,
          buttonOffsetX: next.x,
          buttonOffsetY: next.y,
          dockButtonOffsets: {
            custom: copy(),
            chat: copy(),
            language: copy(),
            accessibility: copy(),
          },
        };
      }
      const map = P.dockButtonOffsets && typeof P.dockButtonOffsets === "object" ? P.dockButtonOffsets : {};
      const out = {
        custom:
          map.custom && typeof map.custom === "object"
            ? {
                x: nlsClampOffset(map.custom.x),
                y: nlsClampOffset(map.custom.y),
              }
            : copy(),
        chat:
          map.chat && typeof map.chat === "object"
            ? {
                x: nlsClampOffset(map.chat.x),
                y: nlsClampOffset(map.chat.y),
              }
            : copy(),
        language:
          map.language && typeof map.language === "object"
            ? {
                x: nlsClampOffset(map.language.x),
                y: nlsClampOffset(map.language.y),
              }
            : copy(),
        accessibility:
          map.accessibility && typeof map.accessibility === "object"
            ? {
                x: nlsClampOffset(map.accessibility.x),
                y: nlsClampOffset(map.accessibility.y),
              }
            : copy(),
        [key]: copy(),
      };
      const sync =
        key === "accessibility"
          ? {
              buttonOffsetX: next.x,
              buttonOffsetY: next.y,
            }
          : {};
      return {
        ...P,
        ...sync,
        dockButtonOffsets: out,
      };
    });
  const nlsSearchDockContent = async (key, types, q) => {
    nlsSetCondSearch((prev) => ({
      ...prev,
      [key]: {
        loading: !0,
        results: (prev[key] || {}).results || [],
      },
    }));
    try {
      const { res, json } = await settingsFetch(
        "/menu-items/content-search?search=" +
          encodeURIComponent(q || "") +
          "&types=" +
          encodeURIComponent(types || ""),
        {
          method: "GET",
        },
      );
      const results =
        res.ok && json && json.data && Array.isArray(json.data.results)
          ? json.data.results
          : json && Array.isArray(json.results)
            ? json.results
            : [];
      nlsSetCondSearch((prev) => ({
        ...prev,
        [key]: {
          loading: !1,
          results: results,
        },
      }));
    } catch (e) {
      nlsSetCondSearch((prev) => ({
        ...prev,
        [key]: {
          loading: !1,
          results: [],
        },
      }));
    }
  };
  const nlsDockOrderLabels = {
    custom: "Custom button",
    chat: "Live chat",
    language: "Language",
    accessibility: "Accessibility",
  };
  const nlsMoveDockOrder = (idx, dir) => {
    o((P) => {
      const cur =
        Array.isArray(P.dockButtonOrder) && P.dockButtonOrder.length
          ? P.dockButtonOrder.slice()
          : ["custom", "chat", "language", "accessibility"];
      const j = idx + dir;
      if (j < 0 || j >= cur.length) return P;
      const next = cur.slice();
      const t = next[idx];
      next[idx] = next[j];
      next[j] = t;
      return {
        ...P,
        dockButtonOrder: next,
      };
    });
  };
  const S = (y) => {
    const P = new Set(a.languages || []);
    P.has(y) ? P.delete(y) : P.add(y);
    let M = [...P];
    0 === M.length && (M = ["en"]);
    f("languages", M);
  };
  const y = async () => {
    p((P) => ({
      ...P,
      saving: !0,
      error: "",
    }));
    try {
      const { res: P, json: M } = await settingsFetch("/settings/accessibility-language", {
        method: "POST",
        body: JSON.stringify({
          settings: a,
        }),
      });
      if (!P.ok) throw new Error((M && M.message) || "Save failed");
      o(M.settings || a);
      x(!0);
    } catch (P) {
      p((M) => ({
        ...M,
        error: P.message || "Save failed",
      }));
    } finally {
      p((P) => ({
        ...P,
        saving: !1,
      }));
    }
  };
  const P = e.jsxs("button", {
    type: "button",
    disabled: u.saving || u.loading,
    onClick: y,
    className:
      "flex items-center gap-3 rounded-tile px-10 py-3 text-xs font-black text-white transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-60",
    style: {
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      boxShadow: "0 8px 18px -8px #6366f1",
    },
    children: [
      e.jsx(bn, {
        size: 16,
      }),
      u.saving ? "Saving..." : "Save Configuration",
    ],
  });
  return e.jsxs(PageFrame, {
    title: "Accessibility & Language",
    subtitle: "Site accessibility widget, live chat, and language switcher",
    icon: e.jsx(id, {
      size: 18,
    }),
    footer: e.jsx(StickyFooter, {
      actions: P,
    }),
    children: [
      e.jsx(SuccessModal, {
        open: h,
        message: "Your settings have been successfully updated. All changes are now live.",
        onDismiss: () => x(!1),
      }),
      u.loading
        ? e.jsxs("div", {
            className: "flex h-64 flex-col items-center justify-center gap-4",
            children: [
              e.jsx("div", {
                className: "w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin",
              }),
              e.jsx("span", {
                className: "text-[11px] font-bold text-slate-400 uppercase tracking-widest",
                children: "Loading configuration...",
              }),
            ],
          })
        : e.jsx("div", {
            className: "nexulesuite_settings-general-wrap",
            children: e.jsxs("div", {
              className: "nexulesuite_sg-card",
              children: [
                e.jsxs("section", {
                  className: "nexulesuite_sg-section is-first",
                  children: [
                    e.jsxs("div", {
                      className: "nexulesuite_sg-sec-head",
                      children: [
                        e.jsx("span", {
                          className: "nexulesuite_sg-sec-ico",
                          children: e.jsx(id, {
                            size: 16,
                          }),
                        }),
                        e.jsx("div", {
                          children: e.jsxs("span", {
                            className: "nexulesuite_sg-sec-title nexulesuite_sg-title-tip",
                            children: [
                              "Accessibility ",
                              e.jsx(Tooltip, {
                                text: "Shows a floating button on the website. Visitors can adjust text size, contrast, fonts, links, animations, cursor, spacing, speech, reading mask, and focus.",
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "nexulesuite_sg-grid-2 nexulesuite_sg-grid-2-stretch",
                      children: [
                        e.jsxs("div", {
                          className: "nexulesuite_sg-stack",
                          children: [
                            e.jsxs("div", {
                              className: "nexulesuite_sg-toggle-card",
                              children: [
                                e.jsxs("div", {
                                  className: "nexulesuite_sg-toggle-card-body",
                                  children: [
                                    e.jsx("span", {
                                      className: "nexulesuite_sg-toggle-card-title",
                                      children: "Enable Accessibility",
                                    }),
                                    e.jsx("p", {
                                      className: "hint",
                                      children: "Floating widget with full accessibility tools",
                                    }),
                                  ],
                                }),
                                e.jsx("div", {
                                  className: "nexulesuite_sg-toggle" + (a.accessibilityEnabled ? " on" : ""),
                                  role: "switch",
                                  "aria-checked": !!a.accessibilityEnabled,
                                  tabIndex: 0,
                                  onClick: () => f("accessibilityEnabled", !a.accessibilityEnabled),
                                  onKeyDown: (M) => {
                                    (M.key === " " || M.key === "Enter") &&
                                      (M.preventDefault(), f("accessibilityEnabled", !a.accessibilityEnabled));
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
                            e.jsxs("div", {
                              className: "nexulesuite_sg-toggle-card",
                              children: [
                                e.jsxs("div", {
                                  className: "nexulesuite_sg-toggle-card-body",
                                  children: [
                                    e.jsx("span", {
                                      className: "nexulesuite_sg-toggle-card-title",
                                      children: "Enable Live Chat",
                                    }),
                                    e.jsx("p", {
                                      className: "hint",
                                      children:
                                        "Adds the chat button to the Acc & Lang dock only (no separate corner bubble). Respects Display conditions.",
                                    }),
                                  ],
                                }),
                                e.jsx("div", {
                                  className: "nexulesuite_sg-toggle" + (a.enableLivechat ? " on" : ""),
                                  role: "switch",
                                  "aria-checked": !!a.enableLivechat,
                                  tabIndex: 0,
                                  onClick: () => {
                                    const n = !a.enableLivechat;
                                    o((P) => ({
                                      ...P,
                                      enableLivechat: n,
                                      liveChatInDock: n ? true : P.liveChatInDock,
                                    }));
                                  },
                                  onKeyDown: (M) => {
                                    (M.key === " " || M.key === "Enter") &&
                                      (M.preventDefault(),
                                      (() => {
                                        const n = !a.enableLivechat;
                                        o((P) => ({
                                          ...P,
                                          enableLivechat: n,
                                          liveChatInDock: n ? true : P.liveChatInDock,
                                        }));
                                      })());
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
                            !0
                              ? e.jsxs("div", {
                                  className: "nexulesuite_sg-select-card nls-btn-position-card",
                                  children: [
                                    e.jsxs("span", {
                                      className: "lbl nexulesuite_lbl-tip",
                                      children: [
                                        "Button position ",
                                        e.jsx(Tooltip, {
                                          text: "Where the floating dock appears on the public site.",
                                        }),
                                      ],
                                    }),
                                    e.jsx("select", {
                                      className: "sel",
                                      value: a.buttonPosition || "right",
                                      onChange: (M) => f("buttonPosition", M.target.value),
                                      children: [
                                        e.jsx("option", {
                                          value: "left",
                                          children: "Left center",
                                        }),
                                        e.jsx("option", {
                                          value: "right",
                                          children: "Right center",
                                        }),
                                        e.jsx("option", {
                                          value: "center",
                                          children: "Bottom center",
                                        }),
                                      ],
                                    }),
                                  ],
                                })
                              : null,
                            !0
                              ? e.jsxs("div", {
                                  className: "nexulesuite_sg-select-card nls-dock-offset-card",
                                  children: [
                                    e.jsxs("span", {
                                      className: "lbl nexulesuite_lbl-tip",
                                      children: [
                                        "Button offset ",
                                        e.jsx(Tooltip, {
                                          text: "With Default selected, any pixel change is written to Accessibility, Language, Custom and Live chat together.",
                                        }),
                                      ],
                                    }),
                                    e.jsx("p", {
                                      className: "nls-dock-display-lead",
                                      children:
                                        "Default selected: changing X/Y applies the same offset to every dock button. Open a button tab only for a one-off position.",
                                    }),
                                    e.jsxs("div", {
                                      className: "nls-dock-offset-layout",
                                      children: [
                                        e.jsx("div", {
                                          className: "nls-dock-display-tabs nls-dock-offset-tabs",
                                          role: "tablist",
                                          "aria-label": "Offset button",
                                          children: ["default", "accessibility", "language", "custom", "chat"]
                                            .filter(function (key) {
                                              return key !== "accessibility" || !!a.accessibilityEnabled;
                                            })
                                            .map(function (key) {
                                              var on = nlsOffsetBtn === key;
                                              var label =
                                                key === "default" ? "Default" : nlsDockOrderLabels[key] || key;
                                              return e.jsx(
                                                "button",
                                                {
                                                  type: "button",
                                                  role: "tab",
                                                  "aria-selected": on,
                                                  className: "nls-dock-display-tab" + (on ? " is-active" : ""),
                                                  onClick: function () {
                                                    return nlsSetOffsetBtn(key);
                                                  },
                                                  children: label,
                                                },
                                                key,
                                              );
                                            }),
                                        }),
                                        e.jsx("div", {
                                          className: "nls-dock-offset-controls",
                                          children: e.jsxs("div", {
                                            className: "nls-a11y-nudge",
                                            children: [
                                              e.jsxs("label", {
                                                className: "nls-a11y-nudge__unit",
                                                children: [
                                                  e.jsx("span", {
                                                    children: "Unit",
                                                  }),
                                                  e.jsxs("select", {
                                                    className: "nls-a11y-nudge__unit-select",
                                                    value: a.buttonOffsetUnit === "em" ? "em" : "px",
                                                    onChange: (M) =>
                                                      f("buttonOffsetUnit", M.target.value === "em" ? "em" : "px"),
                                                    children: [
                                                      e.jsx("option", {
                                                        value: "px",
                                                        children: "px",
                                                      }),
                                                      e.jsx("option", {
                                                        value: "em",
                                                        children: "em",
                                                      }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                              e.jsx("button", {
                                                type: "button",
                                                className: "nls-a11y-nudge__btn nls-a11y-nudge__up",
                                                "aria-label": "Move up 1",
                                                onClick: () =>
                                                  nlsSetDockOffset(nlsOffsetBtn, {
                                                    dy: -1,
                                                  }),
                                                children: "▲",
                                              }),
                                              e.jsxs("div", {
                                                className: "nls-a11y-nudge__mid",
                                                children: [
                                                  e.jsx("button", {
                                                    type: "button",
                                                    className: "nls-a11y-nudge__btn",
                                                    "aria-label": "Move left 1",
                                                    onClick: () =>
                                                      nlsSetDockOffset(nlsOffsetBtn, {
                                                        dx: -1,
                                                      }),
                                                    children: "◀",
                                                  }),
                                                  e.jsxs("div", {
                                                    className: "nls-a11y-nudge__readout",
                                                    children: [
                                                      e.jsxs("label", {
                                                        className: "nls-a11y-nudge__field",
                                                        children: [
                                                          e.jsx("span", {
                                                            children: "X",
                                                          }),
                                                          e.jsx("input", {
                                                            type: "number",
                                                            className: "nls-a11y-nudge__input",
                                                            min: -2000,
                                                            max: 2000,
                                                            step: 1,
                                                            value: nlsGetDockOffset(a, nlsOffsetBtn).x,
                                                            onChange: (M) => {
                                                              const v = parseInt(M.target.value, 10);
                                                              nlsSetDockOffset(nlsOffsetBtn, {
                                                                x: isNaN(v) ? 0 : v,
                                                              });
                                                            },
                                                          }),
                                                        ],
                                                      }),
                                                      e.jsxs("label", {
                                                        className: "nls-a11y-nudge__field",
                                                        children: [
                                                          e.jsx("span", {
                                                            children: "Y",
                                                          }),
                                                          e.jsx("input", {
                                                            type: "number",
                                                            className: "nls-a11y-nudge__input",
                                                            min: -2000,
                                                            max: 2000,
                                                            step: 1,
                                                            value: nlsGetDockOffset(a, nlsOffsetBtn).y,
                                                            onChange: (M) => {
                                                              const v = parseInt(M.target.value, 10);
                                                              nlsSetDockOffset(nlsOffsetBtn, {
                                                                y: isNaN(v) ? 0 : v,
                                                              });
                                                            },
                                                          }),
                                                        ],
                                                      }),
                                                    ],
                                                  }),
                                                  e.jsx("button", {
                                                    type: "button",
                                                    className: "nls-a11y-nudge__btn",
                                                    "aria-label": "Move right 1",
                                                    onClick: () =>
                                                      nlsSetDockOffset(nlsOffsetBtn, {
                                                        dx: 1,
                                                      }),
                                                    children: "▶",
                                                  }),
                                                ],
                                              }),
                                              e.jsx("button", {
                                                type: "button",
                                                className: "nls-a11y-nudge__btn nls-a11y-nudge__down",
                                                "aria-label": "Move down 1",
                                                onClick: () =>
                                                  nlsSetDockOffset(nlsOffsetBtn, {
                                                    dy: 1,
                                                  }),
                                                children: "▼",
                                              }),
                                              e.jsx("button", {
                                                type: "button",
                                                className: "nls-a11y-nudge__reset",
                                                onClick: () =>
                                                  nlsSetDockOffset(nlsOffsetBtn, {
                                                    x: 0,
                                                    y: 0,
                                                  }),
                                                children: "Reset",
                                              }),
                                            ],
                                          }),
                                        }),
                                      ],
                                    }),
                                  ],
                                })
                              : null,
                            !0
                              ? e.jsxs("div", {
                                  className: "nexulesuite_sg-select-card",
                                  children: [
                                    e.jsxs("span", {
                                      className: "lbl nexulesuite_lbl-tip",
                                      children: [
                                        "Button size ",
                                        e.jsxs("span", {
                                          style: {
                                            float: "right",
                                            fontWeight: 700,
                                          },
                                          children: [
                                            ((v) => {
                                              const n = parseInt(v, 10);
                                              return Math.max(0, Math.min(100, Number.isFinite(n) ? n : 52));
                                            })(a.buttonSize),
                                            "px",
                                          ],
                                        }),
                                        e.jsx(Tooltip, {
                                          text: "Diameter of every floating dock button (0–100px).",
                                        }),
                                      ],
                                    }),
                                    e.jsx(nlsRange, {
                                      className: "inp",
                                      min: 0,
                                      max: 100,
                                      step: 1,
                                      value: ((v) => {
                                        const n = parseInt(v, 10);
                                        return Math.max(0, Math.min(100, Number.isFinite(n) ? n : 52));
                                      })(a.buttonSize),
                                      onChange: (M) => f("buttonSize", Number(M.target.value)),
                                      style: {
                                        width: "100%",
                                      },
                                    }),
                                  ],
                                })
                              : null,
                            !0
                              ? e.jsxs("div", {
                                  className: "nexulesuite_sg-select-card",
                                  children: [
                                    e.jsxs("span", {
                                      className: "lbl nexulesuite_lbl-tip",
                                      children: [
                                        "Icon size ",
                                        e.jsxs("span", {
                                          style: {
                                            float: "right",
                                            fontWeight: 700,
                                          },
                                          children: [
                                            ((v, b) => {
                                              const n = parseInt(v, 10);
                                              const bn = parseInt(b, 10);
                                              const bd = Number.isFinite(bn) ? bn : 52;
                                              return Math.max(
                                                0,
                                                Math.min(100, Number.isFinite(n) ? n : Math.round(bd * 0.5)),
                                              );
                                            })(a.buttonIconSize, a.buttonSize),
                                            "px",
                                          ],
                                        }),
                                        e.jsx(Tooltip, {
                                          text: "Icon size inside dock buttons (0–100px).",
                                        }),
                                      ],
                                    }),
                                    e.jsx(nlsRange, {
                                      className: "inp",
                                      min: 0,
                                      max: 100,
                                      step: 1,
                                      value: ((v, b) => {
                                        const n = parseInt(v, 10);
                                        const bn = parseInt(b, 10);
                                        const bd = Number.isFinite(bn) ? bn : 52;
                                        return Math.max(
                                          0,
                                          Math.min(100, Number.isFinite(n) ? n : Math.round(bd * 0.5)),
                                        );
                                      })(a.buttonIconSize, a.buttonSize),
                                      onChange: (M) => f("buttonIconSize", Number(M.target.value)),
                                      style: {
                                        width: "100%",
                                      },
                                    }),
                                  ],
                                })
                              : null,
                            !0
                              ? e.jsxs("div", {
                                  className: "nexulesuite_sg-select-card",
                                  children: [
                                    e.jsxs("span", {
                                      className: "lbl nexulesuite_lbl-tip",
                                      children: [
                                        "Button gap ",
                                        e.jsxs("span", {
                                          style: {
                                            float: "right",
                                            fontWeight: 700,
                                          },
                                          children: [
                                            ((v) => {
                                              const n = parseInt(v, 10);
                                              return Math.max(0, Math.min(100, Number.isFinite(n) ? n : 10));
                                            })(a.buttonGap),
                                            "px",
                                          ],
                                        }),
                                        e.jsx(Tooltip, {
                                          text: "Space between each floating dock button (0–100px).",
                                        }),
                                      ],
                                    }),
                                    e.jsx(nlsRange, {
                                      className: "inp",
                                      min: 0,
                                      max: 100,
                                      step: 1,
                                      value: ((v) => {
                                        const n = parseInt(v, 10);
                                        return Math.max(0, Math.min(100, Number.isFinite(n) ? n : 10));
                                      })(a.buttonGap),
                                      onChange: (M) => f("buttonGap", Number(M.target.value)),
                                      style: {
                                        width: "100%",
                                      },
                                    }),
                                  ],
                                })
                              : null,
                            a.accessibilityEnabled
                              ? e.jsxs("div", {
                                  className: "nexulesuite_sg-select-card",
                                  children: [
                                    e.jsxs("span", {
                                      className: "lbl nexulesuite_lbl-tip",
                                      children: [
                                        "Button colors ",
                                        e.jsx(Tooltip, {
                                          text: "Background and icon/text color for the Accessibility floating button.",
                                        }),
                                      ],
                                    }),
                                    e.jsxs("div", {
                                      className: "nexulesuite_nls-color-grid nls-button-colors-inline",
                                      children: [
                                        e.jsx(ColorField, {
                                          label: "Background",
                                          value: a.accessibilityButtonBg || "#0f766e",
                                          onChange: (M) => f("accessibilityButtonBg", M),
                                        }),
                                        e.jsx(ColorField, {
                                          label: "Icon / text",
                                          value: a.accessibilityButtonText || "#ffffff",
                                          onChange: (M) => f("accessibilityButtonText", M),
                                        }),
                                        e.jsx(nlsFabPreview, {
                                          bg: a.accessibilityButtonBg || "#0f766e",
                                          text: a.accessibilityButtonText || "#ffffff",
                                          label: "Live preview",
                                          iconSrc:
                                            ((window.nexulesuite_Admin || {}).pluginUrl || "") +
                                            "public/images/accessibility-icon.png",
                                          size: a.buttonSize,
                                          iconSize: a.buttonIconSize,
                                        }),
                                      ],
                                    }),
                                  ],
                                })
                              : null,
                            !0
                              ? e.jsxs("div", {
                                  className: "nexulesuite_sg-toggle-card",
                                  children: [
                                    e.jsxs("div", {
                                      className: "nexulesuite_sg-toggle-card-body",
                                      children: [
                                        e.jsx("span", {
                                          className: "nexulesuite_sg-toggle-card-title",
                                          children: "Custom button",
                                        }),
                                        e.jsx("p", {
                                          className: "hint",
                                          children: "Extra floating button in the same dock (link/URL)",
                                        }),
                                      ],
                                    }),
                                    e.jsx("div", {
                                      className: "nexulesuite_sg-toggle" + (a.customButtonEnabled ? " on" : ""),
                                      role: "switch",
                                      "aria-checked": !!a.customButtonEnabled,
                                      tabIndex: 0,
                                      onClick: () => f("customButtonEnabled", !a.customButtonEnabled),
                                      onKeyDown: (M) => {
                                        (M.key === " " || M.key === "Enter") &&
                                          (M.preventDefault(), f("customButtonEnabled", !a.customButtonEnabled));
                                      },
                                      children: e.jsx("span", {
                                        className: "track",
                                        children: e.jsx("span", {
                                          className: "knob",
                                        }),
                                      }),
                                    }),
                                  ],
                                })
                              : null,
                            a.customButtonEnabled
                              ? e.jsxs("div", {
                                  className: "nexulesuite_sg-select-card nls-custom-btn-card",
                                  children: [
                                    e.jsxs("div", {
                                      className: "nls-custom-btn-row nls-custom-btn-row--fields",
                                      children: [
                                        e.jsxs("div", {
                                          className: "nexulesuite_sg-field",
                                          children: [
                                            e.jsxs("span", {
                                              className: "lbl nexulesuite_lbl-tip",
                                              children: [
                                                "Custom button link ",
                                                e.jsx(Tooltip, {
                                                  text: "URL opened when visitors tap the custom dock button.",
                                                }),
                                              ],
                                            }),
                                            e.jsx("input", {
                                              className: "inp",
                                              type: "url",
                                              placeholder: "https://example.com",
                                              value: a.customButtonUrl || "",
                                              onChange: (M) => f("customButtonUrl", M.target.value),
                                            }),
                                          ],
                                        }),
                                        e.jsxs("div", {
                                          className: "nexulesuite_sg-field",
                                          children: [
                                            e.jsx("span", {
                                              className: "lbl",
                                              children: "Label",
                                            }),
                                            e.jsx("input", {
                                              className: "inp",
                                              type: "text",
                                              value: a.customButtonLabel || "Custom",
                                              onChange: (M) => f("customButtonLabel", M.target.value),
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsxs("div", {
                                      className: "nls-custom-btn-row nls-custom-btn-row--style",
                                      children: [
                                        e.jsx(ColorField, {
                                          label: "Background",
                                          value: a.customButtonBg || "#2563eb",
                                          onChange: (M) => f("customButtonBg", M),
                                        }),
                                        e.jsx(ColorField, {
                                          label: "Icon / text",
                                          value: a.customButtonText || "#ffffff",
                                          onChange: (M) => f("customButtonText", M),
                                        }),
                                        e.jsxs("div", {
                                          className: "nexulesuite_sg-toggle-card nls-custom-btn-toggle",
                                          children: [
                                            e.jsxs("div", {
                                              className: "nexulesuite_sg-toggle-card-body",
                                              children: [
                                                e.jsx("span", {
                                                  className: "nexulesuite_sg-toggle-card-title",
                                                  children: "Open in new tab",
                                                }),
                                                e.jsx("p", {
                                                  className: "hint",
                                                  children: "Recommended for external links",
                                                }),
                                              ],
                                            }),
                                            e.jsx("div", {
                                              className:
                                                "nexulesuite_sg-toggle" +
                                                (a.customButtonOpenNewTab !== !1 ? " on" : ""),
                                              role: "switch",
                                              "aria-checked": a.customButtonOpenNewTab !== !1,
                                              tabIndex: 0,
                                              onClick: () =>
                                                f("customButtonOpenNewTab", !(a.customButtonOpenNewTab !== !1)),
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
                                    }),
                                  ],
                                })
                              : null,
                            !0
                              ? e.jsxs("div", {
                                  className: "nexulesuite_sg-select-card",
                                  children: [
                                    e.jsxs("span", {
                                      className: "lbl nexulesuite_lbl-tip",
                                      children: [
                                        "Dock button order ",
                                        e.jsx(Tooltip, {
                                          text: "Top to bottom on the floating dock. Use the arrows to move buttons up or down.",
                                        }),
                                      ],
                                    }),
                                    e.jsx("p", {
                                      className: "hint",
                                      style: {
                                        marginTop: "6px",
                                      },
                                      children: "Only enabled buttons appear on the site.",
                                    }),
                                    e.jsx("div", {
                                      className: "nexulesuite_nls-order-list",
                                      children: (Array.isArray(a.dockButtonOrder) && a.dockButtonOrder.length
                                        ? a.dockButtonOrder
                                        : ["custom", "chat", "language", "accessibility"]
                                      ).map(function (key, idx, arr) {
                                        return e.jsxs(
                                          "div",
                                          {
                                            className: "nexulesuite_nls-order-row",
                                            children: [
                                              e.jsxs("span", {
                                                className: "nexulesuite_nls-order-row__label",
                                                children: [
                                                  e.jsx("span", {
                                                    className: "nexulesuite_nls-order-row__num",
                                                    children: String(idx + 1),
                                                  }),
                                                  nlsDockOrderLabels[key] || key,
                                                ],
                                              }),
                                              e.jsxs("div", {
                                                className: "nexulesuite_nls-order-row__actions",
                                                children: [
                                                  e.jsx("button", {
                                                    type: "button",
                                                    className: "nexulesuite_nls-order-btn",
                                                    disabled: idx === 0,
                                                    "aria-label": "Move up",
                                                    onClick: function () {
                                                      nlsMoveDockOrder(idx, -1);
                                                    },
                                                    children: e.jsx(nm, {
                                                      size: 16,
                                                    }),
                                                  }),
                                                  e.jsx("button", {
                                                    type: "button",
                                                    className: "nexulesuite_nls-order-btn",
                                                    disabled: idx === arr.length - 1,
                                                    "aria-label": "Move down",
                                                    onClick: function () {
                                                      nlsMoveDockOrder(idx, 1);
                                                    },
                                                    children: e.jsx(Qs, {
                                                      size: 16,
                                                    }),
                                                  }),
                                                ],
                                              }),
                                            ],
                                          },
                                          key,
                                        );
                                      }),
                                    }),
                                  ],
                                })
                              : null,
                          ],
                        }),
                        e.jsxs("div", {
                          className: "nexulesuite_sg-stack",
                          children: [
                            !0
                              ? e.jsx("div", {
                                  className: "nexulesuite_sg-select-card nls-a11y-dock-preview-card",
                                  children: e.jsx(nlsDockPreview, {
                                    variant: "panel",
                                    label: "Button live preview",
                                    btnSize: a.buttonSize,
                                    iconSize: a.buttonIconSize,
                                    gap: a.buttonGap,
                                    a11yBg: a.accessibilityButtonBg || "#0f766e",
                                    a11yText: a.accessibilityButtonText || "#ffffff",
                                    langBg: a.languageButtonBg || a.accessibilityButtonBg || "#0f766e",
                                    langText: a.languageButtonText || a.accessibilityButtonText || "#ffffff",
                                    customBg: a.customButtonBg || "#2563eb",
                                    customText: a.customButtonText || "#ffffff",
                                    customIcon: a.customButtonIcon || "link",
                                    chatBg: a.liveChatButtonBg || "#2563eb",
                                    chatText: a.liveChatButtonText || "#ffffff",
                                    chatImg: a.liveChatButtonImage || "",
                                    showCustom: !!a.customButtonEnabled,
                                    showChat: !!a.enableLivechat,
                                    showLang: !!a.languageEnabled,
                                    order: a.dockButtonOrder,
                                    showA11y: !!a.accessibilityEnabled,
                                  }),
                                })
                              : null,
                            a.customButtonEnabled
                              ? e.jsxs("div", {
                                  className: "nexulesuite_sg-select-card",
                                  children: [
                                    e.jsxs("span", {
                                      className: "lbl nexulesuite_lbl-tip",
                                      children: [
                                        "Button icon ",
                                        e.jsx(Tooltip, {
                                          text: "Choose an icon that matches the link — call, email, WhatsApp, booking, shop, and more.",
                                        }),
                                      ],
                                    }),
                                    e.jsxs("div", {
                                      className: "nexulesuite_nls-icon-row",
                                      children: [
                                        e.jsx("div", {
                                          className: "nexulesuite_nls-icon-grid",
                                          role: "listbox",
                                          "aria-label": "Custom button icon",
                                          children: nlsDockCustomIconList.map(function (ic) {
                                            var on = (a.customButtonIcon || "link") === ic.k;
                                            return e.jsxs(
                                              "button",
                                              {
                                                type: "button",
                                                role: "option",
                                                "aria-selected": on,
                                                title: ic.l,
                                                className: "nexulesuite_nls-icon-opt" + (on ? " is-active" : ""),
                                                onClick: function () {
                                                  return f("customButtonIcon", ic.k);
                                                },
                                                children: [
                                                  e.jsx(ic.I, {
                                                    size: 18,
                                                  }),
                                                  e.jsx("span", {
                                                    children: ic.l,
                                                  }),
                                                ],
                                              },
                                              ic.k,
                                            );
                                          }),
                                        }),
                                        (function () {
                                          var ic =
                                            nlsDockCustomIconList.find(function (x) {
                                              return x.k === (a.customButtonIcon || "link");
                                            }) || nlsDockCustomIconList[0];
                                          var nlsIco = ((v, b) => {
                                            const n = parseInt(v, 10);
                                            const bn = parseInt(b, 10);
                                            const bd = Number.isFinite(bn) ? bn : 52;
                                            return Math.max(
                                              0,
                                              Math.min(100, Number.isFinite(n) ? n : Math.round(bd * 0.5)),
                                            );
                                          })(a.buttonIconSize, a.buttonSize);
                                          return e.jsx(nlsFabPreview, {
                                            bg: a.customButtonBg || "#2563eb",
                                            text: a.customButtonText || "#ffffff",
                                            label: "Button preview",
                                            size: a.buttonSize,
                                            iconSize: nlsIco,
                                            icon: e.jsx(ic.I, {
                                              size: nlsIco || 26,
                                            }),
                                          });
                                        })(),
                                      ],
                                    }),
                                  ],
                                })
                              : null,
                            !0
                              ? e.jsxs("div", {
                                  className: "nexulesuite_sg-select-card nls-dock-display-card",
                                  children: [
                                    e.jsxs("span", {
                                      className: "lbl nexulesuite_lbl-tip",
                                      children: [
                                        "Display conditions ",
                                        e.jsx(Tooltip, {
                                          text: "With Default selected, the same display rules apply to all four dock buttons. Use a button tab only for a one-off rule set.",
                                        }),
                                      ],
                                    }),
                                    e.jsx("p", {
                                      className: "nls-dock-display-lead",
                                      children:
                                        "Default selected: rules apply to all four dock buttons together. Open a button tab only when that button needs different pages.",
                                    }),
                                    e.jsx("div", {
                                      className: "nls-dock-display-tabs",
                                      role: "tablist",
                                      "aria-label": "Display condition button",
                                      children: ["default", "accessibility", "language", "custom", "chat"]
                                        .filter(function (key) {
                                          return key !== "accessibility" || !!a.accessibilityEnabled;
                                        })
                                        .map(function (key) {
                                          var on = nlsDispBtn === key;
                                          var label = key === "default" ? "Default" : nlsDockOrderLabels[key] || key;
                                          return e.jsx(
                                            "button",
                                            {
                                              type: "button",
                                              role: "tab",
                                              "aria-selected": on,
                                              className: "nls-dock-display-tab" + (on ? " is-active" : ""),
                                              onClick: function () {
                                                return nlsSetDispBtn(key);
                                              },
                                              children: label,
                                            },
                                            key,
                                          );
                                        }),
                                    }),
                                    e.jsx("div", {
                                      className: "nls-dock-display-body",
                                      children: e.jsx(DisplayConditions, {
                                        variant: "reference",
                                        conditions: nlsGetDockCond(a, nlsDispBtn),
                                        onChange: function (val) {
                                          return nlsSetDockCond(nlsDispBtn, val);
                                        },
                                        conditionMeta: nlsCondMeta,
                                        contentSearch: nlsCondSearch,
                                        onSearchContent: nlsSearchDockContent,
                                        searchKeyPrefix: "dock-" + nlsDispBtn,
                                        description:
                                          nlsDispBtn === "default"
                                            ? "These rules apply to Accessibility, Language, Custom and Live chat together. Leave every box unchecked to show all buttons on every page."
                                            : "These rules apply only to the selected button. Leave every box unchecked to show it on all pages. Use Custom Link for one exact URL.",
                                      }),
                                    }),
                                  ],
                                })
                              : null,
                            e.jsx("p", {
                              className: "hint",
                              style: {
                                marginTop: "12px",
                              },
                              children:
                                "Includes Text Size, Color Contrast, Dyslexia Font, Highlight Links, Pause Animations, Bigger Cursor, Spacing, Text to Speech, Reading Mask, Focus Indicator, and Reset All.",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs("section", {
                  className: "nexulesuite_sg-section",
                  children: [
                    e.jsxs("div", {
                      className: "nexulesuite_sg-sec-head",
                      children: [
                        e.jsx("span", {
                          className: "nexulesuite_sg-sec-ico",
                          children: e.jsx(Si, {
                            size: 16,
                          }),
                        }),
                        e.jsx("div", {
                          children: e.jsxs("span", {
                            className: "nexulesuite_sg-sec-title nexulesuite_sg-title-tip",
                            children: [
                              "Language ",
                              e.jsx(Tooltip, {
                                text: "GTranslate-style switcher with country flags. Uses Google Translate to convert the full page.",
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "nexulesuite_sg-grid-2 nexulesuite_sg-grid-2-stretch",
                      children: [
                        e.jsxs("div", {
                          className: "nexulesuite_sg-stack",
                          children: [
                            e.jsxs("div", {
                              className: "nexulesuite_sg-toggle-card",
                              children: [
                                e.jsxs("div", {
                                  className: "nexulesuite_sg-toggle-card-body",
                                  children: [
                                    e.jsx("span", {
                                      className: "nexulesuite_sg-toggle-card-title",
                                      children: "Enable Language Switcher",
                                    }),
                                    e.jsx("p", {
                                      className: "hint",
                                      children: "Flag chips powered by Google Translate",
                                    }),
                                  ],
                                }),
                                e.jsx("div", {
                                  className: "nexulesuite_sg-toggle" + (a.languageEnabled ? " on" : ""),
                                  role: "switch",
                                  "aria-checked": !!a.languageEnabled,
                                  tabIndex: 0,
                                  onClick: () => f("languageEnabled", !a.languageEnabled),
                                  onKeyDown: (M) => {
                                    (M.key === " " || M.key === "Enter") &&
                                      (M.preventDefault(), f("languageEnabled", !a.languageEnabled));
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
                            a.languageEnabled
                              ? e.jsxs("div", {
                                  className: "nexulesuite_sg-select-card nls-btn-position-card",
                                  children: [
                                    e.jsxs("span", {
                                      className: "lbl nexulesuite_lbl-tip",
                                      children: [
                                        "Default language ",
                                        e.jsx(Tooltip, {
                                          text: "Original page language before translation.",
                                        }),
                                      ],
                                    }),
                                    e.jsx("select", {
                                      className: "sel",
                                      value: a.defaultLanguage || "en",
                                      onChange: (M) => f("defaultLanguage", M.target.value),
                                      children: (i.length
                                        ? i
                                        : [
                                            {
                                              code: "en",
                                              label: "English",
                                            },
                                          ]
                                      ).map((M) =>
                                        e.jsx(
                                          "option",
                                          {
                                            value: M.code,
                                            children: M.label,
                                          },
                                          M.code,
                                        ),
                                      ),
                                    }),
                                  ],
                                })
                              : null,
                            a.languageEnabled
                              ? e.jsxs("div", {
                                  className: "nexulesuite_sg-select-card",
                                  children: [
                                    e.jsxs("span", {
                                      className: "lbl nexulesuite_lbl-tip",
                                      children: [
                                        "Button colors ",
                                        e.jsx(Tooltip, {
                                          text: "Background and icon/text color for the Language floating button.",
                                        }),
                                      ],
                                    }),
                                    e.jsxs("div", {
                                      className: "nexulesuite_nls-color-grid nls-button-colors-inline",
                                      children: [
                                        e.jsx(ColorField, {
                                          label: "Background",
                                          value: a.languageButtonBg || "#0f766e",
                                          onChange: (M) => f("languageButtonBg", M),
                                        }),
                                        e.jsx(ColorField, {
                                          label: "Icon / text",
                                          value: a.languageButtonText || "#ffffff",
                                          onChange: (M) => f("languageButtonText", M),
                                        }),
                                        e.jsx(nlsFabPreview, {
                                          bg: a.languageButtonBg || "#0f766e",
                                          text: a.languageButtonText || "#ffffff",
                                          label: "Live preview",
                                          iconSrc:
                                            ((window.nexulesuite_Admin || {}).pluginUrl || "") +
                                            "public/images/translate-icon.png",
                                          size: a.buttonSize,
                                          iconSize: a.buttonIconSize,
                                        }),
                                      ],
                                    }),
                                  ],
                                })
                              : null,
                          ],
                        }),
                        a.languageEnabled
                          ? e.jsxs("div", {
                              className: "nexulesuite_sg-stack",
                              children: [
                                e.jsxs("span", {
                                  className: "lbl nexulesuite_lbl-tip",
                                  children: [
                                    "Languages to show ",
                                    e.jsx(Tooltip, {
                                      text: "Selected languages appear as flag buttons on the website.",
                                    }),
                                  ],
                                }),
                                e.jsx("div", {
                                  style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill,minmax(148px,1fr))",
                                    gap: "8px",
                                  },
                                  children: i.map((M) => {
                                    const T = (a.languages || []).includes(M.code);
                                    return e.jsxs(
                                      "label",
                                      {
                                        className: "nexulesuite_sg-toggle-card",
                                        style: {
                                          cursor: "pointer",
                                          margin: 0,
                                          padding: "10px 12px",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                          border: T ? "1px solid #7c3aed" : void 0,
                                          background: T ? "#f5f3ff" : void 0,
                                        },
                                        children: [
                                          e.jsx("input", {
                                            type: "checkbox",
                                            checked: T,
                                            onChange: () => S(M.code),
                                            style: {
                                              accentColor: "#7c3aed",
                                            },
                                          }),
                                          e.jsx("span", {
                                            "aria-hidden": "true",
                                            style: {
                                              fontSize: "14px",
                                              lineHeight: "1",
                                            },
                                            children: (function (c) {
                                              c = String(c || "").toLowerCase();
                                              return 2 === c.length
                                                ? String.fromCodePoint(127397 + c.charCodeAt(0)) +
                                                    String.fromCodePoint(127397 + c.charCodeAt(1))
                                                : String(c || "").toUpperCase();
                                            })(M.flag),
                                          }),
                                          e.jsx("span", {
                                            className: "nexulesuite_sg-toggle-card-title",
                                            style: {
                                              fontSize: "12px",
                                            },
                                            children: M.label,
                                          }),
                                        ],
                                      },
                                      M.code,
                                    );
                                  }),
                                }),
                              ],
                            })
                          : null,
                      ],
                    }),
                  ],
                }),
                u.error
                  ? e.jsx("p", {
                      className: "hint",
                      style: {
                        color: "#d63638",
                        marginTop: "12px",
                      },
                      children: u.error,
                    })
                  : null,
              ],
            }),
          }),
    ],
  });
}
