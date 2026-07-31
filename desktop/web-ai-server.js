import { WebSocketServer } from "ws";

export const WEB_AI_PORT = 47582;

export function parseWebAiMessage(value) {
  let message;
  try {
    message = JSON.parse(String(value));
  } catch {
    return null;
  }

  if (
    message?.type !== "ai-state" ||
    typeof message.source !== "string" ||
    message.source.length < 1 ||
    message.source.length > 160 ||
    typeof message.active !== "boolean"
  ) {
    return null;
  }

  return {
    source: message.source.replace(/[^a-zA-Z0-9:._-]/g, "_"),
    active: message.active,
    mode:
      message.active && message.mode === "thinking" ? "thinking" : "writing"
  };
}

export class WebAiServer {
  constructor(onChange) {
    this.onChange = onChange;
    this.server = null;
    this.nextClientId = 1;
  }

  start() {
    this.server = new WebSocketServer({
      host: "127.0.0.1",
      port: WEB_AI_PORT,
      maxPayload: 2048
    });

    this.server.on("connection", (socket, request) => {
      const address = request.socket.remoteAddress ?? "";
      if (!/^(127\.0\.0\.1|::1|::ffff:127\.0\.0\.1)$/.test(address)) {
        socket.close();
        return;
      }

      const clientId = this.nextClientId++;
      const activeSources = new Set();

      socket.on("message", (data) => {
        const message = parseWebAiMessage(data);
        if (!message) return;

        const source = `web:${clientId}:${message.source}`;
        if (message.active) {
          activeSources.add(source);
        } else {
          activeSources.delete(source);
        }
        this.onChange(source, message.active ? message.mode : false);
      });

      socket.on("close", () => {
        for (const source of activeSources) {
          this.onChange(source, false);
        }
        activeSources.clear();
      });
    });

    this.server.on("error", (error) => {
      if (error.code !== "EADDRINUSE") {
        console.error("web-ai-server", error.message);
      }
    });
  }

  async stop() {
    if (!this.server) return;
    for (const socket of this.server.clients) socket.close();
    await new Promise((resolve) => this.server.close(resolve));
    this.server = null;
  }
}
