const menu = document.querySelector('.bars');
const intro = document.querySelector('.intro');
let menustate = false;

menu.addEventListener('click', showMenu);

function showMenu() {
    if (!menustate) {
        menu.classList.add('is-active');
        document.querySelector('.nav-links').classList.add('open');
        
        // Hide .intro
        intro.style.display = 'none';
        intro.style.visibility = 'hidden';
        menustate = true;
    } else {
        menu.classList.remove('is-active');
        document.querySelector('.nav-links').classList.remove('open');
        
        // Show .intro
        intro.style.display = 'block';
        intro.style.visibility = 'visible';
        intro.style.opacity = '1';
        menustate = false;
    }
}