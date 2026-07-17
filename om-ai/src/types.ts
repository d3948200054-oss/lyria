export interface MemoryItem {
  id: string;
  text: string;
  category: "Personal Info" | "Preferences" | "Goals" | "Technical Details" | "Other";
  createdAt: string;
}

export interface CutSegment {
  id: string;
  start: number;
  end: number;
  reason: "Silence" | "Filler Word" | "Mistake Take" | "Outtake";
  description: string;
  disabled?: boolean; // if true, the user "restored" this section (manual override)
}

export interface SubtitleItem {
  id: string;
  start: number;
  end: number;
  text: string;
}

export interface MusicTrack {
  name: string;
  mood: string;
  volume: number;
  cue: string;
  url?: string;
}

export interface VideoRecipe {
  totalDuration: number;
  cuts: CutSegment[];
  subtitles: SubtitleItem[];
  musicTrack: MusicTrack;
  summary: {
    originalDuration: number;
    finalDuration: number;
    cutsCount: number;
    silenceRemoved: number;
    fillerWordsCut: number;
    efficiencyGain: string;
  };
}

export interface VoiceSessionState {
  status: "disconnected" | "connecting" | "listening" | "speaking" | "error";
  errorMessage: string | null;
  currentTranscription: string;
  assistantReply: string;
}

export interface MessageDraft {
  id: string;
  recipient: string;
  message: string;
  platform: "whatsapp" | "gmail" | "sms" | "discord" | "slack" | "telegram" | "imessage" | "generic";
  phoneOrEmail?: string;
  createdAt: string;
  status: "draft" | "sent";
}

export type AiProviderType = "gemini" | "nvidia" | "openrouter" | "anthropic" | "minimax" | "deepseek";

export interface AiProviderConfig {
  provider: AiProviderType;
  apiKey: string;
  model: string;
}

export interface OcrScanResult {
  text: string;
  wordCount: number;
  language: string;
  scannedAt: string;
}

