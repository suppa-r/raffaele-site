function updateFavicon() {
    const favicon = document.querySelector('link[rel="icon"]');
    const path = document.hidden ? '/favicon-inactive.ico' : '/favicon.ico';
    favicon?.setAttribute('href', path)
}
document.addEventListener('visibilitychange', updateFavicon)
