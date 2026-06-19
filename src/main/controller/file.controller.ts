import { exec } from 'child_process'
import os from 'os'
import path from 'path'
import fs from 'fs/promises'
import { app, shell } from 'electron'

const runCommand = (cmd: string): Promise<string> => {
  return new Promise((resolve) => {
    exec(cmd, (err, stdout) => {
      resolve(err ? '' : stdout.trim())
    })
  })
}

export async function getRunningApps(): Promise<string[]> {
  try {
    if (os.platform() === 'win32') {
      const cmd = `powershell "Get-Process | Where-Object {$_.MainWindowTitle -ne ''} | Select-Object -ExpandProperty ProcessName"`
      const output = await runCommand(cmd)
      const apps = output
        .split(/\r?\n/)
        .map((a) => a.trim())
        .filter((a) => a)
      return [...new Set(apps)]
    }

    if (os.platform() === 'darwin') {
      const cmd = `osascript -e 'tell application "System Events" to get name of (processes where background only is false)'`
      const output = await runCommand(cmd)
      return output.split(', ').map((s) => s.trim())
    }

    return []
  } catch (e) {
    return []
  }
}

export async function openFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const error = await shell.openPath(filePath)
    if (error) return { success: false, error }
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

export async function readDirectory(directoryPath: string): Promise<string> {
  try {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true })
    if (entries.length === 0) return 'Directory is empty.'

    const structuredList = entries.map((entry) => {
      const marker = entry.isDirectory() ? '[FOLDER]' : '[FILE]'
      return `${marker} ${entry.name}`
    })

    return structuredList.join('\n')
  } catch (err) {
    return `Error reading directory: ${err}`
  }
}

export async function readFile(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return content.length > 3000 ? content.slice(0, 3000) + '\n...(Truncated)' : content
  } catch (err) {
    return `Error reading file: ${err}`
  }
}

export async function writeFile({
  fileName,
  content
}: {
  fileName: string
  content: string
}): Promise<string> {
  try {
    const isAbsolutePath = fileName.includes('/') || fileName.includes('\\')
    const targetPath = isAbsolutePath ? fileName : path.join(app.getPath('desktop'), fileName)

    await fs.mkdir(path.dirname(targetPath), { recursive: true })
    await fs.writeFile(targetPath, content, 'utf-8')
    return `Success: File safely written to ${targetPath}`
  } catch (err) {
    return `Error writing file: ${err}`
  }
}

export interface FileOpArgs {
  operation: 'copy' | 'move' | 'delete'
  sourcePath: string
  destPath?: string
}

export async function executeFileOp({
  operation,
  sourcePath,
  destPath
}: FileOpArgs): Promise<string> {
  try {
    switch (operation) {
      case 'copy':
        if (!destPath) return 'Error: Destination path required for copy.'
        await fs.cp(sourcePath, destPath, { recursive: true })
        return `Success: Copied to ${destPath}`

      case 'move':
        if (!destPath) return 'Error: Destination path required for move.'
        await fs.rename(sourcePath, destPath)
        return `Success: Moved to ${destPath}`

      case 'delete':
        await fs.rm(sourcePath, { recursive: true, force: true })
        return `Success: Safely deleted ${sourcePath}`

      default:
        return `Error: Unknown operation type '${operation}'`
    }
  } catch (err) {
    return `System Error executing file operation: ${err}`
  }
}