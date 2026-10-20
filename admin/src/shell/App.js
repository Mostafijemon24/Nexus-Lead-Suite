import mi from "react";
import * as b from "react";
import * as e from "react/jsx-runtime";
import * as Kh from "react-dom/client";
import {
  AdminErrorBoundary,
  AdminHeader,
  AdminSidebar,
  DEFAULT_ROUTE,
  Em,
  NAV_GROUPS,
  Ti,
  Tm,
  nlsNavLeaves,
} from "../shared/common.js";
import { ActivitiesPage } from "../pages/ActivitiesPage.js";
import { FormBuilderPage } from "../pages/FormBuilderPage.js";
import { nlsFormTemplatesPage } from "../pages/FormTemplatesPage.js";
import { nlsFormSubmissionsPage } from "../pages/FormSubmissionsPage.js";
import { PopupsPage } from "../pages/PopupsPage.js";
import { MenuItemsPage } from "../pages/MenuItemsPage.js";
import { EmailsPage } from "../pages/EmailsPage.js";
import { AccessibilityPage } from "../pages/AccessibilityPage.js";
import { SettingsPage } from "../pages/SettingsPage.js";

function useNexusCommands() {
  return Em.map((a) => ({
    name: `nexus/open-${a.route}`,
    label: `Nexus: Open ${a.label}`,
    route: a.route,
  }));
}
function Fm(a, o) {
  const i = Ti();
  if (!i) return () => {};
  const d = [];
  for (const u of a)
    try {
      (i.registerCommand({
        name: u.name,
        label: u.label,
        searchLabel: u.label,
        callback: ({ close: p } = {}) => {
          (o(u.route), typeof p == "function" && p());
        },
      }),
        d.push(u.name));
    } catch {}
  return () => {
    if (typeof i.unregisterCommand == "function")
      for (const u of d)
        try {
          i.unregisterCommand(u);
        } catch {}
  };
}
const ROUTE_COMPONENTS = {
  activities: ActivitiesPage,
  "form-builder": FormBuilderPage,
  "form-templates": nlsFormTemplatesPage,
  "form-submissions": nlsFormSubmissionsPage,
  popups: PopupsPage,
  "menu-items": MenuItemsPage,
  emails: EmailsPage,
  accessibility: AccessibilityPage,
  settings: SettingsPage,
};
function App() {
  var u;
  const [a, o] = b.useState(
      ((u = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : u.initialRoute) || DEFAULT_ROUTE,
    ),
    i = b.useCallback((p) => {
      var x, f;
      o(p);
      const h =
        (f = (x = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : x.adminPages) == null
          ? void 0
          : f[p];
      typeof history < "u" && h && history.pushState(null, "", h);
    }, []);
  (b.useEffect(() => {
    function p() {
      var f;
      const h = (f = window == null ? void 0 : window.nexulesuite_Admin) == null ? void 0 : f.adminPages;
      if (!h) return;
      const x = window.location.href;
      for (const S in h)
        if (h[S] === x) {
          o(S);
          break;
        }
    }
    return (window.addEventListener("popstate", p), () => window.removeEventListener("popstate", p));
  }, []),
    b.useEffect(() => Fm(useNexusCommands(), i), [i]));
  const d = ROUTE_COMPONENTS[a] || null;
  return e.jsx(AdminErrorBoundary, {
    children: e.jsxs("div", {
      className: "nexulesuite_admin-app flex min-h-screen",
      children: [
        e.jsx(AdminSidebar, {
          activeId: a,
          onNavigate: i,
        }),
        e.jsxs("div", {
          className: "flex min-w-0 flex-1 flex-col",
          children: [
            e.jsx(AdminHeader, {
              route: a,
              onNavigate: i,
            }),
            e.jsx("main", {
              className: "min-h-0 flex-1",
              children: d
                ? e.jsx(d, {
                    onNavigate: i,
                  })
                : e.jsxs("div", {
                    className: "min-h-screen bg-[#f6f7fb] px-8 py-6 text-slate-800",
                    children: [
                      e.jsx("h1", {
                        className: "text-lg font-semibold",
                        children: "Coming soon",
                      }),
                      e.jsxs("p", {
                        className: "mt-2 text-sm text-slate-600",
                        children: [
                          "This section will be implemented next: ",
                          e.jsx("span", {
                            className: "font-mono",
                            children: a,
                          }),
                          ".",
                        ],
                      }),
                    ],
                  }),
            }),
          ],
        }),
      ],
    }),
  });
}
const rootEl = document.getElementById("nexulesuite_admin-root");
rootEl &&
  Kh.createRoot(rootEl).render(
    e.jsx(mi.StrictMode, {
      children: e.jsx(App, {}),
    }),
  );
