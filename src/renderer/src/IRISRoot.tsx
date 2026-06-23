import { useState, useEffect, useRef } from 'react'
import IRIS from './UI/IRIS'
import TitleBar from './components/Titlebar'

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
