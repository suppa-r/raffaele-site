(function () {
	var storedTheme = null;
	try {
		storedTheme = localStorage.getItem('theme');
	} catch (error) {
		storedTheme = null;
	}

	var isValidStoredTheme = storedTheme === 'dark' || storedTheme === 'light';
	var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	var initialTheme = isValidStoredTheme ? storedTheme : (prefersDark ? 'dark' : 'light');

	document.documentElement.setAttribute('data-theme', initialTheme);
})();
