document.addEventListener('DOMContentLoaded', () => {
  const burgerCheck = document.querySelector('.burger-check');
  const navLinks = document.querySelector('.nav-links');
  const profileTabs = document.querySelectorAll('.profile-tab');
  const themeList = document.querySelector('.theme-list');
  const themesBtn = document.querySelector('.link');
  const bgImage = document.querySelector('.image-container');
  const profileTitle = document.querySelector('.profile-title');

  // Burger toggles nav menu ONLY and hides all tabs when opened
  if (burgerCheck && navLinks) {
    burgerCheck.addEventListener('change', () => {
      navLinks.style.display = burgerCheck.checked ? 'block' : '';
      if (burgerCheck.checked) {
        profileTabs.forEach(tab => {
          tab.style.display = 'none';
          tab.classList.remove('open');
          bgImage && (bgImage.style.display = 'none');
        });
      }
    });
  }

  // Hide all profile tabs by default
  profileTabs.forEach(tab => {
    tab.style.display = 'none';
    tab.classList.remove('open');
    bgImage && (bgImage.style.display = 'block');
  });

  // Nav-links click: show corresponding profile tab
  navLinks?.querySelectorAll('a[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = link.getAttribute('data-tab');
      profileTabs.forEach(tab => {
        if (tab.classList.contains(tabName)) {
          tab.style.display = 'flex';
          tab.classList.add('open');
          bgImage && (bgImage.style.display = 'none');
          profileTitle.style.display = 'none';
        } else {
          tab.style.display = 'none';
          tab.classList.remove('open');
        }
      });
      if (themesBtn) themesBtn.style.display = '';
      if (themeList) themeList.style.display = 'flex';
      if (bgImage) bgImage.style.display = 'none';
      if (burgerCheck) burgerCheck.checked = false;
      if (navLinks) navLinks.style.display = '';
    });
  });
});