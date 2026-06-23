import { useState, Suspense, lazy } from 'react'
import {
  RiLayoutGridLine,
  RiFolderOpenLine,
  RiPhoneLine,
  RiSettings4Line,
  RiImageLine
} from 'react-icons/ri'

import DashboardView from '../views/Dashboard'
import PhoneView from '../views/Phone'
import SettingsView from '@renderer/views/Settings'

const NotesView = lazy(() => import('../views/Notes'))
const GalleryView = lazy(() => import('../views/Gallery'))

interface IrisProps {
  isConnected: boolean
  toggleConnection: () => void
  isSpeaking: boolean
  isMuted: boolean
  handleMicToggle: () => void
}

const glassPanel = 'bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl'

const IRIS = ({
  isConnected,
  toggleConnection,
  isSpeaking,
  isMuted,
  handleMicToggle
}: IrisProps) => {
  const [activeTab, setActiveTab] = useState('DASHBOARD')

  const tabs = [
    { id: 'DASHBOARD', label: 'Command', icon: <RiLayoutGridLine size={16} /> },
    { id: 'NOTES', label: 'Notes', icon: <RiFolderOpenLine size={16} /> },
    { id: 'GALLERY', label: 'Gallery', icon: <RiImageLine size={16} /> },
    { id: 'PHONE', label: 'Mobile', icon: <RiPhoneLine size={16} /> },
    { id: 'SETTINGS', label: 'Settings', icon: <RiSettings4Line size={16} /> }
  ]

  return (
    <div className="flex flex-col h-screen w-full bg-black text-zinc-100 font-sans overflow-hidden select-none relative">
      <div className="h-16 w-full flex items-center justify-between px-6 bg-black border-b border-white/5 z-50">
        <div className="flex items-center gap-3 w-48 cursor-pointer">
          <img src="/Logo.png" className="w-14 h-14" />

          <div
            onClick={() => {
              setActiveTab('DASHBOARD')
            }}
            className="flex flex-col leading-none"
          >
            <span className="font-black tracking-widest text-[14px] text-zinc-100 uppercase -ml-1.5">
              IRIS AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-white/5 backdrop-blur-md shadow-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase rounded-lg transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className={`${activeTab === tab.id ? 'text-emerald-400' : 'text-zinc-600'}`}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 w-48">
          <div className="flex flex-col items-end leading-none">
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400">
              Network
            </span>
            <span
              className={`text-[9px] font-mono tracking-widest uppercase mt-1 ${isConnected ? 'text-emerald-500' : 'text-red-500'}`}
            >
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
          <div
            className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${isConnected ? 'bg-emerald-500 text-emerald-500' : 'bg-red-500 text-red-500'}`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-zinc-950 via-black to-black">
        <div className="relative h-full w-full p-4 overflow-y-auto">
          <div className={`h-full w-full ${activeTab === 'DASHBOARD' ? 'block' : 'hidden'}`}>
            <DashboardView
              isConnected={isConnected}
              toggleConnection={toggleConnection}
              systemStatus={systemStatus}
              isSpeaking={isSpeaking}
              isMuted={isMuted}
              handleMicToggle={handleMicToggle}
            />
          </div>

          <div className={`h-full w-full ${activeTab === 'PHONE' ? 'block' : 'hidden'}`}>
            <PhoneView glassPanel={glassPanel} />
          </div>

          <Suspense fallback={<ViewSkeleton />}>
            {activeTab === 'NOTES' && <NotesView glassPanel={glassPanel} />}
            {activeTab === 'GALLERY' && <GalleryView />}
            {activeTab === 'SETTINGS' && <SettingsView isSystemActive={isConnected} />}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default IRIS
