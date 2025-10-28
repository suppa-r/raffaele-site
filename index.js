// ✅ FIXED: Corrected active state logic
document.addEventListener('DOMContentLoaded', () => {
  const hamMenuBtn = document.querySelector('.header__main-ham-menu-cont')
  const smallMenu = document.querySelector('.header__sm-menu')
  const headerHamMenuBtn = document.querySelector('.header__main-ham-menu')
  const headerHamMenuCloseBtn = document.querySelector('.header__main-ham-menu-close')
  const headerSmallMenuLinks = document.querySelectorAll('.header__sm-menu-link a')
  const headerLogoContainer = document.querySelector('.header__logo-container')

  // Debug: Check if elements exist
  console.log('Elements found:', {
    hamMenuBtn: !!hamMenuBtn,
    smallMenu: !!smallMenu,
    headerHamMenuBtn: !!headerHamMenuBtn,
    headerHamMenuCloseBtn: !!headerHamMenuCloseBtn,
    headerSmallMenuLinks: headerSmallMenuLinks.length
  })

  // Function to toggle menu
  function toggleMenu() {
    if (!smallMenu) {
      console.log('Small menu not found')
      return
    }

    const isActive = smallMenu.classList.contains('header__sm-menu--active')
    console.log('Menu is currently:', isActive ? 'active' : 'inactive')

    if (isActive) {
      // ✅ CLOSING MENU: Show hamburger, hide close button
      smallMenu.classList.remove('header__sm-menu--active')
      headerHamMenuBtn?.classList.remove('d-none')  // Show hamburger icon
      headerHamMenuCloseBtn?.classList.add('d-none') // Hide close icon
      console.log('Menu closed')
    } else {
      // ✅ OPENING MENU: Hide hamburger, show close button
      smallMenu.classList.add('header__sm-menu--active')
      headerHamMenuBtn?.classList.add('d-none')      // Hide hamburger icon
      headerHamMenuCloseBtn?.classList.remove('d-none') // Show close icon
      console.log('Menu opened')
    }
  }

  // Function to close menu (used by nav links)
  function closeMenu() {
    if (!smallMenu) return

    // ✅ ALWAYS CLOSE: Show hamburger, hide close button
    smallMenu.classList.remove('header__sm-menu--active')
    headerHamMenuBtn?.classList.remove('d-none')  // Show hamburger icon
    headerHamMenuCloseBtn?.classList.add('d-none') // Hide close icon
    console.log('Menu closed via nav link')
  }

  // Hamburger menu click
  if (hamMenuBtn) {
    hamMenuBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      console.log('Hamburger clicked')
      toggleMenu()
    })
  }

  // Close menu when nav links are clicked
  headerSmallMenuLinks.forEach((link, index) => {
    link.addEventListener('click', () => {
      console.log('Nav link', index, 'clicked')
      closeMenu()
    })
  })

  // Logo click
  if (headerLogoContainer) {
    headerLogoContainer.addEventListener('click', () => {
      location.href = 'index.html'
    })
  }

  // ✅ ADDED: Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (smallMenu?.classList.contains('header__sm-menu--active') &&
      !smallMenu.contains(event.target) &&
      !hamMenuBtn?.contains(event.target)) {
      closeMenu()
    }
  })
})