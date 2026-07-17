// Audio Utilities for PCM 16-bit Conversion, Mic Capture, and Playback

/**
 * Converts Float32 audio channel data to standard 16-bit linear PCM (little-endian)
 */
export function float32ToPCM16(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

/**
 * Converts 16-bit linear PCM (little-endian) Base64 audio into Float32Array
 */
export function pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const len = binary.length;
  const buffer = new ArrayBuffer(len);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const view = new DataView(buffer);
  const float32 = new Float32Array(len / 2);
  let offset = 0;
  for (let i = 0; i < float32.length; i++, offset += 2) {
    const s = view.getInt16(offset, true);
    float32[i] = s < 0 ? s / 0x8000 : s / 0x7fff;
  }
  return float32;
}

/**
 * Converts ArrayBuffer to Base64
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * AudioStreamer manages microphone capturing and downsampling to 16kHz PCM.
 */
export class AudioStreamer {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private onAudio: (base64PCM: string) => void;
  public analyser: AnalyserNode | null = null;

  constructor(onAudio: (base64PCM: string) => void) {
    this.onAudio = onAudio;
  }

  async start() {
    // We capture audio. Using 16000Hz is required for Gemini Live input
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
    } catch (e) {
      console.warn("Failed to create AudioContext with sampleRate: 16000, falling back to default.", e);
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    if (!this.audioContext) {
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }
      return;
    }

    this.source = this.audioContext.createMediaStreamSource(this.stream);
    
    // Create AnalyserNode for visualization
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.source.connect(this.analyser);
    
    // Create script processor to read PCM frames
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    this.analyser.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBuffer = float32ToPCM16(inputData);
      const base64 = arrayBufferToBase64(pcmBuffer);
      this.onAudio(base64);
    };
  }

  stop() {
    this.analyser = null;
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

/**
 * AudioPlayer schedules and plays 24kHz raw PCM responses gaplessly.
 */
export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private onPlayEnd?: () => void;
  private activeEndedCount = 0;
  public analyser: AnalyserNode | null = null;

  constructor() {
    // Created on first play to handle browser autoplay policies
  }

  private init() {
    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000, // Gemini Live output rate is 24kHz
      });
      this.nextStartTime = 0;
      this.activeEndedCount = 0;
    }
    if (!this.analyser || this.analyser.context !== this.audioContext) {
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.connect(this.audioContext.destination);
    }
  }

  playChunk(base64PCM: string) {
    this.init();
    if (!this.audioContext) return;

    try {
      const float32Data = pcm16ToFloat32(base64PCM);
      const buffer = this.audioContext.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      
      if (this.analyser) {
        source.connect(this.analyser);
      } else {
        source.connect(this.audioContext.destination);
      }

      const currentTime = this.audioContext.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime + 0.05; // Schedule slightly in future to prevent clicks
      }

      source.start(this.nextStartTime);
      this.nextStartTime += buffer.duration;

      this.activeSources.push(source);

      source.onended = () => {
        this.activeEndedCount++;
        const idx = this.activeSources.indexOf(source);
        if (idx > -1) {
          this.activeSources.splice(idx, 1);
        }
        if (this.activeSources.length === 0 && this.onPlayEnd) {
          this.onPlayEnd();
        }
      };
    } catch (err) {
      console.error("Failed to play audio chunk:", err);
    }
  }

  setOnPlayEnd(callback: () => void) {
    this.onPlayEnd = callback;
  }

  interrupt() {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Source might not have started or already ended
      }
    });
    this.activeSources = [];
    this.nextStartTime = 0;
    this.activeEndedCount = 0;
  }

  close() {
    this.interrupt();
    this.analyser = null;
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
