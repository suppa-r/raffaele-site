const logo = document.querySelector('.logo')
const intro = document.querySelector('.intro')
const sidebar = document.querySelector('.sidebar')
const menubutton = document.querySelector('.menu-button')

function showSidebar() {
   
  sidebar.style.display = 'flex'
  logo.style.display = 'none'
  intro.style.display = 'none'
  menubutton.style.display = 'none'

  }
  function hideSidebar() {
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'none'
    logo.style.display = 'block'
    intro.style.display = 'block'
    menubutton.style.display = 'block'
  }

const menu = document.querySelector('.bars');
let menustate = false;
menu.addEventListener('click', showMenu);
function showMenu(){
    if(!menustate) {
        menu.classList.add('is-active');
        document.querySelector('.nav-links').classList.add('open');
        menustate = true;
    } else {
        menu.classList.remove('is-active');
        document.querySelector('.nav-links').classList.remove('open');
        menustate = false;
    }
}