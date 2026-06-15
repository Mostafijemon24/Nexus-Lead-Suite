(function () {
	'use strict';

	document.querySelectorAll('[data-nexus-ls-gate]').forEach(function (wrap) {
		var input = wrap.querySelector('[data-nexus-ls-gate-pass]');
		var toggle = wrap.querySelector('[data-nexus-ls-gate-toggle]');
		var eyeOn = wrap.querySelector('[data-nexus-ls-gate-eye-on]');
		var eyeOff = wrap.querySelector('[data-nexus-ls-gate-eye-off]');
		if (!input || !toggle || !eyeOn || !eyeOff) {
			return;
		}
		toggle.addEventListener('click', function () {
			var show = input.type === 'password';
			input.type = show ? 'text' : 'password';
			eyeOn.style.display = show ? 'none' : 'inline';
			eyeOff.style.display = show ? 'inline' : 'none';
			toggle.setAttribute(
				'aria-label',
				show ? toggle.getAttribute('data-label-hide') || 'Hide password' : toggle.getAttribute('data-label-show') || 'Show password'
			);
		});
	});
})();
