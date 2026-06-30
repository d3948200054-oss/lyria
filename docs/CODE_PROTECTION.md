# 🔐 Code Protection

IRIS employs enterprise-grade code protection.

## V8 Bytecode Compilation
All core logic (`src/main`) is compiled to unreadable `.jsc` binary bytecode using `electron-vite`.

## ASAR Integrity
The application bundle is hashed. Tampering with the ASAR file causes immediate runtime crashes.

See [Security](SECURITY.md) for reporting vulnerabilities.
