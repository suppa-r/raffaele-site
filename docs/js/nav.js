const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".primary-navigation");
const content = document.querySelector(".intro");
const logo = document.querySelector(".logo");
const mediaQuery = window.matchMedia("(width < 450px)");
const clickableArea = document.querySelector(".clickable-area");

// Ensure the menu starts hidden on small screens
if (mediaQuery.matches) {
	logo.style.display = "none";
	siteNavigation.setAttribute("data-state", "closed");
	siteNavigation.style.display = "none";
	content.style.display = "block";
}

// Add a listener for when the media query matches
mediaQuery.addEventListener("change", (event) => {
	if (event.matches) {
		closeMenu(); // Ensure the menu is closed when switching to small screens
	} else {
		openMenu(); // Ensure the menu is open when switching to larger screens
	}
});

menuToggle.addEventListener("click", (event) => {
	// Prevent the click event from propagating to parent elements
	event.stopPropagation();

	const isOpened = menuToggle.getAttribute("aria-expanded") === "true";
	isOpened ? closeMenu() : openMenu();
});

function openMenu() {
	menuToggle.setAttribute("aria-expanded", "true");
	siteNavigation.setAttribute("data-state", "opened");
	content.style.display = "none";
	siteNavigation.style.display = "block";
}

function closeMenu() {
	menuToggle.setAttribute("aria-expanded", "false");
	siteNavigation.setAttribute("data-state", "closed");
	content.style.display = "block";
	siteNavigation.style.display = "none";
}
