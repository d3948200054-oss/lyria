import { useState, useEffect, useRef } from 'react'
import IRIS from './UI/IRIS'
import TitleBar from './components/Titlebar'

export type VisionMode = 'camera' | 'screen' | 'none'

const IndexRoot = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const toggleConnection = () => {
    if (isConnected) {
      // @ts-ignore
      window.iris.stopSession()
      setIsConnected(false)
      setIsMuted(false)
    } else {
      // @ts-ignore
      window.iris.startSession()
      setIsConnected(true)
    }
  }

  const handleMicToggle = () => {
    const nextMutedState = !isMuted
    setIsMuted(nextMutedState)
    if ((window as any).iris?.toggleMic) {
      ;(window as any).iris.toggleMic(nextMutedState)
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-black overflow-hidden relative border border-emerald-500/20 rounded-xl">
      <TitleBar />
      <div className="flex-1 relative">
        <IRIS
          isConnected={isConnected}
          toggleConnection={toggleConnection}
          systemStatus={systemStatus}
          isSpeaking={isSpeaking}
          isMuted={isMuted}
          handleMicToggle={handleMicToggle}
        />
      </div>
    </div>
  )
}

export default IndexRoot
