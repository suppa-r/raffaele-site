const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".primary-navigation");
const introcontent = document.querySelector(".intro");
const logo = document.querySelector(".logo");
const clickableArea = document.querySelector(".clickable-area");

const mediaQuery = window.matchMedia("(width < 600px)");
// Check if the media query is already matched

// Add a listener for when the media query matches
mediaQuery.addEventListener("change", (event) => {
	if (event.matches) {
		// If it does, close the menu
		closeMenu();
	} else {
		// If it doesn't, open the menu
		openMenu();
	}
});
// Add a listener for when the media query changes

menuToggle.addEventListener("click", () => {
	const isOpened = menuToggle.getAttribute("aria-expanded") === "true";
	isOpened ? closeMenu() : openMenu();
});

clickableArea.addEventListener("click", () => {
	if (menuToggle.getAttribute("aria-expanded") === "true") {
		closeMenu();
	} else {
		openMenu();
	}
});

function openMenu() {
	menuToggle.setAttribute("aria-expanded", "true");
	siteNavigation.setAttribute("data-state", "opened");

	siteNavigation.addEventListener(
		"animationend",
		() => {
			siteNavigation.setAttribute("data-state", "open");
		},
		{ once: true }
	);
	introcontent.style.display = "none";
	siteNavigation.style.display = "block";
	logo.style.display = "none";
}
function closeMenu() {
	menuToggle.setAttribute("aria-expanded", "false");
	siteNavigation.setAttribute("data-state", "closing");

	siteNavigation.addEventListener(
		"animationend",
		() => {
			siteNavigation.setAttribute("data-state", "closed");
		},
		{ once: true }
	);
	introcontent.style.display = "flex";
	introcontent.style.flexDirection = "column";
	introcontent.style.alignItems = "center";
	introcontent.style.justifyContent = "flex-end";
	siteNavigation.style.display = "none";
	logo.style.display = "none";
}
