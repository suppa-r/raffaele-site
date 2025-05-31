const profileButton = document.querySelector('.profile-button');
const navbar = document.querySelector('.profile-navbar');
document.querySelector('.profile-button').addEventListener('click', function () {

  navbar.style.display = 'block';
  navbar.classList.toggle('show');
  if (navbar.classList.contains('show')) {
    navbar.style.display = 'block';
  } else {
    navbar.style.display = 'none';
  }

});
document.addEventListener('click', function (event) {
  if (!navbar.contains(event.target) && !profileButton.contains(event.target)) {
    navbar.style.display = 'none';
    navbar.classList.remove('show');
  }
});
// Close the navbar when clicking outside of it
document.querySelector('.profile-navbar').addEventListener('click', function (event) {
  event.stopPropagation();
});





  



