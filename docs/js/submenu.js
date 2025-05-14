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
    refreshSubMenu(); // Refresh the submenu
}

function hideSubMenu() {
    intromain.style.display = "block"; // Show main content
    intromain.style.display="flex";
    ul.style.display = "none"; // Hide submenu
}

function refreshSubMenu() {
    ul.style.display = 'none'; // Temporarily hide the submenu
    void ul.offsetHeight; // Trigger a reflow
    ul.style.display = 'block'; // Show the submenu again
}