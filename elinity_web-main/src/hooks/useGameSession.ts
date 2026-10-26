import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_URL, type GameOfGamesDecisionProfile, type GameSession, type LongTableHistorySnapshot } from '../lib/gamesApi';

export interface UseGameSessionReturn {
  session: GameSession | null;
  isConnected: boolean;
  isHostTyping: boolean;
  error: string | null;
  toggleReady: (ready: boolean) => void;
  startGame: () => void;
  submitAnswer: (text: string) => void;
  passTurn: () => void;
  updateMood: (mood: string) => void;
  updateGameConfig: (config: Record<string, unknown>) => void;
  useVeto: () => void;
  submitPrivateAnswer: (text: string) => void;
  submitGuess: (text: string) => void;
  submitBluff: (text: string) => void;
  submitVote: (optionIndex: number) => void;
  nextPhase: () => void;
  submitDepthChoice: (choice: 'stay' | 'deeper' | 'release') => void;
  submitReleaseSentence: (starter: string, text: string, share: boolean) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  stopGame: () => void;
  submitTurncoatSetup: (position: string) => void;
  submitTurncoatStance: (side: 'agree' | 'disagree') => void;
  submitTurncoatPeerScores: (scores: Record<string, Record<string, number>>) => void;
  submitLettersCompass: (text: string, history: LongTableHistorySnapshot[]) => void;
  submitLettersOccasion: (text: string) => void;
  submitLettersIntake: (text: string | null) => void;
  confirmLettersSparseIntake: () => void;
  submitLettersResponse: (text: string, targetType?: 'all' | 'specific' | 'vote', targetAge?: string) => void;
  closeLettersSession: () => void;
  seedGameOfGamesProfile: (profile: GameOfGamesDecisionProfile) => void;
}

export function useGameSession(sessionId: string | undefined, username: string | null): UseGameSessionReturn {
  const [session, setSession] = useState<GameSession | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isHostTyping, setIsHostTyping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionId || !username) {
      setIsConnected(false);
      return;
    }

    const tokenKey = `elinity_game_token_${sessionId}_${username}`;
    let participantToken: string | null = null;
    try {
      participantToken = localStorage.getItem(tokenKey);
    } catch {
      setError('Private session access cannot be saved in this browser.');
    }
    const query = new URLSearchParams({ username });
    if (participantToken) {
      query.set('participant_token', participantToken);
    }
    const wsUrl = `${WS_URL}/games/ws/${sessionId}?${query.toString()}`;
    const wsOrigin = (() => {
      try {
        return new URL(wsUrl).origin;
      } catch {
        return WS_URL;
      }
    })();

    let cancelled = false;
    let retryAttempted = false;
    let retryTimer: number | undefined;
    let receivedGameState = false;
    let receivedServerError = false;

    const connectionError = `Failed to establish WebSocket connection to ${wsOrigin}. Make sure the backend server is running and VITE_API_URL points to the backend URL.`;

    const clearStoredToken = () => {
      try {
        localStorage.removeItem(tokenKey);
      } catch {
        // If storage is unavailable, the retry can still continue without a token.
      }
    };

    const connect = (token: string | null) => {
      const nextQuery = new URLSearchParams({ username });
      if (token) {
        nextQuery.set('participant_token', token);
      }
      const nextWsUrl = `${WS_URL}/games/ws/${sessionId}?${nextQuery.toString()}`;
      const socket = new WebSocket(nextWsUrl);
      socketRef.current = socket;

      const retryWithoutStoredToken = (reason: string): boolean => {
        if (!token || retryAttempted || receivedGameState || receivedServerError || cancelled) {
          return false;
        }

        retryAttempted = true;
        clearStoredToken();
        setIsConnected(false);
        setError('Refreshing game connection credentials...');
        console.warn(`Retrying game WebSocket without stored participant token: ${reason}`);

        retryTimer = window.setTimeout(() => {
          if (!cancelled) {
            connect(null);
          }
        }, 200);

        return true;
      };

      socket.onopen = () => {
        if (cancelled || socketRef.current !== socket) return;
        setIsConnected(true);
        setError(null);
      };

      socket.onmessage = (event) => {
        if (cancelled || socketRef.current !== socket) return;

        try {
          const message = JSON.parse(event.data);
          const { type, payload } = message;

          if (type === "game_state") {
            receivedGameState = true;
            setSession(payload as GameSession);
          } else if (type === "participant_token" && typeof payload === "string") {
            try {
              localStorage.setItem(tokenKey, payload);
            } catch {
              setError('Private session access could not be saved. Keep this page open until the session ends.');
            }
          } else if (type === "host_typing") {
            setIsHostTyping(payload as boolean);
          } else if (type === "error") {
            receivedServerError = true;
            setError(message.message || "An error occurred");
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        if (retryWithoutStoredToken('socket error')) return;
        if (!cancelled && socketRef.current === socket) {
          setError(prev => prev || connectionError);
        }
      };

      socket.onclose = (event) => {
        if (event.code !== 1000 && event.reason) {
          console.warn(`Game connection closed: ${event.reason}`);
        }

        if (retryWithoutStoredToken(event.reason || `close code ${event.code}`)) return;

        if (!cancelled && socketRef.current === socket) {
          setIsConnected(false);
        }
      };
    };

    connect(participantToken);

    return () => {
      cancelled = true;
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }
      const socket = socketRef.current;
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
      socketRef.current = null;
    };
  }, [sessionId, username]);

  const sendAction = useCallback((type: string, data: Record<string, unknown> = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, data }));
    } else {
      console.error("WebSocket is not connected.");
      setError(prev => prev || "Cannot send action because the live game connection is not open yet. Wait for Connected, then try again.");
    }
  }, []);

  const toggleReady = useCallback((ready: boolean) => {
    sendAction("toggle_ready", { is_ready: ready });
  }, [sendAction]);

  const startGame = useCallback(() => {
    sendAction("start_game");
  }, [sendAction]);

  const submitAnswer = useCallback((text: string) => {
    sendAction("submit_answer", { text });
  }, [sendAction]);

  const passTurn = useCallback(() => {
    sendAction("pass_turn");
  }, [sendAction]);

  const updateMood = useCallback((mood: string) => {
    sendAction("update_mood", { mood });
  }, [sendAction]);

  const updateGameConfig = useCallback((config: Record<string, unknown>) => {
    sendAction("update_game_config", config);
  }, [sendAction]);

  const useVeto = useCallback(() => {
    sendAction("use_veto");
  }, [sendAction]);

  const submitPrivateAnswer = useCallback((text: string) => {
    sendAction("submit_private_answer", { text });
  }, [sendAction]);

  const submitGuess = useCallback((text: string) => {
    sendAction("submit_guess", { text });
  }, [sendAction]);

  const submitBluff = useCallback((text: string) => {
    sendAction("submit_bluff", { text });
  }, [sendAction]);

  const submitVote = useCallback((optionIndex: number) => {
    sendAction("submit_vote", { option_index: optionIndex });
  }, [sendAction]);

  const nextPhase = useCallback(() => {
    sendAction("next_phase");
  }, [sendAction]);

  const submitDepthChoice = useCallback((choice: 'stay' | 'deeper' | 'release') => {
    sendAction("submit_depth_choice", { choice });
  }, [sendAction]);

  const submitReleaseSentence = useCallback((starter: string, text: string, share: boolean) => {
    sendAction("submit_release_sentence", { starter, text, share });
  }, [sendAction]);

  const pauseGame = useCallback(() => sendAction("pause_game"), [sendAction]);
  const resumeGame = useCallback(() => sendAction("resume_game"), [sendAction]);
  const stopGame = useCallback(() => sendAction("stop_game"), [sendAction]);
  const submitTurncoatSetup = useCallback((position: string) => {
    sendAction("submit_turncoat_setup", { position });
  }, [sendAction]);
  const submitTurncoatStance = useCallback((side: 'agree' | 'disagree') => {
    sendAction("submit_turncoat_stance", { side });
  }, [sendAction]);
  const submitTurncoatPeerScores = useCallback((scores: Record<string, Record<string, number>>) => {
    sendAction("submit_turncoat_peer_scores", { scores });
  }, [sendAction]);
  const submitLettersCompass = useCallback((text: string, history: LongTableHistorySnapshot[]) => {
    sendAction("submit_letters_compass", { text, history });
  }, [sendAction]);
  const submitLettersOccasion = useCallback((text: string) => {
    sendAction("submit_letters_occasion", { text });
  }, [sendAction]);
  const submitLettersIntake = useCallback((text: string | null) => {
    sendAction("submit_letters_intake", { text: text || '', passed: text === null });
  }, [sendAction]);
  const confirmLettersSparseIntake = useCallback(() => {
    sendAction("confirm_letters_sparse_intake");
  }, [sendAction]);
  const submitLettersResponse = useCallback((text: string, targetType: 'all' | 'specific' | 'vote' = 'all', targetAge?: string) => {
    sendAction("submit_answer", { text, target_type: targetType, target_age: targetAge });
  }, [sendAction]);
  const closeLettersSession = useCallback(() => {
    sendAction("close_letters_session");
  }, [sendAction]);
  const seedGameOfGamesProfile = useCallback((profile: GameOfGamesDecisionProfile) => {
    sendAction("seed_game_of_games_profile", { profile });
  }, [sendAction]);

  return {
    session,
    isConnected,
    isHostTyping,
    error,
    toggleReady,
    startGame,
    submitAnswer,
    passTurn,
    updateMood,
    updateGameConfig,
    useVeto,
    submitPrivateAnswer,
    submitGuess,
    submitBluff,
    submitVote,
    nextPhase,
    submitDepthChoice,
    submitReleaseSentence,
    pauseGame,
    resumeGame,
    stopGame,
    submitTurncoatSetup,
    submitTurncoatStance,
    submitTurncoatPeerScores,
    submitLettersCompass,
    submitLettersOccasion,
    submitLettersIntake,
    confirmLettersSparseIntake,
    submitLettersResponse,
    closeLettersSession,
    seedGameOfGamesProfile
  };
}
