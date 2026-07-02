# 🛠️ Tools System

Tools are the bridge between AI reasoning and native OS execution.

## Tool Execution Flow

1. **Intent Recognition:** Voice command parsed.
2. **Tool Selection:** LangGraph selects the appropriate tool.
3. **Execution:** Protected backend executes the native Node.js automation.
4. **Result:** Success or failure is streamed back to the agent.

See [Available Tools](AVAILABLE_TOOLS.md) for a complete list.
