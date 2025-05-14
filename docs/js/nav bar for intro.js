const menu = document.querySelector('.bars');
const intro = document.querySelector('.intro');
const navlinks = document.querySelector('.nav-links');
const logo = document.querySelector('.logo');
let menustate = false;

menu.addEventListener('click', showMenu);
function showMenu(){
    if(!menustate) {
     
        menu.style.display = 'block';
        menu.style.zIndex = '1000';

        logo.style.display = 'none';
        navlinks.style.display = 'block';
        intro.style.display = 'none';
        menustate = true;
    } else {
     menu.style.display = 'none';
        menu.style.zIndex = '0';
        logo.style.display = 'block';
        navlinks.style.display = 'none';
        intro.style.display = 'block';


        menustate = false;
    }
}