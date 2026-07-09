import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and suppress benign WebSocket/HMR errors in iframe environment to prevent noisy overlays
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    const msg = event.message || "";
    if (
      msg.includes("websocket") ||
      msg.includes("WebSocket") ||
      msg.includes("vite") ||
      msg.includes("HMR")
    ) {
      console.warn("Suppressed benign iframe/Vite error:", msg);
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const msg = reason ? (reason.message || String(reason)) : "";
    if (
      msg.includes("websocket") ||
      msg.includes("WebSocket") ||
      msg.includes("vite") ||
      msg.includes("HMR")
    ) {
      console.warn("Suppressed benign iframe/Vite rejection:", msg);
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for offline PWA support
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then((reg) => {
        console.log("Service Worker registered successfully on scope:", reg.scope);
      })
      .catch((err) => {
        console.log("Service Worker registration failed:", err);
      });
  });
}

