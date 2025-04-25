const menu = document.querySelector(".bars");
const intro = document.querySelector(".section-content");
const nav = document.querySelector(".nav-links");
let menustate = false;
menu.addEventListener("click", showMenu);
function showMenu() {
  if (!menustate) {
    menu.classList.add("is-active");
    document.querySelector(".nav-links").classList.add("open");
    menustate = true;
    intro.style.display = "none";
    nav.style.display = "block";
  } else {
    menu.classList.remove("is-active");
    document.querySelector(".nav-links").classList.remove("open");
    menustate = false;
    intro.style.display = "block";
    nav.style.display = "none";
  }
}
