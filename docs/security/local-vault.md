# Security and the Local Vault

IRIS has deep system-level execution privileges. To secure these capabilities, the architecture enforces a strict zero-trust, local-first security model.

## The BYOK Philosophy

IRIS operates on a **Bring Your Own Key (BYOK)** model. The system requires external API credentials (e.g., Gemini, Groq, Tavily) to function, but we do not provide, manage, or proxy these keys. 

You control your own credentials. If a key is revoked, IRIS loses access immediately.

## Electron safeStorage

To secure user API keys, IRIS utilizes the native OS secure keychain (Windows Credential Manager, macOS Keychain, or Linux Secret Service) via Electron's `safeStorage` API.

1. The user inputs their keys directly into the IRIS settings UI.
2. The UI sends the plaintext keys across the secure IPC bridge.
3. The Main Process encrypts the keys using `safeStorage`.
4. The encrypted strings are stored locally on the disk.

When IRIS needs to make an API call, the Main Process decrypts the key in memory. The plaintext key is **never** sent back to the React frontend.

## The Ban on .env Files

In standard web development, `.env` files are common. **IRIS explicitly bans plaintext `.env` files for production credential storage.**

Storing highly privileged API keys in plaintext on a local file system exposes them to unauthorized access, malicious scripts, and accidental commits. By enforcing OS-level keychain encryption, IRIS ensures enterprise-grade security for your credentials.