const menu = document.querySelector(".bars");
const intro = document.querySelector(".intro");
let menustate = false;

menu.addEventListener("click", showMenu);

function showMenu() {
  if (!menustate) {
    menu.classList.add("is-active");
    document.querySelector(".nav-links").classList.add("open");
    intro.style.display = "none"; // Hide .intro
    menustate = true;
  } else {
    menu.classList.remove("is-active");
    document.querySelector(".nav-links").classList.remove("open");
    intro.style.display = "block"; // Show .intro
    menustate = false;
  }
}
