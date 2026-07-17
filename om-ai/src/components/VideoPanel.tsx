import React, { useState, useRef, useEffect } from "react";
import { CutSegment, SubtitleItem, MusicTrack, VideoRecipe } from "../types";
import { 
  Upload, Film, Music, Volume2, Sparkles, Scissors, 
  RotateCcw, Play, Pause, Download, BarChart2, CheckCircle2, 
  HelpCircle, Eye, EyeOff, Sliders, Settings2, Trash2, Languages
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Local royalty-free audio tracks (synthesized or standard placeholder audio)
const BACKGROUND_TRACKS: MusicTrack[] = [
  { name: "Tech Lofi Chillhouse", mood: "Relaxed & Warm", volume: 0.15, cue: "Starts immediately" },
  { name: "Vlog Synthwave Drive", mood: "Retro & Energetic", volume: 0.12, cue: "Drops at intro scene" },
  { name: "Cinematic Corporate Uplift", mood: "Inspiring & Professional", volume: 0.18, cue: "Fades in at 3s" },
];

const DEFAULT_SAMPLE_VIDEOS = [
  { name: "Gaming_Review_Draft.mp4", size: 10485760, label: "Gaming Review Draft (60s)" },
  { name: "Tech_Tutorial_V4_Raw.mp4", size: 25165824, label: "Tech Tutorial Raw Takes (60s)" },
  { name: "Travel_Vlog_Sunset_Raw.mp4", size: 18874368, label: "Travel Vlog Sunset Raw Footage (60s)" },
];

export default function VideoPanel() {
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; isSample: boolean } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [styleReference, setStyleReference] = useState<"Hype Creator" | "Tech Educator" | "Relaxed Lofi Vlog">("Tech Educator");
  const [recipe, setRecipe] = useState<VideoRecipe | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.15);
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack>(BACKGROUND_TRACKS[0]);
  const [activeSubtitle, setActiveSubtitle] = useState<string>("");
  const [manualTrimStart, setManualTrimStart] = useState(0);
  const [manualTrimEnd, setManualTrimEnd] = useState(60);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Analysis simulation steps
  const analysisLogs = [
    "Analyzing audio frequencies and decibel dropouts...",
    "Detecting silent segments and speaker speech intervals...",
    "Locating filler word voice patterns ('um', 'uh', 'like')...",
    "Running facial and motion scene-cut scanner...",
    "Generating synced Hinglish and English subtitle cues...",
    "Compiling final non-destructive smart cut recipe..."
  ];

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile({
        name: file.name,
        size: file.size,
        isSample: false,
      });
      setRecipe(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile({
        name: file.name,
        size: file.size,
        isSample: false,
      });
      setRecipe(null);
    }
  };

  const selectSampleVideo = (sample: typeof DEFAULT_SAMPLE_VIDEOS[0]) => {
    setSelectedFile({
      name: sample.name,
      size: sample.size,
      isSample: true,
    });
    setRecipe(null);
  };

  // Run automated AI analysis
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Step-by-step UI logging
    const interval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev >= analysisLogs.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    const generateLocalMockRecipe = (): VideoRecipe => {
      const originalDuration = 60;
      const finalDuration = 48;
      const cutsCount = 4;
      const silenceRemoved = 8;
      const fillerWordsCut = 4;
      
      const cuts: CutSegment[] = [
        { id: "cut-1", start: 12, end: 14, reason: "Silence", description: "Long breathing gap removed" },
        { id: "cut-2", start: 24, end: 26, reason: "Filler Word", description: "Umm filler word removed" },
        { id: "cut-3", start: 38, end: 41, reason: "Mistake Take", description: "Repeated line take cleaned up" },
        { id: "cut-4", start: 50, end: 51, reason: "Filler Word", description: "Like filler word removed" },
      ];

      const subtitles: SubtitleItem[] = [
        { id: "sub-1", start: 0, end: 5, text: "Hey guys! Welcome back to my channel. Today we are looking at some crazy tech." },
        { id: "sub-2", start: 5, end: 11, text: "I've been testing this new setup on my desk for the last two weeks." },
        { id: "sub-3", start: 14, end: 20, text: "And honestly, the workflow efficiency gain is absolutely mind-blowing." },
        { id: "sub-4", start: 20, end: 23, text: "Let me show you exactly what I mean by that." },
        { id: "sub-5", start: 26, end: 32, text: "First, the mechanical keyboard integration is super tactile and responsive." },
        { id: "sub-6", start: 32, end: 37, text: "I can trigger macros, run server commands, and control everything." },
        { id: "sub-7", start: 41, end: 47, text: "Even when I am offline, I can use local macros to speed up my operations." },
        { id: "sub-8", start: 47, end: 50, text: "Check the local console to see it in action." },
        { id: "sub-9", start: 51, end: 56, text: "Let me know in the comments if you want the setup guide. See you soon!" },
      ];

      return {
        totalDuration: originalDuration,
        cuts,
        subtitles,
        musicTrack: BACKGROUND_TRACKS[0],
        summary: {
          originalDuration,
          finalDuration,
          cutsCount,
          silenceRemoved,
          fillerWordsCut,
          efficiencyGain: "20.0% Speed Up"
        }
      };
    };

    const generateLocalAndFinish = () => {
      const mockData = generateLocalMockRecipe();
      setTimeout(() => {
        setRecipe(mockData);
        setSelectedMusic(mockData.musicTrack || BACKGROUND_TRACKS[0]);
        setIsAnalyzing(false);
        setCurrentTime(0);
        setManualTrimStart(0);
        setManualTrimEnd(mockData.totalDuration || 60);
      }, 5500);
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      generateLocalAndFinish();
      return;
    }

    try {
      const response = await fetch("/api/video/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          styleReference,
        }),
      });

      const data = await response.json();
      
      // Delay slightly for dramatic/realistic effect and clear completion
      setTimeout(() => {
        setRecipe(data);
        setSelectedMusic(data.musicTrack || BACKGROUND_TRACKS[0]);
        setIsAnalyzing(false);
        setCurrentTime(0);
        setManualTrimStart(0);
        setManualTrimEnd(data.totalDuration || 60);
      }, 5500);

    } catch (err) {
      console.error("AI Analysis failed, falling back to local analysis generator:", err);
      generateLocalAndFinish();
    }
  };

  // Video skip trigger to handle cut skips in real-time
  useEffect(() => {
    if (!recipe || !isPlaying) return;

    // Check if the current time falls within any active cut segment
    const activeCut = recipe.cuts.find(
      (cut) => !cut.disabled && currentTime >= cut.start && currentTime < cut.end
    );

    if (activeCut && videoRef.current) {
      // Seek the video past this cut!
      videoRef.current.currentTime = activeCut.end;
      setCurrentTime(activeCut.end);
    }
  }, [currentTime, recipe, isPlaying]);

  // Update subtitles on playhead movement
  useEffect(() => {
    if (!recipe) return;
    const subtitle = recipe.subtitles.find(
      (sub) => currentTime >= sub.start && currentTime <= sub.end
    );
    // If we are currently inside an active cut segment, don't show any subtitles (since it's skipped)
    const isInCut = recipe.cuts.some(
      (cut) => !cut.disabled && currentTime >= cut.start && currentTime < cut.end
    );

    if (subtitle && !isInCut) {
      setActiveSubtitle(subtitle.text);
    } else {
      setActiveSubtitle("");
    }
  }, [currentTime, recipe]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  // Time update event handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Manual scrubbing
  const handleScrub = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Toggle disabling a cut (Manual override)
  const toggleCutDisabled = (cutId: string) => {
    if (!recipe) return;
    const updatedCuts = recipe.cuts.map((cut) => {
      if (cut.id === cutId || (cut as any)._id === cutId) {
        return { ...cut, disabled: !cut.disabled };
      }
      return cut;
    });

    // Recalculate summary stats based on current overrides
    const originalDuration = recipe.totalDuration;
    const activeCuts = updatedCuts.filter((c) => !c.disabled);
    const totalCutsDuration = activeCuts.reduce((acc, c) => acc + (c.end - c.start), 0);
    const finalDuration = Number((originalDuration - totalCutsDuration).toFixed(1));
    const silenceRemoved = Number((activeCuts.filter(c => c.reason === "Silence").reduce((acc, c) => acc + (c.end - c.start), 0)).toFixed(1));

    setRecipe({
      ...recipe,
      cuts: updatedCuts,
      summary: {
        ...recipe.summary,
        finalDuration,
        cutsCount: activeCuts.length,
        silenceRemoved,
        efficiencyGain: Math.round((totalCutsDuration / originalDuration) * 100) + "%"
      }
    });
  };

  // Run Export Simulation
  const handleExport = () => {
    setShowExportModal(true);
    setIsExporting(true);
    setExportProgress(0);
    setExportMessage("Initializing encoder...");

    const steps = [
      { progress: 15, msg: "Extracting active audio frames..." },
      { progress: 35, msg: "Splicing video frames based on smart cut recipe..." },
      { progress: 55, msg: "Baking hardcoded styled captions/subtitles..." },
      { progress: 75, msg: `Mixing background track "${selectedMusic.name}" (vol: ${Math.round(musicVolume*100)}%)...` },
      { progress: 90, msg: "Optimizing file size and encoding MP4 container..." },
      { progress: 100, msg: "Export completed successfully!" }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setExportProgress(steps[stepIndex].progress);
        setExportMessage(steps[stepIndex].msg);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsExporting(false);
      }
    }, 1200);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6" id="video-editor-root">
      
      {/* Top Heading */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-indigo-400" />
            AI Video Editing Automation
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Cut silences, dead air, and mistakes automatically. Generate synced captions and overlay matching backing tracks.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-gray-400 font-medium">Editing Pace Pacing:</label>
          <div className="flex bg-white/5 border border-white/10 p-1 rounded-lg">
            {(["Hype Creator", "Tech Educator", "Relaxed Lofi Vlog"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStyleReference(mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  styleReference === mode 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      {!recipe && !isAnalyzing ? (
        /* 1. UPLOAD STAGE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[380px] backdrop-blur-md cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="video/*" 
                className="hidden" 
              />
              <div className="bg-indigo-500/10 p-5 rounded-full text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Drag and drop your raw footage here</h3>
              <p className="text-sm text-gray-400 max-w-md mb-6">
                Supports MP4, MOV, MKV, or WebM. Standard recordings from OBS, Zoom, or your phone work perfectly.
              </p>
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer shadow-lg shadow-indigo-600/20">
                Browse Video File
              </button>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Or Try Sample Footage
              </h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Don't have a raw video handy? Select one of our sample recordings to see the automated editor scan, trim, caption, and style.
              </p>
              <div className="space-y-3">
                {DEFAULT_SAMPLE_VIDEOS.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => selectSampleVideo(sample)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      selectedFile?.name === sample.name
                        ? "bg-indigo-500/10 border-indigo-500 text-white"
                        : "bg-black/30 border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Film className={`w-4 h-4 ${selectedFile?.name === sample.name ? "text-indigo-400" : "text-gray-500"}`} />
                      <span className="text-xs font-medium truncate max-w-[160px] md:max-w-xs">{sample.label}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{(sample.size / (1024 * 1024)).toFixed(1)} MB</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedFile && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="bg-black/40 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between mb-4">
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-gray-400">Ready for processing</p>
                  </div>
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-gray-500 hover:text-red-400 cursor-pointer"
                  >
                    Change
                  </button>
                </div>
                <button
                  onClick={handleAnalyze}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Sparkles className="w-4 h-4" /> Run Automated AI Editor
                </button>
              </div>
            )}
          </div>
        </div>
      ) : isAnalyzing ? (
        /* 2. SCANNING / ANALYZING SIMULATION STAGE */
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-white/5 bg-white/[0.01] rounded-2xl p-8 backdrop-blur-md">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-4 border-t-indigo-500 border-r-indigo-500/30 border-b-indigo-500/10 border-l-indigo-500/40 animate-spin" />
            <div className="absolute inset-4 rounded-full bg-indigo-600/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-1">om AI is Editing Your Video...</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-sm text-center">
            Detecting silences, clipping fillers, and generating synced caption overlays.
          </p>

          <div className="w-full max-w-md bg-black/40 border border-white/5 p-4 rounded-xl font-mono text-xs text-left text-gray-400 space-y-2.5 h-[150px] overflow-hidden">
            {analysisLogs.slice(0, analysisStep + 1).map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 text-indigo-300">
                <span className="text-gray-600">[{idx + 1}]</span>
                <span className={idx === analysisStep ? "text-white font-semibold animate-pulse" : ""}>
                  {log}
                </span>
                {idx < analysisStep && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto shrink-0 self-center" />}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 3. ACTIVE EDITOR WORKSPACE */
        recipe && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Player & Subtitles & Timeline */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Responsive Video Canvas Box */}
              <div className="relative aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between group">
                
                {/* Simulated/Real Video Track */}
                <video
                  ref={videoRef}
                  src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41854-large.mp4"
                  className="w-full h-full object-cover"
                  onTimeUpdate={handleTimeUpdate}
                  onClick={togglePlay}
                  loop
                />

                {/* Subtitle Text Overlay */}
                {activeSubtitle && (
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-11/12 max-w-lg text-center pointer-events-none drop-shadow-lg">
                    <span className="bg-black/85 text-amber-300 border border-amber-400/20 px-4 py-2 rounded-xl text-base font-bold tracking-wide animate-fade-in inline-block shadow-lg">
                      {activeSubtitle}
                    </span>
                  </div>
                )}

                {/* Bottom Overlay Controller Panel */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-black/0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between gap-4">
                  <button
                    onClick={togglePlay}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white cursor-pointer transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <div className="flex-1 text-xs text-white font-semibold">
                    <span>{currentTime.toFixed(1)}s</span>
                    <span className="text-gray-500"> / 60.0s</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                      Live AI Splicing
                    </span>
                  </div>
                </div>
              </div>

              {/* Multi-Segment Timeline & Waveform */}
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
                  <span className="font-semibold flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5 text-indigo-400" /> Multi-Cut Spliced Playback Timeline
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px]"><span className="w-2.5 h-2.5 rounded bg-emerald-500/40 inline-block" /> Kept Video</span>
                    <span className="flex items-center gap-1 text-[10px]"><span className="w-2.5 h-2.5 rounded bg-red-500/40 inline-block" /> Auto-Cut (Silences/Outtakes)</span>
                  </div>
                </div>

                {/* Visual Audio Waveform Slices */}
                <div className="relative h-16 bg-black/60 border border-white/10 rounded-xl overflow-hidden flex items-end justify-between p-1 select-none">
                  
                  {/* Spliced sections overlays */}
                  {recipe.cuts.map((cut) => {
                    const startPercent = (cut.start / 60) * 100;
                    const widthPercent = ((cut.end - cut.start) / 60) * 100;
                    
                    if (cut.disabled) return null; // If disabled, it behaves as kept (no red overlay)

                    return (
                      <div
                        key={cut.id || (cut as any)._id}
                        style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
                        className="absolute inset-y-0 bg-red-500/35 border-x border-red-500/40 flex flex-col items-center justify-center cursor-pointer group hover:bg-red-500/45 transition-colors"
                        onClick={() => handleScrub(cut.start)}
                        title={`${cut.reason}: ${cut.description} (Click to seek)`}
                      >
                        <span className="text-[9px] font-bold text-red-200 uppercase bg-black/60 px-1 py-0.5 rounded scale-75 truncate max-w-full">
                          {cut.reason}
                        </span>
                      </div>
                    );
                  })}

                  {/* Procedural Audio Bars */}
                  {Array.from({ length: 60 }).map((_, i) => {
                    const timePos = (i / 60) * 60;
                    const isInCut = recipe.cuts.some(
                      (c) => !c.disabled && timePos >= c.start && timePos < c.end
                    );
                    
                    // Random volume amplitude representing a real sound wave
                    const height = isInCut ? "h-2" : `h-[${15 + Math.floor(Math.sin(i * 0.3) * 20 + Math.random() * 15)}px]`;
                    
                    return (
                      <div
                        key={i}
                        className={`w-[1.4%] rounded-t-sm transition-all duration-200 ${
                          isInCut 
                            ? "bg-red-500/20" 
                            : currentTime >= timePos && currentTime < timePos + 1
                            ? "bg-indigo-400"
                            : "bg-indigo-500/40"
                        }`}
                        style={{ height: isInCut ? "6px" : `${20 + Math.abs(Math.sin(i * 0.4) * 35) + (i % 3 === 0 ? 10 : 0)}px` }}
                      />
                    );
                  })}

                  {/* Playhead Marker */}
                  <div 
                    style={{ left: `${(currentTime / 60) * 100}%` }}
                    className="absolute inset-y-0 w-0.5 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,1)] z-10 pointer-events-none"
                  />
                </div>

                {/* Playhead Timeline scrubber */}
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => handleScrub(parseFloat(e.target.value))}
                  className="w-full mt-3 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />

                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>0:00</span>
                  <span>0:15</span>
                  <span>0:30</span>
                  <span>0:45</span>
                  <span>1:00</span>
                </div>
              </div>
            </div>

            {/* Right Column: Audio Mix & Cuts Breakdown & Stats */}
            <div className="space-y-6">
              
              {/* Summary Stats Board */}
              <div className="bg-white/[0.02] border border-indigo-500/10 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  Edit Efficiency Summary
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-black/30 border border-white/5 p-3 rounded-xl">
                    <p className="text-[10px] text-gray-500">Original Duration</p>
                    <p className="text-lg font-bold text-gray-300">60.0s</p>
                  </div>
                  <div className="bg-indigo-500/5 border border-indigo-500/20 p-3 rounded-xl">
                    <p className="text-[10px] text-indigo-400">Kept Video</p>
                    <p className="text-lg font-bold text-indigo-400">{recipe.summary.finalDuration}s</p>
                  </div>
                  <div className="bg-black/30 border border-white/5 p-3 rounded-xl">
                    <p className="text-[10px] text-gray-500">Silence Cut</p>
                    <p className="text-lg font-bold text-red-400">-{recipe.summary.silenceRemoved}s</p>
                  </div>
                  <div className="bg-black/30 border border-white/5 p-3 rounded-xl">
                    <p className="text-[10px] text-gray-500">Efficiency Gain</p>
                    <p className="text-lg font-bold text-emerald-400">{recipe.summary.efficiencyGain}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Auto-cuts processed:</span>
                    <span className="text-white font-semibold">{recipe.summary.cutsCount} cuts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Filler words removed:</span>
                    <span className="text-white font-semibold">{recipe.summary.fillerWordsCut} instances</span>
                  </div>
                </div>

                <button
                  onClick={handleExport}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Download className="w-3.5 h-3.5" /> Export Final Edited Video
                </button>
              </div>

              {/* Music Layer Mixing */}
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl backdrop-blur-md">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-indigo-400" />
                  Background Music Mix
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1.5">Select Soundtrack:</label>
                    <select
                      value={selectedMusic.name}
                      onChange={(e) => {
                        const track = BACKGROUND_TRACKS.find(t => t.name === e.target.value);
                        if (track) setSelectedMusic(track);
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                    >
                      {BACKGROUND_TRACKS.map((track) => (
                        <option key={track.name} value={track.name}>
                          {track.name} ({track.mood})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> Music Volume</span>
                      <span>{Math.round(musicVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.5"
                      step="0.01"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Auto Cuts Detail & Manual Restore Override */}
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl backdrop-blur-md flex-1">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-indigo-400" />
                  Spliced Cuts (Manual Override)
                </h3>
                <p className="text-[10px] text-gray-400 mb-4 leading-relaxed">
                  Click the toggle to restore any cut scene. restored cuts are seamlessly merged back into the video during playback.
                </p>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {recipe.cuts.map((cut) => (
                    <div
                      key={cut.id || (cut as any)._id}
                      className={`p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                        cut.disabled
                          ? "bg-emerald-500/5 border-emerald-500/20 opacity-80"
                          : "bg-black/35 border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                            cut.reason === "Silence" 
                              ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                              : cut.reason === "Filler Word"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}>
                            {cut.reason}
                          </span>
                          <span className="text-gray-500 text-[10px]">{cut.start.toFixed(1)}s - {cut.end.toFixed(1)}s</span>
                        </div>
                        <p className="text-gray-400 text-[10px] mt-1 italic">{cut.description}</p>
                      </div>

                      <button
                        onClick={() => toggleCutDisabled(cut.id || (cut as any)._id)}
                        className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center gap-1 ${
                          cut.disabled
                            ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20"
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                        }`}
                        title={cut.disabled ? "Click to cut this segment again" : "Click to keep/restore this segment"}
                      >
                        {cut.disabled ? (
                          <>
                            <Eye className="w-3.5 h-3.5" /> <span className="text-[10px]">Restored</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> <span className="text-[10px]">Cut</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Export Simulation Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-neutral-900 border border-white/10 p-6 md:p-8 rounded-2xl max-w-md w-full text-center shadow-2xl relative"
          >
            <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              {isExporting ? <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" /> : <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              {isExporting ? "Exporting Video..." : "Export Complete!"}
            </h3>
            
            <p className="text-sm text-gray-400 mb-6">
              {exportMessage}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-white/5 rounded-full h-2.5 mb-6 overflow-hidden">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>

            {/* Completion stats or close button */}
            {!isExporting ? (
              <div className="space-y-4">
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl text-left text-xs text-gray-300 space-y-1">
                  <p className="font-bold text-emerald-400 text-sm mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Ready to Upload!
                  </p>
                  <p>• Output filename: <span className="text-white font-semibold">edited_{selectedFile?.name}</span></p>
                  <p>• Spliced Cuts: <span className="text-white font-semibold">{recipe?.cuts.filter(c => !c.disabled).length} cuts applied</span></p>
                  <p>• Backing Music track: <span className="text-white font-semibold">{selectedMusic.name}</span></p>
                  <p>• Subtitles: <span className="text-white font-semibold">Baked in Hinglish captions</span></p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 bg-white/10 hover:bg-white/15 text-white py-2.5 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                  <a
                    href="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41854-large.mp4"
                    download={`edited_${selectedFile?.name}`}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-semibold text-xs text-center cursor-pointer transition-colors"
                  >
                    Download MP4
                  </a>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray-500">Please do not close this tab. Encoding at 60fps...</span>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
