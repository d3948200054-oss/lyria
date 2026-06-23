import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GiArtificialIntelligence } from 'react-icons/gi'
import {
  RiKey2Line,
  RiSave3Line,
  RiShieldKeyholeLine,
  RiPlugLine,
  RiTerminalWindowLine
} from 'react-icons/ri'

interface SettingsProps {
  isSystemActive: boolean
}

type TabType = 'updates' | 'keys' | 'security'

function GlassPanel({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-lg ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default function SettingsView({ isSystemActive }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('keys')

  const [geminiKey, setGeminiKey] = useState('')
  const [groqKey, setGroqKey] = useState('')
  const [hfKey, setHfKey] = useState('')
  const [tavilyKey, settavilyKey] = useState('')

  useEffect(() => {
    if (!window.electron?.ipcRenderer) return undefined

    window.electron.ipcRenderer.invoke('secure-get-keys').then((keys: any) => {
      if (keys) {
        setGeminiKey(keys.geminiKey || '')
        setGroqKey(keys.groqKey || '')
        setHfKey(keys.hfKey || '')
        settavilyKey(keys.tavilyKey || '')
      }
    })
  }, [])

  const saveApiKeys = async () => {
    if (window.electron?.ipcRenderer) {
      try {
        await window.electron.ipcRenderer.invoke('secure-save-keys', {
          groqKey,
          geminiKey,
          hfKey,
          tavilyKey
        })
        alert('API Keys securely encrypted and saved to Vault. You can now Use this!.')
      } catch (e) {
        alert('Failed to save keys to the secure vault.')
      }
    }
  }

  const inputContainerClass =
    'flex items-center bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all duration-200 w-full'
  const labelClass = 'text-sm text-zinc-300 font-medium flex items-center gap-2 mb-2'
  const titleClass = 'text-lg font-semibold text-white flex items-center gap-3'

  const tabConfigs = [{ id: 'keys', label: 'API Keys', icon: <RiPlugLine size={18} /> }]

  return (
    <div className="flex-1 p-6 md:p-10 flex flex-col items-center bg-transparent min-h-screen text-zinc-100 overflow-y-auto scrollbar-small">
      <motion.div
        className="w-full max-w-4xl flex flex-col gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center h-14 w-14 rounded-xl bg-zinc-900 border border-white/10 shadow-lg">
              <GiArtificialIntelligence size={28} className="text-zinc-100" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`h-2 w-2 rounded-full ${isSystemActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}
                />
                <p className="text-sm text-zinc-400 font-medium">
                  {isSystemActive ? 'System is Online' : 'System is Offline'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex bg-zinc-900/80 p-1.5 rounded-xl border border-white/10 backdrop-blur-md shadow-xl overflow-x-auto scrollbar-none">
            {tabConfigs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon} {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="relative min-h-125">
          <AnimatePresence mode="wait">
            {activeTab === 'keys' && (
              <motion.div
                key="keys"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full absolute"
              >
                <GlassPanel className="p-8 flex flex-col gap-8">
                  <div className="flex justify-between items-center pb-2">
                    <span className={titleClass}>
                      <RiKey2Line className="text-emerald-400" size={24} /> API Providers
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={saveApiKeys}
                      className="bg-emerald-500 cursor-pointer text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2"
                    >
                      <RiSave3Line size={18} /> Save Keys
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Google Gemini API</label>
                      <div className={inputContainerClass}>
                        <input
                          type="password"
                          value={geminiKey}
                          onChange={(e) => setGeminiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="bg-transparent border-none outline-none text-base text-white w-full placeholder:text-zinc-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Groq Cloud API</label>
                      <div className={inputContainerClass}>
                        <input
                          type="password"
                          value={groqKey}
                          onChange={(e) => setGroqKey(e.target.value)}
                          placeholder="gsk_..."
                          className="bg-transparent border-none outline-none text-base text-white w-full placeholder:text-zinc-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Hugging Face Token</label>
                      <div className={inputContainerClass}>
                        <input
                          type="password"
                          value={hfKey}
                          onChange={(e) => setHfKey(e.target.value)}
                          placeholder="hf_..."
                          className="bg-transparent border-none outline-none text-base text-white w-full placeholder:text-zinc-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Tavily Search API</label>
                      <div className={inputContainerClass}>
                        <input
                          type="password"
                          value={tavilyKey}
                          onChange={(e) => settavilyKey(e.target.value)}
                          placeholder="tvly-..."
                          className="bg-transparent border-none outline-none text-base text-white w-full placeholder:text-zinc-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 border border-white/5 p-4 rounded-xl flex gap-3 items-start mt-4">
                    <RiShieldKeyholeLine className="text-zinc-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      <strong>Privacy Notice:</strong> Your API keys are encrypted and saved locally
                      on this machine. They are never sent to a central server, ensuring your usage
                      and billing remain completely private.
                    </p>
                  </div>
                </GlassPanel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
