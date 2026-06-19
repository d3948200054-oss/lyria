import { useState, useEffect, useRef } from 'react'
import MiniOverlay from './components/MiniOverlay'
import IRIS from './UI/IRISB'
import TerminalOverlay from './components/TerminalOverlay'
import LeafletMapWidget from './Widgets/MapView'
import ImageWidget from './Widgets/ImageWidget'
import EmailWidget from './Widgets/EmailWidget'
import WeatherWidget from './Widgets/WeatherWidget'
import StockWidget from './Widgets/StockWidget'
import LiveCodingWidget from './Widgets/LiveCodingWidget'
import WormholeWidget from './Widgets/WormholeWidget'
import OracleWidget from './Widgets/RagOrcaleWidget'
import ResearchWidget from './Widgets/DeepResearch'
import SemanticWidget from './Widgets/SematicSearch'
import SmartDropZonesWidget from './Widgets/SmartZoneWidget'
import TitleBar from './components/Titlebar'
import { Status } from './types/panel'

export type VisionMode = 'camera' | 'screen' | 'none'

const IndexRoot = () => {
  const [isOverlay, setIsOverlay] = useState(false)

  const [isConnected, setIsConnected] = useState(false)
  const [systemStatus, setSystemStatus] = useState<Status>('STANDBY')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    if ((window as any).iris) {
      ;(window as any).iris.onSystemStatus((status: Status) => {
        setSystemStatus(status)

        if (status === 'ACTIVE' || status === 'CONNECTING') {
          setIsConnected(true)
        } else if (status === 'STANDBY' || status === 'ERROR') {
          setIsConnected(false)
          setIsMuted(false)
        }
      })
      ;(window as any).iris.onSpeakingState((speaking: boolean) => {
        setIsSpeaking(speaking)
      })

      if ((window as any).iris.onWakeWordTriggered) {
        ;(window as any).iris.onWakeWordTriggered(() => {
          console.log('[UI] Wake word recognized! Booting UI...')
          setIsConnected(true)
          setSystemStatus('CONNECTING')
        })
      }
    }
  }, [])

  const toggleConnection = () => {
    if (isConnected) {
      // @ts-ignore
      window.iris.stopSession()
      setIsConnected(false)
      setSystemStatus('STANDBY')
      setIsMuted(false)
    } else {
      // @ts-ignore
      window.iris.startSession()
      setIsConnected(true)
      setSystemStatus('CONNECTING')
    }
  }

  const handleMicToggle = () => {
    const nextMutedState = !isMuted
    setIsMuted(nextMutedState)
    if ((window as any).iris?.toggleMic) {
      ;(window as any).iris.toggleMic(nextMutedState)
    }
  }

  if (isOverlay) {
    return (
      <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-transparent">
        <MiniOverlay
          isConnected={isConnected}
          toggleConnection={toggleConnection}
          isSpeaking={isSpeaking}
          isMuted={isMuted}
          handleMicToggle={handleMicToggle}
        />
      </div>
    )
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
      <SmartDropZonesWidget />
      <SemanticWidget />
      <OracleWidget />
      <WormholeWidget />
      <LeafletMapWidget />
      <StockWidget />
      <WeatherWidget />
      <ImageWidget />
      <EmailWidget />
      <TerminalOverlay />
      <LiveCodingWidget />
      <ResearchWidget />
    </div>
  )
}

export default IndexRoot
