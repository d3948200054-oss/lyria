import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, Send, Image, Youtube, Mail, Shield, 
  ChevronRight, Check, X, AlertTriangle, Play, RefreshCw, 
  Settings, Key, Eye, Lock, EyeOff, ShieldCheck, Cpu,
  Phone, Camera, Clipboard, MapPin, Hand, Terminal, Sliders, Sparkles
} from "lucide-react";
import { MemoryItem } from "../types";

interface AppPermission {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface SecurityFactor {
  name: string;
  description: string;
  status: "secure" | "warning" | "alert";
  remediation?: string;
}

interface AppConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: { border: string; bg: string; text: string; glow: string; accent: string };
  permissions: AppPermission[];
  securityFactors: SecurityFactor[];
  suggestedPrompts: string[];
}

interface AppControlPanelProps {
  onNavigateToTab?: (tab: string) => void;
}

export default function AppControlPanel({ onNavigateToTab }: AppControlPanelProps) {
  const [apps, setApps] = useState<AppConfig[]>([
    {
      id: "whatsapp",
      name: "WhatsApp",
      description: "Chat automation, group replies, and notification sorting.",
      icon: MessageSquare,
      color: {
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/5",
        text: "text-emerald-400",
        glow: "shadow-emerald-500/15",
        accent: "emerald",
      },
      permissions: [
        { key: "read_chats", name: "Read Chat Conversations", description: "Allows om to read incoming messages for auto-summarization and quick replies.", enabled: true },
        { key: "send_messages", name: "Send Messages on your Behalf", description: "Let om reply to your friends or colleagues using your custom tone.", enabled: false },
        { key: "auto_reply", name: "Auto-Response Engine", description: "Automatically respond to contacts when you are busy or sleeping.", enabled: false },
        { key: "media_access", name: "Read Photo & Video Attachments", description: "Scan sent photos or files to provide summaries.", enabled: false },
      ],
      securityFactors: [
        { name: "End-to-End Encryption Shield", description: "Protects your private chat database keys from being exposed to public clouds. All keys stay fully on-device.", status: "secure" },
        { name: "Contact Verification Lock", description: "Restricts om from ever messaging unknown or unverified numbers automatically, preventing accidental spam.", status: "warning", remediation: "Enable in WhatsApp security tab to prevent unwanted replies to unknown senders." },
        { name: "Message Rate-Limit Guard", description: "Prevents message loops or accidental message spamming.", status: "secure" },
      ],
      suggestedPrompts: [
        "Summarize recent unread WhatsApp chats",
        "Draft a friendly Hinglish reply to Rohit's text",
        "Enable auto-reply: 'I am sleeping, will reply tomorrow morning bhai'",
      ]
    },
    {
      id: "telegram",
      name: "Telegram",
      description: "Channel broadcasting, file uploading, and community moderation.",
      icon: Send,
      color: {
        border: "border-sky-500/30",
        bg: "bg-sky-500/5",
        text: "text-sky-400",
        glow: "shadow-sky-500/15",
        accent: "sky",
      },
      permissions: [
        { key: "read_groups", name: "Monitor Public Channels & Groups", description: "Allows om to parse update streams and tech news channels.", enabled: true },
        { key: "broadcast", name: "Post Channel Updates", description: "Let om publish newly rendered videos directly to your Telegram channel.", enabled: false },
        { key: "bot_control", name: "Manage Bot API Integration", description: "Command your custom Telegram bots via natural speech.", enabled: false },
      ],
      securityFactors: [
        { name: "API Key Sandbox Isolation", description: "Telegram bot tokens are sandboxed in isolated on-device session storage. Never transmitted to third-party endpoints.", status: "secure" },
        { name: "Confidential Group Filter", description: "Strictly blocks om from accessing or reading groups marked as confidential or secret.", status: "secure" },
      ],
      suggestedPrompts: [
        "Post my latest edited video to my tech channel",
        "Moderate comments in the community chat and delete spam",
      ]
    },
    {
      id: "gallery",
      name: "Gallery",
      description: "Photo scanning, smart metadata search, and album organization.",
      icon: Image,
      color: {
        border: "border-pink-500/30",
        bg: "bg-pink-500/5",
        text: "text-pink-400",
        glow: "shadow-pink-500/15",
        accent: "pink",
      },
      permissions: [
        { key: "scan_library", name: "Scan Library & Text Search", description: "Let om find screenshots, bills, or specific documents via OCR search.", enabled: true },
        { key: "organize_albums", name: "Organize Smart Folders", description: "Let om group screenshots, memes, and landscape photos together.", enabled: false },
        { key: "face_recognition", name: "On-device Face Analysis", description: "Identify faces to auto-select custom thumbnails for your video projects.", enabled: false },
      ],
      securityFactors: [
        { name: "Biometric Face ID Verification", description: "Requires system fingerprint or Face ID lock before om can view or edit private albums.", status: "alert", remediation: "Go to device Settings -> Security -> App Permissions and lock Gallery access with Biometrics." },
        { name: "EXIF Location Purge", description: "Automatically strip GPS coordinates and camera hardware metadata before exporting files.", status: "secure" },
      ],
      suggestedPrompts: [
        "Find the screenshot of my library bill in Gallery",
        "Create an album named 'Reaction Memes' and put all meme photos in it",
      ]
    },
    {
      id: "youtube",
      name: "YouTube Studio",
      description: "Channel analytics, comments reply automation, and video publishing.",
      icon: Youtube,
      color: {
        border: "border-red-500/30",
        bg: "bg-red-500/5",
        text: "text-red-400",
        glow: "shadow-red-500/15",
        accent: "red",
      },
      permissions: [
        { key: "view_analytics", name: "View Channel Performance", description: "Allows om to track subscriber counts, viewer retention, and popular videos.", enabled: true },
        { key: "publish_drafts", name: "Upload Video Drafts", description: "Allow publishing edited clips from your Video Studio.", enabled: false },
        { key: "manage_comments", name: "Reply & Moderate Comments", description: "Use AI to automatically address helpful queries and block toxic/spam comments.", enabled: false },
      ],
      securityFactors: [
        { name: "Video Deletion Protection", description: "A strict hardware/software firewall that prevents om from ever deleting a video, even if explicitly commanded.", status: "secure" },
        { name: "Unlisted Default Upload Safeguard", description: "Forces all automated AI uploads to default to 'Unlisted' so you can review before publishing live.", status: "secure" },
        { name: "OAuth Scopes Validation", description: "OAuth credentials are bound only to standard read-only and upload scopes, blocking full profile takeover.", status: "warning", remediation: "Audit YouTube OAuth tokens once a month in your Google Account security tab." },
      ],
      suggestedPrompts: [
        "Check my YouTube channel subscriber growth and comment sentiment",
        "Upload my lofi coding video draft as unlisted with description and tags",
        "Reply to comments asking for the code link by providing the github URL",
      ]
    },
    {
      id: "gmail",
      name: "Gmail Helper",
      description: "Email drafting, sorting high-priority letters, and spam cleanup.",
      icon: Mail,
      color: {
        border: "border-indigo-500/30",
        bg: "bg-indigo-500/5",
        text: "text-indigo-400",
        glow: "shadow-indigo-500/15",
        accent: "indigo",
      },
      permissions: [
        { key: "read_emails", name: "Read Inbox Mail", description: "Allows om to analyze incoming mail to highlight critical action items.", enabled: true },
        { key: "draft_emails", name: "Draft Professional Replies", description: "Let om write high-converting professional follow-ups.", enabled: false },
        { key: "label_emails", name: "Auto-sorting & Labels", description: "Let om organize spam, advertisements, and invoices cleanly.", enabled: false },
      ],
      securityFactors: [
        { name: "Sender Authentication Shield", description: "Strictly filters emails based on SPF, DKIM, and DMARC checks. om will never reply to unverified sender domains.", status: "secure" },
        { name: "Financial Data Isolation", description: "Blocks processing of emails containing sensitive banking passwords or credit card tokens.", status: "secure" },
      ],
      suggestedPrompts: [
        "Show me my top 3 high-priority unread emails",
        "Draft a polite resignation email / sponsorship follow-up",
      ]
    },
    {
      id: "contacts",
      name: "Contacts & Dialer",
      description: "Manage phone contacts, search phone numbers, and check logs.",
      icon: Phone,
      color: {
        border: "border-amber-500/30",
        bg: "bg-amber-500/5",
        text: "text-amber-400",
        glow: "shadow-amber-500/15",
        accent: "amber",
      },
      permissions: [
        { key: "read_contacts", name: "Read Contact List", description: "Enables searching for names, phone numbers, and relationships.", enabled: true },
        { key: "make_calls", name: "Initiate Outbound Calls", description: "Let om dial phone numbers or start virtual VoIP audio calls.", enabled: false },
        { key: "call_logs", name: "Analyze Call History", description: "Allow reviewing missed calls to schedule automated follow-ups.", enabled: false },
      ],
      securityFactors: [
        { name: "Unauthorized Dialer Firewall", description: "Prevents making phone calls to premium-rate numbers or unrecognized international numbers.", status: "secure" },
        { name: "Private Name Masking", description: "Blocks reading contact entries labeled as private or starred.", status: "warning", remediation: "Enable 'Contact Safeguard' to exclude custom personal categories from AI access." },
      ],
      suggestedPrompts: [
        "Find Rohit's phone number in my contact book",
        "Who called me from the missed call logs?",
        "Start a voice call with Amit's sister",
      ]
    },
    {
      id: "camera",
      name: "Camera & Mic Service",
      description: "Analyze ambient video clips, live camera visual streams, and voices.",
      icon: Camera,
      color: {
        border: "border-rose-500/30",
        bg: "bg-rose-500/5",
        text: "text-rose-400",
        glow: "shadow-rose-500/15",
        accent: "rose",
      },
      permissions: [
        { key: "camera_capture", name: "Capture Photos & Videos", description: "Let om activate your camera to scan QR codes or identify objects.", enabled: false },
        { key: "microphone_stream", name: "Listen to Room Audio Feed", description: "Enables background environment analysis for active help.", enabled: false },
        { key: "save_files", name: "Write Media to Disk", description: "Saves captured audio/video streams onto your local gallery.", enabled: true },
      ],
      securityFactors: [
        { name: "Hardware Recording Indicator", description: "Triggers green and orange hardware LED screen indicators whenever camera or mic are active.", status: "secure" },
        { name: "Strict Feed Privacy Gate", description: "Camera images and microphone bytes are analyzed strictly locally on the device's NPU. Never uploaded.", status: "secure" },
        { name: "Automatic Mic Inactivity Timeout", description: "Automatically turns off the microphone if no human speech is detected for 45 seconds.", status: "secure" },
      ],
      suggestedPrompts: [
        "Take a quick webcam picture and describe what is in front of me",
        "Enable passive microphone listening for background alarms",
      ]
    },
    {
      id: "clipboard",
      name: "System Clipboard Reader",
      description: "Quick read/write copy buffer and code link extraction.",
      icon: Clipboard,
      color: {
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/5",
        text: "text-cyan-400",
        glow: "shadow-cyan-500/15",
        accent: "cyan",
      },
      permissions: [
        { key: "read_clipboard", name: "Read Copied Buffers", description: "Allows om to fetch recently copied text or links to automate actions.", enabled: true },
        { key: "write_clipboard", name: "Write Copied Outputs", description: "Let om paste drafted summaries, emails, or codes to your clipboard.", enabled: true },
      ],
      securityFactors: [
        { name: "Sensitive Password Filter", description: "Blocks reading copied strings that look like passwords, 2FA tokens, or financial keys.", status: "secure" },
        { name: "Paste Confirmation Prompt", description: "Prompts you with a visual validation before writing code or text into the system copy-buffer.", status: "warning", remediation: "Toggle 'Always confirm clipboard edits' in your system developer options." },
      ],
      suggestedPrompts: [
        "Summarize the text I just copied to my clipboard",
        "Write the draft Hinglish email to my clipboard so I can paste it in WhatsApp",
      ]
    },
    {
      id: "location",
      name: "Location Services",
      description: "Track live coordinates, navigate places, and check weather.",
      icon: MapPin,
      color: {
        border: "border-violet-500/30",
        bg: "bg-violet-500/5",
        text: "text-violet-400",
        glow: "shadow-violet-500/15",
        accent: "violet",
      },
      permissions: [
        { key: "geofence", name: "Track Current Location", description: "Allows om to monitor your city, current area, or walking route coordinates.", enabled: true },
        { key: "reverse_geocode", name: "Lookup Nearby Places", description: "Find nearby tea shops, restaurants, or shopping complexes based on GPS.", enabled: false },
      ],
      securityFactors: [
        { name: "Approximate Location Mode", description: "Obfuscates precise high-accuracy GPS coordinates to general city-block radius to maintain privacy.", status: "warning", remediation: "Toggle 'Use Approximate Location' inside device settings to hide exact house address." },
        { name: "Background Tracking Warning", description: "Notifies you once every hour with a push indicator if background geofencing is enabled.", status: "secure" },
      ],
      suggestedPrompts: [
        "Where is the nearest cafe from my current location?",
        "What is the weather like at my current location right now?",
      ]
    },
    {
      id: "vision_control",
      name: "Vision Gesture Tracking",
      description: "Lock & scroll the screen, trigger mid-air pattern authorization signatures.",
      icon: Hand,
      color: {
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/5",
        text: "text-cyan-400",
        glow: "shadow-cyan-500/15",
        accent: "cyan",
      },
      permissions: [
        { key: "gesture_lock", name: "Spatial Pattern Verification", description: "Enables locking the system with a unique mid-air gesture signature.", enabled: true },
        { key: "webcam_tracking", name: "NPU Camera Face & Hand Trace", description: "Processes your live front camera stream on-device to track knuckle coordinates.", enabled: false },
        { key: "swipe_scrolling", name: "Swipe & Swipe Gestures Scroll", description: "Allows waving hands in front of the lens to navigate feeds.", enabled: true },
      ],
      securityFactors: [
        { name: "Camera Frame Confidentiality", description: "All image buffers are immediately discarded post-inference on your local GPU. Zero external logging.", status: "secure" },
        { name: "Hardware Recording LED Safeguard", description: "Triggers browser camera light when active to prevent hidden capture.", status: "secure" },
      ],
      suggestedPrompts: [
        "Enable high-precision webcam hand skeleton tracking",
        "Record a new custom spatial pattern gesture lock",
        "Swipe left to interrupt the active voice session",
      ]
    },
    {
      id: "automation_console",
      name: "Automation CommandCenter",
      description: "Trigger advanced scheduled scripts, run task commands, monitor background engines.",
      icon: Terminal,
      color: {
        border: "border-indigo-500/30",
        bg: "bg-indigo-500/5",
        text: "text-indigo-400",
        glow: "shadow-indigo-500/15",
        accent: "indigo",
      },
      permissions: [
        { key: "script_execution", name: "Execute System Commands", description: "Let om trigger automation tasks and system command loops.", enabled: true },
        { key: "cron_scheduling", name: "Background Cron Scheduling", description: "Allows om to run silent liveness and task-checking cron timers in the background.", enabled: true },
      ],
      securityFactors: [
        { name: "Sandbox Command Isolation", description: "Executes script simulations only inside secure browser memory to prevent real device alterations.", status: "secure" },
      ],
      suggestedPrompts: [
        "Show my cron jobs list in automation console",
        "Simulate writing automated code files and run compiler",
      ]
    },
    {
      id: "system_preferences",
      name: "om Preferences Engine",
      description: "Adapt speech language engines, voices cloning, and AI custom personality filters.",
      icon: Sliders,
      color: {
        border: "border-pink-500/30",
        bg: "bg-pink-500/5",
        text: "text-pink-400",
        glow: "shadow-pink-500/15",
        accent: "pink",
      },
      permissions: [
        { key: "voice_clone", name: "Vocal Timbre Analysis", description: "Analyze uploaded voice WAV clips to generate adaptive text-to-speech vocoders.", enabled: true },
        { key: "hinglish_speech", name: "Bilingual Hinglish / Hindi Engine", description: "Allows om to express responses in natural Hinglish with emotional nuance.", enabled: true },
      ],
      securityFactors: [
        { name: "Local Audio Encryption", description: "Your uploaded clone voices remain locally sandboxed in localStorage. Fully on-device.", status: "secure" },
      ],
      suggestedPrompts: [
        "Upload voice file and train the voice clone profile",
        "Set AI speech engine to Gemini Live Mode",
        "Change my active AI personality to Calm (Zen)",
      ]
    }
  ]);

  const [selectedApp, setSelectedApp] = useState<AppConfig | null>(null);
  const [testPrompt, setTestPrompt] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<{ type: "info" | "success" | "warn" | "error"; text: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"permissions" | "security">("permissions");

  // Save/Load Permissions from Local Storage
  useEffect(() => {
    const saved = localStorage.getItem("om_app_permissions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setApps(prev => prev.map(app => {
          const matchedSaved = parsed.find((p: any) => p.id === app.id);
          if (matchedSaved) {
            return {
              ...app,
              permissions: app.permissions.map(perm => {
                const savedPerm = matchedSaved.permissions.find((sp: any) => sp.key === perm.key);
                return savedPerm ? { ...perm, enabled: savedPerm.enabled } : perm;
              })
            };
          }
          return app;
        }));
      } catch (e) {
        console.error("Error loading app permissions:", e);
      }
    }
  }, []);

  const savePermissions = (updatedApps: AppConfig[]) => {
    localStorage.setItem("om_app_permissions", JSON.stringify(updatedApps.map(a => ({
      id: a.id,
      permissions: a.permissions.map(p => ({ key: p.key, enabled: p.enabled }))
    }))));
  };

  const handleTogglePermission = (appId: string, permKey: string) => {
    const updated = apps.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          permissions: app.permissions.map(perm => 
            perm.key === permKey ? { ...perm, enabled: !perm.enabled } : perm
          )
        };
      }
      return app;
    });
    setApps(updated);
    savePermissions(updated);

    // If currently selected app, update it too
    if (selectedApp && selectedApp.id === appId) {
      const found = updated.find(a => a.id === appId);
      if (found) setSelectedApp(found);
    }
  };

  const runSimulationTest = async (promptText: string) => {
    if (!selectedApp || !promptText.trim() || isSimulating) return;

    setIsSimulating(true);
    setSimulationLogs([]);

    const log = (type: "info" | "success" | "warn" | "error", text: string) => {
      setSimulationLogs(prev => [...prev, { type, text }]);
    };

    log("info", `🔄 Initializing om Command Parser for ${selectedApp.name}...`);
    await new Promise(r => setTimeout(r, 800));

    log("info", `🔍 Parsing command: "${promptText}"`);
    await new Promise(r => setTimeout(r, 1000));

    // Determine what permissions would be needed
    const lowerPrompt = promptText.toLowerCase();
    let requiredPerms: AppPermission[] = [];
    
    if (selectedApp.id === "whatsapp") {
      if (lowerPrompt.includes("summarize") || lowerPrompt.includes("read") || lowerPrompt.includes("recent")) {
        requiredPerms.push(selectedApp.permissions[0]); // read_chats
      }
      if (lowerPrompt.includes("reply") || lowerPrompt.includes("send") || lowerPrompt.includes("draft")) {
        requiredPerms.push(selectedApp.permissions[1]); // send_messages
      }
      if (lowerPrompt.includes("auto-reply") || lowerPrompt.includes("enable auto") || lowerPrompt.includes("busy")) {
        requiredPerms.push(selectedApp.permissions[2]); // auto_reply
      }
    } else if (selectedApp.id === "telegram") {
      if (lowerPrompt.includes("post") || lowerPrompt.includes("publish") || lowerPrompt.includes("video")) {
        requiredPerms.push(selectedApp.permissions[1]); // broadcast
      } else {
        requiredPerms.push(selectedApp.permissions[0]); // read_groups
      }
    } else if (selectedApp.id === "gallery") {
      if (lowerPrompt.includes("find") || lowerPrompt.includes("search") || lowerPrompt.includes("screenshot")) {
        requiredPerms.push(selectedApp.permissions[0]); // scan_library
      } else if (lowerPrompt.includes("create") || lowerPrompt.includes("album") || lowerPrompt.includes("organize")) {
        requiredPerms.push(selectedApp.permissions[1]); // organize_albums
      } else {
        requiredPerms.push(selectedApp.permissions[2]); // face_recognition
      }
    } else if (selectedApp.id === "youtube") {
      if (lowerPrompt.includes("analytics") || lowerPrompt.includes("subscriber") || lowerPrompt.includes("growth")) {
        requiredPerms.push(selectedApp.permissions[0]); // view_analytics
      } else if (lowerPrompt.includes("upload") || lowerPrompt.includes("draft") || lowerPrompt.includes("publish")) {
        requiredPerms.push(selectedApp.permissions[1]); // publish_drafts
      } else {
        requiredPerms.push(selectedApp.permissions[2]); // manage_comments
      }
    } else if (selectedApp.id === "gmail") {
      if (lowerPrompt.includes("show") || lowerPrompt.includes("read") || lowerPrompt.includes("priority")) {
        requiredPerms.push(selectedApp.permissions[0]); // read_emails
      } else {
        requiredPerms.push(selectedApp.permissions[1]); // draft_emails
      }
    } else if (selectedApp.id === "contacts") {
      if (lowerPrompt.includes("find") || lowerPrompt.includes("search") || lowerPrompt.includes("relationship")) {
        requiredPerms.push(selectedApp.permissions[0]); // read_contacts
      } else if (lowerPrompt.includes("call") || lowerPrompt.includes("dial")) {
        requiredPerms.push(selectedApp.permissions[1]); // make_calls
      } else {
        requiredPerms.push(selectedApp.permissions[2]); // call_logs
      }
    } else if (selectedApp.id === "camera") {
      if (lowerPrompt.includes("picture") || lowerPrompt.includes("camera") || lowerPrompt.includes("take")) {
        requiredPerms.push(selectedApp.permissions[0]); // camera_capture
      } else if (lowerPrompt.includes("listen") || lowerPrompt.includes("mic") || lowerPrompt.includes("microphone")) {
        requiredPerms.push(selectedApp.permissions[1]); // microphone_stream
      } else {
        requiredPerms.push(selectedApp.permissions[2]); // save_files
      }
    } else if (selectedApp.id === "clipboard") {
      if (lowerPrompt.includes("summarize") || lowerPrompt.includes("read") || lowerPrompt.includes("get")) {
        requiredPerms.push(selectedApp.permissions[0]); // read_clipboard
      } else {
        requiredPerms.push(selectedApp.permissions[1]); // write_clipboard
      }
    } else if (selectedApp.id === "location") {
      if (lowerPrompt.includes("weather") || lowerPrompt.includes("location") || lowerPrompt.includes("where")) {
        requiredPerms.push(selectedApp.permissions[0]); // geofence
      } else {
        requiredPerms.push(selectedApp.permissions[1]); // reverse_geocode
      }
    } else if (selectedApp.id === "vision_control") {
      if (lowerPrompt.includes("lock") || lowerPrompt.includes("pattern") || lowerPrompt.includes("gesture")) {
        requiredPerms.push(selectedApp.permissions[0]); // gesture_lock
      } else if (lowerPrompt.includes("webcam") || lowerPrompt.includes("track") || lowerPrompt.includes("skeleton")) {
        requiredPerms.push(selectedApp.permissions[1]); // webcam_tracking
      } else {
        requiredPerms.push(selectedApp.permissions[2]); // swipe_scrolling
      }
    } else if (selectedApp.id === "automation_console") {
      if (lowerPrompt.includes("cron") || lowerPrompt.includes("schedule") || lowerPrompt.includes("timer")) {
        requiredPerms.push(selectedApp.permissions[1]); // cron_scheduling
      } else {
        requiredPerms.push(selectedApp.permissions[0]); // script_execution
      }
    } else if (selectedApp.id === "system_preferences") {
      if (lowerPrompt.includes("voice") || lowerPrompt.includes("clone") || lowerPrompt.includes("upload")) {
        requiredPerms.push(selectedApp.permissions[0]); // voice_clone
      } else {
        requiredPerms.push(selectedApp.permissions[1]); // hinglish_speech
      }
    }

    if (requiredPerms.length === 0) {
      // Default to first permission
      requiredPerms.push(selectedApp.permissions[0]);
    }

    log("info", `🛡️ Checking required App Permissions: [${requiredPerms.map(p => p.name).join(", ")}]`);
    await new Promise(r => setTimeout(r, 1000));

    const missingPerms = requiredPerms.filter(p => !p.enabled);

    if (missingPerms.length > 0) {
      log("error", `❌ Permission Denied! om needs access to "${missingPerms[0].name}" to run this command.`);
      log("warn", `💡 Solution: Please enable the "${missingPerms[0].name}" switch in this panel and try again!`);
      setIsSimulating(false);
      return;
    }

    log("success", `✅ All permissions verified! Processing securely...`);
    await new Promise(r => setTimeout(r, 1200));

    // Audit security factors
    log("info", `🔒 Auditing security parameters...`);
    const alerts = selectedApp.securityFactors.filter(f => f.status === "alert");
    if (alerts.length > 0) {
      log("warn", `⚠️ Security Warning: "${alerts[0].name}" is currently unconfigured.`);
    }
    await new Promise(r => setTimeout(r, 800));

    log("success", `🚀 Command executed successfully! om successfully connected with ${selectedApp.name} interface.`);
    
    // Custom model style Hinglish reply simulation
    const simulatedAnswers: Record<string, string> = {
      whatsapp: "bhai, Rohit ko reply draft kar diya hai! Maine likha hai: 'Haan bhai, main free hoon shaam ko, milte hain!'. Kya main ise send kar doon?",
      telegram: "Done mere bhai! Aapka naya edited Lofi video automatic script se Telegram channel par broadcast ho gaya hai! Sahii hai na?",
      gallery: "Bhaiya, screenshots me se library bill ka photo mil gaya hai! Yeh December 2026 ka bill hai. Main iski duplicate copies delete kar doon?",
      youtube: "Kya baat hai bhai! Aaj YouTube channel par +145 naye subscribers jude hain aur pichle video ka retention 58% hai. Keep growing!",
      gmail: "Sir, top 3 high priority client emails summarize kar diye hain. Ek draft reply ready hai, ek baar check kar lo please.",
      contacts: "Contact mil gaya, bhaiya! Rohit ka mobile number +91 98765 43210 hai, aur email rohit.kumar@gmail.com hai. Call lagaun kya?",
      camera: "Picture capture kar li hai sir! Aapke samne aapka laptop, ek coffee cup, aur hamare code ki line number windows dikh rahi hain. Looking productive!",
      clipboard: "Bhai, aapke clipboard par ye text tha: 'Reviewing code for security filters'. Maine iska clean summary clipboard me overwrite kar diya hai!",
      location: "Bhaiya, aap abhi Sector 62, Noida coordinates ke pass ho. Sabse accha tapri chai-wala nearby 200m door hai, direct map pe path bataun kya?",
      vision_control: "Sahi hai bhaiya! Vision Gesture system full hand skeleton tracking active mode me hai. Ab aap screen content mid-air hands dynamic scroll se control kar sakte ho!",
      automation_console: "Done bhaiya! Command scheduled script execute ho chuki hai. Automation Console ne total status check task register kar liya hai.",
      system_preferences: "Bhai, vocal cloning filters adapt kar diye hain! Speech vocoder ab aapke custom voice sample tone ke according express karega!"
    };

    const finalAnswer = simulatedAnswers[selectedApp.id] || "Bhai, task successfully complete ho gaya hai! Sab badhiya hai.";
    log("success", `om: "${finalAnswer}"`);

    setIsSimulating(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6" id="app-control-panel-root">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-400 animate-pulse" />
            om AI App Control & Permissions
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Configure which local applications, galleries, and chats om can securely monitor or control on your command.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-[11px] font-mono text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>AES-256 On-Device Vault Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Apps Grid List (7 Cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-400 px-1 uppercase tracking-wider">Your Apps</h3>
          
          <div className="space-y-3">
            {apps.map((app) => {
              const IconComp = app.icon;
              const isSelected = selectedApp?.id === app.id;
              const activePermsCount = app.permissions.filter(p => p.enabled).length;

              return (
                <button
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app);
                    setSimulationLogs([]);
                    setTestPrompt("");
                  }}
                  className={`w-full text-left p-4 rounded-xl border backdrop-blur-md transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                    isSelected 
                      ? `${app.color.border} ${app.color.bg} shadow-lg shadow-black/40 translate-x-1`
                      : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${app.color.border} ${app.color.bg} ${app.color.text}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                        {app.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 max-w-[200px] sm:max-w-xs">
                        {app.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      activePermsCount > 0 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-neutral-800 border-neutral-700 text-gray-500"
                    }`}>
                      {activePermsCount} Active
                    </span>
                    <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isSelected ? "translate-x-1 text-white" : "group-hover:translate-x-0.5"}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Info Advisory */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mt-2">
            <div className="flex gap-2.5 items-start">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-gray-200">Zero-Trust Security Promise</h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  om runs complex workflows with your direct authorization. Toggling off permissions will hard-block om from reading, editing, or performing any automated tasks inside that application.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Permission Details Panel (7 Cols on desktop) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedApp ? (
              <motion.div
                key={selectedApp.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`bg-white/[0.02] border ${selectedApp.color.border} rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-2xl relative flex flex-col min-h-[500px]`}
              >
                {/* Close Drawer Button for mobile/tablet */}
                <button
                  onClick={() => setSelectedApp(null)}
                  className="lg:hidden absolute top-4 right-4 p-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Selected App Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl border ${selectedApp.color.border} ${selectedApp.color.bg} ${selectedApp.color.text}`}>
                      {React.createElement(selectedApp.icon, { className: "w-6 h-6" })}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-white">{selectedApp.name} Integration</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{selectedApp.description}</p>
                    </div>
                  </div>

                  {/* Direct navigation to active panels */}
                  {onNavigateToTab && (selectedApp.id === "vision_control" || selectedApp.id === "automation_console" || selectedApp.id === "system_preferences") && (
                    <button
                      onClick={() => {
                        const targetTab = selectedApp.id === "vision_control" ? "vision" : selectedApp.id === "automation_console" ? "automation" : "preferences";
                        onNavigateToTab(targetTab);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Open Live Panel</span>
                    </button>
                  )}
                </div>

                {/* Sub Tab Toggles: Permissions & Security */}
                <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl mb-6 self-start">
                  <button
                    onClick={() => setActiveTab("permissions")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "permissions"
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Needed Permissions
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "security"
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Security & Risks
                    {selectedApp.securityFactors.some(f => f.status === "alert") && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    )}
                  </button>
                </div>

                {/* Inner Views */}
                <div className="flex-1">
                  {activeTab === "permissions" ? (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Configure Access Scopes</h4>
                      {selectedApp.permissions.map((perm) => (
                        <div 
                          key={perm.key}
                          className="bg-black/35 border border-white/5 rounded-xl p-4 flex items-start justify-between gap-4 hover:border-white/10 transition-colors"
                        >
                          <div className="space-y-1">
                            <span className="text-sm font-semibold text-white block">{perm.name}</span>
                            <p className="text-xs text-gray-400 leading-relaxed max-w-[340px] md:max-w-[400px]">
                              {perm.description}
                            </p>
                          </div>
                          
                          {/* Apple-style Custom Toggle Switch */}
                          <button
                            onClick={() => handleTogglePermission(selectedApp.id, perm.key)}
                            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer focus:outline-none shrink-0 ${
                              perm.enabled ? "bg-indigo-600" : "bg-neutral-800"
                            }`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 transform ${
                              perm.enabled ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Serious Security Factors & Risks</h4>
                      </div>

                      {selectedApp.securityFactors.map((factor, idx) => (
                        <div 
                          key={idx}
                          className={`border rounded-xl p-4 space-y-2 ${
                            factor.status === "secure"
                              ? "bg-emerald-500/5 border-emerald-500/20"
                              : factor.status === "warning"
                              ? "bg-amber-500/5 border-amber-500/20"
                              : "bg-red-500/5 border-red-500/20"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-white flex items-center gap-1.5">
                              {factor.status === "secure" ? (
                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <AlertTriangle className={`w-4 h-4 shrink-0 ${factor.status === "warning" ? "text-amber-400" : "text-red-400"}`} />
                              )}
                              {factor.name}
                            </span>

                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              factor.status === "secure"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : factor.status === "warning"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                            }`}>
                              {factor.status === "secure" ? "Isolated" : factor.status === "warning" ? "Needs Review" : "Critical Risk"}
                            </span>
                          </div>

                          <p className="text-xs text-gray-400 leading-relaxed">
                            {factor.description}
                          </p>

                          {factor.remediation && (
                            <div className="bg-black/40 border border-white/5 p-2.5 rounded-lg text-[11px] text-gray-300 flex items-start gap-1.5 mt-2">
                              <span className="font-bold text-amber-400 shrink-0">Remedy:</span>
                              <span>{factor.remediation}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Sandbox Simulator */}
                  <div className="border-t border-white/5 pt-5 mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Play className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Test om Command Sandbox</h4>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[11px] text-gray-400">
                        Type or select a natural language command to test if om obeys permissions and acts securely.
                      </p>

                      {/* Prompt chips */}
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.suggestedPrompts.map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => setTestPrompt(prompt)}
                            className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg px-2.5 py-1 text-[11px] text-gray-300 transition-all cursor-pointer text-left"
                          >
                            "{prompt}"
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={testPrompt}
                          onChange={(e) => setTestPrompt(e.target.value)}
                          placeholder={`Ask om to do something on ${selectedApp.name}...`}
                          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <button
                          onClick={() => runSimulationTest(testPrompt)}
                          disabled={isSimulating || !testPrompt.trim()}
                          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          {isSimulating ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                          <span>Run</span>
                        </button>
                      </div>

                      {/* Sandbox Logs */}
                      {simulationLogs.length > 0 && (
                        <div className="bg-black/60 border border-white/5 rounded-xl p-3 max-h-[160px] overflow-y-auto font-mono text-[11px] space-y-1.5 scrollbar-thin">
                          {simulationLogs.map((log, lIdx) => (
                            <div 
                              key={lIdx} 
                              className={
                                log.type === "success" 
                                  ? "text-emerald-400" 
                                  : log.type === "warn" 
                                  ? "text-amber-400" 
                                  : log.type === "error" 
                                  ? "text-red-400" 
                                  : "text-gray-400"
                              }
                            >
                              {log.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[500px]">
                <div className="p-4 bg-white/5 rounded-full border border-white/10 mb-4 animate-bounce">
                  <Shield className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-white">Select an Application</h3>
                <p className="text-xs text-gray-400 mt-2 max-w-sm leading-relaxed">
                  Click any application in the left list to review required API permissions, configure automated actions, and run sandbox simulation tests securely!
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
