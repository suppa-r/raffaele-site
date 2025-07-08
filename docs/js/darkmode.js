document.querySelector('.wrapper').addEventListener('click', function() {
  window.location.href = 'intro.html'; // or your target URL
});

// Prevent inner buttons/links from triggering the parent click
document.querySelectorAll('.wrapper button, .wrapper a').forEach(el => {
  el.addEventListener('click', e => e.stopPropagation());
});

document.querySelector('.theme-switch').addEventListener('click', function (event) {
  event.stopPropagation();
});


let darkmode = localStorage.getItem('darkmode');
const themeSwitch = document.querySelector('.theme-switch');

const enableDarkmode = () => {
  document.body.classList.add('darkmode');
  localStorage.setItem('darkmode', 'active');
};

const disableDarkmode = () => {
  document.body.classList.remove('darkmode');
  localStorage.setItem('darkmode', null);
};

if (darkmode === "active") enableDarkmode();

if (themeSwitch) {
  themeSwitch.addEventListener("click", () => {
    darkmode = localStorage.getItem('darkmode');
    darkmode !== "active" ? enableDarkmode() : disableDarkmode();
  });
}