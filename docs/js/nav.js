document.addEventListener('DOMContentLoaded', () => {
  const burgerCheck = document.querySelector('.burger-check');
  const navLinks = document.querySelector('.nav-links');
  const profileTabs = document.querySelectorAll('.profile-tab');
  const themeList = document.querySelector('.theme-list');
  const themesBtn = document.querySelector('.link');
  const bgImage = document.querySelector('.image-container');
  const profileTitles = document.querySelectorAll('.profile-title');

  // Utility: Hide all profile tabs and remove 'open'
  function hideAllTabs() {
    profileTabs.forEach(tab => {
      tab.style.display = 'none';
      tab.classList.remove('open');
    });
  }

  // Utility: Reset UI to default state
  function resetUI() {
    hideAllTabs();
    if (bgImage) bgImage.style.display = 'block';
    if (themesBtn) themesBtn.style.display = '';
    if (themeList) themeList.style.display = 'flex';
    if (navLinks) navLinks.style.display = '';
    if (burgerCheck) burgerCheck.checked = false;
    profileTitles.forEach(title => title.style.display = 'block');
  }

  // Burger toggles nav menu ONLY and hides all tabs when opened
  if (burgerCheck && navLinks) {
    burgerCheck.addEventListener('change', () => {
      if (burgerCheck.checked) {
        navLinks.style.display = 'block';
        if (bgImage) bgImage.style.display = 'none';
        if (themesBtn) themesBtn.style.display = 'none';
        if (themeList) themeList.style.display = 'none';
        profileTitles.forEach(title => title.style.display = 'none');
        hideAllTabs();
      } else {
        resetUI();
      }
    });
  }

  // Nav-links click: show corresponding profile tab
  navLinks?.querySelectorAll('a[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = link.getAttribute('data-tab');
      profileTabs.forEach(tab => {
        if (tab.classList.contains(tabName)) {
          tab.style.display = 'flex';
          tab.classList.add('open');
        } else {
          tab.style.display = 'none';
          tab.classList.remove('open');
        }
      });
      profileTitles.forEach(title => title.style.display = 'none');
      if (bgImage) bgImage.style.display = 'none';
      if (themesBtn) themesBtn.style.display = '';
      if (themeList) themeList.style.display = 'none';
      if (burgerCheck) burgerCheck.checked = false;
      if (navLinks) navLinks.style.display = 'none';
    });
  });

  // Initial state based on burgerCheck
  if (burgerCheck && burgerCheck.checked) {
    navLinks.style.display = 'block';
    if (bgImage) bgImage.style.display = 'none';
    if (themesBtn) themesBtn.style.display = 'none';
    if (themeList) themeList.style.display = 'none';
    profileTitles.forEach(title => title.style.display = 'none');
    hideAllTabs();
  } else {
    resetUI();
  }

  // Theme button toggles theme list visibility
  themesBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (themeList) {
      themeList.style.display = themeList.style.display === 'flex' ? 'none' : 'flex';
    }
    hideAllTabs();
    if (bgImage) bgImage.style.display = 'none';
    if (burgerCheck) burgerCheck.checked = false;
    if (navLinks) navLinks.style.display = '';
    if (themesBtn) themesBtn.style.display = '';
    profileTitles.forEach(title => title.style.display = 'none');
  });

  // Close theme list when clicking outside
  document.addEventListener('click', (e) => {
    if (themeList && themesBtn && !themeList.contains(e.target) && !themesBtn.contains(e.target)) {
      themeList.style.display = 'none';
    }
  });
});