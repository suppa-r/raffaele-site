document.querySelectorAll('.dot-indicators button').forEach(btn => {
  btn.addEventListener('click', function() {
    // Hide all crew-details panels
    document.querySelectorAll('.crew-details').forEach(panel => {
      panel.hidden = true;
    });

    // Remove aria-selected from all buttons
    document.querySelectorAll('.dot-indicators button').forEach(b => {
      b.setAttribute('aria-selected', 'false');
      b.tabIndex = -1;
    });

    // Show the selected panel
    const panelId = this.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.hidden = false;
      panel.tabIndex = 0;
      panel.focus();
}

    // Set this button as selected
    this.setAttribute('aria-selected', 'true');
    this.tabIndex = 0;
    this.focus();
  }
  );
  // Set the first button as selected by default
  });
