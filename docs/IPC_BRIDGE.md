> **[TIER ALIGNMENT: IRIS PRO COMMERCIAL LICENSE REQUIRED]**
> *This document covers core voice orchestration loops, tools, and execution pipelines protected under the ₹499 IRIS PRO License.*

# 🌉 Inter-Process Communication (IPC)

The IPC Bridge secures the boundary between the untrusted UI and the protected OS-level backend.

## Strict Rules
- The React frontend MUST NOT import `fs`, `path`, or `child_process`.
- All system actions use `window.electron.ipcRenderer.invoke()`.

## Example
```typescript
// Frontend
await window.electron.ipcRenderer.invoke('secure-save-keys', data);
```
