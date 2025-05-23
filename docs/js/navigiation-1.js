document.querySelectorAll('.dot-indicators button').forEach(btn => {
  btn.addEventListener('click', function () {
    // Hide all tab panels
    document.querySelectorAll('.crew-details').forEach(panel => {
      panel.hidden = true;
    });

    // Deselect all buttons
    document.querySelectorAll('.dot-indicators button').forEach(b => {
      b.setAttribute('aria-selected', 'false');
      b.tabIndex = -1;
    });

    // Show the selected panel using class selector
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