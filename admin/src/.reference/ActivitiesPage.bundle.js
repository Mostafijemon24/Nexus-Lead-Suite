// Extracted from production bundle for review.
function uh() {
    const [e, t] = w.useState("all"), [n, l] = w.useState(""), [r, a] = w.useState(""), [i, o] = w.useState(""), [c, u] = w.useState(!1), [g, y] = w.useState([]), [p, j] = w.useState(!0), [f, C] = w.useState(""), [B, x] = w.useState(""), [d, h] = w.useState(!1), [b, z] = w.useState({
        open: !1,
        variant: "success",
        title: "",
        message: ""
    });
    return w.useEffect(() => {
        const m = setTimeout(() => x(n.trim()), 400);
        return () => clearTimeout(m)
    }, [n]), w.useEffect(() => {
        let m = !1;
        return (async () => {
            var T, v, K;
            j(!0), C("");
            try {
                const M = ((T = window == null ? void 0 : window.nexusLsAdmin) == null ? void 0 : T.restUrl) || "",
                    W = ((v = window == null ? void 0 : window.nexusLsAdmin) == null ? void 0 : v.nonce) || "",
                    H = new URLSearchParams({
                        tab: e,
                        dateFrom: r,
                        dateTo: i,
                        search: B
                    }),
                    N = await fetch(`${M}nexus-lead-suite/v1/reports/activities/list?${H}`, {
                        headers: {
                            "X-WP-Nonce": W
                        },
                        credentials: "same-origin"
                    }),
                    I = await N.json().catch(() => ({}));
                if (m) return;
                if (!N.ok || !(I != null && I.success)) {
                    y([]);
                    let _ = (I == null ? void 0 : I.message) || (I == null ? void 0 : I.code) || "Could not load activities.";
                    typeof _ == "object" && _ !== null && (_ = _.message || _.code || "Could not load activities."), C(typeof _ == "string" ? _ : "Could not load activities.");
                    return
                }
                C(""), y(Array.isArray((K = I == null ? void 0 : I.data) == null ? void 0 : K.rows) ? I.data.rows : [])
            } catch {
                m || (y([]), C("Could not load activities."))
            } finally {
                m || j(!1)
            }
        })(), () => {
            m = !0
        }
    }, [e, r, i, B]), s.jsxs(sl, {
        title: "Activities",
        subtitle: "Unified log: forms, calls, interactions and triggers",
        icon: s.jsx(np, {
            size: 18
        }),
        footer: s.jsx(cs, {}),
        headerRight: s.jsxs("div", {
            className: "flex items-center gap-2",
            children: [s.jsx(ah, {}), s.jsxs("div", {
                className: "relative",
                children: [s.jsx("input", {
                    value: n,
                    onChange: m => l(m.target.value),
                    placeholder: "Search...",
                    className: "h-9 w-44 sm:w-56 md:w-72 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs md:text-sm outline-none ring-violet-200 focus:ring-2"
                }), s.jsx("span", {
                    className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
                    children: s.jsx(up, {
                        size: 16
                    })
                })]
            })]
        }),
        children: [s.jsx(Ir, {
            open: b.open,
            variant: b.variant,
            title: b.title,
            message: b.message,
            onDismiss: () => z(m => ({
                ...m,
                open: !1
            }))
        }), s.jsxs("div", {
            className: "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
            children: [s.jsx("div", {
                className: "flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-50 p-1",
                children: ih.map(m => s.jsx(dh, {
                    active: e === m.id,
                    onClick: () => t(m.id),
                    children: m.label
                }, m.id))
            }), s.jsxs("div", {
                className: "flex flex-wrap items-center gap-2 sm:ml-auto",
                children: [s.jsxs("label", {
                    className: "flex items-center gap-1.5 text-xs font-semibold text-slate-500",
                    children: [s.jsx("span", {
                        children: "From:"
                    }), s.jsx("input", {
                        type: "date",
                        value: r,
                        onChange: m => a(m.target.value),
                        className: "h-8 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none ring-violet-200 focus:ring-2"
                    })]
                }), s.jsxs("label", {
                    className: "flex items-center gap-1.5 text-xs font-semibold text-slate-500",
                    children: [s.jsx("span", {
                        children: "To:"
                    }), s.jsx("input", {
                        type: "date",
                        value: i,
                        onChange: m => o(m.target.value),
                        className: "h-8 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none ring-violet-200 focus:ring-2"
                    })]
                }), s.jsx("button", {
                    type: "button",
                    onClick: () => {
                        a(""), o(""), l(""), x(""), t("all")
                    },
                    className: "h-8 rounded-lg px-3 text-xs font-semibold text-slate-500 hover:bg-slate-50",
                    children: "Clear"
                }), p ? s.jsx("span", {
                    className: "text-[11px] font-semibold uppercase tracking-wide text-violet-600",
                    children: "Updatingâ€¦"
                }) : null, s.jsx("div", {
                    className: "hidden sm:block mx-1 h-5 w-px bg-slate-200"
                }), s.jsxs("button", {
                    type: "button",
                    onClick: () => u(!0),
                    className: "inline-flex h-8 items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 text-xs font-semibold text-violet-700 hover:bg-violet-100",
                    children: [s.jsx(fa, {
                        name: "pdf",
                        className: "h-3.5 w-3.5"
                    }), s.jsx("span", {
                        className: "hidden sm:inline",
                        children: "Report PDF"
                    }), s.jsx("span", {
                        className: "sm:hidden",
                        children: "PDF"
                    })]
                }), s.jsxs("button", {
                    type: "button",
                    onClick: async () => {
                        var m, T;
                        if (!d && window.confirm("Clear all activities? This cannot be undone.")) {
                            h(!0);
                            try {
                                const v = ((m = window == null ? void 0 : window.nexusLsAdmin) == null ? void 0 : m.restUrl) || "",
                                    K = ((T = window == null ? void 0 : window.nexusLsAdmin) == null ? void 0 : T.nonce) || "",
                                    M = await fetch(`${v}nexus-lead-suite/v1/reports/activities/clear`, {
                                        method: "POST",
                                        headers: {
                                            "X-WP-Nonce": K
                                        },
                                        credentials: "same-origin"
                                    }),
                                    W = await M.json().catch(() => ({}));
                                if (!M.ok || !(W != null && W.success)) {
                                    let H = (W == null ? void 0 : W.message) || (W == null ? void 0 : W.code) || "Could not clear activities.";
                                    typeof H == "object" && H !== null && (H = H.message || H.code || "Could not clear activities."), z({
                                        open: !0,
                                        variant: "error",
                                        title: "Error!",
                                        message: typeof H == "string" ? H : "Could not clear activities."
                                    });
                                    return
                                }
                                y([]), z({
                                    open: !0,
                                    variant: "success",
                                    title: "Success!",
                                    message: "All activities have been cleared."
                                })
                            } catch {
                                z({
                                    open: !0,
                                    variant: "error",
                                    title: "Error!",
                                    message: "Could not clear activities."
                                })
                            } finally {
                                h(!1)
                            }
                        }
                    },
                    className: "inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100",
                    children: [s.jsx(fa, {
                        name: "trash",
                        className: "h-3.5 w-3.5"
                    }), s.jsx("span", {
                        className: "hidden sm:inline",
                        children: d ? "Clearingâ€¦" : "Clear All"
                    }), s.jsx("span", {
                        className: "sm:hidden",
                        children: d ? "â€¦" : "Clear"
                    })]
                })]
            })]
        }), s.jsx("div", {
            className: "mt-4 overflow-x-auto overflow-hidden rounded-xl border border-slate-200",
            children: s.jsxs("table", {
                className: "min-w-[720px] w-full border-separate border-spacing-0",
                children: [s.jsx("thead", {
                    children: s.jsxs("tr", {
                        className: "bg-slate-50 text-left text-xs font-semibold text-slate-500",
                        children: [s.jsx("th", {
                            className: "px-4 py-3",
                            children: "Action Name"
                        }), s.jsx("th", {
                            className: "px-4 py-3",
                            children: "Page URL"
                        }), s.jsx("th", {
                            className: "px-4 py-3",
                            children: "Purpose"
                        }), s.jsx("th", {
                            className: "px-4 py-3",
                            children: "Interaction"
                        }), s.jsx("th", {
                            className: "px-4 py-3",
                            children: "Date/Time"
                        }), s.jsx("th", {
                            className: "px-4 py-3 w-[11rem] min-w-[11rem] whitespace-nowrap",
                            children: "Mail Status"
                        }), s.jsx("th", {
                            className: "px-4 py-3",
                            children: "Reference"
                        }), s.jsx("th", {
                            className: "px-4 py-3 text-right",
                            children: "Actions"
                        })]
                    })
                }), s.jsx("tbody", {
                    className: "text-sm",
                    children: p && g.length === 0 ? s.jsx("tr", {
                        children: s.jsx("td", {
                            colSpan: 8,
                            className: "px-4 py-10 text-center text-sm text-slate-500",
                            children: "Loading activitiesâ€¦"
                        })
                    }) : s.jsxs(s.Fragment, {
                        children: [g.map(m => {
                            const T = m.categoryKey || "forms",
                                v = T === "forms" ? "blue" : T === "calls" ? "green" : T === "consultations" ? "purple" : "amber",
                                K = oh(m),
                                M = ch(m),
                                W = K == null ? "slate" : K === !0 || K === 1 ? "green" : "red";
                            return s.jsxs("tr", {
                                className: "border-t border-slate-200 hover:bg-slate-50/60",
                                children: [s.jsx("td", {
                                    className: "px-4 py-3 font-semibold text-slate-800",
                                    children: m.actionName
                                }), s.jsx("td", {
                                    className: "px-4 py-3",
                                    children: m.pageUrl ? s.jsxs("a", {
                                        href: m.pageUrl,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 max-w-[220px]",
                                        children: [s.jsx("span", {
                                            className: "truncate",
                                            children: m.pageUrl
                                        }), s.jsx("span", {
                                            className: "text-slate-400 shrink-0",
                                            children: "â†—"
                                        })]
                                    }) : s.jsx("span", {
                                        className: "text-slate-400",
                                        children: "â€”"
                                    })
                                }), s.jsx("td", {
                                    className: "px-4 py-3",
                                    children: s.jsx(zc, {
                                        tone: v,
                                        children: m.category
                                    })
                                }), s.jsx("td", {
                                    className: "px-4 py-3 text-slate-600",
                                    children: m.context
                                }), s.jsx("td", {
                                    className: "px-4 py-3 text-slate-600",
                                    children: m.dateTime
                                }), s.jsx("td", {
                                    className: "px-4 py-3 w-[11rem] min-w-[11rem] whitespace-nowrap",
                                    children: s.jsx(zc, {
                                        tone: W,
                                        children: M
                                    })
                                }), s.jsx("td", {
                                    className: "px-4 py-3 font-mono text-xs text-slate-600",
                                    children: m.id
                                }), s.jsx("td", {
                                    className: "px-4 py-3 text-right",
                                    children: s.jsx("button", {
                                        type: "button",
                                        className: "rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-700",
                                        "aria-label": "Delete row",
                                        children: s.jsx(fa, {
                                            name: "trash",
                                            className: "h-4 w-4"
                                        })
                                    })
                                })]
                            }, m.id)
                        }), !p && g.length === 0 ? s.jsx("tr", {
                            children: s.jsx("td", {
                                colSpan: 8,
                                className: "px-4 py-10 text-center text-sm text-slate-500",
                                children: f || "No activities found."
                            })
                        }) : null]
                    })
                })]
            })
        }), s.jsx(rh, {
            open: c,
            onClose: () => u(!1),
            filters: {
                tab: e,
                fromDate: r,
                toDate: i,
                search: n
            }
        })]
    })
}

