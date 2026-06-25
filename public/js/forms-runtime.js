(() => {
  function qs(root, sel) {
    return root.querySelector(sel);
  }
  function qsa(root, sel) {
    return Array.from(root.querySelectorAll(sel));
  }

  function isScrollableY(el) {
    if (!(el instanceof HTMLElement)) return false;
    const st = getComputedStyle(el);
    const oy = st.overflowY || st.overflow;
    return (oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 2;
  }

  function getScrollParent(el) {
    let cur = el && el.parentElement ? el.parentElement : null;
    while (cur) {
      if (isScrollableY(cur)) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  /**
   * Best-effort: native <select> decides up/down based on viewport space.
   * If there's not enough room below, scroll the nearest scroll container (or window)
   * so the browser has space to open the list downward.
   */
  function nudgeSelectIntoViewForDropdown(selectEl) {
    if (!(selectEl instanceof HTMLSelectElement)) return;
    if (selectEl.disabled) return;
    if (selectEl.multiple) return;
    const sizeAttr = Number(selectEl.getAttribute("size") || "0");
    if (sizeAttr && sizeAttr > 1) return;

    const rect = selectEl.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
    if (!viewportH) return;

    const desiredBelow = 260; // px: enough for ~8-10 options
    const below = viewportH - rect.bottom;
    if (below >= desiredBelow) return;

    const parent = getScrollParent(selectEl);
    const delta = Math.min(desiredBelow - below + 16, viewportH); // cap safety

    if (parent) {
      parent.scrollTop = Math.max(0, parent.scrollTop + delta);
    } else {
      window.scrollBy({ top: delta, left: 0, behavior: "smooth" });
    }
  }

  function createChevronSvg() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 20 20");
    svg.setAttribute("fill", "currentColor");
    const path = document.createElementNS(ns, "path");
    path.setAttribute(
      "d",
      "M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.08 1.04l-4.25 4.25a.75.75 0 0 1-1.06 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
    );
    svg.appendChild(path);
    return svg;
  }

  function getSelectedLabel(sel) {
    const idx = sel.selectedIndex;
    if (idx < 0) return "";
    const opt = sel.options[idx];
    return opt ? String(opt.textContent || opt.label || "").trim() : "";
  }

  function getPlaceholderLabel(sel) {
    // Prefer first option when it is the empty placeholder.
    const o0 = sel.options && sel.options.length ? sel.options[0] : null;
    if (o0 && String(o0.value || "") === "") {
      const t = String(o0.textContent || o0.label || "").trim();
      if (t) return t;
    }
    return "Select an option";
  }

  function enhanceNativeSelect(sel) {
    if (!(sel instanceof HTMLSelectElement)) return;
    if (!sel.classList.contains("nexulesuite_st-select")) return;
    if (sel.dataset.nexulesuite_enhanced === "1") return;
    if (sel.disabled) return;
    if (sel.multiple) return;
    const sizeAttr = Number(sel.getAttribute("size") || "0");
    if (sizeAttr && sizeAttr > 1) return;

    sel.dataset.nexulesuite_enhanced = "1";
    sel.classList.add("nexulesuite_st-select--native");

    const wrap = document.createElement("div");
    wrap.className = "nexulesuite_st-select-ui";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nexulesuite_st-select-btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    // Prevent mouse wheel from accidentally changing selection / feeling "spinny".
    btn.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    const text = document.createElement("span");
    text.className = "nexulesuite_st-select-btn__text";

    const chev = document.createElement("span");
    chev.className = "nexulesuite_st-select-btn__chev";
    chev.appendChild(createChevronSvg());

    btn.appendChild(text);
    btn.appendChild(chev);

    // Place wrapper right after the select, keep select in DOM for submission.
    sel.insertAdjacentElement("afterend", wrap);
    wrap.appendChild(btn);

    function syncBtnText() {
      const val = String(sel.value || "");
      if (!val.trim()) {
        text.textContent = getPlaceholderLabel(sel);
        text.classList.add("nexulesuite_st-select-btn__text--placeholder");
      } else {
        text.textContent = getSelectedLabel(sel) || val;
        text.classList.remove("nexulesuite_st-select-btn__text--placeholder");
      }
    }
    syncBtnText();

    sel.addEventListener("change", syncBtnText);

    /** @type {HTMLDivElement|null} */
    let menu = null;

    function closeMenu() {
      if (!menu) return;
      menu.remove();
      menu = null;
      btn.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", onDocPointerDown, true);
      document.removeEventListener("keydown", onDocKeyDown, true);
      window.removeEventListener("resize", positionMenu, true);
      window.removeEventListener("scroll", positionMenu, true);
    }

    function positionMenu() {
      if (!menu) return;
      const r = btn.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
      const top = Math.min(viewportH - 40, r.bottom + 6);
      const maxH = Math.max(140, Math.min(320, viewportH - top - 12));
      menu.style.left = Math.max(8, r.left) + "px";
      menu.style.top = top + "px";
      menu.style.width = Math.max(160, r.width) + "px";
      menu.style.maxHeight = maxH + "px";
    }

    function onDocPointerDown(ev) {
      const t = ev.target;
      if (!menu) return;
      if (t instanceof Node && (menu.contains(t) || btn.contains(t))) return;
      closeMenu();
    }

    function onDocKeyDown(ev) {
      if (ev.key === "Escape") {
        ev.preventDefault();
        closeMenu();
        btn.focus();
      }
    }

    function openMenu() {
      if (menu) return;
      menu = document.createElement("div");
      menu.className = "nexulesuite_st-select-menu";
      if (sel.closest(".nexulesuite_st-form--minimal")) {
        menu.classList.add("nexulesuite_st-select-menu--minimal");
      }
      menu.setAttribute("role", "listbox");
      menu.tabIndex = -1;

      const curVal = String(sel.value || "");
      for (const opt of Array.from(sel.options || [])) {
        const v = String(opt.value || "");
        const lbl = String(opt.textContent || opt.label || "").trim() || v || "Option";
        const row = document.createElement("div");
        row.className = "nexulesuite_st-select-opt";
        row.setAttribute("role", "option");
        row.textContent = lbl;
        const isDisabled = Boolean(opt.disabled) || (v === "" && opt.disabled);
        row.setAttribute("aria-disabled", isDisabled ? "true" : "false");
        row.setAttribute("aria-selected", v === curVal ? "true" : "false");
        row.addEventListener("click", () => {
          if (isDisabled) return;
          sel.value = v;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          closeMenu();
          btn.focus();
        });
        menu.appendChild(row);
      }

      document.body.appendChild(menu);
      btn.setAttribute("aria-expanded", "true");
      positionMenu();
      // Focus the menu so Esc works reliably and keyboard users have a target.
      menu.focus({ preventScroll: true });

      document.addEventListener("pointerdown", onDocPointerDown, true);
      document.addEventListener("keydown", onDocKeyDown, true);
      window.addEventListener("resize", positionMenu, true);
      window.addEventListener("scroll", positionMenu, true);
    }

    btn.addEventListener("click", () => {
      if (menu) closeMenu();
      else {
        // Keep the button visible and avoid native select behavior.
        nudgeSelectIntoViewForDropdown(sel);
        openMenu();
      }
    });
  }

  function digitsBeforeCursor(str, cursor) {
    let n = 0;
    const end = Math.min(cursor ?? str.length, str.length);
    for (let i = 0; i < end; i++) {
      if (/\d/.test(str[i])) n++;
    }
    return n;
  }

  function caretAfterNthDigit(formatted, n) {
    if (n <= 0) return 0;
    let seen = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        seen++;
        if (seen === n) return i + 1;
      }
    }
    return formatted.length;
  }

  /**
   * US / NANP: (XXX) XXX-XXXX; strips leading country digit 1 when 11 digits.
   */
  function formatUsPhoneDisplay(value) {
    let d = String(value || "").replace(/\D/g, "");
    if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
    d = d.slice(0, 10);
    if (!d.length) return "";
    if (d.length <= 3) return "(" + d;
    if (d.length <= 6) return "(" + d.slice(0, 3) + ") " + d.slice(3);
    return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  }

  function onUsPhoneInput(ev) {
    const el = ev.target;
    if (!(el instanceof HTMLInputElement)) return;
    const prev = el.value;
    const cursor = el.selectionStart ?? prev.length;
    const digitCount = digitsBeforeCursor(prev, cursor);
    const next = formatUsPhoneDisplay(prev);
    el.value = next;
    const pos = caretAfterNthDigit(next, digitCount);
    el.setSelectionRange(pos, pos);
  }

  /** American date entry: MM/DD/YYYY (2 / 2 / 4 digits). */
  function formatDateMdyDisplay(value) {
    const d = String(value || "").replace(/\D/g, "").slice(0, 8);
    if (!d.length) return "";
    let out = d.slice(0, 2);
    if (d.length > 2) out += "/" + d.slice(2, 4);
    if (d.length > 4) out += "/" + d.slice(4, 8);
    return out;
  }

  function onDateMdyInput(ev) {
    const el = ev.target;
    if (!(el instanceof HTMLInputElement)) return;
    const prev = el.value;
    const cursor = el.selectionStart ?? prev.length;
    const digitCount = digitsBeforeCursor(prev, cursor);
    const next = formatDateMdyDisplay(prev);
    el.value = next;
    const pos = caretAfterNthDigit(next, digitCount);
    el.setSelectionRange(pos, pos);
  }

  function bindNexusInputMask(el) {
    if (!(el instanceof HTMLInputElement)) return;
    const mask = el.dataset.nexulesuite_mask;
    if (!mask) return;
    if (mask === "us-phone") {
      el.addEventListener("input", onUsPhoneInput);
    } else if (mask === "date-mdy" || mask === "date-dmy") {
      el.addEventListener("input", onDateMdyInput);
    }
  }

  function initInputMasks(root) {
    qsa(root, "input[data-nexulesuite_mask]").forEach(bindNexusInputMask);
  }

  /** Local draft persistence (survive refresh). */
  const FORM_DRAFT_VERSION = 1;
  const FORM_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  /** Match {@see Shortcodes::HONEYPOT_FIELD_NAME} — never persist honeypot in drafts. */
  const FORM_HONEYPOT_NAME = "nexulesuite_hp_website";

  /** @param {Element} root */
  function formDraftStorageKey(root) {
    const id = String(root.getAttribute("data-form-id") || "form").trim() || "form";
    return (
      "nexulesuite_fd_v" +
      FORM_DRAFT_VERSION +
      "|" +
      location.origin +
      "|" +
      encodeURIComponent(location.pathname || "/") +
      "|" +
      encodeURIComponent(id)
    );
  }

  /** @param {Element} root */
  function getFormFromRoot(root) {
    const form = qs(root, "form.nexulesuite_st-form__body") || qs(root, "form");
    return form instanceof HTMLFormElement ? form : null;
  }

  /** @param {Record<string, unknown>} fields */
  function isFormDraftEmpty(fields) {
    if (!fields || typeof fields !== "object") return true;
    for (const k of Object.keys(fields)) {
      const v = fields[k];
      if (Array.isArray(v)) {
        if (v.length > 0) return false;
      } else if (v != null && String(v).trim() !== "") return false;
    }
    return true;
  }

  /**
   * @param {HTMLFormElement} form
   * @returns {Record<string, string | string[]>}
   */
  function serializeFormDraftFields(form) {
    /** @type {Record<string, string | string[]>} */
    const out = {};
    for (const el of qsa(form, "input, textarea, select")) {
      if (
        !(el instanceof HTMLInputElement) &&
        !(el instanceof HTMLTextAreaElement) &&
        !(el instanceof HTMLSelectElement)
      ) {
        continue;
      }
      if (el.disabled) continue;
      const name = el.name;
      if (!name) continue;
      if (name === FORM_HONEYPOT_NAME) continue;
      if (name === "g-recaptcha-response" || name === "cf-turnstile-response" || name === "h-captcha-response") continue;

      if (el instanceof HTMLSelectElement && el.multiple) {
        out[name] = Array.from(el.selectedOptions).map((o) => o.value);
        continue;
      }

      if (el instanceof HTMLInputElement) {
        const t = String(el.type || "text").toLowerCase();
        if (t === "file" || t === "submit" || t === "button" || t === "image" || t === "hidden") continue;
        if (t === "password") continue;
        if (t === "checkbox") {
          if (name.endsWith("[]")) {
            if (!Array.isArray(out[name])) out[name] = [];
            if (el.checked) {
              const arr = /** @type {string[]} */ (out[name]);
              arr.push(el.value);
            }
          } else {
            out[name] = el.checked ? el.value : "";
          }
          continue;
        }
        if (t === "radio") {
          if (out[name] === undefined && el.checked) out[name] = el.value;
          continue;
        }
      }
      out[name] = el.value;
    }
    return out;
  }

  /**
   * @param {HTMLFormElement} form
   * @param {Record<string, unknown>} data
   */
  function applyFormDraftFields(form, data) {
    for (const el of qsa(form, "input, textarea, select")) {
      if (
        !(el instanceof HTMLInputElement) &&
        !(el instanceof HTMLTextAreaElement) &&
        !(el instanceof HTMLSelectElement)
      ) {
        continue;
      }
      if (el.disabled) continue;
      const name = el.name;
      if (!name) continue;
      if (name === FORM_HONEYPOT_NAME) continue;
      if (name === "g-recaptcha-response" || name === "cf-turnstile-response" || name === "h-captcha-response") continue;

      if (el instanceof HTMLInputElement) {
        const t = String(el.type || "text").toLowerCase();
        if (t === "file" || t === "submit" || t === "button" || t === "image" || t === "hidden") continue;
        if (t === "password") continue;
        if (t === "checkbox") {
          if (!Object.prototype.hasOwnProperty.call(data, name)) continue;
          const raw = data[name];
          if (name.endsWith("[]")) {
            const arr = Array.isArray(raw) ? raw.map(String) : [];
            el.checked = arr.indexOf(el.value) !== -1;
          } else {
            el.checked = String(raw || "") === el.value && String(raw || "") !== "";
          }
          continue;
        }
        if (t === "radio") {
          if (!Object.prototype.hasOwnProperty.call(data, name)) continue;
          el.checked = String(data[name] || "") === el.value;
          continue;
        }
      }

      if (el instanceof HTMLSelectElement && el.multiple) {
        if (!Object.prototype.hasOwnProperty.call(data, name)) continue;
        const raw = data[name];
        const vals = Array.isArray(raw) ? raw.map(String) : raw != null && String(raw) !== "" ? [String(raw)] : [];
        for (let i = 0; i < el.options.length; i++) {
          el.options[i].selected = vals.indexOf(el.options[i].value) !== -1;
        }
        continue;
      }

      if (!Object.prototype.hasOwnProperty.call(data, name)) continue;
      const v = data[name];
      el.value = v == null ? "" : String(v);
    }
  }

  /**
   * @param {Element} root
   * @returns {{ fields: Record<string, unknown>, step: number } | null}
   */
  function readFormDraft(root) {
    try {
      const raw = localStorage.getItem(formDraftStorageKey(root));
      if (!raw) return null;
      const o = JSON.parse(raw);
      if (!o || o.v !== FORM_DRAFT_VERSION || typeof o.t !== "number" || typeof o.fields !== "object" || !o.fields) {
        return null;
      }
      if (Date.now() - o.t > FORM_DRAFT_MAX_AGE_MS) {
        localStorage.removeItem(formDraftStorageKey(root));
        return null;
      }
      const step = typeof o.step === "number" && Number.isFinite(o.step) ? Math.max(0, Math.floor(o.step)) : 0;
      return { fields: o.fields, step };
    } catch (_e) {
      return null;
    }
  }

  /** @param {Element} root */
  function clearFormDraft(root) {
    try {
      localStorage.removeItem(formDraftStorageKey(root));
    } catch (_e) {}
  }

  /**
   * @param {Element} root
   * @param {Record<string, string | string[]>} fields
   * @param {number} step
   */
  function writeFormDraft(root, fields, step) {
    try {
      const payload = {
        v: FORM_DRAFT_VERSION,
        t: Date.now(),
        fields,
        step: typeof step === "number" && Number.isFinite(step) ? Math.max(0, Math.floor(step)) : 0,
      };
      localStorage.setItem(formDraftStorageKey(root), JSON.stringify(payload));
    } catch (_e) {}
  }

  /** @param {Element} root */
  function flushFormDraftNow(root) {
    const form = getFormFromRoot(root);
    if (!form) return;
    const step = parseInt(String(root.getAttribute("data-nexulesuite_draft-step") || "0"), 10) || 0;
    const fields = serializeFormDraftFields(form);
    if (isFormDraftEmpty(fields) && step === 0) {
      clearFormDraft(root);
    } else {
      writeFormDraft(root, fields, step);
    }
  }

  /** @param {Element} root */
  function bindFormDraftAutosave(root) {
    const form = getFormFromRoot(root);
    if (!form) return;
    let timer = 0;
    function scheduleSave() {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const step = parseInt(String(root.getAttribute("data-nexulesuite_draft-step") || "0"), 10) || 0;
        const fields = serializeFormDraftFields(form);
        if (isFormDraftEmpty(fields) && step === 0) {
          clearFormDraft(root);
        } else {
          writeFormDraft(root, fields, step);
        }
      }, 320);
    }
    form.addEventListener("input", scheduleSave, true);
    form.addEventListener("change", scheduleSave, true);
  }

  /** @param {Element} root */
  function initFormDraftForRoot(root) {
    const draft = readFormDraft(root);
    const form = getFormFromRoot(root);
    initSubmitGate(root);
    initForm(root, draft ? draft.step : undefined);
    refreshFormCaptchas(root);
    initInputMasks(root);
    if (form && draft && draft.fields) {
      applyFormDraftFields(form, draft.fields);
      qsa(form, "input[data-nexulesuite_mask]").forEach((el) => {
        el.dispatchEvent(new Event("input", { bubbles: true }));
      });
      const gate = submitGateSyncByRoot.get(root);
      if (typeof gate === "function") gate();
    }
    bindFormDraftAutosave(root);
    flushFormDraftNow(root);
  }

  /** @type {WeakMap<Element, () => void>} */
  const submitGateSyncByRoot = new WeakMap();

  /**
   * Whether every constraint-validated control in the form passes the browser's validation API
   * (required, type=email/url/number, minlength, pattern, etc.).
   *
   * @param {HTMLFormElement} form
   * @returns {boolean}
   */
  function isFormConstraintValid(form) {
    for (const el of qsa(form, "input, textarea, select")) {
      if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) {
        continue;
      }
      if (el.disabled) continue;
      const type = String(el.type || "").toLowerCase();
      if (type === "hidden" || type === "button" || type === "submit") continue;
      if (!el.willValidate) continue;
      if (!el.checkValidity()) return false;
    }
    return true;
  }

  function captchaStepVisible(el) {
    const step = el.closest(".nexulesuite_st-step");
    if (!step) return true;
    return !step.hidden;
  }

  function whenExternalScriptReady(check, cb) {
    if (check()) {
      cb();
      return;
    }
    let n = 0;
    const t = window.setInterval(() => {
      n++;
      if (check()) {
        window.clearInterval(t);
        cb();
      } else if (n > 150) {
        window.clearInterval(t);
      }
    }, 40);
  }

  function syncCaptchaRelatedSubmitGate(el) {
    const root = el.closest(".nexulesuite_st-form");
    if (!root) return;
    const sync = submitGateSyncByRoot.get(root);
    if (typeof sync === "function") sync();
  }

  function renderRecaptchaWidgets(form) {
    const cfg = window.nexulesuite_Forms || {};
    const siteKey = cfg.recaptchaSiteKey;
    if (!siteKey) return;
    if ((cfg.recaptchaApiVersion || "v2") === "v3") return;
    whenExternalScriptReady(
      () =>
        typeof window.grecaptcha !== "undefined" &&
        window.grecaptcha &&
        typeof window.grecaptcha.render === "function",
      () => {
        qsa(form, ".nexulesuite_st-captcha--recaptcha").forEach((el) => {
          if (!(el instanceof HTMLElement)) return;
          if (!captchaStepVisible(el)) return;
          if (el.getAttribute("data-nexulesuite_widget-id") !== null) return;
          const wid = window.grecaptcha.render(el, {
            sitekey: siteKey,
            callback: () => syncCaptchaRelatedSubmitGate(el),
            "expired-callback": () => syncCaptchaRelatedSubmitGate(el),
            "error-callback": () => syncCaptchaRelatedSubmitGate(el),
          });
          el.setAttribute("data-nexulesuite_widget-id", String(wid));
          syncCaptchaRelatedSubmitGate(el);
        });
      }
    );
  }

  function renderTurnstileWidgets(form) {
    const cfg = window.nexulesuite_Forms || {};
    const siteKey = cfg.turnstileSiteKey;
    if (!siteKey) return;
    whenExternalScriptReady(
      () =>
        typeof window.turnstile !== "undefined" && window.turnstile && typeof window.turnstile.render === "function",
      () => {
        qsa(form, ".nexulesuite_st-captcha--turnstile").forEach((el) => {
          if (!(el instanceof HTMLElement)) return;
          if (!captchaStepVisible(el)) return;
          if (el.getAttribute("data-nexulesuite_widget-id") !== null) return;
          const wid = window.turnstile.render(el, {
            sitekey: siteKey,
            callback: () => syncCaptchaRelatedSubmitGate(el),
            "expired-callback": () => syncCaptchaRelatedSubmitGate(el),
            "error-callback": () => syncCaptchaRelatedSubmitGate(el),
          });
          el.setAttribute("data-nexulesuite_widget-id", String(wid));
          syncCaptchaRelatedSubmitGate(el);
        });
      }
    );
  }

  /**
   * @param {Element} root .nexulesuite_st-form
   */
  function refreshFormCaptchas(root) {
    const form = getFormFromRoot(root);
    if (!form) return;
    renderRecaptchaWidgets(form);
    renderTurnstileWidgets(form);
  }

  /**
   * @param {HTMLFormElement} form
   */
  function isCaptchaSatisfied(form) {
    const cfg = window.nexulesuite_Forms || {};
    const recVer = cfg.recaptchaApiVersion || "v2";
    if (recVer !== "v3") {
      for (const el of qsa(form, ".nexulesuite_st-captcha--recaptcha")) {
        if (!(el instanceof HTMLElement)) continue;
        if (!cfg.recaptchaSiteKey) continue;
        const step = el.closest(".nexulesuite_st-step");
        const hidden = step instanceof HTMLElement && step.hidden;
        const widAttr = el.getAttribute("data-nexulesuite_widget-id");
        if (hidden && widAttr === null) continue;
        if (widAttr === null) return false;
        if (typeof window.grecaptcha === "undefined" || !window.grecaptcha) return false;
        const token = window.grecaptcha.getResponse(parseInt(widAttr, 10));
        if (!token) return false;
      }
    }
    for (const el of qsa(form, ".nexulesuite_st-captcha--turnstile")) {
      if (!(el instanceof HTMLElement)) continue;
      if (!cfg.turnstileSiteKey) continue;
      const step = el.closest(".nexulesuite_st-step");
      const hidden = step instanceof HTMLElement && step.hidden;
      const widAttr = el.getAttribute("data-nexulesuite_widget-id");
      if (hidden && widAttr === null) continue;
      if (widAttr === null) return false;
      if (typeof window.turnstile === "undefined" || !window.turnstile) return false;
      const token = window.turnstile.getResponse(widAttr);
      if (!token) return false;
    }
    return true;
  }

  /**
   * @param {HTMLFormElement} form
   */
  function resetCaptchaWidgets(form) {
    const cfg = window.nexulesuite_Forms || {};
    if ((cfg.recaptchaApiVersion || "v2") !== "v3") {
      qsa(form, ".nexulesuite_st-captcha--recaptcha").forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        const widAttr = el.getAttribute("data-nexulesuite_widget-id");
        if (widAttr === null || typeof window.grecaptcha === "undefined" || !window.grecaptcha) return;
        try {
          window.grecaptcha.reset(parseInt(widAttr, 10));
        } catch (_e) {}
      });
    }
    qsa(form, ".nexulesuite_st-captcha--turnstile").forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      const widAttr = el.getAttribute("data-nexulesuite_widget-id");
      if (widAttr === null || typeof window.turnstile === "undefined" || !window.turnstile) return;
      try {
        window.turnstile.reset(widAttr);
      } catch (_e) {}
    });
    const root = form.closest(".nexulesuite_st-form");
    if (root) {
      const sync = submitGateSyncByRoot.get(root);
      if (typeof sync === "function") sync();
    }
  }

  /**
   * reCAPTCHA v3 score token (must match server-expected action).
   *
   * @param {string} siteKey
   * @param {string} action
   * @returns {Promise<string>}
   */
  function getRecaptchaV3Token(siteKey, action) {
    return new Promise((resolve) => {
      const finish = (t) => resolve(typeof t === "string" && t ? t : "");
      whenExternalScriptReady(
        () =>
          typeof window.grecaptcha !== "undefined" &&
          window.grecaptcha &&
          typeof window.grecaptcha.ready === "function" &&
          typeof window.grecaptcha.execute === "function",
        () => {
          try {
            window.grecaptcha.ready(() => {
              window.grecaptcha
                .execute(siteKey, { action: action || "nexulesuite_form_submit" })
                .then((token) => finish(token))
                .catch(() => finish(""));
            });
          } catch (_e) {
            finish("");
          }
        }
      );
    });
  }

  /**
   * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} el
   * @returns {boolean}
   */
  function shouldSkipInlineFormatHint(el) {
    if (!(el instanceof HTMLElement) || el.disabled) return true;
    if (el instanceof HTMLInputElement) {
      const t = String(el.type || "").toLowerCase();
      if (
        t === "hidden" ||
        t === "radio" ||
        t === "checkbox" ||
        t === "file" ||
        t === "button" ||
        t === "submit"
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Non-empty format / constraint hints while typing (e.g. invalid email). Skips empty required
   * fields to avoid noisy state until the user enters something.
   *
   * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} el
   * @returns {void}
   */
  function updateInlineFieldValidity(el) {
    if (shouldSkipInlineFormatHint(el)) return;
    if (!el.willValidate) {
      el.classList.remove("nexulesuite_st-input--inline-invalid");
      el.removeAttribute("aria-invalid");
      return;
    }
    const raw = String(el.value || "");
    const trimmed = raw.trim();
    if (trimmed === "" && el.hasAttribute("required")) {
      el.classList.remove("nexulesuite_st-input--inline-invalid");
      el.removeAttribute("aria-invalid");
      return;
    }
    const bad = !el.checkValidity();
    el.classList.toggle("nexulesuite_st-input--inline-invalid", bad);
    if (bad) el.setAttribute("aria-invalid", "true");
    else el.removeAttribute("aria-invalid");
  }

  /**
   * Keeps the primary submit control disabled until all required fields are satisfied.
   *
   * @param {Element} root .nexulesuite_st-form
   * @returns {void}
   */
  function initSubmitGate(root) {
    if (!(root instanceof Element)) return;
    if (root.getAttribute("data-nexulesuite_submit-gate") === "1") return;
    root.setAttribute("data-nexulesuite_submit-gate", "1");
    const form = qs(root, "form.nexulesuite_st-form__body") || qs(root, "form");
    if (!(form instanceof HTMLFormElement)) return;

    function onFormFieldActivity(ev) {
      const t = ev.target;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement
      ) {
        updateInlineFieldValidity(t);
      }
      syncSubmitGate();
    }

    function syncSubmitGate() {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (!(submitBtn instanceof HTMLButtonElement)) return;
      if (
        submitBtn.classList.contains("nexulesuite_st-btn--loading") ||
        submitBtn.classList.contains("nexulesuite_st-btn--success")
      ) {
        return;
      }
      const complete = isFormConstraintValid(form) && isCaptchaSatisfied(form);
      submitBtn.disabled = !complete;
      submitBtn.classList.toggle("nexulesuite_st-submit--gated", !complete);
      submitBtn.setAttribute("aria-disabled", complete ? "false" : "true");
    }

    submitGateSyncByRoot.set(root, syncSubmitGate);
    syncSubmitGate();
    form.addEventListener("input", onFormFieldActivity, true);
    form.addEventListener("change", onFormFieldActivity, true);
    form.addEventListener("focusout", onFormFieldActivity, true);
  }

  const SVG_SUBMIT_SPINNER =
    '<svg class="nexulesuite_st-btn__state-icon nexulesuite_st-btn__spinner-ico" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" stroke-opacity="0.22"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';

  const SVG_SUBMIT_TICK =
    '<svg class="nexulesuite_st-btn__state-icon nexulesuite_st-btn__tick-ico" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="nexulesuite_st-btn__tick-stroke" d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /** @param {HTMLButtonElement | null | undefined} btn */
  function setSubmitBtnLoading(btn) {
    if (!(btn instanceof HTMLButtonElement)) return;
    const label = String(btn.textContent || "").trim();
    btn.dataset.nexulesuite_submitLabel = label;
    btn.disabled = true;
    btn.classList.remove("nexulesuite_st-btn--success", "nexulesuite_st-submit--gated");
    btn.classList.add("nexulesuite_st-btn--loading");
    btn.innerHTML = SVG_SUBMIT_SPINNER;
    btn.setAttribute("aria-busy", "true");
  }

  /**
   * @param {HTMLButtonElement | null | undefined} btn
   * @param {() => void} onShownTick — after tick animation (e.g. show result card)
   */
  function setSubmitBtnSuccessTick(btn, onShownTick) {
    if (!(btn instanceof HTMLButtonElement)) {
      onShownTick?.();
      return;
    }
    btn.classList.remove("nexulesuite_st-btn--loading", "nexulesuite_st-submit--gated");
    btn.classList.add("nexulesuite_st-btn--success");
    btn.innerHTML = SVG_SUBMIT_TICK;
    btn.removeAttribute("aria-busy");
    btn.setAttribute("aria-label", "Sent");
    window.setTimeout(() => {
      onShownTick?.();
    }, 520);
  }

  /**
   * @param {HTMLButtonElement | null | undefined} btn
   * @param {string} [fallbackLabel]
   */
  function resetSubmitBtnAfterError(btn, fallbackLabel) {
    if (!(btn instanceof HTMLButtonElement)) return;
    btn.classList.remove("nexulesuite_st-btn--loading", "nexulesuite_st-btn--success");
    btn.removeAttribute("aria-busy");
    btn.removeAttribute("aria-label");
    const stored = btn.dataset.nexulesuite_submitLabel;
    delete btn.dataset.nexulesuite_submitLabel;
    btn.textContent = stored || fallbackLabel || "Submit";
    const root = btn.closest(".nexulesuite_st-form");
    const form = root ? getFormFromRoot(root) : null;
    if (form) resetCaptchaWidgets(form);
    const sync = root ? submitGateSyncByRoot.get(root) : undefined;
    if (typeof sync === "function") sync();
    else btn.disabled = true;
  }

  function validateStep(stepEl) {
    const invalid = qsa(stepEl, "input, select, textarea").find((el) => {
      if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) {
        return false;
      }
      if (el.disabled) return false;
      const type = String(el.type || "").toLowerCase();
      if (type === "hidden" || type === "button" || type === "submit") return false;
      if (!el.willValidate) return false;
      return !el.checkValidity();
    });
    if (invalid) {
      invalid.focus?.();
      invalid.classList.add("nexulesuite_st-input--invalid");
      if (
        invalid instanceof HTMLInputElement ||
        invalid instanceof HTMLTextAreaElement ||
        invalid instanceof HTMLSelectElement
      ) {
        updateInlineFieldValidity(invalid);
      }
      setTimeout(() => invalid.classList.remove("nexulesuite_st-input--invalid"), 1600);
      return false;
    }
    return true;
  }

  function validateAllSteps(root) {
    const steps = qsa(root, ".nexulesuite_st-step");
    if (!steps.length) return true;
    for (const s of steps) {
      if (!validateStep(s)) return false;
    }
    return true;
  }

  function isAutofocusCandidate(el) {
    if (!(el instanceof HTMLElement) || el.disabled) return false;
    if (el.tagName === "SELECT" || el.tagName === "TEXTAREA") return true;
    if (el.tagName !== "INPUT") return false;
    const t = String(el.type || "text").toLowerCase();
    if (t === "hidden") return false;
    if (t === "submit" || t === "button" || t === "image") return false;
    return true;
  }

  /**
   * First focusable control inside the step, in builder/DOM order (.nexulesuite_st-field blocks).
   */
  function findFirstFieldInStep(scope) {
    for (const field of qsa(scope, ".nexulesuite_st-field")) {
      for (const el of qsa(field, "input, select, textarea")) {
        if (isAutofocusCandidate(el)) return el;
      }
    }
    return null;
  }

  function formMayReceiveAutofocus(root) {
    const overlay = root.closest(".nexulesuite_popup-overlay");
    if (overlay && !overlay.classList.contains("nexulesuite_popup--open")) {
      return false;
    }
    if (root.closest("[hidden]")) {
      return false;
    }
    return true;
  }

  /**
   * Focus the first field of the first eligible form (visible, not inside a closed popup).
   */
  function tryAutofocusFirstField() {
    for (const root of qsa(document, ".nexulesuite_st-form")) {
      if (!formMayReceiveAutofocus(root)) continue;
      const step =
        qs(root, ".nexulesuite_st-step:not([hidden])") || qs(root, ".nexulesuite_st-step");
      if (!step) continue;
      const el = findFirstFieldInStep(step);
      if (el) {
        el.focus({ preventScroll: true });
        break;
      }
    }
  }

  function initForm(root, draftStepHint) {
    const steps = qsa(root, ".nexulesuite_st-step");
    if (!steps.length) {
      root.setAttribute("data-nexulesuite_draft-step", "0");
      return;
    }
    const isMulti = root.dataset.formType === "multi";
    if (!isMulti) {
      root.setAttribute("data-nexulesuite_draft-step", "0");
      return;
    }

    let index = 0;
    if (typeof draftStepHint === "number" && Number.isFinite(draftStepHint)) {
      index = Math.max(0, Math.min(steps.length - 1, Math.floor(draftStepHint)));
    }
    const actions = qs(root, ".nexulesuite_st-actions");
    const btnPrev = qs(actions, '[data-action="prev"]');
    const btnNext = qs(actions, '[data-action="next"]');
    const submitText = root.getAttribute("data-submit-text") || "Submit";

    const progressRoot = qs(root, ".nexulesuite_st-progress");
    const progressFill = progressRoot ? qs(progressRoot, ".nexulesuite_st-progress__fill") : null;
    const progressDots = progressRoot ? qsa(progressRoot, ".nexulesuite_st-progress__dot") : [];

    function render() {
      steps.forEach((s, i) => {
        s.hidden = i !== index;
      });
      if (btnPrev) btnPrev.disabled = index === 0;
      if (btnNext) btnNext.textContent = index < steps.length - 1 ? "Next" : submitText;
      if (btnNext) btnNext.type = index < steps.length - 1 ? "button" : "submit";

      if (progressRoot && progressFill && steps.length > 1) {
        const total = steps.length;
        const pct = ((index + 1) / total) * 100;
        progressFill.style.width = pct + "%";
        progressRoot.setAttribute("aria-valuenow", String(index + 1));
        progressRoot.setAttribute(
          "aria-label",
          "Step " + String(index + 1) + " of " + String(total)
        );
        progressDots.forEach((dot, i) => {
          dot.classList.toggle("nexulesuite_st-progress__dot--active", i === index);
          dot.classList.toggle("nexulesuite_st-progress__dot--done", i < index);
        });
      }

      root.setAttribute("data-nexulesuite_draft-step", String(index));

      const gate = submitGateSyncByRoot.get(root);
      if (typeof gate === "function") gate();
      refreshFormCaptchas(root);
    }

    btnPrev?.addEventListener("click", () => {
      index = Math.max(0, index - 1);
      render();
      flushFormDraftNow(root);
    });

    btnNext?.addEventListener("click", () => {
      if (index < steps.length - 1) {
        if (!validateStep(steps[index])) return;
        index = Math.min(steps.length - 1, index + 1);
        render();
        flushFormDraftNow(root);
      }
    });

    render();
  }

  const SVG_RESULT_SUCCESS =
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
  const SVG_RESULT_ERROR =
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';

  function removeFormFeedback(root) {
    qsa(root, ".nexulesuite_st-form-result-card, .nexulesuite_st-form-success-banner").forEach((el) =>
      el.remove()
    );
    root.classList.remove("nexulesuite_st-form--sent");
    const overlay = root.closest(".nexulesuite_popup-overlay");
    if (overlay) {
      overlay.classList.remove("nexulesuite_popup-overlay--form-result");
    }
  }

  /**
   * Admin-style feedback card (icon + title + message + Dismiss), success or error.
   *
   * @param {"success"|"error"} variant
   * @param {{ submitBtn?: HTMLButtonElement | null, prevText?: string }} opts
   */
  function showFormFeedback(root, message, variant, opts = {}) {
    const cfg = window.nexulesuite_Forms || {};
    const thankYou =
      cfg.thankYouMessage || "Thank you! Your message has been sent.";
    const smtpHint = cfg.smtpSetupMessage || "Please set up your SMTP properly.";
    const msg = (message && String(message).trim()) || "";
    const bodyText =
      msg || (variant === "success" ? thankYou : smtpHint);
    const titleText =
      variant === "success"
        ? cfg.resultSuccessTitle || "Success!"
        : cfg.resultErrorTitle || "Error!";
    const dismissLabel = cfg.dismissLabel || "Dismiss";

    removeFormFeedback(root);
    if (variant === "success") {
      clearFormDraft(root);
    }

    const card = document.createElement("div");
    card.className =
      "nexulesuite_st-form-result-card nexulesuite_st-form-result-card--" + variant;
    card.setAttribute("role", variant === "error" ? "alert" : "status");
    card.setAttribute("aria-live", "polite");

    const inner = document.createElement("div");
    inner.className = "nexulesuite_st-form-result-card__inner";

    const iconWrap = document.createElement("div");
    iconWrap.className = "nexulesuite_st-form-result-card__icon";
    iconWrap.setAttribute("aria-hidden", "true");
    iconWrap.innerHTML =
      variant === "success" ? SVG_RESULT_SUCCESS : SVG_RESULT_ERROR;

    const titleEl = document.createElement("h3");
    titleEl.className = "nexulesuite_st-form-result-card__title";
    titleEl.textContent = titleText;

    const msgEl = document.createElement("p");
    msgEl.className = "nexulesuite_st-form-result-card__message";
    msgEl.textContent = bodyText;

    inner.appendChild(iconWrap);
    inner.appendChild(titleEl);
    inner.appendChild(msgEl);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nexulesuite_st-form-result-card__dismiss";
    btn.textContent = dismissLabel;
    btn.addEventListener("click", () => {
      const ov = root.closest(".nexulesuite_popup-overlay");
      if (ov) {
        if (window.nexulesuite_PopupUi && typeof window.nexulesuite_PopupUi.close === "function") {
          window.nexulesuite_PopupUi.close(ov);
        } else {
          ov.classList.remove("nexulesuite_popup--open");
          ov.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
          if (typeof window.nexulesuite_ResetPopupFormResult === "function") {
            window.nexulesuite_ResetPopupFormResult(ov);
          }
        }
        return;
      }
      qsa(root, ".nexulesuite_st-form-result-card").forEach((el) => el.remove());
      root.classList.remove("nexulesuite_st-form--sent");
      root.classList.add("nexulesuite_st-form--dismissed");
    });

    card.appendChild(inner);
    card.appendChild(btn);

    root.classList.add("nexulesuite_st-form--sent");
    const overlay = root.closest(".nexulesuite_popup-overlay");
    if (overlay) {
      overlay.classList.add("nexulesuite_popup-overlay--form-result");
    }

    const form = qs(root, "form.nexulesuite_st-form__body") || qs(root, "form");
    if (form) {
      form.insertBefore(card, form.firstChild);
    } else {
      root.appendChild(card);
    }
  }

  async function handleFormSubmitCapture(ev) {
    const form = ev.target;
    if (!(form instanceof HTMLFormElement)) return;
    const root = form.closest(".nexulesuite_st-form");
    if (!root) return;

    const cfg = window.nexulesuite_Forms || {};
    if (!cfg.ajaxUrl || !cfg.action) return;

    ev.preventDefault();

    if (!validateAllSteps(root)) return;

    const submitBtn = form.querySelector('[type="submit"]');
    const prevText = submitBtn ? String(submitBtn.textContent || "").trim() : "";
    setSubmitBtnLoading(submitBtn instanceof HTMLButtonElement ? submitBtn : null);

    const thankYou =
      (window.nexulesuite_Forms && window.nexulesuite_Forms.thankYouMessage) ||
      "Thank you! Your message has been sent.";
    const smtpHint =
      (window.nexulesuite_Forms && window.nexulesuite_Forms.smtpSetupMessage) ||
      "Please set up your SMTP properly.";

    let recaptchaV3Token = "";
    if (cfg.recaptchaApiVersion === "v3" && cfg.recaptchaSiteKey) {
      recaptchaV3Token = await getRecaptchaV3Token(
        cfg.recaptchaSiteKey,
        cfg.recaptchaV3Action || "nexulesuite_form_submit"
      );
      if (!recaptchaV3Token.trim()) {
        resetSubmitBtnAfterError(submitBtn instanceof HTMLButtonElement ? submitBtn : null, prevText);
        showFormFeedback(
          root,
          (cfg.recaptchaV3FailMessage && String(cfg.recaptchaV3FailMessage).trim()) || smtpHint,
          "error",
          {
            submitBtn,
            prevText,
          }
        );
        return;
      }
    }

    const fd = new FormData(form);
    fd.append("action", cfg.action);
    fd.append("_nexulesuite_page_url", window.location.href);

    const popupOv = form.closest(".nexulesuite_popup-overlay");
    if (popupOv && popupOv.dataset && popupOv.dataset.event) {
      fd.append(
        "nexulesuite_form_context",
        "popup:" + String(popupOv.dataset.event).trim()
      );
    }

    if (recaptchaV3Token) {
      fd.set("g-recaptcha-response", recaptchaV3Token);
    }

    fetch(cfg.ajaxUrl, { method: "POST", body: fd, credentials: "same-origin" })
      .then(async (r) => {
        const text = await r.text();
        let res = null;
        try {
          res = text ? JSON.parse(text) : null;
        } catch (_e) {
          resetSubmitBtnAfterError(
            submitBtn instanceof HTMLButtonElement ? submitBtn : null,
            prevText
          );
          showFormFeedback(root, smtpHint, "error", {
            submitBtn,
            prevText,
          });
          return;
        }
        if (res && res.success) {
          setSubmitBtnSuccessTick(
            submitBtn instanceof HTMLButtonElement ? submitBtn : null,
            () => {
              showFormFeedback(root, res.data?.message || thankYou, "success", {
                submitBtn,
                prevText,
              });
            }
          );
        } else {
          resetSubmitBtnAfterError(
            submitBtn instanceof HTMLButtonElement ? submitBtn : null,
            prevText
          );
          const errMsg =
            (res && (res.data?.message || res.message)) || smtpHint;
          showFormFeedback(root, errMsg, "error", {
            submitBtn,
            prevText,
          });
        }
      })
      .catch(() => {
        resetSubmitBtnAfterError(
          submitBtn instanceof HTMLButtonElement ? submitBtn : null,
          prevText
        );
        showFormFeedback(root, smtpHint, "error", {
          submitBtn,
          prevText,
        });
      });
  }

  document.addEventListener("submit", handleFormSubmitCapture, true);

  // Native select dropdown direction is not controllable; this nudge helps it open downward in popups.
  document.addEventListener(
    "pointerdown",
    (ev) => {
      const t = ev.target;
      if (t instanceof HTMLSelectElement && t.classList.contains("nexulesuite_st-select")) {
        nudgeSelectIntoViewForDropdown(t);
      }
    },
    true
  );
  document.addEventListener(
    "focusin",
    (ev) => {
      const t = ev.target;
      if (t instanceof HTMLSelectElement && t.classList.contains("nexulesuite_st-select")) {
        nudgeSelectIntoViewForDropdown(t);
      }
    },
    true
  );

  document.addEventListener("DOMContentLoaded", () => {
    qsa(document, ".nexulesuite_st-form").forEach((root) => {
      initFormDraftForRoot(root);
      // Force dropdowns to open downward via custom UI.
      qsa(root, "select.nexulesuite_st-select").forEach((sel) => enhanceNativeSelect(sel));
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(tryAutofocusFirstField);
    });
  });
})();
