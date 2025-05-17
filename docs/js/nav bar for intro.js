const menu = document.querySelector('.bars');
const navlinks = document.querySelector('.nav-links');
const logo = document.querySelector('.logo');
const intro = document.querySelector('.intro');
let menustate = false;
menu.addEventListener('click', showMenu);
function showMenu() {
    if (menustate) {
        logo.style.display = 'block';
        intro.style.display = 'block';
        navlinks.style.display = 'none';
        menustate = false;
    } else {
        logo.style.display = 'none';
        intro.style.display = 'none';
        navlinks.style.display = 'block';
    }
    menustate = true;
}