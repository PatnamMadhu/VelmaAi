import { useState, useRef, useCallback } from 'react';

interface VoiceSession {
  isActive: boolean;
  currentInput: string;
  startSession: () => void;
  endSession: () => void;
  updateInput: (input: string) => void;
  clearInput: () => void;
}

/**
 * Manages voice input sessions to ensure only current voice input is captured
 * and prevents capturing AI responses or previous conversation history
 */
export function useVoiceSession(): VoiceSession {
  const [isActive, setIsActive] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const sessionIdRef = useRef<string>('');

  const startSession = useCallback(() => {
    // Generate unique session ID
    sessionIdRef.current = `voice_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setIsActive(true);
    setCurrentInput('');
    console.log('Voice session started:', sessionIdRef.current);
  }, []);

  const endSession = useCallback(() => {
    setIsActive(false);
    console.log('Voice session ended:', sessionIdRef.current);
    sessionIdRef.current = '';
  }, []);

  const updateInput = useCallback((input: string) => {
    if (isActive) {
      setCurrentInput(input);
    }
  }, [isActive]);

  const clearInput = useCallback(() => {
    setCurrentInput('');
    console.log('Voice input cleared for session:', sessionIdRef.current);
  }, []);

  return {
    isActive,
    currentInput,
    startSession,
    endSession,
    updateInput,
    clearInput
  };
}