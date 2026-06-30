# 🏗️ System Architecture

IRIS operates on a strictly separated architecture for maximum security and performance.

## 1. Frontend (React 19)
The user interface, written in React and styled with Tailwind CSS v4 and Framer Motion. 
Responsible for:
- Voice capture (WebRTC)
- 3D Visualizations (R3F)
- Desktop overlays and widgets

## 2. Backend (Electron Main)
The protected core running Node.js.
Responsible for:
- LangGraph orchestration
- Native OS automation (nut.js, puppeteer)
- Local LanceDB vector embeddings

## 3. The IPC Bridge
See [IPC Bridge](IPC_BRIDGE.md) for details on how the Renderer and Main processes communicate.
