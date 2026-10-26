import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { sendConversationMessage, saveSessionInsight } from '../lib/conversationsApi';
import type { Message, ReflectionData } from '../types/conversation';
import { ConversationChat as ConversationChatComponent } from '../components/conversation/ConversationChat';
import { VoiceSession } from '../components/conversation/VoiceSession';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000';

export default function ConversationChat() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  // Session details loaded on start
  const [personaName, setPersonaName] = useState('Thinker');
  const [personaPortrait, setPersonaPortrait] = useState('');
  const [personaId, setPersonaId] = useState('');
  const [journeyTitle, setJourneyTitle] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<'text' | 'voice'>('text');

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [concluded, setConcluded] = useState(false);
  const [reflection, setReflection] = useState<ReflectionData | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const hasStreamedGreeting = useRef(false);

  // Word-by-word streaming effect
  const streamText = useCallback((text: string, messageId: string) => {
    const words = text.split(' ');
    let i = 0;
    streamIntervalRef.current = setInterval(() => {
      if (i < words.length) {
        setStreamingText((prev) => (i === 0 ? words[0] : prev + ' ' + words[i]));
        i++;
      } else {
        clearInterval(streamIntervalRef.current);
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, isStreaming: false, text } : m))
        );
        setStreamingText('');
      }
    }, 25);
  }, []);

  // Load session info from backend
  useEffect(() => {
    if (!sessionId) return;
    
    // Fetch current history/status for this session to hydrate state
    fetch(`${API_BASE}/conversations/history`)
      .then((r) => r.json())
      .then((history) => {
        const currentSession = history.find((s: any) => s.session_id === sessionId);
        if (currentSession) {
          setPersonaName(currentSession.persona_name);
          setPersonaPortrait(currentSession.persona_portrait);
          setPersonaId(currentSession.persona_id);
          setJourneyTitle(currentSession.journey_title);
          setMode(currentSession.mode);
          setConcluded(currentSession.concluded);
          setReflection(currentSession.reflection);
        }
      })
      .catch((err) => console.error('Error restoring session:', err));
  }, [sessionId]);

  // Load message logs from the backend session storage
  const reloadMessages = useCallback(async () => {
    try {
      const sessionRes = await fetch(`${API_BASE}/conversations/session/${sessionId}`);
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        // Map backend roles (user, assistant) to frontend sender (user, persona)
        const mappedMessages: Message[] = sessionData.messages
          .filter((m: any) => m.role !== 'system')
          .map((m: any, idx: number) => ({
            id: `${idx}`,
            sender: m.role === 'user' ? 'user' : 'persona',
            text: m.content
          }));
        
        // If it's a new session, stream the first greeting message
        if (mappedMessages.length === 1 && mappedMessages[0].sender === 'persona' && !hasStreamedGreeting.current) {
          hasStreamedGreeting.current = true;
          const greetingText = mappedMessages[0].text;
          setMessages([{ ...mappedMessages[0], text: '', isStreaming: true }]);
          setTimeout(() => streamText(greetingText, mappedMessages[0].id), 200);
        } else {
          setMessages(mappedMessages);
        }
      }
    } catch (err) {
      console.error('Failed to load session messages:', err);
    }
  }, [sessionId, streamText]);

  useEffect(() => {
    if (sessionId) {
      reloadMessages();
    }
  }, [sessionId, reloadMessages]);

  // Lock body scroll in text chat
  useEffect(() => {
    if (mode === 'text') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mode]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, streamingText]);

  const handleSend = async (textToSend?: string) => {
    const messageContent = textToSend || input;
    if (!messageContent.trim() || isTyping) return;

    const userMsgId = Date.now().toString();
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: messageContent
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await sendConversationMessage(sessionId!, messageContent);
      const personaMsgId = (Date.now() + 1).toString();
      setIsTyping(false);
      
      // Add a streaming placeholder
      setMessages((prev) => [
        ...prev,
        { id: personaMsgId, sender: 'persona', text: '', isStreaming: true }
      ]);
      
      setTimeout(() => streamText(res.response, personaMsgId), 100);

      if (res.session_concluded) {
        setConcluded(true);
        if (res.reflection) {
          setReflection(res.reflection);
        }
      }
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'persona',
          text: "I got lost in reflection for a moment. Could you repeat that?"
        }
      ]);
    }
  };

  const handleSaveInsight = async (summary: string, insight: string) => {
    try {
      await saveSessionInsight({
        session_id: sessionId!,
        persona_id: personaId,
        persona_name: personaName,
        persona_portrait: personaPortrait,
        journey_title: journeyTitle,
        summary,
        insight
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleEndSession = () => {
    navigate('/conversations/history');
  };

  // Voice session UI Overlay
  if (mode === 'voice') {
    // Map Message interface back to the VoiceSession simpler object array
    const mappedVoiceMsgs = messages.map((m) => ({
      sender: m.sender,
      text: m.text
    }));

    return (
      <VoiceSession
        persona={{
          id: personaId,
          name: personaName,
          dates: '',
          portrait: personaPortrait,
          bio: '',
          topics: [],
          category: '',
          opening_prompt: ''
        }}
        messages={mappedVoiceMsgs}
        isPersonaThinking={isTyping}
        onSwitchToText={() => setMode('text')}
        onEndSession={handleEndSession}
        sessionId={sessionId!}
        onVoiceExchange={(text, sender) => {
          setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), sender, text }
          ]);
        }}
        onConclude={(refl) => {
          setConcluded(true);
          if (refl) {
            setReflection(refl);
          }
          setMode('text');
        }}
        onThinkingStateChange={(thinking) => setIsTyping(thinking)}
      />
    );
  }

  return (
    <ConversationChatComponent
      personaName={personaName}
      personaPortrait={personaPortrait}
      journeyTitle={journeyTitle}
      messages={messages}
      input={input}
      setInput={setInput}
      isTyping={isTyping}
      streamingText={streamingText}
      concluded={concluded}
      reflection={reflection}
      onSend={() => handleSend()}
      onSaveInsight={handleSaveInsight}
      onEndSession={handleEndSession}
      onStartVoice={() => setMode('voice')}
      onBack={() => navigate('/conversations')}
      chatEndRef={chatEndRef}
      inputRef={inputRef}
    />
  );
}
