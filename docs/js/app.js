const menuToggle = document.querySelector('.menu-toggle');
const siteNavigation = document.querySelector('.primary-navigation');
const main = document.querySelector('main');
const introContents = document.querySelector('.intro-content');
const intro = document.querySelector('.intro');


menuToggle.addEventListener('click', () => {
  const isOpened = menuToggle.getAttribute('aria-expanded') === "true";
  isOpened ? closeMenu() : openMenu();
});

function openMenu() {
  menuToggle.setAttribute('aria-expanded', "true");
  siteNavigation.setAttribute('data-state', "opened");
  main.style.display = "none"; // Hide main content
 
 
 

}

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', "false");
  siteNavigation.setAttribute('data-state', "closing");

  // Ensure main is displayed and set background properties
  main.style.display= "block"; //
  //introContents.style.display = "block"; // Hide intro content
 
  siteNavigation.addEventListener('animationend', () => {
    siteNavigation.setAttribute('data-state', "closed");
  }, {once: true});
}