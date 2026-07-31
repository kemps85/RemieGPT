const SERVER = "ws://127.0.0.1:47582";
const states = new Map();

let socket;
let reconnectTimer;
let focusedWindowId = chrome.windows.WINDOW_ID_NONE;
let selectedSource = null;

function send(source, state) {
  if (socket?.readyState !== WebSocket.OPEN) return;
  socket.send(
    JSON.stringify({
      type: "ai-state",
      source,
      active: state.active,
      mode: state.mode,
      reason: state.reason
    })
  );
}

function sourceFor(tab) {
  return `${tab.windowId}:${tab.id}`;
}

async function selectActiveTab(windowId) {
  focusedWindowId = windowId;
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;

  const [tab] = await chrome.tabs.query({ active: true, windowId });
  if (!tab) return;

  const source = sourceFor(tab);
  selectedSource = source;
  const state = states.get(source);
  if (state?.active) send(source, state);
}

function connect() {
  clearTimeout(reconnectTimer);
  socket = new WebSocket(SERVER);

  socket.addEventListener("open", () => {
    if (selectedSource && states.get(selectedSource)?.active) {
      send(selectedSource, states.get(selectedSource));
    }
  });

  socket.addEventListener("close", () => {
    reconnectTimer = setTimeout(connect, 2000);
  });

  socket.addEventListener("error", () => {
    socket.close();
  });
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (
    message?.type !== "remie-ai-state" ||
    typeof message.active !== "boolean" ||
    !sender.tab?.id
  ) {
    return;
  }

  const source = sourceFor(sender.tab);
  const state = {
    active: message.active,
    mode: message.mode === "thinking" ? "thinking" : "writing",
    reason: message.active ? null : "finished"
  };
  states.set(source, state);

  if (sender.tab.windowId === focusedWindowId && sender.tab.active) {
    if (selectedSource && selectedSource !== source) {
      send(selectedSource, { active: false, mode: null, reason: "background" });
    }
    selectedSource = source;
    send(source, state);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  for (const source of states.keys()) {
    if (source.endsWith(`:${tabId}`)) {
      send(source, { active: false, mode: null, reason: "background" });
      if (selectedSource === source) selectedSource = null;
      states.delete(source);
    }
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url) return;
  for (const source of states.keys()) {
    if (source.endsWith(`:${tabId}`)) {
      send(source, { active: false, mode: null, reason: "background" });
      if (selectedSource === source) selectedSource = null;
      states.delete(source);
    }
  }
});

chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
  if (windowId !== focusedWindowId) return;
  const nextSource = `${windowId}:${tabId}`;
  if (nextSource === selectedSource) return;
  if (selectedSource) {
    send(selectedSource, { active: false, mode: null, reason: "background" });
  }
  selectedSource = nextSource;
  const state = states.get(nextSource);
  if (state?.active) send(nextSource, state);
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (selectedSource) {
    send(selectedSource, { active: false, mode: null, reason: "background" });
  }
  selectedSource = null;
  selectActiveTab(windowId).catch(() => {});
});

chrome.windows
  .getLastFocused({ populate: true })
  .then((window) => selectActiveTab(window.id))
  .catch(() => {});

connect();
