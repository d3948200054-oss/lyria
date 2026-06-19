import fs from 'fs/promises'

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
        return `Success: Deleted ${sourcePath}`

      default:
        return `Error: Unknown operation '${operation}'`
    }
  } catch (err) {
    return `System Error: ${err}`
  }
}