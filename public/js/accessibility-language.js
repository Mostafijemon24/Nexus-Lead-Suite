/**
 * Accessibility panel + GTranslate-style language switcher.
 */
(function () {
	'use strict';

	var cfg = window.nexulesuite_A11yLang || {};
	var i18n = cfg.i18n || {};
	var STORAGE_KEY = 'nexulesuite_a11y_prefs_v1';
	var LANG_KEY = 'nexulesuite_lang_v1';

	var state = {
		textLevel: 0,
		highContrast: false,
		invert: false,
		darkMode: false,
		grayscale: false,
		dyslexia: false,
		highlightLinks: false,
		pauseAnimations: false,
		bigCursor: false,
		spacing: false,
		tts: false,
		readingMask: false,
		focusIndicator: false,
	};

	var root;
	var panel;
	var mask;
	var maskBand;
	var open = false;

	function t(key, fallback) {
		return i18n[key] || fallback || key;
	}

	function escHtml(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function dockTipHtml(label) {
		return (
			'<span class="nexulesuite_a11y-dock-tip" aria-hidden="true">' +
			escHtml(label) +
			'</span>'
		);
	}

	function ensureDockTip(node, label) {
		if (!node || !label) return;
		var kids = node.children;
		var i;
		for (i = 0; i < kids.length; i++) {
			if (kids[i].classList && kids[i].classList.contains('nexulesuite_a11y-dock-tip')) {
				kids[i].textContent = label;
				return;
			}
		}
		var tip = document.createElement('span');
		tip.className = 'nexulesuite_a11y-dock-tip';
		tip.setAttribute('aria-hidden', 'true');
		tip.textContent = label;
		node.appendChild(tip);
	}

	function loadState() {
		try {
			var raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			var parsed = JSON.parse(raw);
			if (parsed && typeof parsed === 'object') {
				Object.keys(state).forEach(function (k) {
					if (typeof parsed[k] !== 'undefined') state[k] = parsed[k];
				});
			}
		} catch (e) {}
	}

	function saveState() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch (e) {}
	}

	function clearContrastModes(except) {
		['highContrast', 'invert', 'darkMode', 'grayscale'].forEach(function (k) {
			if (k !== except) state[k] = false;
		});
	}

	function applyState() {
		var html = document.documentElement;
		html.classList.remove(
			'nexulesuite_a11y-text-lg',
			'nexulesuite_a11y-text-xl',
			'nexulesuite_a11y-text-xxl',
			'nexulesuite_a11y-high-contrast',
			'nexulesuite_a11y-invert',
			'nexulesuite_a11y-dark',
			'nexulesuite_a11y-grayscale',
			'nexulesuite_a11y-dyslexia',
			'nexulesuite_a11y-links',
			'nexulesuite_a11y-pause',
			'nexulesuite_a11y-big-cursor',
			'nexulesuite_a11y-spacing',
			'nexulesuite_a11y-focus'
		);

		if (state.textLevel === 1) html.classList.add('nexulesuite_a11y-text-lg');
		if (state.textLevel === 2) html.classList.add('nexulesuite_a11y-text-xl');
		if (state.textLevel >= 3) html.classList.add('nexulesuite_a11y-text-xxl');
		if (state.highContrast) html.classList.add('nexulesuite_a11y-high-contrast');
		if (state.invert) html.classList.add('nexulesuite_a11y-invert');
		if (state.darkMode) html.classList.add('nexulesuite_a11y-dark');
		if (state.grayscale) html.classList.add('nexulesuite_a11y-grayscale');
		if (state.dyslexia) html.classList.add('nexulesuite_a11y-dyslexia');
		if (state.highlightLinks) html.classList.add('nexulesuite_a11y-links');
		if (state.pauseAnimations) {
			html.classList.add('nexulesuite_a11y-pause');
			document.querySelectorAll('video, audio').forEach(function (el) {
				try {
					el.pause();
				} catch (e) {}
			});
		}
		if (state.bigCursor) html.classList.add('nexulesuite_a11y-big-cursor');
		if (state.spacing) html.classList.add('nexulesuite_a11y-spacing');
		if (state.focusIndicator) html.classList.add('nexulesuite_a11y-focus');

		if (mask) {
			mask.classList.toggle('is-on', !!state.readingMask);
		}

		saveState();
		syncCards();
	}

	function resetAll() {
		state = {
			textLevel: 0,
			highContrast: false,
			invert: false,
			darkMode: false,
			grayscale: false,
			dyslexia: false,
			highlightLinks: false,
			pauseAnimations: false,
			bigCursor: false,
			spacing: false,
			tts: false,
			readingMask: false,
			focusIndicator: false,
		};
		if (window.speechSynthesis) window.speechSynthesis.cancel();
		applyState();
	}

	function el(tag, attrs, children) {
		var node = document.createElement(tag);
		if (attrs) {
			Object.keys(attrs).forEach(function (k) {
				if (k === 'className') node.className = attrs[k];
				else if (k === 'text') node.textContent = attrs[k];
				else if (k === 'html') node.innerHTML = attrs[k];
				else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') {
					node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
				} else if (attrs[k] !== undefined && attrs[k] !== null) {
					node.setAttribute(k, attrs[k]);
				}
			});
		}
		(children || []).forEach(function (c) {
			if (c) node.appendChild(c);
		});
		return node;
	}

	function card(opts) {
		var btn = el('button', {
			type: 'button',
			className: 'nexulesuite_a11y-card' + (opts.wide ? ' nexulesuite_a11y-card--wide' : '') + (opts.on ? ' is-on' : ''),
			'data-key': opts.key || '',
			'aria-pressed': opts.on ? 'true' : 'false',
			onClick: opts.onClick,
		}, [
			el('span', { className: 'nexulesuite_a11y-card__icon', text: opts.icon || '' }),
			el('span', { className: 'nexulesuite_a11y-card__label', text: opts.label }),
		]);
		if (opts.extra) btn.appendChild(opts.extra);
		return btn;
	}

	function syncCards() {
		if (!panel) return;
		panel.querySelectorAll('[data-key]').forEach(function (node) {
			var key = node.getAttribute('data-key');
			var on = false;
			if (key === 'textSize') on = state.textLevel > 0;
			else if (key === 'highContrast') on = state.highContrast;
			else if (key === 'invert') on = state.invert;
			else if (key === 'darkMode') on = state.darkMode;
			else if (key === 'grayscale') on = state.grayscale;
			else if (key === 'dyslexia') on = state.dyslexia;
			else if (key === 'highlightLinks') on = state.highlightLinks;
			else if (key === 'pauseAnimations') on = state.pauseAnimations;
			else if (key === 'bigCursor') on = state.bigCursor;
			else if (key === 'spacing') on = state.spacing;
			else if (key === 'tts') on = state.tts;
			else if (key === 'readingMask') on = state.readingMask;
			else if (key === 'focusIndicator') on = state.focusIndicator;
			node.classList.toggle('is-on', on);
			node.setAttribute('aria-pressed', on ? 'true' : 'false');
		});
	}

	function toggleBool(key) {
		state[key] = !state[key];
		applyState();
	}

	function setContrast(key) {
		var next = !state[key];
		clearContrastModes(key);
		state[key] = next;
		applyState();
	}

	function bumpText(dir) {
		state.textLevel = Math.max(0, Math.min(3, state.textLevel + dir));
		applyState();
	}

	function speakSelection() {
		if (!window.speechSynthesis) return;
		window.speechSynthesis.cancel();
		var text = (window.getSelection() && String(window.getSelection())) || '';
		if (!text.trim()) {
			text = document.body ? document.body.innerText.slice(0, 1200) : '';
		}
		if (!text.trim()) return;
		var u = new SpeechSynthesisUtterance(text);
		window.speechSynthesis.speak(u);
		state.tts = true;
		applyState();
	}

	function stopSpeak() {
		if (window.speechSynthesis) window.speechSynthesis.cancel();
		state.tts = false;
		applyState();
	}

	function buildPanel() {
		var textExtra = el('div', { className: 'nexulesuite_a11y-row' }, [
			el('button', {
				type: 'button',
				text: 'A−',
				title: t('decrease', 'Decrease'),
				onClick: function (e) {
					e.stopPropagation();
					bumpText(-1);
				},
			}),
			el('button', {
				type: 'button',
				text: 'A+',
				title: t('increase', 'Increase'),
				onClick: function (e) {
					e.stopPropagation();
					bumpText(1);
				},
			}),
		]);

		var ttsExtra = el('div', { className: 'nexulesuite_a11y-row' }, [
			el('button', {
				type: 'button',
				text: t('speak', 'Speak'),
				onClick: function (e) {
					e.stopPropagation();
					speakSelection();
				},
			}),
			el('button', {
				type: 'button',
				text: t('stop', 'Stop'),
				onClick: function (e) {
					e.stopPropagation();
					stopSpeak();
				},
			}),
		]);
		ttsExtra.appendChild(el('p', { className: 'nexulesuite_a11y-hint', text: t('ttsHint', 'Select text, then press Speak') }));

		var contrastExtra = el('div', { className: 'nexulesuite_a11y-row' }, [
			el('button', {
				type: 'button',
				text: t('highContrast', 'High Contrast'),
				onClick: function (e) {
					e.stopPropagation();
					setContrast('highContrast');
				},
			}),
			el('button', {
				type: 'button',
				text: t('invert', 'Invert'),
				onClick: function (e) {
					e.stopPropagation();
					setContrast('invert');
				},
			}),
			el('button', {
				type: 'button',
				text: t('darkMode', 'Dark'),
				onClick: function (e) {
					e.stopPropagation();
					setContrast('darkMode');
				},
			}),
			el('button', {
				type: 'button',
				text: t('grayscale', 'Gray'),
				onClick: function (e) {
					e.stopPropagation();
					setContrast('grayscale');
				},
			}),
		]);

		var grid = el('div', { className: 'nexulesuite_a11y-grid' }, [
			card({
				key: 'textSize',
				icon: 'Aa',
				label: t('textSize', 'Text Size'),
				wide: true,
				on: state.textLevel > 0,
				extra: textExtra,
				onClick: function () {
					bumpText(state.textLevel >= 3 ? -3 : 1);
				},
			}),
			card({
				key: 'highContrast',
				icon: '◐',
				label: t('contrast', 'Color Contrast'),
				wide: true,
				on: state.highContrast || state.invert || state.darkMode || state.grayscale,
				extra: contrastExtra,
				onClick: function () {
					setContrast('highContrast');
				},
			}),
			card({
				key: 'dyslexia',
				icon: 'Df',
				label: t('dyslexia', 'Dyslexia Friendly Font'),
				on: state.dyslexia,
				onClick: function () {
					toggleBool('dyslexia');
				},
			}),
			card({
				key: 'highlightLinks',
				icon: '⛓',
				label: t('highlightLinks', 'Highlight Links'),
				on: state.highlightLinks,
				onClick: function () {
					toggleBool('highlightLinks');
				},
			}),
			card({
				key: 'pauseAnimations',
				icon: '⏸',
				label: t('pauseAnimations', 'Pause Animations'),
				on: state.pauseAnimations,
				onClick: function () {
					toggleBool('pauseAnimations');
				},
			}),
			card({
				key: 'bigCursor',
				icon: '↖',
				label: t('bigCursor', 'Bigger Cursor'),
				on: state.bigCursor,
				onClick: function () {
					toggleBool('bigCursor');
				},
			}),
			card({
				key: 'spacing',
				icon: '↕',
				label: t('spacing', 'Line & Word Spacing'),
				on: state.spacing,
				onClick: function () {
					toggleBool('spacing');
				},
			}),
			card({
				key: 'readingMask',
				icon: '▭',
				label: t('readingMask', 'Reading Mask'),
				on: state.readingMask,
				onClick: function () {
					toggleBool('readingMask');
				},
			}),
			card({
				key: 'focusIndicator',
				icon: '▣',
				label: t('focusIndicator', 'Focus Indicator'),
				on: state.focusIndicator,
				onClick: function () {
					toggleBool('focusIndicator');
				},
			}),
			card({
				key: 'tts',
				icon: '🔊',
				label: t('tts', 'Text to Speech'),
				wide: true,
				on: state.tts,
				extra: ttsExtra,
				onClick: function () {
					if (state.tts) stopSpeak();
					else speakSelection();
				},
			}),
		]);

		var head = el('div', { className: 'nexulesuite_a11y-head' }, [
			el('h2', { text: t('accessibility', 'Accessibility') }),
			el('button', {
				type: 'button',
				className: 'nexulesuite_a11y-close',
				'aria-label': t('closePanel', 'Close'),
				text: '×',
				onClick: closePanel,
			}),
		]);

		panel = el('div', {
			className: 'nexulesuite_a11y-panel nexulesuite_a11y-panel--' + (cfg.buttonPosition || 'right'),
			role: 'dialog',
			'aria-label': t('accessibility', 'Accessibility'),
		}, [
			head,
			grid,
			el('button', {
				type: 'button',
				className: 'nexulesuite_a11y-reset',
				text: t('reset', 'Reset All'),
				onClick: resetAll,
			}),
		]);

		return panel;
	}

	function getGoogTransCookie() {
		var m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
		if (!m || !m[1]) return '';
		try {
			return decodeURIComponent(m[1]);
		} catch (e) {
			return m[1];
		}
	}

	function langFromGoogTransCookie() {
		var v = getGoogTransCookie();
		// Formats: /auto/bn  or  /en/bn
		var parts = v.split('/');
		if (parts.length >= 3 && parts[2]) return parts[2];
		return '';
	}

	function currentLang() {
		var fromCookie = langFromGoogTransCookie();
		if (fromCookie) return fromCookie;
		try {
			var stored = localStorage.getItem(LANG_KEY);
			if (stored) return stored;
		} catch (e) {}
		return cfg.defaultLanguage || 'en';
	}

	function clearLangCookie() {
		var domain = window.location.hostname;
		var past = 'Thu, 01 Jan 1970 00:00:00 GMT';
		document.cookie = 'googtrans=; expires=' + past + '; path=/';
		document.cookie = 'googtrans=; expires=' + past + '; path=/; domain=' + domain;
		document.cookie = 'googtrans=; expires=' + past + '; path=/; domain=.' + domain;
		try {
			localStorage.removeItem(LANG_KEY);
		} catch (e) {}
	}

	function setLangCookie(lang) {
		var domain = window.location.hostname;
		var expire = new Date();
		expire.setTime(expire.getTime() + 365 * 24 * 60 * 60 * 1000);
		var pageLang = cfg.defaultLanguage || 'en';
		var value = '/' + pageLang + '/' + lang;
		document.cookie = 'googtrans=' + value + '; expires=' + expire.toUTCString() + '; path=/';
		document.cookie = 'googtrans=' + value + '; expires=' + expire.toUTCString() + '; path=/; domain=.' + domain;
		try {
			localStorage.setItem(LANG_KEY, lang);
		} catch (e) {}
	}

	function selectLanguage(lang) {
		if (!lang) return;
		var active = currentLang();
		var pageLang = cfg.defaultLanguage || 'en';

		/* Already on this language — avoid re-triggering Google Translate (main flicker cause). */
		if (lang === active) {
			syncLangChips(lang);
			return;
		}

		if (lang === pageLang) {
			clearLangCookie();
			syncLangChips(lang);
			/* Soft restore: reload once so original content returns cleanly. */
			window.location.reload();
			return;
		}

		setLangCookie(lang);
		syncLangChips(lang);

		var combo = document.querySelector('.goog-te-combo');
		if (combo) {
			if (combo.value !== lang) {
				combo.value = lang;
				combo.dispatchEvent(new Event('change'));
			}
			return;
		}

		/* Widget not ready yet — cookie is set; one reload applies translation without live DOM thrash. */
		window.location.reload();
	}

	function syncLangChips(active) {
		document.querySelectorAll('.nexulesuite_a11y-flag, .nexulesuite_lang-chip').forEach(function (node) {
			node.classList.toggle('is-on', node.getAttribute('data-lang') === active);
		});
	}

	function killTranslateChrome() {
		document.querySelectorAll('iframe.goog-te-banner-frame, .goog-te-banner-frame, .goog-te-spinner-pos').forEach(function (node) {
			node.remove();
		});
		if (document.body) {
			document.body.style.top = '0px';
			document.body.style.position = 'static';
		}
		var html = document.documentElement;
		if (html) {
			html.style.marginTop = '0px';
		}
	}

	function watchTranslateChrome() {
		killTranslateChrome();
		var obs = new MutationObserver(function () {
			killTranslateChrome();
		});
		obs.observe(document.documentElement, { childList: true, subtree: true });
		setInterval(killTranslateChrome, 1500);
	}

	function flagButton(lang, chip) {
		var img = el('img', {
			src: 'https://flagcdn.com/w40/' + lang.flag + '.png',
			alt: '',
			width: chip ? '20' : '28',
			height: chip ? '14' : '20',
			loading: 'lazy',
		});
		return el(
			'button',
			{
				type: 'button',
				className: chip ? 'nexulesuite_lang-chip' : 'nexulesuite_a11y-flag',
				'data-lang': lang.code,
				title: lang.label,
				'aria-label': lang.label,
				onClick: function (e) {
					if (e && e.stopPropagation) e.stopPropagation();
					selectLanguage(lang.code);
					closeLangMenu();
				},
			},
			chip
				? [img, document.createTextNode(lang.label)]
				: [img, el('span', { text: lang.label })]
		);
	}

	function buildLangSection(insidePanel) {
		var wrap = el('div', { className: insidePanel ? 'nexulesuite_a11y-lang' : 'nexulesuite_lang-fab nexulesuite_lang-fab--' + (cfg.buttonPosition || 'right') });
		if (insidePanel) {
			wrap.appendChild(el('h3', { text: t('languages', 'Languages') }));
		}
		var flags = el('div', { className: insidePanel ? 'nexulesuite_a11y-flags' : '' });
		(cfg.languages || []).forEach(function (lang) {
			flags.appendChild(flagButton(lang, !insidePanel));
		});
		wrap.appendChild(flags);
		return wrap;
	}

	function buildLangFlyout() {
		var slot = el('div', { className: 'nexulesuite_a11y-lang-slot' });
		var flyout = el('div', {
			className: 'nexulesuite_a11y-lang-flyout',
			id: 'nexulesuite-a11y-lang-menu',
			role: 'menu',
			'aria-label': t('selectLanguage', 'Select language'),
		});
		(cfg.languages || []).forEach(function (lang) {
			flyout.appendChild(flagButton(lang, true));
		});

		var langLabel = t('language', 'Language');
		var btn = el('button', {
			type: 'button',
			className: 'nexulesuite_a11y-lang-btn',
			'aria-label': langLabel,
			'aria-expanded': 'false',
			'aria-controls': 'nexulesuite-a11y-lang-menu',
			onClick: function (e) {
				if (e && e.stopPropagation) e.stopPropagation();
				if (e && e.preventDefault) e.preventDefault();
				toggleLangMenu();
			},
			html:
				'<img class="nexulesuite_a11y-fab__icon" src="' +
				((cfg.icons && cfg.icons.translate) || '') +
				'" alt="" width="26" height="26" decoding="async" /><span class="nexulesuite_a11y-lang-btn__label">' +
				escHtml(langLabel) +
				'</span>' +
				dockTipHtml(langLabel),
		});

		slot.setAttribute('data-nls-dock-btn', 'language');
		slot.appendChild(btn);
		slot.appendChild(flyout);
		return slot;
	}

	var CUSTOM_BUTTON_ICON_LABELS = {
		link: 'Link',
		call: 'Call',
		mail: 'Email',
		message: 'Message',
		location: 'Location',
		appointment: 'Appointment',
		download: 'Download',
		popup: 'Target',
		cta: 'CTA',
		event: 'Notify',
		arrow: 'Arrow',
		globe: 'Website',
		user: 'Account',
		info: 'Info',
		whatsapp: 'WhatsApp',
		home: 'Home',
		heart: 'Heart',
		cart: 'Shop',
		help: 'Help',
		video: 'Video',
	};

	var CUSTOM_BUTTON_ICONS = {
		link: '<path d="M10 13a5 5 0 007.54.54l1.92-1.92a5 5 0 00-7.07-7.07L10.9 6.04M14 11a5 5 0 00-7.54-.54L4.54 12.38a5 5 0 007.07 7.07l1.49-1.49"/>',
		call: '<path d="M3 5a2 2 0 012-2h2.28a1 1 0 01.95.68l1.06 3.18a1 1 0 01-.23 1.05l-1.38 1.38a16.06 16.06 0 006.93 6.93l1.38-1.38a1 1 0 011.05-.23l3.18 1.06A1 1 0 0121 16.72V19a2 2 0 01-2 2h-1C9.16 21 3 14.84 3 7V5z"/>',
		mail: '<path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>',
		message: '<path d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z"/>',
		location: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>',
		appointment: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
		download: '<path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/>',
		popup: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>',
		cta: '<path d="M15 15l-6 6m0 0l-3-9 9-3-6 6z"/>',
		event: '<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>',
		arrow: '<path d="M14 5l7 7m0 0l-7 7m7-7H3"/>',
		globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>',
		user: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
		info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
		whatsapp:
			'<path d="M20.52 3.48A11.86 11.86 0 0012.04 0C5.5 0 .2 5.3.2 11.82c0 2.08.55 4.11 1.6 5.9L0 24l6.43-1.68a11.8 11.8 0 005.6 1.43h.01c6.54 0 11.84-5.3 11.84-11.82 0-3.16-1.23-6.13-3.46-8.45zM12.04 21.5h-.01a9.8 9.8 0 01-5-1.37l-.36-.21-3.81 1 1.02-3.71-.23-.38a9.77 9.77 0 01-1.5-5.21c0-5.4 4.4-9.8 9.84-9.8 2.63 0 5.1 1.02 6.96 2.88a9.75 9.75 0 012.88 6.95c0 5.4-4.4 9.8-9.79 9.8zm5.4-7.34c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"/>',
		home: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
		heart: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>',
		cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>',
		help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
		video: '<rect x="2" y="6" width="14" height="12" rx="2"/><polygon points="16 10 22 7 22 17 16 14 16 10"/>',
	};

	function customButtonIconSvg(key) {
		var inner = CUSTOM_BUTTON_ICONS[key] || CUSTOM_BUTTON_ICONS.link;
		if (key === 'whatsapp') {
			return (
				'<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="none">' +
				inner +
				'</svg>'
			);
		}
		return '<svg viewBox="0 0 24 24" aria-hidden="true">' + inner + '</svg>';
	}

	function customButtonTipLabel(iconKey) {
		return CUSTOM_BUTTON_ICON_LABELS[iconKey] || CUSTOM_BUTTON_ICON_LABELS.link;
	}

	function buildCustomButton() {
		if (!cfg.customButtonEnabled || !cfg.customButtonUrl) return null;
		var iconKey = cfg.customButtonIcon || 'link';
		var tipLabel = customButtonTipLabel(iconKey);
		var link = el('a', {
			className: 'nexulesuite_a11y-custom-btn',
			href: cfg.customButtonUrl,
			'aria-label': tipLabel,
			'data-nls-dock-btn': 'custom',
			html:
				customButtonIconSvg(iconKey) +
				'<span class="nexulesuite_a11y-sr-only">' +
				escHtml(tipLabel) +
				'</span>' +
				dockTipHtml(tipLabel),
		});
		if (cfg.customButtonOpenNewTab) {
			link.target = '_blank';
			link.rel = 'noopener noreferrer';
		}
		return link;
	}

	function syncLiveChatPanelAvatar(imgUrl) {
		var avatars = document.querySelectorAll(
			'.nexulesuite_chat-panel__avatar, .nexulesuite_chat-form-view__avatar, .nexulesuite_chat-ai-bubavatar'
		);
		var i;
		for (i = 0; i < avatars.length; i++) {
			var box = avatars[i];
			var img = box.querySelector('img');
			var svg = box.querySelector('svg');
			if (imgUrl) {
				if (!img) {
					img = document.createElement('img');
					img.alt = '';
					img.decoding = 'async';
					box.insertBefore(img, box.firstChild);
				}
				img.src = imgUrl;
				img.style.display = '';
				img.style.borderRadius = '50%';
				img.style.objectFit = 'cover';
				box.style.borderRadius = '50%';
				box.style.overflow = 'hidden';
				if (svg) svg.style.display = 'none';
			} else if (img && !img.getAttribute('data-nls-keep')) {
				/* Leave server-rendered avatar as-is when dock image cleared. */
			}
		}
	}

	function resolveDockIconPx() {
		/* Acc & Lang “Icon size” (buttonIconSize) drives every dock button, including chat —
		   matching the admin live preview. liveChatButtonIconSize remains a legacy fallback. */
		var iconPx = parseInt(cfg.buttonIconSize, 10);
		if (isNaN(iconPx)) {
			iconPx = Math.max(14, Math.min(40, parseInt(cfg.liveChatButtonIconSize, 10) || 22));
		}
		return Math.max(0, Math.min(100, iconPx));
	}

	function applyLiveChatDockStyle(trigger) {
		if (!trigger || !dock) return;
		var bg = cfg.liveChatButtonBg || '';
		var fg = cfg.liveChatButtonText || '#ffffff';
		var iconPx = resolveDockIconPx();
		var imgUrl = (cfg.liveChatButtonImage || '').trim();

		if (!bg) {
			var computed = window.getComputedStyle(trigger).backgroundColor;
			if (computed && computed !== 'rgba(0, 0, 0, 0)' && computed !== 'transparent') {
				bg = computed;
			} else {
				bg = '#2563eb';
			}
		}

		dock.style.setProperty('--nls-chat-btn-bg', bg);
		dock.style.setProperty('--nls-chat-btn-text', fg);
		dock.style.setProperty('--nls-chat-btn-icon', iconPx + 'px');
		trigger.style.setProperty('--nls-chat-btn-icon', iconPx + 'px');
		trigger.style.background = bg;
		trigger.style.color = fg;

		var svg = trigger.querySelector('svg');
		var existingImg =
			trigger.querySelector('img.nexulesuite_a11y-chat-btn__img') ||
			trigger.querySelector('img.nexulesuite_chat-trigger__img');
		if (!imgUrl && existingImg && existingImg.src) {
			imgUrl = existingImg.src;
		}
		if (imgUrl) {
			if (svg) svg.style.display = 'none';
			if (!existingImg) {
				existingImg = document.createElement('img');
				existingImg.className = 'nexulesuite_a11y-chat-btn__img nexulesuite_chat-trigger__img';
				existingImg.alt = '';
				existingImg.decoding = 'async';
				trigger.insertBefore(existingImg, trigger.firstChild);
			}
			existingImg.classList.add('nexulesuite_a11y-chat-btn__img', 'nexulesuite_chat-trigger__img');
			if (existingImg.getAttribute('src') !== imgUrl) {
				existingImg.src = imgUrl;
			}
			existingImg.style.display = 'block';
			existingImg.style.width = iconPx + 'px';
			existingImg.style.height = iconPx + 'px';
			existingImg.style.minWidth = iconPx + 'px';
			existingImg.style.minHeight = iconPx + 'px';
			existingImg.style.maxWidth = iconPx + 'px';
			existingImg.style.maxHeight = iconPx + 'px';
			existingImg.style.borderRadius = '50%';
			existingImg.style.objectFit = 'cover';
			syncLiveChatPanelAvatar(imgUrl);
		} else {
			if (existingImg && existingImg.classList.contains('nexulesuite_a11y-chat-btn__img')) {
				existingImg.style.display = 'none';
			}
			if (svg) {
				svg.style.display = '';
				svg.style.width = iconPx + 'px';
				svg.style.height = iconPx + 'px';
				svg.style.stroke = fg;
			}
		}
	}

	function dockButtonOrder() {
		var allowed = ['custom', 'chat', 'language', 'accessibility'];
		var raw = Array.isArray(cfg.dockButtonOrder) ? cfg.dockButtonOrder : [];
		var out = [];
		var i;
		for (i = 0; i < raw.length; i++) {
			var key = String(raw[i] || '');
			if (allowed.indexOf(key) !== -1 && out.indexOf(key) === -1) out.push(key);
		}
		for (i = 0; i < allowed.length; i++) {
			if (out.indexOf(allowed[i]) === -1) out.push(allowed[i]);
		}
		return out;
	}

	function dockButtonVisible(key) {
		var map = cfg.dockButtonVisible;
		if (!map || typeof map !== 'object') return true;
		if (!Object.prototype.hasOwnProperty.call(map, key)) return true;
		return !!map[key];
	}

	function attachLiveChatToDock(host) {
		/* Chat FAB only exists inside Acc & Lang dock — never as a second corner bubble. */
		if (!cfg.liveChatAvailable) return;
		var trigger = document.getElementById('nexulesuite_chat-trigger');
		if (!trigger || !host) return;

		trigger.classList.add('nexulesuite_a11y-chat-btn');
		trigger.classList.remove('nexulesuite_chat-trigger--labeled');
		trigger.removeAttribute('title');
		applyLiveChatDockStyle(trigger);
		ensureDockTip(trigger, t('liveChat', 'Live chat'));

		var slot = host.querySelector
			? host.querySelector('.nexulesuite_a11y-chat-slot')
			: null;
		if (slot) {
			slot.appendChild(trigger);
		} else {
			host.appendChild(trigger);
		}
		document.documentElement.classList.add('nexulesuite_a11y-hosts-chat');
	}

	function hideOrphanLiveChatTrigger() {
		var trigger = document.getElementById('nexulesuite_chat-trigger');
		if (!trigger) return;
		if (trigger.closest && trigger.closest('.nexulesuite_a11y-dock')) return;
		trigger.style.display = 'none';
		trigger.setAttribute('hidden', 'hidden');
		trigger.setAttribute('aria-hidden', 'true');
	}

	function buildDockStack(fabNode) {
		var wantsLang = !!(cfg.languageEnabled && (cfg.languages || []).length && dockButtonVisible('language'));
		var wantsChat = !!(cfg.liveChatAvailable && dockButtonVisible('chat'));
		var wantsCustom = !!(cfg.customButtonEnabled && cfg.customButtonUrl && dockButtonVisible('custom'));
		var wantsA11y = !!(fabNode && dockButtonVisible('accessibility'));
		var order = dockButtonOrder();
		var stack = el('div', { className: 'nexulesuite_a11y-stack' });
		var visibleKeys = [];
		var i;

		for (i = 0; i < order.length; i++) {
			var key = order[i];
			if (key === 'custom' && wantsCustom) {
				var custom = buildCustomButton();
				if (custom) {
					stack.appendChild(custom);
					visibleKeys.push('custom');
				}
			} else if (key === 'chat' && wantsChat) {
				var chatSlot = el('div', {
					className: 'nexulesuite_a11y-chat-slot',
					'data-nls-dock-btn': 'chat',
				});
				stack.appendChild(chatSlot);
				attachLiveChatToDock(stack);
				visibleKeys.push('chat');
			} else if (key === 'language' && wantsLang) {
				stack.appendChild(buildLangFlyout());
				visibleKeys.push('language');
			} else if (key === 'accessibility' && wantsA11y) {
				if (fabNode && fabNode.setAttribute) fabNode.setAttribute('data-nls-dock-btn', 'accessibility');
				stack.appendChild(fabNode);
				visibleKeys.push('accessibility');
			}
		}

		if (wantsA11y && fabNode && !stack.contains(fabNode)) {
			if (fabNode.setAttribute) fabNode.setAttribute('data-nls-dock-btn', 'accessibility');
			stack.appendChild(fabNode);
			if (visibleKeys.indexOf('accessibility') === -1) visibleKeys.push('accessibility');
		}

		stack._nlsVisibleKeys = visibleKeys;
		return stack;
	}

	function openLangMenu() {
		if (!dock) return;
		dock.classList.add('is-lang-open');
		var btn = dock.querySelector('.nexulesuite_a11y-lang-btn');
		if (btn) btn.setAttribute('aria-expanded', 'true');
	}

	function closeLangMenu() {
		if (!dock) return;
		dock.classList.remove('is-lang-open');
		var btn = dock.querySelector('.nexulesuite_a11y-lang-btn');
		if (btn) btn.setAttribute('aria-expanded', 'false');
	}

	function toggleLangMenu() {
		if (!dock) return;
		if (dock.classList.contains('is-lang-open')) closeLangMenu();
		else {
			if (open) closePanel();
			openLangMenu();
		}
	}

	function openPanel() {
		open = true;
		closeLangMenu();
		panel.classList.add('is-open');
		fab.setAttribute('aria-expanded', 'true');
	}

	function closePanel() {
		open = false;
		panel.classList.remove('is-open');
		fab.setAttribute('aria-expanded', 'false');
	}

	function togglePanel() {
		if (open) closePanel();
		else openPanel();
	}

	function buildMask() {
		maskBand = el('div', { className: 'nexulesuite_a11y-mask__band' });
		var top = el('div', { className: 'nexulesuite_a11y-mask__top' });
		var bottom = el('div', { className: 'nexulesuite_a11y-mask__bottom' });
		mask = el('div', { className: 'nexulesuite_a11y-mask', 'aria-hidden': 'true' }, [top, maskBand, bottom]);
		document.documentElement.appendChild(mask);

		document.addEventListener(
			'mousemove',
			function (e) {
				if (!state.readingMask) return;
				var h = 90;
				var y = Math.max(0, e.clientY - h / 2);
				maskBand.style.top = y + 'px';
				top.style.top = '0';
				top.style.height = y + 'px';
				bottom.style.top = y + h + 'px';
				bottom.style.bottom = '0';
				bottom.style.height = Math.max(0, window.innerHeight - (y + h)) + 'px';
			},
			{ passive: true }
		);
	}

	var fab;
	var dock;

	function initA11y() {
		var wantsChatDock = !!cfg.liveChatAvailable;
		var wantsCustomDock = !!(cfg.customButtonEnabled && cfg.customButtonUrl);
		if (!cfg.accessibilityEnabled && !wantsChatDock && !wantsCustomDock) return;

		if (cfg.accessibilityEnabled) {
			loadState();
			buildMask();
			panel = buildPanel();
		}

		var pos = cfg.buttonPosition || 'right';
		var btnSizeRaw = parseInt(cfg.buttonSize, 10);
		var btnSize = Math.max(0, Math.min(100, isNaN(btnSizeRaw) ? 52 : btnSizeRaw));
		var iconSize = parseInt(cfg.buttonIconSize, 10);
		if (isNaN(iconSize)) iconSize = Math.round(btnSize * 0.5);
		iconSize = Math.max(0, Math.min(100, iconSize));
		var btnGap = parseInt(cfg.buttonGap, 10);
		if (isNaN(btnGap)) btnGap = 10;
		btnGap = Math.max(0, Math.min(100, btnGap));
		dock = el('div', {
			className: 'nexulesuite_a11y-dock nexulesuite_a11y-dock--' + pos,
		});
		dock.style.setProperty('--nls-a11y-btn-size', btnSize + 'px');
		dock.style.setProperty('--nls-a11y-icon-size', iconSize + 'px');
		dock.style.setProperty('--nls-a11y-gap', btnGap + 'px');
		applyButtonColors(dock);
		document.documentElement.setAttribute('data-nls-a11y-pos', pos);
		document.documentElement.style.setProperty('--nls-a11y-dock-btn', btnSize + 'px');

		fab = null;
		if (cfg.accessibilityEnabled) {
			var a11yTip = t('accessibility', 'Accessibility');
			fab = el('button', {
				type: 'button',
				className: 'nexulesuite_a11y-fab',
				'aria-label': t('openPanel', 'Open accessibility options'),
				'aria-expanded': 'false',
				'aria-controls': 'nexulesuite-a11y-panel',
				onClick: togglePanel,
				html:
					'<img class="nexulesuite_a11y-fab__icon" src="' +
					((cfg.icons && cfg.icons.accessibility) || '') +
					'" alt="" width="26" height="26" decoding="async" />' +
					dockTipHtml(a11yTip),
			});
		}

		var stack = buildDockStack(fab);
		if (!stack.childNodes.length) {
			hideOrphanLiveChatTrigger();
			return;
		}
		dock.appendChild(stack);
		applyButtonOffset(dock, stack._nlsVisibleKeys || []);

		root.appendChild(dock);
		if (cfg.accessibilityEnabled && panel) {
			panel.id = 'nexulesuite-a11y-panel';
			if (dockButtonVisible('accessibility')) {
				root.appendChild(panel);
			}
			applyState();
		}
		syncLangChips(currentLang());

		/* Live chat may render after a11y boot — retry attach briefly. */
		if (cfg.liveChatAvailable && dockButtonVisible('chat') && stack && !dock.querySelector('#nexulesuite_chat-trigger')) {
			var tries = 0;
			var timer = setInterval(function () {
				tries += 1;
				attachLiveChatToDock(stack);
				if (dock.querySelector('#nexulesuite_chat-trigger') || tries > 40) {
					clearInterval(timer);
					if (!dock.querySelector('#nexulesuite_chat-trigger')) {
						hideOrphanLiveChatTrigger();
					}
				}
			}, 250);
		} else if (!dockButtonVisible('chat')) {
			hideOrphanLiveChatTrigger();
		}

		document.addEventListener('keydown', function (e) {
			if (e.key !== 'Escape') return;
			if (dock && dock.classList.contains('is-lang-open')) {
				closeLangMenu();
				return;
			}
			if (cfg.accessibilityEnabled && open) closePanel();
		});
		document.addEventListener('click', function (e) {
			if (dock && !dock.contains(e.target)) {
				closeLangMenu();
			}
			if (!cfg.accessibilityEnabled || !open || !panel) return;
			if (panel.contains(e.target) || (dock && dock.contains(e.target))) return;
			closePanel();
		});
	}

	function initLangOnlyBar() {
		if (!cfg.languageEnabled) return;
		if (!dockButtonVisible('language')) return;
		/* When accessibility or dock features are on, language sits in the shared dock — no separate bar. */
		if (cfg.accessibilityEnabled) return;
		if (cfg.liveChatAvailable) return;
		if (cfg.customButtonEnabled && cfg.customButtonUrl) return;
		var bar = buildLangSection(false);
		if (bar && bar.setAttribute) bar.setAttribute('data-nls-dock-btn', 'language');
		applyButtonOffset(bar, ['language']);
		root.appendChild(bar);
		syncLangChips(currentLang());
	}

	window.nexulesuite_googleTranslateInit = function () {
		if (!window.google || !google.translate) return;
		if (window.__nexulesuite_gt_ready) return;
		window.__nexulesuite_gt_ready = true;

		new google.translate.TranslateElement(
			{
				pageLanguage: cfg.defaultLanguage || 'en',
				includedLanguages: (cfg.languages || []).map(function (l) {
					return l.code;
				}).join(','),
				autoDisplay: false,
				multilanguagePage: true,
				layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
			},
			'nexulesuite_google_translate_element'
		);

		/* Do NOT call selectLanguage() here — cookie already applied by GT; re-firing causes flicker. */
		killTranslateChrome();
		syncLangChips(currentLang());
	};

	function applyButtonColors(target) {
		if (!target) return;
		var a11yBg = cfg.accessibilityButtonBg || '#0f766e';
		var a11yText = cfg.accessibilityButtonText || '#ffffff';
		var langBg = cfg.languageButtonBg || a11yBg;
		var langText = cfg.languageButtonText || a11yText;
		var customBg = cfg.customButtonBg || '#2563eb';
		var customText = cfg.customButtonText || '#ffffff';
		target.style.setProperty('--nls-a11y-accent', a11yBg);
		target.style.setProperty('--nls-a11y-btn-bg', a11yBg);
		target.style.setProperty('--nls-a11y-btn-text', a11yText);
		target.style.setProperty('--nls-lang-btn-bg', langBg);
		target.style.setProperty('--nls-lang-btn-text', langText);
		target.style.setProperty('--nls-custom-btn-bg', customBg);
		target.style.setProperty('--nls-custom-btn-text', customText);
		target.style.setProperty('--nls-chat-btn-bg', cfg.liveChatButtonBg || '#2563eb');
		target.style.setProperty('--nls-chat-btn-text', cfg.liveChatButtonText || '#ffffff');
		target.style.setProperty('--nls-chat-btn-icon', resolveDockIconPx() + 'px');
	}

	function getButtonOffset(key) {
		var map = cfg.dockButtonOffsets && typeof cfg.dockButtonOffsets === 'object' ? cfg.dockButtonOffsets : {};
		var item = map[key] && typeof map[key] === 'object' ? map[key] : null;
		var ox = item ? parseInt(item.x, 10) : parseInt(cfg.buttonOffsetX, 10);
		var oy = item ? parseInt(item.y, 10) : parseInt(cfg.buttonOffsetY, 10);
		if (isNaN(ox)) ox = parseInt(cfg.buttonOffsetX, 10) || 0;
		if (isNaN(oy)) oy = parseInt(cfg.buttonOffsetY, 10) || 0;
		return {
			x: Math.max(-2000, Math.min(2000, ox)),
			y: Math.max(-2000, Math.min(2000, oy)),
		};
	}

	function applyButtonOffset(target, visibleKeys) {
		if (!target) return;
		var unit = cfg.buttonOffsetUnit === 'em' ? 'em' : 'px';
		var keys = Array.isArray(visibleKeys) ? visibleKeys : [];
		var anchorKey = keys.length ? keys[keys.length - 1] : 'accessibility';
		var anchor = getButtonOffset(anchorKey);
		target.style.setProperty('--nls-a11y-offset-x', anchor.x + unit);
		target.style.setProperty('--nls-a11y-offset-y', anchor.y + unit);

		keys.forEach(function (key) {
			var node = target.querySelector('[data-nls-dock-btn="' + key + '"]');
			if (!node) return;
			var o = getButtonOffset(key);
			node.style.setProperty('--nls-btn-ox', o.x - anchor.x + unit);
			node.style.setProperty('--nls-btn-oy', o.y - anchor.y + unit);
		});
	}

	function boot() {
		root = document.getElementById('nexulesuite_a11y-root');
		if (!root) return;
		root.classList.add('skiptranslate');
		root.setAttribute('translate', 'no');
		/* Mount on <html> so body filters (invert/dark/etc.) never break position:fixed. */
		if (root.parentNode !== document.documentElement) {
			document.documentElement.appendChild(root);
		}
		applyButtonColors(root);
		initA11y();
		initLangOnlyBar();
		if (cfg.languageEnabled) {
			watchTranslateChrome();
			syncLangChips(currentLang());
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', boot);
	} else {
		boot();
	}
})();
