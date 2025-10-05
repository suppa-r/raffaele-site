document.addEventListener('DOMContentLoaded', () => {
  const burgerCheck = document.querySelector('.burger-check');
  const navLinks = document.querySelector('.nav-links');

  const profileTabs = document.querySelectorAll('.profile-tab');
  const themeList = document.querySelector('.theme-list');
  const themesBtn = document.querySelector('.link');
  const bgImage = document.querySelector('.bg-image');


  // Initially hide all profile tabs
  profileTabs.forEach(tab => tab.style.display = 'none');

  // Burger toggles nav menu and shows profile section, hides all profile tabs
  if (burgerCheck && navLinks) {
    burgerCheck.addEventListener('change', () => {
      if (burgerCheck.checked) {
        navLinks.style.display = 'block';


        profileTabs.forEach(tab => tab.style.display = 'none');
        if (themesBtn) themesBtn.style.display = 'none';
        if (themeList) themeList.style.display = 'none';
        if (bgImage) bgImage.style.display = 'none';
        if (profileTitle) profileTitle.style.display = 'none';
      } else {
        navLinks.style.display = '';
        profileTabs.forEach(tab => tab.style.display = 'flex');
        if (themesBtn) themesBtn.style.display = '';
        if (themeList) themeList.style.display = 'flex';
        if (bgImage) bgImage.style.display = '';
        if (profileTitle) profileTitle.style.display = '';
      }
    });
  }


  navLinks?.querySelectorAll('a[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = link.getAttribute('data-tab');
      profileTabs.forEach(tab => {
        if (tab.classList.contains(tabName)) {
          tab.style.display = 'flex';    // <-- flex for side-by-side children
          tab.classList.add('open');
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

  // Profile title element
  const profileTitle = document.querySelector('.profile-title');
  if (profileTitle) profileTitle.style.display = 'none';

  // Show profile title when any profile tab is displayed
  profileTabs.forEach(tab => {
    const observer = new MutationObserver(() => {
      if (tab.style.display === 'flex') {
        if (profileTitle) profileTitle.style.display = 'none';
      } else {
        if (![...profileTabs].some(t => t.style.display === 'flex')) {
          if (profileTitle) profileTitle.style.display = 'none';
        }
      }
    });
    observer.observe(tab, { attributes: true, attributeFilter: ['style'] });
  });

});