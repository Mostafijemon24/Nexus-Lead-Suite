(function () {
	'use strict';

	var btn = document.getElementById('nexus-ls-client-pdf');
	var msgEl = document.getElementById('nexus-ls-client-pdf-msg');
	if (!btn || typeof nexusLsClientPdfCfg !== 'object') {
		return;
	}

	var cfg = nexusLsClientPdfCfg;

	btn.addEventListener('click', function () {
		if (msgEl) {
			msgEl.textContent = '';
			msgEl.setAttribute('hidden', '');
		}
		btn.disabled = true;
		fetch(cfg.pdfUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'omit',
			body: JSON.stringify({
				token: cfg.token,
				tab: cfg.tab,
				dateFrom: cfg.dateFrom,
				dateTo: cfg.dateTo,
				search: cfg.search
			})
		})
			.then(function (res) {
				return res.json().then(function (j) {
					return { res: res, j: j };
				});
			})
			.then(function (x) {
				var pdf = x.j && x.j.data && x.j.data.pdf_url;
				if (!x.res.ok || !pdf) {
					if (msgEl) {
						msgEl.textContent =
							x.j && x.j.message ? String(x.j.message) : cfg.errorMsg || '';
						msgEl.removeAttribute('hidden');
					}
					return;
				}
				window.open(pdf, '_blank', 'noopener,noreferrer');
			})
			.catch(function () {
				if (msgEl) {
					msgEl.textContent = cfg.errorMsg || '';
					msgEl.removeAttribute('hidden');
				}
			})
			.then(function () {
				btn.disabled = false;
			});
	});
})();
