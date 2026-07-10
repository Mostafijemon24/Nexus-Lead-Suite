(function () {
	'use strict';

	var btn = document.getElementById('nexulesuite_client-pdf');
	var printBtn = document.getElementById('nexulesuite_client-print');
	var msgEl = document.getElementById('nexulesuite_client-pdf-msg');
	if (typeof nexulesuite_ClientPdfCfg !== 'object') {
		return;
	}

	var cfg = nexulesuite_ClientPdfCfg;

	/* The print view renders the same report with a print stylesheet; the browser shapes
	   scripts the embedded PDF font cannot, so this is the path for non-Latin text. */
	if (printBtn) {
		printBtn.addEventListener('click', function () {
			var url = new URL(window.location.href);
			url.searchParams.set('print', '1');
			window.open(url.toString(), '_blank', 'noopener,noreferrer');
		});
	}

	if (!btn) {
		return;
	}

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
				search: cfg.search,
				sections: cfg.sections || []
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
