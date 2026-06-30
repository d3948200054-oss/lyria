# Voice Engine

IRIS is fundamentally designed as a Voice-First Desktop Assistant. The voice processing pipeline is engineered for sub-500ms latency, enabling fluid, duplex conversational interactions.

## WebRTC Audio Pipeline

Audio processing relies on a continuous, real-time WebRTC stream.

1. **Capture:** The browser's `AudioWorklet` captures raw microphone input.
2. **Buffering:** To prevent WebSocket flooding, audio is buffered into precise chunks (e.g., 4096 frames).
3. **Transmission:** The buffered audio is base64-encoded and transmitted to the language model.
4. **VAD (Voice Activity Detection):** The system actively monitors for interruptions. If the user speaks while IRIS is responding, the audio playback queues are instantly flushed, halting current output to listen to the new command.

## AI Engine Routing

IRIS dynamically routes requests based on task complexity and latency requirements.

| Engine | Primary Use Case | Execution Profile |
| :--- | :--- | :--- |
| **Google Gemini Live API** | Primary Voice & Vision | Handles the core conversational loop and complex, multimodal task orchestration over WebRTC. |
| **Groq** | Low-Latency Routing | Utilized for split-second decisions, rapid tool routing, and fast fallback text-generation. |
| **Hugging Face** | Local Media & Tasks | Manages local inference for specific media parsing or offline fallback tasks. |
| **Tavily** | Deep Search | Executes high-speed, agentic web crawling when external research is required. |

This multi-model architecture ensures IRIS always uses the optimal engine for the specific execution requirement.
