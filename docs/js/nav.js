const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".primary-navigation");

const logo = document.querySelector(".logo");
const mediaQuery = window.matchMedia("(max-width: 600px)");
const content = document.querySelector(".intro");

// Ensure the menu starts hidden on small screens
if (mediaQuery.matches) {
	// If the media query matches, it means the viewport is 600px or smaller
	siteNavigation.setAttribute("data-state", "opened");
	menuToggle.setAttribute("aria-expanded", "true");
	siteNavigation.style.display = "block";
	content.style.display = "none";
} else {
	// If the media query does not match, it means the viewport is larger than 600px
	menuToggle.setAttribute("aria-expanded", "false");

	siteNavigation.setAttribute("data-state", "opened");
	siteNavigation.style.display = "block";
	content.style.display = "none";
} // Ensure the menu starts visible on larger screens//

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
