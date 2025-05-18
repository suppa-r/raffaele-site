  const logo = document.querySelector('.logo')

function showSidebar() {
    const sidebar = document.querySelector('.sidebar')
  sidebar.style.display = 'flex'
  logo.style.display = 'none'
  }
  function hideSidebar() {
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'none'
    logo.style.display = 'block'
  }
