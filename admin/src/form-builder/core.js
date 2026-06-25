/* eslint-disable */
/**
 * Form Builder core — extracted from reference bundle (Downloads release design).
 * Uses React.createElement (s.jsx) to avoid lossy JSX conversion.
 */
import React from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import {
	ArrowRight,
	AtSign,
	Calendar,
	ChevronDown,
	Cloud,
	Hash,
	LayoutList,
	Link,
	List,
	ListPlus,
	ListX,
	Lock,
	Mail,
	MapPin,
	MessageSquare,
	Phone,
	Radio,
	Shield,
	SquareCheckBig,
	Type,
	Upload,
	User,
	X,
	GripVertical,
	Plus,
	Search,
	Eye,
	EyeOff,
	Clipboard,
	Copy,
	Trash2,
} from 'lucide-react';
import { FIELD_CATALOG_META } from './fieldCatalog.jsx';

/** Same jsx runtime as Downloads release — icons must use this, not createElement. */
const s = { jsx, jsxs, Fragment };
const w = React;

const FIELD_ICON_BY_ID = {
	name: User,
	email: Mail,
	'single-line-text': Type,
	textarea: MessageSquare,
	dropdown: ChevronDown,
	radio: Radio,
	checkbox: SquareCheckBig,
	phone: Phone,
	address: MapPin,
	'date-time': Calendar,
	password: Lock,
	website: Link,
	number: Hash,
	'file-upload': Upload,
	date: Calendar,
	time: Calendar,
	'terms-conditions': SquareCheckBig,
	'1-column': LayoutList,
	'2-column': List,
	'3-column': ListPlus,
	'4-column': ListX,
	recaptcha: Shield,
	cloudflare: Cloud,
	'page-break': ArrowRight,
};

const FIELD_CATALOG = FIELD_CATALOG_META.map( ( entry ) => ( {
	...entry,
	icon: s.jsx( FIELD_ICON_BY_ID[ entry.id ] || AtSign, { size: 24 } ),
} ) );

function getModuleIcon( moduleId ) {
	const mod = FIELD_CATALOG.find( ( entry ) => entry.id === moduleId );
	return mod?.icon || s.jsx( AtSign, { size: 24 } );
}

const or = ChevronDown;
const Je = X;
const Km = GripVertical;
const wt = Plus;
const up = Search;
const Ut = Eye;
const EyeOffIcon = EyeOff;

function createDefaultFieldSettings( e = 1 ) {
	return {
        label: "",
        showLabel: !0,
        placeholder: "",
        helpText: "",
        required: !1,
        visibility: {
            mode: "single"
        },
        phoneValidation: {
            type: "none",
            characterLimit: 0
        },
        addressParts: {
            address1: {
                enabled: !0,
                label: "Address"
            },
            address2: {
                enabled: !0,
                label: "Apartment, suite, etc."
            },
            city: {
                enabled: !0,
                label: "City"
            },
            state: {
                enabled: !0,
                label: "State / Province"
            },
            zip: {
                enabled: !0,
                label: "ZIP / Postal code"
            },
            country: {
                enabled: !0,
                label: "Country"
            }
        },
        consent: {
            label: "Terms & Condition",
            html: 'Yes, I agree with the <a href="#" target="_blank" rel="noopener noreferrer">privacy policy</a> and <a href="#" target="_blank" rel="noopener noreferrer">terms and conditions</a>.',
            mode: "visual"
        },
        backgroundColor: "#ffffff",
        textColor: "#000000",
        borderColor: "#d1d5db",
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
                label: "Prefix"
            },
            first: {
                enabled: !0,
                label: "First Name"
            },
            middle: {
                enabled: !1,
                label: "Middle Name"
            },
            last: {
                enabled: !0,
                label: "Last Name"
            }
        },
		columnSpan: e
	};
}

function bh({
    isOpen: e,
    onClose: t,
    onSelect: n
}) {
    const [l, r] = w.useState(""), a = w.useMemo(() => {
        const i = l.trim().toLowerCase();
        return FIELD_CATALOG.filter(o => i.length === 0 || o.name.toLowerCase().includes(i) || o.description && o.description.toLowerCase().includes(i))
    }, [l]);
    return e ? s.jsxs(s.Fragment, {
        children: [s.jsx("div", {
            className: "fixed inset-0 bg-black/50 z-40 transition-opacity",
            onClick: t
        }), s.jsxs("div", {
            className: "nexulesuite_field-picker-modal fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-2xl w-[90vw] max-w-4xl max-h-[85vh] flex flex-col",
            children: [s.jsxs("div", {
                className: "flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white",
                children: [s.jsxs("div", {
                    children: [s.jsx("h2", {
                        className: "text-xl font-bold text-gray-900",
                        children: "Insert Form Fields"
                    }), s.jsx("p", {
                        className: "text-xs text-gray-500 mt-0.5",
                        children: "Select a field type to add to your form"
                    })]
                }), s.jsx("button", {
                    onClick: t,
                    className: "p-1.5 hover:bg-gray-100 rounded-lg transition-colors",
                    "aria-label": "Close modal",
                    children: s.jsx(Je, {
                        size: 20,
                        className: "text-gray-600"
                    })
                })]
            }), s.jsx("div", {
                className: "px-6 py-4 border-b border-gray-200 bg-white",
                children: s.jsxs("div", {
                    className: "relative",
                    children: [s.jsx(up, {
                        className: "nexulesuite_field-picker-search-icon absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10",
                        size: 18
                    }), s.jsx("input", {
                        type: "text",
                        placeholder: "Search fields by name...",
                        value: l,
                        onChange: i => r(i.target.value),
                        autoFocus: !0,
                        className: "nexulesuite_field-picker-search-input w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    })]
                })
            }), s.jsx("div", {
                className: "flex-1 overflow-auto p-6",
                children: a.length === 0 ? s.jsxs("div", {
                    className: "flex flex-col items-center justify-center h-full text-center",
                    children: [s.jsx("p", {
                        className: "text-gray-500 text-lg",
                        children: "No fields found"
                    }), s.jsx("p", {
                        className: "text-gray-400 text-sm mt-2",
                        children: "Try adjusting your search or category"
                    })]
                }) : s.jsx("div", {
                    className: "grid grid-cols-3 gap-3",
                    children: a.map(i => s.jsxs("button", {
                        onClick: () => {
                            n(i), t()
                        },
                        className: "p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 hover:shadow-md transition-all group flex flex-col items-center text-center",
                        children: [s.jsx("div", {
                            className: "nexulesuite_field-picker-icon text-3xl sm:text-4xl mb-2 sm:mb-3 text-slate-600 group-hover:scale-110 transition-transform flex items-center justify-center",
                            children: i.icon
                        }), s.jsx("h3", {
                            className: "normal-case font-semibold text-gray-900 text-xs sm:text-sm leading-tight",
                            children: i.name
                        }), s.jsx("p", {
                            className: "text-xs text-gray-500 mt-1 sm:mt-2 line-clamp-2",
                            children: i.description
                        })]
                    }, i.id))
                })
            })]
        })]
    }) : null
}

function Tc(e) {
    const t = e.currentTarget;
    if (!(t != null && t.getBoundingClientRect)) return "bottom";
    const n = t.getBoundingClientRect(),
        l = e.clientX - n.left,
        r = e.clientY - n.top,
        a = n.height * .25,
        i = n.height * .25;
    return r <= a ? "top" : r >= n.height - i ? "bottom" : l < n.width / 2 ? "left" : "right"
}

function gp({
    field: e,
    draggingId: t,
    hoverEdge: n,
    hoverTargetId: l,
    onRemove: r,
    onEdit: a,
    onDragStart: i,
    onDragEnd: o,
    onHoverEdge: c,
    onDropEdge: u
}) {
    var p, j, f, C, B, x, d, h;
    const g = l === (e == null ? void 0 : e.id) && !!n,
        y = w.useMemo(() => g && (n === "top" || n === "bottom" || n === "left" || n === "right") ? "ring-2 ring-blue-400 ring-inset" : "", [g, n]);
    return s.jsxs("div", {
        className: "relative group",
        children: [s.jsx("button", {
            type: "button",
            onClick: r,
            className: "absolute -top-2.5 -right-2.5 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-10",
            "aria-label": "Remove field",
            children: s.jsx(Je, {
                size: 18
            })
        }), s.jsxs("div", {
            role: "button",
            tabIndex: 0,
            onClick: a,
            onKeyDown: b => {
                (b.key === "Enter" || b.key === " ") && (b.preventDefault(), a == null || a())
            },
            onDragOver: b => {
                b.preventDefault(), !(!t || t === (e == null ? void 0 : e.id)) && (c == null || c(e == null ? void 0 : e.id, Tc(b)))
            },
            onDragLeave: () => c == null ? void 0 : c(null, null),
            onDrop: b => {
                var T;
                b.preventDefault();
                const z = ((T = b.dataTransfer) == null ? void 0 : T.getData("text/plain")) || "",
                    m = Tc(b);
                c == null || c(null, null), z && z !== (e == null ? void 0 : e.id) && (u == null || u(z, e == null ? void 0 : e.id, m))
            },
            className: ["flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-400 hover:shadow-lg transition-all group-hover:bg-blue-50 cursor-pointer", y].join(" "),
            children: [s.jsx("div", {
                draggable: !0,
                onClick: b => {
                    b.preventDefault(), b.stopPropagation()
                },
                onMouseDown: b => b.stopPropagation(),
                onDragStart: b => {
                    var z, m, T;
                    (z = b.dataTransfer) == null || z.setData("text/plain", String((e == null ? void 0 : e.id) || "")), (T = (m = b.dataTransfer) == null ? void 0 : m.setDragImage) == null || T.call(m, b.currentTarget, 10, 10), i == null || i(e == null ? void 0 : e.id)
                },
                onDragEnd: () => o == null ? void 0 : o(),
                className: "text-gray-400 mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing",
                "aria-label": "Drag to move",
                title: "Drag to move",
                children: s.jsx(Km, {
                    size: 20
                })
            }), s.jsx("div", {
                className: "flex-1 min-w-0",
                children: s.jsxs("div", {
                    className: "flex items-start gap-3",
                    children: [s.jsx("div", {
                        className: "p-2 rounded-lg flex-shrink-0 mt-0.5",
                        style: {
                            backgroundColor: ((p = e == null ? void 0 : e.settings) == null ? void 0 : p.backgroundColor) || "#ffffff"
                        },
                        children: s.jsx("div", {
                            style: {
                                color: ((j = e == null ? void 0 : e.settings) == null ? void 0 : j.textColor) || "#000000"
                            },
                            children: ( () => {
                                const mod = resolveModule( e == null ? void 0 : e.moduleId, e == null ? void 0 : e.module );
                                return ( mod == null ? void 0 : mod.icon ) || getModuleIcon( e == null ? void 0 : e.moduleId );
                            } )()
                        })
                    }), s.jsxs("div", {
                        className: "flex-1",
                        children: [s.jsx("h3", {
                            className: "font-semibold text-sm",
                            style: {
                                color: ((C = e == null ? void 0 : e.settings) == null ? void 0 : C.textColor) || "#000000"
                            },
                            children: ((B = e == null ? void 0 : e.settings) == null ? void 0 : B.label) || ((x = e == null ? void 0 : e.module) == null ? void 0 : x.name)
                        }), ((d = e == null ? void 0 : e.settings) == null ? void 0 : d.helpText) && s.jsx("p", {
                            className: "text-xs text-gray-600 mt-1",
                            children: e.settings.helpText
                        }), s.jsxs("div", {
                            className: "flex items-center gap-2 mt-2 text-xs text-gray-500",
                            children: [s.jsxs("span", {
                                children: ["Width: ", (e == null ? void 0 : e.columnSpan) || 1, "/4"]
                            }), ((h = e == null ? void 0 : e.settings) == null ? void 0 : h.required) && s.jsx("span", {
                                className: "text-red-600 font-semibold",
                                children: "Required"
                            })]
                        })]
                    })]
                })
            })]
        })]
    })
}

function wh({
    block: e,
    dnd: t,
    onSelectField: n,
    onRemoveField: l
}) {
    var o, c;
    const r = Math.max(1, Math.min(4, parseInt(((o = e == null ? void 0 : e.layout) == null ? void 0 : o.columns) || 1, 10) || 1)),
        a = Array.isArray((c = e == null ? void 0 : e.layout) == null ? void 0 : c.items) ? e.layout.items : [],
        i = r === 1 ? "grid-cols-1" : r === 2 ? "grid-cols-2" : r === 3 ? "grid-cols-3" : "grid-cols-4";
    return s.jsx("div", {
        className: "rounded-xl border border-slate-200 bg-white p-4",
        children: s.jsx("div", {
            className: ["grid gap-3", i].join(" "),
            children: Array.from({
                length: r
            }).map((u, g) => {
                const y = a[g] || [];
                return s.jsx("div", {
                    className: "space-y-3",
                    children: y.map(p => s.jsx(gp, {
                        field: p,
                        draggingId: t.draggingId,
                        hoverEdge: t.hoverEdge,
                        hoverTargetId: t.hoverTargetId,
                        onDragStart: t.onDragStart,
                        onDragEnd: t.onDragEnd,
                        onHoverEdge: t.onHoverEdge,
                        onDropEdge: t.onDropEdge,
                        onRemove: () => l(p.id),
                        onEdit: () => n(p.id)
                    }, p.id))
                }, g)
            })
        })
    })
}

function jh({
    blocks: e,
    onSelectField: t,
    onRemoveField: n,
    onInsertFields: l,
    onDropField: r
}) {
    const a = Array.isArray(e) ? e : [],
        [i, o] = w.useState(null),
        [c, u] = w.useState(null),
        [g, y] = w.useState(null),
        p = w.useMemo(() => ({
            draggingId: i,
            hoverTargetId: c,
            hoverEdge: g,
            onDragStart: j => {
                o(j || null), u(null), y(null)
            },
            onDragEnd: () => {
                o(null), u(null), y(null)
            },
            onHoverEdge: (j, f) => {
                u(j || null), y(f || null)
            },
            onDropEdge: (j, f, C) => {
                o(null), u(null), y(null), r == null || r(j, f, C)
            }
        }), [i, c, g, r]);
    return s.jsx("div", {
        className: "bg-white rounded-lg border border-gray-200 shadow-sm",
        children: s.jsxs("div", {
            className: "p-6 sm:p-8",
            children: [s.jsx("h2", {
                className: "text-lg font-semibold text-gray-900 mb-6",
                children: "Form Fields"
            }), a.length === 0 ? s.jsxs("div", {
                className: "py-10",
                children: [s.jsxs("div", {
                    className: "text-center",
                    children: [s.jsx("div", {
                        className: "mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500",
                        children: s.jsx("svg", {
                            className: "h-5 w-5",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                            children: s.jsx("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M7 7h10M7 12h10M7 17h10"
                            })
                        })
                    }), s.jsx("p", {
                        className: "text-xs text-slate-500",
                        children: "You haven't added any fields yet. Add form fields to get started."
                    })]
                }), s.jsxs("button", {
                    type: "button",
                    onClick: () => l(null),
                    className: "mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-4 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-50",
                    children: [s.jsx("span", {
                        className: "text-slate-500",
                        children: "+"
                    }), s.jsx("span", {
                        children: "Insert Form Fields"
                    })]
                })]
            }) : s.jsxs("div", {
                className: "space-y-4",
                children: [a.map(j => (j == null ? void 0 : j.kind) === "layout" ? s.jsx(wh, {
                    block: j,
                    dnd: p,
                    onSelectField: t,
                    onRemoveField: n
                }, j.id) : s.jsx(gp, {
                    field: j,
                    draggingId: p.draggingId,
                    hoverEdge: p.hoverEdge,
                    hoverTargetId: p.hoverTargetId,
                    onDragStart: p.onDragStart,
                    onDragEnd: p.onDragEnd,
                    onHoverEdge: p.onHoverEdge,
                    onDropEdge: p.onDropEdge,
                    onRemove: () => n(j.id),
                    onEdit: () => t(j.id)
                }, j.id)), s.jsxs("button", {
                    type: "button",
                    onClick: () => l(null),
                    className: "mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-50",
                    children: [s.jsx("span", {
                        className: "text-slate-500",
                        children: "+"
                    }), s.jsx("span", {
                        children: "Insert Form Fields"
                    })]
                })]
            })]
        })
    })
}

function resolveModule( moduleId, savedModule = null ) {
	const id = moduleId || savedModule?.id || savedModule?.moduleId || '';
	const catalog = FIELD_CATALOG.find( ( t ) => t.id === id ) || null;
	if ( ! catalog ) {
		return savedModule || null;
	}
	if ( savedModule && typeof savedModule === 'object' ) {
		return { ...catalog, ...savedModule, icon: catalog.icon };
	}
	return catalog;
}

function Vn( e ) {
	return resolveModule( e );
}

function Nh(e) {
    return !!e && e.category === "layout"
}

function Pc(e) {
    return {
        id: `step-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: `Step ${e+1}`,
        subtitle: "",
        fields: []
    }
}

function kh(e) {
    const t = Math.max(1, Math.min(4, parseInt(e.columnSpan || 1, 10) || 1));
    return {
        id: `layout-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        kind: "layout",
        moduleId: e.id,
        module: e,
        layout: {
            columns: t,
            items: Array.from({
                length: t
            }).map(() => [])
        }
    }
}

function di(e, t) {
    var n;
    for (let l = 0; l < e.length; l++) {
        const r = e[l];
        if ((r == null ? void 0 : r.kind) === "layout") {
            const a = ((n = r == null ? void 0 : r.layout) == null ? void 0 : n.items) || [];
            for (let i = 0; i < a.length; i++) {
                const o = a[i] || [],
                    c = o.findIndex(u => (u == null ? void 0 : u.id) === t);
                if (c !== -1) return {
                    field: o[c],
                    path: {
                        bi: l,
                        ci: i,
                        fi: c,
                        kind: "layout"
                    }
                }
            }
        } else if ((r == null ? void 0 : r.id) === t) return {
            field: r,
            path: {
                bi: l,
                kind: "field"
            }
        }
    }
    return null
}

function Sh(e, t, n) {
    return e.map(l => {
        var r;
        if ((l == null ? void 0 : l.kind) === "layout") {
            const a = (((r = l.layout) == null ? void 0 : r.items) || []).map(i => (i || []).map(o => (o == null ? void 0 : o.id) === t ? {
                ...o,
                settings: n
            } : o));
            return {
                ...l,
                layout: {
                    ...l.layout || {},
                    items: a
                }
            }
        }
        return (l == null ? void 0 : l.id) === t ? {
            ...l,
            settings: n
        } : l
    })
}

function Ch(e, t) {
    var l;
    const n = [];
    for (const r of e)
        if ((r == null ? void 0 : r.kind) === "layout") {
            const a = (((l = r.layout) == null ? void 0 : l.items) || []).map(i => (i || []).filter(o => (o == null ? void 0 : o.id) !== t));
            n.push({
                ...r,
                layout: {
                    ...r.layout || {},
                    items: a
                }
            })
        } else(r == null ? void 0 : r.id) !== t && n.push(r);
    return n
}

function yp(e) {
    var l;
    const t = ((l = e == null ? void 0 : e.layout) == null ? void 0 : l.items) || [],
        n = [];
    for (let r = 0; r < t.length; r++) {
        const a = t[r] || [];
        for (const i of a) n.push(i)
    }
    return n
}

function ui(e, t) {
    const n = Math.max(1, Math.min(4, t)),
        l = Array.from({
            length: n
        }).map(() => []);
    return e.forEach((r, a) => {
        l[a % n].push(r)
    }), {
        columns: n,
        items: l
    }
}

function hn(e) {
    const t = [];
    for (const n of e) {
        if ((n == null ? void 0 : n.kind) !== "layout") {
            t.push(n);
            continue
        }
        const l = yp(n);
        if (l.length === 0) continue;
        if (l.length === 1) {
            t.push(l[0]);
            continue
        }
        const r = Math.min(4, l.length),
            a = {
                ...n,
                layout: ui(l, r)
            };
        t.push(a)
    }
    return t
}

function Eh(e, t) {
    var r;
    let n = null;
    const l = [];
    for (const a of e)
        if ((a == null ? void 0 : a.kind) === "layout") {
            const i = (((r = a.layout) == null ? void 0 : r.items) || []).map(o => (o || []).filter(c => (c == null ? void 0 : c.id) === t ? (n = c, !1) : !0));
            l.push({
                ...a,
                layout: {
                    ...a.layout || {},
                    items: i
                }
            })
        } else {
            if ((a == null ? void 0 : a.id) === t) {
                n = a;
                continue
            }
            l.push(a)
        } return {
        blocks: hn(l),
        removed: n
    }
}

function _h(e, t, n, l) {
    if (!t || !n || t === n) return e;
    const r = di(e, n);
    if (!(r != null && r.path)) return e;
    const {
        blocks: a,
        removed: i
    } = Eh(e, t);
    if (!i) return e;
    const o = di(a, n);
    if (!(o != null && o.path)) return hn([...a, i]);
    const c = o.path;
    if (l === "top" || l === "bottom") {
        const d = (c.kind === "field", c.bi),
            h = l === "top" ? d : d + 1,
            b = [...a];
        return b.splice(h, 0, i), hn(b)
    }
    const u = (c.kind === "field", c.bi),
        g = a[u];
    if (!g) return hn([...a, i]);
    if (g.kind !== "layout") {
        const h = l === "left" ? [i, g] : [g, i],
            b = {
                id: `layout-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                kind: "layout",
                moduleId: "2-column",
                module: Vn("2-column"),
                layout: ui(h, 2)
            },
            z = [...a];
        return z.splice(u, 1, b), hn(z)
    }
    const y = yp(g);
    if (y.length >= 4) {
        const d = [...a];
        return d.splice(u + 1, 0, i), hn(d)
    }
    const p = y.findIndex(d => (d == null ? void 0 : d.id) === n),
        j = Math.max(0, p + (l === "right" ? 1 : 0)),
        f = [...y];
    f.splice(j, 0, i);
    const C = Math.min(4, f.length),
        B = {
            ...g,
            moduleId: `${C}-column`,
            module: Vn(`${C}-column`),
            layout: ui(f, C)
        },
        x = [...a];
    return x.splice(u, 1, B), hn(x)
}

export function DynamicFieldsBuilder({
    form: e,
    onPatchForm: t,
    onSelectionChange: n
}) {
    var b, z;
    const [l, r] = w.useState(!1), [a, i] = w.useState(null), [o, c] = w.useState(null), [u, g] = w.useState(((z = (b = e == null ? void 0 : e.steps) == null ? void 0 : b[0]) == null ? void 0 : z.id) || "step-1"), y = Array.isArray(e == null ? void 0 : e.steps) ? e.steps : [], p = Math.max(0, y.findIndex(m => m.id === u)), j = y[p] || y[0] || {
        fields: []
    }, f = Array.isArray(j.fields) ? j.fields : [], C = w.useMemo(() => {
        if (!a) return null;
        const m = di(f, a);
        if (!(m != null && m.field)) return null;
        const T = resolveModule(m.field.moduleId, m.field.module);
        return {
            ...m.field,
            module: T
        }
    }, [f, a]);
    w.useEffect(() => {
        if (typeof n == "function") {
            if (!a || !C) {
                n(null);
                return
            }
            n({
                field: C,
                updateSettings: m => d(a, m),
                clear: () => i(null)
            })
        }
    }, [a, C]);
    const B = m => {
            const T = y.map((v, K) => K === p ? {
                ...v,
                ...m
            } : v);
            t({
                steps: T
            })
        },
        x = m => {
            var v, K;
            if ((m == null ? void 0 : m.id) === "page-break") {
                const M = [...y];
                M.length === 0 && M.push(Pc(0));
                const W = Math.max(0, p + 1);
                M.splice(W, 0, Pc(W));
                const H = M.map((N, I) => ({
                    ...N,
                    title: N.title && N.title.trim() ? N.title : `Step ${I+1}`
                }));
                t({
                    formType: "multi",
                    steps: H
                }), i(null), c(null), r(!1), g(((v = H[W]) == null ? void 0 : v.id) || ((K = H[0]) == null ? void 0 : K.id) || "step-1");
                return
            }
            if (Nh(m)) {
                const M = kh(m);
                B({
                    fields: [...f, M]
                }), i(null), c(null), r(!1);
                return
            }
            const T = {
                id: `field-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                kind: "field",
                moduleId: m.id,
                module: m,
                columnSpan: m.columnSpan,
                settings: createDefaultFieldSettings(m.columnSpan)
            };
            B({
                fields: [...f, T]
            }), i(T.id), c(null), r(!1)
        },
        d = (m, T) => {
            B({
                fields: Sh(f, m, T)
            })
        },
        h = m => {
            B({
                fields: Ch(f, m)
            }), a === m && i(null)
        };
    return s.jsxs("div", {
        className: "relative",
        children: [(e == null ? void 0 : e.formType) === "multi" && s.jsxs("div", {
            className: "flex flex-wrap items-center gap-2 mb-4",
            children: [s.jsx("div", {
                className: "flex flex-wrap items-center gap-2",
                children: y.map((m, T) => s.jsx("button", {
                    type: "button",
                    onClick: () => g(m.id),
                    className: ["rounded-lg px-3 py-2 text-xs font-semibold border transition-colors", u === m.id ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"].join(" "),
                    title: m.title || `Step ${T+1}`,
                    children: m.title || `Step ${T+1}`
                }, m.id))
            }), s.jsxs("button", {
                type: "button",
                onClick: () => {
                    const m = `step-${Date.now()}`,
                        T = [...y, {
                            id: m,
                            title: `Step ${y.length+1}`,
                            subtitle: "",
                            fields: []
                        }];
                    t({
                        steps: T
                    }), g(m)
                },
                className: "ml-auto inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700",
                children: [s.jsx(wt, {
                    size: 16
                }), "Add Step"]
            })]
        }), s.jsx(jh, {
            blocks: f.map(m => {
                var T;
                return (m == null ? void 0 : m.kind) === "layout" ? {
                    ...m,
                    module: resolveModule(m.moduleId, m.module),
                    layout: {
                        ...m.layout || {},
                        items: (((T = m.layout) == null ? void 0 : T.items) || []).map(v => (v || []).map(K => ({
                            ...K,
                            module: resolveModule(K.moduleId, K.module)
                        })))
                    }
                } : {
                    ...m,
                    module: resolveModule(m.moduleId, m.module)
                }
            }),
            onSelectField: i,
            onRemoveField: h,
            onDropField: (m, T, v) => {
                B({
                    fields: _h(f, m, T, v)
                })
            },
            onInsertFields: m => {
                c(m || null), r(!0)
            }
        }), s.jsx(bh, {
            isOpen: l,
            onClose: () => r(!1),
            onSelect: x
        })]
    })
}

export function FieldSettingsInline({
    field: e,
    onUpdate: t,
    onClose: n
}) {
    var W;
    if (!e) return null;
    const l = (e == null ? void 0 : e.moduleId) || "",
        [r, a] = w.useState(l === "address" ? "field_labels" : "settings"),
        [i, o] = w.useState(!1),
        [c, u] = w.useState(""),
        [g, y] = w.useState(""),
        [p, j] = w.useState(""),
        [f, C] = w.useState(""),
        [B, x] = w.useState(""),
        [A, q] = w.useState("v2"),
        [R, V] = w.useState("0.5"),
        d = (N, I) => {
            const _ = {
                ...e.settings || {},
                [N]: I
            };
            t(e.id, _)
        },
        h = async (N, I = {}) => {
            var Q, O, E;
            const D = (((Q = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : Q.restUrl) || "").replace(/\/$/, "") + N,
                J = await fetch(D, {
                    ...I,
                    headers: {
                        "Content-Type": "application/json",
                        "X-WP-Nonce": ((O = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : O.nonce) || "",
                        ...I.headers || {}
                    }
                }),
                P = await J.json().catch(() => null);
            if (!J.ok) {
                const ne = (P == null ? void 0 : P.message) || ((E = P == null ? void 0 : P.data) == null ? void 0 : E.message) || `Request failed (${J.status})`;
                throw new Error(ne)
            }
            return P
        };
    w.useEffect(() => {
        if (!(l === "recaptcha" || l === "cloudflare")) return;
        let I = !0;
        return u(""), y(""), o(!0), (async () => {
            try {
                const D = await h(l === "recaptcha" ? "/nexulesuite_/v1/captcha/recaptcha" : "/nexulesuite_/v1/captcha/turnstile");
                if (!I) return;
                const J = (D == null ? void 0 : D.data) || {};
                j(J.siteKey || ""), C(""), x(J.secretMasked || ""), l === "recaptcha" && (q(J.apiVersion === "v3" ? "v3" : "v2"), V(String(["number", "string"].includes(typeof J.scoreThreshold) && !isNaN(parseFloat(J.scoreThreshold)) ? parseFloat(J.scoreThreshold) : 0.5)))
            } catch (_) {
                I && u((_ == null ? void 0 : _.message) || "Failed to load keys.")
            } finally {
                I && o(!1)
            }
        })(), () => {
            I = !1
        }
    }, [l]);
    const b = e.settings || {},
        z = b.consent || {
            label: "Terms & Condition",
            html: "",
            mode: "visual"
        },
        m = w.useMemo(() => l === "address" || l === "terms-conditions" ? [{
            id: "field_labels",
            label: "Field Labels"
        }, {
            id: "settings",
            label: "Settings"
        }, {
            id: "styling",
            label: "Styling"
        }] : [{
            id: "settings",
            label: "Settings"
        }, {
            id: "styling",
            label: "Styling"
        }], [l]),
        T = (N, I) => {
            const _ = b.nameParts || {},
                D = _[N] || {};
            d("nameParts", {
                ..._,
                [N]: {
                    ...D,
                    ...I
                }
            })
        },
        v = Array.isArray(b.options) ? b.options : [],
        K = b.phoneValidation || {
            type: "none",
            characterLimit: 0
        },
        M = b.addressParts || {};
    return s.jsxs("div", {
        className: "space-y-6",
        children: [s.jsxs("div", {
            className: "flex items-center justify-between",
            children: [s.jsxs("div", {
                className: "min-w-0",
                children: [s.jsx("p", {
                    className: "text-sm font-semibold text-slate-800",
                    children: "Field Settings"
                }), s.jsx("p", {
                    className: "mt-0.5 text-xs text-slate-400 truncate",
                    children: ((W = e == null ? void 0 : e.module) == null ? void 0 : W.name) || "Field"
                })]
            }), s.jsx("button", {
                type: "button",
                onClick: n,
                className: "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                "aria-label": "Close field settings",
                children: s.jsx(Je, {
                    className: "h-4 w-4"
                })
            })]
        }), s.jsx("div", {
            className: "flex border-b border-slate-200",
            children: m.map(N => s.jsxs("button", {
                type: "button",
                onClick: () => a(N.id),
                className: ["-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors", r === N.id ? "border-violet-600 text-violet-700" : "border-transparent text-slate-400 hover:text-slate-700"].join(" "),
                children: [s.jsx("span", {
                    children: N.label
                }), N.badge && s.jsx("span", {
                    className: "ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700",
                    children: N.badge
                })]
            }, N.id))
        }), l === "address" && r === "field_labels" && s.jsxs("div", {
            className: "rounded-xl border border-slate-200 bg-white",
            children: [s.jsx("div", {
                className: "border-b border-slate-200 px-4 py-3",
                children: s.jsx("p", {
                    className: "text-sm font-semibold text-slate-800",
                    children: "Customize Address Field"
                })
            }), s.jsx("div", {
                className: "divide-y divide-slate-200",
                children: [
                    ["address1", "Address"],
                    ["address2", "Apartment, suite, etc."],
                    ["city", "City"],
                    ["state", "State / Province"],
                    ["zip", "ZIP / Postal code"],
                    ["country", "Country"]
                ].map(([N, I]) => {
                    const _ = M[N] || {
                        enabled: !0,
                        label: I
                    };
                    return s.jsxs("div", {
                        className: "px-4 py-3",
                        children: [s.jsxs("div", {
                            className: "flex items-center justify-between gap-3",
                            children: [s.jsxs("label", {
                                className: "flex items-center gap-3 text-sm font-semibold text-slate-700",
                                children: [s.jsx("input", {
                                    type: "checkbox",
                                    checked: !!_.enabled,
                                    onChange: D => {
                                        d("addressParts", {
                                            ...M,
                                            [N]: {
                                                ..._,
                                                enabled: D.target.checked
                                            }
                                        })
                                    },
                                    className: "h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-200"
                                }), s.jsx("span", {
                                    children: I
                                })]
                            }), s.jsx("span", {
                                className: "text-slate-400",
                                children: "▾"
                            })]
                        }), s.jsx("div", {
                            className: "mt-3",
                            children: s.jsx("input", {
                                type: "text",
                                disabled: !_.enabled,
                                value: _.label || "",
                                onChange: D => {
                                    d("addressParts", {
                                        ...M,
                                        [N]: {
                                            ..._,
                                            label: D.target.value
                                        }
                                    })
                                },
                                className: ["h-10 w-full rounded-lg border px-3 text-sm outline-none", _.enabled ? "border-slate-200 bg-white ring-violet-200 focus:ring-2" : "border-slate-100 bg-slate-50 text-slate-400"].join(" "),
                                placeholder: I
                            })
                        })]
                    }, N)
                })
            })]
        }), l === "terms-conditions" && r === "field_labels" && s.jsxs("div", {
            className: "rounded-xl border border-slate-200 bg-white",
            children: [s.jsx("div", {
                className: "border-b border-slate-200 px-4 py-3",
                children: s.jsx("p", {
                    className: "text-sm font-semibold text-slate-800",
                    children: "Customize Consent Field"
                })
            }), s.jsxs("div", {
                className: "p-4 space-y-4",
                children: [s.jsxs("div", {
                    children: [s.jsx("label", {
                        className: "mb-1.5 block text-sm font-semibold text-slate-700",
                        children: "Label"
                    }), s.jsx("input", {
                        type: "text",
                        value: z.label || "",
                        onChange: N => d("consent", {
                            ...z,
                            label: N.target.value
                        }),
                        className: "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                        placeholder: "Terms & Condition"
                    })]
                }), s.jsxs("div", {
                    className: "rounded-xl border border-slate-200 overflow-hidden",
                    children: [s.jsxs("div", {
                        className: "flex items-center justify-between border-b border-slate-200 bg-white",
                        children: [s.jsx("div", {
                            className: "flex",
                            children: [
                                ["visual", "Visual"],
                                ["code", "Code"]
                            ].map(([N, I]) => s.jsx("button", {
                                type: "button",
                                onClick: () => d("consent", {
                                    ...z,
                                    mode: N
                                }),
                                className: ["px-4 py-2 text-sm font-semibold", (z.mode || "visual") === N ? "text-slate-800 bg-slate-50" : "text-slate-400 hover:text-slate-700"].join(" "),
                                children: I
                            }, N))
                        }), s.jsx("button", {
                            type: "button",
                            onClick: () => {
                                d("consent", {
                                    ...z,
                                    html: (z.html || "") + " {field}"
                                })
                            },
                            className: "px-4 py-2 text-sm font-semibold text-sky-600 hover:text-sky-700",
                            children: "+ Insert form fields"
                        })]
                    }), (z.mode || "visual") === "code" ? s.jsx("textarea", {
                        value: z.html || "",
                        onChange: N => d("consent", {
                            ...z,
                            html: N.target.value
                        }),
                        className: "w-full min-h-40 resize-none bg-white px-4 py-3 font-mono text-sm outline-none",
                        placeholder: "Yes, I agree with the privacy policy..."
                    }) : s.jsxs("div", {
                        className: "border-t border-slate-200 bg-white",
                        children: [s.jsxs("div", {
                            className: "flex items-center gap-2 px-4 py-2 border-b border-slate-200 text-slate-500 text-sm",
                            children: [s.jsx("button", {
                                type: "button",
                                onClick: () => d("consent", {
                                    ...z,
                                    html: `<strong>${z.html||""}</strong>`
                                }),
                                className: "px-2 py-1 rounded hover:bg-slate-50 font-semibold",
                                children: "B"
                            }), s.jsx("button", {
                                type: "button",
                                onClick: () => d("consent", {
                                    ...z,
                                    html: `<em>${z.html||""}</em>`
                                }),
                                className: "px-2 py-1 rounded hover:bg-slate-50 italic",
                                children: "I"
                            }), s.jsx("button", {
                                type: "button",
                                onClick: () => d("consent", {
                                    ...z,
                                    html: `<a href="#" target="_blank" rel="noopener noreferrer">${z.html||"link"}</a>`
                                }),
                                className: "px-2 py-1 rounded hover:bg-slate-50",
                                children: "🔗"
                            })]
                        }), s.jsx("textarea", {
                            value: z.html || "",
                            onChange: N => d("consent", {
                                ...z,
                                html: N.target.value
                            }),
                            className: "w-full min-h-40 resize-none bg-white px-4 py-3 text-sm outline-none",
                            placeholder: "Yes, I agree with the privacy policy..."
                        })]
                    })]
                }), s.jsx("p", {
                    className: "text-xs text-slate-400",
                    children: "Describe what your users should consent to."
                })]
            })]
        }), r === "settings" && s.jsxs("div", {
            className: "space-y-6",
            children: [l === "recaptcha" && s.jsxs("div", {
                className: "rounded-xl border border-slate-200 bg-white p-4",
                children: [s.jsx("p", {
                    className: "text-sm font-semibold text-slate-800",
                    children: "Google reCAPTCHA"
                }), s.jsx("p", {
                    className: "mt-1 text-xs text-slate-400",
                    children: "Use reCAPTCHA v2 (checkbox) or v3 (invisible score). Keys must match the type you select in Google Admin."
                }), s.jsxs("div", {
                    className: "mt-4 space-y-4",
                    children: [s.jsxs("div", {
                        children: [s.jsx("label", {
                            className: "mb-1.5 block text-sm font-semibold text-slate-700",
                            children: "API version"
                        }), s.jsxs("select", {
                            value: A,
                            onChange: N => q(N.target.value),
                            className: "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                            children: [s.jsx("option", {
                                value: "v2",
                                children: "reCAPTCHA v2 (checkbox)"
                            }), s.jsx("option", {
                                value: "v3",
                                children: "reCAPTCHA v3 (score)"
                            })]
                        })]
                    }), A === "v3" ? s.jsxs("div", {
                        children: [s.jsx("label", {
                            className: "mb-1.5 block text-sm font-semibold text-slate-700",
                            children: "Minimum score (0–1)"
                        }), s.jsx("input", {
                            type: "number",
                            min: "0",
                            max: "1",
                            step: "0.05",
                            value: R,
                            onChange: N => V(N.target.value),
                            className: "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2"
                        }), s.jsx("p", {
                            className: "mt-1 text-xs text-slate-400",
                            children: "Higher = stricter (typical: 0.5; try 0.7 to block more bots)."
                        })]
                    }) : null, s.jsxs("div", {
                        children: [s.jsx("label", {
                            className: "mb-1.5 block text-sm font-semibold text-slate-700",
                            children: "Site Key"
                        }), s.jsx("input", {
                            type: "text",
                            value: p,
                            onChange: N => j(N.target.value),
                            className: "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                            placeholder: "Enter your site key here"
                        })]
                    }), s.jsxs("div", {
                        children: [s.jsx("label", {
                            className: "mb-1.5 block text-sm font-semibold text-slate-700",
                            children: "Secret Key"
                        }), s.jsx("input", {
                            type: "password",
                            value: f,
                            onChange: N => C(N.target.value),
                            className: "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                            placeholder: "Enter your secret key here"
                        }), B ? s.jsxs("p", {
                            className: "mt-1 text-xs text-slate-400",
                            children: ["Saved secret: ", B]
                        }) : null]
                    }), s.jsx("button", {
                        type: "button",
                        disabled: i,
                        onClick: async () => {
                            o(!0), u(""), y("");
                            try {
                                const N = await h("/nexulesuite_/v1/captcha/recaptcha", {
                                        method: "POST",
                                        body: JSON.stringify({
                                            siteKey: p,
                                            secretKey: f,
                                            apiVersion: A,
                                            scoreThreshold: parseFloat(R) || 0.5
                                        })
                                    }),
                                    I = (N == null ? void 0 : N.data) || {};
                                C(""), x(I.secretMasked || ""), y("Saved."), window.setTimeout(() => y(""), 1500)
                            } catch (N) {
                                u((N == null ? void 0 : N.message) || "Save failed.")
                            } finally {
                                o(!1)
                            }
                        },
                        className: ["rounded-lg px-4 py-2 text-sm font-semibold text-white", i ? "bg-violet-400" : "bg-violet-600 hover:bg-violet-700"].join(" "),
                        children: i ? "Saving…" : "Save Keys"
                    }), c ? s.jsx("p", {
                        className: "text-xs font-semibold text-rose-600",
                        children: c
                    }) : null, g ? s.jsx("p", {
                        className: "text-xs font-semibold text-emerald-600",
                        children: g
                    }) : null]
                }), s.jsxs("div", {
                    className: "mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4",
                    children: [s.jsx("p", {
                        className: "text-xs font-semibold text-slate-500",
                        children: "reCAPTCHA Preview"
                    }), s.jsx("p", {
                        className: "mt-1 text-xs text-slate-400",
                        children: "Preview is shown on the frontend using your saved Site Key (v2 Checkbox)."
                    })]
                })]
            }), l === "cloudflare" && s.jsxs("div", {
                className: "rounded-xl border border-slate-200 bg-white p-4",
                children: [s.jsx("p", {
                    className: "text-sm font-semibold text-slate-800",
                    children: "Turnstile API Keys"
                }), s.jsx("p", {
                    className: "mt-1 text-xs text-slate-400",
                    children: "Enter your Turnstile API keys below to enable Cloudflare Turnstile option in your form’s CAPTCHA field."
                }), s.jsxs("div", {
                    className: "mt-4 space-y-4",
                    children: [s.jsxs("div", {
                        children: [s.jsx("label", {
                            className: "mb-1.5 block text-sm font-semibold text-slate-700",
                            children: "Site Key"
                        }), s.jsx("input", {
                            type: "text",
                            value: p,
                            onChange: N => j(N.target.value),
                            className: "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                            placeholder: "Enter your site key here"
                        })]
                    }), s.jsxs("div", {
                        children: [s.jsx("label", {
                            className: "mb-1.5 block text-sm font-semibold text-slate-700",
                            children: "Secret Key"
                        }), s.jsx("input", {
                            type: "password",
                            value: f,
                            onChange: N => C(N.target.value),
                            className: "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                            placeholder: "Enter your secret key here"
                        }), B ? s.jsxs("p", {
                            className: "mt-1 text-xs text-slate-400",
                            children: ["Saved secret: ", B]
                        }) : null]
                    }), s.jsx("button", {
                        type: "button",
                        disabled: i,
                        onClick: async () => {
                            o(!0), u(""), y("");
                            try {
                                const N = await h("/nexulesuite_/v1/captcha/turnstile", {
                                        method: "POST",
                                        body: JSON.stringify({
                                            siteKey: p,
                                            secretKey: f
                                        })
                                    }),
                                    I = (N == null ? void 0 : N.data) || {};
                                C(""), x(I.secretMasked || ""), y("Saved."), window.setTimeout(() => y(""), 1500)
                            } catch (N) {
                                u((N == null ? void 0 : N.message) || "Save failed.")
                            } finally {
                                o(!1)
                            }
                        },
                        className: ["rounded-lg px-4 py-2 text-sm font-semibold text-white", i ? "bg-violet-400" : "bg-violet-600 hover:bg-violet-700"].join(" "),
                        children: i ? "Saving…" : "Save Keys"
                    }), c ? s.jsx("p", {
                        className: "text-xs font-semibold text-rose-600",
                        children: c
                    }) : null, g ? s.jsx("p", {
                        className: "text-xs font-semibold text-emerald-600",
                        children: g
                    }) : null]
                }), s.jsxs("div", {
                    className: "mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4",
                    children: [s.jsx("p", {
                        className: "text-xs font-semibold text-slate-500",
                        children: "Turnstile widget preview"
                    }), s.jsx("p", {
                        className: "mt-1 text-xs text-slate-400",
                        children: "Widget renders on the frontend using your saved Site Key."
                    })]
                })]
            }), s.jsxs("div", {
                children: [s.jsx("label", {
                    className: "mb-1.5 block text-sm font-semibold text-slate-700",
                    children: "Field Label"
                }), s.jsx("input", {
                    type: "text",
                    value: b.label || "",
                    onChange: N => d("label", N.target.value),
                    className: "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                    placeholder: "Field label"
                }), s.jsxs("label", {
                    className: "mt-3 flex items-center gap-2 text-sm text-slate-700",
                    children: [s.jsx("input", {
                        type: "checkbox",
                        checked: b.showLabel !== !1,
                        onChange: N => d("showLabel", N.target.checked),
                        className: "h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-200"
                    }), "Show label"]
                })]
            }), l === "name" && s.jsxs("div", {
                className: "rounded-xl border border-slate-200 bg-slate-50/40",
                children: [s.jsxs("div", {
                    className: "border-b border-slate-200 bg-white px-4 py-3",
                    children: [s.jsx("p", {
                        className: "text-sm font-semibold text-slate-800",
                        children: "Customize Name Field"
                    }), s.jsx("p", {
                        className: "mt-0.5 text-xs text-slate-400",
                        children: "Field Labels"
                    })]
                }), s.jsx("div", {
                    className: "space-y-4 p-4",
                    children: [
                        ["prefix", "Prefix"],
                        ["first", "First Name"],
                        ["middle", "Middle Name"],
                        ["last", "Last Name"]
                    ].map(([N, I]) => {
                        var D;
                        const _ = ((D = b == null ? void 0 : b.nameParts) == null ? void 0 : D[N]) || {
                            enabled: N !== "prefix" && N !== "middle",
                            label: I
                        };
                        return s.jsxs("div", {
                            className: "grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3",
                            children: [s.jsxs("div", {
                                className: "flex items-center justify-between",
                                children: [s.jsx("p", {
                                    className: "text-sm font-semibold text-slate-700",
                                    children: I
                                }), s.jsxs("label", {
                                    className: "flex items-center gap-2 text-sm text-slate-700",
                                    children: [s.jsx("input", {
                                        type: "checkbox",
                                        checked: !!_.enabled,
                                        onChange: J => T(N, {
                                            enabled: J.target.checked
                                        }),
                                        className: "h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-200"
                                    }), "Enabled"]
                                })]
                            }), s.jsx("input", {
                                type: "text",
                                disabled: !_.enabled,
                                value: _.label || "",
                                onChange: J => T(N, {
                                    label: J.target.value
                                }),
                                className: ["h-10 w-full rounded-lg border px-3 text-sm outline-none", _.enabled ? "border-slate-200 bg-white ring-violet-200 focus:ring-2" : "border-slate-100 bg-slate-50 text-slate-400"].join(" "),
                                placeholder: I
                            })]
                        }, N)
                    })
                })]
            }), (l === "radio" || l === "checkbox" || l === "dropdown") && s.jsxs("div", {
                className: "space-y-4 rounded-xl border border-slate-200 bg-white p-4",
                children: [s.jsxs("div", {
                    className: "flex items-center justify-between gap-3",
                    children: [s.jsx("p", {
                        className: "text-sm font-semibold text-slate-800",
                        children: "Options"
                    }), (l === "radio" || l === "checkbox") && s.jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [s.jsx("span", {
                            className: "text-xs font-semibold text-slate-400",
                            children: "Layout"
                        }), s.jsxs("select", {
                            value: b.optionLayout || "vertical",
                            onChange: N => d("optionLayout", N.target.value),
                            className: "h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none",
                            children: [s.jsx("option", {
                                value: "vertical",
                                children: "Vertical"
                            }), s.jsx("option", {
                                value: "inline",
                                children: "Inline"
                            })]
                        })]
                    })]
                }), s.jsx("div", {
                    className: "space-y-3",
                    children: v.map((N, I) => s.jsxs("div", {
                        className: "grid grid-cols-2 gap-3",
                        children: [s.jsxs("div", {
                            children: [s.jsx("label", {
                                className: "mb-1 block text-xs font-semibold text-slate-400",
                                children: "Label"
                            }), s.jsx("input", {
                                type: "text",
                                value: (N == null ? void 0 : N.label) || "",
                                onChange: _ => {
                                    const D = v.map((J, P) => P === I ? {
                                        ...J,
                                        label: _.target.value
                                    } : J);
                                    d("options", D)
                                },
                                className: "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none"
                            })]
                        }), s.jsxs("div", {
                            children: [s.jsx("label", {
                                className: "mb-1 block text-xs font-semibold text-slate-400",
                                children: "Value"
                            }), s.jsx("input", {
                                type: "text",
                                value: (N == null ? void 0 : N.value) || "",
                                onChange: _ => {
                                    const D = v.map((J, P) => P === I ? {
                                        ...J,
                                        value: _.target.value
                                    } : J);
                                    d("options", D)
                                },
                                className: "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none font-mono"
                            })]
                        })]
                    }, I))
                }), s.jsx("button", {
                    type: "button",
                    onClick: () => {
                        const N = [...v, {
                            label: `Option ${v.length+1}`,
                            value: `option_${v.length+1}`
                        }];
                        d("options", N)
                    },
                    className: "mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                    children: "+ Add Option"
                })]
            }), l === "phone" && s.jsxs("div", {
                className: "rounded-xl border border-slate-200 bg-white p-4",
                children: [s.jsx("p", {
                    className: "text-sm font-semibold text-slate-800",
                    children: "Validation"
                }), s.jsx("p", {
                    className: "mt-1 text-xs text-slate-400",
                    children: "Make sure the users fill this field as per the selected validation and warn them when they haven't"
                }), s.jsxs("div", {
                    className: "mt-4",
                    children: [s.jsx("p", {
                        className: "mb-2 text-xs font-semibold text-slate-400",
                        children: "Type"
                    }), s.jsx("div", {
                        className: "inline-flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50",
                        children: [
                            ["none", "None"],
                            ["national", "National"],
                            ["international", "International"],
                            ["character_limit", "Character Limit"]
                        ].map(([N, I]) => {
                            const _ = (K.type || "none") === N;
                            return s.jsx("button", {
                                type: "button",
                                onClick: () => d("phoneValidation", {
                                    ...K,
                                    type: N
                                }),
                                className: ["px-4 py-2 text-xs font-semibold transition-colors", _ ? "bg-sky-100 text-sky-700" : "bg-white text-slate-500 hover:bg-slate-50"].join(" "),
                                children: I
                            }, N)
                        })
                    })]
                }), K.type === "character_limit" && s.jsxs("div", {
                    className: "mt-4",
                    children: [s.jsx("label", {
                        className: "mb-1.5 block text-sm font-semibold text-slate-700",
                        children: "Character Limit"
                    }), s.jsx("input", {
                        type: "number",
                        min: 1,
                        max: 64,
                        value: K.characterLimit || "",
                        onChange: N => d("phoneValidation", {
                            ...K,
                            characterLimit: N.target.value ? parseInt(N.target.value, 10) : 0
                        }),
                        className: "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                        placeholder: "e.g. 11"
                    }), s.jsx("p", {
                        className: "mt-1 text-xs text-slate-400",
                        children: "When enabled, the value should be exactly this length (digits-only recommended)."
                    })]
                })]
            }), s.jsxs("div", {
                children: [s.jsx("label", {
                    className: "mb-1.5 block text-sm font-semibold text-slate-700",
                    children: "Placeholder"
                }), s.jsx("input", {
                    type: "text",
                    value: b.placeholder || "",
                    onChange: N => d("placeholder", N.target.value),
                    className: "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2",
                    placeholder: "Placeholder text"
                })]
            }), s.jsxs("div", {
                children: [s.jsx("label", {
                    className: "mb-1.5 block text-sm font-semibold text-slate-700",
                    children: "Help Text"
                }), s.jsx("textarea", {
                    value: b.helpText || "",
                    onChange: N => d("helpText", N.target.value),
                    className: "w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-violet-200 focus:ring-2",
                    rows: 2,
                    placeholder: "Help text for users"
                })]
            }), s.jsxs("label", {
                className: "flex items-center gap-2 text-sm text-slate-700",
                children: [s.jsx("input", {
                    type: "checkbox",
                    checked: !!b.required,
                    onChange: N => d("required", N.target.checked),
                    className: "h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-200"
                }), "Required"]
            })]
        }), r === "styling" && s.jsxs("div", {
            className: "border-t border-slate-200 pt-5",
            children: [s.jsx("p", {
                className: "mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400",
                children: "Colors"
            }), s.jsx("div", {
                className: "space-y-3",
                children: [
                    ["Background", "backgroundColor"],
                    ["Text", "textColor"],
                    ["Border", "borderColor"]
                ].map(([N, I]) => s.jsxs("div", {
                    children: [s.jsx("label", {
                        className: "mb-1.5 block text-xs font-semibold text-slate-400",
                        children: N
                    }), s.jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [s.jsx("input", {
                            type: "color",
                            value: (b == null ? void 0 : b[I]) || "#ffffff",
                            onChange: _ => d(I, _.target.value),
                            className: "h-10 w-10 cursor-pointer rounded border border-slate-200"
                        }), s.jsx("input", {
                            type: "text",
                            value: (b == null ? void 0 : b[I]) || "",
                            onChange: _ => d(I, _.target.value),
                            className: "h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm outline-none"
                        })]
                    })]
                }, I))
            })]
        })]
    })
}

function Th(e) {
    const t = (e == null ? void 0 : e.phoneValidation) || {
        type: "none",
        characterLimit: 0
    };
    if (t.type === "national") return {
        hint: "National format",
        placeholder: "01XXXXXXXXX",
        pattern: "^[0-9]{10,15}$"
    };
    if (t.type === "international") return {
        hint: "International format",
        placeholder: "+8801XXXXXXXXX",
        pattern: "^\\+?[0-9]{10,20}$"
    };
    if (t.type === "character_limit") {
        const n = Math.max(1, Math.min(64, parseInt(t.characterLimit || 0, 10) || 0));
        return n > 0 ? {
            hint: `Exactly ${n} characters`,
            placeholder: "",
            pattern: `^.{${n}}$`
        } : {
            hint: "Character limit",
            placeholder: "",
            pattern: ""
        }
    }
    return {
        hint: "",
        placeholder: "",
        pattern: ""
    }
}

function zt({
    label: e,
    required: t,
    show: n = !0
}) {
    return n ? s.jsx("div", {
        className: "mb-1.5 flex items-center justify-between",
        children: s.jsxs("label", {
            className: "text-sm font-semibold text-slate-700",
            children: [e, t ? s.jsx("span", {
                className: "ml-1 text-rose-600",
                children: "*"
            }) : null]
        })
    }) : null
}

function gr( moduleId ) {
	return getModuleIcon( moduleId );
}

function vp({
    icon: e,
    children: t
}) {
    return e ? s.jsxs("div", {
        className: "relative",
        children: [s.jsx("div", {
            className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
            children: e
        }), t]
    }) : t
}

function po(e = {}, {
    hasLeftIcon: t = !1,
    rightPadPx: n = 12
} = {}) {
    const l = Number.isFinite(e.padding) ? e.padding : parseInt(e.padding ?? 12, 10) || 12,
        r = t ? l + 28 : l;
    return {
        backgroundColor: e.backgroundColor || "#ffffff",
        color: e.textColor || "#0f172a",
        borderColor: e.borderColor || "#e2e8f0",
        borderWidth: `${e.borderWidth??1}px`,
        borderRadius: `${e.borderRadius??8}px`,
        paddingTop: `${l}px`,
        paddingBottom: `${l}px`,
        paddingLeft: `${r}px`,
        paddingRight: `${n}px`,
        fontSize: `${e.fontSize??14}px`,
        fontWeight: e.fontWeight ?? 500,
        lineHeight: 1.2
    }
}

function jl({
    type: e = "text",
    placeholder: t = "",
    required: n = !1,
    settings: l = {},
    icon: r = null
}) {
    const a = po(l, {
        hasLeftIcon: !!r,
        rightPadPx: 12
    });
    return s.jsx(vp, {
        icon: r,
        children: s.jsx("input", {
            type: e,
            required: n,
            placeholder: t,
            className: "h-11 w-full outline-none",
            style: a
        })
    })
}

function Ph({
    placeholder: e = "",
    required: t = !1,
    settings: n = {},
    icon: l = null
}) {
    const r = po(n, {
        hasLeftIcon: !!l,
        rightPadPx: 12
    });
    return s.jsx(vp, {
        icon: l ? s.jsx("div", {
            className: "-mt-2",
            children: l
        }) : null,
        children: s.jsx("textarea", {
            required: t,
            placeholder: e,
            className: "min-h-28 w-full resize-none outline-none",
            style: r
        })
    })
}

function Mh({
    placeholder: e,
    required: t,
    settings: n
}) {
    const [l, r] = w.useState(!1), a = po(n, {
        hasLeftIcon: !0,
        rightPadPx: 44
    });
    return s.jsxs("div", {
        className: "relative",
        children: [s.jsx("div", {
            className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
            children: gr("password")
        }), s.jsx("input", {
            type: l ? "text" : "password",
            required: t,
            placeholder: e,
            className: "h-11 w-full outline-none",
            style: a
        }), s.jsx("button", {
            type: "button",
            onClick: () => r(i => !i),
            className: "absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700",
            "aria-label": l ? "Hide password" : "Show password",
            children: l ? s.jsx(EyeOffIcon, {
                className: "h-4 w-4"
            }) : s.jsx(Ut, {
                className: "h-4 w-4"
            })
        })]
    })
}

function Ah({
    placeholder: e,
    required: t,
    settings: n
}) {
    const [l, r] = w.useState(""), a = w.useMemo(() => `file-${Date.now()}-${Math.random().toString(16).slice(2)}`, []), i = {
        backgroundColor: n.backgroundColor || "#ffffff",
        color: n.textColor || "#0f172a",
        borderColor: n.borderColor || "#e2e8f0",
        borderWidth: `${n.borderWidth??1}px`,
        borderRadius: `${n.borderRadius??8}px`,
        padding: `${n.padding??12}px`,
        fontSize: `${n.fontSize??14}px`,
        fontWeight: n.fontWeight ?? 500
    };
    return s.jsxs("div", {
        children: [s.jsx("input", {
            id: a,
            type: "file",
            required: t,
            className: "hidden",
            onChange: o => {
                var u;
                const c = (u = o.target.files) == null ? void 0 : u[0];
                r(c ? c.name : "")
            }
        }), s.jsxs("div", {
            className: "flex w-full items-center overflow-hidden",
            style: {
                ...i,
                padding: 0
            },
            children: [s.jsxs("div", {
                className: "flex-1 px-3 py-3 text-sm",
                children: [s.jsx("span", {
                    className: "mr-2 inline-flex align-middle text-slate-400",
                    children: gr("file-upload")
                }), s.jsx("span", {
                    className: l ? "text-slate-700" : "text-slate-400",
                    children: l || e
                })]
            }), s.jsx("label", {
                htmlFor: a,
                className: "cursor-pointer select-none border-l border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100",
                children: "Browse File"
            })]
        })]
    })
}

function Ih({
    type: e,
    options: t,
    inline: n,
    required: l
}) {
    return s.jsx("div", {
        className: ["mt-2", n ? "flex flex-wrap gap-4" : "space-y-2"].join(" "),
        children: t.map((r, a) => s.jsxs("label", {
            className: "flex items-center gap-2 text-sm text-slate-700",
            children: [s.jsx("input", {
                type: e,
                required: l && e === "radio"
            }), s.jsx("span", {
                children: r.label || r.value || `Option ${a+1}`
            })]
        }, a))
    })
}

function Mc(e) {
    var o;
    const t = (e == null ? void 0 : e.moduleId) || "",
        n = (e == null ? void 0 : e.settings) || {},
        l = n.label || ((o = e == null ? void 0 : e.module) == null ? void 0 : o.name) || t,
        r = !!n.required,
        a = n.placeholder || "",
        i = gr(t);
    if (t === "name") {
        const c = n.nameParts || {},
            g = [
                ["prefix", "Prefix"],
                ["first", "First Name"],
                ["middle", "Middle Name"],
                ["last", "Last Name"]
            ].filter(([p]) => c[p] ? !!c[p].enabled : p === "first" || p === "last"),
            y = g.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1";
        return s.jsxs("div", {
            className: "space-y-3",
            children: [s.jsx(zt, {
                label: l || "Name",
                required: r,
                show: n.showLabel !== !1
            }), s.jsx("div", {
                className: `grid grid-cols-1 gap-3 ${y}`,
                children: g.map(([p, j]) => {
                    var f;
                    return s.jsx(jl, {
                        placeholder: ((f = c == null ? void 0 : c[p]) == null ? void 0 : f.label) || j,
                        required: r && (p === "first" || p === "last"),
                        settings: n,
                        icon: gr("name")
                    }, p)
                })
            })]
        })
    }
    if (t === "phone") {
        const c = Th(n);
        return s.jsxs("div", {
            children: [s.jsx(zt, {
                label: l || "Phone",
                required: r,
                show: n.showLabel !== !1
            }), s.jsx(jl, {
                type: "tel",
                placeholder: a || c.placeholder,
                required: r,
                settings: n,
                icon: i
            }), c.hint ? s.jsx("p", {
                className: "mt-1 text-xs text-slate-400",
                children: c.hint
            }) : null]
        })
    }
    if (t === "textarea") return s.jsxs("div", {
        children: [s.jsx(zt, {
            label: l,
            required: r,
            show: n.showLabel !== !1
        }), s.jsx(Ph, {
            placeholder: a,
            required: r,
            settings: n,
            icon: i
        })]
    });
    if (t === "password") return s.jsxs("div", {
        children: [s.jsx(zt, {
            label: l || "Password",
            required: r,
            show: n.showLabel !== !1
        }), s.jsx(Mh, {
            placeholder: a || "Password…",
            required: r,
            settings: n
        }), n.helpText ? s.jsx("p", {
            className: "mt-1 text-xs text-slate-400",
            children: n.helpText
        }) : null]
    });
    if (t === "terms-conditions") {
        const u = (n.consent || {}).html || 'Yes, I agree with the <a href="#" target="_blank" rel="noopener noreferrer">privacy policy</a> and <a href="#" target="_blank" rel="noopener noreferrer">terms and conditions</a>.';
        return s.jsx("div", {
            children: s.jsxs("label", {
                className: "flex items-center gap-3 text-sm text-slate-700",
                children: [s.jsx("input", {
                    type: "checkbox",
                    className: "h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-200"
                }), s.jsx("span", {
                    dangerouslySetInnerHTML: {
                        __html: u
                    }
                })]
            })
        })
    }
    if (t === "file-upload") return s.jsxs("div", {
        children: [s.jsx(zt, {
            label: l || "File Upload",
            required: r,
            show: n.showLabel !== !1
        }), s.jsx(Ah, {
            placeholder: a || "File upload…",
            required: r,
            settings: n
        }), n.helpText ? s.jsx("p", {
            className: "mt-1 text-xs text-slate-400",
            children: n.helpText
        }) : null]
    });
    if (t === "radio" || t === "checkbox") {
        const c = (n.optionLayout || "vertical") === "inline",
            u = Array.isArray(n.options) && n.options.length ? n.options : [{
                label: "Option 1",
                value: "option_1"
            }];
        return s.jsxs("div", {
            children: [s.jsx(zt, {
                label: l,
                required: r,
                show: n.showLabel !== !1
            }), s.jsx(Ih, {
                type: t,
                options: u,
                inline: c,
                required: r
            })]
        })
    }
    if (t === "dropdown") {
        const c = Array.isArray(n.options) && n.options.length ? n.options : [{
            label: "Select…",
            value: ""
        }];
        return s.jsxs("div", {
            children: [s.jsx(zt, {
                label: l,
                required: r,
                show: n.showLabel !== !1
            }), s.jsxs("div", {
                className: "relative",
                children: [s.jsx("div", {
                    className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
                    children: i
                }), s.jsx("select", {
                    className: "h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm",
                    required: r,
                    children: c.map((u, g) => s.jsx("option", {
                        value: u.value || "",
                        children: u.label || u.value || `Option ${g+1}`
                    }, g))
                })]
            })]
        })
    }
    if (t === "address") {
        const c = n.addressParts || {},
            u = [
                ["address1", "Address"],
                ["address2", "Apartment, suite, etc."],
                ["city", "City"],
                ["state", "State / Province"],
                ["zip", "ZIP / Postal code"],
                ["country", "Country"]
            ];
        return s.jsxs("div", {
            className: "space-y-3",
            children: [s.jsx(zt, {
                label: l || "Address",
                required: r,
                show: n.showLabel !== !1
            }), s.jsx("div", {
                className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
                children: u.filter(([g]) => c[g] ? !!c[g].enabled : !0).map(([g, y]) => {
                    var p;
                    return s.jsx(jl, {
                        placeholder: ((p = c == null ? void 0 : c[g]) == null ? void 0 : p.label) || y,
                        required: r && g === "address1",
                        settings: n,
                        icon: i
                    }, g)
                })
            })]
        })
    }
    return s.jsxs("div", {
        children: [s.jsx(zt, {
            label: l,
            required: r,
            show: n.showLabel !== !1
        }), s.jsx(jl, {
            placeholder: a,
            required: r,
            settings: n,
            icon: i
        })]
    })
}

export function FormPreviewModal({
    isOpen: e,
    onClose: t,
    form: n
}) {
    const l = Array.isArray(n == null ? void 0 : n.steps) ? n.steps : [],
        [r, a] = w.useState(0),
        i = Math.max(0, Math.min(l.length - 1, r)),
        o = l[i] || l[0] || {
            title: "",
            subtitle: "",
            fields: []
        },
        c = Array.isArray(o.fields) ? o.fields : [],
        u = w.useMemo(() => c.map(p => ({
            ...p,
            settings: (p == null ? void 0 : p.settings) || {},
            layout: p == null ? void 0 : p.layout
        })), [c]);
    if (!e) return null;
    const g = (n == null ? void 0 : n.styling) || {},
        y = {
            "--nexus-st-form-bg": g.backgroundColor || "#ffffff",
            "--nexus-st-form-text": g.textColor || "#1e293b",
            "--nexus-st-btn": g.buttonColor || "#7c3aed",
            "--nexus-st-stepper": g.stepperColor || g.buttonColor || "#7c3aed"
        };
    return s.jsxs(s.Fragment, {
        children: [s.jsx("div", {
            className: "fixed inset-0 z-40 bg-black/40",
            onClick: t
        }), s.jsxs("div", {
            className: "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl",
            children: [s.jsxs("div", {
                className: "flex items-center justify-between border-b border-slate-200 px-5 py-4",
                children: [s.jsxs("div", {
                    className: "min-w-0",
                    children: [s.jsx("p", {
                        className: "text-sm font-semibold text-slate-800",
                        children: "Form Preview"
                    }), s.jsx("p", {
                        className: "mt-0.5 truncate text-xs text-slate-400",
                        children: (n == null ? void 0 : n.name) || "Untitled Form"
                    })]
                }), s.jsx("button", {
                    type: "button",
                    onClick: t,
                    className: "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                    "aria-label": "Close preview",
                    children: s.jsx(Je, {
                        className: "h-4 w-4"
                    })
                })]
            }), s.jsx("div", {
                className: "max-h-[75vh] overflow-auto p-6",
                children: s.jsxs("div", {
                    className: "mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
                    style: y,
                    children: [(n == null ? void 0 : n.formType) === "multi" && l.length > 1 ? s.jsx("div", {
                        className: "mb-4 flex flex-wrap items-center gap-2",
                        children: l.map((p, j) => s.jsx("button", {
                            type: "button",
                            onClick: () => a(j),
                            className: ["rounded-lg px-3 py-2 text-xs font-semibold border transition-colors", j === i ? "border-violet-200 text-violet-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"].join(" "),
                            style: j === i ? {
                                backgroundColor: "color-mix(in srgb, var(--nexus-st-stepper), transparent 90%)"
                            } : void 0,
                            children: p.title || `Step ${j+1}`
                        }, p.id || j))
                    }) : null, o.title ? s.jsx("h3", {
                        className: "text-lg font-bold text-slate-900",
                        children: o.title
                    }) : null, o.subtitle ? s.jsx("p", {
                        className: "mt-1 text-sm text-slate-500",
                        children: o.subtitle
                    }) : null, s.jsx("div", {
                        className: "mt-5 space-y-5",
                        children: u.length === 0 ? s.jsx("p", {
                            className: "text-sm text-slate-500",
                            children: "No fields yet."
                        }) : u.map(p => {
                            var j, f, C;
                            if ((p == null ? void 0 : p.kind) === "layout") {
                                const B = Math.max(1, Math.min(4, parseInt(((j = p == null ? void 0 : p.layout) == null ? void 0 : j.columns) || 1, 10) || 1)),
                                    x = Array.isArray((f = p == null ? void 0 : p.layout) == null ? void 0 : f.items) ? p.layout.items : [];
                                return s.jsxs("div", {
                                    className: "rounded-xl border border-slate-200 bg-slate-50/40 p-4",
                                    children: [s.jsxs("div", {
                                        className: "mb-3 flex items-center justify-between",
                                        children: [s.jsx("p", {
                                            className: "text-sm font-semibold text-slate-800",
                                            children: ((C = p == null ? void 0 : p.module) == null ? void 0 : C.name) || "Layout"
                                        }), s.jsxs("span", {
                                            className: "text-xs font-semibold text-slate-400",
                                            children: ["Width: ", B, "/4"]
                                        })]
                                    }), s.jsx("div", {
                                        className: ["grid gap-4", B === 1 ? "grid-cols-1" : B === 2 ? "grid-cols-2" : B === 3 ? "grid-cols-3" : "grid-cols-4"].join(" "),
                                        children: Array.from({
                                            length: B
                                        }).map((d, h) => s.jsx("div", {
                                            className: "rounded-xl border border-slate-200 bg-white p-3",
                                            children: (x[h] || []).length === 0 ? s.jsx("p", {
                                                className: "text-xs text-slate-400",
                                                children: "Empty"
                                            }) : s.jsx("div", {
                                                className: "space-y-4",
                                                children: (x[h] || []).map(b => s.jsx("div", {
                                                    children: Mc(b)
                                                }, b.id))
                                            })
                                        }, h))
                                    })]
                                }, p.id)
                            }
                            return s.jsx("div", {
                                children: Mc(p)
                            }, p.id)
                        })
                    }), s.jsx("div", {
                        className: "mt-6",
                        children: (n == null ? void 0 : n.formType) === "multi" && l.length > 1 ? s.jsxs("div", {
                            className: "flex items-center gap-3",
                            children: [s.jsx("button", {
                                type: "button",
                                disabled: i === 0,
                                onClick: () => a(p => Math.max(0, p - 1)),
                                className: ["flex-1 rounded-lg px-4 py-3 text-sm font-semibold border", i === 0 ? "border-slate-200 bg-slate-50 text-slate-400" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"].join(" "),
                                children: "Previous"
                            }), s.jsx("button", {
                                type: "button",
                                onClick: () => {
                                    if (i < l.length - 1) {
                                        a(p => Math.min(l.length - 1, p + 1));
                                        return
                                    }
                                },
                                className: ["flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-white", (i < l.length - 1, "bg-violet-600 hover:bg-violet-700")].join(" "),
                                children: i < l.length - 1 ? "Next" : (n == null ? void 0 : n.submitBtnText) || "Submit"
                            })]
                        }) : s.jsx("button", {
                            type: "button",
                            className: "w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700",
                            children: (n == null ? void 0 : n.submitBtnText) || "Submit"
                        })
                    })]
                })
            })]
        })]
    })
}