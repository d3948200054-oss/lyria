import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, VolumeX, AlertCircle, RefreshCw, Volume2, Sparkles, Brain, Heart, Briefcase, Zap, Terminal, ExternalLink, Settings, Send, UploadCloud, Trash2, AudioLines, Check } from "lucide-react";
import { AudioStreamer, AudioPlayer } from "../utils/audio";
import { MemoryItem, VoiceSessionState } from "../types";
import { motion, AnimatePresence } from "motion/react";
import CommandCenter from "./CommandCenter";
import VisionGesturePanel from "./VisionGesturePanel";
import { Hand, Lock as LockIcon, Unlock as UnlockIcon } from "lucide-react";
import OmSuperheroCharacter from "./OmSuperheroCharacter";
// @ts-ignore
import omCharacterImg from "../assets/images/om_character_1783095932317.jpg";

interface OmCharacterProps {
  status: string;
  personality: string;
  language: string;
  activeGesture?: "idle" | "speaking" | "nodding" | "hand gesturing";
}

function OmCharacter({ status, personality, language, activeGesture }: OmCharacterProps) {
  const isSpeaking = status === "speaking";
  const isListening = status === "listening";
  const isConnecting = status === "connecting";
  const isDisconnected = status === "disconnected" || status === "error";

  // Use activeGesture if provided, or default to status-driven modes
  const currentGesture = activeGesture || (isSpeaking ? "speaking" : "idle");

  // Head motion - completely still unless active (neck/head moves to convey direction/explain)
  const headAnimate = currentGesture === "nodding"
    ? {
        y: [0, -10, 6, -10, 6, 0],
        rotate: [0, -2, 2, -2, 2, 0],
      }
    : currentGesture === "hand gesturing"
    ? {
        rotate: [-3, 3, -3],
        y: [0, -2, 0],
      }
    : currentGesture === "speaking"
    ? {
        y: [0, -4, 2, -4, 0],
        rotate: [0, -3, 3, -1, 0],
      }
    : {
        y: 0,
        rotate: 0,
      };

  const headTransition = currentGesture !== "idle"
    ? { repeat: Infinity, duration: currentGesture === "nodding" ? 1.0 : 1.6, ease: "easeInOut" }
    : { duration: 0.5, ease: "easeInOut" };

  // Left Arm rotation from shoulder (132, 245) - completely still unless active (hands move to explain)
  const leftArmAnimate = currentGesture === "hand gesturing"
    ? {
        rotate: [-15, -60, -25, -55, -15],
      }
    : currentGesture === "speaking"
    ? {
        rotate: [-15, -40, -10, -45, -15],
      }
    : {
        rotate: -5, // normal resting pose
      };

  const leftArmTransition = currentGesture !== "idle"
    ? { repeat: Infinity, duration: currentGesture === "hand gesturing" ? 1.6 : 2.2, ease: "easeInOut" }
    : { duration: 0.5, ease: "easeInOut" };

  // Right Arm rotation from shoulder (268, 245) - completely still unless active (hands move to explain)
  const rightArmAnimate = currentGesture === "hand gesturing"
    ? {
        rotate: [15, 60, 25, 55, 15],
      }
    : currentGesture === "speaking"
    ? {
        rotate: [15, 40, 10, 45, 15],
      }
    : {
        rotate: 5, // normal resting pose
      };

  const rightArmTransition = currentGesture !== "idle"
    ? { repeat: Infinity, duration: currentGesture === "hand gesturing" ? 1.6 : 1.9, ease: "easeInOut" }
    : { duration: 0.5, ease: "easeInOut" };

  // Left Leg rotation from hip (175, 385)
  const leftLegAnimate = currentGesture !== "idle"
    ? {
        rotate: [0, -2, 2, -2, 0],
        y: [0, -1, 1, -1, 0],
      }
    : {
        rotate: 0,
        y: 0,
      };

  const leftLegTransition = currentGesture !== "idle"
    ? { repeat: Infinity, duration: 1.4, ease: "easeInOut" }
    : { duration: 0.5, ease: "easeInOut" };

  // Right Leg rotation from hip (225, 385)
  const rightLegAnimate = currentGesture !== "idle"
    ? {
        rotate: [0, 2, -2, 2, 0],
        y: [0, -1, 1, -1, 0],
      }
    : {
        rotate: 0,
        y: 0,
      };

  const rightLegTransition = currentGesture !== "idle"
    ? { repeat: Infinity, duration: 1.4, ease: "easeInOut" }
    : { duration: 0.5, ease: "easeInOut" };

  // Blink animation for eyes - blink only when speaking/active
  const eyeBlinkAnimate = currentGesture !== "idle"
    ? {
        scaleY: [1, 1, 0.05, 1, 1, 1, 1],
      }
    : {
        scaleY: 1,
      };
      
  const eyeBlinkTransition = currentGesture !== "idle"
    ? {
        repeat: Infinity,
        duration: 3.8,
        times: [0, 0.75, 0.78, 0.82, 0.85, 0.9, 1],
        ease: "easeInOut"
      }
    : { duration: 0.5 };

  // Pulse animation for the glowing core - pulse only when speaking/active
  const coreScale = currentGesture !== "idle"
    ? [1, 1.24, 1]
    : 1;

  const coreTransition = currentGesture !== "idle"
    ? {
        repeat: Infinity,
        duration: 0.9,
        ease: "easeInOut"
      }
    : { duration: 0.5, ease: "easeInOut" };

  // Theme color definitions based on active state
  const themeColor = isListening
    ? "rgba(16, 185, 129, 1)" // emerald green
    : isSpeaking
    ? "rgba(99, 102, 241, 1)" // indigo blue
    : isConnecting
    ? "rgba(168, 85, 247, 1)" // purple
    : "rgba(245, 158, 11, 0.7)"; // amber

  const themeGlow = isListening
    ? "rgba(16, 185, 129, 0.4)"
    : isSpeaking
    ? "rgba(99, 102, 241, 0.4)"
    : isConnecting
    ? "rgba(168, 85, 247, 0.4)"
    : "rgba(245, 158, 11, 0.15)";

  return (
    <div className="relative w-64 h-[440px] md:w-80 md:h-[540px] flex items-center justify-center">
      {/* Background radial soft light backing the character */}
      <div 
        className="absolute inset-0 rounded-full blur-3xl pointer-events-none transition-all duration-1000 -z-10"
        style={{
          background: `radial-gradient(circle, ${themeGlow} 0%, transparent 70%)`
        }}
      />

      <svg 
        viewBox="80 80 240 425" 
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] select-none pointer-events-none"
      >
        <defs>
          {/* Glowing visor border gradients */}
          <linearGradient id="visorBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={themeColor} stopOpacity="1" />
            <stop offset="100%" stopColor="#312e81" stopOpacity="0.5" />
          </linearGradient>

          {/* Torso body plate metal gradient */}
          <linearGradient id="torsoBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Metal plating highlights */}
          <linearGradient id="metalSilver" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Glowing core radial gradient */}
          <radialGradient id="reactorCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor={themeColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Dynamic LED eye glow */}
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor={themeColor} />
          </radialGradient>
        </defs>

        {/* --- MECHANICAL BACKPLANE WIRE OR SPINE --- */}
        <line x1="200" y1="180" x2="200" y2="360" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
        <line x1="200" y1="180" x2="200" y2="360" stroke={themeColor} strokeWidth="2" strokeOpacity="0.4" />

        {/* --- LEFT LEG --- */}
        <motion.g
          animate={leftLegAnimate}
          transition={leftLegTransition}
          style={{ transformOrigin: "175px 385px" }}
        >
          {/* Left Thigh */}
          <line x1="175" y1="385" x2="165" y2="440" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />
          <line x1="175" y1="385" x2="165" y2="440" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
          <line x1="175" y1="385" x2="165" y2="440" stroke={themeColor} strokeWidth="1.5" strokeDasharray="3,3" />

          {/* Knee joint */}
          <circle cx="165" cy="440" r="9" fill="#334155" stroke="#0f172a" strokeWidth="2" />
          <circle cx="165" cy="440" r="3" fill={themeColor} />

          {/* Left Shin */}
          <line x1="165" y1="440" x2="160" y2="485" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" />
          <line x1="165" y1="440" x2="160" y2="485" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

          {/* Left Foot */}
          <path d="M 142 495 L 172 495 L 163 483 L 154 483 Z" fill="url(#metalSilver)" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="160" cy="485" r="3.5" fill={themeColor} />
        </motion.g>

        {/* --- RIGHT LEG --- */}
        <motion.g
          animate={rightLegAnimate}
          transition={rightLegTransition}
          style={{ transformOrigin: "225px 385px" }}
        >
          {/* Right Thigh */}
          <line x1="225" y1="385" x2="235" y2="440" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />
          <line x1="225" y1="385" x2="235" y2="440" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
          <line x1="225" y1="385" x2="235" y2="440" stroke={themeColor} strokeWidth="1.5" strokeDasharray="3,3" />

          {/* Knee joint */}
          <circle cx="235" cy="440" r="9" fill="#334155" stroke="#0f172a" strokeWidth="2" />
          <circle cx="235" cy="440" r="3" fill={themeColor} />

          {/* Right Shin */}
          <line x1="235" y1="440" x2="240" y2="485" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" />
          <line x1="235" y1="440" x2="240" y2="485" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

          {/* Right Foot */}
          <path d="M 228 495 L 258 495 L 246 483 L 237 483 Z" fill="url(#metalSilver)" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="240" cy="485" r="3.5" fill={themeColor} />
        </motion.g>

        {/* --- LEFT ARM (Shoulder 132, 245) - Natural alignment --- */}
        <motion.g 
          animate={leftArmAnimate}
          transition={leftArmTransition}
          style={{ transformOrigin: "132px 245px" }}
        >
          {/* Upper Arm Bone */}
          <line x1="132" y1="245" x2="115" y2="310" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
          <line x1="132" y1="245" x2="115" y2="310" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
          
          {/* Glowing energy line */}
          <line x1="132" y1="245" x2="115" y2="310" stroke={themeColor} strokeWidth="2" strokeDasharray="4,4" />

          {/* Elbow Joint */}
          <circle cx="115" cy="310" r="11" fill="#334155" stroke="#0f172a" strokeWidth="3" />
          <circle cx="115" cy="310" r="4" fill={themeColor} />

          {/* Forearm */}
          <line x1="115" y1="310" x2="105" y2="370" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
          <line x1="115" y1="310" x2="105" y2="370" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

          {/* Left Hand Gauntlet */}
          <path d="M 97 360 L 113 360 L 117 380 L 93 380 Z" fill="url(#metalSilver)" />
          {/* Left Fingers (robotic claws) */}
          <path d="M 95 380 Q 91 396 95 400" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <path d="M 105 380 Q 105 398 107 402" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <path d="M 115 380 Q 119 396 115 400" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          
          {/* Palm glowing nodes */}
          <circle cx="105" cy="374" r="3" fill={themeColor} />
        </motion.g>

        {/* --- RIGHT ARM (Shoulder 268, 245) - Natural alignment --- */}
        <motion.g 
          animate={rightArmAnimate}
          transition={rightArmTransition}
          style={{ transformOrigin: "268px 245px" }}
        >
          {/* Upper Arm Bone */}
          <line x1="268" y1="245" x2="285" y2="310" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
          <line x1="268" y1="245" x2="285" y2="310" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
          
          {/* Glowing energy line */}
          <line x1="268" y1="245" x2="285" y2="310" stroke={themeColor} strokeWidth="2" strokeDasharray="4,4" />

          {/* Elbow Joint */}
          <circle cx="285" cy="310" r="11" fill="#334155" stroke="#0f172a" strokeWidth="3" />
          <circle cx="285" cy="310" r="4" fill={themeColor} />

          {/* Forearm */}
          <line x1="285" y1="310" x2="295" y2="370" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
          <line x1="285" y1="310" x2="295" y2="370" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

          {/* Right Hand Gauntlet */}
          <path d="M 287 360 L 303 360 L 307 380 L 283 380 Z" fill="url(#metalSilver)" />
          {/* Right Fingers (robotic claws) */}
          <path d="M 285 380 Q 281 396 285 400" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <path d="M 295 380 Q 295 398 297 402" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <path d="M 305 380 Q 309 396 305 400" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

          {/* Palm glowing nodes */}
          <circle cx="295" cy="374" r="3" fill={themeColor} />
        </motion.g>

        {/* --- MAIN TORSO / BODY (Center 200, 310) --- */}
        <g id="torso">
          {/* Collar/Neck Base */}
          <path d="M 160 215 L 240 215 L 220 238 L 180 238 Z" fill="#334155" stroke="#0f172a" strokeWidth="2" />
          
          {/* Main Chest Armor */}
          <path d="M 140 235 L 260 235 L 240 360 L 160 360 Z" fill="url(#torsoBody)" stroke="#334155" strokeWidth="3" />

          {/* Pelvis Plate / Hips */}
          <path d="M 155 358 L 245 358 L 235 385 L 165 385 Z" fill="url(#torsoBody)" stroke="#334155" strokeWidth="2" />
          <circle cx="175" cy="385" r="7" fill="#111827" />
          <circle cx="225" cy="385" r="7" fill="#111827" />
          
          {/* Futuristic Panel Cuts */}
          <path d="M 152 245 L 248 245 L 236 310 L 164 310 Z" fill="#0f172a" opacity="0.6" />
          <path d="M 156 250 L 175 250 L 170 300 L 160 300 Z" fill="url(#metalSilver)" opacity="0.3" />
          <path d="M 244 250 L 225 250 L 230 300 L 240 300 Z" fill="url(#metalSilver)" opacity="0.3" />

          {/* Shoulder Pads (Left and Right) */}
          <path d="M 115 235 C 115 220, 142 225, 147 248 C 137 258, 120 258, 115 235 Z" fill="url(#metalSilver)" stroke="#0f172a" strokeWidth="2" />
          <path d="M 285 235 C 285 220, 258 225, 253 248 C 263 258, 280 258, 285 235 Z" fill="url(#metalSilver)" stroke="#0f172a" strokeWidth="2" />
          <circle cx="132" cy="245" r="6" fill="#1e293b" />
          <circle cx="268" cy="245" r="6" fill="#1e293b" />

          {/* Central Reactor Power Core */}
          <g>
            {/* Outer Ring */}
            <circle cx="200" cy="300" r="32" fill="none" stroke="#1e293b" strokeWidth="4" />
            <circle cx="200" cy="300" r="32" fill="none" stroke={themeColor} strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="6,4" />
            
            {/* Pulsing Core Orb */}
            <motion.circle 
              cx="200" 
              cy="300" 
              animate={{ r: coreScale }}
              transition={coreTransition}
              fill="url(#reactorCore)" 
            />
            {/* Center glowing dot */}
            <circle cx="200" cy="300" r="7" fill="#ffffff" />
          </g>
        </g>

        {/* --- HEAD GROUP (Neck base 200, 210) --- */}
        <motion.g 
          animate={headAnimate}
          transition={headTransition}
          style={{ transformOrigin: "200px 210px" }}
        >
          {/* Cyber Neck Connector - Bellows/Ribbed style */}
          {/* Central flexible core */}
          <line x1="200" y1="185" x2="200" y2="215" stroke="#1e293b" strokeWidth="12" />
          <line x1="200" y1="185" x2="200" y2="215" stroke={themeColor} strokeWidth="2" strokeOpacity="0.8" strokeDasharray="3,3" />
          
          {/* Stacked bellows ribbed rings */}
          <rect x="186" y="186" width="28" height="5" rx="2.5" fill="url(#metalSilver)" stroke="#0f172a" strokeWidth="1" />
          <rect x="180" y="193" width="40" height="5.5" rx="3" fill="url(#metalSilver)" stroke="#0f172a" strokeWidth="1" />
          <rect x="183" y="200" width="34" height="6" rx="3" fill="url(#metalSilver)" stroke="#0f172a" strokeWidth="1" />
          <rect x="177" y="208" width="46" height="6.5" rx="3.2" fill="url(#metalSilver)" stroke="#0f172a" strokeWidth="1" />

          {/* Decorative Back Ear-Antennas */}
          {/* Left antenna */}
          <line x1="140" y1="140" x2="120" y2="105" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
          <circle cx="120" cy="105" r="4" fill={themeColor} />
          {/* Right antenna */}
          <line x1="260" y1="140" x2="280" y2="105" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
          <circle cx="280" cy="105" r="4" fill={themeColor} />

          {/* Main Helmet / Face Pod */}
          <rect x="135" y="95" width="130" height="95" rx="36" fill="url(#torsoBody)" stroke="#334155" strokeWidth="3" />
          <rect x="138" y="98" width="124" height="89" rx="33" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          {/* Sleek Ears */}
          <rect x="127" y="125" width="9" height="35" rx="4" fill="url(#metalSilver)" stroke="#0f172a" strokeWidth="2" />
          <rect x="264" y="125" width="9" height="35" rx="4" fill="url(#metalSilver)" stroke="#0f172a" strokeWidth="2" />
          <circle cx="131" cy="142" r="2.5" fill={themeColor} />
          <circle cx="269" cy="142" r="2.5" fill={themeColor} />

          {/* Glowing visor shield */}
          <rect x="150" y="110" width="100" height="65" rx="20" fill="#090a0f" stroke="url(#visorBorder)" strokeWidth="2" />
          {/* Visor internal scanlines overlay */}
          <path d="M 155 120 L 245 120 M 155 130 L 245 130 M 155 140 L 245 140 M 155 150 L 245 150 M 155 160 L 245 160" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

          {/* EYES */}
          <AnimatePresence>
            {!isDisconnected ? (
              <g id="eyes">
                {/* Left Eye */}
                <g>
                  <circle cx="182" cy="136" r="10" fill="none" stroke={themeColor} strokeWidth="1.5" opacity="0.3" />
                  <motion.ellipse 
                    cx="182" 
                    cy="136" 
                    rx="6" 
                    ry="6"
                    animate={eyeBlinkAnimate}
                    transition={eyeBlinkTransition}
                    fill="url(#eyeGlow)" 
                  />
                  <circle cx="184" cy="133" r="2" fill="#ffffff" />
                </g>

                {/* Right Eye */}
                <g>
                  <circle cx="218" cy="136" r="10" fill="none" stroke={themeColor} strokeWidth="1.5" opacity="0.3" />
                  <motion.ellipse 
                    cx="218" 
                    cy="136" 
                    rx="6" 
                    ry="6"
                    animate={eyeBlinkAnimate}
                    transition={eyeBlinkTransition}
                    fill="url(#eyeGlow)" 
                  />
                  <circle cx="220" cy="133" r="2" fill="#ffffff" />
                </g>
              </g>
            ) : (
              // Sleeping / Disconnected eyes (Flat elegant slots)
              <g id="sleep-eyes">
                <line x1="174" y1="136" x2="190" y2="136" stroke={themeColor} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                <line x1="210" y1="136" x2="226" y2="136" stroke={themeColor} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
              </g>
            )}
          </AnimatePresence>

          {/* EXPRESSIVE SPEECH MOUTH (Wave representation) */}
          <g id="mouth" transform="translate(0, 158)">
            {isSpeaking ? (
              // Interactive glowing pulsing speech lines inside head
              <g>
                <motion.line 
                  x1="180" y1="0" x2="180" y2="0"
                  animate={{ y1: [-3, 3, -3], y2: [3, -3, 3] }}
                  transition={{ repeat: Infinity, duration: 0.3, ease: "easeInOut" }}
                  stroke={themeColor} strokeWidth="3" strokeLinecap="round" 
                />
                <motion.line 
                  x1="188" y1="0" x2="188" y2="0"
                  animate={{ y1: [-8, 8, -8], y2: [8, -8, 8] }}
                  transition={{ repeat: Infinity, duration: 0.25, ease: "easeInOut" }}
                  stroke={themeColor} strokeWidth="3" strokeLinecap="round" 
                />
                <motion.line 
                  x1="196" y1="0" x2="196" y2="0"
                  animate={{ y1: [-11, 11, -11], y2: [11, -11, 11] }}
                  transition={{ repeat: Infinity, duration: 0.2, ease: "easeInOut" }}
                  stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" 
                />
                <motion.line 
                  x1="204" y1="0" x2="204" y2="0"
                  animate={{ y1: [-11, 11, -11], y2: [11, -11, 11] }}
                  transition={{ repeat: Infinity, duration: 0.22, ease: "easeInOut" }}
                  stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" 
                />
                <motion.line 
                  x1="212" y1="0" x2="212" y2="0"
                  animate={{ y1: [-8, 8, -8], y2: [8, -8, 8] }}
                  transition={{ repeat: Infinity, duration: 0.24, ease: "easeInOut" }}
                  stroke={themeColor} strokeWidth="3" strokeLinecap="round" 
                />
                <motion.line 
                  x1="220" y1="0" x2="220" y2="0"
                  animate={{ y1: [-3, 3, -3], y2: [3, -3, 3] }}
                  transition={{ repeat: Infinity, duration: 0.28, ease: "easeInOut" }}
                  stroke={themeColor} strokeWidth="3" strokeLinecap="round" 
                />
              </g>
            ) : isListening ? (
              // Soothing, idle ambient listening wave shape
              <motion.path 
                d="M 180 0 Q 190 -3, 200 0 T 220 0" 
                animate={{
                  d: [
                    "M 180 0 Q 190 -3, 200 0 T 220 0",
                    "M 180 0 Q 190 3, 200 0 T 220 0",
                    "M 180 0 Q 190 -3, 200 0 T 220 0"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                fill="none" 
                stroke={themeColor} 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                />
            ) : (
              // Silent narrow flat mouth line
              <line x1="188" y1="0" x2="212" y2="0" stroke={themeColor} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            )}
          </g>
        </motion.g>
      </svg>
    </div>
  );
}

interface VoicePanelProps {
  memories: MemoryItem[];
  onMemoryDetected: (text: string, category: MemoryItem["category"]) => void;
  isOffline?: boolean;
  isAppLocked: boolean;
  setIsAppLocked: (locked: boolean) => void;
  engineMode: "Live" | "Standard";
  setEngineMode: (mode: "Live" | "Standard") => void;
  language: "Hindi" | "English";
  setLanguage: (lang: "Hindi" | "English") => void;
  personality: "Empathetic" | "Professional" | "Energetic" | "Calm";
  setPersonality: (mood: "Empathetic" | "Professional" | "Energetic" | "Calm") => void;
  clonedVoiceActive: boolean;
  setClonedVoiceActive: (active: boolean) => void;
  clonedVoiceName: string | null;
  setClonedVoiceName: (name: string | null) => void;
  clonedVoiceFile: string | null;
  setClonedVoiceFile: (file: string | null) => void;
  isCloning: boolean;
  setIsCloning: (cloning: boolean) => void;
  onVoiceCloneUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveClonedVoice: () => void;
}

export default function VoicePanel({ 
  memories, 
  onMemoryDetected, 
  isOffline,
  isAppLocked,
  setIsAppLocked,
  engineMode,
  setEngineMode,
  language,
  setLanguage,
  personality,
  setPersonality,
  clonedVoiceActive,
  setClonedVoiceActive,
  clonedVoiceName,
  setClonedVoiceName,
  clonedVoiceFile,
  setClonedVoiceFile,
  isCloning,
  setIsCloning,
  onVoiceCloneUpload,
  onRemoveClonedVoice
}: VoicePanelProps) {
  const [status, setStatus] = useState<VoiceSessionState["status"]>("disconnected");
  const statusRef = useRef(status);
  const activeSessionIdRef = useRef(0);
  const wasWokenUpByWakeWordRef = useRef(false);

  // Superhero suit and masking states
  const [superhero, setSuperhero] = useState<"superman" | "spiderman" | "ironman" | "batman">("ironman");
  const [isMasked, setIsMasked] = useState(true);

  // Identity parser helper
  const getNextIdentityStates = (inputText: string) => {
    const lower = inputText.toLowerCase().trim();
    let nextHero = superhero;
    let nextMasked = isMasked;

    // Mask/Unmask commands
    if (
      lower.includes("reveal face") || 
      lower.includes("reveal your face") || 
      lower.includes("show face") || 
      lower.includes("show your face") || 
      lower.includes("unmask") || 
      lower.includes("remove mask") || 
      lower.includes("remove your mask") || 
      lower.includes("take off mask") || 
      lower.includes("who is behind") ||
      lower.includes("reveal identity") ||
      lower.includes("face dikhao") ||
      lower.includes("apna face") ||
      lower.includes("shakal dikhao") ||
      lower.includes("mask hatao") ||
      lower.includes("apni shakal")
    ) {
      nextMasked = false;
    } else if (
      lower.includes("wear mask") || 
      lower.includes("put mask on") || 
      lower.includes("put on mask") || 
      lower.includes("mask pehno") || 
      lower.includes("mask lagao") || 
      lower.includes("cowl on") || 
      lower.includes("hide face") ||
      lower.includes("wear your mask")
    ) {
      nextMasked = true;
    }

    // Superhero outfit changes
    if (lower.includes("spider man") || lower.includes("spiderman") || lower.includes("spider-man")) {
      nextHero = "spiderman";
      nextMasked = true; // default to masked as per requirements
    } else if (lower.includes("iron man") || lower.includes("ironman") || lower.includes("iron-man")) {
      nextHero = "ironman";
      nextMasked = true; // default to masked
    } else if (lower.includes("superman") || lower.includes("super man") || lower.includes("super-man")) {
      nextHero = "superman";
      nextMasked = true; // default to masked
    } else if (lower.includes("batman") || lower.includes("bat man") || lower.includes("bat-man")) {
      nextHero = "batman";
      nextMasked = true; // default to masked
    }

    return { nextHero, nextMasked };
  };

  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [history, setHistory] = useState<{ role: "user" | "model"; text: string }[]>([]);
  const [textInput, setTextInput] = useState("");

  const [activeGesture, setActiveGesture] = useState<"idle" | "speaking" | "nodding" | "hand gesturing">("idle");

  const triggerContextualGesture = (text: string) => {
    const lower = text.toLowerCase();
    
    // Hand gesturing keywords (directions, explanation, pointing, commands)
    const gestureKeywords = [
      "look", "there", "direction", "hand", "point", "this", "that", "left", "right", "here", 
      "wahan", "idhar", "disha", "hath", "dekhiye", "explain", "console", "terminal", "command", 
      "check", "show", "open", "run", "type", "under", "above", "across", "ऊपर", "नीचे", "दाएं", "बाएं"
    ];
    
    // Nodding keywords (agreement, greetings, affirmative, positive, thanks)
    const nodKeywords = [
      "yes", "nod", "agree", "correct", "right", "indeed", "absolutely", "sure", "haan", "sahi", 
      "bilkul", "badhiya", "namaste", "hello", "hi", "hey", "congratulations", "welcome", "dhanyawad", 
      "thanks", "shukriya", "perfect", "good", "great", "सच्ची", "हाँ", "नमस्ते", "धन्यवाद"
    ];

    const hasGesture = gestureKeywords.some(kw => lower.includes(kw));
    const hasNod = nodKeywords.some(kw => lower.includes(kw));

    if (hasGesture) {
      setActiveGesture("hand gesturing");
      setTimeout(() => {
        setActiveGesture((prev) => prev === "hand gesturing" ? "speaking" : prev);
      }, 3500);
    } else if (hasNod) {
      setActiveGesture("nodding");
      setTimeout(() => {
        setActiveGesture((prev) => prev === "nodding" ? "speaking" : prev);
      }, 2500);
    } else {
      setActiveGesture("speaking");
    }
  };

  useEffect(() => {
    if (status !== "speaking") {
      setActiveGesture("idle");
    } else if (activeGesture === "idle") {
      setActiveGesture("speaking");
    }
  }, [status]);

  const processLocalOfflineResponse = (inputText: string): {
    replyText: string;
    detectedMemory: { text: string; category: "Personal Info" | "Preferences" | "Goals" | "Technical Details" | "Other" } | null;
    detectedPersonality: "Empathetic" | "Professional" | "Energetic" | "Calm";
    detectedLanguage: "Hindi" | "English";
  } => {
    const cleanText = inputText.trim();
    const lowerText = cleanText.toLowerCase();
    
    let replyText = "";
    let detectedMemory: { text: string; category: "Personal Info" | "Preferences" | "Goals" | "Technical Details" | "Other" } | null = null;
    let detectedPersonality: "Empathetic" | "Professional" | "Energetic" | "Calm" = "Empathetic";
    let detectedLanguage: "Hindi" | "English" = language;

    // Detect language
    const hasHindiFiller = /bhai|yaar|acha|theek|suno|kya|haan|naam|kaise|mera|tera|hu|ho|hai/.test(lowerText);
    if (hasHindiFiller) {
      detectedLanguage = "Hindi";
    }

    // Local Memory Extraction Rule-engine
    const personalMatch = cleanText.match(/(?:my name is|i am|mera naam|main)\s+([a-zA-Z0-9\s]+)/i);
    const prefMatch = cleanText.match(/(?:i love|i like|i prefer|mujhe\s+([a-zA-Z0-9\s]+)\s+pasand|mujhe pasand)/i);
    const goalMatch = cleanText.match(/(?:my goal is|i want to become|mera goal hai|mera target hai)\s+([a-zA-Z0-9\s]+)/i);

    if (personalMatch && personalMatch[1] && personalMatch[1].trim().length > 1) {
      detectedMemory = {
        text: `User's name/identity: ${personalMatch[1].trim()}`,
        category: "Personal Info"
      };
    } else if (goalMatch && goalMatch[1] && goalMatch[1].trim().length > 1) {
      detectedMemory = {
        text: `User's goal: ${goalMatch[1].trim()}`,
        category: "Goals"
      };
    } else if (prefMatch) {
      detectedMemory = {
        text: `User likes/prefers: ${cleanText}`,
        category: "Preferences"
      };
    }

    // Determine personality & responses based on keywords
    if (/sad|stressed|tension|worried|anxious|pareshaan|pareshan|dil dukh|depression|hurt/i.test(lowerText)) {
      detectedPersonality = "Empathetic";
      replyText = detectedLanguage === "Hindi"
        ? "Bhai, bilkul tension mat le, tera bhai tere saath hamesha hai. Sab theek ho jayega. Relax kar thoda!"
        : "Bro, don't worry or stress out. Your brother is right here by your side, offline or online. Just take a deep breath, buddy.";
    } else if (/run|open|type|command|system|bash|ls|node|terminal/i.test(lowerText)) {
      detectedPersonality = "Professional";
      replyText = detectedLanguage === "Hindi"
        ? "Acha bhai, Command console par check karo. Main abhi offline hoon par system local commands process kar sakta hoon."
        : "Understood bro. I am operating in offline mode, but I can process local commands. Check your console!";
    } else if (/joke|chutkula|masti|fun|happy|game|celebrate|josh|awesome|great/i.test(lowerText)) {
      detectedPersonality = "Energetic";
      if (/joke|chutkula/i.test(lowerText)) {
        replyText = detectedLanguage === "Hindi"
          ? "Acha ek mast joke sun mere bhai: 'Ek aadmi bolta hai - doctor sahab, jab main chai peeta hoon toh aakh mein dard hota hai. Doctor bola - toh pehle chammach nikal liya karo cup se!' Haha, sahi haina?"
          : "Here's a good one, mate: Why don't scientists trust atoms? Because they make up everything! Haha, hope that put a smile on your face, bro!";
      } else {
        replyText = detectedLanguage === "Hindi"
          ? "Kya baat hai mere bhai! Ye hui na baat! Full power energy, let's go!"
          : "Awesome buddy! That's the spirit. Let's make today productive, mate!";
      }
    } else if (/calm|peace|relax|meditate|quiet|soothe|sleep/i.test(lowerText)) {
      detectedPersonality = "Calm";
      replyText = detectedLanguage === "Hindi"
        ? "Aankhein band karo bhai, aur thoda relax karo. Koi tension nahi hai, sab shaant hai."
        : "Close your eyes, brother, and just breathe slowly. Everything is peaceful and calm right now.";
    } else if (/who are you|om|about|yourself|kaun ho/i.test(lowerText)) {
      replyText = detectedLanguage === "Hindi"
        ? "Bhai, main tera 'om' AI hoon—tera sacha dost aur brother. Abhi main tere device par local offline mode mein chal raha hoon."
        : "I am 'om' AI, your friendly companion and brother. Right now, I am running completely locally on your device in Offline Mode.";
    } else if (/memory|remember|yaad/i.test(lowerText)) {
      if (memories && memories.length > 0) {
        const item = memories[0];
        replyText = detectedLanguage === "Hindi"
          ? `Bhai, mujhe bilkul yaad hai! Mere local database mein save hai ki: "${item.text}".`
          : `Of course, brother! I remember this fact from our chat: "${item.text}".`;
      } else {
        replyText = detectedLanguage === "Hindi"
          ? "Abhi mere paas koi saved memories nahi hain bhai. Memory panel mein jaakar kuch bacha ke rakho, main offline me bhi yaad rakhunga!"
          : "I don't have any saved memories about you on this device yet, bro. Save some in the Memory Panel, and I'll remember them even offline!";
      }
    } else if (/hi|hello|namaste|hey|yo|suno/i.test(lowerText)) {
      replyText = detectedLanguage === "Hindi"
        ? "Aur mere bhai! Kaise ho? Abhi main offline mode mein hoon, par tere liye hamesha haazir hoon. Kya chal raha hai?"
        : "Hello mate! How's it going? Currently running on-device with zero internet, but always ready for you. What's on your mind?";
    } else {
      replyText = detectedLanguage === "Hindi"
        ? "Sahi baat hai bhai! Main teri baat samajh gaya. Abhi internet disconnected hai toh main local database se chal raha hoon. Bol, aur kya help chahiye?"
        : "Got it, bro! Since we are offline, I'm processing everything locally on your device. Let me know if there's anything else we should talk about!";
    }

    return {
      replyText,
      detectedMemory,
      detectedPersonality,
      detectedLanguage
    };
  };

  const speakOffline = (text: string, sessionId: number) => {
    setStatus("speaking");
    isSpeakingRef.current = true;
    
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    try {
      synth.cancel();
    } catch (e) {}

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (language === "Hindi") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-US";
    }
    
    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes(language === "Hindi" ? "hi" : "en"));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (sessionId === activeSessionIdRef.current) {
        setStatus("listening");
        isSpeakingRef.current = false;
      }
    };

    utterance.onerror = () => {
      if (sessionId === activeSessionIdRef.current) {
        setStatus("listening");
        isSpeakingRef.current = false;
      }
    };

    synth.speak(utterance);
  };

  const handleOfflineQuery = (query: string, sessionId: number) => {
    const offlineResult = processLocalOfflineResponse(query);
    
    setCaptionText(`om: ${offlineResult.replyText}`);
    setHistory((prev) => [...prev, { role: "model", text: offlineResult.replyText }]);
    triggerContextualGesture(offlineResult.replyText);
    
    if (offlineResult.detectedPersonality) {
      setPersonality(offlineResult.detectedPersonality);
    }
    if (offlineResult.detectedLanguage) {
      setLanguage(offlineResult.detectedLanguage);
    }
    if (offlineResult.detectedMemory) {
      onMemoryDetected(offlineResult.detectedMemory.text, offlineResult.detectedMemory.category);
    }

    speakOffline(offlineResult.replyText, sessionId);
  };

  // Helper to dynamically update the HUD based on spoken text content
  const updateHUDFromText = (text: string) => {
    if (!text) return;
    const lower = text.toLowerCase();

    // 1. Language Detection Cues
    const hindiCues = [
      "bhai", "yaar", "kaise", "haan", "theek", "bhaiya", "bol", "hoon", "kar", "kya", "na", "hai", "batao", "suno", "haanjhi", "sab", "badhiya", "karo", "maaf", "samajh", "aagaya", "gaya"
    ];
    let hindiCount = 0;
    hindiCues.forEach(cue => {
      if (lower.includes(cue)) {
        hindiCount++;
      }
    });

    if (hindiCount >= 2 || (hindiCount >= 1 && lower.length < 15)) {
      setLanguage("Hindi");
    } else if (lower.includes("english") || lower.includes("speak english") || lower.includes("talk in english")) {
      setLanguage("English");
    }

    // 2. Personality/Tone Detection Cues
    const professionalCues = [
      "terminal", "bash", "command", "server", "code", "node", "npm", "ls", "pwd", "package", "executing", "successfully", "file", "error", "advisory", "advising", "system", "technical", "git", "run", "open", "type"
    ];
    const energeticCues = [
      "hype", "kya baat hai", "sahi hai", "chalo shuru", "awesome", "perfect", "let's go", "wow", "amazing", "mate", "super", "josh", "motivate", "excited", "yeah", "great", "cheers", "brother!"
    ];
    const calmCues = [
      "shanti", "relax", "calm", "shaant", "peace", "breath", "meditate", "soothing", "slowly", "aaraam se", "tranquil", "zen", "mellow"
    ];
    const empatheticCues = [
      "feel", "sorry", "sad", "down", "upset", "care", "loving", "always here", "listening", "empathy", "pyaar", "parwah", "samajh", "comfort", "listen", "understand", "broken", "heart"
    ];

    let scores = { Professional: 0, Energetic: 0, Calm: 0, Empathetic: 0 };
    professionalCues.forEach(c => { if (lower.includes(c)) scores.Professional++; });
    energeticCues.forEach(c => { if (lower.includes(c)) scores.Energetic++; });
    calmCues.forEach(c => { if (lower.includes(c)) scores.Calm++; });
    empatheticCues.forEach(c => { if (lower.includes(c)) scores.Empathetic++; });

    // Find the highest scoring personality
    let maxScore = 0;
    let selectedPersonality: "Empathetic" | "Professional" | "Energetic" | "Calm" | null = null;
    
    (Object.keys(scores) as Array<keyof typeof scores>).forEach(key => {
      if (scores[key] > maxScore) {
        maxScore = scores[key];
        selectedPersonality = key;
      }
    });

    if (selectedPersonality && maxScore > 0) {
      setPersonality(selectedPersonality);
    }
  };

  // Refs for audio classes
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const isSpeakingRef = useRef(false);

  // Fallback REST Speech Recognition references
  const recognitionRef = useRef<any>(null);
  const isRecognitionActiveRef = useRef(false);
  const wakeWordRecognitionRef = useRef<any>(null);
  const wakeWordActiveRef = useRef(false);
  const wakeWordAllowedRef = useRef(true);

  // Web Audio Visualizer References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const standardMicAnalyserRef = useRef<AnalyserNode | null>(null);
  const standardMicStreamRef = useRef<MediaStream | null>(null);
  const standardMicCtxRef = useRef<AudioContext | null>(null);

  // Waveform Visualizer Drawing Cycle
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = 128;
    const dataArray = new Uint8Array(bufferLength);
    let phase = 0;

    const draw = () => {
      animationId = requestAnimationFrame(draw);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      let activeAnalyser: AnalyserNode | null = null;
      let waveType: "listening" | "speaking" | "connecting" | "idle" = "idle";

      if (status === "speaking" && audioPlayerRef.current?.analyser) {
        activeAnalyser = audioPlayerRef.current.analyser;
        waveType = "speaking";
      } else if (status === "listening") {
        if (engineMode === "Live" && audioStreamerRef.current?.analyser) {
          activeAnalyser = audioStreamerRef.current.analyser;
        } else if (engineMode === "Standard" && standardMicAnalyserRef.current) {
          activeAnalyser = standardMicAnalyserRef.current;
        }
        waveType = "listening";
      } else if (status === "connecting") {
        waveType = "connecting";
      }

      if (activeAnalyser && (status === "listening" || status === "speaking")) {
        activeAnalyser.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = dataArray[i] / 128.0 - 1.0;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / bufferLength);

        const strokeColor = waveType === "listening" 
          ? "rgba(16, 185, 129, 0.95)" 
          : "rgba(99, 102, 241, 0.95)"; 
        const glowColor = waveType === "listening" 
          ? "rgba(16, 185, 129, 0.4)" 
          : "rgba(99, 102, 241, 0.4)";

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = rms > 0.01 ? 12 : 4;
        ctx.shadowColor = glowColor;

        ctx.beginPath();
        const sliceWidth = width / (bufferLength - 1);
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const taper = Math.sin((i / (bufferLength - 1)) * Math.PI);
          const offset = (v - 1.0) * taper * 0.95;
          const y = height / 2 + offset * (height / 2);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        phase += 0.08;
        const strokeColor = waveType === "connecting"
          ? "rgba(129, 140, 248, 0.7)"
          : "rgba(255, 255, 255, 0.15)";
        
        const glowColor = waveType === "connecting" ? "rgba(129, 140, 248, 0.3)" : "transparent";

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.shadowBlur = waveType === "connecting" ? 8 : 0;
        ctx.shadowColor = glowColor;

        ctx.beginPath();
        const sliceWidth = width / 100;
        let x = 0;

        for (let i = 0; i <= 100; i++) {
          const progress = i / 100;
          const taper = Math.sin(progress * Math.PI);
          let amp = 0;
          if (waveType === "connecting") {
            amp = Math.sin(phase + progress * 8) * 8 * taper;
            amp += Math.cos(phase * 1.5 + progress * 16) * 4 * taper;
          } else {
            amp = Math.sin(phase * 0.5 + progress * 4) * 1.5 * taper;
          }

          const y = height / 2 + amp;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [status, engineMode]);

  // Initialize Audio Classes on Mount
  useEffect(() => {
    audioPlayerRef.current = new AudioPlayer();
    audioPlayerRef.current.setOnPlayEnd(() => {
      isSpeakingRef.current = false;
      if (statusRef.current === "speaking") {
        setStatus("listening");
      }
    });

    return () => {
      cleanupLiveSession();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.close();
      }
    };
  }, []);

  // Clean up ongoing live connections
  const cleanupLiveSession = () => {
    activeSessionIdRef.current++; // Cancel/invalidate any pending asynchronous sessions

    if (audioStreamerRef.current) {
      audioStreamerRef.current.stop();
      audioStreamerRef.current = null;
    }
    // Clean up standard mic analyser and context
    if (standardMicStreamRef.current) {
      try {
        standardMicStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      standardMicStreamRef.current = null;
    }
    if (standardMicCtxRef.current) {
      try {
        if (standardMicCtxRef.current.state !== "closed") {
          standardMicCtxRef.current.close();
        }
      } catch (e) {}
      standardMicCtxRef.current = null;
    }
    standardMicAnalyserRef.current = null;

    if (socketRef.current) {
      // Clear event listeners before closing to avoid triggering callbacks
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onerror = null;
      socketRef.current.onclose = null;
      try {
        socketRef.current.close();
      } catch (e) {
        console.warn("Error closing websocket during cleanup:", e);
      }
      socketRef.current = null;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.interrupt();
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    if (recognitionRef.current) {
      try {
        // Prevent event callbacks from firing while/after we stop recognition
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    isSpeakingRef.current = false;
  };

  // Start Gemini Live Mode Session (WebSockets)
  const startLiveSession = async () => {
    cleanupLiveSession();
    const sessionId = ++activeSessionIdRef.current;
    setStatus("connecting");
    setErrorMsg(null);

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/live?lang=${language === "Hindi" ? "hi" : "en"}&personality=${personality}&superhero=${superhero}&isMasked=${isMasked}`;

    let connectedSuccessfully = false;
    let connectionTimeout: any = null;

    try {
      socketRef.current = new WebSocket(wsUrl);

      // Timeout after 1.8 seconds if connection is stuck or proxy is slow
      connectionTimeout = setTimeout(() => {
        if (!connectedSuccessfully && socketRef.current) {
          console.warn("Live Session connection setup took too long. Falling back to Standard Conversational AI.");
          setEngineMode("Standard");
          setCaptionText("om: Shifting to Conversational speech mode for a stable connection...");
          cleanupLiveSession();
          setTimeout(() => {
            startStandardSession();
          }, 100);
        }
      }, 1800);

      socketRef.current.onopen = () => {
        console.log("WebSocket opened, starting audio capture");
      };

      socketRef.current.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.status === "connected") {
            connectedSuccessfully = true;
            if (connectionTimeout) clearTimeout(connectionTimeout);
            setStatus("listening");

            if (wasWokenUpByWakeWordRef.current) {
              wasWokenUpByWakeWordRef.current = false;
              const wakeupGreeting = language === "Hindi"
                ? "Okay sir, main yahan hoon! Batayiye main aapke liye kya kar sakta hoon."
                : "Okay sir, I'm here! Tell me what I can do.";
              setCaptionText(`om: ${wakeupGreeting}`);
              setHistory((prev) => [...prev, { role: "model", text: wakeupGreeting }]);
              triggerContextualGesture(wakeupGreeting);

              try {
                setStatus("speaking");
                const res = await fetch("/api/assistant", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    message: `Repeat exactly this phrase, and do not say anything else: ${wakeupGreeting}`,
                    history: [],
                    memories: [],
                    lang: language === "Hindi" ? "hi" : "en",
                    personality,
                    clonedVoice: clonedVoiceActive ? clonedVoiceFile : null,
                    superhero,
                    isMasked,
                  }),
                });

                if (sessionId === activeSessionIdRef.current) {
                  const data = await res.json();
                  if (data.audio && audioPlayerRef.current) {
                    isSpeakingRef.current = true;
                    audioPlayerRef.current.playChunk(data.audio);
                  } else {
                    const synth = window.speechSynthesis;
                    const utterance = new SpeechSynthesisUtterance(wakeupGreeting);
                    utterance.lang = language === "Hindi" ? "hi-IN" : "en-US";
                    utterance.onend = () => {
                      if (sessionId === activeSessionIdRef.current) {
                        setStatus("listening");
                      }
                    };
                    synth.speak(utterance);
                  }
                }
              } catch (e) {
                console.warn("Live wake up greeting fetch failed:", e);
                const synth = window.speechSynthesis;
                const utterance = new SpeechSynthesisUtterance(wakeupGreeting);
                utterance.lang = language === "Hindi" ? "hi-IN" : "en-US";
                utterance.onend = () => {
                  if (sessionId === activeSessionIdRef.current) {
                    setStatus("listening");
                  }
                };
                synth.speak(utterance);
              }
            } else {
              const greeting = language === "Hindi"
                ? "om: Aur mere bhai, kaise ho? Maje kar rahe ho ya nahi?"
                : "om: Hello my brother! What well you are?";
              setCaptionText(greeting);
            }
          }

          if (msg.audio) {
            setStatus("speaking");
            isSpeakingRef.current = true;
            if (audioPlayerRef.current) {
              audioPlayerRef.current.playChunk(msg.audio);
            }
          }

          if (msg.interrupted) {
            console.log("Assistant interrupted by user");
            if (audioPlayerRef.current) {
              audioPlayerRef.current.interrupt();
            }
            isSpeakingRef.current = false;
            setStatus("listening");
            setCaptionText("om: (Sunte hue...)");
          }

          if (msg.text) {
            setCaptionText(`om: ${msg.text}`);
            setHistory((prev) => [...prev, { role: "model", text: msg.text }]);
            updateHUDFromText(msg.text);
            triggerContextualGesture(msg.text);
          }

          if (msg.error) {
            throw new Error(msg.error);
          }
        } catch (err: any) {
          console.error("Socket message error:", err);
          setErrorMsg(err.message || "Failed to process audio streams.");
          setStatus("error");
          cleanupLiveSession();
        }
      };

      socketRef.current.onerror = (e) => {
        if (sessionId !== activeSessionIdRef.current) return;
        if (connectionTimeout) clearTimeout(connectionTimeout);
        console.warn("WS Socket error detected. Auto-falling back to standard Conversational AI:", e);
        setEngineMode("Standard");
        setCaptionText("om: Shifting to Conversational speech mode for a stable connection...");
        cleanupLiveSession();
        setTimeout(() => {
          if (sessionId === activeSessionIdRef.current) {
            startStandardSession();
          }
        }, 300);
      };

      socketRef.current.onclose = () => {
        if (sessionId !== activeSessionIdRef.current) return;
        if (connectionTimeout) clearTimeout(connectionTimeout);
        console.log("WebSocket closed");
        if (!connectedSuccessfully && (statusRef.current === "connecting" || statusRef.current === "listening")) {
          console.warn("Live session closed during setup or connection. Auto-falling back to standard Conversational AI.");
          setEngineMode("Standard");
          setCaptionText("om: Shifting to Conversational speech mode for a stable connection...");
          cleanupLiveSession();
          setTimeout(() => {
            if (sessionId === activeSessionIdRef.current) {
              startStandardSession();
            }
          }, 300);
        } else if (statusRef.current !== "error") {
          setStatus("disconnected");
        }
      };

      // Start capturing Mic & Downsampling to 16kHz PCM
      const streamer = new AudioStreamer((base64PCM) => {
        if (sessionId !== activeSessionIdRef.current) return;
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          // Send raw PCM bytes to backend
          socketRef.current.send(JSON.stringify({ audio: base64PCM }));
        }
      });
      audioStreamerRef.current = streamer;

      if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
        await streamer.start();
        if (sessionId !== activeSessionIdRef.current) {
          try {
            streamer.stop();
          } catch (e) {}
          return;
        }
      }

    } catch (err: any) {
      if (connectionTimeout) clearTimeout(connectionTimeout);
      console.error("Live session failed:", err);
      if (err.name === "NotAllowedError" || (err.message && err.message.toLowerCase().includes("permission"))) {
        setErrorMsg(err.message || "Could not gain microphone permissions. Please enable mic access.");
        setStatus("error");
        cleanupLiveSession();
      } else {
        console.warn("Auto-falling back to standard Conversational AI due to Live session initialization error.");
        setEngineMode("Standard");
        setCaptionText("om: Shifting to Conversational speech mode for a stable connection...");
        cleanupLiveSession();
        setTimeout(() => {
          startStandardSession();
        }, 300);
      }
    }
  };

  const checkActionTrigger = (text: string) => {
    const lower = text.toLowerCase().trim();
    if (!lower) return { shouldTrigger: false, cleanedText: text };

    const actionKeywords = [
      // English
      "go ahead", "do it", "proceed", "start", "answer", "msg", "message", "send", "submit", "execute", "work upon that", "work on that", "work upon", "work on", "do work", "done work", "send it",
      // Hindi/Hinglish/Urdu
      "chalo", "bhejo", "bhej do", "bhej-do", "karo", "shuru", "shuru karo", "batao", "likho", "aage badho", "aage-badho", "aage chalo", "kar do", "kardo", "bhejdo",
      "bhej de", "bhejde", "kar de", "karde", "kar de ise", "kar de ish", "bhej de ise", "kar dalo", "kardalo", "kaam karo", "kaam kar", "kaam kardo",
      "चलो", "भेजो", "करो", "शुरू", "बताओ", "लिखो", "आगे", "आगे बढ़ो", "आगे चलो", "कर दो", "भेज दो", "करो इसे", "शुरू करो", "करदे"
    ];

    for (const keyword of actionKeywords) {
      const escapedKw = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?:\\s+|^)${escapedKw}[.!?,]*$`, "i");
      if (regex.test(lower)) {
        const replaceRegex = new RegExp(`\\s*${escapedKw}[.!?,]*$`, "i");
        const cleaned = text.replace(replaceRegex, "").trim();
        return { shouldTrigger: true, cleanedText: cleaned };
      }
    }

    return { shouldTrigger: false, cleanedText: text };
  };

  // Cleanly starts a fresh standard speech recognition session
  const startStandardSpeechRecognition = () => {
    // 1. Teardown any existing active standard recognition instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    isRecognitionActiveRef.current = false;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language === "Hindi" ? "hi-IN" : "en-US";

      rec.onstart = () => {
        isRecognitionActiveRef.current = true;
        console.log("Standard SpeechRecognition session started cleanly.");
      };

      rec.onresult = async (event: any) => {
        const sessionId = activeSessionIdRef.current;

        let fullTranscript = "";
        let isFinal = false;

        // Accumulate transcript from current active session
        for (let i = 0; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          fullTranscript += (fullTranscript ? " " : "") + chunk.trim();
        }

        // Only evaluate finality based on the last active speech result in the buffer
        const lastResultIndex = event.results.length - 1;
        if (event.results[lastResultIndex].isFinal) {
          isFinal = true;
        }

        const cleanSpeech = fullTranscript.trim();
        if (!cleanSpeech) return;

        // User spoke, interrupt if model was speaking
        if (audioPlayerRef.current) {
          try {
            audioPlayerRef.current.interrupt();
          } catch (e) {}
        }
        if (typeof window !== "undefined" && window.speechSynthesis) {
          try {
            window.speechSynthesis.cancel();
          } catch (e) {}
        }

        const { shouldTrigger, cleanedText } = checkActionTrigger(cleanSpeech);

        // If it is neither final nor an action trigger keyword, show interim text and wait
        if (!isFinal && !shouldTrigger) {
          setCaptionText(language === "Hindi" ? `Main sun rahi hoon: "${cleanSpeech}"` : `Listening: "${cleanSpeech}"`);
          return;
        }

        // Action triggered or sentence finalized - stop recognition immediately to prevent double submissions or echoes
        try {
          rec.onstart = null;
          rec.onresult = null;
          rec.onerror = null;
          rec.onend = null;
          rec.stop();
        } catch (e) {}
        isRecognitionActiveRef.current = false;

        const speechText = shouldTrigger ? (cleanedText || cleanSpeech) : cleanSpeech;

        // Voice Automation Interceptor: Detect "open", "run", or "type" commands
        const lowerSpeech = speechText.toLowerCase();
        if (
          lowerSpeech.startsWith("open ") ||
          lowerSpeech.startsWith("run ") ||
          lowerSpeech.startsWith("type ")
        ) {
          setStatus("listening");
          setCaptionText(language === "Hindi" ? `Command mila: "${speechText}"` : `Command received: "${speechText}"`);
          setHistory((prev) => [...prev, { role: "user", text: `[Voice Command] ${speechText}` }]);
          
          window.dispatchEvent(new CustomEvent("om-voice-command", { detail: speechText }));
          return;
        }

        // Action trigger: Dispatch Messenger send action if appropriate
        if (shouldTrigger) {
          window.dispatchEvent(new CustomEvent("om-trigger-send"));
        }

        setStatus("connecting");
        setCaptionText(language === "Hindi" ? `Aapne kaha: "${speechText}"` : `You said: "${speechText}"`);
        setHistory((prev) => [...prev, { role: "user", text: speechText }]);
        updateHUDFromText(speechText);

        const { nextHero, nextMasked } = getNextIdentityStates(speechText);
        setSuperhero(nextHero);
        setIsMasked(nextMasked);

        const activeOffline = isOffline || (typeof navigator !== "undefined" && !navigator.onLine);
        if (activeOffline) {
          handleOfflineQuery(speechText, sessionId);
          return;
        }

        // Post transcript to assistant endpoint
        try {
          let ocrConfig = null;
          try {
            const savedConfig = localStorage.getItem("om_ocr_provider_config");
            if (savedConfig) ocrConfig = JSON.parse(savedConfig);
          } catch (e) {}

          const res = await fetch("/api/assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: speechText,
              history: history.slice(-6),
              memories,
              lang: language === "Hindi" ? "hi" : "en",
              personality,
              clonedVoice: clonedVoiceActive ? clonedVoiceFile : null,
              superhero: nextHero,
              isMasked: nextMasked,
              providerConfig: ocrConfig
            }),
          });

          if (sessionId !== activeSessionIdRef.current) return;

          const data = await res.json();
          if (data.error) throw new Error(data.error);

          setCaptionText(`om: ${data.text}`);
          setHistory((prev) => [...prev, { role: "model", text: data.text }]);
          triggerContextualGesture(data.text);

          if (data.detectedPersonality) {
            setPersonality(data.detectedPersonality);
          }
          if (data.detectedLanguage) {
            setLanguage(data.detectedLanguage);
          }

          if (data.detectedMemory) {
            onMemoryDetected(data.detectedMemory.text, data.detectedMemory.category);
          }

          if (data.draftMessage) {
            window.dispatchEvent(new CustomEvent("om-draft-message", { 
              detail: data.draftMessage 
            }));
          }

          if (data.audio) {
            setStatus("speaking");
            isSpeakingRef.current = true;
            if (audioPlayerRef.current) {
              audioPlayerRef.current.playChunk(data.audio);
            }
          } else {
            setStatus("speaking");
            const synth = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(data.text);
            utterance.lang = "hi-IN";
            utterance.onend = () => {
              if (sessionId === activeSessionIdRef.current) {
                setStatus("listening");
              }
            };
            synth.speak(utterance);
          }

        } catch (err: any) {
          if (sessionId !== activeSessionIdRef.current) return;
          console.error("Standard assistant request failed:", err);
          setCaptionText("om: (Maaf karna, main thodi thak gayi hoon. Dobara try kijiye?)");
          setStatus("listening");
        }
      };

      rec.onerror = (e: any) => {
        isRecognitionActiveRef.current = false;
        const sessionId = activeSessionIdRef.current;
        if (sessionId !== activeSessionIdRef.current) return;
        const errType = e.error || "";
        if (errType === "not-allowed" || errType === "service-not-allowed") {
          console.error("Standard recognition error:", e);
          setErrorMsg("Mic access denied. Please grant microphone permissions.");
          setStatus("error");
          cleanupLiveSession();
        } else if (errType === "no-speech" || errType === "aborted") {
          console.log("Standard recognition info:", errType);
        } else {
          console.log("Standard recognition event info:", errType);
        }
      };

      rec.onend = () => {
        isRecognitionActiveRef.current = false;
        if (statusRef.current === "listening" && recognitionRef.current === rec) {
          try {
            rec.start();
          } catch (err) {
            console.warn("Standard recognition auto-restart failed onend:", err);
          }
        }
      };

      recognitionRef.current = rec;
    } catch (err) {
      console.error("Failed to initialize standard speech recognition:", err);
    }
  };

  // Start Conversational Standard REST Session
  const startStandardSession = async () => {
    cleanupLiveSession();
    // Invalidate any older sessions
    const sessionId = ++activeSessionIdRef.current;
    setStatus("connecting");
    setErrorMsg(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Your browser does not support speech recognition. Please use Google Chrome or switch to Live mode.");
      setStatus("error");
      return;
    }

    try {
      // Setup microphone stream for visualizer feedback during standard session
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (sessionId !== activeSessionIdRef.current) {
        try {
          stream.getTracks().forEach((track) => track.stop());
        } catch (e) {}
        return;
      }

      standardMicStreamRef.current = stream;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        standardMicCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        standardMicAnalyserRef.current = analyser;
      } catch (errCtx) {
        console.warn("Failed to initialize standard mic analyser:", errCtx);
      }

      if (wasWokenUpByWakeWordRef.current) {
        wasWokenUpByWakeWordRef.current = false;
        const wakeupGreeting = language === "Hindi"
          ? "Okay sir, main yahan hoon! Batayiye main aapke liye kya kar sakta hoon."
          : "Okay sir, I'm here! Tell me what I can do.";
        setCaptionText(`om: ${wakeupGreeting}`);
        setHistory((prev) => [...prev, { role: "model", text: wakeupGreeting }]);
        triggerContextualGesture(wakeupGreeting);

        try {
          let ocrConfig = null;
          try {
            const savedConfig = localStorage.getItem("om_ocr_provider_config");
            if (savedConfig) ocrConfig = JSON.parse(savedConfig);
          } catch (e) {}

          setStatus("speaking");
          const res = await fetch("/api/assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: `Repeat exactly this phrase, and do not say anything else: ${wakeupGreeting}`,
              history: [],
              memories: [],
              lang: language === "Hindi" ? "hi" : "en",
              personality,
              clonedVoice: clonedVoiceActive ? clonedVoiceFile : null,
              superhero,
              isMasked,
              providerConfig: ocrConfig
            }),
          });

          if (sessionId === activeSessionIdRef.current) {
            const data = await res.json();
            if (data.audio && audioPlayerRef.current) {
              isSpeakingRef.current = true;
              audioPlayerRef.current.playChunk(data.audio);
            } else {
              const synth = window.speechSynthesis;
              const utterance = new SpeechSynthesisUtterance(wakeupGreeting);
              utterance.lang = language === "Hindi" ? "hi-IN" : "en-US";
              utterance.onend = () => {
                if (sessionId === activeSessionIdRef.current) {
                  setStatus("listening");
                }
              };
              synth.speak(utterance);
            }
          }
        } catch (e) {
          console.warn("Wake up TTS error:", e);
          const synth = window.speechSynthesis;
          const utterance = new SpeechSynthesisUtterance(wakeupGreeting);
          utterance.lang = language === "Hindi" ? "hi-IN" : "en-US";
          utterance.onend = () => {
            if (sessionId === activeSessionIdRef.current) {
              setStatus("listening");
            }
          };
          synth.speak(utterance);
        }
      } else {
        setStatus("listening");
      }

    } catch (err: any) {
      if (sessionId !== activeSessionIdRef.current) return;
      console.error("Mic error:", err);
      setErrorMsg("Mic permission required for voice interaction.");
      setStatus("error");
      cleanupLiveSession();
    }
  };

  const startWakeWordListener = () => {
    stopWakeWordListener();

    if (statusRef.current !== "disconnected" && statusRef.current !== "error") {
      return;
    }

    if (!wakeWordAllowedRef.current) {
      console.log("Wake word listener not started: mic access previously denied or not allowed.");
      return;
    }

    if (wakeWordActiveRef.current) {
      console.log("Wake word listener is already active.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const wakeRec = new SpeechRecognition();
      wakeRec.continuous = true;
      wakeRec.interimResults = true;
      wakeRec.lang = language === "Hindi" ? "hi-IN" : "en-US";

      wakeRec.onstart = () => {
        wakeWordActiveRef.current = true;
        console.log("Wake-word listener started successfully.");
      };

      wakeRec.onresult = (event: any) => {
        if (statusRef.current !== "disconnected" && statusRef.current !== "error") {
          try {
            wakeRec.stop();
          } catch (e) {}
          return;
        }

        const lastResultIndex = event.results.length - 1;
        const speechText = event.results[lastResultIndex][0].transcript;
        if (!speechText) return;

        const lowerText = speechText.trim().toLowerCase();
        console.log("Background wake-word listener heard:", lowerText);

        const wakePhrases = [
          "wake up om", "wake up ohm", "bhai suno", "bhai wake up", 
          "wake up aum", "wake up home", "wake up on", "om suno", 
          "wake up", "wake-up", "hello om", "get ready om", "get ready, om",
          "get ready", "ready om", "uth jao om", "taiyar ho jao om", "taiyaar ho jao om"
        ];

        const hasWakeWord = wakePhrases.some(phrase => lowerText.includes(phrase));

        if (hasWakeWord) {
          console.log("Wake phrase matched! Starting active session...");
          stopWakeWordListener();
          wasWokenUpByWakeWordRef.current = true;
          if (engineMode === "Live") {
            startLiveSession();
          } else {
            startStandardSession();
          }
        }
      };

      wakeRec.onerror = (e: any) => {
        const errType = e.error || "";
        if (errType === "not-allowed" || errType === "service-not-allowed") {
          console.warn("Wake-word microphone access denied. Disabling background wake word listener.");
          wakeWordAllowedRef.current = false;
          stopWakeWordListener();
        } else if (errType === "no-speech" || errType === "aborted") {
          // Expected background states, do not spam warnings or errors
          console.log("Wake-word listener transient state:", errType);
        } else {
          console.log("Wake-word listener info event:", errType);
        }
      };

      wakeRec.onend = () => {
        wakeWordActiveRef.current = false;
        if (wakeWordAllowedRef.current && (statusRef.current === "disconnected" || statusRef.current === "error") && wakeWordRecognitionRef.current === wakeRec) {
          setTimeout(() => {
            try {
              if (wakeWordAllowedRef.current && !wakeWordActiveRef.current && (statusRef.current === "disconnected" || statusRef.current === "error")) {
                wakeRec.start();
              }
            } catch (err) {
              console.log("Restarting wake-word listener status:", err);
            }
          }, 1000);
        }
      };

      wakeWordRecognitionRef.current = wakeRec;
      wakeRec.start();
    } catch (err) {
      console.log("Error starting wake word listener:", err);
    }
  };

  const stopWakeWordListener = () => {
    wakeWordActiveRef.current = false;
    if (wakeWordRecognitionRef.current) {
      try {
        wakeWordRecognitionRef.current.onstart = null;
        wakeWordRecognitionRef.current.onresult = null;
        wakeWordRecognitionRef.current.onerror = null;
        wakeWordRecognitionRef.current.onend = null;
        wakeWordRecognitionRef.current.stop();
      } catch (e) {}
      wakeWordRecognitionRef.current = null;
    }
  };

  // Start background wake-word listener on mount or status change
  useEffect(() => {
    if (status === "disconnected" || status === "error") {
      startWakeWordListener();
      
      const handleUserGesture = () => {
        if (statusRef.current === "disconnected" || statusRef.current === "error") {
          if (wakeWordAllowedRef.current && !wakeWordActiveRef.current) {
            startWakeWordListener();
          }
        }
      };
      
      window.addEventListener("click", handleUserGesture);
      window.addEventListener("touchstart", handleUserGesture);
      return () => {
        stopWakeWordListener();
        window.removeEventListener("click", handleUserGesture);
        window.removeEventListener("touchstart", handleUserGesture);
      };
    } else {
      stopWakeWordListener();
    }
  }, [status, language, engineMode]);

  // Start/recreate recognition whenever status changes to 'listening'
  useEffect(() => {
    if (status === "listening" && engineMode === "Standard") {
      startStandardSpeechRecognition();
    } else {
      // If we are not in listening state, make sure recognition is stopped cleanly
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
      isRecognitionActiveRef.current = false;
    }
  }, [status, engineMode, language]);

  // Handle successful hand-tracked pattern unlock
  useEffect(() => {
    const handleGestureUnlock = () => {
      setIsAppLocked(false);
      setCaptionText("om: Shabaash! Pattern match ho gaya, bhaiya! App unlocked and ready!");
      
      const synth = window.speechSynthesis;
      if (synth) {
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(
          language === "Hindi" 
            ? "Pattern lock matched, bhaiya! Access granted! Main sun rahi hoon." 
            : "Pattern lock matched, my friend! Access granted and system is ready."
        );
        utterance.lang = language === "Hindi" ? "hi-IN" : "en-US";
        synth.speak(utterance);
      }
    };
    window.addEventListener("om-gesture-unlocked", handleGestureUnlock);
    return () => {
      window.removeEventListener("om-gesture-unlocked", handleGestureUnlock);
    };
  }, [language]);

  // Main Session Toggle Action (Clicking centered mic button)
  const handleMicClick = () => {
    if (isAppLocked) {
      setCaptionText("om (🔒 System Secured): Draw the correct pattern on the Vision controller or click 'Deactivate App Lock' to resume interaction.");
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(140, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch (e) {}
      return;
    }
    if (status === "disconnected" || status === "error") {
      if (engineMode === "Live") {
        startLiveSession();
      } else {
        startStandardSession();
      }
    } else {
      cleanupLiveSession();
      setStatus("disconnected");
      setCaptionText("");
    }
  };

  // Interruption triggers (user clicks background while assistant speaks)
  const handleInterruption = () => {
    if (status === "speaking") {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.interrupt();
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
      isSpeakingRef.current = false;
      setStatus("listening");
      setCaptionText("om: Acha bolo, main sun rahi hoon.");
    }
  };

  return (
    <div 
      className="flex-1 flex flex-col items-center justify-start p-4 md:p-6 relative"
      onClick={handleInterruption}
      id="voice-panel-root"
    >
      
      {/* Minimalist elegant HUD Indicator */}
      <div className="relative md:absolute md:top-4 md:left-1/2 md:-translate-x-1/2 z-10 w-full text-center select-none pointer-events-none mb-2 md:mb-0" onClick={(e) => e.stopPropagation()}>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/45 border border-white/5 rounded-full text-[10px] font-mono text-gray-400 backdrop-blur-md shadow-lg">
          <span className={`w-1.5 h-1.5 rounded-full ${
            status === 'listening' 
              ? 'bg-emerald-500 animate-ping' 
              : status === 'speaking' 
              ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse' 
              : status === 'connecting' 
              ? 'bg-purple-500 animate-spin border border-t-transparent' 
              : 'bg-amber-500/50'
          }`} />
          <span className="tracking-widest uppercase">OM AI SYSTEM // {status}</span>
        </div>
      </div>

      {/* Main Centered Visual Mic Module with Animated Humanoid 'om' */}
      <div className="relative flex flex-col lg:flex-row items-center justify-center flex-1 gap-8 my-4 w-full max-w-5xl px-4 z-10">
        
        {/* Left column: Full-sized Om Superhero Character Avatar Stage */}
        <div className="w-full lg:w-[380px] flex flex-col items-center justify-center relative">
          <div 
            className="relative cursor-pointer transition-all duration-500 hover:scale-[1.01] flex items-center justify-center w-full h-[520px] bg-neutral-900/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleMicClick();
            }}
          >
            <OmSuperheroCharacter 
              status={(isAppLocked ? "disconnected" : status) as any} 
              superhero={superhero}
              isMasked={isMasked}
              setIsMasked={setIsMasked}
              language={language}
              audioPlayerRef={audioPlayerRef}
            />
            {isAppLocked && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-neutral-950/85 rounded-3xl backdrop-blur-[4px] flex flex-col items-center justify-center border border-rose-500/30 shadow-[0_0_20px_rgba(239,68,68,0.25)] z-20"
              >
                <LockIcon className="w-12 h-12 text-rose-500 animate-pulse" />
                <span className="text-[11px] font-mono text-rose-400 font-extrabold uppercase tracking-widest mt-3">SECURED BY PATTERN</span>
              </motion.div>
            )}
          </div>
          
          {/* Unmask / Mask control tooltip */}
          <div className="absolute bottom-4 right-4 z-10 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsMasked(!isMasked)}
              className="p-2 rounded-full bg-neutral-950/80 border border-white/10 hover:border-indigo-500/40 hover:bg-neutral-900 text-gray-300 hover:text-indigo-400 transition-all shadow-md"
              title={isMasked ? "Reveal face (unmask)" : "Wear mask"}
            >
              {isMasked ? <UnlockIcon className="w-4 h-4" /> : <LockIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Right column: HUD, Interactive Wardrobe, and Controls */}
        <div className="flex-1 flex flex-col gap-5 w-full max-w-md lg:max-w-lg">
          
          {/* Interactive Superhero Wardrobe */}
          <div className="w-full bg-neutral-900/50 border border-white/5 rounded-2xl p-4 shadow-lg backdrop-blur-md flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">SUIT SELECTION // WARDROBE</span>
              <button
                onClick={() => setIsMasked(!isMasked)}
                className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider flex items-center gap-1 transition-all ${
                  isMasked 
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20" 
                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20"
                }`}
              >
                {isMasked ? "Reveal Face" : "Wear Mask"}
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "ironman", label: "Iron Man", color: "from-red-600/30 to-amber-500/10 border-red-500/30 text-red-300", icon: "🚀", emojiColor: "text-red-400" },
                { id: "spiderman", label: "Spider-Man", color: "from-blue-600/30 to-red-500/10 border-sky-500/30 text-sky-300", icon: "🕷️", emojiColor: "text-sky-400" },
                { id: "superman", label: "Superman", color: "from-blue-500/30 to-red-600/10 border-blue-500/30 text-blue-300", icon: "🦸", emojiColor: "text-blue-400" },
                { id: "batman", label: "Batman", color: "from-zinc-800/40 to-neutral-950/20 border-zinc-500/30 text-zinc-300", icon: "🦇", emojiColor: "text-zinc-400" },
              ].map((hero) => {
                const active = superhero === hero.id;
                return (
                  <button
                    key={hero.id}
                    onClick={() => {
                      setSuperhero(hero.id as any);
                      setIsMasked(true); // default to masked
                    }}
                    className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-300 ${
                      active 
                        ? `bg-gradient-to-b ${hero.color} border-white/20 text-white shadow-lg shadow-black/20 scale-105 z-10` 
                        : "bg-neutral-950/30 border-white/5 hover:border-white/10 text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-black/40 flex items-center justify-center font-bold text-sm ${active ? "text-white animate-pulse" : hero.emojiColor}`}>
                      {hero.icon}
                    </div>
                    <span className="text-[10px] font-medium tracking-wide text-center">{hero.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Audio Waveform Canvas */}
          <div className="w-full px-1 flex flex-col items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <canvas
              ref={canvasRef}
              className="w-full h-11 pointer-events-none rounded-xl bg-neutral-950/45 border border-white/5 shadow-inner"
              id="waveform-canvas"
            />
            <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">
              {status === "listening" 
                ? "Your Voice Input Active" 
                : status === "speaking" 
                ? "om's Voice Response stream" 
                : status === "connecting"
                ? "Establishing Audio Link"
                : "Voice Waveform Idle"}
            </span>
          </div>

          {/* Sleek Horizontal Control Row */}
          <div className="flex items-center gap-3 flex-wrap justify-center" onClick={(e) => e.stopPropagation()}>
            {/* Sleek Mic Control Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMicClick();
              }}
              className={`relative px-6 py-2.5 rounded-full flex items-center gap-2 cursor-pointer transition-all duration-300 backdrop-blur-md shadow-lg ${
                status === "listening"
                  ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30"
                  : status === "speaking"
                  ? "bg-indigo-600/20 border border-indigo-400/40 text-indigo-300 hover:bg-indigo-600/30"
                  : status === "connecting"
                  ? "bg-neutral-800/60 border border-indigo-500/30 text-indigo-200"
                  : status === "error"
                  ? "bg-red-500/20 border border-red-500/40 text-red-300"
                  : "bg-white/[0.03] border border-white/10 text-gray-300 hover:bg-white/[0.08] hover:text-white"
              }`}
              title="Click to talk with om"
              id="mic-trigger-btn"
            >
              {status === "disconnected" || status === "error" ? (
                <MicOff className="w-4 h-4 animate-pulse" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
              <span className="text-xs font-semibold tracking-wide">
                {status === "listening" && "Mute om"}
                {status === "speaking" && "Interrupt om"}
                {status === "connecting" && "Waking Up..."}
                {status === "error" && "Error State"}
                {status === "disconnected" && "Wake Up om"}
              </span>
            </button>
          </div>

          {/* Elegant Chat Input Box for Text Mode Fallback */}
          <div className="w-full mt-1" onClick={(e) => e.stopPropagation()}>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const query = textInput.trim();
                if (!query) return;
                setTextInput("");
                
                if (isAppLocked) {
                  setCaptionText("om (🔒 System Secured): Drawing correct pattern on Vision layout is required to submit queries.");
                  return;
                }
                
                cleanupLiveSession();
                const sessionId = ++activeSessionIdRef.current;
                setStatus("connecting");
                setErrorMsg(null);
                setCaptionText(language === "Hindi" ? `Aapne pucha: "${query}"` : `You asked: "${query}"`);
                setHistory((prev) => [...prev, { role: "user", text: query }]);
                
                const { nextHero, nextMasked } = getNextIdentityStates(query);
                setSuperhero(nextHero);
                setIsMasked(nextMasked);

                const activeOffline = isOffline || (typeof navigator !== "undefined" && !navigator.onLine);
                if (activeOffline) {
                  handleOfflineQuery(query, sessionId);
                  return;
                }

                try {
                  let ocrConfig = null;
                  try {
                    const savedConfig = localStorage.getItem("om_ocr_provider_config");
                    if (savedConfig) ocrConfig = JSON.parse(savedConfig);
                  } catch (e) {}

                  const res = await fetch("/api/assistant", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      message: query,
                      history: history.slice(-6),
                      memories,
                      lang: language === "Hindi" ? "hi" : "en",
                      personality,
                      clonedVoice: clonedVoiceActive ? clonedVoiceFile : null,
                      superhero: nextHero,
                      isMasked: nextMasked,
                      providerConfig: ocrConfig
                    }),
                  });

                  if (sessionId !== activeSessionIdRef.current) return;

                  const data = await res.json();
                  if (data.error) throw new Error(data.error);

                  setCaptionText(`om: ${data.text}`);
                  setHistory((prev) => [...prev, { role: "model", text: data.text }]);
                  triggerContextualGesture(data.text);

                  if (data.detectedPersonality) {
                    setPersonality(data.detectedPersonality);
                  }
                  if (data.detectedLanguage) {
                    setLanguage(data.detectedLanguage);
                  }
                  if (data.detectedMemory) {
                    onMemoryDetected(data.detectedMemory.text, data.detectedMemory.category);
                  }

                  if (data.audio) {
                    setStatus("speaking");
                    isSpeakingRef.current = true;
                    if (audioPlayerRef.current) {
                      audioPlayerRef.current.playChunk(data.audio);
                    }
                  } else {
                    setStatus("speaking");
                    const synth = window.speechSynthesis;
                    if (synth) {
                      synth.cancel();
                      const utterance = new SpeechSynthesisUtterance(data.text);
                      utterance.lang = "hi-IN";
                      utterance.onend = () => {
                        if (sessionId === activeSessionIdRef.current) {
                          setStatus("listening");
                        }
                      };
                      synth.speak(utterance);
                    }
                  }
                } catch (err) {
                  if (sessionId !== activeSessionIdRef.current) return;
                  console.error("Text question error:", err);
                  setStatus("error");
                  setErrorMsg("Failed to reach om assistant backend.");
                }
              }}
              className="flex items-center gap-2 bg-neutral-900/60 border border-white/10 rounded-2xl p-1.5 focus-within:border-indigo-500/50 transition-all shadow-md"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={language === "Hindi" ? "om se baat karein..." : "Type message for om..."}
                className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder-gray-500 text-sm px-3 focus:outline-none"
                id="voice-chat-input"
              />
              <button
                type="submit"
                disabled={status === "connecting"}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Active Speech Waveform Indicator */}
          {status === "speaking" && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 h-6 pointer-events-none">
                {Array.from({ length: 11 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [10, Math.floor(Math.random() * 24 + 6), 10]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.35 + i * 0.06,
                      ease: "easeInOut"
                    }}
                    className="w-1 rounded-full bg-gradient-to-t from-indigo-500 to-pink-500 shadow-sm"
                  />
                ))}
              </div>
              {clonedVoiceActive && clonedVoiceName && (
                <span className="text-[9px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full animate-pulse border border-emerald-500/20">
                  🎙️ Cloned Voice Active: {clonedVoiceName}
                </span>
              )}
            </div>
          )}

          {/* Caption text display */}
          {captionText && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center w-full"
            >
              <p className="text-white text-sm md:text-base font-medium leading-relaxed bg-black/60 border border-white/5 rounded-2xl px-4 py-2.5 backdrop-blur-md">
                {captionText}
              </p>
            </motion.div>
          )}

        </div>
      </div>

      {/* Floating Memory Proactive Highlight */}
      {memories.length > 0 && status === "listening" && (
        <div className="relative md:absolute md:bottom-20 md:left-1/2 md:-translate-x-1/2 bg-indigo-500/5 border border-indigo-500/10 rounded-full px-4 py-1.5 flex items-center justify-center gap-2 text-indigo-300 text-[11px] backdrop-blur-sm shadow-sm pointer-events-none mt-4 md:mt-0 w-fit">
          <Brain className="w-3.5 h-3.5" />
          <span>om loaded {memories.length} saved memories</span>
        </div>
      )}

      {/* Connection State Label */}
      <div className="relative md:absolute md:bottom-6 md:left-1/2 md:-translate-x-1/2 text-center pointer-events-none mt-3 md:mt-0" onClick={(e) => e.stopPropagation()}>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
          status === "listening"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : status === "speaking"
            ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
            : status === "connecting"
            ? "bg-indigo-500/5 border-indigo-500/10 text-indigo-300 animate-pulse"
            : status === "error"
            ? "bg-red-500/10 border-red-500/20 text-red-400"
            : "bg-white/5 border-white/10 text-gray-400"
        }`}>
          {status === "listening" && "om is Listening..."}
          {status === "speaking" && "om is Speaking..."}
          {status === "connecting" && "Initializing om..."}
          {status === "error" && "Engine Alert"}
          {status === "disconnected" && "om is Sleeping (Click to Wake)"}
        </span>
      </div>

      {/* Error / Repair Display Panel */}
      {status === "error" && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-40" onClick={(e) => e.stopPropagation()}>
          <div className="bg-neutral-900 border border-red-500/25 p-6 md:p-8 rounded-2xl max-w-lg w-full shadow-2xl text-left">
            <div className="bg-red-500/10 p-3.5 rounded-full text-red-400 w-14 h-14 flex items-center justify-center mb-5">
              <AlertCircle className="w-7 h-7" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Microphone Permission Blocked</h3>
            
            <p className="text-xs text-red-200/80 bg-red-900/20 border border-red-500/20 px-3 py-2 rounded-lg mb-5 font-mono">
              System Code: {errorMsg || "Permission denied"}
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <h4 className="text-xs font-semibold text-gray-200">Browser Iframe Restriction</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    Standard browsers block hardware access (like microphones) inside embedded preview windows (iframes). To fix this, open the app standalone in a full tab.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <h4 className="text-xs font-semibold text-gray-200">Check Site Settings</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    Look at the left side of your browser address bar. If you see a crossed-out camera or microphone icon, click it and select <strong>"Allow"</strong> or reset permission rules.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/25"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open App in New Tab
              </a>
              <button
                onClick={handleMicClick}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-gray-200 border border-white/5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Now
              </button>
              <button
                onClick={() => setStatus("disconnected")}
                className="sm:w-20 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 py-2.5 rounded-xl text-xs font-semibold transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
