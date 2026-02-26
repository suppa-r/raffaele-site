document.addEventListener('DOMContentLoaded', () => {
	// Element declarations to match HTML structure
	const themeButtons = document.querySelectorAll('.theme-label');
	const themeInputs = document.querySelectorAll('input[name="theme"]');
	const colorPicker = document.querySelector('.color-picker');
	const bars = document.querySelector('.menu-btn');
	const navigation = document.querySelector('.navigation');
	const nav = document.querySelector('.nav-links');
	const navLinksTabs = document.querySelectorAll('.nav-links a[data-tab]');
	const dataTabs = document.querySelectorAll('.data-tab.genesis, .data-tab.early, .data-tab.beginnings, .data-tab.ryerson')
		;
	const profileheader = document.querySelector('.profile-header-img');
	const THEME_TRANSITION_CLASS = 'theme-transitioning';
	const THEME_TRANSITION_MS = 700;
	const THEME_PICKER_ANIMATION_MS = 380;
	let themeTransitionTimeoutId = null;
	let themePickerAnimationTimeoutId = null;

	// Helper functions
	function getDefaultTheme() {
		const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
		return prefersLight ? 'light' : 'dark';
	}
	function isValidTheme(theme) {
		return ['dark', 'light'].includes(theme);
	}
	function setActiveThemeButton(theme) {
		themeInputs.forEach(input => {
			const isChecked = input.value === theme;
			input.checked = isChecked;
			const label = input.closest('.theme-label');
			if (label) {
				label.classList.toggle('active', isChecked);
				label.classList.toggle('checked', isChecked);
			}
		});
	}
	function startThemeTransition() {
		if (themeTransitionTimeoutId) {
			clearTimeout(themeTransitionTimeoutId);
			themeTransitionTimeoutId = null;
		}
		document.documentElement.classList.add(THEME_TRANSITION_CLASS);
	}
	function endThemeTransition() {
		if (themeTransitionTimeoutId) {
			clearTimeout(themeTransitionTimeoutId);
			themeTransitionTimeoutId = null;
		}
		document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
	}
	function endThemeTransitionAfterDelay(delayMs) {
		if (themeTransitionTimeoutId) {
			clearTimeout(themeTransitionTimeoutId);
		}
		themeTransitionTimeoutId = window.setTimeout(() => {
			document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
			themeTransitionTimeoutId = null;
		}, delayMs);
	}
	function clearThemePickerAnimation() {
		if (themePickerAnimationTimeoutId) {
			clearTimeout(themePickerAnimationTimeoutId);
			themePickerAnimationTimeoutId = null;
		}

		if (!colorPicker) return;

		colorPicker.classList.remove('is-animating');
		colorPicker.querySelectorAll('.theme-label').forEach(label => {
			label.classList.remove('is-incoming', 'is-outgoing');
		});
	}
	function animateThemePicker(nextTheme) {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion || !colorPicker) {
			clearThemePickerAnimation();
			return;
		}

		const currentInput = colorPicker.querySelector('input[name="theme"]:checked');
		const nextInput = colorPicker.querySelector(`input[name="theme"][value="${nextTheme}"]`);
		const currentLabel = currentInput ? currentInput.closest('.theme-label') : null;
		const nextLabel = nextInput ? nextInput.closest('.theme-label') : null;

		clearThemePickerAnimation();
		colorPicker.classList.add('is-animating');

		if (currentLabel && currentLabel !== nextLabel) {
			currentLabel.classList.add('is-outgoing');
		}

		if (nextLabel) {
			nextLabel.classList.add('is-incoming');
		}

		themePickerAnimationTimeoutId = window.setTimeout(() => {
			clearThemePickerAnimation();
		}, THEME_PICKER_ANIMATION_MS);
	}
	function updateFavicon(theme) {
		const favicon = document.getElementById("favicon") || document.querySelector("link[rel='icon']");
		if (favicon) {
			const faviconPath = theme === "dark"
				? "/favicons/dark-1.png"
				: "/favicons/light-1.png";
			favicon.href = faviconPath + "?v=" + Date.now();
		}
	}
	function setTheme(theme) {
		if (!isValidTheme(theme)) return;

		const currentTheme = document.documentElement.getAttribute('data-theme');
		if (theme === currentTheme) {
			setActiveThemeButton(theme);
			updateFavicon(theme);
			clearThemePickerAnimation();
			return;
		}

		animateThemePicker(theme);

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			document.documentElement.setAttribute('data-theme', theme);
			localStorage.setItem('theme', theme);
			setActiveThemeButton(theme);
			updateFavicon(theme);
			return;
		}

		startThemeTransition();

		if (document.startViewTransition) {
			try {
				const transition = document.startViewTransition(() => {
					document.documentElement.setAttribute('data-theme', theme);
					localStorage.setItem('theme', theme);
				});

				transition.finished.then(() => {
					setActiveThemeButton(theme);
					updateFavicon(theme);
				}).finally(() => {
					endThemeTransitionAfterDelay(3000);
				});
				return;
			} catch (error) {
				console.error('View transition error:', error);
				endThemeTransitionAfterDelay(3000);
			}
		}

		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
		setActiveThemeButton(theme);
		updateFavicon(theme);
		endThemeTransitionAfterDelay(THEME_TRANSITION_MS);
	}

	// Theme initialization
	let savedTheme = localStorage.getItem('theme');
	if (!savedTheme || !isValidTheme(savedTheme)) {
		savedTheme = getDefaultTheme();
		localStorage.setItem('theme', savedTheme);
	}
	document.documentElement.setAttribute('data-theme', savedTheme);
	setActiveThemeButton(savedTheme);
	updateFavicon(savedTheme);
	// Theme button handlers
	themeInputs.forEach(input => {
		input.addEventListener('change', (event) => {
			setTheme(event.target.value);
		});
	});

	// Navigation menu toggle
	if (bars && navigation && nav) {
		const burger = bars.querySelector('.menu-btn__burger');
		bars.addEventListener('click', (e) => {
			e.stopPropagation();
			bars.classList.toggle('open');
			if (burger) burger.classList.toggle('open');
			navigation.classList.toggle('open');
			nav.classList.toggle('open');
			if (navigation.classList.contains('open')) {
				profileheader.style.display = 'none';
			} else {
				profileheader.style.display = 'block';
			}
			// Hide all dataTabs on menu open
			if (dataTabs) {
				dataTabs.forEach(tab => {
					tab.style.display = 'none';
				});
			}
		});
	}

	// Tab logic
	function showTab(tab) {
		dataTabs.forEach(tabEl => tabEl.classList.remove('open'));
		const showTab = document.querySelector('.data-tab.' + tab);
		if (showTab) showTab.classList.add('open');
	}
	function setActiveNav(tab) {
		navLinksTabs.forEach(l => l.classList.remove('active'));
		const activeLink = document.querySelector('.nav-links a[data-tab="' + tab + '"]');
		if (activeLink) activeLink.classList.add('active');
	}
	navLinksTabs.forEach(link => {
		link.addEventListener('click', function (e) {
			e.preventDefault();
			const tab = this.getAttribute('data-tab');
			setActiveNav(tab);
			showTab(tab);
		});
	});
	// On load, show the first tab and set nav active
	if (navLinksTabs.length > 0) {
		const firstTab = navLinksTabs[0].getAttribute('data-tab');
		setActiveNav(firstTab);
		showTab(firstTab);
	}
	// Hide all dataTabs initially
	if (dataTabs) {
		dataTabs.forEach(tab => tab.style.display = 'none');
	}

	// Close menus/tabs when clicking outside
	document.addEventListener('click', (event) => {
		// Close nav menu if open and click outside
		if (navigation && navigation.classList.contains('open') && !navigation.contains(event.target) && !bars.contains(event.target)) {
			navigation.classList.remove('open');
			nav.classList.remove('open');
			bars.classList.remove('open');
			profileheader.style.display = 'none';
			const burger = bars.querySelector('.menu-btn__burger');
			if (burger) burger.classList.remove('open');
		}
		// Ensure profileheader is displayed when menu is closed
		if (navigation && !navigation.classList.contains('open')) {
			profileheader.style.display = 'block';
		}
		// Hide all dataTabs if open and click outside
		if (dataTabs) {
			dataTabs.forEach(tab => {
				if (tab.classList.contains('open') && !tab.contains(event.target)) {
					tab.classList.remove('open');
					tab.style.display = 'none';
				}
			});
		}
	});
});
