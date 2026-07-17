import React, { useState, useRef, useEffect } from "react";
import { 
  BookOpen, Upload, Volume2, VolumeX, Play, Pause, Square, 
  Sparkles, Layers, Sliders, Check, Settings, AlertCircle, FileText,
  RefreshCw, Trash2, Languages, HelpCircle, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AiProviderConfig, AiProviderType, OcrScanResult } from "../types";

export const PROVIDERS_INFO = {
  gemini: {
    name: "Google Gemini",
    defaultModel: "gemini-2.5-flash",
    models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"],
    apiUrl: "",
    placeholderKey: "AIzaSy..."
  },
  nvidia: {
    name: "NVIDIA NIM",
    defaultModel: "nvidia/llama-3.1-nemotron-70b-instruct",
    models: ["nvidia/llama-3.1-nemotron-70b-instruct", "nvidia/nemotron-4-340b-instruct", "nvidia/minimax-text-01", "nvidia/mistral-large-2-instruct"],
    apiUrl: "https://integrate.api.nvidia.com/v1",
    placeholderKey: "nvapi-..."
  },
  openrouter: {
    name: "OpenRouter",
    defaultModel: "meta-llama/llama-3.1-405b-instruct",
    models: ["meta-llama/llama-3.1-405b-instruct", "google/gemini-flash-1.5", "anthropic/claude-3.5-sonnet", "deepseek/deepseek-chat"],
    apiUrl: "https://openrouter.ai/api/v1",
    placeholderKey: "sk-or-..."
  },
  anthropic: {
    name: "Anthropic Claude",
    defaultModel: "claude-3-5-sonnet-latest",
    models: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest", "claude-3-opus-latest"],
    apiUrl: "https://api.anthropic.com/v1",
    placeholderKey: "sk-ant-..."
  },
  minimax: {
    name: "MiniMax",
    defaultModel: "minimax-text-01",
    models: ["minimax-text-01", "abab6.5g-chat", "abab6.5s-chat"],
    apiUrl: "https://api.minimax.chat/v1",
    placeholderKey: "ey..."
  },
  deepseek: {
    name: "DeepSeek",
    defaultModel: "deepseek-chat",
    models: ["deepseek-chat", "deepseek-coder"],
    apiUrl: "https://api.deepseek.com",
    placeholderKey: "sk-..."
  }
};

interface BookReaderPanelProps {
  onNotify: (text: string, type: "success" | "info" | "tool") => void;
  isOffline?: boolean;
}

export default function BookReaderPanel({ onNotify, isOffline }: BookReaderPanelProps) {
  // Config state
  const [providerConfig, setProviderConfig] = useState<AiProviderConfig>(() => {
    const saved = localStorage.getItem("om_ocr_provider_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      provider: "gemini",
      apiKey: "",
      model: "gemini-2.5-flash"
    };
  });

  const [isConfigEditing, setIsConfigEditing] = useState(false);
  const [tempConfig, setTempConfig] = useState<AiProviderConfig>({ ...providerConfig });

  // Book/Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<OcrScanResult | null>(() => {
    const saved = localStorage.getItem("om_ocr_last_result");
    return saved ? JSON.parse(saved) : null;
  });

  // TTS playback state
  const [playbackStatus, setPlaybackStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [playbackPitch, setPlaybackPitch] = useState(1.0);
  const [playbackVolume, setPlaybackVolume] = useState(1.0);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== "undefined" ? window.speechSynthesis : null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<any>(null);
  const wordSpansRef = useRef<{ [key: number]: HTMLSpanElement | null }>({});

  // Load SpeechSynthesis Voices
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    
    const loadVoices = () => {
      const voices = synth.getVoices();
      setAvailableVoices(voices);
      
      // Auto-select a voice
      if (voices.length > 0 && !selectedVoice) {
        const defaultVoice = voices.find(v => v.lang.includes("en")) || voices[0];
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }, []);

  // Save Config to LocalStorage
  const handleSaveConfig = () => {
    localStorage.setItem("om_ocr_provider_config", JSON.stringify(tempConfig));
    setProviderConfig(tempConfig);
    setIsConfigEditing(false);
    onNotify(`⚙️ Provider configured: ${PROVIDERS_INFO[tempConfig.provider].name} using ${tempConfig.model}`, "success");
  };

  // Image Drag/Drop & File Input handlers
  const processSelectedImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      onNotify("🚫 Please upload an image file (PNG, JPG, WebP)!", "info");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      onNotify("📖 Book page uploaded. Click 'Analyze & Read Out Loud' to start scanning!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedImage(file);
    }
  };

  // Perform Vision-OCR Scan
  const handleStartOcrScan = async () => {
    if (!imagePreview) {
      onNotify("🚫 Please upload a book page or text image first!", "info");
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    stopPlayback();

    const activeOffline = isOffline || (typeof navigator !== "undefined" && !navigator.onLine);
    if (activeOffline && providerConfig.provider !== "gemini") {
      setIsScanning(false);
      onNotify("📡 You are offline! Multi-provider OCR is only supported online.", "info");
      return;
    }

    try {
      // Strip metadata from base64
      const base64Data = imagePreview.split(",")[1];
      const mimeType = imagePreview.split(";")[0].split(":")[1];

      const response = await fetch("/api/ocr-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Data,
          mimeType,
          providerConfig
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to scan image");
      }

      const result: OcrScanResult = {
        text: data.text,
        wordCount: data.text.split(/\s+/).filter(Boolean).length,
        language: data.language || "English",
        scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setScanResult(result);
      localStorage.setItem("om_ocr_last_result", JSON.stringify(result));
      onNotify(`🎉 Book successfully scanned! Detected ${result.wordCount} words. Ready to read out loud!`, "success");
    } catch (error: any) {
      console.error("OCR scanning error:", error);
      onNotify(`⚠️ Scan failed: ${error.message}. Try adjusting provider API keys.`, "info");
    } finally {
      setIsScanning(false);
    }
  };

  const words = scanResult ? scanResult.text.split(/\s+/).filter(Boolean) : [];

  // Speech Synthesizer Control
  const startPlayback = () => {
    if (!scanResult || words.length === 0) return;

    if (playbackStatus === "paused") {
      if (synthRef.current) {
        synthRef.current.resume();
        setPlaybackStatus("playing");
        startTimerHighlighting(currentWordIndex);
        return;
      }
    }

    stopPlayback();

    const synth = synthRef.current;
    if (!synth) {
      onNotify("🚫 Web Speech API is not supported in this browser.", "info");
      return;
    }

    // Build speech text
    const textToSpeak = scanResult.text;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Apply pitch/rate/volume
    utterance.rate = playbackRate;
    utterance.pitch = playbackPitch;
    utterance.volume = playbackVolume;

    // Apply voice
    if (selectedVoice) {
      const voice = availableVoices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }

    // Attempt native word boundary tracking (fallback to timer if boundary not supported or in iframe)
    let hasNativeBoundary = false;
    utterance.onboundary = (e) => {
      if (e.name === "word") {
        hasNativeBoundary = true;
        // Find corresponding word index
        const charIndex = e.charIndex;
        let index = 0;
        let runningLength = 0;
        
        for (let i = 0; i < words.length; i++) {
          runningLength += words[i].length + 1; // +1 for space
          if (runningLength >= charIndex) {
            index = i;
            break;
          }
        }
        setCurrentWordIndex(index);
        scrollActiveWordIntoView(index);
      }
    };

    utterance.onend = () => {
      setPlaybackStatus("idle");
      setCurrentWordIndex(-1);
      clearTimer();
    };

    utterance.onerror = (e) => {
      console.warn("TTS Synthesis Error:", e);
      setPlaybackStatus("idle");
      setCurrentWordIndex(-1);
      clearTimer();
    };

    setPlaybackStatus("playing");
    synth.speak(utterance);

    // Fallback timer highlighting in case onboundary doesn't fire (common inside iframe embeds)
    setTimeout(() => {
      if (!hasNativeBoundary && playbackStatus !== "idle") {
        console.log("SpeechSynthesis onboundary didn't fire. Triggering robust timer-based word highlighting fallback.");
        startTimerHighlighting(0);
      }
    }, 300);
  };

  const startTimerHighlighting = (startIndex: number) => {
    clearTimer();
    let index = startIndex;
    setCurrentWordIndex(index);

    // Calculate dynamic delay based on speaking rate (words per minute approximation)
    // 1.0 rate ~ 150 words per minute (400ms per word)
    const msPerWord = (60000 / 150) / playbackRate;

    timerRef.current = setInterval(() => {
      index++;
      if (index >= words.length) {
        clearTimer();
        return;
      }
      setCurrentWordIndex(index);
      scrollActiveWordIntoView(index);
    }, msPerWord);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const pausePlayback = () => {
    if (synthRef.current && playbackStatus === "playing") {
      synthRef.current.pause();
      setPlaybackStatus("paused");
      clearTimer();
    }
  };

  const stopPlayback = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setPlaybackStatus("idle");
    setCurrentWordIndex(-1);
    clearTimer();
  };

  const scrollActiveWordIntoView = (index: number) => {
    const el = wordSpansRef.current[index];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  };

  // Helper to remove result
  const handleClearAll = () => {
    stopPlayback();
    setImagePreview(null);
    setImageFile(null);
    setScanResult(null);
    localStorage.removeItem("om_ocr_last_result");
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 text-left max-w-6xl mx-auto space-y-6" id="book-reader-root">
      
      {/* Header and Brand Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <BookOpen className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide font-sans">Om AI Book & Image Reader</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Convert book pages or screenshots into exact spoken words with multi-engine OCR & Speech.
          </p>
        </div>

        {/* AI Provider Config Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTempConfig({ ...providerConfig });
              setIsConfigEditing(!isConfigEditing);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
              isConfigEditing 
                ? "bg-indigo-600 text-white border-indigo-500" 
                : "bg-neutral-900/60 border-white/5 text-gray-300 hover:text-white hover:border-white/10"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>AI Provider Settings</span>
          </button>
        </div>
      </div>

      {/* AI Provider Configurations Editor */}
      <AnimatePresence>
        {isConfigEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-neutral-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-4">
              <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase">CHOOSE AI PROVIDER & SETUP ENGINE</span>
              <span className="text-[10px] text-gray-500 font-mono">Keys are stored securely on your browser</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Left Column: Provider Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">AI API Provider</label>
                <select
                  value={tempConfig.provider}
                  onChange={(e) => {
                    const prov = e.target.value as AiProviderType;
                    setTempConfig({
                      provider: prov,
                      apiKey: prov === "gemini" ? "" : tempConfig.apiKey, // Keep api key if possible
                      model: PROVIDERS_INFO[prov].defaultModel
                    });
                  }}
                  className="w-full px-3 py-2 bg-neutral-950 border border-white/5 text-xs text-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  {Object.entries(PROVIDERS_INFO).map(([key, info]) => (
                    <option key={key} value={key}>{info.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500">
                  Select where OCR processing runs. <strong>Gemini</strong> is recommended for on-device/default workflows.
                </p>
              </div>

              {/* Middle Column: API Key */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                  {PROVIDERS_INFO[tempConfig.provider].name} API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder={
                      tempConfig.provider === "gemini" 
                        ? "Optional (Uses server key fallback)" 
                        : `Enter your ${PROVIDERS_INFO[tempConfig.provider].name} API key`
                    }
                    value={tempConfig.apiKey}
                    onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/5 text-xs text-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-gray-500">
                  {tempConfig.provider === "gemini" 
                    ? "Leave empty to use standard server-side Gemini credential configuration." 
                    : `Provide key format starting with ${PROVIDERS_INFO[tempConfig.provider].placeholderKey}`}
                </p>
              </div>

              {/* Right Column: Model Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Model Selection</label>
                <select
                  value={tempConfig.model}
                  onChange={(e) => setTempConfig({ ...tempConfig, model: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-white/5 text-xs text-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {PROVIDERS_INFO[tempConfig.provider].models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500">
                  Dynamic visual model for precise text transcription.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/5 pt-4 mt-5">
              <button
                onClick={() => setIsConfigEditing(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-gray-300 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Apply Engine Config
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Upload & Scan View + Extracted Text Speak View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Image Drop Zone / Camera upload (SPAN 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Book Page & Text Image Source</span>
            
            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-neutral-950/20 hover:bg-neutral-950/45 min-h-[280px]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processSelectedImage(file);
                  }}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors">
                  Upload Book Page / Document Image
                </h4>
                <p className="text-[10px] text-gray-500 mt-1 max-w-xs leading-relaxed">
                  Drag and drop your files here or click to browse. Supports PNG, JPG, WebP screenshots or page snaps.
                </p>
              </div>
            ) : (
              <div className="relative rounded-xl border border-white/10 overflow-hidden bg-black min-h-[280px] flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Book preview"
                  className="max-h-[360px] object-contain w-full select-none"
                  referrerPolicy="no-referrer"
                />

                {/* Animated Scanner HUD Overlay */}
                {isScanning && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,1)] animate-scan-hud z-10" />
                )}

                {/* Cyber Scanner Corners */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-indigo-500/60" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-indigo-500/60" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-indigo-500/60" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-indigo-500/60" />

                {/* Scan Overlay Backdrop */}
                {isScanning && (
                  <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center space-y-3 z-10 animate-pulse">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                    <div>
                      <p className="text-xs font-bold text-white tracking-wide">Processing Page OCR...</p>
                      <p className="text-[9px] font-mono text-cyan-400/80 mt-0.5 uppercase tracking-wider">
                        {providerConfig.provider} Engine Active
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {imagePreview && (
                <button
                  onClick={handleClearAll}
                  disabled={isScanning}
                  className="px-3 bg-neutral-800 hover:bg-neutral-700 text-gray-300 rounded-xl transition-colors text-xs flex items-center justify-center cursor-pointer border border-white/5"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleStartOcrScan}
                disabled={isScanning || !imagePreview}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isScanning ? "Transcribing Words..." : "Analyze & Read Out Loud"}</span>
              </button>
            </div>
          </div>

          {/* Current AI Config status card */}
          <div className="bg-neutral-900/35 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs">
                {providerConfig.provider === "gemini" ? "G" : "A"}
              </div>
              <div className="text-left">
                <span className="text-[9px] text-gray-500 block uppercase">Active OCR Transcriber</span>
                <span className="text-xs font-bold text-indigo-300">{PROVIDERS_INFO[providerConfig.provider].name}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-gray-500 block uppercase">Active LLM Model</span>
              <span className="text-[10px] text-gray-300">{providerConfig.model}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Text reading & TTS highlighting pane (SPAN 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 min-h-[460px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase">TRANSCRIBED BOOK TEXT READING PANEL</span>
              </div>
              {scanResult && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                  <Languages className="w-3.5 h-3.5" />
                  <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full uppercase">{scanResult.language}</span>
                  <span>|</span>
                  <span>{scanResult.wordCount} words</span>
                  <span>|</span>
                  <span>{scanResult.scannedAt}</span>
                </div>
              )}
            </div>

            {/* Read Text Display Area */}
            <div className="flex-1 bg-neutral-950/40 border border-white/5 rounded-2xl p-5 overflow-y-auto max-h-[320px] custom-scrollbar text-base font-serif leading-relaxed text-gray-200">
              {scanResult ? (
                <p className="whitespace-pre-wrap select-text">
                  {words.map((word, index) => {
                    const active = index === currentWordIndex;
                    return (
                      <span
                        key={index}
                        ref={(el) => { wordSpansRef.current[index] = el; }}
                        className={`inline-block mr-1.5 px-0.5 rounded-md transition-all ${
                          active 
                            ? "bg-amber-400 text-black font-extrabold shadow-md scale-105" 
                            : "hover:text-white"
                        }`}
                      >
                        {word}
                      </span>
                    );
                  })}
                </p>
              ) : (
                <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center text-gray-500">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-300 font-sans">No book scanned yet</h5>
                    <p className="text-[11px] text-gray-500 mt-1 max-w-sm font-sans leading-relaxed">
                      Upload an image file containing a book page, text box, or document. om AI will use its advanced neural networks to extract and voice them exactly.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Speach Controller Station */}
            {scanResult && (
              <div className="bg-neutral-950/40 border border-white/5 rounded-xl p-4 space-y-4">
                {/* Visual Audio Wave animation */}
                <div className="flex items-center justify-between h-8">
                  <div className="flex items-center gap-1 flex-1">
                    {playbackStatus === "playing" ? (
                      Array.from({ length: 24 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            height: [4, Math.floor(Math.random() * 24 + 4), 4]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.25 + i * 0.04,
                            ease: "easeInOut"
                          }}
                          className="w-[3px] rounded-full bg-indigo-500"
                        />
                      ))
                    ) : (
                      <div className="w-full h-[2px] bg-neutral-800" />
                    )}
                  </div>
                  {currentWordIndex >= 0 && (
                    <span className="text-[10px] font-mono text-gray-500 ml-4">
                      Word {currentWordIndex + 1} of {words.length}
                    </span>
                  )}
                </div>

                {/* Primary Speech Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {playbackStatus === "playing" ? (
                      <button
                        onClick={pausePlayback}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Pause</span>
                      </button>
                    ) : (
                      <button
                        onClick={startPlayback}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{playbackStatus === "paused" ? "Resume" : "Speak Words Exactly"}</span>
                      </button>
                    )}
                    
                    <button
                      onClick={stopPlayback}
                      disabled={playbackStatus === "idle"}
                      className="p-2.5 bg-neutral-850 hover:bg-neutral-800 disabled:opacity-40 text-gray-300 hover:text-white rounded-xl border border-white/5 transition-all cursor-pointer"
                      title="Stop Speech"
                    >
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Voice Selector and Customize Controls */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Voice Selection dropdown */}
                    <div className="flex flex-col text-left space-y-1">
                      <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider">Accent Voice</span>
                      <select
                        value={selectedVoice || ""}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="px-2.5 py-1 bg-neutral-900 border border-white/5 text-[11px] text-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 font-sans max-w-[150px] font-medium"
                      >
                        {availableVoices.map((v) => (
                          <option key={v.name} value={v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Speed/Rate dropdown */}
                    <div className="flex flex-col text-left space-y-1">
                      <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider">Speed Rate</span>
                      <select
                        value={playbackRate}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setPlaybackRate(val);
                          if (playbackStatus === "playing") {
                            // Restart speech with new speed
                            setTimeout(() => startPlayback(), 50);
                          }
                        }}
                        className="px-2 py-1 bg-neutral-900 border border-white/5 text-[11px] text-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 font-mono font-medium"
                      >
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1.0">1.0x (Normal)</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2.0">2.0x</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
