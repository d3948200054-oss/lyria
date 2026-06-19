import { shell } from 'electron'

export async function openFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const error = await shell.openPath(filePath)

    if (error) {
      return { success: false, error }
    }

    return { success: true }
  } catch (e) {
    return { success: false, error: 'Internal System Error' }
  }
}

export async function revealFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    shell.showItemInFolder(filePath)
    return { success: true }
  } catch (e) {
    return { success: false, error: 'Failed to reveal item' }
  }
}