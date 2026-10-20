import mi from "react";
import * as b from "react";
import * as e from "react/jsx-runtime";
import {
  AppWindow as yi,
  ArrowRight as qc,
  AtSign as Gc,
  Calendar as qn,
  CalendarPlus as tm,
  ChartColumn as sm,
  Check as Lt,
  ChevronDown as Qs,
  ChevronLeft as bi,
  CircleCheck as Yc,
  ClipboardList as im,
  Cloud as om,
  Command as cm,
  Eye as Rt,
  EyeOff as za,
  FilePlus2 as dm,
  FileText as Xs,
  GripVertical as Ni,
  Hash as Ul,
  Info as Ys,
  LayoutList as hm,
  LayoutTemplate as mm,
  Link as wi,
  List as gm,
  ListPlus as xm,
  ListX as fm,
  Lock as ki,
  Mail as qt,
  MapPin as $a,
  MessageSquare as Xn,
  MousePointerClick as nd,
  Palette as ym,
  Phone as ld,
  PhoneCall as jm,
  Plus as dt,
  Radio as Nm,
  Search as Yn,
  Settings as id,
  Shield as km,
  SquareCheckBig as cd,
  Stethoscope as _m,
  Terminal as ud,
  TriangleAlert as Ss,
  Type as pd,
  Upload as Vl,
  User as Fa,
  X as _t,
} from "lucide-react";

export class AdminErrorBoundary extends mi.Component {
  constructor(o) {
    (super(o),
      (this.state = {
        error: null,
        info: null,
      }));
  }
  static getDerivedStateFromError(o) {
    return {
      error: o,
    };
  }
  componentDidCatch(o, i) {
    (console.error("Nexus admin render error:", o, i),
      this.setState({
        info: i,
      }));
  }
  render() {
    var o, i, d;
    if (this.state.error) {
      const u = String(((o = this.state.error) == null ? void 0 : o.message) || this.state.error),
        p = String(((i = this.state.error) == null ? void 0 : i.stack) || ""),
        h = String(((d = this.state.info) == null ? void 0 : d.componentStack) || "");
      return e.jsx("div", {
        style: {
          minHeight: "100vh",
          background: "#f6f7fb",
          padding: "32px",
          fontFamily: "system-ui, sans-serif",
          color: "#1e293b",
          boxSizing: "border-box",
        },
        children: e.jsxs("div", {
          style: {
            maxWidth: "860px",
            margin: "0 auto",
            background: "#fff",
            border: "2px solid #f43f5e",
            borderRadius: "16px",
            boxShadow: "0 20px 44px -16px rgba(16,19,34,.25)",
            overflow: "hidden",
          },
          children: [
            e.jsxs("div", {
              style: {
                background: "#f43f5e",
                color: "#fff",
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              },
              children: [
                e.jsx("span", {
                  "aria-hidden": "true",
                  style: {
                    fontSize: "20px",
                    lineHeight: 1,
                  },
                  children: "⚠",
                }),
                e.jsx("strong", {
                  style: {
                    fontSize: "16px",
                  },
                  children: "Nexus admin crashed while rendering",
                }),
              ],
            }),
            e.jsxs("div", {
              style: {
                padding: "20px 24px",
              },
              children: [
                e.jsx("p", {
                  style: {
                    margin: "0 0 12px",
                    fontSize: "14px",
                    color: "#475569",
                  },
                  children:
                    "A JavaScript error interrupted this screen. Copy the details below when reporting the issue, then reload the page.",
                }),
                e.jsx("div", {
                  style: {
                    background: "#fff1f2",
                    border: "1px solid #fecdd3",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    fontFamily: "ui-monospace, monospace",
                    fontSize: "13px",
                    color: "#be123c",
                    fontWeight: 700,
                    wordBreak: "break-word",
                  },
                  children: u,
                }),
                p
                  ? e.jsxs("details", {
                      style: {
                        marginTop: "14px",
                      },
                      open: !0,
                      children: [
                        e.jsx("summary", {
                          style: {
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#334155",
                          },
                          children: "Stack trace",
                        }),
                        e.jsx("pre", {
                          style: {
                            marginTop: "8px",
                            maxHeight: "220px",
                            overflow: "auto",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "10px",
                            padding: "12px",
                            fontSize: "11px",
                            lineHeight: 1.5,
                            color: "#334155",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          },
                          children: p,
                        }),
                      ],
                    })
                  : null,
                h
                  ? e.jsxs("details", {
                      style: {
                        marginTop: "10px",
                      },
                      children: [
                        e.jsx("summary", {
                          style: {
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#334155",
                          },
                          children: "Component stack",
                        }),
                        e.jsx("pre", {
                          style: {
                            marginTop: "8px",
                            maxHeight: "180px",
                            overflow: "auto",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "10px",
                            padding: "12px",
                            fontSize: "11px",
                            lineHeight: 1.5,
                            color: "#334155",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          },
                          children: h,
                        }),
                      ],
                    })
                  : null,
                e.jsx("button", {
                  type: "button",
                  onClick: () => window.location.reload(),
                  style: {
                    marginTop: "18px",
                    display: "inline-block",
                    background: "#101322",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 22px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  },
                  children: "Reload page",
                }),
              ],
            }),
          ],
        }),
      });
    }
    return this.props.children;
  }
}
export const NAV_GROUPS = [
    {
      id: "main",
      label: "",
      items: [
        {
          route: "activities",
          label: "Analytics",
          icon: sm,
        },
        {
          route: "form-builder",
          label: "Forms",
          icon: Xs,
          children: [
            {
              route: "form-templates",
              label: "Templates",
              icon: mm,
            },
            {
              route: "form-submissions",
              label: "Submissions",
              icon: im,
            },
          ],
        },
        {
          route: "popups",
          label: "Popups",
          icon: yi,
        },
        {
          route: "menu-items",
          label: "Smart Buttons",
          icon: nd,
        },
        {
          route: "emails",
          label: "Email",
          icon: qt,
        },
        {
          route: "accessibility",
          label: "Acc & Lang",
          icon: id,
        },
        {
          route: "settings",
          label: "Settings",
          icon: id,
        },
      ],
    },
  ],
  DEFAULT_ROUTE = "form-builder",
  nlsNavLeaves = (a) => {
    const o = [];
    for (const i of a || []) {
      o.push(i);
      Array.isArray(i.children) && o.push(...i.children);
    }
    return o;
  },
  Em = NAV_GROUPS.flatMap((a) => nlsNavLeaves(a.items)),
  Tm = Object.fromEntries(
    NAV_GROUPS.flatMap((a) =>
      a.items.flatMap((o) => {
        const i = [
          [
            o.route,
            {
              label: o.label,
              group: a.id,
              groupLabel: a.label,
              soon: !!o.soon,
            },
          ],
        ];
        return (
          Array.isArray(o.children) &&
            o.children.forEach((d) =>
              i.push([
                d.route,
                {
                  label: d.label,
                  group: a.id,
                  groupLabel: o.label,
                  soon: !!d.soon,
                  parent: o.route,
                },
              ]),
            ),
          i
        );
      }),
    ),
  );
function Am(a) {
  const o = Tm[a],
    i = [
      {
        label: "Nexus",
        route: DEFAULT_ROUTE,
      },
    ];
  return (
    o &&
      (o.groupLabel &&
        i.push({
          label: o.groupLabel,
        }),
      i.push({
        label: o.label,
        route: a,
      })),
    i
  );
}
function Mm(a) {
  var o, i;
  return (
    ((i = (o = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : o.adminPages) == null
      ? void 0
      : i[a]) || "#"
  );
}
function Lm(a, o) {
  if (!o) return a;
  const i = a.toLowerCase().indexOf(o.toLowerCase());
  return i === -1
    ? a
    : e.jsxs(e.Fragment, {
        children: [
          a.slice(0, i),
          e.jsx("mark", {
            className: "nexulesuite_sidebar-mark bg-transparent font-semibold text-inherit underline",
            children: a.slice(i, i + o.length),
          }),
          a.slice(i + o.length),
        ],
      });
}
function SidebarLogo() {
  return e.jsx("div", {
    className: "nexulesuite_sidebar-logo flex h-full w-full items-center justify-center rounded-xl",
    "aria-hidden": "true",
    children: e.jsx("span", {
      className: "dashicons dashicons-screenoptions",
      style: {
        fontFamily: "dashicons",
        fontSize: "22px",
        lineHeight: 1,
        width: "22px",
        height: "22px",
      },
    }),
  });
}
function SidebarLink({
  item: a,
  isActive: o,
  collapsed: i,
  query: d,
  onNavigate: u,
  sub: nlsSub = !1,
  parentOpen: nlsParent = !1,
}) {
  const p = a.icon,
    h = Mm(a.route);
  return e.jsxs("a", {
    href: h,
    onClick: (x) => {
      x.button !== 0 ||
        x.metaKey ||
        x.ctrlKey ||
        x.shiftKey ||
        x.altKey ||
        (x.preventDefault(), u == null || u(a.route));
    },
    className: [
      "nexulesuite_sidebar-link flex w-full items-center outline-none",
      nlsSub
        ? "is-sub gap-2 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium"
        : "gap-3.5 rounded-xl px-4 py-2.5 text-[14px] font-medium",
      i ? "justify-center px-2.5" : "",
      o ? "is-active" : "",
      !o && nlsParent ? "is-parent-open" : "",
    ].join(" "),
    title: i ? a.label : void 0,
    "aria-current": o ? "page" : void 0,
    children: [
      p &&
        e.jsx(p, {
          className: nlsSub ? "h-3.5 w-3.5 shrink-0 opacity-80" : "h-5 w-5 shrink-0",
        }),
      !i &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsx("span", {
              className: "min-w-0 flex-1 truncate",
              children: Lm(a.label, d),
            }),
            a.soon &&
              e.jsx("span", {
                className:
                  "nexulesuite_sidebar-soon shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                children: "Soon",
              }),
          ],
        }),
    ],
  });
}
const COLLAPSE_MEDIA_QUERY = "(max-width: 782px)";
function Im() {
  return (
    typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia(COLLAPSE_MEDIA_QUERY).matches
  );
}
function nlsSidebarEntry({ item: a, activeId: o, collapsed: i, query: d, onNavigate: u }) {
  const p = Array.isArray(a.children) ? a.children : [],
    h = p.some((x) => x.route === o),
    x = o === a.route;
  if (!p.length)
    return e.jsx(SidebarLink, {
      item: a,
      isActive: x,
      collapsed: i,
      query: d,
      onNavigate: u,
    });
  return e.jsxs("div", {
    className: "nexulesuite_sidebar-branch flex flex-col gap-0.5",
    children: [
      e.jsx(SidebarLink, {
        item: a,
        isActive: x,
        parentOpen: h,
        collapsed: i,
        query: d,
        onNavigate: u,
      }),
      !i &&
        e.jsx("div", {
          className: "nexulesuite_sidebar-subnav ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-slate-200 pl-2",
          role: "group",
          "aria-label": a.label + " submenu",
          children: p.map((c) =>
            e.jsx(
              SidebarLink,
              {
                item: c,
                isActive: o === c.route,
                collapsed: !1,
                query: d,
                onNavigate: u,
                sub: !0,
              },
              c.route,
            ),
          ),
        }),
    ],
  });
}
export function AdminSidebar({ activeId: a, onNavigate: o }) {
  const i = b.useId(),
    d = b.useId(),
    [u, p] = b.useState(Im),
    [h, x] = b.useState("");
  b.useEffect(() => {
    if (typeof window > "u" || typeof window.matchMedia != "function") return;
    const y = window.matchMedia(COLLAPSE_MEDIA_QUERY),
      P = (M) => p(!!M.matches);
    return y.addEventListener
      ? (y.addEventListener("change", P), () => y.removeEventListener("change", P))
      : (y.addListener(P), () => y.removeListener(P));
  }, []);
  const f = b.useMemo(() => {
      const y = h.trim().toLowerCase();
      return y
        ? NAV_GROUPS.map((P) => ({
            ...P,
            items: P.items
              .map((M) => {
                const T = Array.isArray(M.children) ? M.children.filter((F) => F.label.toLowerCase().includes(y)) : [];
                return M.label.toLowerCase().includes(y) || T.length
                  ? {
                      ...M,
                      children: M.label.toLowerCase().includes(y) ? M.children : T,
                    }
                  : null;
              })
              .filter(Boolean),
          })).filter((P) => P.items.length > 0)
        : NAV_GROUPS;
    }, [h]),
    S = h.trim() !== "" && f.length === 0;
  return e.jsxs("aside", {
    className: [
      "nexulesuite_admin-sidebar flex h-full min-h-screen flex-col border-r py-5 transition-[width] duration-200 ease-out",
      u ? "w-[4.5rem]" : "w-60",
    ].join(" "),
    "aria-label": "Nexus Lead Suite navigation",
    children: [
      e.jsxs("div", {
        className: u ? "flex justify-center px-2" : "grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 px-3",
        children: [
          e.jsx("div", {
            className: "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl",
            children: e.jsx(SidebarLogo, {}),
          }),
          !u &&
            e.jsx("div", {
              className:
                "nexulesuite_sidebar-brand flex min-h-10 min-w-0 items-center rounded-lg py-0 text-left text-[15px] font-semibold leading-normal tracking-tight",
              children: e.jsx("span", {
                className: "truncate",
                children: "Nexus",
              }),
            }),
        ],
      }),
      !u &&
        e.jsxs("div", {
          className: "px-3 pt-4",
          children: [
            e.jsx("label", {
              htmlFor: d,
              className: "sr-only",
              children: "Search navigation",
            }),
            e.jsxs("div", {
              className: "nexulesuite_sidebar-search flex items-center gap-2 rounded-lg border px-2.5 py-1.5",
              children: [
                e.jsx(Yn, {
                  className: "h-4 w-4 shrink-0 opacity-60",
                  "aria-hidden": "true",
                }),
                e.jsx("input", {
                  id: d,
                  type: "search",
                  value: h,
                  onChange: (y) => x(y.target.value),
                  onKeyDown: (y) => y.key === "Escape" && x(""),
                  placeholder: "Search…",
                  className: "min-w-0 flex-1 border-none bg-transparent text-[13px] outline-none",
                }),
              ],
            }),
          ],
        }),
      e.jsx("div", {
        className: "nexulesuite_sidebar-divider mx-3 mt-4 border-t",
        role: "presentation",
      }),
      e.jsxs("nav", {
        id: "nexulesuite_sidebar-nav",
        className: "mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3",
        "aria-labelledby": i,
        children: [
          e.jsx("h2", {
            id: i,
            className: "sr-only",
            children: "Main menu",
          }),
          S &&
            e.jsxs("p", {
              className: "px-2 py-3 text-[12px] text-slate-400",
              children: ["No matches for “", h.trim(), "”."],
            }),
          f.map((y) =>
            e.jsxs(
              "div",
              {
                className: "flex flex-col gap-1",
                children: [
                  u
                    ? e.jsx("div", {
                        className: "nexulesuite_sidebar-divider mx-1 my-1 border-t opacity-60",
                        role: "presentation",
                      })
                    : y.label
                      ? e.jsx("h3", {
                          className:
                            "nexulesuite_sidebar-group px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider opacity-60",
                          children: y.label,
                        })
                      : null,
                  y.items.map((P) =>
                    e.jsx(
                      nlsSidebarEntry,
                      {
                        item: P,
                        activeId: a,
                        collapsed: u,
                        query: h.trim(),
                        onNavigate: o,
                      },
                      P.route,
                    ),
                  ),
                ],
              },
              y.id,
            ),
          ),
        ],
      }),
      e.jsx("div", {
        className:
          "nexulesuite_sidebar-footer nexulesuite_sidebar-divider relative z-10 mx-3 mt-auto shrink-0 border-t pt-3",
        children: e.jsxs("button", {
          type: "button",
          onClick: () => p((y) => !y),
          className: [
            "nexulesuite_sidebar-collapse flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-medium outline-none ring-violet-500/50 transition focus-visible:ring-2",
            u ? "justify-center px-2" : "",
          ].join(" "),
          "aria-label": u ? "Expand sidebar" : "Collapse sidebar",
          children: [
            e.jsx(bi, {
              className: ["pointer-events-none h-4 w-4 shrink-0 transition-transform", u ? "rotate-180" : ""].join(" "),
              "aria-hidden": "true",
            }),
            !u &&
              e.jsx("span", {
                className: "pointer-events-none",
                children: "Collapse",
              }),
          ],
        }),
      }),
    ],
  });
}
export function Ti() {
  var a;
  try {
    const o = typeof window < "u" ? window.wp : void 0,
      i = (a = o == null ? void 0 : o.data) == null ? void 0 : a.dispatch;
    if (typeof i != "function") return null;
    const d = i("core/commands");
    return d && typeof d.registerCommand == "function" ? d : null;
  } catch {
    return null;
  }
}
function Dm() {
  return Ti() !== null;
}
function Om() {
  const a = Ti();
  if (a && typeof a.open == "function")
    try {
      return (a.open(), !0);
    } catch {}
  return !1;
}
export function AdminHeader({ route: a, onNavigate: o }) {
  const i = Am(a),
    d = Dm();
  return e.jsxs("header", {
    className:
      "nexulesuite_admin-header sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2 md:px-6",
    children: [
      e.jsx("nav", {
        "aria-label": "Breadcrumb",
        className: "min-w-0",
        children: e.jsx("ol", {
          className: "flex min-w-0 flex-wrap items-center gap-1 text-[13px]",
          children: i.map((u, p) => {
            var f, S;
            const h = p === i.length - 1,
              x = !h && !!u.route;
            return e.jsxs(
              "li",
              {
                className: "flex min-w-0 items-center gap-1",
                children: [
                  p > 0 &&
                    e.jsx("span", {
                      className: "text-slate-300",
                      "aria-hidden": "true",
                      children: "/",
                    }),
                  x
                    ? e.jsx("a", {
                        href:
                          ((S =
                            (f = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : f.adminPages) ==
                          null
                            ? void 0
                            : S[u.route]) || "#",
                        onClick: (y) => {
                          y.metaKey ||
                            y.ctrlKey ||
                            y.shiftKey ||
                            y.altKey ||
                            y.button !== 0 ||
                            (y.preventDefault(), o == null || o(u.route));
                        },
                        className: "truncate text-slate-500 no-underline hover:text-slate-800",
                        children: u.label,
                      })
                    : e.jsx("span", {
                        className: h ? "truncate font-semibold text-slate-800" : "truncate text-slate-500",
                        "aria-current": h ? "page" : void 0,
                        children: u.label,
                      }),
                ],
              },
              `${u.label}-${p}`,
            );
          }),
        }),
      }),
      d &&
        e.jsxs("button", {
          type: "button",
          onClick: () => Om(),
          className:
            "nexulesuite_header-cmdk flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] font-medium text-slate-500 outline-none transition hover:border-slate-300 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-violet-500/40",
          "aria-label": "Open command palette",
          children: [
            e.jsx(Yn, {
              className: "h-3.5 w-3.5",
              "aria-hidden": "true",
            }),
            e.jsx("span", {
              className: "hidden sm:inline",
              children: "Search",
            }),
            e.jsxs("kbd", {
              className:
                "hidden items-center gap-0.5 rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] text-slate-400 sm:inline-flex",
              children: [
                e.jsx(cm, {
                  className: "h-2.5 w-2.5",
                  "aria-hidden": "true",
                }),
                "K",
              ],
            }),
          ],
        }),
    ],
  });
}
export function PageFrame({
  title: a,
  subtitle: o = "",
  icon: i = null,
  headerRight: d = null,
  footer: u = null,
  children: p,
}) {
  return e.jsx("div", {
    className: "min-h-screen bg-[#f6f7fb] px-2 py-2 sm:px-4 sm:py-4 md:px-8 md:py-6 font-sans text-slate-900",
    children: e.jsxs("div", {
      className:
        "w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:h-[calc(100vh-3.25rem)]",
      children: [
        e.jsxs("div", {
          className:
            "px-4 py-4 md:p-5 border-b border-slate-200 bg-white flex flex-wrap gap-3 justify-between items-center shrink-0",
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                i
                  ? e.jsx("div", {
                      className: "bg-blue-600 p-2 rounded-lg text-white",
                      children: i,
                    })
                  : null,
                e.jsxs("div", {
                  children: [
                    e.jsx("h1", {
                      className: "text-base md:text-lg font-bold",
                      children: a,
                    }),
                    o
                      ? e.jsx("p", {
                          className: "text-xs text-slate-400 hidden sm:block",
                          children: o,
                        })
                      : null,
                  ],
                }),
              ],
            }),
            d
              ? e.jsx("div", {
                  className: "flex items-center gap-2",
                  children: d,
                })
              : null,
          ],
        }),
        e.jsxs("div", {
          className: "flex min-h-0 flex-1 flex-col bg-white",
          children: [
            e.jsx("div", {
              className: "min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8",
              children: p,
            }),
            u,
          ],
        }),
      ],
    }),
  });
}
export function StickyFooter({ actions: a = null }) {
  return e.jsxs("footer", {
    className:
      "sticky bottom-0 z-30 flex shrink-0 flex-col gap-4 rounded-b-2xl border-t border-white/[0.08] bg-[#0B1120] px-6 py-4 md:flex-row md:items-center md:justify-between md:gap-4 md:px-8 md:py-4",
    children: [
      e.jsxs("div", {
        className: "flex min-w-0 items-center gap-2.5 text-slate-300",
        children: [
          e.jsx("span", {
            className:
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-sm shadow-emerald-900/30",
            "aria-hidden": "true",
            children: e.jsx(Lt, {
              className: "h-3.5 w-3.5 text-white",
              strokeWidth: 3,
            }),
          }),
          e.jsxs("span", {
            className: "text-[11px] font-medium leading-snug text-slate-200 md:text-xs",
            children: [
              "Developed by",
              " ",
              e.jsx("a", {
                href: "https://mostafijemon.com/",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "font-semibold text-white underline underline-offset-2 hover:text-slate-100",
                children: "Mostafij Emon",
              }),
              ".",
            ],
          }),
        ],
      }),
      a
        ? e.jsx("div", {
            className: "flex flex-wrap items-center justify-end gap-3 md:gap-4",
            children: a,
          })
        : null,
    ],
  });
}
export function ModalShell({ open: a, onClose: o, children: i }) {
  return a
    ? e.jsx("div", {
        className: "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 p-4",
        role: "dialog",
        "aria-modal": "true",
        onMouseDown: (d) => {
          d.target === d.currentTarget && o && o();
        },
        children: i,
      })
    : null;
}
export function ResultModal({
  open: a,
  variant: o = "success",
  title: i,
  message: d,
  dismissLabel: u = "Dismiss",
  onDismiss: p,
}) {
  if (!a) return null;
  const h = o === "success",
    x = i ?? (h ? "Success!" : "Error!"),
    f = d ?? (h ? "Your settings have been successfully updated. All changes are now live." : "An error occurred."),
    S = h ? Yc : Ss,
    y = h ? "bg-emerald-50" : "bg-rose-50",
    P = h ? "text-emerald-500" : "text-rose-500";
  return e.jsx(ModalShell, {
    open: a,
    onClose: p,
    children: e.jsxs("div", {
      className: "w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl",
      children: [
        e.jsxs("div", {
          className: "px-8 pb-6 pt-8 text-center",
          children: [
            e.jsx("div", {
              className: `mx-auto flex h-14 w-14 items-center justify-center rounded-full ${y}`,
              children: e.jsx(S, {
                size: 28,
                className: P,
              }),
            }),
            e.jsx("h3", {
              className: "mt-5 text-xl font-extrabold text-slate-900",
              children: x,
            }),
            e.jsx("p", {
              className: "mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-500",
              children: f,
            }),
          ],
        }),
        e.jsx("div", {
          className: "px-8 pb-8",
          children: e.jsx("button", {
            type: "button",
            onClick: p,
            className:
              "w-full rounded-2xl bg-slate-900 py-4 text-sm font-extrabold text-white transition hover:bg-black",
            children: u,
          }),
        }),
      ],
    }),
  });
}
export function SuccessModal(a) {
  return e.jsx(ResultModal, {
    variant: "success",
    ...a,
  });
}
export function ErrorModal(a) {
  return e.jsx(ResultModal, {
    variant: "error",
    ...a,
  });
}
export function getAdminConfig() {
  const a = window.nexulesuite_Admin || {};
  return {
    restUrl: a.restUrl || "",
    nonce: a.nonce || "",
  };
}
export const jn = "nexulesuite_/v1",
  ICON_OPTIONS = [
    {
      key: "",
      label: "— No icon —",
    },
    {
      key: "stethoscope",
      label: "🩺 Stethoscope",
    },
    {
      key: "dollar",
      label: "💲 Dollar / price",
    },
    {
      key: "shield",
      label: "🛡️ Shield / insurance",
    },
    {
      key: "pin",
      label: "📍 Location pin",
    },
    {
      key: "directions",
      label: "🧭 Directions / map",
    },
    {
      key: "calendar",
      label: "📅 Calendar / booking",
    },
    {
      key: "phone",
      label: "📞 Phone / call",
    },
    {
      key: "mail",
      label: "✉️ Email",
    },
    {
      key: "chat",
      label: "💬 Chat",
    },
    {
      key: "question",
      label: "❓ Question",
    },
    {
      key: "clock",
      label: "🕐 Hours / time",
    },
    {
      key: "info",
      label: "ℹ️ Info",
    },
    {
      key: "heart",
      label: "❤️ Care / health",
    },
    {
      key: "user",
      label: "👤 Person / doctor",
    },
  ];
const CONDITION_RULE_TYPES = [
    {
      type: "homepage",
      label: "Homepage",
    },
    {
      type: "page",
      label: "Specific Page",
      idKey: "ids",
      searchTypes: "page",
    },
    {
      type: "post",
      label: "Specific Post",
      idKey: "ids",
      searchTypes: "post",
    },
    {
      type: "post_type",
      label: "Post Type",
      slugKey: "slugs",
    },
    {
      type: "category",
      label: "Category",
      idKey: "ids",
      taxonomy: "category",
    },
    {
      type: "tag",
      label: "Tag",
      idKey: "ids",
      taxonomy: "tag",
    },
    {
      type: "custom_link",
      label: "Custom Link",
      urlKey: "url",
    },
  ],
  conditionRuleTag = {
    homepage: "page",
    page: "page IDs",
    post: "post IDs",
    post_type: "type",
    category: "slugs",
    tag: "slugs",
    custom_link: "URL",
  },
  rx = {
    homepage: e.jsxs(e.Fragment, {
      children: [
        e.jsx("path", {
          d: "M3 11l9-8 9 8",
        }),
        e.jsx("path", {
          d: "M5 10v10h14V10",
        }),
      ],
    }),
    page: e.jsxs(e.Fragment, {
      children: [
        e.jsx("rect", {
          x: "5",
          y: "3",
          width: "14",
          height: "18",
          rx: "2",
        }),
        e.jsx("path", {
          d: "M9 8h6M9 12h6",
        }),
      ],
    }),
    post: e.jsxs(e.Fragment, {
      children: [
        e.jsx("path", {
          d: "M4 5h16v14H4z",
        }),
        e.jsx("path", {
          d: "M8 9h8M8 13h5",
        }),
      ],
    }),
    post_type: e.jsxs(e.Fragment, {
      children: [
        e.jsx("rect", {
          x: "4",
          y: "4",
          width: "7",
          height: "7",
          rx: "1.5",
        }),
        e.jsx("rect", {
          x: "13",
          y: "4",
          width: "7",
          height: "7",
          rx: "1.5",
        }),
        e.jsx("rect", {
          x: "4",
          y: "13",
          width: "7",
          height: "7",
          rx: "1.5",
        }),
      ],
    }),
    category: e.jsxs(e.Fragment, {
      children: [
        e.jsx("path", {
          d: "M3 7l9-4 9 4-9 4-9-4z",
        }),
        e.jsx("path", {
          d: "M3 12l9 4 9-4",
        }),
      ],
    }),
    tag: e.jsxs(e.Fragment, {
      children: [
        e.jsx("path", {
          d: "M3 11l8-8 9 1 1 9-8 8z",
        }),
        e.jsx("circle", {
          cx: "14.5",
          cy: "9.5",
          r: "1.5",
        }),
      ],
    }),
    custom_link: e.jsxs(e.Fragment, {
      children: [
        e.jsx("path", {
          d: "M10 13a5 5 0 0 0 7.54.54l1-1a5 5 0 0 0-7.07-7.07l-1.72 1.71",
        }),
        e.jsx("path", {
          d: "M14 11a5 5 0 0 0-7.54-.54l-1 1a5 5 0 0 0 7.07 7.07l1.71-1.71",
        }),
      ],
    }),
  },
  ix = {
    page: "e.g. 2, 14, 87",
    post: "e.g. 105, 233",
  };
function ox(a, o) {
  const i = CONDITION_RULE_TYPES.find((d) => d.type === a.type);
  if (!i) return a.type;
  if (a.type === "homepage") return "Homepage";
  if (a.type === "custom_link") {
    const d = String(a.url || "").trim();
    return d ? `Custom Link: ${d}` : "Custom Link";
  }
  if (a.type === "post_type") {
    const d = Array.isArray(a.slugs) ? a.slugs : [];
    return `${i.label}: ${d.join(", ") || "—"}`;
  }
  if (i.idKey && Array.isArray(a.ids) && a.ids.length > 0) {
    if (a.type === "category") {
      const d = a.ids.map((u) => {
        var p, h;
        return (
          ((h = (p = o.categories) == null ? void 0 : p.find((x) => x.id === u)) == null ? void 0 : h.name) || `#${u}`
        );
      });
      return `${i.label}: ${d.join(", ")}`;
    }
    if (a.type === "tag") {
      const d = a.ids.map((u) => {
        var p, h;
        return ((h = (p = o.tags) == null ? void 0 : p.find((x) => x.id === u)) == null ? void 0 : h.name) || `#${u}`;
      });
      return `${i.label}: ${d.join(", ")}`;
    }
    return `${i.label}: ${a.ids.map((d) => `#${d}`).join(", ")}`;
  }
  return i.label;
}
function kd(a, o) {
  const i = CONDITION_RULE_TYPES.find((d) => d.type === a.type);
  if (!i || a.type === "homepage") return "";
  if (a.type === "custom_link") {
    const d = String(a.url || "").trim();
    return d ? ` · ${d}` : "";
  }
  if (a.type === "post_type") {
    const d = Array.isArray(a.slugs) ? a.slugs.filter(Boolean) : [];
    return d.length ? ` · ${d.join(", ")}` : "";
  }
  return i.idKey && Array.isArray(a.ids) && a.ids.length > 0
    ? a.type === "category"
      ? ` · ${a.ids
          .map((u) => {
            var p, h;
            return (
              ((h = (p = o.categories) == null ? void 0 : p.find((x) => x.id === u)) == null ? void 0 : h.name) ||
              `#${u}`
            );
          })
          .join(", ")}`
      : a.type === "tag"
        ? ` · ${a.ids
            .map((u) => {
              var p, h;
              return (
                ((h = (p = o.tags) == null ? void 0 : p.find((x) => x.id === u)) == null ? void 0 : h.name) || `#${u}`
              );
            })
            .join(", ")}`
        : ` · ${a.ids.map((d) => `#${d}`).join(", ")}`
    : "";
}
function cx({ rules: a, match: o, conditionMeta: i, context: d = "group" }) {
  if (!a.length) {
    const h =
      d === "popup"
        ? e.jsxs(e.Fragment, {
            children: [
              "No rules selected — this popup can appear on ",
              e.jsx("span", {
                className: "empty",
                children: "every page",
              }),
              " of your site.",
            ],
          })
        : e.jsxs(e.Fragment, {
            children: [
              "No rules selected — this group shows on ",
              e.jsx("span", {
                className: "empty",
                children: "every page",
              }),
              " of your site.",
            ],
          });
    return e.jsx("p", {
      className: "stext",
      children: h,
    });
  }
  const u = o === "any" ? "OR" : "AND",
    p = o === "any" ? "any" : "all";
  return d === "popup"
    ? e.jsxs("p", {
        className: "stext",
        children: [
          "Allow this popup when ",
          e.jsx("b", {
            children: p,
          }),
          " of these match:",
          e.jsx("br", {}),
          a.map((h, x) => {
            const f = CONDITION_RULE_TYPES.find((P) => P.type === h.type),
              S = (f == null ? void 0 : f.label) || h.type,
              y = kd(h, i);
            return e.jsxs(
              "span",
              {
                children: [
                  x > 0
                    ? e.jsx("span", {
                        className: "op",
                        children: u,
                      })
                    : null,
                  e.jsxs("span", {
                    className: "rule",
                    children: [S, y],
                  }),
                ],
              },
              h.type,
            );
          }),
        ],
      })
    : e.jsxs("p", {
        className: "stext",
        children: [
          "Show this group when ",
          e.jsx("b", {
            children: p,
          }),
          " of these match:",
          e.jsx("br", {}),
          a.map((h, x) => {
            const f = CONDITION_RULE_TYPES.find((P) => P.type === h.type),
              S = (f == null ? void 0 : f.label) || h.type,
              y = kd(h, i);
            return e.jsxs(
              "span",
              {
                children: [
                  x > 0
                    ? e.jsx("span", {
                        className: "op",
                        children: u,
                      })
                    : null,
                  e.jsxs("span", {
                    className: "rule",
                    children: [S, y],
                  }),
                ],
              },
              h.type,
            );
          }),
        ],
      });
}
function DisplayConditionsReference({
  conditions: a,
  onChange: o,
  conditionMeta: i,
  contentSearch: d,
  onSearchContent: u,
  searchKeyPrefix: p,
  description: h,
  toggleRule: x,
  updateRule: f,
  rules: S,
  match: y,
  summaryContext: P = "group",
  secSubClassName: M = "nexulesuite_gd-sec-sub",
}) {
  const T = b.useRef(null),
    F = b.useRef(null),
    V = b.useRef(null),
    z = b.useCallback(() => {
      const w = T.current,
        N = y === "all" ? V.current : F.current,
        H = w == null ? void 0 : w.querySelector(".glider");
      !w ||
        !N ||
        !H ||
        ((H.style.width = `${N.offsetWidth}px`), (H.style.transform = `translateX(${N.offsetLeft - 4}px)`));
    }, [y]);
  b.useEffect(() => (z(), window.addEventListener("resize", z), () => window.removeEventListener("resize", z)), [z]);
  const U = (w, N, H) => {
    var W;
    return !H || w.type === "homepage"
      ? null
      : w.slugKey
        ? e.jsxs("div", {
            className: "nexulesuite_gd-cond-panel",
            children: [
              e.jsx("div", {
                className: "pick-list",
                children: (i.postTypes || []).map((I) => {
                  const C = Array.isArray(N == null ? void 0 : N.slugs) ? N.slugs : [],
                    J = C.includes(I.slug);
                  return e.jsxs(
                    "label",
                    {
                      className: "pick-item",
                      children: [
                        e.jsx("input", {
                          type: "checkbox",
                          checked: J,
                          onChange: (j) => {
                            const le = new Set(C);
                            (j.target.checked ? le.add(I.slug) : le.delete(I.slug),
                              f(w.type, {
                                slugs: [...le],
                              }));
                          },
                          onClick: (j) => j.stopPropagation(),
                        }),
                        I.label,
                      ],
                    },
                    I.slug,
                  );
                }),
              }),
              e.jsx("div", {
                className: "phint",
                children: "Select one or more post types to match.",
              }),
            ],
          })
        : w.taxonomy === "category"
          ? e.jsxs("div", {
              className: "nexulesuite_gd-cond-panel",
              children: [
                e.jsx("div", {
                  className: "pick-list",
                  children: (i.categories || []).map((I) => {
                    const C = Array.isArray(N == null ? void 0 : N.ids) ? N.ids : [],
                      J = C.includes(I.id);
                    return e.jsxs(
                      "label",
                      {
                        className: "pick-item",
                        children: [
                          e.jsx("input", {
                            type: "checkbox",
                            checked: J,
                            onChange: (j) => {
                              const le = new Set(C);
                              (j.target.checked ? le.add(I.id) : le.delete(I.id),
                                f(w.type, {
                                  ids: [...le],
                                }));
                            },
                            onClick: (j) => j.stopPropagation(),
                          }),
                          I.name,
                        ],
                      },
                      I.id,
                    );
                  }),
                }),
                e.jsx("div", {
                  className: "phint",
                  children: "Matches when the visitor is on one of these categories.",
                }),
              ],
            })
          : w.taxonomy === "tag"
            ? e.jsxs("div", {
                className: "nexulesuite_gd-cond-panel",
                children: [
                  e.jsx("div", {
                    className: "pick-list",
                    children: (i.tags || []).map((I) => {
                      const C = Array.isArray(N == null ? void 0 : N.ids) ? N.ids : [],
                        J = C.includes(I.id);
                      return e.jsxs(
                        "label",
                        {
                          className: "pick-item",
                          children: [
                            e.jsx("input", {
                              type: "checkbox",
                              checked: J,
                              onChange: (j) => {
                                const le = new Set(C);
                                (j.target.checked ? le.add(I.id) : le.delete(I.id),
                                  f(w.type, {
                                    ids: [...le],
                                  }));
                              },
                              onClick: (j) => j.stopPropagation(),
                            }),
                            I.name,
                          ],
                        },
                        I.id,
                      );
                    }),
                  }),
                  e.jsx("div", {
                    className: "phint",
                    children: "Matches when the visitor is on one of these tags.",
                  }),
                ],
              })
            : w.searchTypes && u
              ? e.jsxs("div", {
                  className: "nexulesuite_gd-cond-panel",
                  children: [
                    e.jsx("input", {
                      type: "search",
                      placeholder: ix[w.type] || `Search ${w.label.toLowerCase()}…`,
                      onChange: (I) => u(`${p}-${w.type}`, w.searchTypes, I.target.value),
                      onClick: (I) => I.stopPropagation(),
                    }),
                    e.jsx("div", {
                      className: "pick-list",
                      children: (((W = d[`${p}-${w.type}`]) == null ? void 0 : W.results) || []).map((I) => {
                        const C = Array.isArray(N == null ? void 0 : N.ids) ? N.ids : [],
                          J = C.includes(I.id);
                        return e.jsxs(
                          "label",
                          {
                            className: "pick-item",
                            children: [
                              e.jsx("input", {
                                type: "checkbox",
                                checked: J,
                                onChange: (j) => {
                                  const le = new Set(C);
                                  (j.target.checked ? le.add(I.id) : le.delete(I.id),
                                    f(w.type, {
                                      ids: [...le],
                                    }));
                                },
                                onClick: (j) => j.stopPropagation(),
                              }),
                              I.title,
                              " (#",
                              I.id,
                              ")",
                            ],
                          },
                          I.id,
                        );
                      }),
                    }),
                    e.jsx("div", {
                      className: "phint",
                      children: "Comma-separated. Matches when the visitor is on one of these.",
                    }),
                  ],
                })
              : w.type === "custom_link" || w.urlKey
                ? e.jsxs("div", {
                    className: "nexulesuite_gd-cond-panel",
                    children: [
                      e.jsx("input", {
                        type: "url",
                        placeholder: "https://example.com/contact or /contact",
                        value: (N && N.url) || "",
                        onChange: (I) =>
                          f(w.type, {
                            url: I.target.value,
                          }),
                        onClick: (I) => I.stopPropagation(),
                      }),
                      e.jsx("div", {
                        className: "phint",
                        children:
                          "Enter one page URL or path. The button shows only on that exact page — nowhere else.",
                      }),
                    ],
                  })
                : null;
  };
  return e.jsxs(e.Fragment, {
    children: [
      h
        ? e.jsx("p", {
            className: M,
            children: h,
          })
        : null,
      e.jsxs("div", {
        className: "nexulesuite_gd-mode-bar",
        children: [
          e.jsx("span", {
            className: "ml",
            children: "Match mode",
          }),
          e.jsxs("div", {
            className: "nexulesuite_gd-seg",
            ref: T,
            role: "tablist",
            "aria-label": "Match mode",
            children: [
              e.jsx("span", {
                className: "glider",
              }),
              e.jsxs("button", {
                ref: F,
                type: "button",
                className: y === "any" ? "active" : "",
                role: "tab",
                "aria-selected": y === "any",
                onClick: () =>
                  o({
                    match: "any",
                    rules: S,
                  }),
                children: [
                  "OR ",
                  e.jsx("span", {
                    className: "tag",
                    children: "Any rule",
                  }),
                ],
              }),
              e.jsxs("button", {
                ref: V,
                type: "button",
                className: y === "all" ? "active" : "",
                role: "tab",
                "aria-selected": y === "all",
                onClick: () =>
                  o({
                    match: "all",
                    rules: S,
                  }),
                children: [
                  "AND ",
                  e.jsx("span", {
                    className: "tag",
                    children: "All rules",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsx("div", {
        className: "nexulesuite_gd-cond-grid",
        children: CONDITION_RULE_TYPES.map((w) => {
          const N = S.some((W) => W.type === w.type),
            H = S.find((W) => W.type === w.type);
          return e.jsxs(
            "div",
            {
              className: `nexulesuite_gd-cond${N ? " on" : ""}`,
              children: [
                e.jsxs("div", {
                  className: "nexulesuite_gd-cond-top",
                  role: "button",
                  tabIndex: 0,
                  onClick: () => x(w.type, !N),
                  onKeyDown: (W) => {
                    (W.key === " " || W.key === "Enter") && (W.preventDefault(), x(w.type, !N));
                  },
                  children: [
                    e.jsx("span", {
                      className: "nexulesuite_gd-cbox",
                      children: e.jsx("svg", {
                        width: "12",
                        height: "12",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "#fff",
                        strokeWidth: "3.5",
                        children: e.jsx("path", {
                          d: "M5 13l4 4L19 7",
                        }),
                      }),
                    }),
                    e.jsx("span", {
                      className: "ci",
                      children: e.jsx("svg", {
                        width: "16",
                        height: "16",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: "2",
                        children: rx[w.type],
                      }),
                    }),
                    e.jsx("span", {
                      className: "cname",
                      children: w.label,
                    }),
                    e.jsx("span", {
                      className: "ctag",
                      children: conditionRuleTag[w.type],
                    }),
                  ],
                }),
                U(w, H, N),
              ],
            },
            w.type,
          );
        }),
      }),
      e.jsxs("div", {
        className: "nexulesuite_gd-summary",
        children: [
          e.jsx("span", {
            className: "si",
            children: e.jsxs("svg", {
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              children: [
                e.jsx("path", {
                  d: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
                }),
                e.jsx("path", {
                  d: "M9 12l2 2 4-4",
                }),
              ],
            }),
          }),
          e.jsx(cx, {
            rules: S,
            match: y,
            conditionMeta: i,
            context: P,
          }),
        ],
      }),
    ],
  });
}
export function DisplayConditions({
  conditions: a,
  onChange: o,
  conditionMeta: i = {
    postTypes: [],
    categories: [],
    tags: [],
  },
  contentSearch: d = {},
  onSearchContent: u,
  searchKeyPrefix: p = "cond",
  accent: h = "blue",
  description: x = "Control which pages this item appears on. Multiple matching items can be active on the same page.",
  headingIcon: f = null,
  inputClassName: S = "w-full p-2 text-xs border border-slate-200 rounded-lg",
  cardClassName: y = "rounded-xl border p-4 border-slate-200",
  activeCardClassName: P = "",
  variant: M = "default",
}) {
  const T = Array.isArray(a == null ? void 0 : a.rules) ? a.rules : [],
    F = (a == null ? void 0 : a.match) === "all" ? "all" : "any",
    z = P || (h === "emerald" ? "border-emerald-300 bg-emerald-50/40" : "border-blue-300 bg-blue-50/40"),
    U = (N, H) => {
      const W = [...T],
        I = W.findIndex((C) => C.type === N);
      if (H && I === -1) {
        const C = {
          type: N,
        };
        (N === "post_type" ? (C.slugs = []) : N === "custom_link" ? (C.url = "") : N !== "homepage" && (C.ids = []),
          W.push(C));
      } else !H && I !== -1 && W.splice(I, 1);
      o({
        match: F,
        rules: W,
      });
    },
    w = (N, H) => {
      o({
        match: F,
        rules: T.map((W) =>
          W.type === N
            ? {
                ...W,
                ...H,
              }
            : W,
        ),
      });
    };
  return M === "reference" || M === "popup-reference"
    ? e.jsx(DisplayConditionsReference, {
        conditions: a,
        onChange: o,
        conditionMeta: i,
        contentSearch: d,
        onSearchContent: u,
        searchKeyPrefix: p,
        description: x,
        toggleRule: U,
        updateRule: w,
        rules: T,
        match: F,
        summaryContext: M === "popup-reference" ? "popup" : "group",
        secSubClassName: M === "popup-reference" ? "nexulesuite_pop-sec-sub" : "nexulesuite_gd-sec-sub",
      })
    : e.jsxs("div", {
        className: "space-y-6",
        children: [
          x
            ? e.jsx("p", {
                className: "text-xs text-slate-500",
                children: x,
              })
            : null,
          e.jsxs("div", {
            className: "flex flex-wrap gap-3 items-center",
            children: [
              e.jsx("label", {
                className: "text-xs font-bold text-slate-500 uppercase",
                children: "Match mode",
              }),
              e.jsxs("select", {
                value: F,
                onChange: (N) =>
                  o({
                    match: N.target.value,
                    rules: T,
                  }),
                className: "p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm",
                children: [
                  e.jsx("option", {
                    value: "any",
                    children: "Any rule (OR)",
                  }),
                  e.jsx("option", {
                    value: "all",
                    children: "All rules (AND)",
                  }),
                ],
              }),
            ],
          }),
          e.jsx("div", {
            className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
            children: CONDITION_RULE_TYPES.map((N) => {
              var I;
              const H = T.some((C) => C.type === N.type),
                W = T.find((C) => C.type === N.type);
              return e.jsxs(
                "div",
                {
                  className: `${y} ${H ? z : ""}`,
                  children: [
                    e.jsxs("label", {
                      className: "flex items-center gap-2 cursor-pointer",
                      children: [
                        e.jsx("input", {
                          type: "checkbox",
                          checked: H,
                          onChange: (C) => U(N.type, C.target.checked),
                        }),
                        e.jsx("span", {
                          className: "text-sm font-semibold text-slate-700",
                          children: N.label,
                        }),
                      ],
                    }),
                    H && N.slugKey
                      ? e.jsx("div", {
                          className: "mt-3 max-h-36 overflow-y-auto space-y-1",
                          children: (i.postTypes || []).map((C) => {
                            const J = Array.isArray(W == null ? void 0 : W.slugs) ? W.slugs : [],
                              j = J.includes(C.slug);
                            return e.jsxs(
                              "label",
                              {
                                className: "flex items-center gap-2 text-xs text-slate-600",
                                children: [
                                  e.jsx("input", {
                                    type: "checkbox",
                                    checked: j,
                                    onChange: (le) => {
                                      const ie = new Set(J);
                                      (le.target.checked ? ie.add(C.slug) : ie.delete(C.slug),
                                        w(N.type, {
                                          slugs: [...ie],
                                        }));
                                    },
                                  }),
                                  C.label,
                                ],
                              },
                              C.slug,
                            );
                          }),
                        })
                      : null,
                    H && N.taxonomy === "category"
                      ? e.jsx("div", {
                          className: "mt-3 max-h-36 overflow-y-auto space-y-1",
                          children: (i.categories || []).map((C) => {
                            const J = Array.isArray(W == null ? void 0 : W.ids) ? W.ids : [],
                              j = J.includes(C.id);
                            return e.jsxs(
                              "label",
                              {
                                className: "flex items-center gap-2 text-xs text-slate-600",
                                children: [
                                  e.jsx("input", {
                                    type: "checkbox",
                                    checked: j,
                                    onChange: (le) => {
                                      const ie = new Set(J);
                                      (le.target.checked ? ie.add(C.id) : ie.delete(C.id),
                                        w(N.type, {
                                          ids: [...ie],
                                        }));
                                    },
                                  }),
                                  C.name,
                                ],
                              },
                              C.id,
                            );
                          }),
                        })
                      : null,
                    H && N.taxonomy === "tag"
                      ? e.jsx("div", {
                          className: "mt-3 max-h-36 overflow-y-auto space-y-1",
                          children: (i.tags || []).map((C) => {
                            const J = Array.isArray(W == null ? void 0 : W.ids) ? W.ids : [],
                              j = J.includes(C.id);
                            return e.jsxs(
                              "label",
                              {
                                className: "flex items-center gap-2 text-xs text-slate-600",
                                children: [
                                  e.jsx("input", {
                                    type: "checkbox",
                                    checked: j,
                                    onChange: (le) => {
                                      const ie = new Set(J);
                                      (le.target.checked ? ie.add(C.id) : ie.delete(C.id),
                                        w(N.type, {
                                          ids: [...ie],
                                        }));
                                    },
                                  }),
                                  C.name,
                                ],
                              },
                              C.id,
                            );
                          }),
                        })
                      : null,
                    H && N.searchTypes && u
                      ? e.jsxs("div", {
                          className: "mt-3 space-y-2",
                          children: [
                            e.jsx("input", {
                              type: "search",
                              placeholder: `Search ${N.label.toLowerCase()}…`,
                              className: S,
                              onChange: (C) => u(`${p}-${N.type}`, N.searchTypes, C.target.value),
                            }),
                            e.jsx("div", {
                              className: "max-h-28 overflow-y-auto space-y-1",
                              children: (((I = d[`${p}-${N.type}`]) == null ? void 0 : I.results) || []).map((C) => {
                                const J = Array.isArray(W == null ? void 0 : W.ids) ? W.ids : [],
                                  j = J.includes(C.id);
                                return e.jsxs(
                                  "label",
                                  {
                                    className: "flex items-center gap-2 text-xs text-slate-600",
                                    children: [
                                      e.jsx("input", {
                                        type: "checkbox",
                                        checked: j,
                                        onChange: (le) => {
                                          const ie = new Set(J);
                                          (le.target.checked ? ie.add(C.id) : ie.delete(C.id),
                                            w(N.type, {
                                              ids: [...ie],
                                            }));
                                        },
                                      }),
                                      C.title,
                                      " (#",
                                      C.id,
                                      ")",
                                    ],
                                  },
                                  C.id,
                                );
                              }),
                            }),
                          ],
                        })
                      : H && (N.type === "custom_link" || N.urlKey)
                        ? e.jsxs("div", {
                            className: "mt-3 space-y-2",
                            children: [
                              e.jsx("input", {
                                type: "url",
                                placeholder: "https://example.com/contact or /contact",
                                className: S,
                                value: (W && W.url) || "",
                                onChange: (C) =>
                                  w(N.type, {
                                    url: C.target.value,
                                  }),
                              }),
                              e.jsx("p", {
                                className: "text-[11px] text-slate-500",
                                children: "Shows only on this exact page URL.",
                              }),
                            ],
                          })
                        : null,
                  ],
                },
                N.type,
              );
            }),
          }),
          T.length > 0
            ? e.jsxs("div", {
                className: "rounded-xl bg-slate-900 p-4 text-[11px] font-mono text-blue-300",
                children: [
                  e.jsx("div", {
                    className: "text-[10px] uppercase tracking-widest text-slate-500 mb-2",
                    children: "Active rules",
                  }),
                  T.map((N) =>
                    e.jsxs(
                      "div",
                      {
                        children: ["• ", ox(N, i)],
                      },
                      N.type,
                    ),
                  ),
                ],
              })
            : null,
          f,
        ],
      });
}
export function nlsRange(a) {
  const o = a || {};
  const i = o.min != null && o.min !== "" ? Number(o.min) : 0;
  const d = o.max != null && o.max !== "" ? Number(o.max) : 100;
  const u = o.step != null && o.step !== "" ? Number(o.step) : 1;
  let p = parseFloat(o.value);
  if (!isFinite(p)) p = i;
  p = Math.min(d, Math.max(i, p));
  const h = d === i ? 0 : ((p - i) / (d - i)) * 100;
  const { type: x, className: f = "", style: S, ...y } = o;
  const w = String(f || "")
    .replace(/\binp\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return e.jsx("div", {
    className: ("nls-slider " + w).trim(),
    style: {
      "--nls-pct": h + "%",
    },
    children: e.jsx(
      "input",
      Object.assign({}, y, {
        type: "range",
        min: i,
        max: d,
        step: isFinite(u) && u > 0 ? u : 1,
        value: p,
        className: "nls-slider__input",
        style: S,
      }),
    ),
  });
}
export function ColorField({ label: a, value: o, onChange: i }) {
  const d = /^#[0-9A-Fa-f]{6}$/.test(o || "") ? (o || "").toLowerCase() : "#ffffff";
  const t = o || d;
  return e.jsxs("div", {
    className: "nexulesuite_nls-color",
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
              "aria-label": a || "Color",
            }),
          }),
          e.jsx("input", {
            type: "text",
            className: "chex",
            value: t,
            spellCheck: !1,
            onChange: (u) => {
              let p = u.target.value.trim();
              (p && !p.startsWith("#") && (p = "#" + p), i(p));
            },
          }),
        ],
      }),
    ],
  });
}
export function nlsFabPreview({ bg: a, text: o, label: i, iconSrc: d, icon: nlsIcon, iconSize: nlsSz, size: nlsBtn }) {
  const nlsBtnRaw = parseInt(nlsBtn, 10);
  const nlsBtnPx = Math.max(0, Math.min(100, Number.isFinite(nlsBtnRaw) ? nlsBtnRaw : 64));
  const nlsSzRaw = parseInt(nlsSz, 10);
  const nlsPx = Math.max(0, Math.min(100, Number.isFinite(nlsSzRaw) ? nlsSzRaw : Math.round(nlsBtnPx * 0.5) || 28));
  return e.jsxs("div", {
    className: "nexulesuite_a11y-fab-preview-wrap",
    children: [
      e.jsx("span", {
        className: "lbl",
        children: i || "Preview",
      }),
      e.jsx("div", {
        className: "nexulesuite_a11y-fab-preview" + (d ? " has-img" : ""),
        style: {
          background: a || "#0f766e",
          color: o || "#ffffff",
          width: nlsBtnPx + "px",
          height: nlsBtnPx + "px",
          minWidth: nlsBtnPx + "px",
          minHeight: nlsBtnPx + "px",
          "--nls-fab-preview-icon": nlsPx + "px",
        },
        children: d
          ? e.jsx("img", {
              key: d + "-" + nlsPx + "-" + nlsBtnPx,
              src: d,
              alt: "",
            })
          : nlsIcon ||
            e.jsx("span", {
              children: "A",
            }),
      }),
    ],
  });
}
export const FIELD_CATALOG = [
    {
      id: "name",
      name: "Name",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Collect user name",
    },
    {
      id: "email",
      name: "Email",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Email address",
    },
    {
      id: "phone",
      name: "Phone",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Phone number",
    },
    {
      id: "address",
      name: "Address",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Full address",
    },
    {
      id: "website",
      name: "Website",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "URL field",
    },
    {
      id: "single-line-text",
      name: "Input",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Short text input",
    },
    {
      id: "textarea",
      name: "Textarea",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Long text input",
    },
    {
      id: "number",
      name: "Number",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Numeric input",
    },
    {
      id: "password",
      name: "Password",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Secure input",
    },
    {
      id: "radio",
      name: "Radio",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Single choice",
    },
    {
      id: "checkbox",
      name: "Checkbox",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Multiple choices",
    },
    {
      id: "dropdown",
      name: "Select",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Select from options",
    },
    {
      id: "date",
      name: "Datepicker",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Pick a date",
    },
    {
      id: "time",
      name: "Timepicker",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Pick a time",
    },
    {
      id: "date-time",
      name: "Date & Time",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Date and time",
    },
    {
      id: "file-upload",
      name: "File Upload",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Upload files",
    },
    {
      id: "calculations",
      name: "Calculations",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Calculated value",
    },
    {
      id: "currency",
      name: "Currency",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Money amount",
    },
    {
      id: "terms-conditions",
      name: "Consent",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Consent checkbox",
    },
    {
      id: "slider",
      name: "Slider",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Range slider",
    },
    {
      id: "rating",
      name: "Rating",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Star rating",
    },
    {
      id: "recaptcha",
      name: "Captcha",
      category: "security",
      row: 1,
      columnSpan: 1,
      description: "Google reCAPTCHA",
    },
    {
      id: "cloudflare",
      name: "Turnstile",
      category: "security",
      row: 1,
      columnSpan: 1,
      description: "Cloudflare Turnstile",
    },
    {
      id: "html",
      name: "HTML",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Custom HTML block",
    },
    {
      id: "hidden",
      name: "Hidden Field",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Hidden value",
    },
    {
      id: "section",
      name: "Section",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Section title",
    },
    {
      id: "page-break",
      name: "Page Break",
      category: "integration",
      row: 1,
      columnSpan: 1,
      description: "Multi-step forms",
    },
    {
      id: "postdata",
      name: "Post Data",
      category: "field",
      row: 1,
      columnSpan: 1,
      description: "Pull post / page data",
    },
    {
      id: "field-group",
      name: "Field Group",
      category: "layout",
      row: 1,
      columnSpan: 1,
      description: "Group fields together",
    },
    {
      id: "1-column",
      name: "1-Column",
      category: "layout",
      row: 0,
      columnSpan: 1,
      description: "Full width container",
    },
    {
      id: "2-column",
      name: "2-Column",
      category: "layout",
      row: 0,
      columnSpan: 2,
      description: "Two columns",
    },
    {
      id: "3-column",
      name: "3-Column",
      category: "layout",
      row: 0,
      columnSpan: 3,
      description: "Three columns",
    },
    {
      id: "4-column",
      name: "4-Column",
      category: "layout",
      row: 0,
      columnSpan: 4,
      description: "Four columns",
    },
  ],
  v = {
    jsx: e.jsx,
    jsxs: e.jsxs,
    Fragment: e.Fragment,
  },
  Qe = mi,
  Cx = {
    name: Fa,
    email: qt,
    "single-line-text": pd,
    textarea: Xn,
    dropdown: Qs,
    radio: Nm,
    checkbox: cd,
    phone: ld,
    address: $a,
    "date-time": qn,
    password: ki,
    website: wi,
    number: Ul,
    "file-upload": Vl,
    date: qn,
    time: qn,
    "terms-conditions": cd,
    "1-column": hm,
    "2-column": gm,
    "3-column": xm,
    "4-column": fm,
    recaptcha: km,
    cloudflare: om,
    "page-break": qc,
    calculations: Ul,
    html: Xn,
    hidden: ki,
    section: hm,
    currency: Ul,
    "field-group": gm,
    slider: Ul,
    rating: Nm,
    postdata: ud,
  },
  Li = FIELD_CATALOG.map((a) => ({
    ...a,
    icon: v.jsx(Cx[a.id] || Gc, {
      size: 24,
    }),
  }));
export function Pd(a) {
  const o = Li.find((i) => i.id === a);
  return (
    (o == null ? void 0 : o.icon) ||
    v.jsx(Gc, {
      size: 24,
    })
  );
}
export const Ex = Qs,
  qa = _t,
  Tx = Ni,
  Ax = dt,
  Px = Yn,
  Mx = Rt,
  Lx = za;
export function Md(a = 1) {
  return {
    label: "",
    showLabel: !0,
    placeholder: "",
    helpText: "",
    required: !1,
    visibility: {
      mode: "single",
    },
    phoneValidation: {
      type: "none",
      characterLimit: 0,
    },
    addressParts: {
      address1: {
        enabled: !0,
        label: "Address",
      },
      address2: {
        enabled: !0,
        label: "Apartment, suite, etc.",
      },
      city: {
        enabled: !0,
        label: "City",
      },
      state: {
        enabled: !0,
        label: "State / Province",
      },
      zip: {
        enabled: !0,
        label: "ZIP / Postal code",
      },
      country: {
        enabled: !0,
        label: "Country",
      },
    },
    consent: {
      label: "Terms & Condition",
      html: 'Yes, I agree with the <a href="#" target="_blank" rel="noopener noreferrer">privacy policy</a> and <a href="#" target="_blank" rel="noopener noreferrer">terms and conditions</a>.',
      mode: "visual",
    },
    backgroundColor: "#ffffff",
    textColor: "#000000",
    borderColor: "#cbd5e1",
    borderRadius: 6,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontWeight: "500",
    options: [],
    optionLayout: "vertical",
    nameParts: {
      prefix: {
        enabled: !1,
        label: "Prefix",
      },
      first: {
        enabled: !0,
        label: "First Name",
      },
      middle: {
        enabled: !1,
        label: "Middle Name",
      },
      last: {
        enabled: !0,
        label: "Last Name",
      },
    },
    conditional: {
      enabled: !1,
      action: "show",
      match: "all",
      rules: [],
    },
    columnSpan: a,
  };
}
function Wx(a) {
  const o = (a == null ? void 0 : a.phoneValidation) || {
    type: "none",
    characterLimit: 0,
  };
  if (o.type === "national")
    return {
      hint: "National format",
      placeholder: "01XXXXXXXXX",
      pattern: "^[0-9]{10,15}$",
    };
  if (o.type === "international")
    return {
      hint: "International format",
      placeholder: "+8801XXXXXXXXX",
      pattern: "^\\+?[0-9]{10,20}$",
    };
  if (o.type === "character_limit") {
    const i = Math.max(1, Math.min(64, parseInt(o.characterLimit || 0, 10) || 0));
    return i > 0
      ? {
          hint: `Exactly ${i} characters`,
          placeholder: "",
          pattern: `^.{${i}}$`,
        }
      : {
          hint: "Character limit",
          placeholder: "",
          pattern: "",
        };
  }
  return {
    hint: "",
    placeholder: "",
    pattern: "",
  };
}
function Rs({ label: a, required: o, show: i = !0 }) {
  return i
    ? v.jsx("div", {
        className: "mb-1.5 flex items-center justify-between",
        children: v.jsxs("label", {
          className: "text-sm font-semibold text-slate-700",
          children: [
            a,
            o
              ? v.jsx("span", {
                  className: "ml-1 text-rose-600",
                  children: "*",
                })
              : null,
          ],
        }),
      })
    : null;
}
function Ga(a) {
  return Pd(a);
}
function Od({ icon: a, children: o }) {
  return a
    ? v.jsxs("div", {
        className: "relative",
        children: [
          v.jsx("div", {
            className: "nexulesuite_fp-ico pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
            children: a,
          }),
          o,
        ],
      })
    : o;
}
function Ii(a = {}, { hasLeftIcon: o = !1, rightPadPx: i = 12 } = {}) {
  const d = Number.isFinite(a.padding) ? a.padding : parseInt(a.padding ?? 12, 10) || 12,
    u = o ? d + 34 : d;
  return {
    backgroundColor: a.backgroundColor || "#ffffff",
    color: a.textColor || "#0f172a",
    borderColor: a.borderColor || "#e2e8f0",
    borderWidth: `${a.borderWidth ?? 1}px`,
    borderRadius: `${a.borderRadius ?? 8}px`,
    paddingTop: `${d}px`,
    paddingBottom: `${d}px`,
    paddingLeft: `${u}px`,
    paddingRight: `${i}px`,
    fontSize: `${a.fontSize ?? 14}px`,
    fontWeight: a.fontWeight ?? 500,
    lineHeight: 1.2,
  };
}
function Qa({ type: a = "text", placeholder: o = "", required: i = !1, settings: d = {}, icon: u = null }) {
  const p = Ii(d, {
    hasLeftIcon: !!u,
    rightPadPx: 12,
  });
  return v.jsx(Od, {
    icon: u,
    children: v.jsx("input", {
      type: a,
      required: i,
      placeholder: o,
      className: (u ? "nexulesuite_fp-inp " : "") + "h-11 w-full outline-none",
      style: p,
    }),
  });
}
function Vx({ placeholder: a = "", required: o = !1, settings: i = {}, icon: d = null }) {
  const u = Ii(i, {
    hasLeftIcon: !!d,
    rightPadPx: 12,
  });
  return v.jsx(Od, {
    icon: d
      ? v.jsx("div", {
          className: "-mt-2",
          children: d,
        })
      : null,
    children: v.jsx("textarea", {
      required: o,
      placeholder: a,
      className: "min-h-28 w-full resize-none outline-none",
      style: u,
    }),
  });
}
function Kx({ placeholder: a, required: o, settings: i }) {
  const [d, u] = Qe.useState(!1),
    p = Ii(i, {
      hasLeftIcon: !0,
      rightPadPx: 44,
    });
  return v.jsxs("div", {
    className: "relative",
    children: [
      v.jsx("div", {
        className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
        children: Ga("password"),
      }),
      v.jsx("input", {
        type: d ? "text" : "password",
        required: o,
        placeholder: a,
        className: "h-11 w-full outline-none",
        style: p,
      }),
      v.jsx("button", {
        type: "button",
        onClick: () => u((h) => !h),
        className:
          "absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700",
        "aria-label": d ? "Hide password" : "Show password",
        children: d
          ? v.jsx(Lx, {
              className: "h-4 w-4",
            })
          : v.jsx(Mx, {
              className: "h-4 w-4",
            }),
      }),
    ],
  });
}
function qx({ placeholder: a, required: o, settings: i }) {
  const [d, u] = Qe.useState(""),
    p = Qe.useMemo(() => `file-${Date.now()}-${Math.random().toString(16).slice(2)}`, []),
    h = {
      backgroundColor: i.backgroundColor || "#ffffff",
      color: i.textColor || "#0f172a",
      borderColor: i.borderColor || "#e2e8f0",
      borderWidth: `${i.borderWidth ?? 1}px`,
      borderRadius: `${i.borderRadius ?? 8}px`,
      padding: `${i.padding ?? 12}px`,
      fontSize: `${i.fontSize ?? 14}px`,
      fontWeight: i.fontWeight ?? 500,
    };
  return v.jsxs("div", {
    children: [
      v.jsx("input", {
        id: p,
        type: "file",
        required: o,
        className: "hidden",
        onChange: (x) => {
          var f;
          const S = (f = x.target.files) == null ? void 0 : f[0];
          u(S ? S.name : "");
        },
      }),
      v.jsxs("div", {
        className: "flex w-full items-center overflow-hidden",
        style: {
          ...h,
          padding: 0,
        },
        children: [
          v.jsxs("div", {
            className: "flex-1 px-3 py-3 text-sm",
            children: [
              v.jsx("span", {
                className: "mr-2 inline-flex align-middle text-slate-400",
                children: Ga("file-upload"),
              }),
              v.jsx("span", {
                className: d ? "text-slate-700" : "text-slate-400",
                children: d || a,
              }),
            ],
          }),
          v.jsx("label", {
            htmlFor: p,
            className:
              "cursor-pointer select-none border-l border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100",
            children: "Browse File",
          }),
        ],
      }),
    ],
  });
}
function Gx({ type: a, options: o, inline: i, required: d, name: u }) {
  return v.jsx("div", {
    className: ["mt-2", i ? "flex flex-wrap gap-4" : "space-y-2"].join(" "),
    children: o.map((p, h) =>
      v.jsxs(
        "label",
        {
          className: "flex items-center gap-2 text-sm text-slate-700",
          children: [
            v.jsx("input", {
              type: a,
              name: u || void 0,
              value: p.value != null ? p.value : p.label || "",
              required: d && a === "radio",
            }),
            v.jsx("span", {
              children: p.label || p.value || `Option ${h + 1}`,
            }),
          ],
        },
        h,
      ),
    ),
  });
}
function Bd(a) {
  var o;
  const i = (a == null ? void 0 : a.moduleId) || "",
    d = (a == null ? void 0 : a.settings) || {},
    u = d.label || ((o = a == null ? void 0 : a.module) == null ? void 0 : o.name) || i,
    p = !!d.required,
    h = d.placeholder || "",
    x = Ga(i);
  if (i === "name") {
    const f = d.nameParts || {},
      S = [
        ["prefix", "Prefix"],
        ["first", "First Name"],
        ["middle", "Middle Name"],
        ["last", "Last Name"],
      ].filter(([P]) => (f[P] ? !!f[P].enabled : P === "first" || P === "last")),
      y = S.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1";
    return v.jsxs("div", {
      className: "space-y-3",
      children: [
        v.jsx(Rs, {
          label: u || "Name",
          required: p,
          show: d.showLabel !== !1,
        }),
        v.jsx("div", {
          className: `grid grid-cols-1 gap-3 ${y}`,
          children: S.map(([P, M]) => {
            var T;
            return v.jsx(
              Qa,
              {
                placeholder: ((T = f == null ? void 0 : f[P]) == null ? void 0 : T.label) || M,
                required: p && (P === "first" || P === "last"),
                settings: d,
                icon: Ga("name"),
              },
              P,
            );
          }),
        }),
      ],
    });
  }
  if (i === "phone") {
    const f = Wx(d);
    return v.jsxs("div", {
      children: [
        v.jsx(Rs, {
          label: u || "Phone",
          required: p,
          show: d.showLabel !== !1,
        }),
        v.jsx(Qa, {
          type: "tel",
          placeholder: h || f.placeholder,
          required: p,
          settings: d,
          icon: x,
        }),
        f.hint
          ? v.jsx("p", {
              className: "mt-1 text-xs text-slate-400",
              children: f.hint,
            })
          : null,
      ],
    });
  }
  if (i === "textarea")
    return v.jsxs("div", {
      children: [
        v.jsx(Rs, {
          label: u,
          required: p,
          show: d.showLabel !== !1,
        }),
        v.jsx(Vx, {
          placeholder: h,
          required: p,
          settings: d,
          icon: x,
        }),
      ],
    });
  if (i === "password")
    return v.jsxs("div", {
      children: [
        v.jsx(Rs, {
          label: u || "Password",
          required: p,
          show: d.showLabel !== !1,
        }),
        v.jsx(Kx, {
          placeholder: h || "Password…",
          required: p,
          settings: d,
        }),
        d.helpText
          ? v.jsx("p", {
              className: "mt-1 text-xs text-slate-400",
              children: d.helpText,
            })
          : null,
      ],
    });
  if (i === "terms-conditions") {
    const f =
      (d.consent || {}).html ||
      'Yes, I agree with the <a href="#" target="_blank" rel="noopener noreferrer">privacy policy</a> and <a href="#" target="_blank" rel="noopener noreferrer">terms and conditions</a>.';
    return v.jsx("div", {
      children: v.jsxs("label", {
        className: "flex items-center gap-3 text-sm text-slate-700",
        children: [
          v.jsx("input", {
            type: "checkbox",
            className: "h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-200",
          }),
          v.jsx("span", {
            dangerouslySetInnerHTML: {
              __html: f,
            },
          }),
        ],
      }),
    });
  }
  if (i === "file-upload")
    return v.jsxs("div", {
      children: [
        v.jsx(Rs, {
          label: u || "File Upload",
          required: p,
          show: d.showLabel !== !1,
        }),
        v.jsx(qx, {
          placeholder: h || "File upload…",
          required: p,
          settings: d,
        }),
        d.helpText
          ? v.jsx("p", {
              className: "mt-1 text-xs text-slate-400",
              children: d.helpText,
            })
          : null,
      ],
    });
  if (i === "radio" || i === "checkbox") {
    const f = (d.optionLayout || "vertical") === "inline",
      S =
        Array.isArray(d.options) && d.options.length
          ? d.options
          : [
              {
                label: "Option 1",
                value: "option_1",
              },
            ];
    return v.jsxs("div", {
      children: [
        v.jsx(Rs, {
          label: u,
          required: p,
          show: d.showLabel !== !1,
        }),
        v.jsx(Gx, {
          type: i,
          options: S,
          inline: f,
          required: p,
          name: (a == null ? void 0 : a.id) || void 0,
        }),
      ],
    });
  }
  if (i === "dropdown") {
    const f =
      Array.isArray(d.options) && d.options.length
        ? d.options
        : [
            {
              label: "Select…",
              value: "",
            },
          ];
    return v.jsxs("div", {
      children: [
        v.jsx(Rs, {
          label: u,
          required: p,
          show: d.showLabel !== !1,
        }),
        v.jsxs("div", {
          className: "relative",
          children: [
            v.jsx("div", {
              className:
                "nexulesuite_fp-ico pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
              children: x,
            }),
            v.jsx("select", {
              className:
                "nexulesuite_fp-inp h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm",
              style: {
                maxWidth: "none",
                paddingLeft: "2.875rem",
              },
              required: p,
              children: f.map((S, y) =>
                v.jsx(
                  "option",
                  {
                    value: S.value || "",
                    children: S.label || S.value || `Option ${y + 1}`,
                  },
                  y,
                ),
              ),
            }),
          ],
        }),
      ],
    });
  }
  if (i === "address") {
    const f = d.addressParts || {},
      S = [
        ["address1", "Address"],
        ["address2", "Apartment, suite, etc."],
        ["city", "City"],
        ["state", "State / Province"],
        ["zip", "ZIP / Postal code"],
        ["country", "Country"],
      ];
    return v.jsxs("div", {
      className: "space-y-3",
      children: [
        v.jsx(Rs, {
          label: u || "Address",
          required: p,
          show: d.showLabel !== !1,
        }),
        v.jsx("div", {
          className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
          children: S.filter(([y]) => (f[y] ? !!f[y].enabled : !0)).map(([y, P]) => {
            var M;
            return v.jsx(
              Qa,
              {
                placeholder: ((M = f == null ? void 0 : f[y]) == null ? void 0 : M.label) || P,
                required: p && y === "address1",
                settings: d,
                icon: x,
              },
              y,
            );
          }),
        }),
      ],
    });
  }
  return v.jsxs("div", {
    children: [
      v.jsx(Rs, {
        label: u,
        required: p,
        show: d.showLabel !== !1,
      }),
      v.jsx(Qa, {
        placeholder: h,
        required: p,
        settings: d,
        icon: x,
      }),
    ],
  });
}
function evaluatePreviewConditions(a, o) {
  if (!a || !o)
    return {
      value: "",
      values: [],
    };
  let i = null;
  if (
    (a.querySelectorAll("[data-field-id]").forEach((f) => {
      !i && f.getAttribute("data-field-id") === o && (i = f);
    }),
    !i)
  )
    return {
      value: "",
      values: [],
    };
  const d = Array.from(i.querySelectorAll("input, select, textarea")),
    u = d.filter((f) => f.tagName === "INPUT" && f.type === "radio");
  if (u.length) {
    const f = u.find((y) => y.checked),
      S = f ? String(f.value) : "";
    return {
      value: S,
      values: S ? [S] : [],
    };
  }
  const p = d.filter((f) => f.tagName === "INPUT" && f.type === "checkbox");
  if (p.length) {
    const f = p.filter((S) => S.checked).map((S) => String(S.value));
    return {
      value: f.join(","),
      values: f,
    };
  }
  const h = d.find((f) => f.tagName === "SELECT");
  if (h) {
    const f = String(h.value || "");
    return {
      value: f,
      values: f ? [f] : [],
    };
  }
  const x = d.find((f) => f.tagName === "INPUT" || f.tagName === "TEXTAREA");
  if (x) {
    const f = String(x.value || "");
    return {
      value: f,
      values: f ? [f] : [],
    };
  }
  return {
    value: "",
    values: [],
  };
}
function Xa(a) {
  const o = String(a ?? "").trim();
  if (o === "") return null;
  if (/^-?\d+(\.\d+)?$/.test(o)) return parseFloat(o);
  const i = Date.parse(o);
  return isNaN(i) ? null : i;
}
function Ud(a, o) {
  const i = String(o.operator || "is"),
    d = o.value == null ? "" : String(o.value),
    u = evaluatePreviewConditions(a, String(o.field || "")),
    p = u.value,
    h = u.values || [];
  switch (i) {
    case "is":
      return h.length ? h.indexOf(d) !== -1 : p === d;
    case "is_not":
      return h.length ? h.indexOf(d) === -1 : p !== d;
    case "contains":
      return p.toLowerCase().indexOf(d.toLowerCase()) !== -1;
    case "starts_with":
      return p.toLowerCase().indexOf(d.toLowerCase()) === 0;
    case "ends_with": {
      const x = p.toLowerCase(),
        f = d.toLowerCase();
      return f.length <= x.length && x.lastIndexOf(f) === x.length - f.length;
    }
    case "greater_than": {
      const x = Xa(p),
        f = Xa(d);
      return x !== null && f !== null && x > f;
    }
    case "less_than": {
      const x = Xa(p),
        f = Xa(d);
      return x !== null && f !== null && x < f;
    }
    case "is_empty":
      return p.trim() === "";
    case "is_not_empty":
      return p.trim() !== "";
    default:
      return !1;
  }
}
function collectPreviewFields(a) {
  if (!a) return;
  const o = [];
  if (
    (a.querySelectorAll("[data-nexulesuite_conditional]").forEach((u) => {
      let p = null;
      try {
        p = JSON.parse(u.getAttribute("data-nexulesuite_conditional") || "null");
      } catch {
        p = null;
      }
      p &&
        Array.isArray(p.rules) &&
        p.rules.length &&
        o.push({
          wrap: u,
          cfg: p,
        });
    }),
    !o.length)
  )
    return;
  let i = !0,
    d = 0;
  for (; i && d <= o.length; ) {
    ((i = !1), d++);
    for (const u of o) {
      const p = Array.isArray(u.cfg.rules) ? u.cfg.rules : [],
        h = u.cfg.match === "any" ? p.some((S) => Ud(a, S)) : p.every((S) => Ud(a, S)),
        x = u.cfg.action === "hide" ? !h : h,
        f = u.wrap.style.display === "none";
      x && f ? ((u.wrap.style.display = ""), (i = !0)) : !x && !f && ((u.wrap.style.display = "none"), (i = !0));
    }
  }
}
function Hd(a) {
  const o = a && a.settings && a.settings.conditional;
  if (!o || !o.enabled || !Array.isArray(o.rules) || !o.rules.length) return null;
  const i = o.rules
    .filter((d) => d && d.field)
    .map((d) => ({
      field: String(d.field),
      operator: String(d.operator || "is"),
      value: d.value == null ? "" : String(d.value),
    }));
  return i.length
    ? JSON.stringify({
        action: o.action === "hide" ? "hide" : "show",
        match: o.match === "any" ? "any" : "all",
        rules: i,
      })
    : null;
}
export function FormPreviewModal({ isOpen: a, onClose: o, form: i }) {
  const d = Array.isArray(i == null ? void 0 : i.steps) ? i.steps : [],
    [u, p] = Qe.useState(0),
    h = Math.max(0, Math.min(d.length - 1, u)),
    x = d[h] ||
      d[0] || {
        title: "",
        subtitle: "",
        fields: [],
      },
    f = Array.isArray(x.fields) ? x.fields : [],
    S = Qe.useMemo(
      () =>
        f.map((T) => ({
          ...T,
          settings: (T == null ? void 0 : T.settings) || {},
          layout: T == null ? void 0 : T.layout,
        })),
      [f],
    ),
    y = Qe.useRef(null);
  if (
    (Qe.useEffect(() => {
      const T = y.current;
      if (!a || !T) return;
      const F = () => collectPreviewFields(T);
      return (
        F(),
        T.addEventListener("input", F, !0),
        T.addEventListener("change", F, !0),
        () => {
          (T.removeEventListener("input", F, !0), T.removeEventListener("change", F, !0));
        }
      );
    }, [a, S, h]),
    !a)
  )
    return null;
  const P = (i == null ? void 0 : i.styling) || {},
    M = {
      "--nexus-st-form-bg": P.backgroundColor || "#ffffff",
      "--nexus-st-form-text": P.textColor || "#1e293b",
      "--nexus-st-btn": P.buttonColor || "#7c3aed",
      "--nexus-st-stepper": P.stepperColor || P.buttonColor || "#7c3aed",
    };
  return v.jsxs(v.Fragment, {
    children: [
      v.jsx("div", {
        className: "fixed inset-0 z-40 bg-black/40",
        onClick: o,
      }),
      v.jsxs("div", {
        className:
          "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl",
        children: [
          v.jsxs("div", {
            className: "flex items-center justify-between border-b border-slate-200 px-5 py-4",
            children: [
              v.jsxs("div", {
                className: "min-w-0",
                children: [
                  v.jsx("p", {
                    className: "text-sm font-semibold text-slate-800",
                    children: "Form Preview",
                  }),
                  v.jsx("p", {
                    className: "mt-0.5 truncate text-xs text-slate-400",
                    children: (i == null ? void 0 : i.name) || "Untitled Form",
                  }),
                ],
              }),
              v.jsx("button", {
                type: "button",
                onClick: o,
                className:
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                "aria-label": "Close preview",
                children: v.jsx(qa, {
                  className: "h-4 w-4",
                }),
              }),
            ],
          }),
          v.jsx("div", {
            className: "max-h-[75vh] overflow-auto p-6",
            children: v.jsxs("div", {
              className: "mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
              style: M,
              children: [
                (i == null ? void 0 : i.formType) === "multi" && d.length > 1
                  ? v.jsx("div", {
                      className: "mb-4 flex flex-wrap items-center gap-2",
                      children: d.map((T, F) =>
                        v.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => p(F),
                            className: [
                              "rounded-lg px-3 py-2 text-xs font-semibold border transition-colors",
                              F === h
                                ? "border-violet-200 text-violet-700"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                            ].join(" "),
                            style:
                              F === h
                                ? {
                                    backgroundColor: "color-mix(in srgb, var(--nexus-st-stepper), transparent 90%)",
                                  }
                                : void 0,
                            children: T.title || `Step ${F + 1}`,
                          },
                          T.id || F,
                        ),
                      ),
                    })
                  : null,
                x.title
                  ? v.jsx("h3", {
                      className: "text-lg font-bold text-slate-900",
                      children: x.title,
                    })
                  : null,
                x.subtitle
                  ? v.jsx("p", {
                      className: "mt-1 text-sm text-slate-500",
                      children: x.subtitle,
                    })
                  : null,
                v.jsx("div", {
                  className: "mt-5 space-y-5",
                  ref: y,
                  children:
                    S.length === 0
                      ? v.jsx("p", {
                          className: "text-sm text-slate-500",
                          children: "No fields yet.",
                        })
                      : S.map((T) => {
                          var F, V, z;
                          if ((T == null ? void 0 : T.kind) === "layout") {
                            const w = Math.max(
                                1,
                                Math.min(
                                  4,
                                  parseInt(
                                    ((F = T == null ? void 0 : T.layout) == null ? void 0 : F.columns) || 1,
                                    10,
                                  ) || 1,
                                ),
                              ),
                              N = Array.isArray((V = T == null ? void 0 : T.layout) == null ? void 0 : V.items)
                                ? T.layout.items
                                : [];
                            return v.jsxs(
                              "div",
                              {
                                className: "rounded-xl border border-slate-200 bg-slate-50/40 p-4",
                                children: [
                                  v.jsxs("div", {
                                    className: "mb-3 flex items-center justify-between",
                                    children: [
                                      v.jsx("p", {
                                        className: "text-sm font-semibold text-slate-800",
                                        children:
                                          ((z = T == null ? void 0 : T.module) == null ? void 0 : z.name) || "Layout",
                                      }),
                                      v.jsxs("span", {
                                        className: "text-xs font-semibold text-slate-400",
                                        children: ["Width: ", w, "/4"],
                                      }),
                                    ],
                                  }),
                                  v.jsx("div", {
                                    className: [
                                      "grid gap-4",
                                      w === 1
                                        ? "grid-cols-1"
                                        : w === 2
                                          ? "grid-cols-2"
                                          : w === 3
                                            ? "grid-cols-3"
                                            : "grid-cols-4",
                                    ].join(" "),
                                    children: Array.from({
                                      length: w,
                                    }).map((H, W) =>
                                      v.jsx(
                                        "div",
                                        {
                                          className: "rounded-xl border border-slate-200 bg-white p-3",
                                          children:
                                            (N[W] || []).length === 0
                                              ? v.jsx("p", {
                                                  className: "text-xs text-slate-400",
                                                  children: "Empty",
                                                })
                                              : v.jsx("div", {
                                                  className: "space-y-4",
                                                  children: (N[W] || []).map((I) => {
                                                    const C = Hd(I);
                                                    return v.jsx(
                                                      "div",
                                                      {
                                                        "data-field-id": I == null ? void 0 : I.id,
                                                        ...(C
                                                          ? {
                                                              "data-nexulesuite_conditional": C,
                                                            }
                                                          : {}),
                                                        children: Bd(I),
                                                      },
                                                      I.id,
                                                    );
                                                  }),
                                                }),
                                        },
                                        W,
                                      ),
                                    ),
                                  }),
                                ],
                              },
                              T.id,
                            );
                          }
                          const U = Hd(T);
                          return v.jsx(
                            "div",
                            {
                              "data-field-id": T == null ? void 0 : T.id,
                              ...(U
                                ? {
                                    "data-nexulesuite_conditional": U,
                                  }
                                : {}),
                              children: Bd(T),
                            },
                            T.id,
                          );
                        }),
                }),
                v.jsx("div", {
                  className: "mt-6",
                  children:
                    (i == null ? void 0 : i.formType) === "multi" && d.length > 1
                      ? v.jsxs("div", {
                          className: "flex items-center gap-3",
                          children: [
                            v.jsx("button", {
                              type: "button",
                              disabled: h === 0,
                              onClick: () => p((T) => Math.max(0, T - 1)),
                              className: [
                                "flex-1 rounded-lg px-4 py-3 text-sm font-semibold border",
                                h === 0
                                  ? "border-slate-200 bg-slate-50 text-slate-400"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                              ].join(" "),
                              children: "Previous",
                            }),
                            v.jsx("button", {
                              type: "button",
                              onClick: () => {
                                if (h < d.length - 1) {
                                  p((T) => Math.min(d.length - 1, T + 1));
                                  return;
                                }
                              },
                              className: [
                                "flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-white",
                                (h < d.length - 1, "bg-violet-600 hover:bg-violet-700"),
                              ].join(" "),
                              children: h < d.length - 1 ? "Next" : (i == null ? void 0 : i.submitBtnText) || "Submit",
                            }),
                          ],
                        })
                      : v.jsx("button", {
                          type: "button",
                          className:
                            "w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700",
                          children: (i == null ? void 0 : i.submitBtnText) || "Submit",
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
export const nlsSuccessMsgDefault =
  "Thanks for reaching out! We\'ve received your request and are reviewing your details. We will follow up soon to confirm your insurance and finalize your appointment.\n\nNeed help right away? Please call us during our office hours. For all medical emergencies, please call 911 immediately.";
const lf = {
  name: 1,
  email: 1,
  "single-line-text": 1,
  textarea: 2,
  dropdown: 1,
  radio: 1,
  checkbox: 1,
  phone: 1,
  address: 2,
  "date-time": 1,
  password: 1,
  website: 1,
  number: 1,
  "file-upload": 2,
  date: 1,
  time: 1,
  "terms-conditions": 1,
  calculations: 1,
  html: 2,
  hidden: 1,
  section: 2,
  currency: 1,
  stripe: 1,
  paypal: 1,
  "field-group": 2,
  slider: 1,
  rating: 1,
  esignature: 2,
  postdata: 1,
};
let Gd = 0;
function af(a) {
  return ((Gd += 1), `${a}-${Date.now()}-${Gd}-${Math.random().toString(16).slice(2, 8)}`);
}
function rf(a, o = {}, i) {
  const d = i || lf[a] || 1;
  return {
    id: af("field"),
    kind: "field",
    moduleId: a,
    columnSpan: d,
    settings: {
      ...Md(d),
      ...o,
      columnSpan: d,
    },
  };
}
function Cs(...a) {
  return a.map((o) => ({
    label: o,
    value: String(o)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, ""),
  }));
}
export const Fi = [
    "General Checkup",
    "New Patient Appointment",
    "Follow-Up Visit",
    "Consultation",
    "Lab Test / Screening",
    "Urgent Care / Same-Day Visit",
    "Prescription Refill",
    "Annual Physical",
    "Other",
  ],
  Di = {
    label: "Consent",
    html: "I consent to receive calls, texts, or emails for scheduling and treatment purposes. Message/data rates may apply.",
    mode: "visual",
  },
  Gl = () => ({
    enabled: !0,
    action: "show",
    match: "all",
    rules: [
      {
        field: "patient_type",
        operator: "is_not_empty",
        value: "",
      },
    ],
  }),
  Oi = () => ({
    enabled: !0,
    action: "show",
    match: "all",
    rules: [
      {
        field: "patient_type",
        operator: "is",
        value: "new_patient",
      },
    ],
  }),
  FORM_TEMPLATES_PAGE = [
    {
      id: "contact-form",
      name: "Contact Form",
      tagline: "Name, email, phone, message & consent — AJAX submit",
      accent: "violet",
      Icon: qt,
      stepTitle: "Contact Us",
      stepSubtitle: "Send us a message and we'll get back to you shortly.",
      submitBtnText: "Send Message",
      confirmations: [
        {
          id: "confirm-default",
          name: "Default confirmation",
          isDefault: !0,
          type: "message",
          message: nlsSuccessMsgDefault,
          redirectUrl: "",
          conditional: {
            enabled: !1,
            match: "all",
            rules: [],
          },
        },
      ],
      styling: {
        forminatorDesign: "default",
        forminatorTheme: "default",
      },
      fields: [
        [
          "name",
          {
            label: "Name",
            required: !0,
            placeholder: "Your name",
            showLabel: !0,
          },
        ],
        [
          "email",
          {
            label: "Email",
            required: !0,
            placeholder: "you@example.com",
          },
        ],
        [
          "phone",
          {
            label: "Phone",
            required: !1,
            placeholder: "Phone number",
          },
        ],
        [
          "textarea",
          {
            label: "Message",
            required: !0,
            placeholder: "How can we help?",
          },
        ],
        [
          "terms-conditions",
          {
            label: "Consent",
            required: !0,
            consent: {
              label: "Consent",
              html: 'Yes, I agree with the <a href="#" target="_blank" rel="noopener noreferrer">privacy policy</a> and <a href="#" target="_blank" rel="noopener noreferrer">terms and conditions</a>.',
              mode: "visual",
            },
          },
        ],
      ],
    },
    {
      id: "consultation-one",
      name: "Consultation One",
      tagline: "New patients get the full intake; returning get a short form",
      accent: "blue",
      Icon: _m,
      stepTitle: "Need Consultation / Appointment",
      stepSubtitle: "Please submit the form and we'll call you back.",
      submitBtnText: "Submit",
      fields: [
        [
          "radio",
          {
            label: "Patient Type",
            required: !0,
            optionLayout: "inline",
            options: Cs("New patient", "Returning patient"),
          },
          "patient_type",
        ],
        [
          "name",
          {
            label: "Full Name",
            required: !0,
            placeholder: "Full Name",
            conditional: Gl(),
          },
        ],
        [
          "phone",
          {
            label: "Phone",
            required: !0,
            placeholder: "Phone",
            conditional: Gl(),
          },
        ],
        [
          "email",
          {
            label: "Email",
            required: !0,
            placeholder: "Email",
            conditional: Oi(),
          },
        ],
        [
          "date",
          {
            label: "Preferred Date",
            required: !0,
            conditional: Gl(),
          },
        ],
        [
          "radio",
          {
            label: "Preferred Time Format",
            required: !0,
            optionLayout: "inline",
            options: Cs("AM", "PM"),
            conditional: Oi(),
          },
        ],
        [
          "radio",
          {
            label: "Insurance or Self-Pay",
            required: !0,
            optionLayout: "inline",
            options: Cs("Insurance", "Self-Pay"),
            conditional: Oi(),
          },
        ],
        [
          "dropdown",
          {
            label: "Purpose of Visit",
            required: !0,
            placeholder: "Purpose of Visit…",
            options: Cs(...Fi),
            conditional: Gl(),
          },
        ],
        [
          "terms-conditions",
          {
            label: "Consent",
            required: !0,
            consent: {
              ...Di,
            },
            conditional: Gl(),
          },
        ],
      ],
    },
    {
      id: "consultation-two",
      name: "Consultation Two",
      tagline: "Appointment intake shown right away",
      accent: "emerald",
      Icon: tm,
      stepTitle: "Need Consultation / Appointment",
      stepSubtitle: "Please submit the form and we'll call you back.",
      submitBtnText: "Submit",
      fields: [
        [
          "name",
          {
            label: "Full Name",
            required: !0,
            placeholder: "Full Name",
          },
        ],
        [
          "phone",
          {
            label: "Phone",
            required: !0,
            placeholder: "Phone",
          },
        ],
        [
          "email",
          {
            label: "Email",
            required: !0,
            placeholder: "Email",
          },
        ],
        [
          "date",
          {
            label: "Preferred Date",
            required: !0,
          },
        ],
        [
          "radio",
          {
            label: "Preferred Time Format",
            required: !0,
            optionLayout: "inline",
            options: Cs("AM", "PM"),
          },
        ],
        [
          "radio",
          {
            label: "Insurance or Self-Pay",
            required: !0,
            optionLayout: "inline",
            options: Cs("Insurance", "Self-Pay"),
          },
        ],
        [
          "dropdown",
          {
            label: "Purpose of Visit",
            required: !0,
            placeholder: "Purpose of Visit…",
            options: Cs(...Fi),
          },
        ],
        [
          "terms-conditions",
          {
            label: "Consent",
            required: !0,
            consent: {
              ...Di,
            },
          },
        ],
      ],
    },
    {
      id: "consultation-three",
      name: "Consultation Three",
      tagline: "Compact intake with contact method",
      accent: "rose",
      Icon: jm,
      stepTitle: "Need Consultation with designer?",
      stepSubtitle: "Please submit the form and we'll call you back.",
      submitBtnText: "Submit",
      fields: [
        [
          "name",
          {
            label: "Full Name",
            required: !0,
            placeholder: "Full Name",
          },
        ],
        [
          "phone",
          {
            label: "Phone",
            required: !0,
            placeholder: "Phone",
          },
        ],
        [
          "email",
          {
            label: "Email",
            required: !0,
            placeholder: "Email",
          },
        ],
        [
          "dropdown",
          {
            label: "Purpose of Visit",
            required: !0,
            placeholder: "Purpose of Visit…",
            options: Cs(...Fi),
          },
        ],
        [
          "dropdown",
          {
            label: "Contact method",
            required: !0,
            placeholder: "Contact method…",
            options: Cs("Phone", "Email"),
          },
        ],
        [
          "terms-conditions",
          {
            label: "Consent",
            required: !0,
            consent: {
              ...Di,
            },
          },
        ],
      ],
    },
    {
      id: "design-consultation",
      name: "Free Design Consultation",
      tagline: "Bilingual design lead capture with service selection",
      accent: "amber",
      Icon: ym,
      stepTitle: "Get Free Design Consultation",
      stepSubtitle: "Fill out the form and our design team will reach out to you.",
      submitBtnText: "Submit",
      fields: [
        [
          "name",
          {
            label: "Name/Nombre",
            required: !0,
            placeholder: "Name/Nombre",
          },
        ],
        [
          "email",
          {
            label: "Email/Correo electrónico",
            required: !0,
            placeholder: "Email/Correo electrónico",
          },
        ],
        [
          "phone",
          {
            label: "Mobile/Móvil",
            required: !0,
            placeholder: "Mobile/Móvil",
          },
        ],
        [
          "radio",
          {
            label: "Service Needed / Servicio Necesario",
            required: !0,
            optionLayout: "inline",
            options: Cs(
              "Custom Logo/Logotipo personalizado",
              "Graphic /gráfico",
              "Logo & Website /Logotipo y Sitio Web",
            ),
          },
        ],
      ],
    },
  ],
  cf = dm;
function FORM_TEMPLATES(a) {
  if (!a || !Array.isArray(a.fields)) return [];
  const o = {};
  return a.fields
    .map((d) => {
      const u = d[0],
        p = d[1] || {},
        h = d[2],
        x = rf(u, p);
      return (h && (o[h] = x.id), x);
    })
    .map((d) => {
      const u = d.settings && d.settings.conditional;
      if (!u || !Array.isArray(u.rules) || !u.rules.length) return d;
      const p = u.rules.map((h) => {
        const x = h && h.field;
        return x && o[x]
          ? {
              ...h,
              field: o[x],
            }
          : {
              ...h,
            };
      });
      return {
        ...d,
        settings: {
          ...d.settings,
          conditional: {
            ...u,
            rules: p,
          },
        },
      };
    });
}
function nlsGetBootGlobalAppearance() {
  var g = (window.nexulesuite_Admin || {}).globalAppearance;
  return g && g.styling && typeof g.styling === "object" ? g.styling : null;
}
export function nlsWalkFormFields(a, o) {
  const i = (d) =>
    (d || []).map((u) => {
      if (u && u.kind === "field") return o(u);
      if (u && u.kind === "layout" && u.layout)
        return {
          ...u,
          layout: {
            ...u.layout,
            items: (u.layout.items || []).map((p) => i(p)),
          },
        };
      return u;
    });
  return (a || []).map((d) => ({
    ...d,
    fields: i(d.fields),
  }));
}
function nlsListFormFields(a) {
  const o = [];
  nlsWalkFormFields(a, (i) => (o.push(i), i));
  return o;
}
function nlsPatchFormField(a, o, i) {
  return nlsWalkFormFields(a, (d) =>
    d.id === o
      ? {
          ...d,
          settings: {
            ...(d.settings || {}),
            ...i,
          },
        }
      : d,
  );
}
export const DEFAULT_FORM_STYLING = {
    backgroundColor: "#ffffff",
    textColor: "#1e293b",
    buttonColor: "#7c3aed",
    stepperColor: "#7c3aed",
    primaryColor: "#7c3aed",
    fieldFontSize: 14,
    labelFontSize: 13,
    placeholderFontSize: 14,
    fieldGap: 16,
    rowGap: 16,
    columnGap: 16,
    labelSpacing: 6,
    fieldBackgroundColor: "#ffffff",
    fieldTextColor: "#000000",
    fieldBorderColor: "#cbd5e1",
    fieldBorderWidth: 1,
    fieldBorderStyle: "solid",
    fieldBorderRadius: 6,
    fieldPadding: 12,
    fieldFontWeight: "500",
    fieldShadow: "none",
    formShadow: "0 2px 8px rgba(15, 23, 42, 0.07)",
    focusBorderColor: "#7c3aed",
    focusShadow: "0 0 0 3px rgba(124, 58, 237, 0.25)",
    errorBorderColor: "#dc2626",
    autoStack: true,
    stackBreakpoint: 640,
    labelFontFamily: "inherit",
    labelFontWeight: "600",
    labelLineHeight: "1.4",
    labelColor: "#334155",
    labelFontSizeTablet: 0,
    labelFontSizeMobile: 0,
    placeholderFontFamily: "inherit",
    placeholderFontWeight: "400",
    placeholderLineHeight: "1.4",
    placeholderColor: "#94a3b8",
    placeholderFontSizeTablet: 0,
    placeholderFontSizeMobile: 0,
    inputFontFamily: "inherit",
    inputFontSize: 14,
    inputFontWeight: "500",
    inputLineHeight: "1.45",
    inputColor: "#000000",
    inputFontSizeTablet: 0,
    inputFontSizeMobile: 0,
    descFontFamily: "inherit",
    descFontSize: 12,
    descFontWeight: "400",
    descLineHeight: "1.45",
    descColor: "#64748b",
    descFontSizeTablet: 0,
    descFontSizeMobile: 0,
    errorFontFamily: "inherit",
    errorFontSize: 12,
    errorFontWeight: "500",
    errorLineHeight: "1.4",
    errorColor: "#dc2626",
    successFontFamily: "inherit",
    successFontSize: 14,
    successFontWeight: "600",
    successLineHeight: "1.45",
    successColor: "#16a34a",
    rowGapTablet: 0,
    rowGapMobile: 0,
    columnGapTablet: 0,
    columnGapMobile: 0,
    labelSpacingTablet: 0,
    labelSpacingMobile: 0,
    fieldFontSizeTablet: 0,
    fieldFontSizeMobile: 0,
    forminatorDesign: "default",
    forminatorTheme: "default",
  },
  DEFAULT_FORM = {
    id: "form-1",
    name: "Contact Form",
    formType: "simple",
    submitBtnText: "Send Message",
    submissionMethod: "ajax",
    notificationEmail: "",
    crmWebhookUrl: "",
    published: !0,
    styling: {
      ...DEFAULT_FORM_STYLING,
      forminatorDesign: "default",
      forminatorTheme: "default",
    },
    termsConditionText: "",
    confirmations: [Xd()],
    emailRoutes: [],
    steps: [
      {
        id: "step-1",
        title: "Contact Us",
        subtitle: "Send us a message and we'll get back to you shortly.",
        fields: [],
      },
    ],
  };
function Xd() {
  return {
    id: "confirm-default",
    name: "Default confirmation",
    isDefault: !0,
    type: "message",
    message: nlsSuccessMsgDefault,
    redirectUrl: "",
    conditional: {
      enabled: !1,
      match: "all",
      rules: [],
    },
  };
}
function uf(a) {
  const i = (Array.isArray(a) ? a.filter(Boolean) : []).map((d, u) => {
    var p, h, x;
    return {
      id: d.id || `confirm-${u}-${Math.random().toString(36).slice(2, 7)}`,
      name: d.name || "Confirmation",
      isDefault: !!d.isDefault,
      type: d.type === "redirect" ? "redirect" : "message",
      message: typeof d.message == "string" ? d.message : "",
      redirectUrl: typeof d.redirectUrl == "string" ? d.redirectUrl : "",
      conditional: {
        enabled: !!((p = d.conditional) != null && p.enabled),
        match: ((h = d.conditional) == null ? void 0 : h.match) === "any" ? "any" : "all",
        rules: Array.isArray((x = d.conditional) == null ? void 0 : x.rules) ? d.conditional.rules : [],
      },
    };
  });
  return (i.some((d) => d.isDefault) || i.unshift(Xd()), i);
}
export function normalizeForm(a) {
  return {
    termsConditionText: "",
    submissionMethod: "ajax",
    notificationEmail: "",
    crmWebhookUrl: "",
    published: !0,
    ...a,
    styling: {
      ...DEFAULT_FORM_STYLING,
      ...((a == null ? void 0 : a.styling) || {}),
    },
    confirmations: uf(a == null ? void 0 : a.confirmations),
    emailRoutes: Array.isArray(a == null ? void 0 : a.emailRoutes) ? a.emailRoutes : [],
  };
}
function pf() {
  const nlsG = nlsGetBootGlobalAppearance();
  return {
    ...DEFAULT_FORM,
    styling: {
      ...DEFAULT_FORM_STYLING,
      ...(nlsG || {}),
    },
    termsConditionText: "",
    notificationEmail: "",
    crmWebhookUrl: "",
    steps: [
      {
        ...DEFAULT_FORM.steps[0],
        id: `step-${Date.now()}`,
        fields: [],
      },
    ],
  };
}
export function Jd(a) {
  const o = new Set((a || []).map((d) => d.id));
  let i = ((a == null ? void 0 : a.length) || 0) + 1;
  for (; o.has(`form-${i}`); ) i += 1;
  return `form-${i}`;
}
export function formFromTemplate(a, o) {
  const i = pf();
  if (!a)
    return {
      ...i,
      id: o,
      name: "New Simple Form",
      formType: "simple",
    };
  const d = a.styling && typeof a.styling === "object" ? a.styling : {};
  const u = Array.isArray(a.confirmations) && a.confirmations.length ? a.confirmations : i.confirmations;
  return {
    ...i,
    id: o,
    name: a.name,
    formType: "simple",
    submitBtnText: a.submitBtnText || i.submitBtnText,
    notificationEmail: typeof a.notificationEmail == "string" ? a.notificationEmail : i.notificationEmail,
    confirmations: u,
    styling: {
      ...i.styling,
      ...d,
    },
    steps: [
      {
        ...i.steps[0],
        id: `step-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        title: a.stepTitle || a.name,
        subtitle: a.stepSubtitle || "",
        fields: FORM_TEMPLATES(a),
      },
    ],
  };
}
export const Ui = {
  violet: "bg-violet-50 text-violet-600",
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  pink: "bg-pink-50 text-pink-600",
  rose: "bg-rose-50 text-rose-600",
  slate: "bg-slate-100 text-slate-600",
};
function hf({ moduleId: a }) {
  const o = "rounded bg-white ring-1 ring-slate-200";
  return a === "radio" || a === "checkbox"
    ? e.jsxs("div", {
        className: "flex gap-1.5",
        children: [
          e.jsx("span", {
            className: "h-2.5 w-8 rounded-full bg-slate-200",
          }),
          e.jsx("span", {
            className: "h-2.5 w-8 rounded-full bg-slate-100",
          }),
        ],
      })
    : a === "terms-conditions"
      ? e.jsxs("div", {
          className: "flex items-center gap-1.5",
          children: [
            e.jsx("span", {
              className: "h-2.5 w-2.5 flex-none rounded-[3px] ring-1 ring-slate-300",
            }),
            e.jsx("span", {
              className: "h-1.5 flex-1 rounded-full bg-slate-200",
            }),
          ],
        })
      : a === "dropdown"
        ? e.jsx("div", {
            className: `flex h-3.5 items-center justify-end px-1 ${o}`,
            children: e.jsx(Qs, {
              size: 10,
              className: "text-slate-300",
            }),
          })
        : a === "textarea" || a === "address" || a === "file-upload"
          ? e.jsx("div", {
              className: `h-6 ${o}`,
            })
          : e.jsx("div", {
              className: `h-3.5 ${o}`,
            });
}
function mf({ fields: a }) {
  return a != null && a.length
    ? e.jsxs("div", {
        className: "mt-3 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5",
        children: [
          e.jsxs("div", {
            className: "mb-2 flex flex-col items-center gap-1",
            children: [
              e.jsx("span", {
                className: "h-1.5 w-16 rounded-full bg-slate-300",
              }),
              e.jsx("span", {
                className: "h-1 w-24 rounded-full bg-slate-200",
              }),
            ],
          }),
          e.jsx("div", {
            className: "space-y-1.5",
            children: a.map((o, i) =>
              e.jsx(
                hf,
                {
                  moduleId: o.moduleId,
                },
                i,
              ),
            ),
          }),
          e.jsx("div", {
            className: "mt-2 h-3.5 rounded bg-slate-300",
          }),
        ],
      })
    : e.jsxs("div", {
        className:
          "mt-3 flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 py-10 text-slate-400",
        children: [
          e.jsx("span", {
            className: "flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500",
            children: e.jsx(dt, {
              size: 22,
            }),
          }),
          e.jsx("span", {
            className: "text-xs font-semibold text-slate-500",
            children: "Start from scratch",
          }),
          e.jsx("span", {
            className: "text-[11px] text-slate-400",
            children: "Add your own fields",
          }),
        ],
      });
}
export function TemplateCard({ icon: a, name: o, tagline: i, fields: d, onClick: u, onPreview: p }) {
  return e.jsxs("div", {
    className:
      "group flex flex-col rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md",
    children: [
      e.jsxs("button", {
        type: "button",
        onClick: u,
        className:
          "flex flex-1 flex-col rounded-xl p-4 text-left focus:outline-none focus:ring-2 focus:ring-violet-200",
        children: [
          e.jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              e.jsx("span", {
                className: `flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${a.accent}`,
                children: a.node,
              }),
              e.jsxs("span", {
                className: "min-w-0",
                children: [
                  e.jsx("span", {
                    className: "block truncate text-sm font-bold text-slate-800",
                    children: o,
                  }),
                  e.jsx("span", {
                    className: "mt-0.5 block truncate text-xs text-slate-500",
                    children: i,
                  }),
                ],
              }),
            ],
          }),
          e.jsx(mf, {
            fields: d,
          }),
        ],
      }),
      p
        ? e.jsxs("div", {
            className: "flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2",
            children: [
              e.jsx("span", {
                className: "text-[11px] font-medium text-slate-400",
                children: "Click card to use",
              }),
              e.jsxs("button", {
                type: "button",
                onClick: p,
                className:
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-violet-600 transition-colors hover:bg-violet-50",
                children: [
                  e.jsx(Rt, {
                    size: 14,
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
export async function restFetch(a, o = {}) {
  var h, x, f;
  const d =
      (((h = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : h.restUrl) || "").replace(
        /\/$/,
        "",
      ) + a,
    u = await fetch(d, {
      ...o,
      headers: {
        "Content-Type": "application/json",
        "X-WP-Nonce": ((x = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : x.nonce) || "",
        ...(o.headers || {}),
      },
    }),
    p = await u.json().catch(() => null);
  if (!u.ok) {
    const S =
      (p == null ? void 0 : p.message) ||
      ((f = p == null ? void 0 : p.data) == null ? void 0 : f.message) ||
      `Request failed (${u.status})`;
    throw new Error(S);
  }
  return p;
}
export const settingsFetch = async (a, o = {}) => {
    var h, x;
    const i = ((h = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : h.restUrl) || "",
      d = ((x = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : x.nonce) || "",
      u = await fetch(`${i}nexulesuite_/v1${a}`, {
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": d,
          ...(o.headers || {}),
        },
        ...o,
      }),
      p = await u.json().catch(() => ({}));
    return {
      res: u,
      json: p,
    };
  },
  wpFetch = async (a) => {
    var u, p;
    const o = ((u = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : u.restUrl) || "",
      i = ((p = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : p.nonce) || "";
    return (
      await fetch(`${o}${a}`, {
        credentials: "same-origin",
        headers: {
          "X-WP-Nonce": i,
        },
      })
    )
      .json()
      .catch(() => []);
  };
export const useGoogleFontLink = (a, o) => {},
  Sf = ({ enabled: a, onClick: o, label: i, desc: d, icon: u }) =>
    e.jsxs("div", {
      className:
        "flex items-center justify-between gap-3 p-4 bg-white border border-line rounded-card shadow-card transition-all",
      children: [
        e.jsxs("div", {
          className: "flex items-center gap-3 min-w-0",
          children: [
            u &&
              e.jsx("div", {
                className: "p-2 rounded-tile shrink-0",
                style: a
                  ? {
                      background: "#eef2ff",
                      color: "#4f46e5",
                    }
                  : {
                      background: "#f1f5f9",
                      color: "#94a3b8",
                    },
                children: e.jsx(u, {
                  size: 18,
                }),
              }),
            e.jsxs("div", {
              className: "flex flex-col justify-center min-w-0",
              children: [
                e.jsx("h5", {
                  className: "font-display text-sm font-bold text-ink capitalize leading-tight",
                  children: i,
                }),
                d &&
                  e.jsx("p", {
                    className: "text-[10px] text-faint font-medium capitalize mt-1 leading-tight",
                    children: d,
                  }),
              ],
            }),
          ],
        }),
        e.jsx("button", {
          type: "button",
          role: "switch",
          "aria-checked": !!a,
          onClick: o,
          className: "nexulesuite_sg-toggle" + (a ? " on" : ""),
          "aria-label": typeof i === "string" ? i : "Toggle",
          style: {
            display: "inline-flex",
            alignItems: "center",
            flex: "none",
            lineHeight: 0,
            cursor: "pointer",
            border: 0,
            background: "transparent",
            padding: 0,
          },
          children: e.jsx("span", {
            className: "track",
            style: {
              width: 38,
              height: 22,
              borderRadius: 999,
              background: a ? "#4f46e5" : "#cfd4de",
              position: "relative",
              display: "block",
              transition: "background .18s",
            },
            children: e.jsx("span", {
              className: "knob",
              style: {
                position: "absolute",
                top: 3,
                left: 3,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,.22)",
                transform: a ? "translateX(16px)" : "translateX(0)",
                transition: "transform .18s",
              },
            }),
          }),
        }),
      ],
    }),
  Tooltip = ({ text: a, label: o = "More information" }) =>
    e.jsxs("button", {
      type: "button",
      className: "nexulesuite_tip",
      "aria-label": o,
      children: [
        e.jsx(Ys, {
          size: 13,
          "aria-hidden": "true",
        }),
        e.jsx("span", {
          className: "nexulesuite_tip-bubble",
          role: "tooltip",
          children: a,
        }),
      ],
    });
