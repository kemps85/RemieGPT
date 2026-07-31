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
