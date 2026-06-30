# 🚑 Troubleshooting

Common issues and their resolutions.

## 1. WebRTC Audio Dropouts
**Fix:** Ensure your Gemini API key has sufficient quota for Live streaming. Check the `serverContent.interrupted` logs.

## 2. IPC Timeout Errors
**Fix:** The backend tool execution took too long (likely a blocking `fs` operation). Ensure heavy operations are asynchronous.

## 3. Blank Screen on Launch
**Fix:** React Three Fiber (R3F) crashed due to WebGL issues. Verify your GPU supports `high-performance` power preference.
