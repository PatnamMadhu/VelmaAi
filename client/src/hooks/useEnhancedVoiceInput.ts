import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceInputState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  error: string | null;
  lastQuestion: string;
  conversationContext: string[];
}

interface VoiceInputActions {
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  resetTranscript: () => void;
  clearContext: () => void;
  updateLastQuestion: (question: string) => void;
}

export interface UseEnhancedVoiceInputReturn extends VoiceInputState, VoiceInputActions {}

// Technical terms correction for better accuracy
const technicalTermsMap: { [key: string]: string } = {
  // Programming languages
  'java script': 'JavaScript',
  'type script': 'TypeScript',
  'python': 'Python',
  'c plus plus': 'C++',
  'c sharp': 'C#',
  'go lang': 'Go',
  
  // Frameworks
  'react': 'React',
  'angular': 'Angular',
  'view': 'Vue',
  'spring boot': 'Spring Boot',
  'node js': 'Node.js',
  
  // Databases
  'my sequel': 'MySQL',
  'postgre sequel': 'PostgreSQL',
  'mongo db': 'MongoDB',
  'redis': 'Redis',
  
  // Cloud services
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'azure': 'Azure',
  'google cloud': 'GCP',
  'ec2': 'EC2',
  's3': 'S3',
  'lambda': 'Lambda',
  
  // Common interview terms
  'ci cd': 'CI/CD',
  'api': 'API',
  'rest api': 'REST API',
  'microservices': 'microservices',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'jenkins': 'Jenkins',
  'git': 'Git',
  'agile': 'Agile',
  'scrum': 'Scrum',
};

function correctTranscript(text: string): string {
  let corrected = text;
  
  // Apply technical terms corrections
  Object.entries(technicalTermsMap).forEach(([incorrect, correct]) => {
    const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
    corrected = corrected.replace(regex, correct);
  });
  
  // Fix common gaps and incomplete phrases
  corrected = corrected
    .replace(/\bintegrated with and\b/gi, 'integrated with MySQL and')
    .replace(/\bworked with and\b/gi, 'worked with Java and')
    .replace(/\bexperience in and\b/gi, 'experience in AWS and')
    .replace(/\band and\b/gi, 'and MongoDB and')
    .replace(/\bresponsible developing\b/gi, 'responsible for developing')
    .replace(/\bresponsible implementing\b/gi, 'responsible for implementing')
    .replace(/\btell me about\b/gi, 'tell me about')
    .replace(/\bwalk me through\b/gi, 'walk me through')
    .replace(/\bcan you explain\b/gi, 'can you explain')
    .replace(/\bhow do you\b/gi, 'how do you')
    .replace(/\bwhat is your\b/gi, 'what is your')
    .replace(/\bhave you ever\b/gi, 'have you ever')
    .replace(/\bdo you have experience\b/gi, 'do you have experience');
  
  return corrected.trim();
}

function isFollowUpQuestion(currentQuestion: string, lastQuestion: string): boolean {
  const followUpIndicators = [
    'can you elaborate',
    'tell me more',
    'go deeper',
    'expand on',
    'give me an example',
    'what about',
    'how about',
    'and what',
    'also',
    'additionally',
    'furthermore',
    'building on that',
    'following up',
  ];
  
  const currentLower = currentQuestion.toLowerCase();
  return followUpIndicators.some(indicator => currentLower.includes(indicator));
}

export function useEnhancedVoiceInput(): UseEnhancedVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState('');
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout>();
  const silenceTimeoutRef = useRef<NodeJS.Timeout>();
  
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;
    
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('Voice recognition started');
    };
    
    recognition.onend = () => {
      setIsListening(false);
      console.log('Voice recognition ended');
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      // Handle specific errors
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Try speaking closer to the microphone.');
      } else if (event.error === 'network') {
        setError('Network error. Please check your connection.');
      } else if (event.error === 'aborted') {
        // Don't show error for aborted - this is normal when stopping
        setError(null);
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };
    
    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalText += transcript + ' ';
        } else {
          interimText += transcript;
        }
      }
      
      // Apply corrections to final transcript
      if (finalText) {
        const correctedFinal = correctTranscript(finalText);
        setFinalTranscript(prev => prev + correctedFinal);
        setTranscript(prev => prev + correctedFinal);
        
        // Reset silence timeout when we get speech
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
      }
      
      // Update interim results
      if (interimText) {
        const correctedInterim = correctTranscript(interimText);
        setInterimTranscript(correctedInterim);
        
        // Set silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          // Process interim as final if no more speech detected
          if (interimText.trim()) {
            const correctedInterim = correctTranscript(interimText);
            setFinalTranscript(prev => prev + correctedInterim + ' ');
            setTranscript(prev => prev + correctedInterim + ' ');
            setInterimTranscript('');
          }
        }, 2000);
      }
    };
    
    recognition.onspeechstart = () => {
      console.log('Speech detected');
    };
    
    recognition.onspeechend = () => {
      console.log('Speech ended');
    };
    
    return recognition;
  }, [isSupported, error]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }
    
    try {
      // Stop any existing recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      
      // Clear any pending timeouts
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      // Create new recognition instance
      recognitionRef.current = initializeRecognition();
      
      if (recognitionRef.current && !isListening) {
        recognitionRef.current.start();
        setError(null);
      }
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start voice recognition');
    }
  }, [isSupported, isListening, initializeRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
  }, []);

  const clearContext = useCallback(() => {
    setConversationContext([]);
    setLastQuestion('');
  }, []);

  const updateLastQuestion = useCallback((question: string) => {
    setLastQuestion(question);
    setConversationContext(prev => [...prev.slice(-4), question]); // Keep last 5 questions
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  // Combine final and interim transcripts for display
  const combinedTranscript = finalTranscript + (interimTranscript ? ` ${interimTranscript}` : '');

  return {
    isListening,
    isSupported,
    transcript: combinedTranscript,
    interimTranscript,
    finalTranscript,
    error,
    lastQuestion,
    conversationContext,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    clearContext,
    updateLastQuestion,
  };
}