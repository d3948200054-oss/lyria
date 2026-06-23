> **[TIER ALIGNMENT: IRIS COMMUNITY EDITION (Free & Open Source)]**
> *Access to the high-performance desktop framework shell (Electron + Vite + React 19 + Tailwind v4).*

# 📝 Examples

## Creating a Custom Tool (Sponsors Only)

```typescript
ipcMain.handle('my-custom-tool', async (event, data) => {
  try {
    const result = await someNativeAction(data);
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e.message };
  }
});
```
