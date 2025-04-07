const menu = document.querySelector(".bars");
const introcontent = document.querySelector(".intro-content");
let menustate = false;
menu.addEventListener("click", showMenu);
function showMenu() {
  if (!menustate) {
    menu.classList.add("is-active");
    document.querySelector(".nav-links").classList.add("open");
    menustate = true;
    introcontent.style.display = "none";
  } else {
    menu.classList.remove("is-active");
    document.querySelector(".nav-links").classList.remove("open");
    menustate = false;
    introcontent.style.display = "block";
  }
}
