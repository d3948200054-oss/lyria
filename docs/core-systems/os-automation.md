# OS Automation

> **Execution over Conversation.**

IRIS translates voice intent into direct, physical actions on your machine. The core automation engine leverages deep native system access to control the desktop environment.

## Native Toolset Execution

IRIS relies on powerful underlying libraries, prominently **Nut.js**, to interact with the operating system at a low level.

### Hardware Injection
- **Keyboard Injection:** IRIS can globally inject keystrokes, simulate complex hotkeys, and perform "phantom typing" to write code or text directly into active windows (e.g., your IDE or terminal).
- **Mouse Control:** Using exact coordinate targeting, IRIS takes control of the cursor to click, drag, and scroll across the UI autonomously.

## System & File Management

The Assistant is granted autonomous disk and window management permissions:

1. **File Operations:** IRIS can scan directories, read specific files, generate code, and write directly to disk.
2. **Window Management:** Capable of launching applications, terminating rogue processes, and reorganizing active desktop windows for optimized workflows.

```mermaid
flowchart TD
    A[Voice Command] --> B[Intent Parsed (Gemini)]
    B --> C{Select Tool}
    C -->|File System| D[Read/Write API]
    C -->|UI Interaction| E[Nut.js Engine]
    C -->|Process| F[OS Exec/Spawn]
    
    D --> G[Local Disk Modified]
    E --> H[Keyboard/Mouse Injected]
    F --> I[Application Launched/Killed]
```

By bridging the gap between natural language and system APIs, IRIS operates as a true desktop operator rather than a passive assistant.
