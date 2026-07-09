import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Shield, Zap, Sparkles } from "lucide-react";

interface OmSuperheroCharacterProps {
  status: "idle" | "speaking" | "listening" | "connecting" | "error" | "disconnected";
  superhero: "superman" | "spiderman" | "ironman" | "batman";
  isMasked: boolean;
  setIsMasked: (val: boolean) => void;
  language: "Hindi" | "English";
  audioPlayerRef?: React.RefObject<any>;
}

export default function OmSuperheroCharacter({
  status,
  superhero,
  isMasked,
  setIsMasked,
  language,
  audioPlayerRef
}: OmSuperheroCharacterProps) {
  const isSpeaking = status === "speaking";
  const isListening = status === "listening";
  const isConnecting = status === "connecting";
  const isDisconnected = status === "disconnected" || status === "error";

  // Periodic Blink State
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
    }, 3800 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Periodic Random Head Turn / Micro-gesture to simulate life
  const [headTurn, setHeadTurn] = useState(0);
  const [headTilt, setHeadTilt] = useState(0);
  useEffect(() => {
    if (isDisconnected) return;
    const interval = setInterval(() => {
      setHeadTurn((Math.random() - 0.5) * 4); // Small look left/right
      setHeadTilt((Math.random() - 0.5) * 2); // Small cock of the head
    }, 2500 + Math.random() * 2500);
    return () => clearInterval(interval);
  }, [isDisconnected]);

  // Speaking state mouth fluctuation
  const [mouthYScale, setMouthYScale] = useState(1);
  useEffect(() => {
    if (!isSpeaking) {
      setMouthYScale(1);
      return;
    }

    let animationFrameId: number;

    const updateMouth = () => {
      let rms = 0;
      if (audioPlayerRef?.current?.analyser) {
        const analyser = audioPlayerRef.current.analyser;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = dataArray[i] / 128.0 - 1.0;
          sum += val * val;
        }
        rms = Math.sqrt(sum / bufferLength);
      }

      if (rms > 0.005) {
        // Map RMS audio level to natural chiseled mouth opening height
        const scale = 0.3 + rms * 24;
        setMouthYScale(Math.max(0.3, Math.min(3.2, scale)));
      } else {
        // Smooth random fall-back so talking stays organic between voice chunks
        setMouthYScale(0.3 + Math.random() * 2.2);
      }

      animationFrameId = requestAnimationFrame(updateMouth);
    };

    animationFrameId = requestAnimationFrame(updateMouth);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, audioPlayerRef]);

  // Breathing motion values
  const breathY = [0, -4, 0];
  const breathScaleY = [1, 1.012, 1];
  const breathTransition = {
    repeat: Infinity,
    duration: 3.8,
    ease: "easeInOut"
  };

  // Neon signature colors for glowing borders
  const getHeroThemeColor = () => {
    switch (superhero) {
      case "ironman": return "border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.25)]";
      case "spiderman": return "border-sky-500/30 shadow-[0_0_30px_rgba(14,165,233,0.25)]";
      case "superman": return "border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.25)]";
      case "batman": return "border-zinc-500/30 shadow-[0_0_30px_rgba(113,113,122,0.25)]";
    }
  };

  return (
    <div className={`relative w-full h-[520px] transition-all duration-700 overflow-hidden flex flex-col justify-between ${getHeroThemeColor()}`}>
      
      {/* 1. CINEMATIC ATMOSPHERIC ROOM BACKGROUND */}
      <div className="absolute inset-0 -z-10 bg-neutral-950 overflow-hidden">
        {/* Deep dark background vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900 to-neutral-950 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,30,40,0.4),transparent_70%)]" />

        {/* Dynamic Studio Ambient Glow reflecting the active Hero */}
        {superhero === "ironman" && <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-red-600/10 blur-[100px] animate-pulse duration-5000" />}
        {superhero === "spiderman" && <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-sky-500/10 blur-[100px] animate-pulse duration-5000" />}
        {superhero === "superman" && <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-blue-600/10 blur-[100px] animate-pulse duration-5000" />}
        {superhero === "batman" && <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-zinc-800/20 blur-[100px] animate-pulse duration-5000" />}

        {/* Floating dust particle effects in background (for cinematic volume) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute w-1 h-1 bg-white rounded-full top-20 left-12 animate-ping" style={{ animationDuration: "3s" }} />
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-48 right-16 animate-ping" style={{ animationDuration: "4s" }} />
          <div className="absolute w-1 h-1 bg-white rounded-full bottom-36 left-1/3 animate-ping" style={{ animationDuration: "5.5s" }} />
        </div>

        {/* 3D Floor Grid Depth reflection */}
        <div className="absolute bottom-0 inset-x-0 h-[140px] bg-gradient-to-t from-neutral-950 via-neutral-900 to-transparent border-t border-white/[0.03] opacity-90" />

        {/* Futuristic Workshop Bay Window */}
        <div className="absolute top-8 right-6 w-36 h-48 rounded-t-3xl border border-white/5 bg-neutral-950/80 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-end p-2.5">
          
          {/* Dynamic Window Skies based on Hero */}
          {superhero === "superman" && (
            <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-800 flex items-center justify-center">
              {/* Metropolis high-altitude sky */}
              <div className="absolute w-24 h-8 bg-white/30 rounded-full top-6 left-2 blur-sm animate-pulse duration-4000" />
              <div className="absolute w-16 h-6 bg-white/20 rounded-full top-16 right-1 blur-sm" />
              {/* Holographic Daily Planet spinning globe */}
              <motion.div 
                animate={{ rotateY: 360 }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                className="w-12 h-12 rounded-full border border-yellow-400/30 bg-yellow-400/5 flex items-center justify-center text-[7px] font-mono text-yellow-300 font-bold"
              >
                METROPOLIS
              </motion.div>
            </div>
          )}

          {superhero === "spiderman" && (
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-neutral-950 flex flex-col justify-end">
              {/* Detailed Queens/New York Skyline */}
              <div className="flex items-end justify-between px-1.5 h-2/3 opacity-30">
                <div className="w-3.5 h-16 bg-neutral-800 rounded-t" />
                <div className="w-5 h-28 bg-neutral-700 rounded-t relative">
                  <div className="w-1 h-8 bg-red-500 absolute -top-7 left-2 opacity-50 animate-pulse" />
                </div>
                <div className="w-4 h-20 bg-neutral-800 rounded-t" />
                <div className="w-3 h-24 bg-neutral-900 rounded-t" />
              </div>
              {/* Silver spiderweb detail */}
              <div className="absolute top-0 right-0 w-10 h-10 border-l border-b border-white/10 rounded-bl-full pointer-events-none" />
            </div>
          )}

          {superhero === "ironman" && (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-neutral-950 to-black flex flex-col items-center justify-center p-2">
              {/* Stark Tech UI overlays on Glass */}
              <div className="absolute inset-2 border border-teal-500/20 rounded-t-2xl flex items-center justify-center animate-pulse duration-3000">
                <div className="w-16 h-16 rounded-full border border-dashed border-teal-500/15 animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <span className="text-[6px] font-mono text-teal-400 font-extrabold uppercase tracking-widest text-center mt-10">ARMOR BAY #04</span>
            </div>
          )}

          {superhero === "batman" && (
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-slate-950 to-black flex items-center justify-center">
              {/* Foggy Gotham skyline with distant Bat-Signal */}
              <div className="absolute top-4 left-4 w-12 h-12 bg-yellow-500/10 rounded-full blur-md animate-pulse duration-4000" />
              <svg className="w-7 h-7 text-yellow-500/30 animate-pulse duration-2000" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14c0 .55-.45 1-1 1s-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4zm0-6c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1z"/>
              </svg>
              {/* Rain/mist lines */}
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
            </div>
          )}

          {/* Holographic labels */}
          <div className="w-full text-center text-[6px] font-mono text-white/20 select-none z-10 border-t border-white/5 pt-1">
            EXTERNAL TELEMETRY
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC NEON HEADER OVERLAY */}
      <div className="w-full p-3.5 flex items-center justify-between bg-black/60 border-b border-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          {/* Active status pulse with glowing core */}
          <div className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isListening ? "bg-emerald-400" : isSpeaking ? "bg-indigo-400" : "bg-amber-400"
            }`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isListening ? "bg-emerald-500" : isSpeaking ? "bg-indigo-500" : "bg-amber-500"
            }`} />
          </div>
          <span className="text-[10px] font-mono text-neutral-300 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
            om system <span className="text-white/30 font-light">//</span> <span className="text-indigo-400">{superhero}</span>
          </span>
        </div>

        {/* Elegant Unmask toggle */}
        <button
          onClick={() => setIsMasked(!isMasked)}
          className={`px-3 py-1.2 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1.5 transition-all duration-300 cursor-pointer border ${
            isMasked
              ? "bg-amber-500/10 border-amber-500/25 text-amber-300 hover:bg-amber-500/20"
              : "bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20"
          }`}
        >
          {isMasked ? (
            <>
              <Eye className="w-3 h-3 animate-pulse" />
              <span>UNMASK SUIT</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3" />
              <span>ACTIVATE MASK</span>
            </>
          )}
        </button>
      </div>

      {/* 3. HERO BODY - HIGH-FIDELITY DESIGN STAGE */}
      <div className="relative w-full flex-1 flex items-end justify-center overflow-hidden pt-4">
        
        {/* Breathing Framer-Motion wrapper */}
        <motion.div
          animate={{ y: breathY, scaleY: breathScaleY }}
          transition={breathTransition}
          className="relative w-[310px] h-[390px] flex items-end justify-center"
          style={{ transformOrigin: "bottom center" }}
        >
          <svg
            viewBox="0 0 320 400"
            className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] select-none pointer-events-none"
          >
            <defs>
              {/* ==================== PROFESSIONAL CINEMATIC GRADIENTS ==================== */}
              {/* Superman Skin */}
              <linearGradient id="skinSuperman" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffdbb5" />
                <stop offset="60%" stopColor="#e2a77b" />
                <stop offset="100%" stopColor="#b77749" />
              </linearGradient>
              <linearGradient id="suitBlueSuperman" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="40%" stopColor="#1d4ed8" />
                <stop offset="85%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Spider-Man Skin & Suits */}
              <linearGradient id="skinSpiderman" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe5cc" />
                <stop offset="50%" stopColor="#d5a075" />
                <stop offset="100%" stopColor="#9a6235" />
              </linearGradient>
              <linearGradient id="suitRedSpiderman" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="35%" stopColor="#dc2626" />
                <stop offset="80%" stopColor="#991b1b" />
                <stop offset="100%" stopColor="#450a0a" />
              </linearGradient>
              <linearGradient id="suitBlueSpiderman" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="60%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#030712" />
              </linearGradient>

              {/* Iron Man Gold & Red Metallics (3D Car Paint look) */}
              <linearGradient id="suitRedIronman" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="20%" stopColor="#ef4444" />
                <stop offset="55%" stopColor="#dc2626" />
                <stop offset="85%" stopColor="#7f1d1d" />
                <stop offset="100%" stopColor="#3b0707" />
              </linearGradient>
              <linearGradient id="suitGoldIronman" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="30%" stopColor="#facc15" />
                <stop offset="70%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#713f12" />
              </linearGradient>
              <linearGradient id="skinIronman" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffdec0" />
                <stop offset="60%" stopColor="#dba173" />
                <stop offset="100%" stopColor="#a36b3f" />
              </linearGradient>

              {/* Batman Dark Kevlar Armor & Skin */}
              <linearGradient id="skinBatman" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffeae0" />
                <stop offset="60%" stopColor="#caa08c" />
                <stop offset="100%" stopColor="#9a6e5a" />
              </linearGradient>
              <linearGradient id="suitGreyBatman" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6b7280" />
                <stop offset="40%" stopColor="#4b5563" />
                <stop offset="80%" stopColor="#1f2937" />
                <stop offset="100%" stopColor="#111827" />
              </linearGradient>
              <linearGradient id="suitBlackBatman" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#374151" />
                <stop offset="50%" stopColor="#1f2937" />
                <stop offset="100%" stopColor="#030712" />
              </linearGradient>

              {/* Glowing Lenses / Energy Arc Reactors */}
              <radialGradient id="arcReactorCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#e0f7fa" />
                <stop offset="60%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="kryptonShieldGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#0369a1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="eyeVisorGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#0284c7" />
              </radialGradient>

              {/* Shading/Depth layers */}
              <linearGradient id="shadowVertical" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
              </linearGradient>
              <linearGradient id="hairBlack" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2b2d30" />
                <stop offset="100%" stopColor="#090a0c" />
              </linearGradient>
              <linearGradient id="hairBrown" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6f4e37" />
                <stop offset="100%" stopColor="#2d1c10" />
              </linearGradient>
            </defs>

            {/* ========================================================= */}
            {/* 1. HERO CAPE (Superman & Batman background cape mesh) */}
            {/* ========================================================= */}
            {superhero === "superman" && (
              <motion.path
                d="M 110 210 Q 50 230, 30 390 L 290 390 Q 270 230, 210 210 Z"
                fill="#b91c1c"
                stroke="#7f1d1d"
                strokeWidth="2"
                animate={{ scaleX: [1, 1.03, 1], rotate: [-1, 1, -1] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                style={{ transformOrigin: "160px 200px" }}
              />
            )}
            {superhero === "batman" && (
              <motion.path
                d="M 110 215 Q 45 240, 25 390 L 295 390 Q 275 240, 210 215 Z"
                fill="#111827"
                stroke="#030712"
                strokeWidth="2"
                animate={{ scaleX: [1, 1.02, 1], rotate: [-0.8, 0.8, -0.8] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                style={{ transformOrigin: "160px 200px" }}
              />
            )}

            {/* ========================================================= */}
            {/* 2. CORE TORSO & CHESTPLATES (Menacing, Heroic, Chiseled) */}
            {/* ========================================================= */}
            <g id="torso-group">
              {superhero === "superman" && (
                <g>
                  {/* Majestic muscular chest - Athletic slim V-taper */}
                  <path d="M 115 210 L 205 210 C 210 260, 200 320, 188 390 L 132 390 C 120 320, 110 260, 115 210 Z" fill="url(#suitBlueSuperman)" stroke="#1d4ed8" strokeWidth="2.5" />
                  
                  {/* Muscle anatomy contours (Pecs & Abs shading lines) */}
                  <path d="M 160 210 L 160 390" stroke="#1e3a8a" strokeWidth="2" opacity="0.4" fill="none" />
                  <path d="M 125 255 C 138 265, 182 265, 195 255" stroke="#1e3a8a" strokeWidth="2" opacity="0.3" fill="none" />
                  <path d="M 135 305 C 145 310, 175 310, 185 305" stroke="#1e3a8a" strokeWidth="1.5" opacity="0.3" fill="none" />
                  <path d="M 137 340 C 145 345, 175 345, 183 340" stroke="#1e3a8a" strokeWidth="1.5" opacity="0.3" fill="none" />

                  {/* High-Fidelity Raised 'S' Emblem */}
                  <g transform="translate(122, 222) scale(1.15)">
                    {/* Shadow layer behind diamond */}
                    <path d="M 27 2 L 53 17 L 43 47 L 27 57 L 11 47 L 1 17 Z" fill="#7f1d1d" opacity="0.4" />
                    {/* Golden/Yellow Base Plate */}
                    <path d="M 26 0 L 52 15 L 42 45 L 26 55 L 10 45 L 0 15 Z" fill="url(#suitGoldIronman)" stroke="#b45309" strokeWidth="1.5" />
                    {/* Bold crimson 'S' */}
                    <path d="M 14 18 C 14 13, 27 9, 38 14 C 40 16, 32 20, 27 23 C 18 27, 15 30, 19 38 C 22 43, 38 43, 42 36 L 36 34 C 34 38, 24 39, 23 35 C 22 32, 30 29, 35 26 C 43 22, 45 16, 38 10 C 30 4, 14 8, 13 14 Z" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="0.8" />
                  </g>
                </g>
              )}

              {superhero === "spiderman" && (
                <g>
                  {/* Muscular webbed chest - Athletic slim V-taper */}
                  <path d="M 115 210 L 205 210 C 210 260, 200 320, 188 390 L 132 390 C 120 320, 110 260, 115 210 Z" fill="url(#suitBlueSpiderman)" stroke="#0f172a" strokeWidth="2.5" />
                  {/* Red chest-vest centerpiece - Sleek and slim */}
                  <path d="M 138 210 L 182 210 C 185 260, 178 320, 170 390 L 150 390 C 142 320, 135 260, 138 210 Z" fill="url(#suitRedSpiderman)" />

                  {/* Organic, beautifully curved Webbing on Red vest */}
                  <path d="M 138 210 Q 160 225, 182 210" stroke="#0f172a" strokeWidth="1" opacity="0.4" fill="none" />
                  <path d="M 135 245 Q 160 262, 185 245" stroke="#0f172a" strokeWidth="1" opacity="0.4" fill="none" />
                  <path d="M 133 285 Q 160 305, 187 285" stroke="#0f172a" strokeWidth="1" opacity="0.4" fill="none" />
                  <path d="M 131 330 Q 160 350, 189 330" stroke="#0f172a" strokeWidth="1" opacity="0.4" fill="none" />
                  
                  {/* Vertical spider web rays radiating from core */}
                  <path d="M 160 210 L 160 390" stroke="#0f172a" strokeWidth="1" opacity="0.35" fill="none" />
                  <path d="M 148 210 Q 152 290, 144 390" stroke="#0f172a" strokeWidth="1" opacity="0.35" fill="none" />
                  <path d="M 172 210 Q 168 290, 176 390" stroke="#0f172a" strokeWidth="1" opacity="0.35" fill="none" />

                  {/* Bold Premium Spider Emblem */}
                  <g transform="translate(148, 245) scale(1.1)">
                    <ellipse cx="11" cy="18" rx="3" ry="6.5" fill="#111827" />
                    <circle cx="11" cy="9" r="2.2" fill="#111827" />
                    {/* Upper legs pinching up */}
                    <path d="M 11 14 Q 2 11, 0 5 M 11 14 Q 20 11, 22 5" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M 11 16 Q 1 15, -1 10 M 11 16 Q 21 15, 23 10" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    {/* Lower legs reaching down */}
                    <path d="M 11 19 Q -1 21, -3 27 M 11 19 Q 23 21, 25 27" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M 11 21 Q 1 25, -1 31 M 11 21 Q 21 25, 23 31" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </g>
                </g>
              )}

              {superhero === "ironman" && (
                <g>
                  {/* Heavy-metal Iron Man Red chassis - Athletic slim V-taper */}
                  <path d="M 115 210 L 205 210 C 210 260, 200 320, 188 390 L 132 390 C 120 320, 110 260, 115 210 Z" fill="url(#suitRedIronman)" stroke="#7f1d1d" strokeWidth="2.5" />
                  
                  {/* Gold shoulder joints & flank armor plates */}
                  <path d="M 115 210 L 125 210 L 121 270 L 112 260 Z" fill="url(#suitGoldIronman)" stroke="#713f12" strokeWidth="1" />
                  <path d="M 205 210 L 195 210 L 199 270 L 208 260 Z" fill="url(#suitGoldIronman)" stroke="#713f12" strokeWidth="1" />

                  {/* Golden rib-cage vents */}
                  <path d="M 116 280 L 124 280 L 121 340 L 114 330 Z" fill="url(#suitGoldIronman)" opacity="0.9" />
                  <path d="M 204 280 L 196 280 L 199 340 L 206 330 Z" fill="url(#suitGoldIronman)" opacity="0.9" />

                  {/* Angular Chest panel lines */}
                  <path d="M 138 210 L 160 245 L 182 210" stroke="url(#suitGoldIronman)" strokeWidth="3.5" strokeLinejoin="round" fill="none" />

                  {/* Epic 3D Arc Reactor Core */}
                  <g>
                    {/* Dark recessed housing */}
                    <circle cx="160" cy="270" r="23" fill="#020617" stroke="#334155" strokeWidth="3" />
                    {/* Outer glowing ring */}
                    <circle cx="160" cy="270" r="18" fill="url(#arcReactorCore)" />
                    {/* Inner power ring with telemetry slits */}
                    <circle cx="160" cy="270" r="11" fill="#ffffff" />
                    {/* Crosshair target designators inside core */}
                    <line x1="160" y1="251" x2="160" y2="289" stroke="#22d3ee" strokeWidth="1.2" opacity="0.7" />
                    <line x1="141" y1="270" x2="179" y2="270" stroke="#22d3ee" strokeWidth="1.2" opacity="0.7" />
                  </g>
                </g>
              )}

              {superhero === "batman" && (
                <g>
                  {/* Textured graphite grey kevlar armor - Athletic slim V-taper */}
                  <path d="M 115 210 L 205 210 C 210 260, 200 320, 188 390 L 132 390 C 120 320, 110 260, 115 210 Z" fill="url(#suitGreyBatman)" stroke="#111827" strokeWidth="3" />
                  
                  {/* Heavy armored plates lines & shadow crevices */}
                  <path d="M 117 240 L 140 280 L 135 390" stroke="#0f172a" strokeWidth="2.5" fill="none" opacity="0.7" />
                  <path d="M 203 240 L 180 280 L 185 390" stroke="#0f172a" strokeWidth="2.5" fill="none" opacity="0.7" />

                  {/* Muscular chest cleavage split */}
                  <line x1="160" y1="210" x2="160" y2="390" stroke="#0f172a" strokeWidth="2" opacity="0.5" />

                  {/* Sleek carbon-fiber shoulder caps */}
                  <path d="M 115 210 C 123 210, 127 220, 127 230 L 119 240 Z" fill="url(#suitBlackBatman)" />
                  <path d="M 205 210 C 197 210, 193 220, 193 230 L 201 240 Z" fill="url(#suitBlackBatman)" />

                  {/* Menacing Obsidian Bat Emblem */}
                  <g transform="translate(118, 222) scale(1.15)">
                    {/* Subtle outer drop-shadow glow */}
                    <path
                      d="M 10 15 C 20 18, 30 18, 36 2 C 37 10, 42 12, 43 4 C 44 12, 49 10, 50 2 C 56 18, 66 18, 76 15 C 66 22, 54 22, 43 33 C 32 22, 20 22, 10 15 Z"
                      fill="#111827"
                      stroke="#030712"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M 11 16 C 20 19, 30 19, 36 3 C 37 11, 42 13, 43 5 C 44 13, 49 11, 50 3 C 56 19, 66 19, 75 16 C 65 23, 54 23, 43 34 C 32 23, 20 23, 11 16 Z"
                      fill="#030712"
                    />
                  </g>
                </g>
              )}
            </g>

            {/* ========================================================= */}
            {/* 3. ARMS / SHOULDER JOINTS (Dynamic speaking gesture for right arm) */}
            {/* ========================================================= */}
            <g id="arms-group">
              {/* Left Arm (Relaxed but powerful and athletic) */}
              <g id="left-arm">
                {superhero === "superman" && (
                  <path d="M 110 210 C 85 250, 80 320, 110 390 L 128 390 C 105 320, 105 250, 125 210 Z" fill="url(#suitBlueSuperman)" opacity="0.9" />
                )}
                {superhero === "spiderman" && (
                  <g>
                    {/* Animated web-shooting pose! 🤟 */}
                    <motion.path 
                      d="M 110 210 C 75 240, 70 280, 55 310 L 70 325 C 85 295, 95 250, 125 210 Z" 
                      fill="url(#suitRedSpiderman)"
                      animate={isSpeaking ? { rotate: [-1.5, 3.5, -1.5], x: [-0.5, 1.5, -0.5] } : {}}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                    {/* Raised web patterns on arm */}
                    <path d="M 90 225 Q 80 250, 65 290" stroke="rgba(0,0,0,0.2)" strokeWidth="1" fill="none" />
                    <motion.g
                      animate={isSpeaking ? { scale: [1, 1.04, 1] } : {}}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    >
                      <circle cx="55" cy="315" r="6.5" fill="url(#suitRedSpiderman)" />
                      {/* Thwip web shooter fingers */}
                      <line x1="55" y1="315" x2="45" y2="325" stroke="url(#suitRedSpiderman)" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="52" y1="315" x2="43" y2="330" stroke="url(#suitRedSpiderman)" strokeWidth="3" strokeLinecap="round" />
                      <line x1="58" y1="318" x2="47" y2="310" stroke="url(#suitRedSpiderman)" strokeWidth="2.5" strokeLinecap="round" />
                    </motion.g>
                  </g>
                )}
                {superhero === "ironman" && (
                  <g>
                    <path d="M 110 210 C 90 245, 85 295, 105 375 L 120 375 C 110 315, 110 265, 125 210 Z" fill="url(#suitRedIronman)" stroke="#7f1d1d" strokeWidth="1" />
                    <path d="M 95 210 C 95 200, 115 200, 115 215 Z" fill="url(#suitGoldIronman)" />
                    {/* Metal plating joints */}
                    <path d="M 90 300 Q 100 305, 110 300" stroke="#7f1d1d" strokeWidth="1.5" fill="none" />
                  </g>
                )}
                {superhero === "batman" && (
                  <path d="M 110 215 C 90 250, 85 310, 100 380 L 118 380 C 111 330, 111 270, 125 215 Z" fill="url(#suitGreyBatman)" />
                )}
              </g>

              {/* Right Arm (Dynamic hand repulsor/gesture that moves when speaking) */}
              <g id="right-arm">
                {superhero === "superman" && (
                  <path d="M 210 210 C 235 250, 240 320, 210 390 L 192 390 C 215 320, 215 250, 195 210 Z" fill="url(#suitBlueSuperman)" opacity="0.9" />
                )}
                {superhero === "spiderman" && (
                  <path d="M 210 210 C 240 240, 245 290, 235 355 L 220 355 C 230 300, 225 250, 195 210 Z" fill="url(#suitRedSpiderman)" />
                )}
                {superhero === "ironman" && (
                  <g>
                    {/* Smooth interactive repulsor lift gesture */}
                    <motion.g
                      animate={isSpeaking ? { rotate: [0, -8, 0], y: [0, -5, 0] } : {}}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                      style={{ transformOrigin: "210px 210px" }}
                    >
                      {/* Upper arm */}
                      <path d="M 210 210 C 230 225, 250 245, 260 280 L 245 290 C 235 260, 220 240, 200 210 Z" fill="url(#suitRedIronman)" stroke="#7f1d1d" strokeWidth="1" />
                      {/* Angled mechanical forearm */}
                      <path d="M 245 290 L 268 225 L 283 233 L 260 297 Z" fill="url(#suitRedIronman)" stroke="#7f1d1d" strokeWidth="1" />
                      {/* Gold glove */}
                      <path d="M 263 230 C 263 220, 288 220, 288 230 L 278 240 Z" fill="url(#suitGoldIronman)" />
                      
                      {/* Detailed fingers extended */}
                      <line x1="265" y1="223" x2="263" y2="210" stroke="url(#suitGoldIronman)" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="271" y1="220" x2="271" y2="205" stroke="url(#suitGoldIronman)" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="278" y1="220" x2="279" y2="207" stroke="url(#suitGoldIronman)" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="284" y1="223" x2="287" y2="211" stroke="url(#suitGoldIronman)" strokeWidth="3" strokeLinecap="round" />
                      
                      {/* Epic pulsing repulsor flare */}
                      <motion.circle 
                        cx="275" cy="229" 
                        animate={isSpeaking ? { r: [2.5, 6, 2.5], opacity: [0.5, 1, 0.5] } : { r: 3 }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        fill="#ffffff" stroke="#22d3ee" strokeWidth="2" 
                      />
                    </motion.g>
                  </g>
                )}
                {superhero === "batman" && (
                  <path d="M 210 215 C 230 250, 235 310, 230 380 L 212 380 C 219 330, 216 270, 198 215 Z" fill="url(#suitGreyBatman)" />
                )}
              </g>
            </g>

            {/* ========================================================= */}
            {/* 4. ATHLETIC NECK AND THROAT */}
            {/* ========================================================= */}
            <g id="neck-group">
              {superhero === "superman" && (
                <polygon points="138,155 182,155 178,215 142,215" fill="url(#skinSuperman)" stroke="#c38a5a" strokeWidth="0.5" />
              )}
              {superhero === "spiderman" && (
                isMasked ? (
                  <polygon points="138,155 182,155 178,215 142,215" fill="url(#suitRedSpiderman)" stroke="#7f1d1d" strokeWidth="0.5" />
                ) : (
                  <polygon points="138,155 182,155 178,215 142,215" fill="url(#skinSpiderman)" stroke="#b58253" strokeWidth="0.5" />
                )
              )}
              {superhero === "ironman" && (
                isMasked ? (
                  <g>
                    <polygon points="138,155 182,155 178,215 142,215" fill="url(#suitRedIronman)" />
                    {/* Metal armor rib rings on neck */}
                    <line x1="140" y1="170" x2="180" y2="170" stroke="url(#suitGoldIronman)" strokeWidth="3" />
                    <line x1="140" y1="190" x2="180" y2="190" stroke="url(#suitGoldIronman)" strokeWidth="3" />
                  </g>
                ) : (
                  <g>
                    <polygon points="138,155 182,155 178,215 142,215" fill="url(#skinIronman)" stroke="#b0793e" strokeWidth="0.5" />
                    {/* Tony Stark's premium black collar crewneck peek */}
                    <path d="M 140 200 Q 160 212, 180 200 L 178 215 L 142 215 Z" fill="#0f172a" />
                  </g>
                )
              )}
              {superhero === "batman" && (
                /* Thick armored military cowl neck collar */
                <polygon points="138,155 182,155 178,215 142,215" fill="#1e2937" stroke="#0f172a" strokeWidth="1.5" />
              )}
            </g>

            {/* ========================================================= */}
            {/* 5. CHARACTER HEAD & FACE SYSTEM (High-Detail Vector Art) */}
            {/* ========================================================= */}
            <motion.g
              animate={{ rotate: headTurn, y: headTilt }}
              transition={{ type: "spring", damping: 12, stiffness: 90 }}
              style={{ transformOrigin: "160px 165px" }}
            >
              {/* Ears (Visible when unmasked) */}
              {(!isMasked || superhero === "superman") && (
                <g id="ears">
                  <path d="M 111,118 Q 106,120 106,128 T 112,136" fill={superhero === "ironman" ? "url(#skinIronman)" : superhero === "spiderman" ? "url(#skinSpiderman)" : "url(#skinSuperman)"} />
                  <path d="M 209,118 Q 214,120 214,128 T 208,136" fill={superhero === "ironman" ? "url(#skinIronman)" : superhero === "spiderman" ? "url(#skinSpiderman)" : "url(#skinSuperman)"} />
                </g>
              )}

              {/* ======================= SUPERMAN (CLARK KENT) ======================= */}
              {superhero === "superman" && (
                <g id="superman-head-render">
                  {/* Chiseled jawline egg skull contour */}
                  <path d="M 112,110 C 112,80, 208,80, 208,110 C 208,142, 188,168, 160,172 C 132,168, 112,142, 112,110 Z" fill="url(#skinSuperman)" stroke="#c38a5a" strokeWidth="1" />

                  {/* Heroic Blue Eyes */}
                  <g id="clark-eyes">
                    {/* Left Eye */}
                    <ellipse cx="136" cy="116" rx="7.5" ry="4" fill="#ffffff" stroke="#a16207" strokeWidth="0.5" />
                    <circle cx="136" cy="116" r="3.2" fill="#1d4ed8" />
                    <circle cx="138" cy="114" r="1.2" fill="#ffffff" />
                    {/* Serious determined brow */}
                    <path d="M 127 108 Q 137 104, 145 108" stroke="#090a0c" strokeWidth="2.8" strokeLinecap="round" fill="none" />

                    {/* Right Eye */}
                    <ellipse cx="184" cy="116" rx="7.5" ry="4" fill="#ffffff" stroke="#a16207" strokeWidth="0.5" />
                    <circle cx="184" cy="116" r="3.2" fill="#1d4ed8" />
                    <circle cx="186" cy="114" r="1.2" fill="#ffffff" />
                    {/* Brow */}
                    <path d="M 175 108 Q 183 104, 193 108" stroke="#090a0c" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  </g>

                  {/* Superman Hair with Spit-Curl */}
                  <g id="superman-hair">
                    <path d="M 110,110 C 105,80, 215,80, 210,110 C 215,92, 202,90, 198,92 C 180,82, 138,82, 122,92 C 118,90, 105,92, 110,110 Z" fill="url(#hairBlack)" />
                    {/* S spit-curl */}
                    <path d="M 152 78 Q 158 84, 161 95 Q 158 98, 155 93 Q 154 86, 150 82 Z" fill="url(#hairBlack)" />
                  </g>

                  {/* Real-looking Nose with highlights */}
                  <path d="M 160 114 L 160 134 L 155 134" stroke="#a86e40" strokeWidth="1.8" strokeLinecap="round" fill="none" />

                  {/* High fidelity lip sync mouth */}
                  <g id="superman-mouth">
                    {isSpeaking ? (
                      <motion.ellipse
                        cx="160" cy="151"
                        rx="7.5" ry={mouthYScale}
                        fill="#7f1d1d" stroke="#5c0606" strokeWidth="1.5"
                      />
                    ) : (
                      /* Confident slight smirk lip line */
                      <path d="M 148 151 Q 160 157, 172 151" stroke="#991b1b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    )}
                  </g>

                  {/* Future Kryptonian Hologram visor overlay (If Masked) */}
                  {isMasked && (
                    <g id="krypton-visor" className="animate-fade-in">
                      {/* Semitransparent sweeping tech shield overlay */}
                      <path d="M 110,105 C 110,75, 210,75, 210,105 C 210,135, 190,158, 160,162 C 130,158, 110,135, 110,105 Z" fill="rgba(15, 23, 42, 0.9)" stroke="#0ea5e9" strokeWidth="2.5" />
                      {/* Web of digital coordinates, telemetry, hexagon matrices */}
                      <path d="M 125 105 L 195 105" stroke="#38bdf8" strokeWidth="0.8" opacity="0.3" strokeDasharray="3,3" />
                      <circle cx="160" cy="115" r="22" fill="url(#kryptonShieldGlow)" />
                      {/* Glowing scanner eye slits */}
                      <ellipse cx="136" cy="116" rx="10" ry="3.5" fill="url(#eyeVisorGlow)" className="animate-pulse" />
                      <ellipse cx="184" cy="116" rx="10" ry="3.5" fill="url(#eyeVisorGlow)" className="animate-pulse" />
                    </g>
                  )}
                </g>
              )}

              {/* ======================= SPIDER-MAN (TOBEY MAGUIRE) ======================= */}
              {superhero === "spiderman" && (
                <g id="spiderman-head-render">
                  {/* Peter Parker athletic jaw contour */}
                  <path d="M 112,110 C 112,80, 208,80, 208,110 C 208,142, 188,168, 160,172 C 132,168, 112,142, 112,110 Z" fill="url(#skinSpiderman)" stroke="#b07c52" strokeWidth="1" />

                  <g id="peter-details">
                    {/* Gentler, friendly blue-gray eyes */}
                    <ellipse cx="136" cy="116" rx="6.5" ry="3.5" fill="#ffffff" stroke="#713f12" strokeWidth="0.5" />
                    <circle cx="136" cy="116" r="2.8" fill="#3b82f6" />
                    <circle cx="138" cy="114" r="0.8" fill="#ffffff" />
                    {/* Natural brow */}
                    <path d="M 128 109 Q 136 106, 143 110" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />

                    <ellipse cx="184" cy="116" rx="6.5" ry="3.5" fill="#ffffff" stroke="#713f12" strokeWidth="0.5" />
                    <circle cx="184" cy="116" r="2.8" fill="#3b82f6" />
                    <circle cx="186" cy="114" r="0.8" fill="#ffffff" />
                    {/* Natural brow */}
                    <path d="M 177 110 Q 184 106, 192 109" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />

                    {/* Friendly layered wavy brown hair */}
                    <path d="M 109,105 C 103,75, 217,75, 211,105 C 215,90, 203,88, 199,90 C 180,78, 140,78, 121,90 C 117,88, 105,90, 109,105 Z" fill="url(#hairBrown)" />

                    {/* Shaded nose bridge */}
                    <path d="M 160 114 L 160 134 L 156 134" stroke="#a36e43" strokeWidth="1.8" strokeLinecap="round" fill="none" />

                    {/* Peter Parker warm smile lip-sync */}
                    <g id="peter-mouth">
                      {isSpeaking ? (
                        <motion.ellipse
                          cx="160" cy="151"
                          rx="7" ry={mouthYScale}
                          fill="#7f1d1d" stroke="#5c0606" strokeWidth="1.2"
                        />
                      ) : (
                        <path d="M 149 150 Q 160 156, 171 150" stroke="#991b1b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                      )}
                    </g>
                  </g>

                  {/* Iconic High-Contrast Spider-Man Mask Overlay (If Masked) */}
                  {isMasked && (
                    <g id="spiderman-mask" className="animate-fade-in">
                      {/* Crimson fabric egg shell mask */}
                      <path d="M 110,110 C 110,75, 210,75, 210,110 C 210,142, 190,168, 160,172 C 130,168, 110,142, 110,110 Z" fill="url(#suitRedSpiderman)" stroke="#7f1d1d" strokeWidth="2" />
                      
                      {/* Web grid lines mapped dynamically to contoured 3D face */}
                      <path d="M 160 75 L 160 172 M 110 120 L 210 120 M 121 90 L 199 158 M 121 158 L 199 90" stroke="rgba(0,0,0,0.35)" strokeWidth="1" fill="none" />
                      <path d="M 127 120 Q 160 148, 193 120 M 136 120 Q 160 135, 184 120 M 143 120 Q 160 162, 177 120" stroke="rgba(0,0,0,0.35)" strokeWidth="1" fill="none" />
                      <path d="M 127 120 Q 160 92, 193 120 M 136 120 Q 160 105, 184 120 M 143 120 Q 160 78, 177 120" stroke="rgba(0,0,0,0.35)" strokeWidth="1" fill="none" />

                      {/* Tobey Maguire's Signature Curved Silver Webbed Lenses */}
                      <g>
                        {/* Shadow bezel */}
                        <path d="M 122 120 L 145 111 L 149 133 L 126 138 Z" fill="#0f172a" opacity="0.5" />
                        <path d="M 198 120 L 175 111 L 171 133 L 194 138 Z" fill="#0f172a" opacity="0.5" />

                        {/* Left glossy silver reflective lens */}
                        <path d="M 123 118 L 146 110 L 148 132 L 125 136 Z" fill="#f8fafc" stroke="#111827" strokeWidth="3" strokeLinejoin="round" />
                        {/* Right glossy lens */}
                        <path d="M 197 118 L 174 110 L 172 132 L 195 136 Z" fill="#f8fafc" stroke="#111827" strokeWidth="3" strokeLinejoin="round" />
                        
                        {/* Lens glares */}
                        <ellipse cx="132" cy="116" rx="2" ry="1" fill="#ffffff" opacity="0.8" />
                        <ellipse cx="188" cy="116" rx="2" ry="1" fill="#ffffff" opacity="0.8" />
                      </g>
                    </g>
                  )}
                </g>
              )}

              {/* ======================= IRON MAN (ROBERT DOWNEY JR.) ======================= */}
              {superhero === "ironman" && (
                <g id="ironman-head-render">
                  {/* Tony Stark skull profile */}
                  <path d="M 112,110 C 112,80, 208,80, 208,110 C 208,142, 188,168, 160,172 C 132,168, 112,142, 112,110 Z" fill="url(#skinIronman)" stroke="#925c34" strokeWidth="1" />

                  {/* Stark's Witty Facial Detail Suite */}
                  <g id="tony-details">
                    {/* Sharp charisma brown eyes */}
                    <ellipse cx="136" cy="116" rx="6.5" ry="3.5" fill="#ffffff" stroke="#713f12" strokeWidth="0.5" />
                    <circle cx="136" cy="116" r="2.8" fill="#78350f" />
                    <circle cx="138" cy="114" r="0.8" fill="#ffffff" />
                    {/* Tony's signature cocked eyebrows */}
                    <path d="M 127 107 Q 135 104, 143 109" stroke="#110500" strokeWidth="2.8" strokeLinecap="round" fill="none" />

                    <ellipse cx="184" cy="116" rx="6.5" ry="3.5" fill="#ffffff" stroke="#713f12" strokeWidth="0.5" />
                    <circle cx="184" cy="116" r="2.8" fill="#78350f" />
                    <circle cx="186" cy="114" r="0.8" fill="#ffffff" />
                    {/* Left eyebrow raised slightly higher for attitude */}
                    <path d="M 176 110 Q 184 104, 193 107" stroke="#110500" strokeWidth="2.8" strokeLinecap="round" fill="none" />

                    {/* Premium Styled Spiky Stark Hair */}
                    <path d="M 110,105 C 105,75, 215,75, 210,105 C 215,92, 203,90, 199,92 C 185,72, 135,72, 121,92 C 117,90, 105,92, 110,105 Z" fill="url(#hairBlack)" />
                    {/* Spiky organic hair strands */}
                    <path d="M 142 74 L 145 66 L 151 73" fill="url(#hairBlack)" />
                    <path d="M 158 71 L 161 62 L 168 70" fill="url(#hairBlack)" />
                    <path d="M 174 73 L 177 65 L 183 74" fill="url(#hairBlack)" />

                    {/* Chiseled nose with soft shade bridge */}
                    <path d="M 160 114 L 160 134 L 156 134" stroke="#925c34" strokeWidth="1.8" strokeLinecap="round" fill="none" />

                    {/* Highly detailed Goatee & Razor Mustache */}
                    <g id="goatee-suite">
                      {/* Symmetrical sharp mustache */}
                      <path d="M 144,142 Q 160,135 176,142 Q 160,147 144,142 Z" fill="#110500" stroke="#050505" strokeWidth="0.5" />
                      {/* Premium vertical chin anchor */}
                      <path d="M 153,149 L 167,149 L 170,167 L 150,167 Z" fill="#110500" stroke="#050505" strokeWidth="0.5" />
                      {/* Side connector lines */}
                      <path d="M 145,142 Q 151,151 152,156" stroke="#110500" strokeWidth="1.8" fill="none" />
                      <path d="M 175,142 Q 169,151 168,156" stroke="#110500" strokeWidth="1.8" fill="none" />
                    </g>

                    {/* Tony smirk lip-sync mouth */}
                    <g id="tony-mouth">
                      {isSpeaking ? (
                        <motion.ellipse
                          cx="160" cy="151"
                          rx="6" ry={mouthYScale}
                          fill="#450a0a" stroke="#7f1d1d" strokeWidth="1"
                        />
                      ) : (
                        /* Subtle smug smirk */
                        <path d="M 151 151 Q 160 155, 169 150" stroke="#7f1d1d" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                      )}
                    </g>
                  </g>

                  {/* Golden & Red Mechanical Armor Helmet Overlay (If Masked) */}
                  {isMasked && (
                    <g id="ironman-mask" className="animate-fade-in">
                      {/* Solid red heavy helmet chassis */}
                      <path d="M 110,110 C 110,75, 210,75, 210,110 C 210,142, 190,168, 160,172 C 130,168, 110,142, 110,110 Z" fill="url(#suitRedIronman)" stroke="#7f1d1d" strokeWidth="2" />
                      
                      {/* Angled metallic gold heavy Faceplate */}
                      <path d="M 121,80 L 199,80 C 209,92, 207,130, 197,152 L 175,168 L 145,168 L 123,152 C 113,130, 111,92, 121,80 Z" fill="url(#suitGoldIronman)" stroke="#b45309" strokeWidth="1.5" />
                      {/* Panel separation cuts */}
                      <path d="M 124,96 L 196,96 M 138,80 L 143,96 M 182,80 L 177,96 M 142,136 L 178,136" stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" fill="none" />

                      {/* Glowing cyan eye slits (Pulsing high-energy) */}
                      <g>
                        <rect x="130" y="110" width="18" height="4.5" rx="1.2" fill="#ffffff" stroke="#22d3ee" strokeWidth="1.5" className="animate-pulse" />
                        <rect x="172" y="110" width="18" height="4.5" rx="1.2" fill="#ffffff" stroke="#22d3ee" strokeWidth="1.5" className="animate-pulse" />
                      </g>
                    </g>
                  )}
                </g>
              )}

              {/* ======================= BATMAN (BRUCE WAYNE) ======================= */}
              {superhero === "batman" && (
                <g id="batman-head-render">
                  {/* Heavy, strong square jaw profile */}
                  <path d="M 112,110 C 112,80, 208,80, 208,110 C 208,142, 188,168, 160,172 C 132,168, 112,142, 112,110 Z" fill="url(#skinBatman)" stroke="#926955" strokeWidth="1" />

                  {/* Bruce Wayne Intense unmasked feature suite */}
                  <g id="bruce-details">
                    {/* Cold focused gray eyes */}
                    <ellipse cx="136" cy="116" rx="6.5" ry="3.2" fill="#ffffff" stroke="#1e2937" strokeWidth="0.5" />
                    <circle cx="136" cy="116" r="2.5" fill="#4b5563" />
                    <circle cx="138" cy="114" r="0.8" fill="#ffffff" />
                    <path d="M 127 107 Q 137 103, 145 107" stroke="#090a0c" strokeWidth="3" strokeLinecap="round" fill="none" />

                    <ellipse cx="184" cy="116" rx="6.5" ry="3.2" fill="#ffffff" stroke="#1e2937" strokeWidth="0.5" />
                    <circle cx="184" cy="116" r="2.5" fill="#4b5563" />
                    <circle cx="186" cy="114" r="0.8" fill="#ffffff" />
                    <path d="M 175 107 Q 183 103, 193 107" stroke="#090a0c" strokeWidth="3" strokeLinecap="round" fill="none" />

                    {/* Comb back executive dark hair */}
                    <path d="M 110,105 C 105,75, 215,75, 210,105 C 215,92, 203,90, 199,92 C 182,75, 138,75, 121,92 C 117,90, 105,92, 110,105 Z" fill="url(#hairBlack)" />

                    {/* Sharp bridge nose */}
                    <path d="M 160 114 L 160 134 L 156 134" stroke="#926955" strokeWidth="1.8" strokeLinecap="round" fill="none" />

                    {/* Stoic serious lips */}
                    <g id="bruce-mouth">
                      {isSpeaking ? (
                        <motion.ellipse
                          cx="160" cy="151"
                          rx="7" ry={mouthYScale}
                          fill="#450a0a" stroke="#5c0606" strokeWidth="1.2"
                        />
                      ) : (
                        <line x1="151" y1="151" x2="169" y2="151" stroke="#5c0606" strokeWidth="2.5" strokeLinecap="round" />
                      )}
                    </g>
                  </g>

                  {/* Armored Obsidian Cowl Mask Overlay (If Masked) */}
                  {/* Note: The Cowl covers everything EXCEPT Bruce's chiseled jaw */}
                  {isMasked && (
                    <g id="batman-cowl" className="animate-fade-in">
                      {/* Pointy ears extending high */}
                      <path d="M 109,105 L 105,50 L 129,82 Z" fill="#111827" stroke="#030712" strokeWidth="1" />
                      <path d="M 211,105 L 215,50 L 191,82 Z" fill="#111827" stroke="#030712" strokeWidth="1" />

                      {/* Heavy armor skull cowl plate */}
                      <path d="M 109,105 C 109,75, 211,75, 211,105 C 217,135, 203,142, 195,145 L 175,145 L 168,131 L 152,131 L 145,145 L 125,145 C 117,142, 103,135, 109,105 Z" fill="#111827" stroke="#030712" strokeWidth="2" />
                      
                      {/* Angular nose shadow guard */}
                      <path d="M 147 106 L 160 128 L 173 106 Z" fill="#1e2937" />

                      {/* Pure glowing white slits (Menacing vigilante eyes) */}
                      <g>
                        <path d="M 127 111 L 144 107 L 142 116 L 129 118 Z" fill="#ffffff" stroke="#1f2937" strokeWidth="1.5" />
                        <path d="M 193 111 L 176 107 L 178 116 L 191 118 Z" fill="#ffffff" stroke="#1f2937" strokeWidth="1.5" />
                        
                        {/* Soft white lenses inner glow */}
                        <circle cx="136" cy="112" r="1.5" fill="#38bdf8" opacity="0.6" />
                        <circle cx="184" cy="112" r="1.5" fill="#38bdf8" opacity="0.6" />
                      </g>
                    </g>
                  )}
                </g>
              )}
            </motion.g>
          </svg>
        </motion.div>
      </div>

      {/* 4. CHAT BUBBLE HUD SUMMARY LOG */}
      <div className="w-full p-3.5 bg-black/60 border-t border-white/5 backdrop-blur-md z-10 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-1 text-[9px] text-gray-500 font-mono">
          <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
          <span>Interactive Cinematic Studio Active</span>
        </div>
        <p className="text-[10px] text-gray-400 leading-relaxed text-center">
          💡 <span className="text-white font-semibold">Pro-Tip:</span> Click <span className="text-amber-400 font-semibold">"UNMASK SUIT"</span> above or say <span className="text-indigo-300 font-semibold">"reveal face"</span> to uncover the photorealistic 3D face underneath!
        </p>
      </div>
    </div>
  );
}
