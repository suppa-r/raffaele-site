// --- Sneaker button (index.html only) ---
function bindSneakerButton() {
	const btn = document.querySelector('.btn');
	if (!btn || btn.dataset.sneakerBound === 'true') return;
	btn.addEventListener('click', function (e) {
		const rect = btn.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		document.body.classList.add('is-leaving');
		for (let i = 0; i < 20; i++) {
			const particle = document.createElement('div');
			particle.classList.add('particle');
			particle.setAttribute('aria-hidden', 'true');
			particle.style.left = x + 'px';
			particle.style.top = y + 'px';
			const angle = Math.random() * 2 * Math.PI;
			const distance = Math.random() * 80 + 20;
			particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
			particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
			btn.appendChild(particle);
			setTimeout(() => particle.remove(), 1000);
		}
		setTimeout(() => { window.location.href = 'intro.html'; }, 800);
	});
	btn.dataset.sneakerBound = 'true';
}

document.addEventListener('DOMContentLoaded', bindSneakerButton);
document.addEventListener('page:transitioned', bindSneakerButton);

if (typeof navigation !== 'undefined' && navigation.addEventListener) {
    navigation.addEventListener("navigate", (event) => {
        if (new URL(event.destination.url).origin !== location.origin) {
            return;
        }

        event.intercept({
            handler: async () => {
                // Remove nav from DOM before transition
                const overlayNav = document.querySelector('.overlay-navigation');
                if (overlayNav) overlayNav.remove();

                let response;
                try {
                    response = await fetch(event.destination.url);
                } catch (networkError) {
                    console.error('Navigation fetch failed:', networkError);
                    // Fall back to a full page load so the user still reaches the destination
                    window.location.href = event.destination.url;
                    return;
                }

                if (!response.ok) {
                    console.error(`Navigation response error: ${response.status} ${response.statusText}`);
                    window.location.href = event.destination.url;
                    return;
                }

                const text = await response.text();

                // Swap stylesheets
                const parser = new DOMParser();
                const newDocument = parser.parseFromString(text, 'text/html');
                const currentStylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
                const newStylesheets = Array.from(newDocument.querySelectorAll('link[rel="stylesheet"]'));
                const currentHrefs = currentStylesheets.map(l => l.getAttribute('href'));
                const newHrefs = newStylesheets.map(l => l.getAttribute('href'));

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

                const savedTheme = localStorage.getItem('theme') || 'dark';

                const newGrid = newDocument.documentElement.getAttribute('data-grid');

                const transition = document.startViewTransition(() => {
                    const newBody = document.adoptNode(newDocument.body);
                    // Suppress entry animations until the view transition completes
                    newBody.classList.add('page-entering');
                    document.documentElement.replaceChild(newBody, document.body);
                    document.title = newDocument.title;

                    // Apply theme inside the transition snapshot — prevents mid-transition DOM mutation
                    const current = document.documentElement.getAttribute('data-theme');
                    if (current !== savedTheme) {
                        document.documentElement.setAttribute('data-theme', savedTheme);
                    }

                    // Sync data-grid from the incoming page's <html>
                    if (newGrid) {
                        document.documentElement.setAttribute('data-grid', newGrid);
                    } else {
                        document.documentElement.removeAttribute('data-grid');
                    }
                });

                transition.ready.then(() => {
                    window.scrollTo(0, 0);
                });

                await transition.finished;

                // Re-enable entry animations now that the transition is done
                document.body.classList.remove('page-entering');

                document.dispatchEvent(new CustomEvent('page:transitioned'));
            },
            scroll: "manual",
        });
    });
}

