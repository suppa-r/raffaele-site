const wrapper = document.querySelector('.wrapper');
const themeSwitch = document.querySelector('.theme-switch');

// Make wrapper clickable (except for inner buttons/links)
if (wrapper) {
  wrapper.addEventListener('click', function () {
    window.location.href = 'intro.html';
  });

  // Prevent inner buttons/links from triggering the wrapper click
  wrapper.querySelectorAll('button, a').forEach(el => {
    el.addEventListener('click', e => e.stopPropagation());
  });
}

let darkmode = localStorage.getItem('darkmode');

const enableDarkmode = () => {
  document.body.classList.add('darkmode');
  localStorage.setItem('darkmode', 'active');
};

const disableDarkmode = () => {
  document.body.classList.remove('darkmode');
  localStorage.setItem('darkmode', null);
};

// Set initial mode on load
if (darkmode === "active") enableDarkmode();

// Handle theme switch click (toggle and prevent bubbling)
if (themeSwitch) {
  themeSwitch.addEventListener('click', function (e) {
    e.stopPropagation();
    darkmode = localStorage.getItem('darkmode');
    darkmode !== "active" ? enableDarkmode() : disableDarkmode();
  });
}