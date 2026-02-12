(function () {
	var letters = ['s', 'u', 'p', 'p', 'a'];
	var curveRises = ['1.2vmin', '1.8vmin', '2.4vmin', '1.8vmin', '1.2vmin'];

	var upContainer = document.getElementById('name-up');
	var downContainer = document.getElementById('name-down');

	if (!upContainer || !downContainer) {
		return;
	}

	if (upContainer.children.length > 0 || downContainer.children.length > 0) {
		return;
	}

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
})();
