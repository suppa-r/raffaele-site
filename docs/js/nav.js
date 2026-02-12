// Theme management functions
function isValidTheme(theme) {
	return ['dark', 'light'].includes(theme);
}

function getDefaultTheme() {
	return 'dark';
}

const THEME_TRANSITION_CLASS = 'theme-transitioning';
const PAGE_TRANSITION_CLASS = 'page-transitioning';
const THEME_TRANSITION_MS = 700;
let themeTransitionTimeoutId = null;

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

function updateFavicon(theme) {
	const favicon = document.getElementById('favicon') || document.querySelector('link[rel="icon"]');
	if (favicon) {
		favicon.href = theme === 'dark'
			? '/favicons/dark-1.png'
			: '/favicons/light-1.png';
	}
}

function setActiveThemeButton(theme) {
	const themeInputs = document.querySelectorAll('input[name="theme"]');
	themeInputs.forEach(input => {
		const isChecked = (input.value === theme);
		input.checked = isChecked;
		const label = input.closest('label');
		if (label) {
			label.classList.toggle('checked', isChecked);
		}
	});
}

function setTheme(theme) {
	if (!isValidTheme(theme)) return;

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const overlayNavigation = document.querySelector('.overlay-navigation');
	const isNavOpen = overlayNavigation && overlayNavigation.classList.contains('overlay-active');

	if (isNavOpen) {
		const openOverlay = document.querySelector('.open-overlay');
		if (openOverlay) {
			openOverlay.click();
		}
	}

	if (prefersReducedMotion.matches || isNavOpen) {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
		updateFavicon(theme);
		setActiveThemeButton(theme);
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
				updateFavicon(theme);
				setActiveThemeButton(theme);
			}).finally(() => {
				endThemeTransition();
			});
			return;
		} catch (e) {
			console.error('View transition error:', e);
			endThemeTransition();
		}
	}

	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem('theme', theme);
	updateFavicon(theme);
	setActiveThemeButton(theme);
	endThemeTransitionAfterDelay(THEME_TRANSITION_MS);
}

function bindThemeInputs() {
	const themeInputs = document.querySelectorAll('input[name="theme"]');
	themeInputs.forEach(input => {
		if (input.dataset.themeBound === 'true') return;
		input.addEventListener('change', (event) => {
			setTheme(event.target.value);
		});
		input.dataset.themeBound = 'true';
	});
}

function bindInternalLinks() {
	document.querySelectorAll('a[href]').forEach(link => {
		if (link.dataset.navBound === 'true') return;
		const href = link.getAttribute('href');
		if (href &&
			!href.startsWith('#') &&
			!href.startsWith('http') &&
			!href.startsWith('mailto:') &&
			href.endsWith('.html')) {

			link.addEventListener('click', (e) => {
				e.preventDefault();
				navigateWithTransition(link.href);
			});
			link.dataset.navBound = 'true';
		}
	});
}

function bindOverlayNavigation() {
	const openOverlay = document.querySelector('.open-overlay');
	if (!openOverlay) return;

	if (openOverlay._overlayHandler) {
		openOverlay.removeEventListener('click', openOverlay._overlayHandler);
	}

	const handler = () => {
		const overlayNavigation = document.querySelector('.overlay-navigation');
		if (!overlayNavigation) return;

		const navItems = document.querySelectorAll('nav li');
		const topBar = document.querySelector('.bar-top');
		const middleBar = document.querySelector('.bar-middle');
		const bottomBar = document.querySelector('.bar-bottom');

		const isOpen = overlayNavigation.classList.toggle('overlay-active');

		if (isOpen) {
			if (topBar) {
				topBar.classList.remove('animate-out-top-bar');
				topBar.classList.add('animate-top-bar');
			}
			if (middleBar) {
				middleBar.classList.remove('animate-out-middle-bar');
				middleBar.classList.add('animate-middle-bar');
			}
			if (bottomBar) {
				bottomBar.classList.remove('animate-out-bottom-bar');
				bottomBar.classList.add('animate-bottom-bar');
			}
			overlayNavigation.classList.remove('overlay-slide-up');
			overlayNavigation.classList.add('overlay-slide-down');

			const openClasses = [
				'slide-in-nav-item',
				'slide-in-nav-item-delay-1',
				'slide-in-nav-item-delay-2',
				'slide-in-nav-item-delay-3',
				'slide-in-nav-item-delay-4'
			];
			const openReverseClasses = [
				'slide-in-nav-item-reverse',
				'slide-in-nav-item-delay-1-reverse',
				'slide-in-nav-item-delay-2-reverse',
				'slide-in-nav-item-delay-3-reverse',
				'slide-in-nav-item-delay-4-reverse'
			];

			navItems.forEach((item, index) => {
				if (index >= openClasses.length) return;
				item.classList.remove(openReverseClasses[index]);
				item.classList.add(openClasses[index]);
			});
			return;
		}

		if (topBar) {
			topBar.classList.remove('animate-top-bar');
			topBar.classList.add('animate-out-top-bar');
		}
		if (middleBar) {
			middleBar.classList.remove('animate-middle-bar');
			middleBar.classList.add('animate-out-middle-bar');
		}
		if (bottomBar) {
			bottomBar.classList.remove('animate-bottom-bar');
			bottomBar.classList.add('animate-out-bottom-bar');
		}
		overlayNavigation.classList.remove('overlay-slide-down');
		overlayNavigation.classList.add('overlay-slide-up');

		const closeClasses = [
			'slide-in-nav-item-reverse',
			'slide-in-nav-item-delay-1-reverse',
			'slide-in-nav-item-delay-2-reverse',
			'slide-in-nav-item-delay-3-reverse',
			'slide-in-nav-item-delay-4-reverse'
		];
		const closeForwardClasses = [
			'slide-in-nav-item',
			'slide-in-nav-item-delay-1',
			'slide-in-nav-item-delay-2',
			'slide-in-nav-item-delay-3',
			'slide-in-nav-item-delay-4'
		];

		navItems.forEach((item, index) => {
			if (index >= closeClasses.length) return;
			item.classList.remove(closeForwardClasses[index]);
			item.classList.add(closeClasses[index]);
		});
	};

	openOverlay.addEventListener('click', handler);
	openOverlay._overlayHandler = handler;
}

function initializeEventListeners() {
	bindThemeInputs();
	bindInternalLinks();
	bindOverlayNavigation();
}

function startPageTransition() {
	document.documentElement.classList.add(PAGE_TRANSITION_CLASS);
}

function endPageTransition() {
	document.documentElement.classList.remove(PAGE_TRANSITION_CLASS);
}

// Navigation with View Transitions
async function navigateWithTransition(url) {
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (!document.startViewTransition || prefersReducedMotion) {
		window.location.href = url;
		return;
	}

	try {
		startPageTransition();

		const response = await fetch(url);
		if (!response.ok) throw new Error('Navigation failed');

		const html = await response.text();
		const parser = new DOMParser();
		const newDocument = parser.parseFromString(html, 'text/html');

		const transition = document.startViewTransition(async () => {
			const currentStylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
			const newStylesheets = Array.from(newDocument.querySelectorAll('link[rel="stylesheet"]'));

			const currentHrefs = currentStylesheets.map(link => link.getAttribute('href'));
			const newHrefs = newStylesheets.map(link => link.getAttribute('href'));

			if (JSON.stringify(currentHrefs) !== JSON.stringify(newHrefs)) {
				const stylesheetLoadPromises = [];

				newStylesheets.forEach(link => {
					if (!currentHrefs.includes(link.getAttribute('href'))) {
						const clone = link.cloneNode(true);
						const loadPromise = new Promise(resolve => {
							clone.addEventListener('load', resolve, { once: true });
							clone.addEventListener('error', resolve, { once: true });
						});
						stylesheetLoadPromises.push(loadPromise);
						document.head.appendChild(clone);
					}
				});

				if (stylesheetLoadPromises.length > 0) {
					await Promise.all(stylesheetLoadPromises);
				}

				currentStylesheets.forEach(link => {
					if (!newHrefs.includes(link.getAttribute('href'))) {
						link.remove();
					}
				});
			}

			document.body.innerHTML = newDocument.body.innerHTML;
			document.title = newDocument.title;
		});

		await transition.finished;

		const savedTheme = localStorage.getItem('theme') || 'dark';
		document.documentElement.setAttribute('data-theme', savedTheme);
		setActiveThemeButton(savedTheme);
		updateFavicon(savedTheme);
		initializeEventListeners();
		window.history.pushState({}, '', url);
		window.scrollTo(0, 0);
	} catch (e) {
		console.error('Navigation error:', e);
		window.location.href = url;
	} finally {
		endPageTransition();
	}
}

// Theme initialization on page load
document.addEventListener('DOMContentLoaded', () => {
	let savedTheme = localStorage.getItem('theme');

	if (!savedTheme || !isValidTheme(savedTheme)) {
		savedTheme = getDefaultTheme();
		localStorage.setItem('theme', savedTheme);
	}

	document.documentElement.setAttribute('data-theme', savedTheme);
	setActiveThemeButton(savedTheme);
	updateFavicon(savedTheme);

	initializeEventListeners();
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
	location.reload();
});