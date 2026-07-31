const pet = document.querySelector("#pet");
const animation = document.querySelector("#animation");
const status = document.querySelector("#status");

window.remi.onState((state) => {
  if (animation.src !== state.src) {
    animation.src = state.src;
  }
  status.textContent = state.label;
  pet.dataset.state = state.name;
  document.title = `RemieGPT — ${state.label}`;
});

window.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  window.remi.showMenu();
});

pet.addEventListener("mouseenter", () => window.remi.setHovering(true));
pet.addEventListener("mouseleave", () => window.remi.setHovering(false));

let dragPointerId = null;

function finishDrag(event) {
  if (dragPointerId === null) return;
  if (event?.pointerId !== undefined && event.pointerId !== dragPointerId) return;
  const finishedPointerId = dragPointerId;
  dragPointerId = null;
  if (pet.hasPointerCapture?.(finishedPointerId)) {
    pet.releasePointerCapture(finishedPointerId);
  }
  pet.classList.remove("dragging");
  window.remi.endDrag();
}

pet.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  dragPointerId = event.pointerId;
  pet.setPointerCapture?.(event.pointerId);
  pet.classList.add("dragging");
  window.remi.startDrag(event.screenX, event.screenY);
});

pet.addEventListener("pointermove", (event) => {
  if (event.pointerId === dragPointerId) window.remi.moveDrag();
});
pet.addEventListener("pointerup", finishDrag);
pet.addEventListener("pointercancel", finishDrag);
pet.addEventListener("lostpointercapture", finishDrag);
window.addEventListener("blur", finishDrag);
