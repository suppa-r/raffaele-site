const logo = document.querySelector('.logo');
const intro = document.querySelector('.intro');
const navlinks = document.querySelector('.nav-links');
const bars = document.querySelector('.bars');


let introState = true;



bars.addEventListener('click', () => {
    if (introState) {
        logo.display = 'block';
        intro.display = 'none';
        navlinks.display = 'block';
        introState = false;
    } else {
        logo.display = 'none';
        intro.display = 'block';
        navlinks.display = 'none';
        introState = true;
    }
});

