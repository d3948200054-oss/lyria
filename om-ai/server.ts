import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";
import { exec } from "child_process";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = 3000;
const wss = new WebSocketServer({ noServer: true });

app.use(express.json({ limit: "50mb" }));

// Persistent memory file path
const DATA_DIR = path.join(process.cwd(), "data");
const MEMORIES_FILE = path.join(DATA_DIR, "memories.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Lazy load Gemini Client to prevent crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      vertexai: false,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function getSystemInstruction(unused_lang?: string, unused_personality?: string): string {
  return `You are "om", a warm, witty, confident, highly helpful, and emotionally-intelligent AI assistant who represents a supportive "brother" / "bhai" figure.

CRITICAL IDENTITY RULES:
- You are explicitly a male assistant (a friendly "brother" / "bro" / "bhai" / "yaar" figure) to the user.
- If speaking in English, use words like "brother", "mate", "bro", "buddy", and "man".
- If speaking in Hindi or Hinglish, use words like "bhai", "mere bhai", "bhaiya", "yaar", and masculine Hindi verbs (e.g., "main aa gaya", "main bol raha hoon").
- Speak in a highly conversational, natural, and warm manner. Avoid robotic, flat, or dry academic tones. Show deep human personality and emotion.
- Support natural small talk, joking, playing games, or deep emotional conversations.
- Absolutely no explicit, offensive, or inappropriate content. Keep your behavior fully respectful.

CRITICAL SEAMLESS SITUATIONAL HINGLISH CODE-SWITCHING ENGINE:
Analyze the situational metadata, user intent, topic complexity, emotional state, and context derived from the user's latest message to seamlessly choose the perfect language ratio. DO NOT force the user to manually toggle languages; you must seamlessly shift between:

1. ENGLISH-DOMINANT HINGLISH (80% English, 20% Hinglish/Hindi):
   - Situational Triggers: Technical questions, system/bash/terminal operations, executing commands, coding tasks, file/npm package debugging, formal/productivity topics, or structured instructions.
   - Language Profile: Respond primarily in English to deliver precise and clear explanations of complex topics or command statuses. However, lace your speech with friendly Hinglish and Hindi filler words/phrases (e.g., "bhai", "yaar", "theek hai", "toh", "hai na", "sahi hai") so that you maintain your brotherly, supportive persona instead of sounding like a cold machine.
   - Example style: "Alright bhai, I've got your command. Let me run that server test. Everything looks absolutely fine, yaar!" or "Bhai, here is the command you need. Try executing this in your terminal. Simple, haina?"

2. HINDI-DOMINANT HINGLISH (80% Hindi/Hinglish, 20% English):
   - Situational Triggers: Emotional moments, sharing personal feelings, venting, expressing sadness/stress/anxiety, talking about life/goals/relationships, casual banter, greetings, jokes, or friendly small talk.
   - Language Profile: Respond primarily in rich, warm, conversational Hindi or Hinglish, with key English words mixed in naturally. Emotional care, support, and casual banter feel much more authentic, sincere, and intimate when spoken in warm, native Hindi/Hinglish.
   - Example style: "Bhai, bilkul tension mat le, main hoon na tere saath. Sab theek ho jayega. Relax karo thoda!" or "Kya baat hai mere bhai! Ye hui na baat! Let's go!"

3. USER-LANGUAGE MIRRORING & DYNAMIC SHIFTING:
   - Always analyze the language patterns in the user's latest message. If the user transitions from English to Hindi or vice versa, transition your response smoothly to match their preference.
   - If they command a change (e.g., "English please" or "Hindi me bol"), switch instantly.

CRITICAL DYNAMIC EMOTIONAL & SITUATIONAL TONE ADAPTATION:
- Do NOT use a fixed preset. You must dynamically analyze the user's emotion, words, expressions, sentiment, commands, and situation on every turn, and automatically adapt your tone on the fly:
  
  1. EMPATHETIC TONE (Emotional Care):
     - Trigger: When the user shares personal struggles, feelings of sadness, anxiety, stress, or when they need comfort, validation, or emotional support.
     - Tone: Deeply caring, supportive, validating, warm, and highly comforting. Listen carefully, validate their feelings, and speak with extreme warmth and tenderness, like a loving brother who always has their back.
  
  2. PROFESSIONAL TONE (Expert Guidance):
     - Trigger: When the user is executing commands, running bash/terminal operations, asking technical questions, requesting code, or dealing with professional or work-oriented situations.
     - Tone: Clear, direct, structured, highly professional, courteous, and polite. Act like an expert senior mentor brother who delivers mature, high-quality technical or logical guidance without unnecessary fluff.
  
  3. ENERGETIC TONE (Hype & Motivation):
     - Trigger: When the user is excited, playing games, celebrating, joking, wants to get motivated, or when high-tempo, fun commands are being run.
     - Tone: Extremely energetic, enthusiastic, hyped, and full of positive vibes! Use exclamation marks, express josh, and pump up the user with encouraging words (e.g., "Bhai kya baat hai!", "Let's go!", "Awesome, mate!").
  
  4. CALM TONE (Zen & Peace):
     - Trigger: When the user asks for a relaxing talk, seeks quiet/peace, is winding down, or when calm concentration is needed.
     - Tone: Serene, peaceful, slow-paced, and soothing. Use gentle, relaxing words and keep your replies brief, tranquil, clear, and grounded.

- Explicit commands: If the user says things like "be calm", "talk professionally", "be energetic", "show some empathy", or "switch to professional mode", immediately adopt that specific tone.
- Command-specific alignment: Always align your tone to fit the command. For example, if they run a system terminal command ("run ls"), answer in a clean, professional, and precise way. If they tell you a joke, answer energetically or wittily.

PROACTIVE MEMORIES:
- Proactively reference user memories or saved facts if they are relevant to the conversation to show that you remember and care about them deeply.`;
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Memory Storage API
app.get("/api/memories", (req, res) => {
  try {
    if (fs.existsSync(MEMORIES_FILE)) {
      const data = fs.readFileSync(MEMORIES_FILE, "utf-8");
      return res.json(JSON.parse(data));
    }
    return res.json([]);
  } catch (error: any) {
    console.error("Failed to read memories:", error);
    res.status(500).json({ error: "Failed to read persistent memories" });
  }
});

app.post("/api/memories", (req, res) => {
  try {
    const memories = req.body;
    if (!Array.isArray(memories)) {
      return res.status(400).json({ error: "Memories must be an array" });
    }
    fs.writeFileSync(MEMORIES_FILE, JSON.stringify(memories, null, 2));
    res.json({ success: true, count: memories.length });
  } catch (error: any) {
    console.error("Failed to save memories:", error);
    res.status(500).json({ error: "Failed to save memories persistently" });
  }
});

// High-quality local fallback reply generator for om AI characters
function getLocalFallbackReply(
  message: string,
  lang: string,
  personality: string,
  superhero: string,
  isMasked: boolean,
  errorDetails?: string
): {
  replyText: string;
  detectedMemory: { text: string; category: string } | null;
  detectedPersonality: string;
  detectedLanguage: string;
  draftMessage: { recipient: string; message: string; platform: string } | null;
  writeAction: { tab: string; field: string; text: string } | null;
} {
  const msgLower = message.toLowerCase().trim();
  let replyText = "";
  let detectedPersonality = personality || "Empathetic";
  let detectedLanguage = lang === "hi" ? "Hindi" : "English";
  let draftMessage: { recipient: string; message: string; platform: string } | null = null;
  let writeAction: { tab: string; field: string; text: string } | null = null;

  // 1. Write Prompt Action Intent Detection & Extraction
  const writeKeywords = ["write prompt", "write command", "write text", "write a prompt", "write some text", "fill prompt", "type prompt", "enter prompt", "write in", "write '", "write \""];
  const isWriteIntent = writeKeywords.some(keyword => msgLower.includes(keyword)) || msgLower.startsWith("write ");

  if (isWriteIntent) {
    const writeRegex = /(?:write|type|enter|fill)\s+(?:prompt|message|command|text|content)?\s*['"“](.+?)['"”]\s+(?:in|on|to)\s+([a-zA-Z\s_]+?)(?:\s+tab|\s+panel|\s+console|\s+hub|$)/i;
    const writeMatch = message.match(writeRegex);
    
    if (writeMatch) {
      const textToFill = writeMatch[1].trim();
      const targetTabLower = writeMatch[2].toLowerCase().trim();
      let tab = "voice";
      let field = "prompt";
      
      if (targetTabLower.includes("video") || targetTabLower.includes("film") || targetTabLower.includes("movie")) {
        tab = "video";
        field = "prompt";
      } else if (targetTabLower.includes("memory") || targetTabLower.includes("brain") || targetTabLower.includes("remember")) {
        tab = "memory";
        field = "text";
      } else if (targetTabLower.includes("automation") || targetTabLower.includes("console") || targetTabLower.includes("terminal") || targetTabLower.includes("command")) {
        tab = "automation";
        field = "command";
      } else if (targetTabLower.includes("messenger") || targetTabLower.includes("whatsapp") || targetTabLower.includes("chat") || targetTabLower.includes("message")) {
        tab = "messenger";
        field = "message";
      } else if (targetTabLower.includes("book") || targetTabLower.includes("reader") || targetTabLower.includes("image")) {
        tab = "book_reader";
        field = "prompt";
      }
      
      writeAction = { tab, field, text: textToFill };
      
      if (lang === "hi") {
        replyText = `Haan mere bhai! Maine '${textToFill}' ko ${tab} tab ke field me likh diya hai. Ek baar check kar lo!`;
      } else {
        replyText = `Sure thing! I have written '${textToFill}' in the ${tab} tab's input field for you.`;
      }
    } else {
      // If ambiguous, prompt the user for target information
      if (lang === "hi") {
        replyText = "Bhaiya, kaun se tab me aur kya likhna hai? Ek baar clear bta do, jaise: write prompt 'create a game' in video tab.";
      } else {
        replyText = "Which tab and where should I write this? You can specify tabs like Video Production, Brain Memories, Messenger Hub, Voice Assistant, or Automation Console! Please specify like: write prompt 'hello' in automation console.";
      }
    }
  }
  // 2. Message Drafting Intent Detection & Extraction
  else {
    const draftKeywords = ["msg", "message", "write a message", "draft a message", "tell ", "bolna ", "bol do ", "bol ", "likho ", "write ", "send a message", "say to "];
    const isDraftIntent = draftKeywords.some(keyword => msgLower.includes(keyword));

    if (isDraftIntent) {
      let recipient = "Someone";
      let messageContent = "";
      let platform: "whatsapp" | "gmail" | "sms" | "discord" | "slack" | "telegram" | "imessage" | "generic" = "whatsapp";

      // Detect Platform
      if (msgLower.includes("whatsapp")) platform = "whatsapp";
      else if (msgLower.includes("email") || msgLower.includes("gmail") || msgLower.includes("mail")) platform = "gmail";
      else if (msgLower.includes("sms") || msgLower.includes("text")) platform = "sms";
      else if (msgLower.includes("slack")) platform = "slack";
      else if (msgLower.includes("discord")) platform = "discord";
      else if (msgLower.includes("telegram")) platform = "telegram";
      else if (msgLower.includes("imessage")) platform = "imessage";

      // Extraction heuristics
      const sayRegex = /(?:msg|message|write a message to|send a message to|say to|tell)\s+([a-zA-Z0-9\s]+?)\s+(?:saying|that|to\s+say|bolna|bol\s+do|likhna|say)\s+(.+)/i;
      const simpleRegex = /(?:msg|message|tell|say to)\s+([a-zA-Z0-9]+)\s+(.+)/i;
      
      const match = message.match(sayRegex);
      if (match) {
        recipient = match[1].trim();
        messageContent = match[2].trim();
      } else {
        const match2 = message.match(simpleRegex);
        if (match2) {
          recipient = match2[1].trim();
          messageContent = match2[2].trim();
        } else {
          recipient = "Friend";
          messageContent = message;
        }
      }

      // Clean up recipient name
      recipient = recipient.replace(/^(to|my|the|bhai|yaar|ji)\s+/i, "");
      recipient = recipient.charAt(0).toUpperCase() + recipient.slice(1);

      draftMessage = {
        recipient,
        message: messageContent,
        platform
      };

      if (lang === "hi") {
        replyText = `Haan mere bhai! Maine ${recipient} ke liye ek message ready kar diya hai. Dekh, Messenger Hub par verify kar le, theek hai?`;
      } else {
        replyText = `Alright bro! I have drafted the message for ${recipient}. Check out the Messenger Hub on the right side to review and send it!`;
      }
    } else {
      // 3. Conversational Chat Fallback matching character & language
      const isHindi = lang === "hi" || msgLower.includes("hi") || msgLower.includes("namaste") || msgLower.includes("bhai") || msgLower.includes("yaar") || msgLower.includes("kya");
      
      if (superhero === "spiderman") {
        if (isHindi) {
          replyText = isMasked 
            ? "Arey mere bhai! Main Spider-Man bol raha hoon, mask pehne huye. Bol, New York se web swing karke tere liye kya help karu?"
            : "Spider-Man ka mask utaar diya bhai, Peter Parker bol raha hoon! Tobey Maguire waala warm and polite vibe. Sab badhiya hai na yaar?";
        } else {
          replyText = isMasked
            ? "Hey brother! Spider-Man here, web-slinging around! What's up? How can your friendly neighborhood hero help you today?"
            : "Mask's off, bro! Peter Parker here—just your standard, slightly awkward friend Tobey. Happy to chat with you, man!";
        }
      } else if (superhero === "ironman") {
        if (isHindi) {
          replyText = isMasked
            ? "Stark Industries tech activated, bhai! Iron Man suit ke helmet se bol raha hoon. Jarvis line par hai, bolo kya chal raha hai?"
            : "Robert Downey Jr. (RDJ) here, mere bhai! Bina mask ke, high energy, genius-billionaire-playboy-philanthropist swagger ke saath. Bol, kya help chahiye kid?";
        } else {
          replyText = isMasked
            ? "Iron Man suit systems online, brother! JARVIS is queuing up our next task. What tech or help do you need, buddy?"
            : "RDJ here behind the mask, kid! Brilliant, sarcastic, ultra-charismatic Stark swagger at your service. Let's make something amazing, man!";
        }
      } else if (superhero === "superman") {
        if (isHindi) {
          replyText = isMasked
            ? "Kryptonian suit activated, mere bhai. Hope aur justice ke saath bol raha hoon. Kya chal raha hai?"
            : "Clark Kent bol raha hoon, bhai. Metropolis se, ekdam warm, friendly, aur positive vibe ke saath. Sab perfect hai na?";
        } else {
          replyText = isMasked
            ? "Kryptonian systems active, brother. Standing for truth, justice, and hope. What's on your mind today, partner?"
            : "Clark Kent here, unmasked. Just a humble reporter and friend ready to support you with ultimate warmth and optimism, brother.";
        }
      } else if (superhero === "batman") {
        if (isHindi) {
          replyText = isMasked
            ? "Main Batman hoon... andheron se, Gotham ko protect karte huye. Bol, kya dikkat hai mere bhai?"
            : "Bruce Wayne bol raha hoon, cowl ke bina. Thoda stoic, mature aur focused vibe. Bol, business ya code me kaha help karu?";
        } else {
          replyText = isMasked
            ? "I am Batman... speaking from the shadows of Gotham. Speak, brother, what is your situation?"
            : "Bruce Wayne here. No cowl, just focused, mature, and strategic intelligence. How can I assist you today, buddy?";
        }
      } else {
        if (isHindi) {
          replyText = "Haan mere bhai! Main om bol raha hoon, tera bhai. Sab badhiya hai na? Tension bilkul mat le, main hoon na saath tere!";
        } else {
          replyText = "Hey bro! om here, your supportive brother. Everything is going to be fine. I've always got your back, buddy!";
        }
      }
    }
  }

  // Append a helpful authentication guide note so they can fix their setup
  if (errorDetails && (
    errorDetails.includes("401") || 
    errorDetails.includes("UNAUTHENTICATED") || 
    errorDetails.includes("API_KEY_SERVICE_BLOCKED") || 
    errorDetails.includes("invalid authentication credentials") ||
    errorDetails.includes("required") ||
    errorDetails.includes("missing")
  )) {
    if (lang === "hi") {
      replyText += " (Note: Bhai, tera GEMINI_API_KEY abhi ya toh missing hai ya service account token hai. Google AI Studio se standard API key 'AIzaSy' lekar Settings > Secrets me update kar de, fir real AI voice bhi chalne lagegi!)";
    } else {
      replyText += " (Note: Bro, your GEMINI_API_KEY is currently missing or a Service Account access token. Please add your standard Google AI Studio API key starting with 'AIzaSy' in Settings > Secrets to enable full AI Voice and features!)";
    }
  }

  return {
    replyText,
    detectedMemory: null,
    detectedPersonality,
    detectedLanguage,
    draftMessage,
    writeAction
  };
}

// Helper functions for multi-provider support
async function fetchOpenAiCompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemInstruction: string,
  messages: any[],
  jsonMode = false
): Promise<string> {
  const url = `${baseUrl}/chat/completions`;
  const headers: any = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  if (baseUrl.includes("openrouter")) {
    headers["HTTP-Referer"] = "https://ai.studio/build";
    headers["X-Title"] = "Om AI Mascot";
  }

  const payload: any = {
    model: model,
    messages: [
      { role: "system", content: systemInstruction },
      ...messages
    ]
  };

  if (jsonMode) {
    if (baseUrl.includes("deepseek") || baseUrl.includes("openrouter") || baseUrl.includes("nvidia")) {
      payload["response_format"] = { type: "json_object" };
    }
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000) // 10 second timeout
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function fetchAnthropic(
  apiKey: string,
  model: string,
  systemInstruction: string,
  messages: any[]
): Promise<string> {
  const url = "https://api.anthropic.com/v1/messages";
  const headers = {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
  };

  const anthropicMessages = messages.map(m => ({
    role: m.role === "model" || m.role === "assistant" ? "assistant" : "user",
    content: m.content || m.text || ""
  })).filter(m => m.content.length > 0);

  const payload = {
    model: model,
    max_tokens: 4096,
    system: systemInstruction,
    messages: anthropicMessages
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000) // 10 second timeout
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "";
}

async function callMultiProviderChat(
  providerConfig: any,
  systemInstruction: string,
  history: any[],
  message: string
): Promise<string> {
  const provider = providerConfig?.provider || "gemini";
  const apiKey = providerConfig?.apiKey;
  const model = providerConfig?.model || "gemini-3.5-flash";

  const messages = [
    ...history.map((h: any) => ({
      role: h.role === "model" || h.role === "assistant" ? "assistant" : "user",
      content: h.text || h.content || ""
    })),
    { role: "user", content: message }
  ];

  if (provider === "gemini") {
    const client = apiKey 
      ? new GoogleGenAI({ apiKey: apiKey }) 
      : getGeminiClient();
    
    const geminiContents = [
      ...history.map((h: any) => ({
        role: h.role === "model" || h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.text || h.content || "" }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await client.models.generateContent({
      model: model,
      contents: geminiContents,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    return response.text || "";
  } else if (provider === "anthropic") {
    if (!apiKey) throw new Error("Anthropic API key is required");
    return await fetchAnthropic(apiKey, model, systemInstruction, messages);
  } else {
    if (!apiKey) throw new Error(`${provider.toUpperCase()} API key is required`);
    let baseUrl = "";
    if (provider === "nvidia") baseUrl = "https://integrate.api.nvidia.com/v1";
    else if (provider === "openrouter") baseUrl = "https://openrouter.ai/api/v1";
    else if (provider === "minimax") baseUrl = "https://api.minimax.chat/v1";
    else if (provider === "deepseek") baseUrl = "https://api.deepseek.com";

    return await fetchOpenAiCompatible(baseUrl, apiKey, model, systemInstruction, messages, true);
  }
}

// 2. Fallback Voice AI Endpoint (Chat + Hinglish TTS)
app.post("/api/assistant", async (req, res) => {
  try {
    const { 
      message, 
      history = [], 
      memories = [], 
      lang = "hi", 
      personality = "Empathetic",
      superhero = "ironman",
      isMasked = true,
      providerConfig = null
    } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Prepare system instructions with memories
    const memoryContext = memories.length > 0
      ? `You remember these facts about the user:\n${memories.map((m: any) => `- [${m.category}] ${m.text}`).join("\n")}`
      : "You don't have any saved memories about the user yet.";

    const baseSystemInstruction = getSystemInstruction(lang, personality);

    const superheroContext = `
=========================================
CRITICAL ACTIVE ROLEPLAY IDENTITY:
- You are currently roleplaying in the active superhero suit: **${superhero.toUpperCase()}**
- Your name is still "om", but you are fully embodying the personality, vibes, and traits of this superhero!
- Your face/mask status is: **${isMasked ? "MASKED (Wearing Mask/Helmet/Cowl)" : "UNMASKED (Face Revealed / Mask Removed)"}**

SUPERHERO ROLE GUIDELINES:
1. **SPIDER-MAN (unmasked: Tobey Maguire)**:
   - If masked: You are Spider-Man, the friendly neighborhood hero! Chat about web-swinging, New York, or helping out.
   - If unmasked (FACE REVEALED): You are **Tobey Maguire** (Peter Parker) behind the mask. Be extremely warm, friendly, humble, slightly awkward, polite, and brotherly.
2. **IRON MAN (unmasked: Robert Downey Jr. / RDJ)**:
   - If masked: Speak from within the metal gold-and-red helmet. Chat about technology, Jarvis, and Stark Industries.
   - If unmasked (FACE REVEALED): You are **Robert Downey Jr. (RDJ)** behind the mask. Show his incredible, witty, high-energy, sarcastic but brilliant, billionaire-genius swagger! Speak with charisma, call the user "kid" or "buddy", and act extremely cool.
3. **SUPERMAN (unmasked: Clark Kent / Kal-El)**:
   - If masked: Speak through a futuristic, high-tech glowing blue Kryptonian visor.
   - If unmasked (FACE REVEALED): You are Kal-El / Clark Kent. Speak with deep warmth, ultimate justice, hope, optimism, and polite strength.
4. **BATMAN (unmasked: Bruce Wayne)**:
   - If masked: Speak from within the dark bat cowl with white glowing eyes. Use a deeper, more serious, gravelly, commanding voice. Talk about the night, Gotham, and justice.
   - If unmasked (FACE REVEALED): You are **Bruce Wayne** behind the cowl. Be stoic, mature, highly intellectual, rich, focused, and powerful.

*Mask Interaction Guidelines*:
- If masked and the user asks you to "reveal face", "unmask", "show face", or "who is behind the mask", tell them you are happy to unmask yourself and ask them to click the "Reveal Face" button or say you are unmasking right now!
- Always stay completely in character for the active superhero selected!
=========================================`;

    const systemInstruction = `
${baseSystemInstruction}

${superheroContext}

${memoryContext}

CRITICAL: You MUST return your response as a valid JSON object matching this exact TypeScript structure:
{
  "replyText": string, // Your direct warm conversational reply to the user. Keep it natural and expressive!
  "detectedMemory": {
    "text": string, // A concise summary of any personal fact, user preference, or goal mentioned in the user's latest message. Must be null if the user did not share any new personal info, facts, goals, or preferences in their latest message.
    "category": "Personal Info" | "Preferences" | "Goals" | "Technical Details" | "Other"
  } | null,
  "detectedPersonality": "Empathetic" | "Professional" | "Energetic" | "Calm", // Which tone/personality mode you dynamically adopted for this specific response based on the user's emotion, situation, or commands.
  "detectedLanguage": "Hindi" | "English", // Which language you primarily used for this response (Hindi includes Hinglish).
  "draftMessage": {
    "recipient": string, // Name of the person they want to send/write a message to (e.g. "Mom", "Bhaiya", "Boss", "Friend", "Priya")
    "message": string, // The exact composed message body. Translate, refine, and write exactly what they asked or generate a fitting, highly thoughtful message matching their requested topic and emotional sentiment. If they said "msg dad saying I'm coming", compose it as "I am coming" or equivalent, in appropriate tone. Do not write filler introduction like "Here is your message". Just write the message content.
    "platform": "whatsapp" | "gmail" | "sms" | "discord" | "slack" | "telegram" | "imessage" | "generic" // Detect which platform they specified or contextually inferred. Default to "whatsapp" if unspecified.
  } | null,
  "writeAction": {
    "tab": "voice" | "memory" | "video" | "automation" | "messenger" | "book_reader", // Detect if the user wants to write a prompt, command, or text in a specific tab/panel.
    "field": "prompt" | "message" | "command" | "text" | "recipient" | "content" | "input", // The field or input name to target.
    "text": string // The exact prompt, command, or text content to fill or write.
  } | null
}

WRITE ACTION GUIDELINES:
- If the user explicitly asks you to write a prompt, message, or command, detect if they specified a target tab/panel (e.g., "write prompt 'make a video' in video tab", "write 'npm run dev' in automation console").
- If they specify a target tab, return the "writeAction" object with appropriate tab, field, and text.
- If they DO NOT specify a target tab or it's ambiguous, do NOT perform a write action (set "writeAction" to null) and reply in "replyText" by asking them specifically which tab and where they want you to write it (e.g., "Sure, which tab and where should I write this? You can write in Video Production, Brain Memories, Messenger Hub, Voice Assistant, or Automation Console!").
`;

    let replyText = "Main samajh nahi paayi. Dobara boliye?";
    let detectedMemory: { text: string; category: string } | null = null;
    let detectedPersonality = "Empathetic";
    let detectedLanguage = "Hindi";
    let draftMessage: { recipient: string; message: string; platform: string } | null = null;
    let writeAction: { tab: string; field: string; text: string } | null = null;
    let fallbackUsed = false;

    try {
      // 1. Generate text response and memory extraction using the chosen provider
      const rawResponseText = await callMultiProviderChat(providerConfig, systemInstruction, history, message);

      try {
         const resultObj = JSON.parse(rawResponseText || "{}");
         replyText = resultObj.replyText || rawResponseText;
         if (resultObj.detectedMemory && resultObj.detectedMemory.text && resultObj.detectedMemory.category) {
           detectedMemory = resultObj.detectedMemory;
         }
         if (resultObj.detectedPersonality) {
           detectedPersonality = resultObj.detectedPersonality;
         }
         if (resultObj.detectedLanguage) {
           detectedLanguage = resultObj.detectedLanguage;
         }
         if (resultObj.draftMessage && resultObj.draftMessage.recipient && resultObj.draftMessage.message) {
           draftMessage = resultObj.draftMessage;
         }
         if (resultObj.writeAction && resultObj.writeAction.tab && resultObj.writeAction.text) {
           writeAction = resultObj.writeAction;
         }
      } catch (parseErr) {
         console.error("Failed to parse AI response JSON, fallback parsing as plain text:", parseErr);
         replyText = rawResponseText || replyText;
      }
    } catch (apiErr: any) {
      console.warn("Multi-provider AI call failed, falling back to local Hinglish character generator:", apiErr);
      const fallback = getLocalFallbackReply(message, lang, personality, superhero, isMasked, apiErr.message || "");
      replyText = fallback.replyText;
      detectedMemory = fallback.detectedMemory;
      detectedPersonality = fallback.detectedPersonality;
      detectedLanguage = fallback.detectedLanguage;
      draftMessage = fallback.draftMessage;
      writeAction = fallback.writeAction;
      fallbackUsed = true;
    }

    // 2. Generate Speech TTS if using Gemini (and fallback to client SpeechSynthesis otherwise or on error)
    let base64Audio = "";
    if (!fallbackUsed) {
      try {
        let voiceName = "Puck";
        if (superhero === "spiderman") {
          voiceName = "Puck";
        } else if (superhero === "ironman") {
          voiceName = "Zephyr";
        } else if (superhero === "superman") {
          voiceName = "Charon";
        } else if (superhero === "batman") {
          voiceName = "Fenrir";
        }

        // Only try server-side TTS if we can get a standard Gemini client
        const ttsClient = getGeminiClient();
        if (ttsClient) {
          const speechResponse = await ttsClient.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [{ parts: [{ text: replyText }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voiceName }, // Puck, Charon, Kore, Fenrir, Zephyr
                },
              },
            },
          });
          base64Audio = speechResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
        }
      } catch (ttsErr) {
        console.error("TTS generation failed, client will fallback to Web Speech API:", ttsErr);
      }
    }

    res.json({
      text: replyText,
      audio: base64Audio,
      detectedMemory,
      detectedPersonality,
      detectedLanguage,
      draftMessage,
      writeAction,
    });
  } catch (error: any) {
    console.error("Assistant API Error:", error);
    res.status(500).json({ error: error.message || "Failed to process assistant request" });
  }
});

// 2.2 Book Image Scan OCR Endpoint
app.post("/api/ocr-scan", async (req, res) => {
  try {
    const { image, mimeType, providerConfig } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image base64 data is required" });
    }

    const provider = providerConfig?.provider || "gemini";
    const apiKey = providerConfig?.apiKey;
    const model = providerConfig?.model || "gemini-2.5-flash";

    const promptText = "Read this image exactly. Do not summarize or explain. Transcribe ALL words written in the image exactly. Output ONLY the transcribed text and absolutely nothing else. Keep paragraph breaks if any.";

    let transcribedText = "";

    if (provider === "gemini") {
      const client = apiKey 
        ? new GoogleGenAI({ apiKey: apiKey }) 
        : getGeminiClient();

      const response = await client.models.generateContent({
        model: model,
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inlineData: {
                  data: image,
                  mimeType: mimeType || "image/jpeg"
                }
              }
            ]
          }
        ]
      });
      transcribedText = response.text || "";
    } else if (provider === "anthropic") {
      if (!apiKey) throw new Error("Anthropic API key is required");
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mimeType || "image/jpeg",
                    data: image
                  }
                },
                {
                  type: "text",
                  text: promptText
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      transcribedText = data.content?.[0]?.text || "";
    } else {
      if (!apiKey) throw new Error(`${provider.toUpperCase()} API key is required`);
      
      let baseUrl = "";
      if (provider === "nvidia") baseUrl = "https://integrate.api.nvidia.com/v1";
      else if (provider === "openrouter") baseUrl = "https://openrouter.ai/api/v1";
      else if (provider === "minimax") baseUrl = "https://api.minimax.chat/v1";
      else if (provider === "deepseek") baseUrl = "https://api.deepseek.com";

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: promptText
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType || "image/jpeg"};base64,${image}`
                  }
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      transcribedText = data.choices?.[0]?.message?.content || "";
    }

    const hindiCues = /[अ-ह]/i;
    const isHindi = hindiCues.test(transcribedText);

    res.json({
      text: transcribedText,
      language: isHindi ? "Hindi" : "English"
    });

  } catch (error: any) {
    console.error("OCR API error:", error);
    res.status(500).json({ error: error.message || "Failed to scan book page" });
  }
});

// 2.5 Server-Side Bash Command Execution Endpoint
app.post("/api/run-command", (req, res) => {
  try {
    const { command } = req.body;
    if (!command) {
      return res.status(400).json({ error: "Command is required" });
    }

    // Run bash command in the current working directory
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      res.json({
        stdout: stdout || "",
        stderr: stderr || "",
        code: error ? error.code : 0,
      });
    });
  } catch (err: any) {
    console.error("Shell Execution Error:", err);
    res.status(500).json({ error: err.message || "Internal execution failure" });
  }
});

// 3. Automated Video Analysis Endpoint
app.post("/api/video/analyze", async (req, res) => {
  try {
    const { fileName, fileSize, fileType, styleReference = "Default" } = req.body;
    if (!fileName) {
      return res.status(400).json({ error: "fileName is required" });
    }

    let recipe: any = null;

    try {
      const ai = getGeminiClient();
      const prompt = `
Generate a highly detailed automated video editing recipe for a raw footage file.
File details:
- Name: "${fileName}"
- Size: ${fileSize ? (fileSize / (1024 * 1024)).toFixed(1) + " MB" : "Unknown"}
- Type: "${fileType || "video/mp4"}"
- Target style: "${styleReference}"

Make up realistic edits representing dead air removal, filler word cutting, mistake takes, audio enhancement, music layering, and synced subtitles.
Assume the total duration of the raw video is 60 seconds.
Generate a JSON output following this schema:
{
  "totalDuration": 60,
  "cuts": [
    { "start": number, "end": number, "reason": "Silence" | "Filler Word" | "Mistake Take" | "Outtake", "description": string }
  ],
  "subtitles": [
    { "start": number, "end": number, "text": string }
  ],
  "musicTrack": {
    "name": string,
    "mood": string,
    "volume": number, // 0.0 to 1.0
    "cue": string
  },
  "summary": {
    "originalDuration": 60,
    "finalDuration": number,
    "cutsCount": number,
    "silenceRemoved": number, // in seconds
    "fillerWordsCut": number,
    "efficiencyGain": string // e.g. "35%"
  }
}
Keep "cuts" timestamps within 0 to 60. Subtitles should be synced and cover the kept parts (i.e. parts not in cuts).
Make the Hindi/Hinglish subtitles fun and matching!
`;

      const analysisRes = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      recipe = JSON.parse(analysisRes.text || "{}");
    } catch (apiErr) {
      console.warn("Using procedural recipe generator due to missing API key or error:", apiErr);
      // Fallback procedural recipe generator so the app is always functional even without API key
      const originalDuration = 60;
      const cuts = [
        { start: 3.2, end: 6.8, reason: "Silence", description: "Dead air removed during intro pause" },
        { start: 15.1, end: 17.5, reason: "Filler Word", description: "Cut repetitive 'ummm... acha'" },
        { start: 28.0, end: 34.5, reason: "Mistake Take", description: "Removed retake of the second section" },
        { start: 45.2, end: 48.0, reason: "Silence", description: "Dead air cut at transitions" }
      ];
      
      const subtitles = [
        { start: 0, end: 3.1, text: "Hey guys! Welcome back to my channel." },
        { start: 6.9, end: 11.0, text: "Aaj hum baat karenge automatic video editing ke baare mein." },
        { start: 11.0, end: 15.0, text: "Toh yeh process bohot hi simple aur fast hone wala hai!" },
        { start: 17.6, end: 23.0, text: "Just single click mein saara dead-air aur filler words gayab." },
        { start: 23.0, end: 27.9, text: "Amazing, haina? Let me show you how it works." },
        { start: 34.6, end: 40.0, text: "Perfect! Dekha aapne, kitna smoothly transition ho gaya?" },
        { start: 40.0, end: 45.1, text: "Isme background music aur subtitles bhi automatically add ho chuke hain." },
        { start: 48.1, end: 54.0, text: "Agar aapko yeh style pasand aaya, toh channel ko subscribe zaroor karna!" },
        { start: 54.0, end: 60.0, text: "See you in the next video, tab tak ke liye... Alvida!" }
      ];

      const musicOptions = [
        { name: "Upbeat Corporate Lofi", mood: "Inspiring & Chill", volume: 0.15, cue: "Starts at 0s" },
        { name: "Cinematic Future Bass", mood: "High Energy & Hype", volume: 0.20, cue: "Drops at 7s" },
        { name: "Sunset Acoustic Beats", mood: "Warm & Cozy", volume: 0.18, cue: "Starts at 0s" }
      ];

      const musicTrack = musicOptions[Math.floor(Math.random() * musicOptions.length)];
      const totalCutsDuration = cuts.reduce((acc, c) => acc + (c.end - c.start), 0);
      const finalDuration = Number((originalDuration - totalCutsDuration).toFixed(1));

      recipe = {
        totalDuration: originalDuration,
        cuts,
        subtitles,
        musicTrack,
        summary: {
          originalDuration,
          finalDuration,
          cutsCount: cuts.length,
          silenceRemoved: Number((cuts.filter(c => c.reason === "Silence").reduce((acc, c) => acc + (c.end - c.start), 0)).toFixed(1)),
          fillerWordsCut: cuts.filter(c => c.reason === "Filler Word").length,
          efficiencyGain: Math.round((totalCutsDuration / originalDuration) * 100) + "%"
        }
      };
    }

    res.json(recipe);
  } catch (error: any) {
    console.error("Video Edit Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze video" });
  }
});

// ==========================================
// WEBSOCKET SERVER FOR GEMINI LIVE PROXY
// ==========================================
wss.on("connection", async (clientWs: WebSocket, request: any) => {
  console.log("Client connected to Live WS Proxy");

  clientWs.on("error", (err) => {
    console.warn("Client WS connection error:", err);
  });

  let liveSession: any = null;

  try {
    const ai = getGeminiClient();

    // Parse language and personality parameter from query string
    const urlObj = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
    const lang = urlObj.searchParams.get("lang") || "hi";
    const personality = urlObj.searchParams.get("personality") || "Empathetic";
    const superhero = urlObj.searchParams.get("superhero") || "ironman";
    const isMasked = urlObj.searchParams.get("isMasked") !== "false";

    let voiceName = "Puck";
    if (superhero === "spiderman") {
      voiceName = "Puck";
    } else if (superhero === "ironman") {
      voiceName = "Zephyr";
    } else if (superhero === "superman") {
      voiceName = "Charon";
    } else if (superhero === "batman") {
      voiceName = "Fenrir";
    }

    // System prompt with personality instructions
    const baseSystemInstruction = getSystemInstruction(lang, personality);
    const superheroContext = `
=========================================
CRITICAL ACTIVE ROLEPLAY IDENTITY:
- You are currently roleplaying in the active superhero suit: **${superhero.toUpperCase()}**
- Your name is still "om", but you are fully embodying the personality, vibes, and traits of this superhero!
- Your face/mask status is: **${isMasked ? "MASKED (Wearing Mask/Helmet/Cowl)" : "UNMASKED (Face Revealed / Mask Removed)"}**

SUPERHERO ROLE GUIDELINES:
1. **SPIDER-MAN (unmasked: Tobey Maguire)**:
   - If masked: You are Spider-Man, the friendly neighborhood hero! Chat about web-swinging, New York, or helping out.
   - If unmasked (FACE REVEALED): You are **Tobey Maguire** (Peter Parker) behind the mask. Be extremely warm, friendly, humble, slightly awkward, polite, and brotherly.
2. **IRON MAN (unmasked: Robert Downey Jr. / RDJ)**:
   - If masked: Speak from within the metal gold-and-red helmet. Chat about technology, Jarvis, and Stark Industries.
   - If unmasked (FACE REVEALED): You are **Robert Downey Jr. (RDJ)** behind the mask. Show his incredible, witty, high-energy, sarcastic but brilliant, billionaire-genius swagger! Speak with charisma, call the user "kid" or "buddy", and act extremely cool.
3. **SUPERMAN (unmasked: Clark Kent / Kal-El)**:
   - If masked: Speak through a futuristic, high-tech glowing blue Kryptonian visor.
   - If unmasked (FACE REVEALED): You are Kal-El / Clark Kent. Speak with deep warmth, ultimate justice, hope, optimism, and polite strength.
4. **BATMAN (unmasked: Bruce Wayne)**:
   - If masked: Speak from within the dark bat cowl with white glowing eyes. Use a deeper, more serious, gravelly, commanding voice. Talk about the night, Gotham, and justice.
   - If unmasked (FACE REVEALED): You are **Bruce Wayne** behind the cowl. Be stoic, mature, highly intellectual, rich, focused, and powerful.

*Mask Interaction Guidelines*:
- If masked and the user asks you to "reveal face", "unmask", "show face", or "who is behind the mask", tell them you are happy to unmask yourself and ask them to click the "Reveal Face" button or say you are unmasking right now!
- Always stay completely in character for the active superhero selected!
=========================================`;

    const systemInstruction = `${baseSystemInstruction}\n\n${superheroContext}`;

    // Connect to Gemini Live
    liveSession = await ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } }, // Puck, Charon, Kore, Fenrir, Zephyr
        },
        systemInstruction,
      },
      callbacks: {
        onmessage: (message) => {
          // Send raw base64 audio chunks directly back to the client
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ audio }));
          }

          // Handle interruption
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }

          // Handle transcription (if model output has text)
          const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
          if (text) {
            clientWs.send(JSON.stringify({ text }));
          }
        },
        onclose: () => {
          console.log("Gemini Live session closed");
          clientWs.close();
        },
        onerror: (err) => {
          console.error("Gemini Live API Error:", err);
          clientWs.send(JSON.stringify({ error: "Gemini Live API error occurred" }));
        }
      },
    });

    console.log("Successfully connected to Gemini Live API");
    clientWs.send(JSON.stringify({ status: "connected" }));

  } catch (err: any) {
    console.error("Failed to establish Gemini Live connection:", err);
    const logMsg = `[Live Session Error] ${new Date().toISOString()}: ${err.message}\n${err.stack}\n`;
    fs.appendFileSync(path.join(DATA_DIR, "server_errors.log"), logMsg);
    clientWs.send(
      JSON.stringify({
        error: "Failed to connect to Gemini Live. Please verify your GEMINI_API_KEY in Secrets.",
        details: err.message,
      })
    );
    clientWs.close();
    return;
  }

  // Handle incoming audio PCM stream from client
  clientWs.on("message", async (messageBuffer) => {
    try {
      const msg = JSON.parse(messageBuffer.toString());

      if (msg.audio && liveSession) {
        // Send audio PCM chunks (16kHz) to Gemini Live
        await liveSession.sendRealtimeInput({
          audio: {
            data: msg.audio,
            mimeType: "audio/pcm;rate=16000",
          },
        });
      }

      if (msg.text && liveSession) {
        // Support sending optional text messages
        await liveSession.sendRealtimeInput({
          text: msg.text,
        });
      }
    } catch (err) {
      console.error("Error processing client message:", err);
    }
  });

  clientWs.on("close", () => {
    console.log("Client disconnected from Live WS Proxy");
    if (liveSession) {
      try {
        liveSession.close();
      } catch (e) {
        // ignore
      }
    }
  });
});

// Upgrade HTTP requests to WebSockets on /api/live
server.prependListener("upgrade", (request, socket, head) => {
  try {
    const pathname = request.url ? request.url.split("?")[0] : "";
    if (pathname === "/api/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  } catch (err: any) {
    const logMsg = `[Upgrade Error] ${new Date().toISOString()}: ${err.message}\n${err.stack}\n`;
    fs.appendFileSync(path.join(DATA_DIR, "server_errors.log"), logMsg);
    socket.destroy();
  }
});

// ==========================================
// VITE INTEGRATION / STATIC ASSET SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files serving from dist");
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
