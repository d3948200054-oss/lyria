import React, { useState, useRef, useEffect } from "react";
import { Terminal, Play, CheckCircle2, AlertCircle, Copy, HelpCircle, FileText, ChevronRight, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LogEntry {
  id: string;
  type: "input" | "success" | "error" | "system";
  timestamp: string;
  text: string;
}

interface CommandCenterProps {
  onExecuteVoiceCommand?: (cmd: string) => void;
}

export default function CommandCenter({ onExecuteVoiceCommand }: CommandCenterProps) {
  const [commandInput, setCommandInput] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "1",
      type: "system",
      timestamp: new Date().toLocaleTimeString(),
      text: "om Command & Control Console v1.0.0 initialized successfully."
    },
    {
      id: "2",
      type: "system",
      timestamp: new Date().toLocaleTimeString(),
      text: "Type 'help' to see available automation commands."
    }
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [notepadContent, setNotepadContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingProgress, setTypingProgress] = useState("");
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll terminal log to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Audio click sound generator (Web Audio API)
  const playClickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Quick mechanical key click sound
      osc.type = "sine";
      osc.frequency.setValueAtTime(450 + Math.random() * 150, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  // Run shell command on the server via API
  const runServerCommand = async (bashCmd: string) => {
    try {
      const res = await fetch("/api/run-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: bashCmd })
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { error: err.message || "Failed to contact command execution endpoint" };
    }
  };

  // Simulate typewriter typing with keyboard clicks
  const simulateTyping = (textToType: string) => {
    setIsTyping(true);
    setNotepadContent("");
    let currentIdx = 0;
    
    const interval = setInterval(() => {
      if (currentIdx < textToType.length) {
        const nextChar = textToType[currentIdx];
        setNotepadContent((prev) => prev + nextChar);
        playClickSound();
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        addLog("system", `Auto-typed text: "${textToType.substring(0, 30)}${textToType.length > 30 ? "..." : ""}" into notepad canvas.`);
      }
    }, 60); // 60ms per character for satisfying fast typing speed
  };

  const addLog = (type: LogEntry["type"], text: string) => {
    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date().toLocaleTimeString(),
      text
    };
    setLogs((prev) => [...prev, newEntry]);
  };

  // Listen for voice-triggered automation commands from om
  useEffect(() => {
    const handleVoiceCommand = (e: any) => {
      if (e.detail) {
        handleExecuteCommand(e.detail);
      }
    };
    window.addEventListener("om-voice-command", handleVoiceCommand);
    return () => {
      window.removeEventListener("om-voice-command", handleVoiceCommand);
    };
  }, [notepadContent, logs, isExecuting]);

  // Main Command Handler
  const handleExecuteCommand = async (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    setCommandInput("");
    addLog("input", cmd);
    setIsExecuting(true);

    const lowerCmd = cmd.toLowerCase();

    // 1. HELP command
    if (lowerCmd === "help") {
      addLog("system", `Available Commands:
- open <url>          : Open any website in a new window/tab (e.g. "open youtube.com")
- run <bash_cmd>      : Run any shell command on the server (e.g. "run node -v" or "run ls")
- type <text>         : Type text into the simulated notepad with mechanical key sounds
- clear               : Clear the terminal logs`);
      setIsExecuting(false);
      return;
    }

    // 2. CLEAR command
    if (lowerCmd === "clear") {
      setLogs([]);
      setIsExecuting(false);
      return;
    }

    // 3. OPEN command
    if (lowerCmd.startsWith("open ")) {
      const target = cmd.substring(5).trim();
      let url = target;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      try {
        addLog("system", `Opening target: "${target}" in a new window...`);
        window.open(url, "_blank", "noopener,noreferrer");
        addLog("success", `Successfully launched window for: ${url}`);
      } catch (err: any) {
        addLog("error", `Failed to open window: ${err.message}`);
      }
      setIsExecuting(false);
      return;
    }

    // 4. RUN command
    if (lowerCmd.startsWith("run ")) {
      const bashCmd = cmd.substring(4).trim();
      addLog("system", `Running server-side shell command: "${bashCmd}"...`);
      const result = await runServerCommand(bashCmd);
      
      if (result.error) {
        addLog("error", `Command execution failed: ${result.error}`);
      } else {
        if (result.stdout) {
          addLog("success", `STDOUT:\n${result.stdout}`);
        }
        if (result.stderr) {
          addLog("error", `STDERR:\n${result.stderr}`);
        }
        if (!result.stdout && !result.stderr) {
          addLog("success", `Command executed with return code: ${result.code}`);
        }
      }
      setIsExecuting(false);
      return;
    }

    // 5. TYPE command
    if (lowerCmd.startsWith("type ")) {
      const textToType = cmd.substring(5).trim();
      addLog("system", `Typing text in notepad: "${textToType.substring(0, 25)}..."`);
      simulateTyping(textToType);
      setIsExecuting(false);
      return;
    }

    // Fallback: If not formatted, see if we can run it as a standard bash command or ask help
    addLog("error", `Unknown command pattern. For bash commands, prefix with 'run ' (e.g., 'run ls'). Type 'help' for support.`);
    setIsExecuting(false);
  };

  return (
    <div className="w-full bg-neutral-900/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md flex flex-col md:flex-row gap-4" id="command-center-widget">
      
      {/* Left panel: Terminal & Input */}
      <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">Executive Command Console</h4>
              <p className="text-[9px] text-gray-500">om's Automated System Controller</p>
            </div>
          </div>
          <button 
            onClick={() => setLogs([])}
            className="p-1 hover:bg-white/5 text-gray-500 hover:text-gray-300 rounded-md transition-colors"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Console logs */}
        <div className="flex-1 bg-black/60 rounded-xl p-3 border border-white/5 font-mono text-[11px] leading-relaxed overflow-y-auto max-h-[220px] scrollbar-thin scrollbar-thumb-white/5">
          <div className="space-y-2">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className={`whitespace-pre-wrap ${
                  log.type === "input"
                    ? "text-indigo-300"
                    : log.type === "success"
                    ? "text-emerald-400 font-medium"
                    : log.type === "error"
                    ? "text-red-400 font-semibold"
                    : "text-gray-400"
                }`}
              >
                <span className="text-[9px] text-gray-600 mr-2 select-none">[{log.timestamp}]</span>
                {log.type === "input" && <span className="text-indigo-500 mr-1.5 select-none">$</span>}
                {log.text}
              </div>
            ))}
            {isExecuting && (
              <div className="text-indigo-400/80 animate-pulse flex items-center gap-1.5">
                <span className="text-[9px] text-gray-600 mr-2 select-none">[{new Date().toLocaleTimeString()}]</span>
                <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>Executing instruction...</span>
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Input box */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteCommand(commandInput);
          }}
          className="flex bg-black/40 border border-white/10 rounded-xl p-1.5 items-center gap-2"
        >
          <span className="text-indigo-500 font-mono text-xs pl-2 select-none">$</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Type 'help', 'open youtube.com', 'run node -v'..."
            className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-gray-600"
            disabled={isExecuting}
          />
          <button
            type="submit"
            disabled={isExecuting || !commandInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-gray-600 text-white p-1.5 rounded-lg transition-all cursor-pointer shadow-md shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Right panel: Simulated Notepad (Automatic typing display) */}
      <div className="w-full md:w-[280px] flex flex-col gap-3 min-h-[200px] border-t md:border-t-0 md:border-l border-white/5 md:pl-4">
        <div className="flex items-center gap-2 pb-2">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">Simulated Notepad Canvas</h4>
            <p className="text-[9px] text-gray-500">Auto-typing character renderer</p>
          </div>
        </div>

        {/* Notepad Display Screen */}
        <div className="flex-1 bg-neutral-950/60 rounded-xl p-3 border border-white/5 font-mono text-xs leading-relaxed relative min-h-[140px] flex flex-col">
          <div className="text-[9px] text-gray-600 absolute top-2 right-2 flex items-center gap-1">
            {isTyping && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />}
            <span>{isTyping ? "typing..." : "idle"}</span>
          </div>
          
          <div className="flex-1 text-gray-300 whitespace-pre-wrap select-all py-1 max-h-[160px] overflow-y-auto">
            {notepadContent || <span className="text-gray-700 italic select-none">No text typed yet. Execute "type [text]" to begin!</span>}
            {isTyping && <span className="inline-block w-1.5 h-3.5 bg-indigo-400 ml-0.5 animate-pulse" />}
          </div>
        </div>

        {/* Preset commands quick rail */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Quick Presets</span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "Check Server", cmd: "run node -v" },
              { label: "List Files", cmd: "run ls" },
              { label: "Open Youtube", cmd: "open youtube.com" },
              { label: "Type Quote", cmd: "type om is the best AI assistant ever! Cheers mate!" }
            ].map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleExecuteCommand(btn.cmd)}
                className="py-1 px-2 rounded-lg bg-white/[0.02] border border-white/5 text-[9px] text-left text-gray-400 hover:text-white hover:bg-indigo-600/10 hover:border-indigo-500/20 transition-all cursor-pointer truncate font-mono"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
