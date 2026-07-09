import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, Send, Check, Copy, Plus, Trash2, User, Mail, Phone, 
  ArrowRight, ExternalLink, FileText, Sparkles, Clock, Smartphone, CheckCircle2,
  MessageCircle, HelpCircle, Share2, AlertCircle
} from "lucide-react";
import { MessageDraft } from "../types";

// Dynamic platform configurations with specific styling, brand colors, and URL schemas
const PLATFORMS = {
  whatsapp: {
    name: "WhatsApp",
    color: "bg-[#25D366]",
    borderColor: "border-[#25D366]/30",
    textColor: "text-[#25D366]",
    glowColor: "shadow-[#25D366]/20",
    bubbleBg: "bg-[#d9fdd3] text-neutral-800 self-end",
    placeholderPhone: "919876543210 (with country code)",
    icon: MessageCircle,
    hint: "Opens WhatsApp Web or App with pre-filled message",
    getUrl: (msg: string, contact?: string) => {
      const cleanPhone = contact ? contact.replace(/\+/g, "").replace(/\s/g, "") : "";
      return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
    }
  },
  telegram: {
    name: "Telegram",
    color: "bg-[#0088cc]",
    borderColor: "border-[#0088cc]/30",
    textColor: "text-[#0088cc]",
    glowColor: "shadow-[#0088cc]/20",
    bubbleBg: "bg-[#17212b] text-white border border-[#2b394a] self-end",
    placeholderPhone: "username or group_link",
    icon: Send,
    hint: "Opens Telegram App sharing window with pre-filled text",
    getUrl: (msg: string, contact?: string) => {
      return `https://t.me/share/url?url=&text=${encodeURIComponent(msg)}`;
    }
  },
  gmail: {
    name: "Gmail / Email",
    color: "bg-[#EA4335]",
    borderColor: "border-[#EA4335]/30",
    textColor: "text-[#EA4335]",
    glowColor: "shadow-[#EA4335]/20",
    bubbleBg: "bg-neutral-900 text-neutral-100 border border-neutral-800 self-end",
    placeholderPhone: "example@gmail.com",
    icon: Mail,
    hint: "Launches default email composer with pre-filled body",
    getUrl: (msg: string, contact?: string) => {
      const cleanEmail = contact ? contact.trim() : "";
      return `mailto:${cleanEmail}?subject=${encodeURIComponent("Message composed by om AI")}&body=${encodeURIComponent(msg)}`;
    }
  },
  sms: {
    name: "SMS / Text",
    color: "bg-[#0b84fe]",
    borderColor: "border-[#0b84fe]/30",
    textColor: "text-[#0b84fe]",
    glowColor: "shadow-[#0b84fe]/20",
    bubbleBg: "bg-[#0b84fe] text-white self-end",
    placeholderPhone: "+15551234567",
    icon: Smartphone,
    hint: "Launches mobile text messenger with pre-filled SMS text",
    getUrl: (msg: string, contact?: string) => {
      const cleanPhone = contact ? contact.trim() : "";
      return `sms:${cleanPhone}?body=${encodeURIComponent(msg)}`;
    }
  },
  discord: {
    name: "Discord",
    color: "bg-[#5865F2]",
    borderColor: "border-[#5865F2]/30",
    textColor: "text-[#5865F2]",
    glowColor: "shadow-[#5865F2]/20",
    bubbleBg: "bg-[#40444b] text-neutral-100 self-start",
    placeholderPhone: "Optional handle",
    icon: MessageSquare,
    hint: "Copies to clipboard optimized for Discord markdown",
    getUrl: null
  },
  slack: {
    name: "Slack",
    color: "bg-[#4A154B]",
    borderColor: "border-[#4A154B]/30",
    textColor: "text-[#4A154B]",
    glowColor: "shadow-[#4A154B]/20",
    bubbleBg: "bg-[#f8f8f8] border border-neutral-200 text-neutral-800 self-start",
    placeholderPhone: "Optional member ID",
    icon: MessageSquare,
    hint: "Copies to clipboard optimized for Slack formatting",
    getUrl: null
  },
  imessage: {
    name: "iMessage",
    color: "bg-[#34C759]",
    borderColor: "border-[#34C759]/30",
    textColor: "text-[#34C759]",
    glowColor: "shadow-[#34C759]/20",
    bubbleBg: "bg-[#34c759] text-white self-end",
    placeholderPhone: "Apple ID or Phone",
    icon: Smartphone,
    hint: "Launches iMessage window if supported on Apple devices",
    getUrl: (msg: string, contact?: string) => {
      const cleanContact = contact ? contact.trim() : "";
      return `sms:${cleanContact}&body=${encodeURIComponent(msg)}`;
    }
  },
  generic: {
    name: "Generic / Copier",
    color: "bg-indigo-500",
    borderColor: "border-indigo-500/30",
    textColor: "text-indigo-400",
    glowColor: "shadow-indigo-500/20",
    bubbleBg: "bg-indigo-950/40 border border-indigo-500/30 text-indigo-100 self-end",
    placeholderPhone: "N/A",
    icon: FileText,
    hint: "Copy and share with any device text clipboard",
    getUrl: null
  }
};

export default function MessengerHub() {
  const [drafts, setDrafts] = useState<MessageDraft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Active fields for the editor
  const [recipient, setRecipient] = useState("");
  const [messageText, setMessageText] = useState("");
  const [platform, setPlatform] = useState<keyof typeof PLATFORMS>("whatsapp");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [showDirectNotification, setShowDirectNotification] = useState(false);

  // Load message logs from local storage
  useEffect(() => {
    const saved = localStorage.getItem("om_message_drafts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDrafts(parsed);
        if (parsed.length > 0) {
          setSelectedId(parsed[0].id);
          setRecipient(parsed[0].recipient);
          setMessageText(parsed[0].message);
          setPlatform(parsed[0].platform || "whatsapp");
          setPhoneOrEmail(parsed[0].phoneOrEmail || "");
        }
      } catch (e) {
        console.warn("Failed to load message drafts", e);
      }
    } else {
      // Seed initial dummy sample for nice initial state
      const seedDrafts: MessageDraft[] = [
        {
          id: "seed-1",
          recipient: "Bhaiya",
          message: "Bhai, main thoda late ho jaunga office se. Khana kha lena, wait mat karna! 👍",
          platform: "whatsapp",
          phoneOrEmail: "",
          createdAt: new Date().toISOString(),
          status: "draft"
        },
        {
          id: "seed-2",
          recipient: "Team Lead",
          message: "Hello sir, I have resolved the server build blocker. Preparing deployment now.",
          platform: "slack",
          phoneOrEmail: "",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          status: "sent"
        }
      ];
      setDrafts(seedDrafts);
      localStorage.setItem("om_message_drafts", JSON.stringify(seedDrafts));
      setSelectedId("seed-1");
      setRecipient("Bhaiya");
      setMessageText("Bhai, main thoda late ho jaunga office se. Khana kha lena, wait mat karna! 👍");
      setPlatform("whatsapp");
    }
  }, []);

  // Listen for global custom message-drafting events dispatched by om AI
  useEffect(() => {
    const handleDraftEvent = (e: any) => {
      const detail = e.detail;
      if (detail && detail.message) {
        const newDraft: MessageDraft = {
          id: crypto.randomUUID(),
          recipient: detail.recipient || "Someone",
          message: detail.message,
          platform: detail.platform || "whatsapp",
          phoneOrEmail: detail.phoneOrEmail || "",
          createdAt: new Date().toISOString(),
          status: "draft"
        };

        setDrafts(prev => {
          const updated = [newDraft, ...prev];
          localStorage.setItem("om_message_drafts", JSON.stringify(updated));
          return updated;
        });

        setSelectedId(newDraft.id);
        setRecipient(newDraft.recipient);
        setMessageText(newDraft.message);
        setPlatform(newDraft.platform);
        setPhoneOrEmail(newDraft.phoneOrEmail);
        
        // Open notification & play beep
        setShowDirectNotification(true);
        playNotifySound();
        setTimeout(() => setShowDirectNotification(false), 5000);
      }
    };

    window.addEventListener("om-draft-message", handleDraftEvent);
    return () => {
      window.removeEventListener("om-draft-message", handleDraftEvent);
    };
  }, []);

  // Listen for voice-triggered send/copy actions
  useEffect(() => {
    const handleVoiceSendTrigger = () => {
      handleSendTrigger();
    };
    window.addEventListener("om-trigger-send", handleVoiceSendTrigger);
    return () => {
      window.removeEventListener("om-trigger-send", handleVoiceSendTrigger);
    };
  }, [platform, messageText, phoneOrEmail, selectedId, drafts]);

  const playNotifySound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const playCopySound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {}
  };

  const handleSelectDraft = (draft: MessageDraft) => {
    setSelectedId(draft.id);
    setRecipient(draft.recipient);
    setMessageText(draft.message);
    setPlatform(draft.platform);
    setPhoneOrEmail(draft.phoneOrEmail || "");
  };

  const handleSaveCurrent = () => {
    if (!recipient.trim() || !messageText.trim()) return;

    let updated: MessageDraft[] = [];
    if (selectedId && drafts.some(d => d.id === selectedId)) {
      updated = drafts.map(d => 
        d.id === selectedId 
          ? { ...d, recipient, message: messageText, platform, phoneOrEmail } 
          : d
      );
    } else {
      const newDraft: MessageDraft = {
        id: crypto.randomUUID(),
        recipient,
        message: messageText,
        platform,
        phoneOrEmail,
        createdAt: new Date().toISOString(),
        status: "draft"
      };
      updated = [newDraft, ...drafts];
      setSelectedId(newDraft.id);
    }

    setDrafts(updated);
    localStorage.setItem("om_message_drafts", JSON.stringify(updated));
    playCopySound();
  };

  const handleNewDraft = () => {
    setSelectedId(null);
    setRecipient("");
    setMessageText("");
    setPlatform("whatsapp");
    setPhoneOrEmail("");
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    localStorage.setItem("om_message_drafts", JSON.stringify(updated));
    if (selectedId === id) {
      if (updated.length > 0) {
        handleSelectDraft(updated[0]);
      } else {
        handleNewDraft();
      }
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(messageText);
    setCopyStatus("copied");
    playCopySound();
    setTimeout(() => setCopyStatus("idle"), 2000);

    // Update status to sent if draft
    if (selectedId) {
      const updated = drafts.map(d => d.id === selectedId ? { ...d, status: "sent" as const } : d);
      setDrafts(updated);
      localStorage.setItem("om_message_drafts", JSON.stringify(updated));
    }
  };

  const handleSendTrigger = () => {
    const config = PLATFORMS[platform];
    if (!config.getUrl) {
      // Just copy to clipboard for apps without direct URL schemas
      handleCopyToClipboard();
      return;
    }

    const targetUrl = config.getUrl(messageText, phoneOrEmail);
    window.open(targetUrl, "_blank", "noopener,noreferrer");

    // Mark as sent
    if (selectedId) {
      const updated = drafts.map(d => d.id === selectedId ? { ...d, status: "sent" as const } : d);
      setDrafts(updated);
      localStorage.setItem("om_message_drafts", JSON.stringify(updated));
    }
  };

  const activeConfig = PLATFORMS[platform];
  const ActivePlatformIcon = activeConfig.icon;

  return (
    <div className="w-full space-y-6" id="messenger-hub-root">
      
      {/* Floating Alert for Auto-Drafted messages */}
      <AnimatePresence>
        {showDirectNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 right-10 z-50 bg-[#128C7E] border border-emerald-500/30 p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-white max-w-sm"
          >
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse shrink-0" />
            <div className="text-left">
              <h5 className="text-xs font-bold font-sans">om Auto-Drafted a Message!</h5>
              <p className="text-[10px] text-emerald-100 mt-0.5">
                Saved a draft for <strong className="text-white">{recipient}</strong>. Check it in the Messaging Hub!
              </p>
            </div>
            <button 
              onClick={() => setShowDirectNotification(false)}
              className="ml-auto text-emerald-200 hover:text-white text-xs font-bold px-2 py-1 hover:bg-white/10 rounded"
            >
              Okay
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Draft Logs / History Column */}
        <div className="w-full lg:w-72 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider font-bold">Drafts & Sent History</span>
            <button
              onClick={handleNewDraft}
              className="p-1 px-2.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 text-[10px] font-bold text-indigo-400 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Create New</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[350px] lg:max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5">
            {drafts.length === 0 ? (
              <div className="p-4 border border-white/5 rounded-xl bg-white/[0.01] text-center text-xs text-gray-500 italic">
                No message logs. Speak to om to draft something automatically!
              </div>
            ) : (
              drafts.map((draft) => {
                const config = PLATFORMS[draft.platform || "whatsapp"];
                const PlatformIcon = config.icon;
                return (
                  <button
                    key={draft.id}
                    onClick={() => handleSelectDraft(draft)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group relative cursor-pointer ${
                      selectedId === draft.id
                        ? "bg-neutral-900 border-indigo-500/40 shadow-lg shadow-black/35"
                        : "bg-neutral-950/40 border-white/5 hover:bg-neutral-900/50 hover:border-white/10"
                    }`}
                  >
                    {/* Platform Dot Indicator */}
                    <div className={`p-2 rounded-lg ${config.color} text-white shrink-0 shadow-sm`}>
                      <PlatformIcon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{draft.recipient || "Someone"}</span>
                        <span className="text-[9px] text-gray-500 whitespace-nowrap">
                          {new Date(draft.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5 leading-relaxed font-sans">
                        {draft.message}
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-2">
                        {draft.status === "sent" ? (
                          <span className="text-[8px] bg-emerald-500/15 text-emerald-400 font-mono px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> SENT/SHARED
                          </span>
                        ) : (
                          <span className="text-[8px] bg-amber-500/15 text-amber-400 font-mono px-1.5 py-0.5 rounded">DRAFT</span>
                        )}
                        <span className="text-[8px] text-gray-500 font-mono lowercase">
                          via {config.name}
                        </span>
                      </div>
                    </div>

                    {/* Delete button hidden by default, shown on hover */}
                    <button
                      onClick={(e) => handleDeleteDraft(draft.id, e)}
                      className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 bg-neutral-950 hover:bg-red-500/20 text-gray-500 hover:text-red-400 border border-white/5 rounded-md transition-all"
                      title="Delete log"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center: Composition Editor */}
        <div className="flex-1 bg-neutral-900/35 border border-white/5 rounded-2xl p-5 backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">Dynamic Message Composer</h4>
              <p className="text-[9px] text-gray-500">Auto-generated platform message matching user intent</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recipient Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-gray-400 font-mono uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-indigo-400" /> Recipient Name
              </label>
              <input
                type="text"
                placeholder="e.g. Bhaiya, Team Lead, Priya, Dad"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            {/* Target Contact detail (Phone or Email) */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-gray-400 font-mono uppercase tracking-wider flex items-center gap-1">
                {platform === "gmail" ? (
                  <Mail className="w-3 h-3 text-red-400" />
                ) : (
                  <Phone className="w-3 h-3 text-emerald-400" />
                )}
                {platform === "gmail" ? "Recipient Email" : "Recipient Phone Number"}
              </label>
              <input
                type="text"
                placeholder={activeConfig.placeholderPhone}
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Platform Selector Grid */}
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Select Messaging Platform</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(PLATFORMS).map(([key, config]) => {
                const IconComp = config.icon;
                const isSelected = platform === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPlatform(key as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? `bg-neutral-900 border-white/10 shadow-lg ${config.glowColor} ${config.textColor}`
                        : "bg-neutral-950/40 border-white/5 hover:bg-neutral-950 hover:border-white/10 text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? config.color + " text-white shadow-sm" : "bg-neutral-900 text-gray-400"}`}>
                      <IconComp className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] font-bold font-sans tracking-wide truncate">{config.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Textarea */}
          <div className="space-y-1.5 text-left flex-1 flex flex-col">
            <label className="text-[10px] text-gray-400 font-mono uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3 text-pink-400" /> Composed Message Content
            </label>
            <textarea
              placeholder="Aapka message yahan aayega, bhai. Ask om to write or edit it!"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={5}
              className="w-full flex-1 min-h-[140px] p-3.5 bg-neutral-950/80 border border-white/10 rounded-xl text-xs text-white leading-relaxed focus:outline-none focus:border-indigo-500/50 transition-colors font-sans"
            />
            <div className="flex items-center justify-between mt-1 text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span>{activeConfig.hint}</span>
              </span>
              <span>{messageText.length} characters</span>
            </div>
          </div>

          {/* Interactive Button Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/5 pt-4">
            <button
              onClick={handleSaveCurrent}
              disabled={!recipient.trim() || !messageText.trim()}
              className="px-4 py-2 bg-neutral-950 border border-white/10 hover:border-indigo-500/30 hover:bg-neutral-900 text-gray-300 hover:text-indigo-400 disabled:opacity-50 disabled:border-white/5 disabled:text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Save Progress
            </button>
            
            <button
              onClick={handleCopyToClipboard}
              disabled={!messageText.trim()}
              className="px-4 py-2 bg-neutral-950 border border-white/10 hover:border-emerald-500/30 hover:bg-neutral-900 text-gray-300 hover:text-emerald-400 disabled:opacity-50 disabled:border-white/5 disabled:text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copyStatus === "copied" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text Only</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendTrigger}
              disabled={!messageText.trim()}
              className={`px-5 py-2 ${activeConfig.color} text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 hover:brightness-110 disabled:opacity-50 cursor-pointer`}
            >
              <ActivePlatformIcon className="w-4 h-4 shrink-0" />
              <span>{activeConfig.getUrl ? `Send via ${activeConfig.name}` : `Copy optimized for ${activeConfig.name}`}</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Device Mockup (Previews dynamic speech bubble) */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider font-bold block text-left">Live Chat Preview</span>

            {/* Simulated Phone Shell */}
            <div className="w-full max-w-[260px] mx-auto border-4 border-neutral-800 rounded-[30px] bg-neutral-950 aspect-[9/16] overflow-hidden flex flex-col shadow-2xl relative">
              {/* Phone Camera Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-neutral-800 rounded-full z-20 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-neutral-950 rounded-full" />
              </div>

              {/* Chat App Shell Header */}
              <div className={`pt-7 pb-2 px-3 flex items-center gap-2 border-b border-white/5 ${platform === 'whatsapp' ? 'bg-[#075e54]' : platform === 'telegram' ? 'bg-[#182533]' : platform === 'discord' ? 'bg-[#2f3136]' : 'bg-neutral-900'} text-white`}>
                <div className="w-7 h-7 bg-neutral-700 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase border border-white/10 shrink-0">
                  {recipient ? recipient.substring(0, 2) : "SB"}
                </div>
                <div className="text-left min-w-0 flex-1">
                  <h5 className="text-[10px] font-bold text-white truncate leading-tight">{recipient || "Recipient"}</h5>
                  <p className="text-[7px] text-gray-300">online</p>
                </div>
              </div>

              {/* Chat Canvas Area */}
              <div className="flex-1 p-3 flex flex-col gap-2.5 overflow-y-auto bg-neutral-950/90 relative">
                {/* Simulated ambient wall design based on platform */}
                {platform === 'whatsapp' && (
                  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#128C7E_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                )}

                <div className="text-[8px] bg-white/[0.03] text-gray-500 font-semibold px-2 py-0.5 rounded-full self-center">
                  Today
                </div>

                {/* Received instruction mock */}
                <div className="bg-neutral-900 text-gray-300 text-[10px] leading-relaxed p-2.5 rounded-2xl rounded-tl-sm max-w-[85%] self-start font-sans">
                  <p className="text-[7px] font-bold text-indigo-400 font-mono mb-0.5">om AI Assistant</p>
                  Bhai! I composed this chat draft matching your request. Read below! 👇
                </div>

                {/* Composed speech bubble preview */}
                <AnimatePresence mode="wait">
                  {messageText.trim() && (
                    <motion.div
                      key={messageText}
                      initial={{ scale: 0.95, opacity: 0, y: 5 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      className={`p-2.5 rounded-2xl rounded-tr-sm max-w-[85%] text-[10px] leading-relaxed relative flex flex-col gap-1 font-sans ${activeConfig.bubbleBg}`}
                    >
                      <p className="whitespace-pre-wrap">{messageText}</p>
                      
                      <div className="flex items-center justify-end gap-1 text-[7px] text-gray-500/80 self-end mt-0.5">
                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <CheckCircle2 className={`w-2.5 h-2.5 ${platform === 'whatsapp' ? 'text-[#34b7f1]' : 'text-gray-400'}`} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input bottom bar */}
              <div className="p-2 border-t border-white/5 bg-neutral-900/60 flex items-center gap-1.5">
                <div className="flex-1 bg-neutral-950 rounded-full px-2.5 py-1 text-[8px] text-gray-500 text-left border border-white/5">
                  Type message...
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${activeConfig.color}`}>
                  <Send className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
