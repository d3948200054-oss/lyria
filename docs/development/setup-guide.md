# Development Setup Guide

This guide details the process for standing up the IRIS development environment.

## Prerequisites

Ensure your system meets the following requirements:
- **OS:** Windows 10/11, macOS (Apple Silicon recommended), or Ubuntu Linux.
- **Runtime:** Node.js v23+
- **Version Control:** Git
- **IDE:** VS Code or Cursor recommended.

## Option 1: Free Tier (UI Shell Development)

For developers looking to explore or contribute to the React frontend, you can use the public repository. Note that core system execution tools are stubbed or disabled in this tier.

```bash
# 1. Clone the public repository
git clone https://github.com/IRISX-AI/IRIS-AI

# 2. Navigate into the directory
cd IRIS-AI

# 3. Install dependencies
npm install

# 4. Start the Vite development server
npm run dev
```

## Option 2: IRIS Insider (Core Access)

To unlock actual Voice-First Desktop Assistant functionality, you must be a GitHub Sponsor at the **IRIS Insider ($15/mo)** tier. This grants you access to the private `iris-insiders` repository.

```bash
# 1. Ensure you have accepted the GitHub invitation to the private repo after sponsoring.

# 2. Clone the private insiders repository
git clone https://github.com/IRISX-AI/iris-insiders

# 3. Navigate into the directory
cd iris-insiders

# 4. Install dependencies
npm install

# 5. Launch the full application
npm run dev
```

### Linking Modules
If you are developing custom tools, place your integration logic within the protected Main Process directory. Ensure that any new IPC channels are properly registered in the `preload` script before invoking them from the React frontend.
