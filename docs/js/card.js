const CARD = document.querySelector('.card');
const BOUNDS = CARD.getBoundingClientRect();

function UPDATE(event) {
  const x = event.clientX;
  const y = event.clientY;
  const posX = x - BOUNDS.x;
  const posY = y - BOUNDS.y;
  const ratioX = posX / BOUNDS.width;
  const ratioY = posY / BOUNDS.height;

  CARD.style.setProperty('--ratio-x', ratioX);
  CARD.style.setProperty('--ratio-y', ratioY);

  // Set data-active state based on vertical range
  const verticalRangeStart = BOUNDS.y + (BOUNDS.height * 0.25); // 25% from the top
  const verticalRangeEnd = BOUNDS.y + (BOUNDS.height * 0.75); // 75% from the top

  if (y >= verticalRangeStart && y <= verticalRangeEnd) {
    CARD.dataset.active = "true";
  } else {
    CARD.dataset.active = "false";
    CARD.dataset.parallax = "false";
  }
}

document.body.addEventListener('pointermove', UPDATE);

CARD.addEventListener('pointerenter', () => {
  CARD.dataset.active = "true";
});

CARD.addEventListener('pointerleave', () => {
  CARD.dataset.active = "false";
  CARD.dataset.parallax = "false";
});

CARD.addEventListener('transitionend', event => {
  if (event.target === CARD && event.propertyName === 'transform' && CARD.dataset.active === "true") {
    CARD.dataset.parallax = "true";
  }
});