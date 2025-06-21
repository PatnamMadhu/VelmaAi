import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceInputState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
}

interface VoiceInputActions {
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  resetTranscript: () => void;
}

export interface UseSimpleVoiceInputReturn extends VoiceInputState, VoiceInputActions {}

// Technical terms correction
const technicalTermsMap: { [key: string]: string } = {
  'java script': 'JavaScript',
  'type script': 'TypeScript',
  'my sequel': 'MySQL',
  'postgre sequel': 'PostgreSQL',
  'mongo db': 'MongoDB',
  'aws': 'AWS',
  'ec2': 'EC2',
  's3': 'S3',
  'lambda': 'Lambda',
  'spring boot': 'Spring Boot',
  'node js': 'Node.js',
  'react': 'React',
  'angular': 'Angular',
  'ci cd': 'CI/CD',
  'api': 'API',
  'rest api': 'REST API',
};

function correctTranscript(text: string): string {
  let corrected = text;
  
  Object.entries(technicalTermsMap).forEach(([incorrect, correct]) => {
    const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
    corrected = corrected.replace(regex, correct);
  });
  
  return corrected
    .replace(/\btell me about\b/gi, 'tell me about')
    .replace(/\bwalk me through\b/gi, 'walk me through')
    .replace(/\bcan you explain\b/gi, 'can you explain')
    .replace(/\bhow do you\b/gi, 'how do you')
    .replace(/\bwhat is your\b/gi, 'what is your')
    .replace(/\bhave you ever\b/gi, 'have you ever')
    .trim();
}

export function useSimpleVoiceInput(): UseSimpleVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }
    
    // Stop any existing recognition
    stopListening();
    
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone permissions.');
        } else if (event.error === 'no-speech') {
          setError('No speech detected. Try speaking closer to the microphone.');
        } else if (event.error === 'network') {
          setError('Network error. Please check your connection.');
        } else if (event.error !== 'aborted') {
          setError(`Speech recognition error: ${event.error}`);
        }
      };
      
      recognition.onresult = (event) => {
        let finalText = '';
        let interimText = '';
        
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript + ' ';
          } else {
            interimText += result[0].transcript;
          }
        }
        
        const combinedText = (finalText + interimText).trim();
        if (combinedText) {
          setTranscript(correctTranscript(combinedText));
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start voice recognition');
      setIsListening(false);
    }
  }, [isSupported, stopListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}