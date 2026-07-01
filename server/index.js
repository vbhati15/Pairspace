import { createServer } from 'http';
import { setupWSConnection } from 'y-websocket/bin/utils';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 1234;

const server = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('PairSpace sync server is running');
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  // Extract room name from URL path e.g. /room-abc123
  const roomName = req.url?.slice(1) || 'default-room';
  console.log(`[PairSpace] Client connected to room: ${roomName}`);

  setupWSConnection(ws, req, { docName: roomName });

  ws.on('close', () => {
    console.log(`[PairSpace] Client left room: ${roomName}`);
  });
});

server.listen(PORT, () => {
  console.log(`[PairSpace] Sync server running on ws://localhost:${PORT}`);
});
