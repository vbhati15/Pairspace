# PairSpace

> Real-time collaborative code editor — like Google Docs, but for code.

## Tech Stack
- **Frontend**: React + Vite + Monaco Editor
- **Sync**: Y.js (CRDTs) + y-websocket
- **Presence**: Y.js Awareness API (multi-cursor, user colors)
- **Backend**: Node.js WebSocket server

## Architecture
```
Browser A ──┐
             ├──► WebSocket Server (y-websocket) ──► Y.js CRDT merge
Browser B ──┘
```

## Running Locally

### 1. Start the sync server
```bash
cd server
npm install
npm run dev
```
Server runs on `ws://localhost:1234`

### 2. Start the frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### 3. Test real-time sync
- Open `http://localhost:5173` in two browser tabs
- Both tabs share the same room (via URL hash)
- Type in one tab — see it appear instantly in the other

## Features
- [x] Phase 1: Monaco editor, language switching
- [x] Phase 2: Y.js real-time sync via WebSockets
- [x] Phase 3: Multi-cursor presence (user names + colors)
- [ ] Phase 4: Room creation/joining via shareable links
- [ ] Phase 5: Sandboxed code execution (Docker)
- [ ] Phase 6: Guest auth + active users sidebar
- [ ] Phase 7: Persistence (save/load room state)
- [ ] Phase 8: Deploy

## Roadmap
Built incrementally across 8 phases. Each phase is a separate commit.
