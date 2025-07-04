const menu = document.querySelector('.bars');
const intro = document.querySelector('.intro');
let menustate = false;

menu.addEventListener('click', showMenu);

function showMenu() {
    if (!menustate) {
        menu.classList.add('is-active');
        document.querySelector('.nav-links').classList.add('open');
        menustate = true;
        intro.style.display = 'none';
    } else {
        menu.classList.remove('is-active');
        document.querySelector('.nav-links').classList.remove('open');
        menustate = false;
        intro.style.display = 'block';
    }
}