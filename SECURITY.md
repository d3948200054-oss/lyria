# Security Policy

If you believe you've found a legitimate security vulnerability in the IRIS Neural OS Agent, please report it privately. Do not open public GitHub issues for critical zero-days, Remote Code Execution (RCE) flaws, or IPC bridge escapes.

## Reporting

Report vulnerabilities directly via email to the Lead Architect:

- **irisaidevop@gmail.com**

Please allow up to 48 hours for an initial response. IRIS is currently a solo-developed project, but all severe reports affecting the integrity of the host machine are triaged with the highest priority.

### Required in Reports

To ensure rapid triage, please include:

1. **Title & Severity Assessment** (Low/Medium/High/Critical)
2. **Affected Component** (e.g., Main Process IPC, React UI, LanceDB Oracle, Protected Core Tooling)
3. **Technical Reproduction** (Exact steps to trigger the flaw)
4. **Demonstrated Impact** (What does this allow an attacker to do?)
5. **Environment** (OS Version, IRIS Version)
6. **Remediation Advice** (Suggested fix, if applicable)

_Reports without clear reproduction steps or demonstrated impact will be deprioritized._

---

## 🔒 Auditing the Protected Core

As IRIS operates on a dual-license/sponsorship model, the React frontend is open-source, while the core Node.js backend (Voice Engine, Tool Execution, OS Automation) is **closed-source and compiled into V8 Bytecode**.

- **Black-Box Testing:** Security researchers are welcome and encouraged to perform black-box testing against the compiled binaries (`.exe`, `.app`, `.AppImage`).
- **Source-Code Auditing:** If you are an active sponsor in the **Enterprise** or **Insider** tiers with source-code access, you are bound by your respective license agreements, but responsible disclosure of vulnerabilities found during source review is highly appreciated.

---

## 🛡️ IRIS Trust & Threat Model (CRITICAL)

IRIS is **not** a cloud-based web app. It is a local, kernel-level Operating System extension built on Electron. Because of this, the security model operates under the **"Trusted Operator"** paradigm.

### 1. The Trusted Operator Assumption

IRIS assumes that anyone who has unlocked the host machine and launched the application is the **Trusted Operator**.

- IRIS is designed to execute commands, read files, click the screen, and modify the OS on behalf of the user.
- **If a user explicitly asks IRIS to delete a file, and IRIS deletes it, that is a feature, not a vulnerability.** - Vulnerabilities are strictly defined as actions taken _without_ the user's consent, or malicious escalation _bypassing_ the IPC bridge.

### 2. Single-User Boundary

IRIS does **not** model one installation as a multi-tenant, adversarial boundary.

- It is designed for one user per machine/OS profile.
- If multiple mutually untrusted users share the same OS login profile, the security boundary is already broken at the OS level, not by IRIS.

### 3. 100% BYOK (Bring Your Own Key) Architecture

Privacy is absolute. IRIS operates on a strict zero-trust architecture regarding external servers.

- **Your API keys (Gemini, Groq, Tavily, Hugging Face) NEVER touch our servers.**
- Credentials are encrypted locally using your Operating System's native secure keychain:
  - **Windows:** `DPAPI` via Electron `safeStorage`
  - **macOS:** Apple Keychain
  - **Linux:** Secret Service API
- The keys are stored in a local, encrypted `iris_secure_vault.json` file.
- **Out of Scope:** Reports demonstrating that a malicious actor who _already has root access_ to your machine can decrypt this file are out of scope. If an attacker has root, the machine is already compromised.

---

## ❌ Out of Scope

The following scenarios are considered expected behavior under the IRIS threat model and will be closed as `invalid` or `no-action`:

1. **Prompt Injection (Without Boundary Bypass):** "Tricking" the LLM via text injection is out of scope _unless_ it results in an unauthorized bypass of the Electron IPC bridge or executes a restricted OS command without user confirmation.
2. **Local Physical Access:** Any attack that requires the attacker to physically sit at the unlocked host machine.
3. **Malicious Workspace Files:** "An attacker writes a malicious payload into `notes.txt`, and the RAG Oracle reads it." Reading files is the Oracle's job. Unless you can prove the RAG pipeline executes the text as arbitrary code, this is out of scope.
4. **Expected OS Execution:** Reports treating explicit operator-control surfaces (like the `run_terminal` or `click_on_screen` tools) as vulnerabilities. These are intentional, trusted-operator features.
5. **Missing Network Headers:** Missing HSTS or similar web-centric headers on local Electron `file://` or `localhost` protocols.
6. **Bytecode Extraction:** Attempting to reverse-engineer the V8 `.jsc` files to extract the proprietary source code is a licensing violation, not a security vulnerability report.

---

## ✅ In Scope (High Priority)

We are highly interested in reports regarding:

1. **IPC Bridge Escapes:** Any method where the untrusted React Renderer process can execute arbitrary Node.js code in the Main Process without using the predefined `ipcMain.handle` channels.
2. **Remote Code Execution (RCE):** Any method where an external, remote attacker can force the IRIS engine to execute code without the local Trusted Operator's consent.
3. **Vault Key Leakage:** Flaws in how `safeStorage` encrypts/decrypts the BYOK credentials, leading to keys being logged in plaintext, exposed to the Renderer process unnecessarily, or leaked over the network.
4. **Path Traversal:** Flaws in the file management tools that allow the AI to bypass intended directory restrictions (if configured) during autonomous operations.

---

## Bug Bounties & Rewards

Currently, IRIS does not have a funded cash bug bounty program.

However, responsible disclosure of **Critical** vulnerabilities (such as confirmed RCE or IPC escapes) will be rewarded with **Complimentary Lifetime Enterprise/Alpha Sponsorship Access**, granting you full, unrestricted access to the closed-source backend codebase and direct architectural communication lines with the developer.