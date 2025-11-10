document.addEventListener('DOMContentLoaded', () => {
    // Element declarations
    const themeSwitcher = document.querySelector('.theme-switcher');
    const themeButtons = document.querySelectorAll('.theme-button');
    const wrapper = document.querySelector('.wrapper');
    const h = document.querySelector('header');
    const nav = document.querySelector('.nav-links');
    const menuBtn = document.querySelector('.menu-btn');
    const burgerMenu = document.querySelector('.menu-burger');
    const intro = document.querySelector('.intro');
    const navLinksTabs = document.querySelectorAll('.nav-links a');

    // ✅ FIXED: Ensure all nav items have --i variables
    const navItems = document.querySelectorAll('.nav-links li');
    if (navItems.length > 0) {
        navItems.forEach((item, index) => {
            if (!item.style.getPropertyValue('--i')) {
                item.style.setProperty('--i', index + 1);
            }
            console.log(`Nav item ${index + 1}: --i = ${item.style.getPropertyValue('--i')}`);
        });
    } else {
        console.warn('No nav items found for animation setup');
    }

    // Debug: Check if elements exist
    console.log('Menu button found:', menuBtn);
    console.log('Burger menu found:', burgerMenu);
    console.log('Nav links found:', nav);

    intro && (intro.style.display = 'block');

    // ✅ FIXED: Helper functions (moved to top)
    function getDefaultTheme() {
        return 'dark';
    }

    function isValidTheme(theme) {
        return ['dark', 'light', 'system'].includes(theme);
    }

    function setActiveThemeButton() {
        themeButtons.forEach(btn => {
            const input = btn.querySelector('input[type="radio"]');
            btn.classList.toggle('active', input && input.checked);
        });
    }

    // ✅ FIXED: Theme initialization (moved before using variables)
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    let sysListener;

    let savedTheme = localStorage.getItem('theme');

    // Validate and set default theme
    if (!savedTheme || !isValidTheme(savedTheme)) {
        savedTheme = getDefaultTheme();
        localStorage.setItem('theme', savedTheme);
        console.log('No valid saved theme, defaulting to:', savedTheme);
    } else {
        console.log('Using saved theme:', savedTheme);
    }

    // Apply theme immediately
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Update radio buttons
    themeButtons.forEach(btn => {
        const radio = btn.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = (radio.value === savedTheme);
        }
    });

    setActiveThemeButton();

    // Handle system theme if selected
    if (savedTheme === 'system') {
        const systemTheme = mql.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
        console.log('System theme applied:', systemTheme);

        sysListener = e => {
            const newSystemTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newSystemTheme);
            console.log('System theme changed to:', newSystemTheme);
        };
        mql.addEventListener('change', sysListener);
    } else if (sysListener) {
        mql.removeEventListener('change', sysListener);
    }

    // Update favicon to match default theme
    updateFavicon(savedTheme === 'system' ? (mql.matches ? 'dark' : 'light') : savedTheme);

    // Close nav menu when a nav link is clicked
    navLinksTabs.forEach(link => {
        link.addEventListener('click', () => {
            console.log('Nav link clicked, closing menu');
            if (nav && nav.classList.contains('open')) {
                nav.classList.remove('open');

                // ✅ FIXED: Proper nav hiding with animations
                //setTimeout(() => {
                //  nav.style.display = 'none';
                //  nav.style.opacity = '0';
                // nav.style.pointerEvents = 'none';
                //}, 600); // Wait for animations to finish

                burgerMenu && burgerMenu.classList.remove('active');
                if (intro) intro.style.display = 'block';
            }
        });
    });

    // ✅ FIXED: Burger menu click handler
    if (burgerMenu && nav) {
        burgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            console.log('Burger clicked!');

            const isOpen = !nav.classList.contains('open');
            console.log('Nav will be:', isOpen ? 'open' : 'closed');

            if (isOpen) {
                // Opening nav
                nav.style.display = 'flex';
                nav.style.opacity = '1';
                nav.style.pointerEvents = 'all';

                // Force reflow
                nav.offsetHeight;

                // Add open class for animations
                requestAnimationFrame(() => {
                    nav.classList.add('open');
                    console.log('Nav opened with animations');

                    // Debug li elements
                    const currentNavItems = document.querySelectorAll('.nav-links li');
                    currentNavItems.forEach((item, index) => {
                        //setTimeout(() => {
                        /// console.log(`Li ${index} styles:`, {
                        //  transform: getComputedStyle(item).transform,
                        //  opacity: getComputedStyle(item).opacity,
                        // transitionDelay: getComputedStyle(item).transitionDelay,
                        // iValue: item.style.getPropertyValue('--i')
                        // });
                        //}, 100);
                    });
                });

                // Hide other elements when nav is open
                if (intro) intro.style.display = 'none';

            } else {
                // Closing nav
                nav.classList.remove('open');

                // ✅ FIXED: Wait for animations before hiding
                setTimeout(() => {
                    nav.style.display = 'none';
                    nav.style.opacity = '0';
                    nav.style.pointerEvents = 'none';
                }, 0); // Wait for longest animation delay

                // Show other elements when nav is closed
                if (intro) intro.style.display = 'block';
            }

            // Toggle burger active state
            burgerMenu.classList.toggle('active', isOpen);
        });
    } else {
        console.error('Burger menu or nav not found!');
    }

    // ✅ FIXED: Theme button handlers
    themeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = btn.querySelector('input[type="radio"]');

            if (btn.classList.contains('active')) {
                // If already active, toggle theme switcher
                e.stopPropagation();
                if (themeSwitcher) {
                    themeSwitcher.classList.add('active');
                }
                if (intro) intro.style.display = 'block';
                if (h) h.style.display = 'block';
                if (nav) nav.style.display = 'block';

            } else if (input) {
                // Change theme
                input.checked = true;
                const selectedTheme = input.value;

                // Apply theme with transitions
                if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    document.startViewTransition(() => {
                        document.documentElement.setAttribute('data-theme', selectedTheme);
                        localStorage.setItem('theme', selectedTheme);
                        updateFavicon(selectedTheme);
                    });
                } else {
                    document.documentElement.setAttribute('data-theme', selectedTheme);
                    localStorage.setItem('theme', selectedTheme);
                    updateFavicon(selectedTheme);
                }

                setActiveThemeButton();

                // Close theme switcher and nav
                if (themeSwitcher) themeSwitcher.classList.remove('active');
                if (intro) intro.style.display = 'block';
                if (h) h.style.display = 'block';
                if (nav) {
                    nav.style.display = '';
                    nav.classList.remove('open');
                }

                // Reset burger menu state
                if (burgerMenu) burgerMenu.classList.remove('active');
            }
        });
    });

    // ✅ FIXED: Click outside handlers
    document.addEventListener('click', (event) => {
        // Close theme dropdown
        if (themeSwitcher &&
            themeSwitcher.classList.contains('active') &&
            !themeSwitcher.contains(event.target)) {

            themeSwitcher.classList.remove('active');
            if (intro) intro.style.display = 'block';
            if (h) h.style.display = 'block';
            if (nav) nav.style.display = 'block';
        }

        // Close mobile nav when clicking outside
        if (nav &&
            nav.classList.contains('open') &&
            !nav.contains(event.target) &&
            burgerMenu && !burgerMenu.contains(event.target)) {

            console.log('Clicked outside, closing nav');
            nav.classList.remove('open');

            setTimeout(() => {
                nav.style.display = 'none';
                nav.style.opacity = '0';
                nav.style.pointerEvents = 'none';
            }, 600);

            if (burgerMenu) burgerMenu.classList.remove('active');
            if (intro) intro.style.display = 'block';
        }
    });
});

// ✅ FIXED: Favicon function outside DOMContentLoaded
function updateFavicon(theme) {
    const favicon = document.getElementById("favicon") || document.querySelector("link[rel='icon']");
    if (favicon) {
        const faviconPath = theme === "dark"
            ? "/favicons/dark-1.png"
            : "/favicons/light-1.png";
        favicon.href = faviconPath + "?v=" + Date.now();
    }
}