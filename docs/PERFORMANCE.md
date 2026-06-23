> **[TIER ALIGNMENT: IRIS PRO COMMERCIAL LICENSE REQUIRED]**
> *This document covers core voice orchestration loops, tools, and execution pipelines protected under the ₹499 IRIS PRO License.*

# ⚡ Performance

Rules for keeping the Neural OS ultra-responsive.

## R3F Constraints
- Cap pixel ratios: `<Canvas dpr={[1, 1.5]}>`.
- Disable depth writing for transparent particles.

## Audio Constraints
- Use exact 4096 frame buffers. Do not flood the Node.js event loop with micro-buffers.
