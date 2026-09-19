import { createServer } from "vite";
import { appendFileSync, mkdirSync } from "node:fs";

mkdirSync("logs", { recursive: true });

function log(msg) {
  const line = `${new Date().toISOString()} ${msg}\n`;
  appendFileSync("logs/dev.log", line);
  console.log(msg);
}

process.on("uncaughtException", (err) => {
  log(`[uncaught] ${err}`);
});
process.on("unhandledRejection", (reason) => {
  log(`[rejection] ${reason}`);
});

const server = await createServer({
  server: {
    host: true,
    port: 8080,
    strictPort: true,
    hmr: false,
    ws: false,
  },
});

await server.listen();

const http = server.httpServer;
if (http) {
  http.removeAllListeners("upgrade");
  http.on("upgrade", (_req, socket) => {
    socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
  });
}

server.printUrls();
log("[dev] ready, websocket off");
