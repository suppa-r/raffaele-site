document.querySelectorAll('.dot-indicators button').forEach(btn => {
  // Handler function for both click and touchstart
  function handleTabEvent() {
    // Hide all tab panels
    document.querySelectorAll('.crew-details').forEach(panel => {
      panel.hidden = true;
    });

    // Deselect all buttons
    document.querySelectorAll('.dot-indicators button').forEach(b => {
      b.setAttribute('aria-selected', 'false');
      b.tabIndex = -1;
    });

    // Reset focus to the first button
    document.querySelector('.dot-indicators button').focus();
    // Reset tabIndex for all buttons
    document.querySelectorAll('.dot-indicators button').forEach(b => {
      b.tabIndex = -1;
    });
    // Reset focus to the clicked button
    this.tabIndex = 0;
    this.focus();
    // Set aria-selected to true for the clicked button
    this.setAttribute('aria-selected', 'true');
    // Reset focus to the clicked button
   

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
  }

  btn.addEventListener('click', handleTabEvent);
  btn.addEventListener('touchstart', handleTabEvent);
});

// Optionally, hide all but the first panel on page load:
document.querySelectorAll('.crew-details').forEach((panel, i) => {
  panel.hidden = i !== 0;
});








