const THEME_TRANSITION_CLASS = 'theme-transitioning';
const VALID_THEMES = ['dark', 'light', 'auto'];

let themeTransitionTimeoutId = null;
let themePickerAnimationTimeoutId = null;

// --- Theme picker animation ---

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
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		clearThemePickerAnimation();
		return;
	}
	const themeSwitcher = document.querySelector('.theme-switcher');
	if (!themeSwitcher) return;
	const currentButton = themeSwitcher.querySelector('button[data-theme-toggle][aria-pressed="true"]');
	const nextButton = themeSwitcher.querySelector(`button[data-theme-toggle="${nextTheme}"]`);
	clearThemePickerAnimation();
	themeSwitcher.classList.add('is-animating');
	if (currentButton && currentButton !== nextButton) currentButton.classList.add('is-outgoing');
	if (nextButton) nextButton.classList.add('is-incoming');
	// 350ms animation + 50ms buffer
	themePickerAnimationTimeoutId = setTimeout(clearThemePickerAnimation, 0);
}

// --- Theme management ---

function updateFavicon(theme) {
	const favicon = document.getElementById('favicon') || document.querySelector('link[rel="icon"]');
	if (favicon) favicon.href = theme === 'dark' ? '/favicons/web-app-manifest-192x192.png' : '/favicons/favicon-96x96.png';
}

function setActiveThemeButton(theme) {
	document.querySelectorAll('button[data-theme-toggle]').forEach(button => {
		button.setAttribute('aria-pressed', button.dataset.themeToggle === theme ? 'true' : 'false');
	});
}

function replayTextAnimations() {
	// index.html: .text-with-animation spans use word-animation
	const textAnimations = [
		'word-animation 0.5s ease-out 0.1s forwards',
		'word-animation 0.5s ease-out 0.4s forwards',
	];
	document.querySelectorAll('.text-with-animation span').forEach((span, i) => {
		span.style.animation = 'none';
		void span.offsetWidth; // force reflow so the browser restarts the animation
		span.style.animation = textAnimations[i] ?? textAnimations[textAnimations.length - 1];
	});

	// index.html: .subtext-with-animation spans use word-animation-1
	const subtextAnimations = [
		'word-animation-1 0.5s ease-out 0.1s forwards',
		'word-animation-1 0.5s ease-out 0.4s forwards',
	];
	document.querySelectorAll('.subtext-with-animation span').forEach((span, i) => {
		span.style.animation = 'none';
		void span.offsetWidth; // force reflow so the browser restarts the animation
		span.style.animation = subtextAnimations[i] ?? subtextAnimations[subtextAnimations.length - 1];
	});

	// index.html: .subtext-with-animation-1 spans use word-animation-2
	const subtext1Animations = [
		'word-animation-2 0.5s ease-out 0.1s forwards',
		'word-animation-2 0.5s ease-out 0.4s forwards',
	];
	document.querySelectorAll('.subtext-with-animation-1 span').forEach((span, i) => {
		span.style.animation = 'none';
		void span.offsetWidth; // force reflow so the browser restarts the animation
		span.style.animation = subtext1Animations[i] ?? subtext1Animations[subtext1Animations.length - 1];
	});
}

function applyTheme(resolvedTheme, theme) {
	document.documentElement.setAttribute('data-theme', resolvedTheme);
	try { localStorage.setItem('theme', theme); } catch { /* storage unavailable */ }
	updateFavicon(resolvedTheme);
	setActiveThemeButton(theme);
}

function setTheme(theme) {
	if (!VALID_THEMES.includes(theme)) return;

	const resolvedTheme = theme === 'auto'
		? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
		: theme;

	const currentTheme = document.documentElement.getAttribute('data-theme');
	if (resolvedTheme === currentTheme && theme === localStorage.getItem('theme')) {
		setActiveThemeButton(theme);
		updateFavicon(resolvedTheme);
		clearThemePickerAnimation();
		return;
	}

	animateThemePicker(theme);

	// Close nav before transitioning if it's open
	const overlayNavigation = document.querySelector('.overlay-navigation');
	const isNavOpen = overlayNavigation?.classList.contains('overlay-active');
	if (isNavOpen) document.querySelector('.open-overlay')?.click();

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || isNavOpen) {
		applyTheme(resolvedTheme, theme);
		return;
	}

	// Start transition class, then use View Transition API if available
	clearTimeout(themeTransitionTimeoutId);
	document.documentElement.classList.add(THEME_TRANSITION_CLASS);

	const endTransition = (delayMs) => {
		clearTimeout(themeTransitionTimeoutId);
		themeTransitionTimeoutId = setTimeout(() => {
			document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
		}, delayMs);
	};

	if (document.startViewTransition) {
		try {
			const transition = document.startViewTransition(() => {
				document.documentElement.setAttribute('data-theme', resolvedTheme);
				try { localStorage.setItem('theme', theme); } catch { /* storage unavailable */ }
			});
			transition.finished.then(() => {
				updateFavicon(resolvedTheme);
				setActiveThemeButton(theme);
				setTimeout(replayTextAnimations, 0); // delay text animations until theme settles
				endTransition(0);
			}).catch(() => {
				document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
			});
			return;
		} catch (e) {
			console.error('View transition error:', e);
			document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
		}
	}

	applyTheme(resolvedTheme, theme);
	setTimeout(replayTextAnimations, 0); // delay text animations until theme color transitions settle
	endTransition(0);
}

// --- Event binding ---

function bindThemeInputs() {
	document.querySelectorAll('input[name="theme"]').forEach(input => {
		if (input.dataset.themeBound === 'true') return;
		input.addEventListener('change', e => setTheme(e.target.value));
		input.dataset.themeBound = 'true';
	});
}

function bindThemeButtons() {
	document.querySelectorAll('[data-theme-toggle]').forEach(button => {
		if (button.dataset.themeBound === 'true') return;
		button.addEventListener('click', e => setTheme(e.currentTarget.dataset.themeToggle));
		button.dataset.themeBound = 'true';
	});
}

function bindOverlayNavigation() {
	const openOverlay = document.querySelector('.open-overlay');
	if (!openOverlay) return;

	// Clean up any previous listener before rebinding (needed after SPA navigation)
	openOverlay._overlayAbortController?.abort();
	const { signal } = (openOverlay._overlayAbortController = new AbortController());

	const NAV_HTML = `<div class="overlay-navigation">
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

	const NAV_OPEN_CLASSES = [
		'slide-in-nav-item',
		'slide-in-nav-item-delay-1',
		'slide-in-nav-item-delay-2',
		'slide-in-nav-item-delay-3',
		'slide-in-nav-item-delay-4',
	];
	const NAV_CLOSE_CLASSES = [
		'slide-in-nav-item-reverse',
		'slide-in-nav-item-delay-1-reverse',
		'slide-in-nav-item-delay-2-reverse',
		'slide-in-nav-item-delay-3-reverse',
		'slide-in-nav-item-delay-4-reverse',
	];

	const toggleBar = (el, remove, add) => {
		if (!el) return;
		el.classList.remove(remove);
		el.classList.remove(add);
		// Force reflow so the browser registers the element without the animation
		// class before re-adding it, allowing the animation to restart each click
		void el.offsetWidth;
		el.classList.add(add);
	};

	const handler = () => {
		const topBar = document.querySelector('.bar-top');
		const middleBar = document.querySelector('.bar-middle');
		const bottomBar = document.querySelector('.bar-bottom');
		let overlayNavigation = document.querySelector('.overlay-navigation');

		// OPEN
		if (!overlayNavigation) {
			document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
			overlayNavigation = document.querySelector('.overlay-navigation');
			overlayNavigation.classList.add('overlay-active');
			// Force reflow so the browser registers translateY(-100%) before transitioning
			overlayNavigation.getBoundingClientRect();
			overlayNavigation.classList.add('overlay-slide-down');
			openOverlay.setAttribute('aria-label', 'Close navigation menu');
			openOverlay.setAttribute('aria-expanded', 'true');
			toggleBar(topBar, 'animate-out-top-bar', 'animate-top-bar');
			toggleBar(middleBar, 'animate-out-middle-bar', 'animate-middle-bar');
			toggleBar(bottomBar, 'animate-out-bottom-bar', 'animate-bottom-bar');
			document.querySelectorAll('nav li').forEach((item, i) => {
				if (i < NAV_OPEN_CLASSES.length) item.classList.add(NAV_OPEN_CLASSES[i]);
			});
			return;
		}

		// CLOSE
		openOverlay.setAttribute('aria-label', 'Open navigation menu');
		openOverlay.setAttribute('aria-expanded', 'false');
		toggleBar(topBar, 'animate-top-bar', 'animate-out-top-bar');
		toggleBar(middleBar, 'animate-middle-bar', 'animate-out-middle-bar');
		toggleBar(bottomBar, 'animate-bottom-bar', 'animate-out-bottom-bar');
		const navItems = [...document.querySelectorAll('nav li')];
		const lastIndex = Math.min(navItems.length, NAV_CLOSE_CLASSES.length) - 1;
		navItems.forEach((item, i) => {
			if (i >= NAV_CLOSE_CLASSES.length) return;
			item.classList.remove(NAV_OPEN_CLASSES[i]);
			// Reverse order: last item exits first, first item exits last
			item.classList.add(NAV_CLOSE_CLASSES[lastIndex - i]);
		});
		// Wait for ALL items to finish animating before sliding the overlay up
		// Last item: delay 0.48s + duration 0.3s = 0.78s total
		const CLOSE_TOTAL_MS = 800;
		setTimeout(() => {
			overlayNavigation.classList.replace('overlay-slide-down', 'overlay-slide-up');
			// overlay transition is 0.6s, remove after it completes
			overlayNavigation.addEventListener('transitionend', () => overlayNavigation.remove(), { once: true });
		}, CLOSE_TOTAL_MS);
	};

	openOverlay.addEventListener('click', handler, { signal });
	openOverlay.addEventListener('keydown', e => {
		if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
	}, { signal });
}

function initPage() {
	bindThemeInputs();
	bindThemeButtons();
	bindOverlayNavigation();
}

// After SPA navigation: re-bind controls on the new page body
document.addEventListener('page:transitioned', () => {
	setActiveThemeButton(localStorage.getItem('theme') || 'dark');
	initPage();
	setTimeout(replayTextAnimations, 0); // fire text animations on the new page
});

document.addEventListener('DOMContentLoaded', () => {
	let savedTheme;
	try { savedTheme = localStorage.getItem('theme'); } catch { savedTheme = null; }
	if (!VALID_THEMES.includes(savedTheme)) {
		savedTheme = 'auto';
		try { localStorage.setItem('theme', savedTheme); } catch { /* storage unavailable */ }
	}
	const resolvedTheme = savedTheme === 'auto'
		? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
		: savedTheme;
	document.documentElement.setAttribute('data-theme', resolvedTheme);
	setActiveThemeButton(savedTheme);
	updateFavicon(resolvedTheme);
	initPage();
	setTimeout(replayTextAnimations, 0); // fire text animations after first paint
});

window.addEventListener('popstate', () => location.reload());
