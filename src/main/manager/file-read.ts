import fs from 'fs/promises'

export async function readFile(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return content.length > 3000 ? content.slice(0, 3000) + '\n...(Truncated)' : content
  } catch (err) {
    return `Error reading file: ${err}`
  }
}