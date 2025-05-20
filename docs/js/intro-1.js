const logo = document.querySelector('.logo');
const crewdetails = document.querySelectorAll('.crew-details');
const sidebar = document.querySelector('.sidebar');
const menubutton = document.querySelector('.menu-button');

function showSidebar() {
  sidebar.style.display = 'flex';
  logo.style.display = 'none';
  crewdetails.forEach(el => el.style.display = 'none');
  menubutton.style.display = 'none';
}

function hideSidebar() {
  sidebar.style.display = 'none';
  logo.style.display = 'block';
  crewdetails.forEach(el => el.style.display = 'block');
  menubutton.style.display = 'block';
}