# 🧠 Agent Orchestration

IRIS relies on **LangGraph** (protected) for complex state machine routing and agent logic.

## State Management
The agent loops through intent recognition, tool selection, and execution verification.

## Local Fallback
While Gemini 3.1 Live API is primary, IRIS can fall back to ultra-fast Groq APIs or local Hugging Face models for specific tasks.

*(Note: The exact graph structure is closed-source to protect the proprietary execution models).*

