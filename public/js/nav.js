const THEME_TRANSITION_CLASS = 'theme-transitioning';
const VALID_THEMES = ['dark', 'light', 'auto'];
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const THEME_FAVICONS = {
	dark: '/favicons/web-app-manifest-192x192.png',
	light: '/favicons/favicon-96x96.png',
	auto: '/favicons/favicon-96x96.png'
};
const OVERLAY_NAV_HTML = `<div class="overlay-navigation">
<nav role="navigation">
<ul>
<li><a href="index.html" data-content="start over">home</a></li>
<li><a href="intro-1.html" data-content="hmmmmmm">about me</a></li>
<li><a href="#" data-content="things; though, never built!">revit</a></li>
<li><a href="#" data-content="simple things">stuff</a></li>
<li><a href="#" data-content="coffee's on me">call me</a></li>
</ul>
</nav>
</div>`;
const OVERLAY_OPEN_CLASSES = ['slide-in-nav-item', 'slide-in-nav-item-delay-1', 'slide-in-nav-item-delay-2', 'slide-in-nav-item-delay-3', 'slide-in-nav-item-delay-4'];
const OVERLAY_CLOSE_CLASSES = ['slide-in-nav-item-reverse', 'slide-in-nav-item-delay-1-reverse', 'slide-in-nav-item-delay-2-reverse', 'slide-in-nav-item-delay-3-reverse', 'slide-in-nav-item-delay-4-reverse'];
const OVERLAY_CLOSE_DELAY_MS = 1200;

let themeTransitionTimeoutId = null;
let themePickerAnimationTimeoutId = null;

function isReducedMotionPreferred() {
	return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getStoredTheme() {
	try {
		const theme = localStorage.getItem('theme');
		return VALID_THEMES.includes(theme) ? theme : null;
	} catch {
		// ignore storage errors
		return null;
	}
}

function saveTheme(theme) {
	try {
		localStorage.setItem('theme', theme);
	} catch {
		// ignore storage errors
	}

}

function resolveTheme(theme) {
	return theme === 'auto'
		? window.matchMedia(COLOR_SCHEME_QUERY).matches
			? 'dark'
			: 'light'
		: theme;
}

function isThemeValid(theme) {
	return VALID_THEMES.includes(theme);
}

function isThemeAlreadyApplied(theme, resolvedTheme) {
	const currentTheme = document.documentElement.getAttribute('data-theme');
	return currentTheme === resolvedTheme && theme === getStoredTheme();
}

function updateThemeButtonState(theme) {
	document.querySelectorAll('button[data-theme-toggle]').forEach(button => {
		button.setAttribute('aria-pressed', button.dataset.themeToggle === theme ? 'true' : 'false');
	});
}

function updateFavicon(theme) {
	const favicon = document.getElementById('favicon') || document.querySelector('link[rel="icon"]');
	if (!favicon) return;
	favicon.href = THEME_FAVICONS[theme] || THEME_FAVICONS.light;
}

function resetElementAnimations(selector, animations) {
	document.querySelectorAll(selector).forEach((element, index) => {
		const animation = animations[index] ?? animations[animations.length - 1];
		element.style.animation = 'none';
		void element.offsetWidth;
		element.style.animation = animation;
	});
}

function replayTextAnimations() {
	resetElementAnimations('.text-with-animation span', [
		'word-animation 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards',
		'word-animation 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.5s forwards'
	]);

	resetElementAnimations('.subtext-with-animation span', [
		'word-animation-1 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards',
		'word-animation-1 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.5s forwards'
	]);

	resetElementAnimations('.subtext-with-animation-1', [
		'word-animation-2 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.50s forwards',
	]);
}

function clearThemePickerAnimation() {
	clearTimeout(themePickerAnimationTimeoutId);
	themePickerAnimationTimeoutId = null;

	const themeSwitcher = document.querySelector('.theme-switcher');
	if (!themeSwitcher) return;

	themeSwitcher.classList.remove('is-animating');
	themeSwitcher.querySelectorAll('button[data-theme-toggle]').forEach(btn => {
		btn.classList.remove('is-incoming', 'is-outgoing');
	});
}

function animateThemePicker(nextTheme) {
	if (isReducedMotionPreferred()) {
		clearThemePickerAnimation();
		return;
	}

	const themeSwitcher = document.querySelector('.theme-switcher');
	if (!themeSwitcher) return;

	const currentButton = themeSwitcher.querySelector('button[data-theme-toggle][aria-pressed="true"]');
	const nextButton = themeSwitcher.querySelector(`button[data-theme-toggle="${nextTheme}"]`);

	clearThemePickerAnimation();
	themeSwitcher.classList.add('is-animating');

	if (currentButton && currentButton !== nextButton) {
		currentButton.classList.add('is-outgoing');
	}

	if (nextButton) {
		nextButton.classList.add('is-incoming');
	}

	themePickerAnimationTimeoutId = setTimeout(clearThemePickerAnimation, 0);
}

function applyThemeState(resolvedTheme, theme) {
	document.documentElement.setAttribute('data-theme', resolvedTheme);
	saveTheme(theme);
	updateFavicon(resolvedTheme);
	updateThemeButtonState(theme);
}

function isOverlayOpen() {
	return document.querySelector('.overlay-navigation')?.classList.contains('overlay-active');
}

function animateHamburgerButton(opening) {
	const topBar = document.querySelector('.bar-top');
	const middleBar = document.querySelector('.bar-middle');
	const bottomBar = document.querySelector('.bar-bottom');
	if (!topBar || !middleBar || !bottomBar) return;

	const toggle = (element, removeClass, addClass) => {
		element.classList.remove(removeClass);
		element.classList.remove(addClass);
		void element.offsetWidth;
		element.classList.add(addClass);
	};

	if (opening) {
		toggle(topBar, 'animate-out-top-bar', 'animate-top-bar');
		toggle(middleBar, 'animate-out-middle-bar', 'animate-middle-bar');
		toggle(bottomBar, 'animate-out-bottom-bar', 'animate-bottom-bar');
	} else {
		toggle(topBar, 'animate-top-bar', 'animate-out-top-bar');
		toggle(middleBar, 'animate-middle-bar', 'animate-out-middle-bar');
		toggle(bottomBar, 'animate-middle-bar', 'animate-out-bottom-bar');
	}
}

function addOverlayOpenClasses(overlayNavigation) {
	overlayNavigation.querySelectorAll('nav li').forEach((item, index) => {
		if (index < OVERLAY_OPEN_CLASSES.length) {
			item.classList.add(OVERLAY_OPEN_CLASSES[index]);
		}
	});
}

function addOverlayCloseClasses(overlayNavigation) {
	const navItems = [...overlayNavigation.querySelectorAll('nav li')];
	const lastIndex = Math.min(navItems.length, OVERLAY_CLOSE_CLASSES.length) - 1;

	navItems.forEach((item, index) => {
		if (index >= OVERLAY_CLOSE_CLASSES.length) return;
		item.classList.remove(OVERLAY_OPEN_CLASSES[index]);
		item.classList.add(OVERLAY_CLOSE_CLASSES[lastIndex - index]);
	});
}

function openOverlayNavigation() {
	if (isOverlayOpen()) return;

	document.body.insertAdjacentHTML('afterbegin', OVERLAY_NAV_HTML);
	const overlayNavigation = document.querySelector('.overlay-navigation');
	if (!overlayNavigation) return;

	overlayNavigation.classList.add('overlay-active');
	overlayNavigation.getBoundingClientRect();
	overlayNavigation.classList.add('overlay-slide-down');

	const openOverlay = document.querySelector('.open-overlay');
	if (openOverlay) {
		openOverlay.setAttribute('aria-label', 'Close navigation menu');
		openOverlay.setAttribute('aria-expanded', 'true');
	}

	animateHamburgerButton(true);
	addOverlayOpenClasses(overlayNavigation);
}

function closeOverlayNavigation() {
	const overlayNavigation = document.querySelector('.overlay-navigation');
	if (!overlayNavigation) return;

	const openOverlay = document.querySelector('.open-overlay');
	if (openOverlay) {
		openOverlay.setAttribute('aria-label', 'Open navigation menu');
		openOverlay.setAttribute('aria-expanded', 'false');
	}

	animateHamburgerButton(false);
	addOverlayCloseClasses(overlayNavigation);

	setTimeout(() => {
		overlayNavigation.classList.replace('overlay-slide-down', 'overlay-slide-up');
		overlayNavigation.addEventListener(
			'transitionend',
			() => overlayNavigation.remove(),
			{ once: true }
		);
	}, OVERLAY_CLOSE_DELAY_MS);
}

let navEventsAttached = false;

function handleOverlayToggle() {
	if (isOverlayOpen()) {
		closeOverlayNavigation();
	} else {
		openOverlayNavigation();
	}
}

function handleDocumentClick(event) {
	const themeToggleButton = event.target.closest('[data-theme-toggle]');
	if (themeToggleButton) {
		event.preventDefault();
		setTheme(themeToggleButton.dataset.themeToggle);
		return;
	}

	const openOverlayButton = event.target.closest('.open-overlay');
	if (openOverlayButton) {
		event.preventDefault();
		handleOverlayToggle();
	}
}

function handleDocumentKeydown(event) {
	if (!event.target.closest('.open-overlay')) return;
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		handleOverlayToggle();
	}
}

function attachNavEventHandlers() {
	if (navEventsAttached) return;
	navEventsAttached = true;

	document.addEventListener('click', handleDocumentClick);
	document.addEventListener('keydown', handleDocumentKeydown);
}

function initNavPage() {
	attachNavEventHandlers();
}

function setTheme(theme) {
	if (!isThemeValid(theme)) return;

	const resolvedTheme = resolveTheme(theme);
	const overlayWasOpen = isOverlayOpen();

	if (isThemeAlreadyApplied(theme, resolvedTheme)) {
		updateThemeButtonState(theme);
		updateFavicon(resolvedTheme);
		clearThemePickerAnimation();
		return;
	}

	animateThemePicker(theme);

	if (overlayWasOpen) {
		closeOverlayNavigation();
	}

	if (isReducedMotionPreferred() || overlayWasOpen) {
		applyThemeState(resolvedTheme, theme);
		return;
	}

	clearTimeout(themeTransitionTimeoutId);
	document.documentElement.classList.add(THEME_TRANSITION_CLASS);

	const endTransition = delayMs => {
		clearTimeout(themeTransitionTimeoutId);
		themeTransitionTimeoutId = setTimeout(() => {
			document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
		}, delayMs);
	};

	if (document.startViewTransition) {
		try {
			const transition = document.startViewTransition(() => {
				document.documentElement.setAttribute('data-theme', resolvedTheme);
				saveTheme(theme);
			});

			transition.finished
				.then(() => {
					updateFavicon(resolvedTheme);
					updateThemeButtonState(theme);
					setTimeout(replayTextAnimations, 0);
					endTransition(0);
				})
				.catch(() => {
					document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
				});

			return;
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('View transition error:', error);
			document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
		}
	}

	applyThemeState(resolvedTheme, theme);
	setTimeout(replayTextAnimations, 0);
	endTransition(0);
}

document.addEventListener('page:transitioned', () => {
	updateThemeButtonState(getStoredTheme() || 'auto');
	initNavPage();
	setTimeout(replayTextAnimations, 0);
});

document.addEventListener('DOMContentLoaded', () => {
	const storedTheme = getStoredTheme();
	const theme = storedTheme || 'auto';

	if (!storedTheme) {
		saveTheme(theme);
	}

	const resolvedTheme = resolveTheme(theme);
	document.documentElement.setAttribute('data-theme', resolvedTheme);
	updateThemeButtonState(theme);
	updateFavicon(resolvedTheme);
	initNavPage();
	setTimeout(replayTextAnimations, 0);
});

window.addEventListener('popstate', () => location.reload());
