const STOP_TEXT =
  /^(stop|stop generating|stop response|stop responding|cancel|dừng|dừng tạo|dừng phản hồi|ngừng tạo|ngừng phản hồi|hủy)$/i;

const DIRECT_SELECTORS = [
  '[data-testid="stop-button"]',
  '[data-testid="stop-response-button"]',
  '[data-is-streaming="true"]',
  '[data-state="streaming"]',
  'button[aria-label*="Stop generating" i]',
  'button[aria-label*="Stop response" i]',
  'button[aria-label*="Stop responding" i]',
  'button[aria-label*="Cancel" i]',
  'button[aria-label*="Dừng tạo" i]',
  'button[aria-label*="Dừng phản hồi" i]',
  'button[title*="Stop generating" i]',
  'button[title*="Stop response" i]'
];

let lastActive = null;
let lastMode = null;
let scheduled = false;

function isVisible(element) {
  if (!(element instanceof HTMLElement)) return false;
  const style = getComputedStyle(element);
  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    Number(style.opacity) === 0
  ) {
    return false;
  }
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function accessibleText(element) {
  return (
    element.getAttribute("aria-label") ||
    element.getAttribute("title") ||
    element.textContent ||
    ""
  )
    .trim()
    .replace(/\s+/g, " ");
}

function isGenerating() {
  for (const selector of DIRECT_SELECTORS) {
    const elements = document.querySelectorAll(selector);
    if ([...elements].some(isVisible)) return true;
  }

  const buttons = document.querySelectorAll('button,[role="button"]');
  return [...buttons].some(
    (button) => isVisible(button) && STOP_TEXT.test(accessibleText(button))
  );
}

function generationMode() {
  const thinkingSelectors = [
    // Stable site-specific signals used by ChatGPT, Claude, and Gemini.
    '[data-testid="reasoning-block"]',
    '.reasoning-block',
    '[data-testid="thinking-block"]',
    '.thinking-block',
    '[data-is-thinking="true"]',
    'gdm-thought-viewer',
    'thought-viewer',
    '.thought-container',
    '[data-testid*="thinking" i]',
    '[aria-label*="Thinking" i]',
    '[aria-label*="Reasoning" i]',
    '[aria-label*="Đang suy nghĩ" i]',
    '[aria-label*="Suy luận" i]'
  ];
  for (const selector of thinkingSelectors) {
    if ([...document.querySelectorAll(selector)].some(isVisible)) {
      return "thinking";
    }
  }
  return "writing";
}

function report(force = false) {
  scheduled = false;
  const active = isGenerating();
  const mode = active ? generationMode() : null;
  if (!force && active === lastActive && mode === lastMode) return;
  lastActive = active;
  lastMode = mode;
  chrome.runtime.sendMessage({
    type: "remie-ai-state",
    active,
    mode,
    host: location.hostname
  });
}

function scheduleReport() {
  if (scheduled) return;
  scheduled = true;
  setTimeout(report, 120);
}

new MutationObserver(scheduleReport).observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: [
    "aria-label",
    "aria-busy",
    "data-is-streaming",
    "data-is-thinking",
    "data-state",
    "disabled"
  ]
});

window.addEventListener("pagehide", () => {
  chrome.runtime.sendMessage({
    type: "remie-ai-state",
    active: false,
    mode: null,
    host: location.hostname
  });
});

setInterval(() => report(true), 15_000);
report(true);
