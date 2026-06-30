# ⚡ Performance

Rules for keeping the Neural OS ultra-responsive.

## R3F Constraints
- Cap pixel ratios: `<Canvas dpr={[1, 1.5]}>`.
- Disable depth writing for transparent particles.

## Audio Constraints
- Use exact 4096 frame buffers. Do not flood the Node.js event loop with micro-buffers.
