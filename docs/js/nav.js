// Theme management functions
function isValidTheme(theme) {
	return ['dark', 'light'].includes(theme);
}

function getDefaultTheme() {
	return 'dark';
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
		input.checked = (input.value === theme);
	});
}

function setTheme(theme) {
	if (!isValidTheme(theme)) return;

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const overlayNavigation = document.querySelector('.overlay-navigation');
	const isNavOpen = overlayNavigation && overlayNavigation.classList.contains('overlay-active');

	if (isNavOpen && typeof $ === 'function') {
		$('.open-overlay').trigger('click');
	}

	if (prefersReducedMotion.matches || isNavOpen) {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
		updateFavicon(theme);
		setActiveThemeButton(theme);
		return;
	}

	if (document.startViewTransition) {
		try {
			const transition = document.startViewTransition(() => {
				document.documentElement.setAttribute('data-theme', theme);
				localStorage.setItem('theme', theme);
			});
			transition.finished.then(() => {
				updateFavicon(theme);
				setActiveThemeButton(theme);
			});
			return;
		} catch (e) {
			console.error('View transition error:', e);
		}
	}

	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem('theme', theme);
	updateFavicon(theme);
	setActiveThemeButton(theme);
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
	if (typeof $ !== 'function' || !$('.open-overlay').length) return;

	$('.open-overlay').off('click').click(function () {
		var overlay_navigation = $('.overlay-navigation'),
			nav_item_1 = $('nav li:nth-of-type(1)'),
			nav_item_2 = $('nav li:nth-of-type(2)'),
			nav_item_3 = $('nav li:nth-of-type(3)'),
			nav_item_4 = $('nav li:nth-of-type(4)'),
			nav_item_5 = $('nav li:nth-of-type(5)'),
			top_bar = $('.bar-top'),
			middle_bar = $('.bar-middle'),
			bottom_bar = $('.bar-bottom');

		overlay_navigation.toggleClass('overlay-active');
		if (overlay_navigation.hasClass('overlay-active')) {
			top_bar.removeClass('animate-out-top-bar').addClass('animate-top-bar');
			middle_bar.removeClass('animate-out-middle-bar').addClass('animate-middle-bar');
			bottom_bar.removeClass('animate-out-bottom-bar').addClass('animate-bottom-bar');
			overlay_navigation.removeClass('overlay-slide-up').addClass('overlay-slide-down');
			nav_item_1.removeClass('slide-in-nav-item-reverse').addClass('slide-in-nav-item');
			nav_item_2.removeClass('slide-in-nav-item-delay-1-reverse').addClass('slide-in-nav-item-delay-1');
			nav_item_3.removeClass('slide-in-nav-item-delay-2-reverse').addClass('slide-in-nav-item-delay-2');
			nav_item_4.removeClass('slide-in-nav-item-delay-3-reverse').addClass('slide-in-nav-item-delay-3');
			nav_item_5.removeClass('slide-in-nav-item-delay-4-reverse').addClass('slide-in-nav-item-delay-4');
		} else {
			top_bar.removeClass('animate-top-bar').addClass('animate-out-top-bar');
			middle_bar.removeClass('animate-middle-bar').addClass('animate-out-middle-bar');
			bottom_bar.removeClass('animate-bottom-bar').addClass('animate-out-bottom-bar');
			overlay_navigation.removeClass('overlay-slide-down').addClass('overlay-slide-up');
			nav_item_1.removeClass('slide-in-nav-item').addClass('slide-in-nav-item-reverse');
			nav_item_2.removeClass('slide-in-nav-item-delay-1').addClass('slide-in-nav-item-delay-1-reverse');
			nav_item_3.removeClass('slide-in-nav-item-delay-2').addClass('slide-in-nav-item-delay-2-reverse');
			nav_item_4.removeClass('slide-in-nav-item-delay-3').addClass('slide-in-nav-item-delay-3-reverse');
			nav_item_5.removeClass('slide-in-nav-item-delay-4').addClass('slide-in-nav-item-delay-4-reverse');
		}
	});
}

function initializeEventListeners() {
	bindThemeInputs();
	bindInternalLinks();
	bindOverlayNavigation();
}

// Navigation with View Transitions
async function navigateWithTransition(url) {
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (!document.startViewTransition || prefersReducedMotion) {
		window.location.href = url;
		return;
	}

	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error('Navigation failed');

		const html = await response.text();
		const parser = new DOMParser();
		const newDocument = parser.parseFromString(html, 'text/html');

		const transition = document.startViewTransition(() => {
			document.body.innerHTML = newDocument.body.innerHTML;
			document.title = newDocument.title;

			const currentStylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
			const newStylesheets = Array.from(newDocument.querySelectorAll('link[rel="stylesheet"]'));

			const currentHrefs = currentStylesheets.map(link => link.getAttribute('href'));
			const newHrefs = newStylesheets.map(link => link.getAttribute('href'));

			if (JSON.stringify(currentHrefs) !== JSON.stringify(newHrefs)) {
				currentStylesheets.forEach(link => {
					if (!newHrefs.includes(link.getAttribute('href'))) {
						link.remove();
					}
				});

				newStylesheets.forEach(link => {
					if (!currentHrefs.includes(link.getAttribute('href'))) {
						document.head.appendChild(link.cloneNode(true));
					}
				});
			}
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