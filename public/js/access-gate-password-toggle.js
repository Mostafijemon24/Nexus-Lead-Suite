(function () {
	'use strict';

	document.querySelectorAll('[data-nexulesuite_gate]').forEach(function (wrap) {
		var input = wrap.querySelector('[data-nexulesuite_gate-pass]');
		var toggle = wrap.querySelector('[data-nexulesuite_gate-toggle]');
		var eyeOn = wrap.querySelector('[data-nexulesuite_gate-eye-on]');
		var eyeOff = wrap.querySelector('[data-nexulesuite_gate-eye-off]');
		if (!input || !toggle || !eyeOn || !eyeOff) {
			return;
		}

		// readonly on first paint blocks browser WordPress-login autofill; focus enables typing.
		function enableInput() {
			input.removeAttribute('readonly');
		}
		input.addEventListener('focus', enableInput, { once: true });
		input.addEventListener('mousedown', enableInput, { once: true });
		input.addEventListener('touchstart', enableInput, { once: true, passive: true });

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
