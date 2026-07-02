#!/usr/bin/env node
import chalk from 'chalk'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const logs = [
  { text: 'Initializing system services...', color: chalk.cyan, delay: 500 },
  { text: '[OK] Memory allocated successfully', color: chalk.green, delay: 150 },
  { text: 'Loading biometric authentication...', color: chalk.magenta, delay: 600 },
  { text: '[OK] Local face recognition models loaded', color: chalk.green, delay: 200 },
  { text: 'Configuring audio pipeline...', color: chalk.cyan, delay: 400 },
  { text: '[WARN] Adjusting audio buffer latency...', color: chalk.yellow, delay: 800 },
  {
    text: '[OK] Latency optimized at 24.3ms',
    color: chalk.green,
    delay: 100
  },
  { text: 'Connecting to AI services...', color: chalk.cyan, delay: 700 },
  {
    text: '[OK] Live streaming connection established',
    color: chalk.green,
    delay: 250
  },
  { text: 'Starting rendering engine...', color: chalk.magenta, delay: 500 },
  {
    text: '[OK] Hardware acceleration enabled',
    color: chalk.green,
    delay: 150
  },
  { text: 'Loading internal scripts...', color: chalk.cyan, delay: 300 },
  {
    text: '[OK] System permissions granted',
    color: chalk.green,
    delay: 100
  },
  { text: 'Applying UI configuration...', color: chalk.magenta, delay: 600 },
  {
    text: '[OK] Interface parameters loaded',
    color: chalk.green,
    delay: 200
  },
  { text: 'STARTING CAMERA FEED', color: chalk.cyan.bold, delay: 900 },
  { text: 'SYSTEM SECURE', color: chalk.green.bold, delay: 400 },
  { text: '\n=== IRIS ONLINE ===', color: chalk.magenta.bold, delay: 100 }
]

const runIRISWeb = async () => {
  console.clear()
  console.log(chalk.dim('Starting IRIS Boot Sequence...\n'))

  for (const log of logs) {
    await sleep(log.delay)
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 23)
    console.log(`${chalk.dim(`[${timestamp}]`)} ${log.color(log.text)}`)
  }

  await sleep(1000)
  console.log(`\n${chalk.cyan('Awaiting user authentication...')}`)

  setInterval(() => {
    process.stdout.write(chalk.dim('.'))
  }, 1000)
}

runIRISWeb()