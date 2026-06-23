import { useState, useEffect, useRef } from 'react'
import {
  Camera,
  Cpu,
  MemoryStick,
  Thermometer,
  Monitor,
  ArrowUp,
  ArrowDown,
  Radio
} from 'lucide-react'
import { getSystemStatus, SystemStats } from '@renderer/services/system-info'
import { LeftPanelsProps } from '@renderer/types/panel'

function getHealthColor(value: number, type: 'cpu' | 'ram' | 'temp') {
  let ratio = Math.min(1, Math.max(0, value / 100))
  if (type === 'temp') {
    ratio = Math.min(1, Math.max(0, (value - 20) / 50))
  }
  const hue = 120 * (1 - ratio)
  const saturation = 90
  const lightness = 50
  const mainColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
  return mainColor
}

function PulseIndicator({ active, color = '#00ff88' }: { active: boolean; color?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      {active && (
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{
          backgroundColor: active ? color : '#374151',
          boxShadow: active ? `0 0 8px ${color}80` : 'none'
        }}
      />
    </span>
  )
}

function PremiumGlassPanel({
  children,
  className = '',
  accent = 'green',
  glow = false
}: {
  children: React.ReactNode
  className?: string
  accent?: 'green' | 'cyan' | 'orange' | 'blue' | 'purple' | 'none'
  glow?: boolean
}) {
  const accentMap: Record<string, { bg: string; border: string }> = {
    green: { bg: 'bg-[#00ff88]/[0.02]', border: 'border-[#00ff88]/10' },
    cyan: { bg: 'bg-[#22d3ee]/[0.02]', border: 'border-[#22d3ee]/10' },
    orange: { bg: 'bg-[#f97316]/[0.02]', border: 'border-[#f97316]/10' },
    blue: { bg: 'bg-[#3b82f6]/[0.02]', border: 'border-[#3b82f6]/10' },
    purple: { bg: 'bg-[#a855f7]/[0.02]', border: 'border-[#a855f7]/10' },
    none: { bg: 'bg-white/[0.01]', border: 'border-white/5' }
  }

  const config = accentMap[accent]

  return (
    <div
      className={`relative overflow-hidden rounded-xl backdrop-blur-md border ${config.border} ${config.bg} transition-colors duration-300 ${className}`}
    >
      {glow && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
          style={{
            boxShadow: `inset 0 0 20px ${config.border.split('/')[0].replace('border-', '')}15`
          }}
        />
      )}
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
  )
}

function NeonProgressBar({
  value,
  color,
  showValue = false
}: {
  value: number
  color: string
  showValue?: boolean
}) {
  const safeValue = Math.min(100, Math.max(0, value || 0))
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-transform duration-500 ease-out origin-left will-change-transform"
          style={{
            width: '100%',
            transform: `scaleX(${safeValue / 100})`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}80`
          }}
        />
      </div>
      {showValue && (
        <span className="font-mono text-[9px] font-medium text-white/60 min-w-8 text-right">
          {Math.round(safeValue)}%
        </span>
      )}
    </div>
  )
}

function MetricValue({
  value,
  unit,
  status,
  prefix = ''
}: {
  value: string | number
  unit?: string
  status?: 'good' | 'warning' | 'critical' | 'idle'
  prefix?: string
}) {
  const statusColors = {
    good: 'text-[#00ff88]',
    warning: 'text-[#f97316]',
    critical: 'text-[#ef4444]',
    idle: 'text-slate-400'
  }

  return (
    <div className="flex items-baseline gap-1">
      {prefix && <span className="font-mono text-[9px] text-white/40 font-light">{prefix}</span>}
      <span className={`font-mono font-bold text-xl tracking-tight ${statusColors[status || 'idle']}`}>
        {value}
      </span>
      {unit && (
        <span className="font-mono text-[9px] text-white/40 font-light tracking-wide">{unit}</span>
      )}
    </div>
  )
}

function IconBadge({
  icon,
  color,
  label,
  active = true
}: {
  icon: React.ReactNode
  color: string
  label?: string
  active?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300"
        style={{
          borderColor: active ? `${color}40` : 'rgba(255,255,255,0.05)',
          background: active ? `${color}10` : 'rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ color: active ? color : 'rgba(255,255,255,0.3)' }}>{icon}</div>
      </div>
      {label && (
        <span className="font-mono text-[7px] tracking-widest text-white/40 uppercase text-center">
          {label}
        </span>
      )}
    </div>
  )
}

function BootSequence({ isActive, osType }: { isActive: boolean; osType: string }) {
  const [bootPhase, setBootPhase] = useState(true)
  const [bootLogs, setBootLogs] = useState<string[]>([])

  useEffect(() => {
    if (!isActive) {
      setBootPhase(true)
      setBootLogs([])
      return
    }

    if (bootPhase) {
      const logs = [
        '› KERNEL_INIT ........... OK',
        '› MOUNT_VFS ............. OK',
        '› HW_TELEM_LINK ..... SYNC',
        '› OPTICS_DRIVER ... READY',
        '› SYSTEM_READY ........ ✓'
      ]
      let i = 0
      const bootInterval = setInterval(() => {
        if (i < logs.length) {
          setBootLogs((p) => [...p, logs[i]])
          i++
        } else {
          clearInterval(bootInterval)
          setTimeout(() => setBootPhase(false), 800)
        }
      }, 100)
      return () => clearInterval(bootInterval)
    }
    return undefined
  }, [isActive, bootPhase])

  if (bootPhase && isActive) {
    return (
      <div className="space-y-1 mt-auto">
        {bootLogs.map((log, i) => (
          <span
            key={i}
            className="block font-mono text-[7px] leading-relaxed tracking-wide text-[#a855f7]/80"
          >
            {log}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="text-center mt-auto">
      <div className="font-mono text-base font-bold tracking-tight text-white/90">
        {isActive ? osType : '—'}
      </div>
      {isActive && (
        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#a855f7]/10 border border-[#a855f7]/20">
          <PulseIndicator active={true} color="#a855f7" />
          <span className="font-mono text-[7px] text-[#a855f7] uppercase tracking-widest font-semibold">
            Active
          </span>
        </div>
      )}
    </div>
  )
}

export default function LeftPanelsPremium({
  status,
  visionMode
}: LeftPanelsProps & { visionMode?: 'off' | 'camera' | 'screen' }) {
  const isActive = status !== 'STANDBY'

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [stats, setStats] = useState<SystemStats>({
    cpu: '0.0',
    memory: { total: '0.0', free: '0.0', usedPercentage: '0.0' },
    temperature: 0,
    os: { type: 'UNKNOWN', uptime: '0h' },
    network: { tx: 0, rx: 0, latency: 0 }
  })

  // Vision logic
  useEffect(() => {
    if (visionMode === 'off' || !visionMode || !isActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      return
    }

    let intervalId: NodeJS.Timeout

    const startVision = async () => {
      try {
        let stream: MediaStream
        if (visionMode === 'camera') {
          stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        } else {
          stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        intervalId = setInterval(() => {
          if (videoRef.current && canvasRef.current && (window as any).iris?.sendVisionFrame) {
            const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, 640, 480)
              const base64Full = canvasRef.current.toDataURL('image/jpeg', 0.8)
              const cleanBase64 = base64Full.replace(/^data:image\/jpeg;base64,/, '')
              ;(window as any).iris.sendVisionFrame(cleanBase64)
            }
          }
        }, 1000)
      } catch (err) {
        console.error('Vision access denied:', err)
      }
    }

    startVision()

    return () => {
      clearInterval(intervalId)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [visionMode, isActive])

  // Stats polling logic (runs once every 3s, negligible impact)
  useEffect(() => {
    if (!isActive) return

    let pollInterval: NodeJS.Timeout
    const fetchStats = async () => {
      const liveStats = await getSystemStatus()
      if (liveStats) setStats(liveStats)
    }

    fetchStats()
    pollInterval = setInterval(fetchStats, 3000)
    return () => clearInterval(pollInterval)
  }, [isActive])

  const cpuValue = parseFloat(stats.cpu) || 0
  const ramValue = parseFloat(stats.memory.usedPercentage) || 0
  const tempValue = stats.temperature || 0

  const cpuColor = getHealthColor(cpuValue, 'cpu')
  const ramColor = getHealthColor(ramValue, 'ram')
  const tempColor = getHealthColor(tempValue, 'temp')

  const getCPUStatus = () => {
    if (!isActive) return 'idle'
    if (cpuValue > 80) return 'critical'
    if (cpuValue > 60) return 'warning'
    return 'good'
  }

  const getRAMStatus = () => {
    if (!isActive) return 'idle'
    if (ramValue > 85) return 'critical'
    if (ramValue > 70) return 'warning'
    return 'good'
  }

  const getTempStatus = () => {
    if (!isActive) return 'idle'
    if (tempValue > 85) return 'critical'
    if (tempValue > 70) return 'warning'
    return 'good'
  }

  return (
    <div className="flex h-full flex-col gap-3 p-0">
      <PremiumGlassPanel accent="green" className="group" glow>
        <div className="p-3 flex flex-col h-full gap-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <PulseIndicator active={isActive && visionMode !== 'off'} />
              <div className="flex flex-col">
                <span className="font-mono text-[7px] tracking-[0.25em] text-white/50 uppercase font-light">
                  Vision Feed
                </span>
                <span className="font-mono text-[8px] tracking-tight text-white/30">
                  Optics @ 60Hz
                </span>
              </div>
            </div>
            <div
              className="px-2 py-0.5 rounded border text-[7px] font-mono tracking-widest uppercase font-semibold transition-colors duration-500"
              style={
                visionMode && visionMode !== 'off'
                  ? {
                      borderColor: 'rgba(0, 255, 136, 0.2)',
                      background: 'rgba(0, 255, 136, 0.05)',
                      color: '#00ff88'
                    }
                  : {
                      borderColor: 'rgba(255, 255, 255, 0.05)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      color: 'rgba(255, 255, 255, 0.4)'
                    }
              }
            >
              {visionMode && visionMode !== 'off' ? 'Tracking' : isActive ? 'Ready' : 'Offline'}
            </div>
          </div>

          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-[#050505] flex-1">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 z-10 w-full h-full object-cover transition-opacity duration-500 ${
                visionMode && visionMode !== 'off' ? 'opacity-90' : 'opacity-0'
              }`}
            />

            <canvas ref={canvasRef} width="640" height="480" className="hidden" />

            <div
              className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 transition-opacity duration-500 ${
                !visionMode || visionMode === 'off' ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <Camera
                size={20}
                style={{ color: isActive ? '#00ff88' : 'rgba(255, 255, 255, 0.2)' }}
                strokeWidth={1.5}
              />
              <span className="font-mono text-[7px] tracking-[0.3em] text-white/30 uppercase">
                No Input
              </span>
            </div>

            {visionMode && visionMode !== 'off' && (
              <>
                {[
                  'top-2 left-2 border-t border-l',
                  'top-2 right-2 border-t border-r',
                  'bottom-2 left-2 border-b border-l',
                  'bottom-2 right-2 border-b border-r'
                ].map((pos, i) => (
                  <div
                    key={i}
                    className={`absolute h-3 w-3 z-30 ${pos} transition-colors duration-500`}
                    style={{ borderColor: 'rgba(0, 255, 136, 0.4)' }}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </PremiumGlassPanel>

      <PremiumGlassPanel accent="cyan" glow className="group">
        <div className="p-3 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <IconBadge icon={<Radio size={14} />} color="#22d3ee" active={isActive} />
              <div className="flex flex-col">
                <span className="font-mono text-[7px] tracking-[0.25em] text-white/50 uppercase font-light">
                  Network
                </span>
                <span className="font-mono text-[8px] tracking-tight text-white/30">
                  Telemetry Link
                </span>
              </div>
            </div>
            <div
              className="px-2 py-0.5 rounded border text-[7px] font-mono tracking-widest uppercase font-semibold transition-colors duration-500"
              style={
                isActive
                  ? {
                      borderColor: 'rgba(34, 211, 238, 0.2)',
                      background: 'rgba(34, 211, 238, 0.05)',
                      color: '#22d3ee'
                    }
                  : {
                      borderColor: 'rgba(255, 255, 255, 0.05)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      color: 'rgba(255, 255, 255, 0.4)'
                    }
              }
            >
              {isActive ? 'Connected' : 'Offline'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <PremiumGlassPanel accent="none" className="p-2">
              <span className="font-mono text-[6px] tracking-[0.2em] text-white/40 uppercase mb-1 block">
                Latency
              </span>
              <MetricValue
                value={isActive ? stats.network?.latency : '—'}
                unit="ms"
                status={isActive ? 'good' : 'idle'}
              />
            </PremiumGlassPanel>

            <PremiumGlassPanel accent="none" className="p-2">
              <span className="font-mono text-[6px] tracking-[0.2em] text-white/40 uppercase mb-1 block">
                Uptime
              </span>
              <MetricValue
                value={isActive ? stats.os?.uptime : '—'}
                status={isActive ? 'good' : 'idle'}
              />
            </PremiumGlassPanel>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-md border border-[#ec4899]/10 bg-[#ec4899]/5">
                <ArrowUp size={12} style={{ color: '#ec4899' }} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <NeonProgressBar
                  value={isActive ? stats.network?.tx : 0}
                  color="#ec4899"
                  showValue
                />
              </div>
              <span className="font-mono text-[7px] text-[#ec4899]/60 uppercase tracking-wider min-w-4">
                TX
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-md border border-[#3b82f6]/10 bg-[#3b82f6]/5">
                <ArrowDown size={12} style={{ color: '#3b82f6' }} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <NeonProgressBar
                  value={isActive ? stats.network?.rx : 0}
                  color="#3b82f6"
                  showValue
                />
              </div>
              <span className="font-mono text-[7px] text-[#3b82f6]/60 uppercase tracking-wider min-w-4">
                RX
              </span>
            </div>
          </div>
        </div>
      </PremiumGlassPanel>

      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
        <PremiumGlassPanel accent="green" className="p-3 flex flex-col justify-between" glow>
          <div>
            <IconBadge icon={<Cpu size={12} />} color="#00ff88" active={isActive} />
            <div className="mt-2 space-y-0.5">
              <span className="block font-mono text-[6px] tracking-[0.2em] text-white/40 uppercase">
                CPU Load
              </span>
              <MetricValue value={isActive ? stats.cpu : '—'} unit="%" status={getCPUStatus()} />
            </div>
          </div>
          <div className="mt-3">
            <NeonProgressBar value={isActive ? cpuValue : 0} color={cpuColor} />
          </div>
        </PremiumGlassPanel>

        <PremiumGlassPanel accent="orange" className="p-3 flex flex-col justify-between" glow>
          <div>
            <IconBadge icon={<MemoryStick size={12} />} color="#f97316" active={isActive} />
            <div className="mt-2 space-y-0.5">
              <span className="block font-mono text-[6px] tracking-[0.2em] text-white/40 uppercase">
                RAM Usage
              </span>
              <MetricValue
                value={isActive ? stats.memory.usedPercentage : '—'}
                unit="%"
                status={getRAMStatus()}
              />
            </div>
          </div>
          <div className="mt-3">
            <NeonProgressBar value={isActive ? ramValue : 0} color={ramColor} />
          </div>
        </PremiumGlassPanel>

        <PremiumGlassPanel accent="blue" className="p-3 flex flex-col justify-between" glow>
          <div>
            <IconBadge icon={<Thermometer size={12} />} color="#3b82f6" active={isActive} />
            <div className="mt-2 space-y-0.5">
              <span className="block font-mono text-[6px] tracking-[0.2em] text-white/40 uppercase">
                Temperature
              </span>
              <MetricValue
                value={isActive ? tempValue.toFixed(1) : '—'}
                unit="°C"
                status={getTempStatus()}
              />
            </div>
          </div>
          <div className="mt-3">
            <NeonProgressBar value={isActive ? tempValue : 0} color={tempColor} />
          </div>
        </PremiumGlassPanel>

        <PremiumGlassPanel accent="purple" className="p-3 flex flex-col" glow>
          <div>
            <IconBadge icon={<Monitor size={12} />} color="#a855f7" active={isActive} />
            <div className="mt-2 space-y-0.5">
              <span className="block font-mono text-[6px] tracking-[0.2em] text-white/40 uppercase">
                System Status
              </span>
            </div>
          </div>
          <BootSequence isActive={isActive} osType={stats.os?.type || 'UNKNOWN'} />
        </PremiumGlassPanel>
      </div>
    </div>
  )
}
