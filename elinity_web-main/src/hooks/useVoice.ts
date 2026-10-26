import { useState, useRef, useEffect, useCallback } from 'react';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000';

interface UseVoiceProps {
  sessionId: string;
  isMuted: boolean;
  onSendMessage: (text: string) => void;
  onAddPersonaMessage: (text: string) => void;
  onThinkingStateChange: (thinking: boolean) => void;
  onConclude: (reflection: any) => void;
}

export const useVoice = ({
  sessionId,
  isMuted,
  onSendMessage,
  onAddPersonaMessage,
  onThinkingStateChange,
  onConclude,
}: UseVoiceProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const isStartingRef = useRef(false);
  const isRecordingRef = useRef(false);
  const [isThinking, setIsThinking] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Web Audio & MediaRecorder References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Audio Context for mic analysis & VAD
  const audioContextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Playback Audio Reference (uses its own AudioContext to avoid conflicts with mic)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackAudioContextRef = useRef<AudioContext | null>(null);
  const playbackAnalyserRef = useRef<AnalyserNode | null>(null);
  const playbackSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // VAD (Voice Activity Detection) parameters
  const silenceStartRef = useRef<number | null>(null);
  const hasSpokenRef = useRef<boolean>(false);
  const recordingStartedAtRef = useRef<number>(0);
  const SILENCE_THRESHOLD = 0.03; // Noise threshold (raised from 0.015 to ignore background noise)
  const SILENCE_DURATION_MS = 2200; // Auto-stop after 2.2s of silence
  const MIN_RECORDING_DURATION_MS = 1000; // Minimum recording before VAD can trigger auto-stop
  const MIN_AUDIO_BLOB_SIZE = 4000; // Minimum blob size in bytes to send (rejects noise-only recordings)

  // Refs for circular callbacks to avoid hoisting TDZ errors
  const startRecordingRef = useRef<() => Promise<void>>();
  const sendAudioToBackendRef = useRef<(audioBlob: Blob, mimeType: string) => Promise<void>>();
  const playBase64AudioRef = useRef<(base64Data: string) => void>();
  const playSpeechSynthesisRef = useRef<(text: string) => void>();

  // Pre-warm Speech Synthesis voices on mount (Chrome/Safari async loading fix)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // 1. Stop AI Audio Playback (Interruption)
  const stopAudio = useCallback(() => {
    // HTML5 Audio Element Stop
    if (audioRef.current) {
      // Unbind event listeners first to prevent empty src triggering onerror asynchronously
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    // Disconnect playback source to allow reuse
    if (playbackSourceRef.current) {
      try { playbackSourceRef.current.disconnect(); } catch (_) {}
      playbackSourceRef.current = null;
    }
    // Browser Speech Synthesis Stop
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setAudioVolume(0);
  }, []);

  // Cleanup all audio contexts & streams
  const cleanup = useCallback(() => {
    stopAudio();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch((err) => console.warn('Mic context close error:', err));
    }
    if (playbackAudioContextRef.current && playbackAudioContextRef.current.state !== 'closed') {
      playbackAudioContextRef.current.close().catch((err) => console.warn('Playback context close error:', err));
    }
    isStartingRef.current = false;
    isRecordingRef.current = false;
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setIsRecording(false);
    setMicVolume(0);
  }, [stopAudio]);

  // 2a. Play synthesized base64 MP3 voice
  const playBase64Audio = useCallback((base64Data: string, text: string) => {
    stopAudio();
    
    // Create direct data URI
    const audioUrl = `data:audio/mpeg;base64,${base64Data}`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // Set up a dedicated playback AudioContext (separate from mic context)
    try {
      if (!playbackAudioContextRef.current || playbackAudioContextRef.current.state === 'closed') {
        playbackAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = playbackAudioContextRef.current;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      playbackAnalyserRef.current = analyser;

      // Connect element to analyser and destination
      const source = ctx.createMediaElementSource(audio);
      playbackSourceRef.current = source;
      source.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (e) {
      console.warn('Could not bind playback analyzer (often browser audio source restriction):', e);
    }

    audio.onplay = () => {
      setIsPlaying(true);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setAudioVolume(0);
      // Restart recording once AI finishes speaking so user can continue seamlessly
      if (!isMuted && startRecordingRef.current) {
        startRecordingRef.current();
      }
    };

    audio.onerror = (e) => {
      const mediaError = audio.error;
      console.warn('Audio playback error, falling back to local Speech Synthesis:', mediaError ? `${mediaError.code} - ${mediaError.message}` : e);
      setIsPlaying(false);
      setAudioVolume(0);
      // Fallback to browser Speech Synthesis
      if (playSpeechSynthesisRef.current) {
        playSpeechSynthesisRef.current(text);
      } else if (!isMuted && startRecordingRef.current) {
        startRecordingRef.current();
      }
    };

    audio.play().catch((err) => {
      console.warn('Playback block or fail, falling back to local Speech Synthesis:', err);
      setIsPlaying(false);
      // Fallback to browser Speech Synthesis
      if (playSpeechSynthesisRef.current) {
        playSpeechSynthesisRef.current(text);
      } else if (!isMuted && startRecordingRef.current) {
        startRecordingRef.current();
      }
    });
  }, [stopAudio, isMuted]);

  // 2b. Browser-native Text-to-Speech fallback
  const playSpeechSynthesis = useCallback((text: string) => {
    stopAudio();
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      if (!isMuted && startRecordingRef.current) {
        startRecordingRef.current();
      }
      return;
    }

    // Clean text: strip system prompts, markdown syntax, double asterisks
    const cleanedText = text
      .replace(/[*_`#\-]/g, '')
      .replace(/\[SYSTEM INSTRUCTION:.*?\]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanedText);

    // Fetch and search for a nice English voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Premium'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.rate = 1.05; // Slightly faster for natural tempo
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setAudioVolume(0);
      if (!isMuted && startRecordingRef.current) {
        startRecordingRef.current();
      }
    };

    utterance.onerror = (e) => {
      console.error('SpeechSynthesis error:', e);
      setIsPlaying(false);
      setAudioVolume(0);
      if (!isMuted && startRecordingRef.current) {
        startRecordingRef.current();
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [stopAudio, isMuted]);

  // Stop recording trigger — only stops the recorder itself.
  // Stream/context cleanup is deferred to recorder.onstop to allow proper audio finalization.
  const stopRecording = useCallback(() => {
    // 1. Cancel VAD analysis animation frame first
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // 2. Stop the MediaRecorder (triggers onstop asynchronously)
    // IMPORTANT: Do NOT stop stream tracks or close AudioContext here!
    // The MediaRecorder needs the stream alive to finalize the audio container.
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setMicVolume(0);
  }, []);

  // 3. Send audio blob to consolidated backend endpoint
  const sendAudioToBackend = useCallback(async (audioBlob: Blob, mimeType: string) => {
    onThinkingStateChange(true);
    setIsThinking(true);
    setError(null);

    // Map MIME type to correct file extension for backend Whisper decoder
    let extension = 'webm';
    if (mimeType.includes('mp4')) {
      extension = 'mp4';
    } else if (mimeType.includes('aac')) {
      extension = 'aac';
    } else if (mimeType.includes('ogg')) {
      extension = 'ogg';
    } else if (mimeType.includes('wav')) {
      extension = 'wav';
    }

    try {
      const response = await fetch(
        `${BASE_URL}/conversations/voice/chat?session_id=${sessionId}&filename=audio.${extension}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': mimeType || 'audio/webm',
          },
          body: audioBlob,
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Voice chat request failed');
      }

      const data = await response.json();
      
      // Update UI transcript with transcribed speech
      onSendMessage(data.user_transcript);
      
      // Update UI with AI's reply text
      onAddPersonaMessage(data.ai_response);

      // Play synthesized AI audio response if present, else fallback to local browser TTS
      if (data.audio_base64) {
        if (playBase64AudioRef.current) playBase64AudioRef.current(data.audio_base64, data.ai_response);
      } else {
        if (playSpeechSynthesisRef.current) playSpeechSynthesisRef.current(data.ai_response);
      }

      if (data.session_concluded) {
        onConclude(data.reflection);
      }
    } catch (err: any) {
      console.error('Error sending voice data:', err);
      setError(err.message || 'Error communicating with voice server');
      // If error occurs, restart listening after a brief delay to avoid race conditions
      if (!isMuted && startRecordingRef.current) {
        const restartFn = startRecordingRef.current;
        setTimeout(() => restartFn(), 500);
      }
    } finally {
      onThinkingStateChange(false);
      setIsThinking(false);
    }
  }, [sessionId, onSendMessage, onAddPersonaMessage, onThinkingStateChange, onConclude, isMuted]);

  // 4. Start Mic Recording
  const startRecording = useCallback(async () => {
    if (isMuted) return;
    if (isStartingRef.current || isRecordingRef.current) {
      console.log('startRecording already in progress or recording active, skipping');
      return;
    }
    isStartingRef.current = true;

    // Interrupt any active voice synthesis or playback
    stopAudio();

    setError(null);
    hasSpokenRef.current = false;
    silenceStartRef.current = null;
    recordingStartedAtRef.current = Date.now();

    // Stop any existing streams or context first to prevent stacking leaks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    try {
      // Security context check
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Microphone access is not supported by your browser in this context (requires HTTPS or localhost).'
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up Audio Context and Analyser for Mic / VAD
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      // If context is suspended (browser autoplay policy), resume it on user interaction
      if (audioCtx.state === 'suspended') {
        const resumeContext = async () => {
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume().catch((err) => console.warn('Could not resume audio context:', err));
          }
          window.removeEventListener('click', resumeContext);
          window.removeEventListener('touchstart', resumeContext);
        };
        window.addEventListener('click', resumeContext);
        window.addEventListener('touchstart', resumeContext);
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      micAnalyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      // Cross-browser MediaRecorder initialization
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = ''; // Let browser use default container
        }
      }

      const recorderOptions = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const activeMimeType = recorder.mimeType || mimeType || 'audio/webm';
        // Capture chunks immediately and clear the shared ref to prevent race conditions
        const chunks = [...audioChunksRef.current];
        audioChunksRef.current = [];
        const audioBlob = new Blob(chunks, { type: activeMimeType });
        
        const recordingDuration = Date.now() - recordingStartedAtRef.current;
        console.log(`Recording stopped: ${audioBlob.size} bytes, ${recordingDuration}ms duration`);

        // NOW release mic hardware and close context (safe — blob is already created)
        mediaRecorderRef.current = null;
        isRecordingRef.current = false;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
        
        // Only send if it has meaningful size AND duration
        if (audioBlob.size > MIN_AUDIO_BLOB_SIZE && recordingDuration > MIN_RECORDING_DURATION_MS && sendAudioToBackendRef.current) {
          sendAudioToBackendRef.current(audioBlob, activeMimeType);
        } else {
          console.log(`Skipping send: blob too small (${audioBlob.size}b) or too short (${recordingDuration}ms)`);
          // Restart recording to keep listening
          if (!isMuted && startRecordingRef.current) {
            startRecordingRef.current();
          }
        }
      };

      // Start recording (without timeslices to ensure a single, valid container is generated on stop)
      recorder.start();
      setIsRecording(true);
      isRecordingRef.current = true;
      isStartingRef.current = false;

      // 5. Real-time Analyser Loop (Waveform Bounce + VAD Silence Detector)
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      const analyzeAudio = () => {
        if (!recorder || recorder.state === 'inactive') return;

        // Analyse microphone volume
        analyser.getFloatTimeDomainData(dataArray);
        
        // Calculate Root Mean Square (RMS) volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / bufferLength);
        
        // Scale for UI animation (0 to 1)
        const uiVolume = Math.min(rms * 10, 1.0);
        setMicVolume(uiVolume);

        // VAD Logic (Voice Activity Detection)
        if (rms > SILENCE_THRESHOLD) {
          hasSpokenRef.current = true;
          silenceStartRef.current = null; // Reset silence timer
        } else if (hasSpokenRef.current) {
          // Only consider silence-based auto-stop if minimum recording duration has passed
          const elapsed = Date.now() - recordingStartedAtRef.current;
          if (elapsed < MIN_RECORDING_DURATION_MS) {
            // Too early — keep recording even if there's a silence gap
          } else if (silenceStartRef.current === null) {
            silenceStartRef.current = Date.now();
          } else if (Date.now() - silenceStartRef.current > SILENCE_DURATION_MS) {
            // Silence limit reached! Auto stop and transcribe
            console.log(`Silence detected after ${elapsed}ms, automatically sending audio...`);
            stopRecording();
            return;
          }
        }

        // Keep loop running
        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      };

      analyzeAudio();

    } catch (err: any) {
      console.error('Microphone access failed:', err);
      setError(err.message || 'Could not access microphone. Please check permissions.');
      setIsRecording(false);
      isRecordingRef.current = false;
      isStartingRef.current = false;
    }
  }, [stopAudio, isMuted, stopRecording]);

  // Bind Ref values so helper callbacks can be invoked circularly without TDZ
  startRecordingRef.current = startRecording;
  sendAudioToBackendRef.current = sendAudioToBackend;
  playBase64AudioRef.current = playBase64Audio;
  playSpeechSynthesisRef.current = playSpeechSynthesis;

  // Continuous loop to capture playing AI audio volume
  useEffect(() => {
    let ttsAnimationFrame: number;
    const playbackData = new Uint8Array(32);

    const checkPlaybackVolume = () => {
      if (isPlaying) {
        if (playbackAnalyserRef.current && audioRef.current && audioRef.current.src) {
          playbackAnalyserRef.current.getByteFrequencyData(playbackData);
          let sum = 0;
          for (let i = 0; i < playbackData.length; i++) {
            sum += playbackData[i];
          }
          const average = sum / playbackData.length;
          const normalized = Math.min(average / 128, 1.0);
          setAudioVolume(normalized);
        } else {
          // Simulated waveform bounce when browser speech synthesis is playing
          const simulatedVol = 0.15 + 0.35 * Math.sin(Date.now() / 120) * (0.6 + 0.4 * Math.random());
          setAudioVolume(simulatedVol);
        }
      } else {
        setAudioVolume(0);
      }
      ttsAnimationFrame = requestAnimationFrame(checkPlaybackVolume);
    };

    checkPlaybackVolume();

    return () => {
      cancelAnimationFrame(ttsAnimationFrame);
    };
  }, [isPlaying]);

  // Handle Mute changes
  useEffect(() => {
    if (isMuted) {
      stopRecording();
      stopAudio();
    } else {
      startRecording();
    }
  }, [isMuted, startRecording, stopRecording, stopAudio]);

  // Initial trigger on mount (cleanup only)
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    isRecording,
    isPlaying,
    isThinking,
    micVolume,
    audioVolume,
    error,
    startRecording,
    stopRecording,
    stopAudio,
  };
};
