(function () {
	var letters = ['s', 'u', 'p', 'p', 'a'];
	var curveRises = ['1.8vmin', '2.4vmin', '3vmin', '2.4vmin', '1.8vmin'];

	function populateCurve() {
		var upContainer = document.getElementById('name-up');
		var downContainer = document.getElementById('name-down');

		if (!upContainer || !downContainer) {
			return;
		}

		// Clear existing content
		upContainer.textContent = '';
		downContainer.textContent = '';

		for (var i = 0; i < letters.length; i++) {
			var upSpan = document.createElement('span');
			upSpan.className = 'curve-char';
			upSpan.textContent = letters[i];
			upSpan.style.setProperty('--curve-rise', curveRises[i]);
			upContainer.appendChild(upSpan);

			var downSpan = document.createElement('span');
			downSpan.className = 'curve-char';
			downSpan.textContent = letters[i];
			downSpan.style.setProperty('--curve-rise', curveRises[i]);
			downContainer.appendChild(downSpan);
		}
	}

	// Populate on initial load
	populateCurve();

	// Re-populate on page transitions and visibility changes
	document.addEventListener('pageshow', populateCurve);
	document.addEventListener('visibilitychange', function () {
		if (!document.hidden) {
			// Use a small delay to ensure DOM is ready
			setTimeout(populateCurve, 0);
		}
	});

	// Watch the curve-container for changes during transitions
	var observer = new MutationObserver(function () {
		var upContainer = document.getElementById('name-up');
		if (upContainer && upContainer.children.length === 0) {
			populateCurve();
		}
	});

	var curveContainer = document.querySelector('.curve-container');
	if (curveContainer) {
		observer.observe(curveContainer, {
			childList: true,
			subtree: true
		});
	}
})();
