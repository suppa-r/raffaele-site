const PARTICLE_COUNT = 20;
const PARTICLE_REMOVE_MS = 1000;
const PAGE_LEAVE_CLASS = 'is-leaving';
const PARTICLE_DISTANCE_MIN = 20;
const PARTICLE_DISTANCE_MAX = 100;
const NAVIGATION_SCROLL_BEHAVIOR = 'manual';

function getSneakerButton() {
    return document.querySelector('.btn');
}

function bindOnce(selector, eventName, handler) {
    document.querySelectorAll(selector).forEach(element => {
        const key = `bound${eventName}`;
        if (element.dataset[key] === 'true') return;
        element.addEventListener(eventName, handler);
        element.dataset[key] = 'true';
    });
}

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.setAttribute('aria-hidden', 'true');
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * (PARTICLE_DISTANCE_MAX - PARTICLE_DISTANCE_MIN) + PARTICLE_DISTANCE_MIN;
    particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);

    return particle;
}

function emitParticles(button, x, y) {
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const particle = createParticle(x, y);
        button.appendChild(particle);
        setTimeout(() => particle.remove(), PARTICLE_REMOVE_MS);
    }
}

function handleSneakerClick(event) {
    const button = getSneakerButton();
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    document.body.classList.add(PAGE_LEAVE_CLASS);
    emitParticles(button, x, y);

    setTimeout(() => {
        window.location.href = 'intro.html';
    }, 800);
}

function bindSneakerButton() {
    bindOnce('.btn', 'click', handleSneakerClick);
}

function loadNewStylesheets(newStylesheets, currentHrefs) {
    const promises = [];

    newStylesheets.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || currentHrefs.includes(href)) return;

        const clone = link.cloneNode(true);
        const loadPromise = new Promise(resolve => {
            clone.addEventListener('load', resolve, { once: true });
            clone.addEventListener('error', resolve, { once: true });
        });

        promises.push(loadPromise);
        document.head.appendChild(clone);
    });

    return Promise.all(promises);
}

function removeOldStylesheets(newHrefs) {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || newHrefs.includes(href)) return;
        link.remove();
    });
}

function adoptNewBody(newDocument, savedTheme) {
    const newBody = document.adoptNode(newDocument.body);
    newBody.classList.add('page-entering');
    document.documentElement.replaceChild(newBody, document.body);
    document.title = newDocument.title;

    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme !== savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const newGrid = newDocument.documentElement.getAttribute('data-grid');
    if (newGrid) {
        document.documentElement.setAttribute('data-grid', newGrid);
    } else {
        document.documentElement.removeAttribute('data-grid');
    }
}

async function fetchDocument(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Navigation response error: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    return new DOMParser().parseFromString(text, 'text/html');
}

async function handleNavigation(event) {
    if (new URL(event.destination.url).origin !== location.origin) {
        return;
    }

    event.intercept({
        handler: async () => {
            const overlayNav = document.querySelector('.overlay-navigation');
            if (overlayNav) overlayNav.remove();

            let newDocument;
            try {
                newDocument = await fetchDocument(event.destination.url);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Navigation fetch failed:', error);
                window.location.href = event.destination.url;
                return;
            }

            const currentStylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
            const newStylesheets = Array.from(newDocument.querySelectorAll('link[rel="stylesheet"]'));
            const currentHrefs = currentStylesheets.map(link => link.getAttribute('href'));
            const newHrefs = newStylesheets.map(link => link.getAttribute('href'));

            await loadNewStylesheets(newStylesheets, currentHrefs);
            removeOldStylesheets(newHrefs);

            const savedTheme = localStorage.getItem('theme') ?? 'dark';
            const transition = document.startViewTransition(() => {
                adoptNewBody(newDocument, savedTheme);
            });

            transition.ready.then(() => window.scrollTo(0, 0));
            await transition.finished;
            document.body.classList.remove('page-entering');
            document.dispatchEvent(new CustomEvent('page:transitioned'));
        },
        scroll: NAVIGATION_SCROLL_BEHAVIOR
    });
}

function initNavigationInterception() {
    const nav = window.navigation;
    if (!nav || typeof nav.addEventListener !== 'function') {
        return;
    }

    nav.addEventListener('navigate', handleNavigation);
}

function initMainPage() {
    bindSneakerButton();
    initNavigationInterception();
}

document.addEventListener('DOMContentLoaded', initMainPage);
document.addEventListener('page:transitioned', initMainPage);
