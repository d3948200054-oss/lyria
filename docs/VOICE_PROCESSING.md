# 🎙️ Voice Processing

IRIS is built around a real-time conversational WebRTC audio pipeline using the **Gemini 3.1 Live API**.

## Audio Capture
Audio is captured via the browser's `AudioWorklet` and buffered in 4096-frame chunks (~250ms).

## The 250ms Rule
Do NOT flood the WebSocket. Audio must be buffered before being base64-encoded and sent to Gemini.

## Interruption Handling (VAD)
If Voice Activity Detection (VAD) triggers or `serverContent.interrupted` is true, the local audio queues are instantly flushed and playback nodes are stopped.
