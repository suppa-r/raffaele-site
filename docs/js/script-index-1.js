document.addEventListener('DOMContentLoaded', () => {
    const themeList = document.querySelector('.theme-list');
    const themeButtons = document.querySelectorAll('.theme-button');
    const intro = document.querySelector('.wrapper.intro');
    const title = document.querySelector('.title');

    console.log('Theme buttons found:', themeButtons.length); // Debug

    // Function to update favicon based on theme
    function updateFavicon(theme) {
        const favicon = document.querySelector("link[rel='icon']");
        console.log('Updating favicon for theme:', theme); // Debug
        console.log('Favicon element:', favicon); // Debug

        if (favicon) {
            const faviconPath = theme === "dark"
                ? "/favicons/dark-1.png"
                : "/favicons/light-1.png";
            console.log('Setting favicon path to:', faviconPath); // Debug
            favicon.href = faviconPath + "?v=" + Date.now();
        } else {
            console.error('Favicon element not found!');
        }
    }

    // Function to update active class on theme buttons
    function setActiveThemeButton() {
        themeButtons.forEach(btn => {
            const input = btn.querySelector('input[type="radio"]');
            btn.classList.toggle('active', input && input.checked);
        });
    }

    // Function to set theme and update favicon
    function setTheme(theme) {
        console.log('Setting theme to:', theme); // Debug
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateFavicon(theme);

        // Update radio button states
        themeButtons.forEach(btn => {
            const radio = btn.querySelector('input[type="radio"]');
            if (radio) radio.checked = (radio.value === theme);
        });
        setActiveThemeButton();
    }

    // Listen to radio button changes directly
    themeButtons.forEach(btn => {
        const input = btn.querySelector('input[type="radio"]');
        if (input) {
            input.addEventListener('change', (e) => {
                console.log('Radio button changed:', e.target.value); // Debug
                if (e.target.checked) {
                    setTheme(e.target.value);
                }
            });
        }
    });

    // Also keep the click handler for button functionality
    themeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log('Button clicked'); // Debug
            const input = btn.querySelector('input[type="radio"]');
            if (btn.classList.contains('active')) {
                // Open dropdown (show non-active options)
                e.stopPropagation();
                themeList && themeList.classList.add('active');
                intro && (intro.style.display = 'block');
                title && (title.style.display = 'block');
            } else if (input) {
                // Switch theme if non-active button is clicked
                console.log('Switching to theme:', input.value); // Debug
                input.checked = true;
                setTheme(input.value);
                themeList && themeList.classList.remove('active');
                intro && (intro.style.display = 'block');
                title && (title.style.display = 'block');
            }
        });
    });

    // Load saved theme from localStorage
    let savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
        savedTheme = 'dark';
        localStorage.setItem('theme', 'dark');
    }

    console.log('Initial theme:', savedTheme); // Debug

    // Set initial theme and favicon
    setTheme(savedTheme);

    // Close dropdown if clicking outside
    document.addEventListener('click', (event) => {
        if (
            themeList &&
            themeList.classList.contains('active') &&
            !themeList.contains(event.target)
        ) {
            themeList.classList.remove('active');
            intro && (intro.style.display = 'block');
            title && (title.style.display = 'block');
        }
    });
});