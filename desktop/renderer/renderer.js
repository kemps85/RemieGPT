const pet = document.querySelector("#pet");
const animation = document.querySelector("#animation");
const status = document.querySelector("#status");

// Warm the local GIFs while Remi is idle. This makes the first transition to
// thinking/writing an immediate swap instead of waiting for disk decoding.
const warmedAnimations = [
  "idle.gif",
  "thinking.gif",
  "writing.gif",
  "waiting-input.gif",
  "result.gif"
].map((filename) => {
  const image = new Image();
  image.src = new URL(`../../assets/source/${filename}`, window.location.href).href;
  image.decode?.().catch(() => {});
  return image;
});

window.remi.onState((state) => {
  if (animation.src !== state.src) {
    // Abort the old GIF before assigning the next one. A new state must never
    // wait for the previous animation cycle to reach its last frame.
    animation.removeAttribute("src");
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
