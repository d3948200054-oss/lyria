import { useState } from 'react'
import { Camera, Mic, MicOff, Phone, PhoneOff, Monitor, X } from 'lucide-react'
import RightPanel from '@renderer/components/UI/RightPanel'
import LeftPanels from '@renderer/components/UI/LeftPanels'
import AICore from '@renderer/components/UI/AICoreSphere'

export default function Dashboard({
  isConnected,
  toggleConnection,
  isSpeaking,
  isMuted,
  handleMicToggle
}: {
  isConnected: boolean
  toggleConnection: () => void
  isSpeaking: boolean
  isMuted: boolean
  handleMicToggle: () => void
}) {
  const [visionMode, setVisionMode] = useState<'off' | 'camera' | 'screen'>('off')
  const [showVisionMenu, setShowVisionMenu] = useState(false)

  const changeVisionMode = (mode: 'off' | 'camera' | 'screen') => {
    setVisionMode(mode)
    setShowVisionMenu(false)
  }

  return (
    <div className="h-full w-full bg-transparent flex flex-col relative selection:bg-[#00ff41]/30">
      <div className="absolute top-[10%] left-[-5%] w-[40vw] h-[40vw] bg-[#00ff41] rounded-full mix-blend-screen blur-[180px] opacity-[0.03] pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[30vw] h-[30vw] bg-[#00ff41] rounded-full mix-blend-screen blur-[150px] opacity-[0.03] pointer-events-none z-0"></div>

      <main className="flex-1 min-h-0 grid grid-cols-12 gap-6 p-6 relative z-10">
        <div className="col-span-3 flex flex-col gap-6 z-10 min-h-0">
          <LeftPanels visionMode={visionMode} />
        </div>

        <div className="col-span-6 relative flex flex-col justify-end items-center pb-6 min-h-0">
          <AICore isConnected={isConnected} isSpeaking={isSpeaking} />

          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-2xl border border-white/10 p-1.5 rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)] z-20">
            <div className="relative flex items-center justify-center">
              {showVisionMenu && isConnected && (
                <div className="absolute bottom-[calc(100%+12px)] flex flex-col gap-1 p-1.5 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,255,65,0.15)] z-50 origin-bottom animate-in fade-in zoom-in-95 duration-200 min-w-35">
                  <div className="px-3 py-1.5 border-b border-white/5 mb-1">
                    <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
                      Optics Feed
                    </span>
                  </div>
                  <button
                    onClick={() => changeVisionMode('camera')}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-mono text-[10px] tracking-widest uppercase ${visionMode === 'camera' ? 'bg-[#00ff41]/15 text-[#00ff41]' : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-100'}`}
                  >
                    <Camera size={14} /> Lens
                  </button>
                  <button
                    onClick={() => changeVisionMode('screen')}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-mono text-[10px] tracking-widest uppercase ${visionMode === 'screen' ? 'bg-cyan-500/15 text-cyan-400' : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-100'}`}
                  >
                    <Monitor size={14} /> Display
                  </button>
                  <button
                    onClick={() => changeVisionMode('off')}
                    className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl transition-all font-mono text-[10px] tracking-widest uppercase hover:bg-red-500/10 text-zinc-500 hover:text-red-400"
                  >
                    <X size={14} /> Offline
                  </button>
                </div>
              )}

              <button
                onClick={() => isConnected && setShowVisionMenu(!showVisionMenu)}
                disabled={!isConnected}
                className={`group cursor-pointer w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 border ${
                  !isConnected
                    ? 'opacity-30 cursor-not-allowed bg-zinc-900 border-transparent text-zinc-600'
                    : visionMode === 'camera'
                      ? 'bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41]/30 shadow-[0_0_20px_rgba(0,255,65,0.15)]'
                      : visionMode === 'screen'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                        : 'bg-zinc-800/50 text-zinc-400 border-white/5 hover:border-white/20 hover:text-zinc-100 hover:bg-zinc-800'
                }`}
              >
                {visionMode === 'screen' ? (
                  <Monitor
                    size={18}
                    strokeWidth={1.5}
                    className="group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <Camera
                    size={18}
                    strokeWidth={1.5}
                    className="group-hover:scale-110 transition-transform"
                  />
                )}
              </button>
            </div>

            <div
              onClick={toggleConnection}
              className={`flex items-center gap-3 cursor-pointer pr-5 pl-1.5 py-1.5 rounded-full border transition-all duration-300 ${
                isConnected
                  ? 'bg-zinc-900/50 border-[#00ff41]/20 hover:border-[#00ff41]/40 hover:bg-zinc-900/80 shadow-[inset_0_0_20px_rgba(0,255,65,0.05)]'
                  : 'bg-zinc-900/50 border-white/5 hover:border-white/20 hover:bg-zinc-900/80'
              }`}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 shadow-lg ${
                  isConnected
                    ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-400'
                    : 'bg-[#00ff41] text-black shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:bg-[#33ff66] hover:shadow-[0_0_25px_rgba(0,255,65,0.5)]'
                }`}
              >
                {isConnected ? (
                  <PhoneOff size={18} strokeWidth={2.5} />
                ) : (
                  <Phone size={18} strokeWidth={2.5} />
                )}
              </div>
            </div>

            <button
              onClick={handleMicToggle}
              disabled={!isConnected}
              className={`group w-12 h-12 flex items-center justify-center rounded-full border transition-all duration-300 ${
                !isConnected
                  ? 'opacity-30 cursor-not-allowed bg-zinc-900 border-transparent text-zinc-600'
                  : isMuted
                    ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:bg-red-500/20'
                    : 'bg-zinc-800/50 text-[#00ff41] border-[#00ff41]/20 shadow-[0_0_15px_rgba(0,255,65,0.1)] hover:border-[#00ff41]/40 hover:bg-zinc-800'
              }`}
            >
              {isMuted ? (
                <MicOff
                  size={18}
                  strokeWidth={1.5}
                  className="group-hover:scale-110 transition-transform"
                />
              ) : (
                <Mic
                  size={18}
                  strokeWidth={1.5}
                  className="group-hover:scale-110 transition-transform drop-shadow-[0_0_5px_rgba(0,255,65,0.5)]"
                />
              )}
            </button>
          </div>
        </div>

        <div className="col-span-3 h-full flex flex-col z-10 min-h-0">
          <RightPanel />
        </div>
      </main>
    </div>
  )
}
