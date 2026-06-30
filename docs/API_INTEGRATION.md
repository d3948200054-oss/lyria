# 🔌 API Integration

IRIS uses an absolute Zero-Trust, local-only keychain for API integrations.

## Core APIs
- **Gemini API:** Required for Voice.
- **Groq API:** Required for ultra-fast fallback.
- **Tavily:** Required for Deep Research.

Keys are stored using the OS-native keychain (`safeStorage`) and are NEVER stored in a plaintext `.env` file in production.
