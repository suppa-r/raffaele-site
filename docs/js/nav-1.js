
const bars = document.querySelector(".bars");
const intro = document.querySelector(".intro");
const logo = document.querySelector(".logo");
const navlinks = document.querySelectorAll(".nav-links");
const mediaQuery = window.matchMedia("(width < 600px)");


// Ensure the menu starts hidden on small screens
if (mediaQuery.matches) {
	logo.style.display = "none";
	bars.setAttribute("data-state", "closed");
	navlinks.style.display = "none";
	intro.style.display = "block";
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

	navlinks.setAttribute("data-state", "opened");
	intro.style.display = "none";
	navlinks.style.display = "block";
}

function closeMenu() {
	
	navlinks.setAttribute("data-state", "closed");
	intro.style.display = "block";
	navlinks.style.display = "none";
}








