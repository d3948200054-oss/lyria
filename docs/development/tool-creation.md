# Creating Custom Tools

> **Execution over Conversation.** Tools are the bridge between voice intent and native system actions. 

This guide explains how **IRIS Insider** and **IRIS Builder** tier sponsors can extend the assistant's capabilities by writing custom tools.

## The Tool Architecture

IRIS uses a structured tool execution pipeline. A tool consists of two parts:
1. **The LLM Definition:** A Zod schema defining the tool's inputs for the LangGraph agent.
2. **The IPC Handler:** The native Node.js execution logic in the Electron Main Process.

### 1. Defining the Tool Schema

In your protected `src/main/tools/` directory, define the tool's parameters so the Gemini engine understands when and how to call it.

```typescript
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const lockSystemTool = tool(
  async ({ passcode }) => {
    // This is a placeholder; the actual execution happens via IPC
    return "Triggering system lock.";
  },
  {
    name: 'lock_system',
    description: 'Locks the host operating system immediately.',
    schema: z.object({
      passcode: z.string().describe('The user PIN or passcode if required.'),
    }),
  }
);
```

### 2. Writing the Native Handler

In the `src/main/handlers/` directory, create the actual OS-level execution logic using Electron's `ipcMain`.

```typescript
import { ipcMain } from 'electron';
import { exec } from 'child_process';

export function registerLockSystemHandler() {
  ipcMain.handle('execute-lock-system', async (event, args) => {
    try {
      // Example for Windows
      exec('rundll32.exe user32.dll,LockWorkStation');
      return { success: true, message: 'System locked successfully.' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
```

### 3. Registering the Bridge

Finally, expose the IPC invocation through the `preload.ts` script so the LangGraph orchestrator can safely call it without exposing Node.js modules to the React frontend.

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, data: any) => {
      const validChannels = ['execute-lock-system'];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
    }
  }
});
```

By following this pattern, you ensure that new capabilities are deeply integrated into the native OS while maintaining the strict security boundary of the IPC Bridge.

