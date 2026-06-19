import { exec } from 'child_process'
import os from 'os'
import fs from 'fs'
import path from 'path'

// Helper to execute terminal commands
const runCommand = (cmd: string): Promise<string> => {
  return new Promise((resolve) => {
    exec(cmd, { maxBuffer: 1024 * 1024 }, (error, stdout) => {
      if (error) resolve('')
      resolve(stdout ? stdout.trim() : '')
    })
  })
}

// ─── 1. NATIVE OS GEOLOCATION (100% ACCURATE & FREE) ───
async function getWindowsNativeLocation(): Promise<{ lat: number; lon: number } | null> {
  // Uses Windows' built-in Location Services (Wi-Fi Triangulation/GPS)
  const scriptContent = `
Add-Type -AssemblyName System.Device
$GeoWatcher = New-Object System.Device.Location.GeoCoordinateWatcher
$GeoWatcher.Start()
$timeout = 40
while (($GeoWatcher.Status -ne 'Ready') -and ($GeoWatcher.Permission -ne 'Denied') -and ($timeout -gt 0)) {
    Start-Sleep -Milliseconds 100
    $timeout--
}
if ($GeoWatcher.Permission -eq 'Denied' -or $GeoWatcher.Status -ne 'Ready') {
    Write-Output "ERROR"
} else {
    $loc = $GeoWatcher.Position.Location
    if ($loc.IsUnknown) {
        Write-Output "ERROR"
    } else {
        Write-Output "$($loc.Latitude),$($loc.Longitude)"
    }
}
$GeoWatcher.Stop()
  `

  // Write the script to a secure temp file to prevent command-line character breaking
  const tempPath = path.join(os.tmpdir(), 'iris_get_location.ps1')
  fs.writeFileSync(tempPath, scriptContent)

  const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -File "${tempPath}"`
  const output = await runCommand(cmd)

  // Clean up the temp file
  try {
    fs.unlinkSync(tempPath)
  } catch (e) {}

  if (output && !output.includes('ERROR') && output.includes(',')) {
    const [lat, lon] = output.trim().split(',').map(parseFloat)
    if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }
  }
  return null
}

// ─── 2. FREE REVERSE GEOCODING (LAT/LON TO ADDRESS) ───
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    // OpenStreetMap Nominatim API (100% Free, No Key Required)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: { 'User-Agent': 'IRIS-Desktop-App/1.0' } // Required by their free-use policy
      }
    )
    const data = await res.json()

    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.state_district || ''
      const state = data.address.state || ''
      const country = data.address.country || ''
      return [city, state, country].filter(Boolean).join(', ')
    }
  } catch (e) {
    console.error('[LOCATION] Reverse geocode failed:', e)
  }
  return `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`
}

// ─── 3. FREE IP-BASED FALLBACK (BACKUP PLAN) ───
async function getIpFallbackLocation() {
  try {
    const res = await fetch('http://ip-api.com/json/')
    const data = await res.json()
    if (data && data.status === 'success') {
      return {
        fullString: `${data.city}, ${data.regionName}, ${data.country}`,
        timezone: data.timezone
      }
    }
  } catch (e) {
    console.error('[LOCATION] IP fallback failed:', e)
  }
  return null
}

// ─── EXPORTED CORE FUNCTION ───
export async function getLiveLocation() {
  let tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'

  try {
    // Attempt High-Accuracy Windows GPS/Wi-Fi Triangulation first
    if (os.platform() === 'win32') {
      console.log('[LOCATION] Attempting native Windows triangulation...')
      const coords = await getWindowsNativeLocation()

      if (coords) {
        const address = await reverseGeocode(coords.lat, coords.lon)
        console.log(`[LOCATION] Secured native lock: ${address}`)
        return { fullString: address, timezone: tz }
      }
    }

    console.log('[LOCATION] Native lock failed, falling back to IP Location...')
    const ipLoc = await getIpFallbackLocation()
    if (ipLoc) return ipLoc
  } catch (err) {
    console.error('[LOCATION] Entire pipeline failed:', err)
  }

  return {
    fullString: 'Unknown Location',
    timezone: tz
  }
}
