const SERVER = "ws://127.0.0.1:47582";
const states = new Map();

let socket;
let reconnectTimer;

function send(source, state) {
  if (socket?.readyState !== WebSocket.OPEN) return;
  socket.send(
    JSON.stringify({
      type: "ai-state",
      source,
      active: state.active,
      mode: state.mode
    })
  );
}

function connect() {
  clearTimeout(reconnectTimer);
  socket = new WebSocket(SERVER);

  socket.addEventListener("open", () => {
    for (const [source, state] of states) send(source, state);
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

  const host = String(message.host || "ai-web").replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );
  const source = `${host}:${sender.tab.id}`;
  const state = {
    active: message.active,
    mode: message.mode === "thinking" ? "thinking" : "writing"
  };
  states.set(source, state);
  send(source, state);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  for (const source of states.keys()) {
    if (source.endsWith(`:${tabId}`)) {
      send(source, { active: false, mode: null });
      states.delete(source);
    }
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url) return;
  for (const source of states.keys()) {
    if (source.endsWith(`:${tabId}`)) {
      send(source, { active: false, mode: null });
      states.delete(source);
    }
  }
});

connect();
