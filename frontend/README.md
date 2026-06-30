# PairSpace — Real-Time Collaborative Code Editor (Phase 1)

## Current Status: Phase 1 — Basic Editor

This is the foundation: a working Monaco-based code editor (same engine as VS Code) with language switching. Real-time collaboration (Y.js + WebSockets) comes in Phase 2.

## Tech Stack
- React + Vite
- Monaco Editor (`@monaco-editor/react`)
- Y.js + y-websocket + y-monaco (installed, wired in Phase 2)

## Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## Roadmap

- [x] Phase 1: Monaco editor, language switching
- [ ] Phase 2: Y.js real-time sync + WebSocket server
- [ ] Phase 3: Multi-cursor presence with user colors
- [ ] Phase 4: Room creation/joining via shareable links
- [ ] Phase 5: Sandboxed code execution (Docker)
- [ ] Phase 6: Guest auth + active users sidebar
- [ ] Phase 7: Persistence (save/load room state)
- [ ] Phase 8: Deploy (Railway backend + Vercel frontend)
