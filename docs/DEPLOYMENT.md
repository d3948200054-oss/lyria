# 📦 Deployment

Packaging IRIS for distribution.

## Building
Use the following commands depending on your OS:
- `npm run build:win`
- `npm run build:mac`
- `npm run build:linux`

## Electron Builder
Packaging is managed via `electron-builder.yml`, ensuring ASAR integrity and V8 bytecode compilation are applied correctly.
