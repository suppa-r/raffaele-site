const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".primary-navigation");
const content = document.querySelector(".home");
const logo = document.querySelector(".logo");
const mediaQuery = window.matchMedia("(max-width: 600px)");
const wrapper = document.querySelector(".wrapper");

// Ensure the menu starts hidden on small screens
if (mediaQuery.matches) {
	logo.style.display = "none";
	if (content) content.style.display = "none";
	if (siteNavigation) {
		siteNavigation.setAttribute("data-state", "closed");
		siteNavigation.style.display = "none";
	}
	if (wrapper) wrapper.style.display = "block";
} else {
	if (logo) logo.style.display = "block";
}

// Add a listener for when the media query matches
mediaQuery.addEventListener("change", (event) => {
	if (event.matches) {
		closeMenu(); // Ensure the menu is closed when switching to small screens
		if (wrapper) wrapper.style.pointerEvents = "none";
	} else {
		openMenu(); // Ensure the menu is open when switching to larger screens
		if (wrapper) wrapper.style.pointerEvents = "auto";
		if (logo) logo.style.display = "block";
	}
});

menuToggle?.addEventListener("click", (event) => {
	event.stopPropagation();
	const isOpened = menuToggle.getAttribute("aria-expanded") === "true";
	isOpened ? closeMenu() : openMenu();
});

function openMenu() {
	menuToggle?.setAttribute("aria-expanded", "true");
	siteNavigation?.setAttribute("data-state", "opened");
	if (content) content.style.display = "none";
	if (siteNavigation) siteNavigation.style.display = "block";
}

function closeMenu() {
	menuToggle?.setAttribute("aria-expanded", "false");
	siteNavigation?.setAttribute("data-state", "closed");
	if (content) content.style.display = "block";
	if (siteNavigation) siteNavigation.style.display = "none";
}
