import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, Eye, Lock, Unlock, ChevronUp, ChevronDown, 
  Check, X, RefreshCw, Sparkles, Hand, Volume2, 
  AlertCircle, Shield, Smartphone, Play, Pause, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VisionGesturePanelProps {
  isAppLocked: boolean;
  setIsAppLocked: (locked: boolean) => void;
  onGestureAction?: (gesture: string) => void;
}

// Relatable simulated Reels items
interface ReelItem {
  id: number;
  title: string;
  creator: string;
  likes: string;
  comments: string;
  color: string;
  tags: string[];
}

const SAMPLE_REELS: ReelItem[] = [
  {
    id: 1,
    title: "POV: Waving hands to scroll reels on my custom AI mascot system 🖐️💻",
    creator: "@tech_bro_om",
    likes: "25.4K",
    comments: "1,420",
    color: "from-indigo-600 via-purple-700 to-pink-600",
    tags: ["#omAI", "#GestureControl", "#Innovate"]
  },
  {
    id: 2,
    title: "AI Mascot om getting angry when you don't talk in Hinglish! 🇮🇳🔥",
    creator: "@hinglish_coder",
    likes: "42.8K",
    comments: "3,115",
    color: "from-amber-600 via-rose-600 to-indigo-800",
    tags: ["#Hinglish", "#MascotVibe", "#ChaiTime"]
  },
  {
    id: 3,
    title: "Drawing a spatial pattern lock in mid-air to unlock my secured database! 🔐⚡",
    creator: "@cyber_security_india",
    likes: "18.9K",
    comments: "980",
    color: "from-teal-600 via-cyan-700 to-emerald-600",
    tags: ["#PatternLock", "#ZeroTrust", "#TechHacks"]
  }
];

export default function VisionGesturePanel({ 
  isAppLocked, 
  setIsAppLocked,
  onGestureAction 
}: VisionGesturePanelProps) {
  // Config modes
  const [trackMode, setTrackMode] = useState<"webcam" | "cursor">("cursor");
  const [cameraActive, setCameraActive] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [reelsPlaying, setReelsPlaying] = useState(true);

  // Pattern Lock State
  const [patternNodes, setPatternNodes] = useState<number[]>([]);
  const [savedPattern, setSavedPattern] = useState<number[]>(() => {
    const saved = localStorage.getItem("om_gesture_lock_pattern");
    return saved ? JSON.parse(saved) : [0, 1, 2, 5, 8]; // default 'L' shape pattern
  });
  const [isRecordingPattern, setIsRecordingPattern] = useState(false);
  const [patternFeedback, setPatternFeedback] = useState<{ text: string; type: "info" | "success" | "error" }>({
    text: "Swipe or drag nodes to test your spatial security pattern",
    type: "info"
  });

  // Track coordinates
  const [coords, setCoords] = useState({ x: 150, y: 110 });
  const [handPose, setHandPose] = useState<"open" | "pointing" | "clicking">("open");
  const [airCursorEnabled, setAirCursorEnabled] = useState(true);
  const [virtualCursor, setVirtualCursor] = useState({ x: typeof window !== "undefined" ? window.innerWidth / 2 : 500, y: typeof window !== "undefined" ? window.innerHeight / 2 : 400 });
  const [clickRipple, setClickRipple] = useState({ x: 0, y: 0, show: false });
  const [lastGesture, setLastGesture] = useState<string>("NONE");
  const [gestureLogs, setGestureLogs] = useState<string[]>([
    "System: Vision tracking initialized.",
    "System: Default pattern lock registered (L-shape)."
  ]);

  // Refs for tracking
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prevFrameRef = useRef<ImageData | null>(null);

  // Smoothed coords for Exponential Moving Average
  const smoothedX = useRef(150);
  const smoothedY = useRef(110);
  const coordinateHistory = useRef<{ x: number; y: number; t: number }[]>([]);
  const drawingPath = useRef<number[]>([]);
  const lastScrollLogTime = useRef(0);
  const recentMotionPixels = useRef<number[]>([]);
  const clickTriggered = useRef(false);
  const lastCoordinates = useRef({ x: 0, y: 0, time: 0 });

  // Sound effects generator
  const playBeep = (freq: number, duration: number, type: "sine" | "triangle" | "sawtooth" = "sine") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const drawHandStructure = (
    ctx: CanvasRenderingContext2D, 
    tx: number, 
    ty: number, 
    timestamp: number,
    trackMode: string
  ) => {
    const colorTheme = trackMode === "webcam" ? "cyan" : "indigo";
    const primaryColor = colorTheme === "cyan" ? "rgba(6, 182, 212, 0.85)" : "rgba(99, 102, 241, 0.85)";
    const glowColor = colorTheme === "cyan" ? "rgba(6, 182, 212, 0.35)" : "rgba(99, 102, 241, 0.35)";
    const boneColor = colorTheme === "cyan" ? "rgba(6, 182, 212, 0.4)" : "rgba(99, 102, 241, 0.4)";

    // Base Wrist
    const wristX = tx;
    const wristY = ty + 60;

    // Palm base (connecting left and right wrist offsets to knuckles)
    const palmLeftX = tx - 22;
    const palmLeftY = ty + 35;
    const palmRightX = tx + 22;
    const palmRightY = ty + 35;

    // Draw Wrist Node with extra cyber-ring glow
    ctx.strokeStyle = primaryColor;
    ctx.fillStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(wristX, wristY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(wristX, wristY, 11, 0, Math.PI * 2);
    ctx.stroke();

    // Knuckles (Palm upper nodes) - curled dynamically depending on current handPose
    const isPointingOrClicking = handPose === "pointing" || handPose === "clicking";
    const knuckles = [
      { id: "thumb", x: tx - 28, y: ty + 18, length: isPointingOrClicking ? 7 : 16, angle: isPointingOrClicking ? Math.PI / 1.5 : -Math.PI / 3.2, jointsCount: 2 },
      { id: "index", x: tx - 14, y: ty + 4, length: handPose === "clicking" ? 34 : 26, angle: -Math.PI * 0.46, jointsCount: 3 },
      { id: "middle", x: tx, y: ty, length: isPointingOrClicking ? 9 : 30, angle: isPointingOrClicking ? Math.PI / 1.5 : -Math.PI / 2, jointsCount: 3 },
      { id: "ring", x: tx + 14, y: ty + 6, length: isPointingOrClicking ? 8 : 26, angle: isPointingOrClicking ? Math.PI / 1.5 : -Math.PI * 0.54, jointsCount: 3 },
      { id: "pinky", x: tx + 26, y: ty + 20, length: isPointingOrClicking ? 7 : 20, angle: isPointingOrClicking ? Math.PI / 1.5 : -Math.PI * 0.62, jointsCount: 3 }
    ];

    // Connect wrist to palm bases and knuckles to draw the palm shell
    ctx.strokeStyle = boneColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wristX, wristY);
    ctx.lineTo(palmLeftX, palmLeftY);
    ctx.lineTo(knuckles[0].x, knuckles[0].y);
    ctx.lineTo(knuckles[1].x, knuckles[1].y);
    ctx.lineTo(knuckles[2].x, knuckles[2].y);
    ctx.lineTo(knuckles[3].x, knuckles[3].y);
    ctx.lineTo(knuckles[4].x, knuckles[4].y);
    ctx.lineTo(palmRightX, palmRightY);
    ctx.closePath();
    ctx.fillStyle = glowColor;
    ctx.fill();
    ctx.stroke();

    // Draw internal palm skeleton lines (connecting wrist to each knuckle)
    knuckles.forEach((k) => {
      ctx.beginPath();
      ctx.moveTo(wristX, wristY);
      ctx.lineTo(k.x, k.y);
      ctx.stroke();
    });

    // Draw Fingers
    knuckles.forEach((k, idx) => {
      let curX = k.x;
      let curY = k.y;

      // Knuckle point
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.arc(curX, curY, 4, 0, Math.PI * 2);
      ctx.fill();

      // We introduce organic wiggle/bending based on timestamp to make it look active & real
      const timeOffset = timestamp / 1000 + idx * 45;
      const wiggleAngle = Math.sin(timeOffset * 3) * 0.08;
      const flexFactor = 1.0 + Math.cos(timeOffset) * 0.04;

      const baseAngle = k.angle + wiggleAngle;

      // Draw segments
      const segLength = k.length / k.jointsCount;
      for (let j = 0; j < k.jointsCount; j++) {
        // Calculate next joint position
        const angle = baseAngle + (j * 0.04); // slightly curved
        const nextX = curX + Math.cos(angle) * (segLength * flexFactor);
        const nextY = curY + Math.sin(angle) * (segLength * flexFactor);

        // Bone line
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3.5 - j * 0.8;
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();

        // Joint point
        ctx.fillStyle = colorTheme === "cyan" ? "#22d3ee" : "#a5b4fc";
        ctx.beginPath();
        const r = j === k.jointsCount - 1 ? 3 : 3.5; // smaller tip
        ctx.arc(nextX, nextY, r, 0, Math.PI * 2);
        ctx.fill();

        // Draw a tiny radar pulse at finger tips
        if (j === k.jointsCount - 1) {
          ctx.strokeStyle = glowColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(nextX, nextY, 6 + Math.abs(Math.sin(timeOffset * 4) * 5), 0, Math.PI * 2);
          ctx.stroke();
        }

        curX = nextX;
        curY = nextY;
      }
    });
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setGestureLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 14)]);
  };

  const performVirtualClick = (vx: number, vy: number) => {
    playBeep(880, 0.08, "sine");
    setTimeout(() => playBeep(1100, 0.12, "sine"), 50);

    const element = document.elementFromPoint(vx, vy);
    if (element) {
      const clickable = element.closest("button, a, [role='button'], input, select, textarea") || element;
      const tag = clickable.tagName.toLowerCase();
      const text = clickable.textContent?.trim().slice(0, 18) || "";
      addLog(`Air Click 🎯: Clicked <${tag}> "${text}" at [X: ${Math.round(vx)} | Y: ${Math.round(vy)}]`);

      setClickRipple({ x: vx, y: vy, show: true });
      setTimeout(() => {
        setClickRipple(prev => ({ ...prev, show: false }));
      }, 550);

      setHandPose("clicking");
      setTimeout(() => {
        setHandPose("pointing");
      }, 450);

      const mouseOpts = {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: vx,
        clientY: vy
      };

      clickable.dispatchEvent(new MouseEvent("mousedown", mouseOpts));
      clickable.dispatchEvent(new MouseEvent("mouseup", mouseOpts));
      clickable.dispatchEvent(new MouseEvent("click", mouseOpts));

      if (clickable instanceof HTMLElement) {
        clickable.focus();
      }
    }
  };

  // Turn on/off camera
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        addLog("Webcam stream started successfully. Measuring hand motion delta...");
      }
    } catch (err) {
      console.error("Camera access failed", err);
      addLog("Error: Webcam permission denied. Switched to high-precision Cursor Trace mode.");
      setTrackMode("cursor");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    addLog("Webcam stream disconnected. Vision paused.");
  };

  useEffect(() => {
    if (trackMode === "webcam") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [trackMode]);

  // Setup canvas drawings and frame analysis loop
  useEffect(() => {
    let animationId: number;
    let lastAnalysisTime = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Local back-buffer canvas for fast frame comparisons
    const backCanvas = document.createElement("canvas");
    backCanvas.width = 80;
    backCanvas.height = 60;
    const backCtx = backCanvas.getContext("2d");

    const render = (timestamp: number) => {
      animationId = requestAnimationFrame(render);

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Draw Camera Feed with matrix-cyan scan filter
      if (trackMode === "webcam" && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        ctx.globalAlpha = 0.35;
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        ctx.globalAlpha = 1.0;

        // Apply grid scan line overlays
        ctx.strokeStyle = "rgba(6, 182, 212, 0.08)";
        ctx.lineWidth = 1;
        for (let y = 0; y < height; y += 15) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Run motion-centroid analysis every 50ms
        if (timestamp - lastAnalysisTime > 50 && backCtx) {
          lastAnalysisTime = timestamp;
          // Draw video to back buffer
          backCtx.drawImage(videoRef.current, 0, 0, 80, 60);
          const currentFrame = backCtx.getImageData(0, 0, 80, 60);

          if (prevFrameRef.current) {
            const curr = currentFrame.data;
            const prev = prevFrameRef.current.data;
            let sumX = 0;
            let sumY = 0;
            let motionPixels = 0;

            // Frame differencing loop
            for (let y = 0; y < 60; y++) {
              for (let x = 0; x < 80; x++) {
                const idx = (y * 80 + x) * 4;
                const rDiff = Math.abs(curr[idx] - prev[idx]);
                const gDiff = Math.abs(curr[idx + 1] - prev[idx + 1]);
                const bDiff = Math.abs(curr[idx + 2] - prev[idx + 2]);
                const delta = rDiff + gDiff + bDiff;

                // Threshold for significant movement
                if (delta > 85) {
                  sumX += x;
                  sumY += y;
                  motionPixels++;
                }
              }
            }

            // If we detected moving elements
            if (motionPixels > 15) {
              const targetX = width - (sumX / motionPixels / 80) * width; // Mirror image match
              const targetY = (sumY / motionPixels / 60) * height;

              // Exponential Moving Average to filter jitter
              smoothedX.current = smoothedX.current * 0.72 + targetX * 0.28;
              smoothedY.current = smoothedY.current * 0.72 + targetY * 0.28;

              const txVal = Math.round(smoothedX.current);
              const tyVal = Math.round(smoothedY.current);
              setCoords({ x: txVal, y: tyVal });

              // Map to full screen Air Cursor
              const rx = txVal / width;
              const ry = tyVal / height;
              const fixedX = rx * window.innerWidth;
              const fixedY = ry * window.innerHeight;
              setVirtualCursor({ x: fixedX, y: fixedY });

              // Push coordinate history for gesture evaluation
              coordinateHistory.current.push({
                x: smoothedX.current,
                y: smoothedY.current,
                t: timestamp
              });

              // Prune history
              if (coordinateHistory.current.length > 25) {
                coordinateHistory.current.shift();
              }

              // Evaluate gestures on frame history
              detectGestures(timestamp);

              // 1. Calculate bounding box of moving pixels
              let minX = 80, maxX = 0, minY = 60, maxY = 0;
              for (let y = 0; y < 60; y++) {
                for (let x = 0; x < 80; x++) {
                  const idx = (y * 80 + x) * 4;
                  const deltaVal = Math.abs(curr[idx] - prev[idx]) + Math.abs(curr[idx + 1] - prev[idx + 1]) + Math.abs(curr[idx + 2] - prev[idx + 2]);
                  if (deltaVal > 85) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                  }
                }
              }

              // Measure motion spread in x direction
              const spreadX = maxX - minX;

              // 2. Track motion intensity to identify Z-axis push towards camera
              recentMotionPixels.current.push(motionPixels);
              if (recentMotionPixels.current.length > 8) {
                recentMotionPixels.current.shift();
              }
              const prevAvg = recentMotionPixels.current.slice(0, -1).reduce((a, b) => a + b, 0) / (recentMotionPixels.current.length - 1 || 1);
              const hasForwardThrust = recentMotionPixels.current.length >= 4 && motionPixels > prevAvg * 1.55 && motionPixels > 35;

              if (hasForwardThrust && !clickTriggered.current) {
                clickTriggered.current = true;
                performVirtualClick(fixedX, fixedY);
                addLog("Webcam: Detected rapid hand forward thrust! Triggering virtual click.");
              } else {
                // 3. Classify finger state: narrow region implies a single index finger raised
                if (spreadX > 0 && spreadX < 14 && motionPixels < 45) {
                  if (handPose !== "pointing" && handPose !== "clicking") {
                    setHandPose("pointing");
                    addLog("Webcam: Hand pose classified as Pointing Single Finger ☝️ (Click Mode Active).");
                    playBeep(480, 0.08, "sine");
                  }
                } else if (spreadX >= 14 || motionPixels >= 45) {
                  if (handPose !== "open") {
                    setHandPose("open");
                    addLog("Webcam: Hand pose classified as Open Hand 🖐️ (Hover/Scroll Mode Active).");
                    playBeep(320, 0.08, "sine");
                  }
                }
              }
            }
          }
          prevFrameRef.current = currentFrame;
        }
      } else {
        // Draw cybernetic starry tracking environment for Cursor trace mode
        ctx.fillStyle = "#09090b";
        ctx.fillRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = "rgba(99, 102, 241, 0.05)";
        ctx.lineWidth = 1.5;
        for (let x = 0; x < width; x += 30) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += 30) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        // Draw a simulated glowing floating target marker when idle
        if (Math.abs(coords.x - smoothedX.current) > 2 || Math.abs(coords.y - smoothedY.current) > 2) {
          smoothedX.current = smoothedX.current * 0.85 + coords.x * 0.15;
          smoothedY.current = smoothedY.current * 0.85 + coords.y * 0.15;
        }
      }

      // 2. Draw HUD UI elements on Canvas
      const tx = smoothedX.current;
      const ty = smoothedY.current;

      const rx = tx / (width || 1);
      const ry = ty / (height || 1);
      const fixedX = rx * window.innerWidth;
      const fixedY = ry * window.innerHeight;

      if (trackMode === "cursor") {
        setVirtualCursor({ x: fixedX, y: fixedY });
      }

      // Track dwell time for automatic click when holding single pointing finger steady
      if (handPose === "pointing") {
        const dist = Math.hypot(fixedX - lastCoordinates.current.x, fixedY - lastCoordinates.current.y);
        const now = performance.now();
        
        if (dist < 12) {
          if (now - lastCoordinates.current.time > 1200 && !clickTriggered.current) {
            clickTriggered.current = true;
            performVirtualClick(fixedX, fixedY);
          }
        } else {
          lastCoordinates.current = { x: fixedX, y: fixedY, time: now };
          clickTriggered.current = false;
        }
      } else {
        clickTriggered.current = false;
      }

      // Draw horizontal & vertical tracking crosshairs
      ctx.strokeStyle = trackMode === "webcam" ? "rgba(6, 182, 212, 0.2)" : "rgba(99, 102, 241, 0.25)";
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(width, ty); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx, height); ctx.stroke();

      // Outer target cursor
      ctx.strokeStyle = trackMode === "webcam" ? "rgba(6, 182, 212, 0.8)" : "rgba(139, 92, 246, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(tx, ty, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Inner tracking target circle
      ctx.fillStyle = trackMode === "webcam" ? "rgba(6, 182, 212, 0.3)" : "rgba(236, 72, 153, 0.3)";
      ctx.beginPath();
      ctx.arc(tx, ty, 6, 0, Math.PI * 2);
      ctx.fill();

      // Custom spatial HUD skeleton line (simulating arm/hand skeleton pointing connected to the wrist)
      const wristX = tx;
      const wristY = ty + 60;
      ctx.strokeStyle = trackMode === "webcam" ? "rgba(6, 182, 212, 0.3)" : "rgba(99, 102, 241, 0.3)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(width / 2, height); // base pivot node
      ctx.quadraticCurveTo(tx + 25, (wristY + height) / 2 + 10, wristX, wristY);
      ctx.stroke();

      // Draw high-fidelity interactive hand skeleton
      drawHandStructure(ctx, tx, ty, timestamp, trackMode);

      // Reticle base node
      ctx.fillStyle = trackMode === "webcam" ? "#06b6d4" : "#ec4899";
      ctx.beginPath(); ctx.arc(width / 2, height, 5, 0, Math.PI * 2); ctx.fill();

      // Smooth interactive scrolling based on up/down hand position
      const now = performance.now();
      const isTrackingActive = trackMode === "webcam" ? cameraActive : true;
      if (isTrackingActive && height > 0) {
        if (ty > 0 && ty < height * 0.28) {
          // Hand held high -> scroll page up smoothly
          window.scrollBy({ top: -4.5, behavior: "auto" });
          if (now - lastScrollLogTime.current > 1500) {
            addLog("Motion Command: Hand held HIGH ▲ Scrolling screen UP smoothly.");
            lastScrollLogTime.current = now;
          }

          // Draw a beautiful glowing interactive up-arrow indicator at the top center
          ctx.save();
          ctx.strokeStyle = trackMode === "webcam" ? "rgba(6, 182, 212, 0.9)" : "rgba(99, 102, 241, 0.9)";
          ctx.fillStyle = trackMode === "webcam" ? "rgba(6, 182, 212, 0.15)" : "rgba(99, 102, 241, 0.15)";
          ctx.lineWidth = 3;
          ctx.shadowColor = trackMode === "webcam" ? "rgba(6, 182, 212, 0.6)" : "rgba(99, 102, 241, 0.6)";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(width / 2 - 12, 35);
          ctx.lineTo(width / 2, 18);
          ctx.lineTo(width / 2 + 12, 35);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Connect tip to center stem
          ctx.beginPath();
          ctx.moveTo(width / 2, 18);
          ctx.lineTo(width / 2, 45);
          ctx.stroke();

          ctx.font = "bold 9px JetBrains Mono, sans-serif";
          ctx.fillStyle = trackMode === "webcam" ? "#22d3ee" : "#818cf8";
          ctx.textAlign = "center";
          ctx.fillText("HAND HIGH: SCROLLING UP", width / 2, 58);
          ctx.restore();
        } else if (ty > height * 0.72 && ty < height) {
          // Hand held low -> scroll page down smoothly
          window.scrollBy({ top: 4.5, behavior: "auto" });
          if (now - lastScrollLogTime.current > 1500) {
            addLog("Motion Command: Hand held LOW ▼ Scrolling screen DOWN smoothly.");
            lastScrollLogTime.current = now;
          }

          // Draw a beautiful glowing interactive down-arrow indicator at the bottom center
          ctx.save();
          ctx.strokeStyle = trackMode === "webcam" ? "rgba(6, 182, 212, 0.9)" : "rgba(99, 102, 241, 0.9)";
          ctx.fillStyle = trackMode === "webcam" ? "rgba(6, 182, 212, 0.15)" : "rgba(99, 102, 241, 0.15)";
          ctx.lineWidth = 3;
          ctx.shadowColor = trackMode === "webcam" ? "rgba(6, 182, 212, 0.6)" : "rgba(99, 102, 241, 0.6)";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(width / 2 - 12, height - 35);
          ctx.lineTo(width / 2, height - 18);
          ctx.lineTo(width / 2 + 12, height - 35);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Connect tip to center stem
          ctx.beginPath();
          ctx.moveTo(width / 2, height - 18);
          ctx.lineTo(width / 2, height - 45);
          ctx.stroke();

          ctx.font = "bold 9px JetBrains Mono, sans-serif";
          ctx.fillStyle = trackMode === "webcam" ? "#22d3ee" : "#818cf8";
          ctx.textAlign = "center";
          ctx.fillText("HAND LOW: SCROLLING DOWN", width / 2, height - 52);
          ctx.restore();
        }
      }

      // Draw 3x3 security lock nodes inside the canvas so hand tracker can hover connect them!
      drawPatternGridOnCanvas(ctx, width, height, tx, ty);

      // HUD Telemetry overlay text on canvas top left
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.font = "bold 9px JetBrains Mono, monospace";
      ctx.fillText(`TARGET: [X: ${Math.round(tx)}px | Y: ${Math.round(ty)}px]`, 10, 15);
      ctx.fillText(`SPATIAL LINK: ${trackMode.toUpperCase()}`, 10, 26);
      ctx.fillStyle = lastGesture !== "NONE" ? "#10b981" : "rgba(255,255,255,0.3)";
      ctx.fillText(`LAST GESTURE: ${lastGesture}`, 10, 37);

      ctx.restore();
    };

    render(0);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [trackMode, coords, patternNodes, isRecordingPattern, savedPattern]);

  // Calculate pattern node positions in 3x3 format
  const getGridPoints = (width: number, height: number) => {
    const startX = width * 0.22;
    const endX = width * 0.78;
    const startY = height * 0.22;
    const endY = height * 0.78;

    const points: { id: number; x: number; y: number }[] = [];
    let id = 0;
    for (let r = 0; r < 3; r++) {
      const y = startY + ((endY - startY) / 2) * r;
      for (let c = 0; c < 3; c++) {
        const x = startX + ((endX - startX) / 2) * c;
        points.push({ id, x, y });
        id++;
      }
    }
    return points;
  };

  // Connects lock pattern circles on the HUD
  const drawPatternGridOnCanvas = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    tx: number, 
    ty: number
  ) => {
    const points = getGridPoints(width, height);

    // Draw lines connecting tracked pattern nodes
    if (patternNodes.length > 0) {
      ctx.strokeStyle = isRecordingPattern ? "rgba(236, 72, 153, 0.85)" : "rgba(16, 185, 129, 0.85)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      
      patternNodes.forEach((nodeId, i) => {
        const pt = points.find(p => p.id === nodeId);
        if (pt) {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
      });

      // Draw active dragging line to current hand coordinates
      if (patternNodes.length > 0 && patternNodes.length < 9) {
        const lastNode = points.find(p => p.id === patternNodes[patternNodes.length - 1]);
        if (lastNode) {
          ctx.lineTo(tx, ty);
        }
      }
      ctx.stroke();
    }

    // Draw the 3x3 dots themselves
    points.forEach((pt) => {
      const isSelected = patternNodes.includes(pt.id);
      
      // Calculate distance to tracked target
      const dist = Math.hypot(tx - pt.x, ty - pt.y);
      const isHovered = dist < 22;

      // Handle hover trigger node adding
      if (isHovered && !isSelected) {
        // Must be currently drawing/mouse-dragging OR in gesture trace mode to trigger
        handleNodeIntersection(pt.id);
      }

      // Draw outer glowing halo
      if (isSelected) {
        ctx.strokeStyle = isRecordingPattern ? "rgba(236, 72, 153, 0.4)" : "rgba(16, 185, 129, 0.4)";
        ctx.lineWidth = 10;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2); ctx.stroke();
      } else if (isHovered) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2); ctx.stroke();
      }

      // Draw central circle
      ctx.fillStyle = isSelected
        ? (isRecordingPattern ? "#ec4899" : "#10b981")
        : "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Label index for helper debugging
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "8px monospace";
      ctx.fillText(String(pt.id + 1), pt.x - 3, pt.y - 10);
    });
  };

  const handleNodeIntersection = (nodeId: number) => {
    // Only accept adding nodes if we are recording, or if the app is currently LOCKED
    // and we are trying to unlock, or if the mouse is pressed/hover active.
    setPatternNodes((prev) => {
      if (prev.includes(nodeId)) return prev;
      
      // Play a satisfying high note on node connection!
      playBeep(320 + nodeId * 60, 0.08, "sine");
      return [...prev, nodeId];
    });
  };

  // Evaluate gesture swipes on webcam frame data
  const detectGestures = (timestamp: number) => {
    const history = coordinateHistory.current;
    if (history.length < 5) return; // Lower history length required for lightning-fast feedback

    const startFrame = history[0];
    const endFrame = history[history.length - 1];

    const dx = endFrame.x - startFrame.x;
    const dy = endFrame.y - startFrame.y;
    const dt = endFrame.t - startFrame.t;

    // Fast reaction time window
    if (dt > 400) return;

    // Smoother and lower distance threshold (42px) so users don't need exaggerated hand swings
    const minSwipeDist = 42;

    if (Math.abs(dy) > Math.abs(dx)) {
      if (dy > minSwipeDist && lastGesture !== "SWIPE_DOWN") {
        triggerGestureAction("SWIPE_DOWN");
      } else if (dy < -minSwipeDist && lastGesture !== "SWIPE_UP") {
        triggerGestureAction("SWIPE_UP");
      }
    } else {
      if (dx > minSwipeDist && lastGesture !== "SWIPE_RIGHT") {
        triggerGestureAction("SWIPE_RIGHT");
      } else if (dx < -minSwipeDist && lastGesture !== "SWIPE_LEFT") {
        triggerGestureAction("SWIPE_LEFT");
      }
    }
  };

  const triggerGestureAction = (gesture: string) => {
    setLastGesture(gesture);
    playBeep(gesture === "SWIPE_UP" ? 520 : 380, 0.15, "triangle");
    coordinateHistory.current = []; // Clear history to prevent multiple triggers

    if (gesture === "SWIPE_UP") {
      addLog(`Gesture Detected: SWIPE_UP 👆 Scrolling Reels down (Index ${activeReelIndex} -> ${Math.min(activeReelIndex + 1, SAMPLE_REELS.length - 1)})`);
      setActiveReelIndex((prev) => Math.min(prev + 1, SAMPLE_REELS.length - 1));
      if (onGestureAction) onGestureAction("SWIPE_UP");
    } else if (gesture === "SWIPE_DOWN") {
      addLog(`Gesture Detected: SWIPE_DOWN 👇 Scrolling Reels up (Index ${activeReelIndex} -> ${Math.max(activeReelIndex - 1, 0)})`);
      setActiveReelIndex((prev) => Math.max(prev - 1, 0));
      if (onGestureAction) onGestureAction("SWIPE_DOWN");
    } else if (gesture === "SWIPE_LEFT") {
      addLog(`Gesture Detected: SWIPE_LEFT 👈 INTERRUPTING om AI voice stream.`);
      if (onGestureAction) onGestureAction("SWIPE_LEFT");
    } else if (gesture === "SWIPE_RIGHT") {
      addLog(`Gesture Detected: SWIPE_RIGHT 👉 Raising om volume & mood boost.`);
      if (onGestureAction) onGestureAction("SWIPE_RIGHT");
    }

    // Auto-clear gesture display tag after 1.5 seconds
    setTimeout(() => {
      setLastGesture((curr) => curr === gesture ? "NONE" : curr);
    }, 1500);
  };

  // Cursor drag actions to draw lock patterns
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (trackMode !== "cursor") return;
    setPatternNodes([]);
    
    // Set current coordinates
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCoords({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (trackMode !== "cursor") return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCoords({ x, y });

      // Calculate simple mock swipe vectors on mouse-drag movement if not drawing patterns
      if (e.buttons === 1) {
        coordinateHistory.current.push({ x, y, t: performance.now() });
        if (coordinateHistory.current.length > 20) {
          coordinateHistory.current.shift();
        }
        detectGestures(performance.now());
      }
    }
  };

  const handleMouseUp = () => {
    if (patternNodes.length > 0) {
      evaluatePatternDrawing();
    }
    coordinateHistory.current = [];
  };

  // Handle mobile swipe and pattern drawing touch events
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (trackMode !== "cursor") return;
    setPatternNodes([]);
    const rect = canvasRef.current?.getBoundingClientRect();
    const touch = e.touches[0];
    if (rect && touch) {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      setCoords({ x, y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (trackMode !== "cursor") return;
    const rect = canvasRef.current?.getBoundingClientRect();
    const touch = e.touches[0];
    if (rect && touch) {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      setCoords({ x, y });

      coordinateHistory.current.push({ x, y, t: performance.now() });
      if (coordinateHistory.current.length > 20) {
        coordinateHistory.current.shift();
      }
      detectGestures(performance.now());
    }
  };

  const handleTouchEnd = () => {
    if (patternNodes.length > 0) {
      evaluatePatternDrawing();
    }
    coordinateHistory.current = [];
  };

  // Checks pattern draw success or records it
  const evaluatePatternDrawing = () => {
    if (patternNodes.length < 3) {
      setPatternFeedback({
        text: "Gesture pattern is too short! Connect at least 3 nodes.",
        type: "error"
      });
      playBeep(180, 0.25, "sawtooth");
      setPatternNodes([]);
      return;
    }

    if (isRecordingPattern) {
      // Record and save new lock pattern
      localStorage.setItem("om_gesture_lock_pattern", JSON.stringify(patternNodes));
      setSavedPattern(patternNodes);
      setIsRecordingPattern(false);
      setPatternFeedback({
        text: `Success! Recorded custom pattern: [${patternNodes.map(n => n + 1).join(" → ")}]`,
        type: "success"
      });
      addLog(`Security config updated: Saved custom gesture pattern: [${patternNodes.map(n => n + 1).join("-")}]`);
      playBeep(580, 0.15, "sine");
      setTimeout(() => playBeep(880, 0.25, "sine"), 120);
      setPatternNodes([]);
    } else {
      // Unlocking test
      const isMatch = JSON.stringify(patternNodes) === JSON.stringify(savedPattern);

      if (isMatch) {
        setPatternFeedback({
          text: "Correct Spatial Lock Pattern! Access Granted.",
          type: "success"
        });
        setIsAppLocked(false);
        addLog("Security status: CORRECT PATTERN drawn! om AI security shield disabled.");
        playBeep(640, 0.15, "sine");
        setTimeout(() => playBeep(960, 0.3, "sine"), 100);

        // Dispatch general event to trigger verbal celebration from assistant
        window.dispatchEvent(new CustomEvent("om-gesture-unlocked"));
      } else {
        setPatternFeedback({
          text: "Incorrect pattern! Try again, or reset it inside this tab.",
          type: "error"
        });
        addLog("Security alarm: Incorrect gesture lock pattern attempted.");
        playBeep(150, 0.35, "sawtooth");
      }
      setPatternNodes([]);
    }
  };

  const resetPatternToDefault = () => {
    const defaultPat = [0, 1, 2, 5, 8];
    localStorage.setItem("om_gesture_lock_pattern", JSON.stringify(defaultPat));
    setSavedPattern(defaultPat);
    setPatternNodes([]);
    setPatternFeedback({
      text: "Reset lock pattern to default L-shape (1 → 2 → 3 → 6 → 9)",
      type: "info"
    });
    addLog("Pattern lock reset to default L-shape.");
    playBeep(440, 0.15, "sine");
  };

  const initiateRecordPattern = () => {
    setIsRecordingPattern(true);
    setPatternNodes([]);
    setPatternFeedback({
      text: "Draw your new custom pattern connect-flow right now",
      type: "info"
    });
    addLog("Began recording custom pattern. Drag across nodes on the tracking canvas.");
    playBeep(440, 0.1, "sine");
  };

  return (
    <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-2xl space-y-5" id="om-vision-panel">
      {/* Panel Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
            <Eye className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>om Vision: Spatial Hand Controller</span>
              <span className="text-[9px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">Active HUD</span>
            </h4>
            <p className="text-[10.5px] text-gray-400">Control short video reels and draw custom lock patterns using mid-air hand-tracking or mouse trace</p>
          </div>
        </div>

        {/* Input Toggle selection */}
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 border border-white/5 rounded-xl shrink-0">
          <button
            onClick={() => setTrackMode("cursor")}
            className={`px-3 py-1 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
              trackMode === "cursor"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3 h-3 inline mr-1.5" /> Cursor/Touch Trace
          </button>
          <button
            onClick={() => setTrackMode("webcam")}
            className={`px-3 py-1 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
              trackMode === "webcam"
                ? "bg-cyan-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Camera className="w-3 h-3 inline mr-1.5" /> Webcam Tracker
          </button>
        </div>
      </div>

      {/* Main Two Column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Column: Tracking Viewport and Canvas (Take 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider flex items-center justify-between">
            <span>Tracking Viewport</span>
            {trackMode === "webcam" && (
              <span className="text-cyan-400 animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full inline-block" /> Live Camera Delta-Feed
              </span>
            )}
          </div>

          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 shadow-lg group">
            {/* Real Video element (Hidden/underneath, only analysed internally) */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
              playsInline
              muted
            />

            {/* High-visibility retro overlay HUD canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="absolute inset-0 w-full h-full block cursor-crosshair touch-none"
            />

            {/* Inactive Camera Overlay Info */}
            {trackMode === "webcam" && !cameraActive && (
              <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="w-8 h-8 text-cyan-400 mb-2 animate-bounce" />
                <span className="text-xs font-bold text-white">Starting Webcam Stream...</span>
                <p className="text-[10px] text-gray-500 max-w-xs mt-1">Please allow camera permissions if prompted. Frame comparison behaves 100% locally on your browser.</p>
              </div>
            )}

            {/* Cursor Guidance HUD */}
            {trackMode === "cursor" && (
              <div className="absolute top-2 right-2 bg-neutral-900/80 border border-white/5 px-2 py-1 rounded text-[9px] font-mono text-gray-400 pointer-events-none backdrop-blur-sm">
                💡 Drag/swipe mouse across dots
              </div>
            )}
          </div>

          {/* Quick swipe actions triggers for desktop testing without cameras */}
          <div className="bg-neutral-950/40 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
            <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Manual Gesture Trigger (Simulation)</span>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => triggerGestureAction("SWIPE_UP")}
                className="bg-white/5 hover:bg-white/10 text-white rounded-lg p-2.5 text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                title="Simulate waving hand upward"
              >
                <ChevronUp className="w-4 h-4 text-indigo-400" />
                <span>Swipe Up</span>
              </button>
              <button
                onClick={() => triggerGestureAction("SWIPE_DOWN")}
                className="bg-white/5 hover:bg-white/10 text-white rounded-lg p-2.5 text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                title="Simulate waving hand downward"
              >
                <ChevronDown className="w-4 h-4 text-indigo-400" />
                <span>Swipe Down</span>
              </button>
              <button
                onClick={() => triggerGestureAction("SWIPE_LEFT")}
                className="bg-white/5 hover:bg-white/10 text-white rounded-lg p-2.5 text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                title="Simulate waving hand left"
              >
                <ChevronUp className="w-4 h-4 -rotate-90 text-amber-400" />
                <span>Swipe Left</span>
              </button>
              <button
                onClick={() => triggerGestureAction("SWIPE_RIGHT")}
                className="bg-white/5 hover:bg-white/10 text-white rounded-lg p-2.5 text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                title="Simulate waving hand right"
              >
                <ChevronUp className="w-4 h-4 rotate-90 text-amber-400" />
                <span>Swipe Right</span>
              </button>
            </div>
          </div>

          {/* Holographic Air Cursor Controls Deck */}
          <div className="bg-neutral-950/40 border border-white/5 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Hand className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Holographic Air Cursor
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-[9.5px] font-mono text-gray-500">Cursor Overlay:</span>
                <input 
                  type="checkbox" 
                  checked={airCursorEnabled} 
                  onChange={(e) => {
                    setAirCursorEnabled(e.target.checked);
                    playBeep(e.target.checked ? 600 : 300, 0.15, "sine");
                    addLog(e.target.checked ? "System: Full-screen Air Cursor display activated." : "System: Full-screen Air Cursor display deactivated.");
                  }}
                  className="w-3.5 h-3.5 bg-neutral-900 border-white/10 rounded accent-cyan-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Hand Pose Selectors */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-gray-500 font-mono block text-left">Select Finger Pose State (Air Control Mode)</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setHandPose("open");
                    playBeep(320, 0.1, "sine");
                    addLog("Manual Control: Switched to Open Hand 🖐️ (Hover/Move Mode).");
                  }}
                  className={`py-2 px-2.5 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    handPose === "open"
                      ? "bg-cyan-500/15 border border-cyan-400/40 text-cyan-300"
                      : "bg-white/5 hover:bg-white/10 border border-transparent text-gray-400"
                  }`}
                >
                  <span>🖐️ Open Hand</span>
                </button>
                <button
                  onClick={() => {
                    setHandPose("pointing");
                    playBeep(480, 0.1, "sine");
                    addLog("Manual Control: Switched to Pointing Index Finger ☝️ (Click Mode Active).");
                  }}
                  className={`py-2 px-2.5 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    handPose === "pointing"
                      ? "bg-amber-500/15 border border-amber-400/40 text-amber-300"
                      : "bg-white/5 hover:bg-white/10 border border-transparent text-gray-400"
                  }`}
                >
                  <span>☝️ Pointing Finger</span>
                </button>
              </div>
            </div>

            {/* Click simulator trigger button */}
            <button
              onClick={() => {
                performVirtualClick(virtualCursor.x, virtualCursor.y);
              }}
              disabled={handPose !== "pointing"}
              className={`w-full py-2 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                handPose === "pointing"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40"
                  : "bg-neutral-800 text-gray-500 cursor-not-allowed border border-white/5"
              }`}
              title={handPose !== "pointing" ? "Raise a single finger (Pointing state) first to allow clicks!" : "Push click at the virtual cursor location"}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Click Towards Camera/Screen</span>
            </button>
            <p className="text-[9.5px] text-gray-500 leading-normal text-left">
              💡 <span className="font-semibold text-gray-400">Pro-Tip:</span> Move the hand on the canvas. Switch to <span className="text-amber-400 font-semibold text-xs">Pointing Finger ☝️</span>, then hover over any button inside this panel or applet. Hold it still for <span className="text-white font-mono font-bold">1.2s (Dwell)</span> or click the green button above to trigger an air-tap click!
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Simulator Widgets (Take 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Box A: Shorts / Video Reels Interactive Feed */}
            <div className="bg-neutral-950/60 border border-white/5 rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-pink-400" /> om Shorts Feed
                </span>
                <span className="text-[9px] bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 px-2 py-0.5 rounded font-mono">
                  Swipe Up/Down to Scroll
                </span>
              </div>

              {/* Looping Mini Video Mockup screen */}
              <div className="relative h-48 rounded-xl overflow-hidden shadow-inner flex flex-col justify-end p-3 text-left">
                {/* Animated colored canvas background simulating moving reels */}
                <div className={`absolute inset-0 bg-gradient-to-br ${SAMPLE_REELS[activeReelIndex].color} transition-all duration-500`} />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] mix-blend-overlay" />
                
                {/* Simulated playback bar indicator */}
                {reelsPlaying && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> PLAYING
                  </div>
                )}

                {/* Simulated User Profile & Details Overlay */}
                <div className="relative space-y-1 z-10">
                  <span className="text-[9px] font-mono font-bold text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded">
                    {SAMPLE_REELS[activeReelIndex].creator}
                  </span>
                  <p className="text-xs font-bold text-white leading-tight drop-shadow-md">
                    {SAMPLE_REELS[activeReelIndex].title}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {SAMPLE_REELS[activeReelIndex].tags.map((tag) => (
                      <span key={tag} className="text-[8.5px] text-white/70 font-mono">{tag}</span>
                    ))}
                  </div>
                  
                  {/* Feedback overlay */}
                  <div className="flex items-center justify-between text-[9.5px] text-white/60 font-semibold pt-1 border-t border-white/10 mt-2">
                    <span>❤️ {SAMPLE_REELS[activeReelIndex].likes} likes</span>
                    <span>💬 {SAMPLE_REELS[activeReelIndex].comments} replies</span>
                  </div>
                </div>
              </div>

              {/* Play Pause actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setReelsPlaying(!reelsPlaying);
                    playBeep(440, 0.1, "sine");
                  }}
                  className="bg-white/5 hover:bg-white/10 text-white flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  {reelsPlaying ? <Pause className="w-3 h-3 text-pink-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                  <span>{reelsPlaying ? "Pause Feed" : "Resume Play"}</span>
                </button>
              </div>
            </div>

            {/* Box B: Draw lock pattern setup */}
            <div className="bg-neutral-950/60 border border-white/5 rounded-xl p-4 space-y-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> Pattern Security Lock
                </span>
                <span className="text-[10px] font-mono text-white/70 font-bold">
                  {isAppLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}
                </span>
              </div>

              {/* Status and instruction */}
              <div className={`p-2.5 rounded-lg border text-center ${
                patternFeedback.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  : patternFeedback.type === "error"
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
                  : "bg-white/5 border-white/5 text-gray-400"
              }`}>
                <p className="text-[10px] leading-snug font-medium">
                  {patternFeedback.text}
                </p>
              </div>

              {/* Locking operations triggers */}
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    const nextState = !isAppLocked;
                    setIsAppLocked(nextState);
                    playBeep(nextState ? 180 : 600, 0.25, "triangle");
                    addLog(nextState ? "System safety: APPLIED SECURITY LOCK." : "System safety: BYPASSED SECURITY LOCK.");
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                    isAppLocked
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10"
                      : "bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-300"
                  }`}
                >
                  {isAppLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isAppLocked ? "Deactivate App Lock" : "Secure/Lock om Assistant"}</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={initiateRecordPattern}
                    className="bg-white/5 hover:bg-white/10 text-white py-1.5 px-2 rounded-lg text-[9.5px] font-bold transition-all border border-white/5 cursor-pointer"
                    disabled={isRecordingPattern}
                  >
                    Set New Pattern
                  </button>
                  <button
                    onClick={resetPatternToDefault}
                    className="bg-white/5 hover:bg-white/10 text-white py-1.5 px-2 rounded-lg text-[9.5px] font-bold transition-all border border-white/5 cursor-pointer"
                  >
                    Reset Default
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Running Hand Movement Event Logs */}
          <div className="bg-neutral-950/80 border border-white/5 rounded-xl p-3 space-y-1.5">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block text-left">Live Hand-to-Voice Telemetry Logs</span>
            <div className="bg-neutral-950/80 rounded-lg p-2.5 h-24 overflow-y-auto border border-white/5 font-mono text-[9.5px] text-gray-400 space-y-1 no-scrollbar text-left select-none">
              {gestureLogs.map((log, idx) => (
                <div key={idx} className="truncate border-l-2 border-indigo-500/40 pl-1.5 py-0.5 hover:bg-white/5 transition-colors">
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Holographic Full-Screen Air Cursor Overlay */}
      {airCursorEnabled && (
        <div 
          style={{ 
            left: `${virtualCursor.x}px`, 
            top: `${virtualCursor.y}px`,
            transform: "translate(-50%, -50%)",
            zIndex: 99999
          }}
          className="fixed pointer-events-none transition-transform duration-75 ease-out select-none"
        >
          <div className="relative flex items-center justify-center">
            {/* Pulsing Target Reticle */}
            <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              handPose === "clicking" 
                ? "border-emerald-400 bg-emerald-500/20 scale-125 shadow-[0_0_15px_rgba(52,211,153,0.7)]" 
                : handPose === "pointing"
                ? "border-amber-400 bg-amber-500/5 shadow-[0_0_12px_rgba(251,191,36,0.5)] animate-pulse"
                : "border-cyan-400 bg-cyan-500/5 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
            }`}>
              {/* Center point core */}
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-150 ${
                handPose === "clicking" ? "bg-emerald-400 scale-75" : handPose === "pointing" ? "bg-amber-400 scale-115" : "bg-cyan-400"
              }`} />

              {/* Status Labels */}
              {handPose === "pointing" && (
                <span className="absolute -top-7 bg-amber-500/95 text-black font-mono font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow-lg tracking-wider flex items-center gap-1">
                  ☝️ PRESS READY
                </span>
              )}
              {handPose === "clicking" && (
                <span className="absolute -top-7 bg-emerald-500 text-black font-mono font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow-lg tracking-wider flex items-center gap-1">
                  🎯 AIR CLICK!
                </span>
              )}
            </div>

            {/* Glowing HUD scope lines */}
            <div className={`absolute w-14 h-[1px] transition-all duration-200 ${handPose === "pointing" ? "bg-amber-400/40" : handPose === "clicking" ? "bg-emerald-400/60" : "bg-cyan-400/30"}`} />
            <div className={`absolute h-14 w-[1px] transition-all duration-200 ${handPose === "pointing" ? "bg-amber-400/40" : handPose === "clicking" ? "bg-emerald-400/60" : "bg-cyan-400/30"}`} />
          </div>
        </div>
      )}

      {/* Cybernetic click ripple feedback animation */}
      <AnimatePresence>
        {clickRipple.show && (
          <motion.div
            initial={{ scale: 0.1, opacity: 0.9 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{ 
              left: `${clickRipple.x}px`, 
              top: `${clickRipple.y}px`,
              transform: "translate(-50%, -50%)",
              zIndex: 99998
            }}
            className="fixed pointer-events-none w-16 h-16 rounded-full border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.5)]"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-400/35" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
