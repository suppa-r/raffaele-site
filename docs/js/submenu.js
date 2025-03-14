const intromain = document.querySelector('.intro-main');
const btn = document.querySelector('.dropdown-btn');
const ul = document.querySelector('.sub-menu');

btn.addEventListener('click', () => {
    const isSubMenuVisible = ul.style.display === 'block';
    isSubMenuVisible ? hideSubMenu() : showSubMenu();
});

function showSubMenu() {
    intromain.style.display = "none"; // Hide main content
    ul.style.display = "block"; // Show submenu
}

function hideSubMenu() {
    intromain.style.display = "block"; // Show main content
    ul.style.display = "none"; // Hide submenu
}