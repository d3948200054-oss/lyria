# Troubleshooting & Common Issues

When dealing with low-level native OS execution, WebRTC, and local vector databases, you may occasionally encounter build or runtime issues. Here are the common resolutions.

## Native Module Compilation Errors

IRIS relies on native C++ modules (like Nut.js for hardware injection and LanceDB for vector storage). 

### "Node-gyp rebuild failed"
This occurs if your operating system lacks the required build tools for compiling native Node addons.

**Windows Solution:**
Run the following command in an Administrator PowerShell to install the C++ build tools and Python:
```bash
npm install --global windows-build-tools
```

**macOS Solution:**
Ensure Xcode Command Line Tools are installed:
```bash
xcode-select --install
```

## Voice Engine & Audio Pipeline

### "WebRTC Audio Context Suspended"
Browser security policies prevent audio from playing or recording without initial user interaction. 

**Solution:** Ensure you physically click the interface (e.g., the "Activate" or "Microphone" button) at least once before issuing voice commands.

### "WebSocket Buffer Overflow"
If the Gemini 3.1 Live API connection drops unexpectedly during long speeches.

**Solution:** Check your `AudioWorklet` processor. Ensure you are adhering to the 4096-frame chunking rule. Sending raw, unbuffered audio streams will flood the connection and result in the API terminating the socket.

## Security Vault Decryption Failures

### "safeStorage decryption failed"
This happens if the OS credential manager state changes (e.g., you reset your Windows password, or migrated the `.json` vault file to a new machine).

**Solution:** The BYOK philosophy means keys are encrypted explicitly for the hardware and user profile that created them. You cannot migrate an encrypted vault to a new PC. 
1. Delete your local `iris_secure_vault.json` file.
2. Launch the application.
3. Re-enter your API keys in the Settings panel to generate a new hardware-locked vault.

