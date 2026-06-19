import { app } from 'electron'
import { exec } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

let activeDevice: { ip: string; port: string } | null = null

function getPaths() {
  const dirPath = path.join(app.getPath('userData'), 'Connected Devices')
  const historyPath = path.join(dirPath, 'Connect-mobile.json')
  return { dirPath, historyPath }
}

async function saveDeviceToHistory(ip: string, port: string, model: string) {
  try {
    const { dirPath, historyPath } = getPaths()
    await fs.mkdir(dirPath, { recursive: true })

    let history: any[] = []
    try {
      const file = await fs.readFile(historyPath, 'utf-8')
      history = JSON.parse(file)
    } catch (e) {}

    const existingIndex = history.findIndex((d) => d.ip === ip)
    const deviceData = { ip, port, model, lastConnected: new Date().toISOString() }

    if (existingIndex > -1) {
      history[existingIndex] = deviceData
    } else {
      history.push(deviceData)
    }
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2))
  } catch (e) {}
}

export async function getAdbHistory() {
  try {
    const { historyPath } = getPaths()
    const file = await fs.readFile(historyPath, 'utf-8')
    return JSON.parse(file)
  } catch (e) {
    return []
  }
}

export async function connectAdb({ ip, port }: { ip: string; port: string }) {
  try {
    await execAsync(`adb kill-server`).catch(() => {})
    await execAsync(`adb start-server`).catch(() => {})

    await new Promise((resolve) => setTimeout(resolve, 500))

    const { stdout } = await execAsync(`adb connect ${ip}:${port}`)

    if (
      stdout.toLowerCase().includes('connected to') ||
      stdout.toLowerCase().includes('already connected')
    ) {
      activeDevice = { ip, port }

      try {
        const { stdout: modelOut } = await execAsync(
          `adb -s ${ip}:${port} shell getprop ro.product.model`
        )
        await saveDeviceToHistory(ip, port, modelOut.trim().toUpperCase() || 'UNKNOWN DEVICE')
      } catch (e) {
        console.error('Model fetch failed, but uplink secured.')
      }

      return { success: true }
    }
    return { success: false, error: stdout }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function disconnectAdb() {
  if (!activeDevice) return { success: true }
  try {
    await execAsync(`adb disconnect ${activeDevice.ip}:${activeDevice.port}`)
    activeDevice = null
    return { success: true }
  } catch (e: any) {
    return { success: false }
  }
}

export async function takeAdbScreenshot() {
  if (!activeDevice) return { success: false }
  return new Promise((resolve) => {
    exec(
      `adb -s ${activeDevice?.ip}:${activeDevice?.port} exec-out screencap -p`,
      { encoding: 'buffer', maxBuffer: 1024 * 1024 * 20 },
      (error, stdout) => {
        if (error) {
          resolve({ success: false })
        } else {
          const base64 = `data:image/png;base64,${stdout.toString('base64')}`
          resolve({ success: true, image: base64 })
        }
      }
    )
  })
}

export async function executeAdbQuickAction(action: 'camera' | 'wake' | 'lock' | 'home') {
  if (!activeDevice) return { success: false }
  const target = `-s ${activeDevice.ip}:${activeDevice.port}`
  try {
    if (action === 'camera') {
      await execAsync(`adb ${target} shell am start -a android.media.action.STILL_IMAGE_CAMERA`)
    } else if (action === 'wake') {
      await execAsync(`adb ${target} shell input keyevent KEYCODE_WAKEUP`)
    } else if (action === 'lock') {
      await execAsync(`adb ${target} shell input keyevent KEYCODE_SLEEP`)
    } else if (action === 'home') {
      await execAsync(`adb ${target} shell input keyevent KEYCODE_HOME`)
    }
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function getAdbTelemetry() {
  if (!activeDevice) return { success: false, error: 'No device connected' }
  const target = `-s ${activeDevice.ip}:${activeDevice.port}`
  try {
    const { stdout: batteryOut } = await execAsync(`adb ${target} shell dumpsys battery`)
    const levelMatch = batteryOut.match(/level: (\d+)/)
    const tempMatch = batteryOut.match(/temperature: (\d+)/)
    const isCharging =
      batteryOut.includes('AC powered: true') || batteryOut.includes('USB powered: true')

    const level = levelMatch ? parseInt(levelMatch[1]) : 0
    const temp = tempMatch ? (parseInt(tempMatch[1]) / 10).toFixed(1) : 0

    const { stdout: storageOut } = await execAsync(`adb ${target} shell df -h /data`)
    const storageLines = storageOut.trim().split('\n')
    let storageUsed = '0',
      storageTotal = '0',
      storagePercent = 0

    if (storageLines.length > 1) {
      const parts = storageLines[1].trim().split(/\s+/)
      storageTotal = parts[1]
      storageUsed = parts[2]
      storagePercent = parseInt(parts[4].replace('%', '')) || 0
    }

    const { stdout: modelOut } = await execAsync(`adb ${target} shell getprop ro.product.model`)
    const { stdout: osOut } = await execAsync(
      `adb ${target} shell getprop ro.build.version.release`
    )

    return {
      success: true,
      data: {
        model: modelOut.trim().toUpperCase(),
        os: `ANDROID ${osOut.trim()}`,
        battery: { level, isCharging, temp },
        storage: { used: storageUsed, total: storageTotal, percent: storagePercent }
      }
    }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function getMobileInfoAi() {
  if (!activeDevice) return 'Error: You are not currently connected to any mobile device.'
  try {
    const target = `-s ${activeDevice.ip}:${activeDevice.port}`
    const { stdout: batOut } = await execAsync(`adb ${target} shell dumpsys battery`)
    const level = batOut.match(/level: (\d+)/)?.[1] || 'Unknown'
    const { stdout: modelOut } = await execAsync(`adb ${target} shell getprop ro.product.model`)

    return `I am currently linked to your ${modelOut.trim()}. The battery is at ${level}%.`
  } catch (e) {
    return 'I am connected, but I could not retrieve the telemetry data.'
  }
}

export async function openAdbApp(packageName: string) {
  if (!activeDevice) return { success: false, error: 'No phone connected.' }
  try {
    const target = `-s ${activeDevice.ip}:${activeDevice.port}`
    if (packageName === 'android.media.action.STILL_IMAGE_CAMERA') {
      await execAsync(`adb ${target} shell am start -a android.media.action.STILL_IMAGE_CAMERA`)
      return { success: true }
    }
    await execAsync(
      `adb ${target} shell monkey -p ${packageName} -c android.intent.category.LAUNCHER 1`
    )
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function closeAdbApp(packageName: string) {
  if (!activeDevice) return { success: false, error: 'No phone connected.' }
  try {
    const target = `-s ${activeDevice.ip}:${activeDevice.port}`
    if (packageName === 'android.media.action.STILL_IMAGE_CAMERA') {
      await execAsync(`adb ${target} shell am force-stop com.google.android.GoogleCamera`)
      return { success: true }
    }
    await execAsync(`adb ${target} shell am force-stop ${packageName}`)
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function tapAdb({ xPercent, yPercent }: { xPercent: number; yPercent: number }) {
  if (!activeDevice) return { success: false, error: 'No device' }
  const target = `-s ${activeDevice.ip}:${activeDevice.port}`

  try {
    const { stdout } = await execAsync(`adb ${target} shell wm size`)
    const match = stdout.match(/(\d+)x(\d+)/)

    if (match) {
      const width = parseInt(match[1])
      const height = parseInt(match[2])

      const x = Math.round((xPercent / 100) * width)
      const y = Math.round((yPercent / 100) * height)

      await execAsync(`adb ${target} shell input tap ${x} ${y}`)
      return { success: true }
    }
    return { success: false, error: 'Could not calculate screen size.' }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function swipeAdb(direction: 'up' | 'down' | 'left' | 'right') {
  if (!activeDevice) return { success: false, error: 'No device' }
  const target = `-s ${activeDevice.ip}:${activeDevice.port}`

  try {
    const { stdout } = await execAsync(`adb ${target} shell wm size`)
    const match = stdout.match(/(\d+)x(\d+)/)
    if (!match) return { success: false }

    const w = parseInt(match[1])
    const h = parseInt(match[2])
    const cx = Math.round(w / 2)
    const cy = Math.round(h / 2)

    let cmd = ''
    if (direction === 'up')
      cmd = `input swipe ${cx} ${Math.round(h * 0.7)} ${cx} ${Math.round(h * 0.3)} 300`
    if (direction === 'down')
      cmd = `input swipe ${cx} ${Math.round(h * 0.3)} ${cx} ${Math.round(h * 0.7)} 300`
    if (direction === 'left')
      cmd = `input swipe ${Math.round(w * 0.8)} ${cy} ${Math.round(w * 0.2)} ${cy} 300`
    if (direction === 'right')
      cmd = `input swipe ${Math.round(w * 0.2)} ${cy} ${Math.round(w * 0.8)} ${cy} 300`

    if (cmd) {
      await execAsync(`adb ${target} shell ${cmd}`)
      return { success: true }
    }
    return { success: false, error: 'Invalid direction.' }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function getAdbNotifications() {
  if (!activeDevice) return { success: false, error: 'No device connected.' }
  const target = `-s ${activeDevice.ip}:${activeDevice.port}`

  try {
    const { stdout } = await execAsync(`adb ${target} shell dumpsys notification --noredact`)

    const notifications: string[] = []
    const lines = stdout.split('\n')
    let currentTitle = ''

    for (const line of lines) {
      if (line.includes('android.title=')) {
        const match = line.match(/android\.title=(?:String|CharSequence) \((.*?)\)/)
        if (match && match[1]) currentTitle = match[1].trim()
      } else if (line.includes('android.text=')) {
        const match = line.match(/android\.text=(?:String|CharSequence) \((.*?)\)/)
        if (match && match[1]) {
          const currentText = match[1].trim()

          const isSystem =
            currentTitle.toLowerCase().includes('running') ||
            currentTitle.toLowerCase().includes('sync') ||
            currentText.toLowerCase().includes('running')

          if (currentTitle && currentText && !isSystem) {
            const fullMsg = `You got a Message on your Smartphone from ${currentTitle}: ${currentText}`
            if (!notifications.includes(fullMsg)) {
              notifications.push(fullMsg)
            }
            currentTitle = ''
          }
        }
      }
    }

    return { success: true, data: notifications }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function pushFileToAdb({
  sourcePath,
  destPath = '/sdcard/Download/'
}: {
  sourcePath: string
  destPath?: string
}) {
  if (!activeDevice) return { success: false, error: 'No phone connected.' }
  try {
    const target = `-s ${activeDevice.ip}:${activeDevice.port}`
    await execAsync(`adb ${target} push "${sourcePath}" "${destPath}"`)
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function pullFileFromAdb({
  sourcePath,
  destPath
}: {
  sourcePath: string
  destPath?: string
}) {
  if (!activeDevice) return { success: false, error: 'No phone connected.' }
  try {
    const target = `-s ${activeDevice.ip}:${activeDevice.port}`
    const finalDest = destPath || path.join(app.getPath('downloads'))

    await execAsync(`adb ${target} pull "${sourcePath}" "${finalDest}"`)
    return { success: true, savedTo: finalDest }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function toggleAdbHardware({ setting, state }: { setting: string; state: boolean }) {
  if (!activeDevice) return { success: false, error: 'No phone connected.' }
  const target = `-s ${activeDevice.ip}:${activeDevice.port}`

  try {
    const cleanSetting = setting.toLowerCase().trim()
    const action = state ? 'enable' : 'disable'

    if (cleanSetting === 'bluetooth' || cleanSetting === 'bt') {
      try {
        await execAsync(`adb ${target} shell svc bluetooth ${action}`, { timeout: 5000 })
      } catch (e) {
        await execAsync(`adb ${target} shell cmd bluetooth_manager ${action}`, { timeout: 5000 })
      }
      return { success: true }
    }

    if (cleanSetting === 'wifi') {
      try {
        await execAsync(`adb ${target} shell svc wifi ${action}`, { timeout: 5000 })
      } catch (e) {
        const wifiState = state ? 'enabled' : 'disabled'
        await execAsync(`adb ${target} shell cmd wifi set-wifi-enabled ${wifiState}`, {
          timeout: 5000
        })
      }
      return { success: true }
    }

    if (cleanSetting === 'data' || cleanSetting === 'mobile data') {
      await execAsync(`adb ${target} shell svc data ${action}`, { timeout: 5000 })
      return { success: true }
    }

    if (cleanSetting === 'airplane' || cleanSetting === 'flight') {
      await execAsync(`adb ${target} shell cmd connectivity airplane-mode ${action}`, {
        timeout: 5000
      })
      return { success: true }
    }

    if (cleanSetting === 'location' || cleanSetting === 'gps') {
      const locState = state ? '3' : '0'
      await execAsync(`adb ${target} shell settings put secure location_mode ${locState}`, {
        timeout: 5000
      })
      return { success: true }
    }

    if (cleanSetting === 'flashlight' || cleanSetting === 'torch') {
      await execAsync(`adb ${target} shell input keyevent KEYCODE_WAKEUP`)
      await execAsync(`adb ${target} shell cmd statusbar expand-settings`)
      return {
        success: true,
        warning:
          'Android OS blocks silent flashlight toggles. I have pulled down your Quick Settings menu instead.'
      }
    }

    return { success: false, error: `I don't know how to toggle: ${setting}` }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
