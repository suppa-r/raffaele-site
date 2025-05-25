document.querySelectorAll('.dot-indicators button').forEach(btn => {
  btn.addEventListener('click', 'touch start', function () {
    // Hide all tab panels
    document.querySelectorAll('.crew-details').forEach(panel => {
      panel.hidden = true;
    });

    // Deselect all buttons
    document.querySelectorAll('.dot-indicators button').forEach(b => {
      b.setAttribute('aria-selected', 'false');
      b.tabIndex = -1;
    });

    // Show the topbar (if it was hidden)
    document.querySelector('.topbar').style.display = 'flex';

    // Show the selected panel (by class)
    const panelClass = this.getAttribute('aria-controls');
    const panel = document.querySelector(`.crew-details.${panelClass}`);
    if (panel) {
      panel.hidden = false;
      panel.tabIndex = 0;
      panel.focus();
    }

    // Mark this button as selected
    this.setAttribute('aria-selected', 'true');
    this.tabIndex = 0;
    this.focus();
  });
});

// Optionally, hide all but the first panel on page load:
document.querySelectorAll('.crew-details').forEach((panel, i) => {
  panel.hidden = i !== 0;
});









