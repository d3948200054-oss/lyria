const ConnectMobileSetup = ({
  mobile,
  setupType,
  useWiFi,
  appPackageName,
  appVersion,
  appPath,
  adbPath
}: {
  mobile: string
  setupType: string
  useWiFi: boolean
  appPackageName: string
  appVersion: string
  appPath: string
  adbPath: string
}) => {
  if (!mobile || !setupType || !appPackageName || !appVersion || !appPath || !adbPath || !useWiFi) {
    console.error('Missing required parameters')
    return
  }

  if (setupType === 'usb') {
    console.log('USB setup')
    return
  }

  if (setupType === 'wifi') {
    console.log('WiFi setup')
    return
  }

  if (setupType === 'bluetooth') {
    console.log('Bluetooth setup')
    return
  }

  console.error('Invalid setup type')
  return
}

export default ConnectMobileSetup
