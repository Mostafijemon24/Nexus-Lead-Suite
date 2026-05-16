// Extracted from production bundle for review.
function rm({
    activeId: e,
    onNavigate: f
}) {
    const t = w.useId(),
        [n, l] = w.useState(!1),
        r = () => l(a => !a);
    return w.useEffect(() => {}, [n]), s.jsxs("aside", {
        className: ["flex h-full min-h-screen flex-col border-r border-sidebar-border bg-sidebar py-4 text-slate-200 transition-[width] duration-200 ease-out", n ? "w-[4.5rem]" : "w-60"].join(" "),
        "aria-label": "Nexus Lead Suite navigation",
        children: [s.jsxs("div", {
            className: n ? "flex justify-center px-2" : "grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 px-3",
            children: [s.jsx("div", {
                className: "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl",
                children: s.jsx(lm, {})
            }), !n && s.jsxs("button", {
                type: "button",
                className: "flex min-h-10 min-w-0 items-center gap-1.5 rounded-lg py-0 text-left text-white outline-none ring-violet-500/50 transition hover:bg-white/5 focus-visible:ring-2",
                "aria-expanded": "false",
                "aria-haspopup": "true",
                children: [s.jsx("span", {
                    className: "truncate text-[15px] font-semibold leading-normal tracking-tight",
                    children: "Nexus"
                }), s.jsx(tm, {
                    className: "h-4 w-4 shrink-0 text-slate-400",
                    "aria-hidden": !0
                })]
            })]
        }), s.jsx("div", {
            className: "mx-3 mt-4 border-t border-sidebar-border",
            role: "presentation"
        }), s.jsxs("nav", {
            id: "nexus-ls-sidebar-nav",
            className: "mt-4 flex flex-1 flex-col gap-0.5 px-2",
            "aria-labelledby": t,
            children: [s.jsx("h2", {
                id: t,
                className: "sr-only",
                children: "Main menu"
            }), sm.map(a => {
                var u, g;
                const i = a.icon,
                    o = e === a.id,
                    c = ((g = (u = window == null ? void 0 : window.nexusLsAdmin) == null ? void 0 : u.adminPages) == null ? void 0 : g[a.id]) || "#";
                return s.jsx("div", {
                    children: s.jsxs("a", {
                        href: c,
                        onClick: ev => {
                            if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
                            ev.preventDefault(), f && f(a.id), typeof history < "u" && c && c !== "#" && history.pushState(null, "", c)
                        },
                        className: ["flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium outline-none transition-colors no-underline", n ? "justify-center px-2" : "", o ? "bg-sidebar-active text-white shadow-sm" : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"].join(" "),
                        title: n ? a.label : void 0,
                        "aria-current": o ? "page" : void 0,
                        children: [s.jsx(i, {
                            className: ["h-5 w-5 shrink-0", o ? "text-white" : ""].join(" ")
                        }), !n && s.jsx("span", {
                            className: "min-w-0 flex-1 truncate",
                            children: a.label
                        })]
                    })
                }, a.id)
            })]
        }), s.jsx("div", {
            className: "mx-3 mt-auto border-t border-sidebar-border pt-3",
            children: s.jsxs("button", {
                type: "button",
                onClick: r,
                className: ["flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-400 outline-none ring-violet-500/50 transition hover:bg-white/[0.06] hover:text-slate-200 focus-visible:ring-2", n ? "justify-center px-2" : ""].join(" "),
                "aria-label": n ? "Expand sidebar" : "Collapse sidebar",
                children: [s.jsx(nm, {
                    className: ["h-4 w-4 shrink-0 transition-transform", n ? "rotate-180" : ""].join(" ")
                }), !n && s.jsx("span", {
                    children: "Collapse"
                })]
            })
        })]
    })
}
/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const am = e => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
    im = e => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (t, n, l) => l ? l.toUpperCase() : n.toLowerCase()),
    Nc = e => {
        const t = im(e);
        return t.charAt(0).toUpperCase() + t.slice(1)
    },
    tp = (...e) => e.filter((t, n, l) => !!t && t.trim() !== "" && l.indexOf(t) === n).join(" ").trim(),
    om = e => {
        for (const t in e)
