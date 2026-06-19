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
