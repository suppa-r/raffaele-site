/* JavaScript */
var btn = document.getElementById("Btn");


newNews = function () {
  
  const panelClass = this.getAttribute('aria-controls');
  const panel = document.querySelector(`.crew-details.${panelClass}`);
  if (panel) {
    panel.hidden = false;
    panel.tabIndex = 0;
    panel.focus();
  }
}


btn.addEventListener("click", newNews);
btn.addEventListener("touchstart", newNews);

