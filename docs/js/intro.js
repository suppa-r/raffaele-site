const menu = document.querySelector('.bars');
const intro = document.querySelector('.intro');
const navLinks = document.querySelector('.nav-links');
let menustate = false;

menu.addEventListener('click', showMenu);

function showMenu() {
    if (!menustate) {
        menu.classList.add('is-active'); // Add active class to menu
        navLinks.classList.add('open'); // Show nav links
        intro.classList.add('hidden'); // Hide .intro
        menustate = true; // Update state
    } else {
        menu.classList.remove('is-active'); // Remove active class from menu
        navLinks.classList.remove('open'); // Hide nav links
        intro.classList.remove('hidden'); // Show .intro
        menustate = false; // Update state
    }
}
