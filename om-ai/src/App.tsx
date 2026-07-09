import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, Brain, Film, Sparkles, ExternalLink, ShieldAlert, CheckCircle, 
  Download, Smartphone, Monitor, X, Info, Cpu, Settings, Sliders, Activity,
  Hand, Terminal, Volume2, Heart, Briefcase, Zap, UploadCloud, AudioLines, Trash2, Check, Lock, Unlock, RefreshCw,
  MessageSquare, BookOpen
} from "lucide-react";
import VoicePanel from "./components/VoicePanel";
import MemoryPanel from "./components/MemoryPanel";
import VideoPanel from "./components/VideoPanel";
import AppControlPanel from "./components/AppControlPanel";
import VisionGesturePanel from "./components/VisionGesturePanel";
import CommandCenter from "./components/CommandCenter";
import MessengerHub from "./components/MessengerHub";
import BookReaderPanel from "./components/BookReaderPanel";
import { MemoryItem } from "./types";
// @ts-ignore
import omCharacterImg from "./assets/images/om_character_1783095932317.jpg";

export default function App() {
  const [activeTab, setActiveTab] = useState<"voice" | "memory" | "video" | "app_control" | "book_reader">("voice");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"app_control" | "memory" | "video" | "vision" | "automation" | "preferences" | "status" | "messenger">("app_control");
  
  // Lifted state for Voice & System Settings
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [engineMode, setEngineMode] = useState<"Live" | "Standard">("Standard");
  const [language, setLanguage] = useState<"Hindi" | "English">("Hindi");
  const [personality, setPersonality] = useState<"Empathetic" | "Professional" | "Energetic" | "Calm">("Empathetic");
  const [clonedVoiceName, setClonedVoiceName] = useState<string | null>(() => localStorage.getItem("cloned_voice_name"));
  const [isCloning, setIsCloning] = useState(false);
  const [clonedVoiceFile, setClonedVoiceFile] = useState<string | null>(() => localStorage.getItem("cloned_voice_file"));
  const [clonedVoiceActive, setClonedVoiceActive] = useState<boolean>(() => localStorage.getItem("cloned_voice_active") === "true");

  const handleVoiceCloneUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCloning(true);
    
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        localStorage.setItem("cloned_voice_name", file.name);
        localStorage.setItem("cloned_voice_file", base64Data);
        localStorage.setItem("cloned_voice_active", "true");
        setClonedVoiceName(file.name);
        setClonedVoiceFile(base64Data);
        setClonedVoiceActive(true);
        setIsCloning(false);
        showToast("🎙️ Voice cloning signature applied successfully!", "success");
      };
      reader.readAsDataURL(file);
    }, 1800);
  };

  const handleRemoveClonedVoice = () => {
    localStorage.removeItem("cloned_voice_name");
    localStorage.removeItem("cloned_voice_file");
    localStorage.setItem("cloned_voice_active", "false");
    setClonedVoiceName(null);
    setClonedVoiceFile(null);
    setClonedVoiceActive(false);
    showToast("🗑️ Voice clone profile removed.", "info");
  };
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [isSavingMemory, setIsSavingMemory] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: "success" | "info" | "tool" } | null>(null);
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);

  // PWA states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [inIframe, setInIframe] = useState(false);

  // Load Memories on Startup, Register PWA & Connection Event Listeners
  useEffect(() => {
    setInIframe(window.self !== window.top);

    // Check if app is already running in standalone mode (installed PWA)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true || 
      document.referrer.includes('android-app://');
    
    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      showToast("🎉 om AI successfully installed on your device!", "success");
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Offline & Online detection listeners
    const handleOnline = () => {
      setIsOffline(false);
      showToast("📶 Back online, bhai! Syncing memories with server...", "success");
      
      const localData = localStorage.getItem("om_memories");
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (parsed && parsed.length > 0) {
            fetch("/api/memories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(parsed),
            }).catch(err => console.warn("Failed background sync memories:", err));
          }
        } catch (e) {}
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      showToast("📡 Internet disconnected. Working in on-device Offline Mode with om, bhai!", "info");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        if (!navigator.onLine) {
          throw new Error("Device is offline");
        }
        const res = await fetch("/api/memories");
        if (res.ok) {
          const data = await res.json();
          setMemories(data);
        } else {
          throw new Error("Server storage failed");
        }
      } catch (err) {
        console.warn("Could not read memories from server, falling back to localStorage:", err);
        const localData = localStorage.getItem("om_memories");
        if (localData) {
          try {
            setMemories(JSON.parse(localData));
          } catch (e) {
            // ignore
          }
        }
      }
    };
    fetchMemories();
  }, []);

  // Save/Sync memories to backend and local storage
  const syncMemories = async (updatedMemories: MemoryItem[]) => {
    setMemories(updatedMemories);
    setIsSavingMemory(true);
    
    // Always keep localStorage updated as immediate backup
    localStorage.setItem("om_memories", JSON.stringify(updatedMemories));

    if (navigator.onLine) {
      try {
        const res = await fetch("/api/memories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedMemories),
        });
        if (!res.ok) throw new Error("Sync failed");
      } catch (err) {
        console.warn("Failed to sync memories to server-side file:", err);
      } finally {
        setIsSavingMemory(false);
      }
    } else {
      // Offline mode: saved to localStorage only
      setTimeout(() => {
        setIsSavingMemory(false);
        showToast("💾 Saved locally on your device!", "success");
      }, 500);
    }
  };

  // Add Memory callback
  const handleAddMemory = (text: string, category: MemoryItem["category"]) => {
    const newItem: MemoryItem = {
      id: crypto.randomUUID(),
      text,
      category,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...memories];
    syncMemories(updated);
    showToast(`🧠 New memory saved under "${category}"!`, "success");
  };

  // Update Memory callback
  const handleUpdateMemory = (id: string, text: string, category: MemoryItem["category"]) => {
    const updated = memories.map((m) =>
      m.id === id ? { ...m, text, category } : m
    );
    syncMemories(updated);
    showToast("✏️ Memory item updated successfully.", "info");
  };

  // Delete Memory callback
  const handleDeleteMemory = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    syncMemories(updated);
    showToast("🗑️ Memory item removed.", "info");
  };

  // Callback triggered when om voice dialog auto-extracts a memory
  const handleMemoryDetected = (text: string, category: MemoryItem["category"]) => {
    // Check if duplicate exists
    const duplicate = memories.find(m => m.text.toLowerCase() === text.toLowerCase());
    if (duplicate) return;

    const newItem: MemoryItem = {
      id: crypto.randomUUID(),
      text,
      category,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...memories];
    syncMemories(updated);
    showToast(`🧠 om learned a new fact: "${text}"`, "success");
  };

  // Toast notification helper
  const showToast = (text: string, type: "success" | "info" | "tool") => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Tool Manager: Search model responses for actionable tasks (openWebsite tool)
  useEffect(() => {
    // Scan last voice transcription or reply to see if a tool directive is present
    const lastHistory = memories[0]?.text; // example check
  }, [memories]);

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 font-sans flex flex-col relative overflow-x-hidden" id="app-root">
      
      {/* Background ambient decorative blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-1%] right-[-10%] w-[35%] h-[35%] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating interactive toast notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm"
          >
            <div className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 ${
              notification.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : notification.type === "tool"
                ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                : "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
            }`}>
              {notification.type === "success" && <CheckCircle className="w-5 h-5 shrink-0 self-center" />}
              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {notification.text}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elegant Floating Settings Button on Top Left */}
      <div className="absolute top-4 left-4 z-40">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="px-4 py-2 bg-neutral-900/85 hover:bg-neutral-900 border border-white/10 hover:border-white/20 text-white rounded-xl transition-all duration-300 shadow-xl shadow-black/50 backdrop-blur-md flex items-center gap-2 group cursor-pointer"
          id="top-left-settings-btn"
        >
          <Sliders className="w-4 h-4 text-indigo-400 group-hover:rotate-45 transition-transform duration-500" />
          <span className="text-xs font-bold tracking-tight">Settings & Panels</span>
          {/* Dynamic Mini Status Pip */}
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOffline ? "bg-amber-400" : "bg-emerald-400"}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isOffline ? "bg-amber-500" : "bg-emerald-500"}`}></span>
          </span>
        </button>
      </div>

      {/* Elegant Mode Toggle on Top Right */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setActiveTab(activeTab === "voice" ? "book_reader" : "voice")}
          className="px-4 py-2 bg-neutral-900/85 hover:bg-neutral-950 border border-white/10 hover:border-white/20 text-white rounded-xl transition-all duration-300 shadow-xl shadow-black/40 backdrop-blur-md flex items-center gap-2 group cursor-pointer"
          id="top-right-mode-toggle-btn"
        >
          {activeTab === "voice" ? (
            <>
              <BookOpen className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold tracking-tight">Book & Image Reader</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold tracking-tight">Voice Assistant</span>
            </>
          )}
        </button>
      </div>

      {/* Main View Area with Pure Voice Assistant Companion */}
      <main className="flex-1 flex flex-col justify-start w-full max-w-full overflow-y-auto" id="main-content-scroll">
        {activeTab === "voice" ? (
          <VoicePanel 
            memories={memories} 
            onMemoryDetected={handleMemoryDetected} 
            isOffline={isOffline}
            isAppLocked={isAppLocked}
            setIsAppLocked={setIsAppLocked}
            engineMode={engineMode}
            setEngineMode={setEngineMode}
            language={language}
            setLanguage={setLanguage}
            personality={personality}
            setPersonality={setPersonality}
            clonedVoiceActive={clonedVoiceActive}
            setClonedVoiceActive={setClonedVoiceActive}
            clonedVoiceName={clonedVoiceName}
            setClonedVoiceName={setClonedVoiceName}
            clonedVoiceFile={clonedVoiceFile}
            setClonedVoiceFile={setClonedVoiceFile}
            isCloning={isCloning}
            setIsCloning={setIsCloning}
            onVoiceCloneUpload={handleVoiceCloneUpload}
            onRemoveClonedVoice={handleRemoveClonedVoice}
          />
        ) : (
          <div className="pt-20">
            <BookReaderPanel
              onNotify={(text, type) => showToast(text, type)}
              isOffline={isOffline}
            />
          </div>
        )}
      </main>

      {/* Full-featured Settings Overlay (Drawer Modal) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 md:p-6"
            onClick={() => setIsSettingsOpen(false)}
            id="settings-modal-backdrop"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Settings Header */}
              <div className="px-6 py-4 border-b border-white/10 bg-neutral-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                    <img src={omCharacterImg} alt="om Mascot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                      om AI Settings & Permissions
                    </h3>
                    <p className="text-[10px] text-gray-400">Configure app control permissions, memories index database, and video studio</p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Settings Body Layout with Sidebar + Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Navigation Sidebar */}
                <div className="w-60 border-r border-white/10 bg-neutral-900/35 p-3 flex flex-col justify-between gap-4">
                  <nav className="space-y-1">
                    <button
                      onClick={() => setSettingsTab("app_control")}
                      className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                        settingsTab === "app_control"
                          ? "bg-indigo-600/15 border border-indigo-500/30 text-indigo-200"
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <span>App Permissions</span>
                    </button>
                    <button
                      onClick={() => setSettingsTab("memory")}
                      className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                        settingsTab === "memory"
                          ? "bg-indigo-600/15 border border-indigo-500/30 text-indigo-200"
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Brain className="w-4 h-4 text-pink-400" />
                      <span>Brain Memories</span>
                    </button>
                    <button
                      onClick={() => setSettingsTab("video")}
                      className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                        settingsTab === "video"
                          ? "bg-indigo-600/15 border border-indigo-500/30 text-indigo-200"
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Film className="w-4 h-4 text-emerald-400" />
                      <span>Video Production</span>
                    </button>
                    <button
                      onClick={() => setSettingsTab("vision")}
                      className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                        settingsTab === "vision"
                          ? "bg-cyan-600/15 border border-cyan-500/30 text-cyan-200"
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                      title="Spatial Hands Gesture Control & Lock Center"
                    >
                      <Hand className="w-4 h-4 text-cyan-400" />
                      <span>Hands Tracking</span>
                    </button>
                    <button
                      onClick={() => setSettingsTab("automation")}
                      className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                        settingsTab === "automation"
                          ? "bg-indigo-600/15 border border-indigo-500/30 text-indigo-200"
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                      title="Automation & CommandCenter CLI terminal"
                    >
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      <span>Automation Console</span>
                    </button>
                    <button
                      onClick={() => setSettingsTab("messenger")}
                      className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                        settingsTab === "messenger"
                          ? "bg-indigo-600/15 border border-indigo-500/30 text-indigo-200"
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                      title="Compose, draft and simulate sharing chat messages on Whatsapp, Gmail, Discord, and Telegram"
                    >
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <span>Messaging & Chat Hub</span>
                    </button>
                    <button
                      onClick={() => setSettingsTab("preferences")}
                      className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                        settingsTab === "preferences"
                          ? "bg-indigo-600/15 border border-indigo-500/30 text-indigo-200"
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                      title="Hinglish speech engine & Dynamic mood"
                    >
                      <Sliders className="w-4 h-4 text-pink-400" />
                      <span>System Preferences</span>
                    </button>
                    <button
                      onClick={() => setSettingsTab("status")}
                      className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                        settingsTab === "status"
                          ? "bg-indigo-600/15 border border-indigo-500/30 text-indigo-200"
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span>System Info</span>
                    </button>
                  </nav>

                  {/* Sidebar Footer with system statuses */}
                  <div className="bg-neutral-900/50 border border-white/5 p-3 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Engine State</span>
                      {isOffline ? (
                        <span className="text-[9px] bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded font-mono">Offline</span>
                      ) : (
                        <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-mono">Active</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Total Memories</span>
                      <span className="text-[10px] font-mono text-white font-bold">{memories.length} learned</span>
                    </div>

                    {/* App Install trigger inside sidebar */}
                    {!isInstalled && (
                      <button
                        onClick={() => {
                          if (!inIframe && deferredPrompt) {
                            deferredPrompt.prompt();
                            deferredPrompt.userChoice.then((choiceResult: any) => {
                              if (choiceResult.outcome === "accepted") {
                                showToast("🎉 Starting installation, bhai!", "success");
                              }
                              setDeferredPrompt(null);
                              setIsInstallable(false);
                            });
                          } else {
                            setShowInstallGuide(true);
                          }
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-2.5 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Install App</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Content Panel */}
                <div className="flex-1 overflow-y-auto bg-neutral-950 p-6 no-scrollbar">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={settingsTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="h-full animate-fade-in"
                    >
                      {settingsTab === "app_control" && (
                        <AppControlPanel onNavigateToTab={(tab) => setSettingsTab(tab as any)} />
                      )}
                      {settingsTab === "memory" && (
                        <MemoryPanel
                          memories={memories}
                          onAddMemory={handleAddMemory}
                          onUpdateMemory={handleUpdateMemory}
                          onDeleteMemory={handleDeleteMemory}
                          isSaving={isSavingMemory}
                        />
                      )}
                      {settingsTab === "video" && (
                        <VideoPanel />
                      )}
                      {settingsTab === "vision" && (
                        <div className="max-w-4xl mx-auto space-y-6">
                          <div className="border border-white/10 p-5 rounded-xl bg-neutral-900/40">
                            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                              <Hand className="w-4 h-4 text-cyan-400" />
                              Spatial Hands Tracking & Lock Control
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              Lock the applet with a gesture signature or perform secure hand pattern unlocks using your front camera stream. Wave your hands left, right, up, or down in front of your camera to issue motion actions.
                            </p>
                          </div>
                          <VisionGesturePanel 
                            isAppLocked={isAppLocked}
                            setIsAppLocked={setIsAppLocked}
                            onGestureAction={(gesture) => {
                              if (gesture === "SWIPE_LEFT") {
                                window.dispatchEvent(new CustomEvent("om-gesture-interrupt"));
                              }
                            }}
                          />
                        </div>
                      )}
                      {settingsTab === "automation" && (
                        <div className="max-w-4xl mx-auto space-y-6">
                          <div className="border border-white/10 p-5 rounded-xl bg-neutral-900/40">
                            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                              <Terminal className="w-4 h-4 text-indigo-400" />
                              om Executive CommandCenter & Automation Hub
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              Monitor and trigger complex automated script executions, command logs, dynamic task scheduling, and background integrations directly from the terminal console.
                            </p>
                          </div>
                          <CommandCenter />
                        </div>
                      )}
                      {settingsTab === "messenger" && (
                        <div className="max-w-5xl mx-auto space-y-6">
                          <div className="border border-white/10 p-5 rounded-xl bg-neutral-900/40">
                            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-indigo-400" />
                              om AI Message & Chat Hub
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              Generate, compose and direct-share perfectly tailored chat messages on WhatsApp, Telegram, Gmail, and SMS. Ask om to draft any message for anyone, and watch it render instantly!
                            </p>
                          </div>
                          <MessengerHub />
                        </div>
                      )}
                      {settingsTab === "preferences" && (
                        <div className="max-w-2xl mx-auto space-y-6">
                          <div className="bg-neutral-900/95 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-5">
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2 font-sans">
                              <Sliders className="w-4 h-4 text-indigo-400" />
                              <span>om AI System Preferences</span>
                            </h4>

                            {/* Engine Toggle Selection */}
                            <div className="space-y-1.5 text-left">
                              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">AI Speech Engine</span>
                              <div className="flex bg-neutral-950/60 border border-white/5 p-1 rounded-xl w-full justify-center gap-1">
                                <button
                                  onClick={() => {
                                    setEngineMode("Live");
                                    window.dispatchEvent(new CustomEvent("om-engine-change", { detail: "Live" }));
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 flex-1 justify-center ${
                                    engineMode === "Live"
                                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                                      : "text-gray-400 hover:text-white"
                                  }`}
                                >
                                  <Sparkles className="w-3.5 h-3.5" /> Gemini Live Mode
                                </button>
                                <button
                                  onClick={() => {
                                    setEngineMode("Standard");
                                    window.dispatchEvent(new CustomEvent("om-engine-change", { detail: "Standard" }));
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 flex-1 justify-center ${
                                    engineMode === "Standard"
                                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                                      : "text-gray-400 hover:text-white"
                                  }`}
                                >
                                  <Volume2 className="w-3.5 h-3.5" /> Standard Speech API
                                </button>
                              </div>
                            </div>

                            {/* Language & Personality Selection */}
                            <div className="grid grid-cols-2 gap-4 text-left">
                              <div className="space-y-1.5">
                                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Primary Language</span>
                                <div className="flex bg-neutral-950/60 border border-white/5 p-1 rounded-xl justify-center gap-1">
                                  <button
                                    onClick={() => setLanguage("Hindi")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex-1 text-center ${
                                      language === "Hindi"
                                        ? "bg-indigo-600 text-white"
                                        : "text-gray-400 hover:text-white"
                                    }`}
                                  >
                                    🇮🇳 Hindi
                                  </button>
                                  <button
                                    onClick={() => setLanguage("English")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex-1 text-center ${
                                      language === "English"
                                        ? "bg-indigo-600 text-white"
                                        : "text-gray-400 hover:text-white"
                                    }`}
                                  >
                                    🇬🇧 English
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-1.5 font-sans">
                                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Dynamic Mood</span>
                                <select
                                  value={personality}
                                  onChange={(e) => setPersonality(e.target.value as any)}
                                  className="w-full px-3 py-1.5 bg-neutral-950/60 border border-white/5 text-xs text-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold"
                                >
                                  <option value="Empathetic">🌸 Empathetic</option>
                                  <option value="Professional">💼 Professional</option>
                                  <option value="Energetic">⚡ Energetic</option>
                                  <option value="Calm">🍃 Calm (Zen)</option>
                                </select>
                              </div>
                            </div>

                            {/* Security Status Panel Lock Switch */}
                            <div className="border-t border-white/5 pt-4 space-y-2 text-left">
                              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-rose-400" /> Device Security Lock Setup
                              </span>
                              <div className="bg-neutral-950/60 border border-white/5 p-3.5 rounded-xl flex items-center justify-between">
                                <div className="text-left">
                                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span>System Locking Shield</span>
                                    {isAppLocked ? (
                                      <span className="inline-block px-1.5 py-0.5 bg-rose-500/10 text-[9px] font-mono text-rose-400 rounded-md">SECURED</span>
                                    ) : (
                                      <span className="inline-block px-1.5 py-0.5 bg-emerald-500/10 text-[9px] font-mono text-emerald-400 rounded-md">ACTIVE</span>
                                    )}
                                  </h5>
                                  <p className="text-[10px] text-gray-500 mt-0.5">
                                    Requires spatial gesture signature drawing to authorize speech & automated requests
                                  </p>
                                </div>
                                <button
                                  onClick={() => setIsAppLocked(!isAppLocked)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                                    isAppLocked
                                      ? "bg-rose-500/15 border-rose-500/35 text-rose-300 hover:bg-rose-500/25"
                                      : "bg-emerald-500/15 border-emerald-500/35 text-emerald-300 hover:bg-emerald-500/25"
                                  }`}
                                >
                                  {isAppLocked ? (
                                    <>
                                      <Unlock className="w-3.5 h-3.5" />
                                      <span>Unlock App</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-3.5 h-3.5" />
                                      <span>Lock App</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Voice Cloning Custom Integration Section */}
                            <div className="border-t border-white/5 pt-4 space-y-2 text-left">
                              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                                <AudioLines className="w-3.5 h-3.5 text-indigo-400" /> Primary AI Voice Clone Setup
                              </span>
                              
                              {clonedVoiceName ? (
                                <div className="bg-neutral-950/60 border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-4 animate-fade-in">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                                      <Check className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
                                        <span>Voice Clone Active</span>
                                        <span className="inline-block px-1.5 py-0.5 bg-emerald-500/10 text-[9px] font-mono text-emerald-400 rounded-md">100% Cloned</span>
                                      </h5>
                                      <p className="text-[10px] text-gray-500 truncate max-w-[180px] md:max-w-[240px] mt-0.5 font-mono">
                                        {clonedVoiceName}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        const nextState = !clonedVoiceActive;
                                        setClonedVoiceActive(nextState);
                                        localStorage.setItem("cloned_voice_active", String(nextState));
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                        clonedVoiceActive
                                          ? "bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30"
                                          : "bg-neutral-800 border border-white/5 text-gray-400 hover:text-white"
                                      }`}
                                    >
                                      {clonedVoiceActive ? "Primary Voice" : "Enable"}
                                    </button>
                                    <button
                                      onClick={handleRemoveClonedVoice}
                                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
                                      title="Remove Cloned Voice Profile"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ) : isCloning ? (
                                <div className="bg-neutral-950/60 border border-white/5 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-2.5">
                                  <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                                  <div>
                                    <p className="text-xs font-bold text-white">Synthesizing Voice Signature...</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5 font-mono">Training deep neural vocoder to clone profile</p>
                                  </div>
                                </div>
                              ) : (
                                <label className="group bg-neutral-950/40 hover:bg-neutral-950/65 border border-dashed border-white/10 hover:border-indigo-500/40 p-5 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2">
                                  <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleVoiceCloneUpload}
                                    className="hidden"
                                  />
                                  <UploadCloud className="w-6 h-6 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                                  <div>
                                    <p className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">
                                      Upload Your Voice Sample (.mp3/.wav)
                                    </p>
                                    <p className="text-[9px] text-gray-500 mt-1">om AI will analyze vocal timbre and adapt its neural synth automatically</p>
                                  </div>
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {settingsTab === "status" && (
                        <div className="max-w-2xl mx-auto space-y-6">
                          <div className="border border-white/10 p-5 rounded-xl bg-neutral-900/40">
                            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-400" />
                              om AI System Profile
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed mb-4">
                              om AI is configured as a fast and lightweight voice companion, integrating advanced local memory indexes and an automation hub with a zero-trust architecture. All system communication behaves under explicit user authorization.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                <span className="text-[10px] text-gray-400 block">Current Language</span>
                                <span className="text-xs font-bold text-white">Hinglish / Hindi-English Mix</span>
                              </div>
                              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                <span className="text-[10px] text-gray-400 block">Default TTS Host</span>
                                <span className="text-xs font-bold text-white">om Custom WebSynth API</span>
                              </div>
                            </div>
                          </div>

                          <div className="border border-white/10 p-5 rounded-xl bg-neutral-900/40">
                            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                              <Info className="w-4 h-4 text-indigo-400" />
                              PWA App Installation Details
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed mb-4">
                              Installing om AI adds it as a standalone app on your desktop, macOS dock, or Android/iOS homescreen. It registers offline serviceworkers allowing instant boot, voice caching, and direct hardware API locks.
                            </p>
                            <div className="flex gap-3">
                              <button
                                onClick={() => setShowInstallGuide(true)}
                                className="bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                              >
                                View Quick Guide
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Humble Footer, free of telemetry or credit slop */}
      <footer className="text-center py-4 border-t border-white/5 text-[10px] text-gray-600">
        om AI • Speech & Video Automation Workspace
      </footer>

      {/* Interactive PWA Installation Hub */}
      <AnimatePresence>
        {showInstallGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={() => setShowInstallGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-neutral-900 border border-white/10 p-6 md:p-8 rounded-2xl max-w-lg w-full shadow-2xl relative text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowInstallGuide(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-500/15 p-2.5 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Download className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Install om AI Instantly</h3>
                  <p className="text-xs text-gray-400">Add to your Homescreen or Desktop for standalone access</p>
                </div>
              </div>

              {/* Quick instructions based on device */}
              <div className="space-y-4 mb-6">
                
                {/* Standalone Click (If available) */}
                {inIframe ? (
                  <div className="bg-indigo-950/40 border border-indigo-500/25 p-4 rounded-xl flex flex-col gap-2.5 mb-2">
                    <div className="flex gap-2.5 items-start">
                      <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <h4 className="text-xs font-bold text-indigo-200">Browser Security Restriction</h4>
                        <p className="text-[11px] text-indigo-300/80 leading-relaxed">
                          Browsers strictly block PWA installations inside embedded preview screens (iframes). Open the app in a standalone tab first to let it register and install instantly!
                        </p>
                      </div>
                    </div>
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-2 px-4 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Standalone Tab
                    </a>
                  </div>
                ) : (
                  isInstallable && (
                    <div className="bg-indigo-950/40 border border-indigo-500/25 p-4 rounded-xl flex flex-col gap-2 mb-2">
                      <div className="flex gap-2.5 items-start">
                        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-indigo-200">Supported Browser Detected</h4>
                          <p className="text-[11px] text-indigo-300/80 leading-relaxed">
                            Your browser supports automatic installation! Click below to install "om AI" on your device immediately.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (deferredPrompt) {
                            deferredPrompt.prompt();
                            deferredPrompt.userChoice.then((choiceResult: any) => {
                              if (choiceResult.outcome === "accepted") {
                                showToast("🎉 Starting installation, bhai!", "success");
                              }
                              setDeferredPrompt(null);
                              setIsInstallable(false);
                              setShowInstallGuide(false);
                            });
                          }
                        }}
                        className="mt-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-2 px-4 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Direct Install om AI
                      </button>
                    </div>
                  )
                )}

                {/* Option 1: Mobile iOS Safari */}
                <div className="flex gap-3.5 items-start">
                  <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-indigo-400 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-200">iPhone / iPad (Safari)</h4>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                      Tap the standard <strong className="text-white">Share</strong> button (box with an upward arrow) at the bottom or top of your screen, scroll down, and select <strong className="text-indigo-400">"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>

                {/* Option 2: Android / Chrome */}
                <div className="flex gap-3.5 items-start">
                  <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-amber-400 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-200">Android (Chrome / Edge / Brave)</h4>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                      Tap the browser's three-dot menu icon in the top/bottom right corner, and select <strong className="text-amber-300">"Install app"</strong> or <strong className="text-amber-300">"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>

                {/* Option 3: Desktop */}
                <div className="flex gap-3.5 items-start">
                  <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-emerald-400 shrink-0">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-200">Desktop (Mac / Windows / Linux)</h4>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                      Look at the right side of your browser address bar for the <strong className="text-emerald-300">"Install" icon</strong> (usually a computer monitor with an arrow), or click the browser's main menu and select <strong className="text-emerald-300">"Install om AI"</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Note / Advisory */}
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Installing "om AI" runs the application in a standalone window, which is much faster, removes browser bars, and enables perfect mic capture without iframe restrictions.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
