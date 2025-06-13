import { useState, useRef, useCallback, useEffect } from 'react';

// Technical terms correction mapping
const technicalTermsMap: { [key: string]: string } = {
  'brio': 'Brillio',
  'cap gemini': 'Capgemini',
  'capsule mini': 'Capgemini',
  'java script': 'JavaScript',
  'my sequel': 'MySQL',
  'node j s': 'Node.js',
  'react j s': 'React.js',
  'angular j s': 'Angular.js',
  'type script': 'TypeScript',
  'post man': 'Postman',
  'git hub': 'GitHub',
  'jenkins': 'Jenkins',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'spring boot': 'Spring Boot',
  'rest api': 'REST API',
  'graphql': 'GraphQL',
  'mongodb': 'MongoDB',
  'postgresql': 'PostgreSQL',
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'GCP',
  'ci cd': 'CI/CD',
  'devops': 'DevOps',
  'microservices': 'Microservices',
  'solid principle': 'SOLID principles',
  'solid principles': 'SOLID principles',
  'agile': 'Agile',
  'scrum': 'Scrum',
  'kanban': 'Kanban',
  'jira': 'Jira',
  'intellij': 'IntelliJ',
  'visual studio code': 'Visual Studio Code',
  'vs code': 'VS Code',
  'eclipse': 'Eclipse',
  'maven': 'Maven',
  'gradle': 'Gradle',
  'junit': 'JUnit',
  'mockito': 'Mockito',
  'hdfc': 'HDFC',
  'api': 'API',
  'html': 'HTML',
  'css': 'CSS',
  'bootstrap': 'Bootstrap',
  'angular': 'Angular',
  'react': 'React',
  'vue': 'Vue',
  'npm': 'NPM',
  'yarn': 'Yarn',
  'webpack': 'Webpack',
  'babel': 'Babel',
  'eslint': 'ESLint',
  'prettier': 'Prettier'
};

// Find the best alternative from speech recognition results
function findBestAlternative(alternatives: string[], defaultTranscript: string): string {
  for (const alt of alternatives) {
    const normalizedAlt = alt.toLowerCase().trim();
    if (technicalTermsMap[normalizedAlt]) {
      return technicalTermsMap[normalizedAlt];
    }
  }
  return defaultTranscript;
}

// Correct technical terms in the transcript
function correctTechnicalTerms(transcript: string): string {
  let corrected = transcript;
  
  // Check for exact matches first
  const lowerTranscript = transcript.toLowerCase().trim();
  if (technicalTermsMap[lowerTranscript]) {
    return technicalTermsMap[lowerTranscript];
  }
  
  // Check for partial matches and word boundaries
  Object.entries(technicalTermsMap).forEach(([incorrect, correct]) => {
    const regex = new RegExp(`\\b${incorrect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    corrected = corrected.replace(regex, correct);
  });
  
  return corrected;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionConstructor();

    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        let bestTranscript = result[0].transcript;
        
        // Use the best transcript from available results
        bestTranscript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += correctTechnicalTerms(bestTranscript);
        } else {
          interimTranscript += correctTechnicalTerms(bestTranscript);
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    return () => {
      if (recognition) {
        recognition.onstart = null;
        recognition.onend = null;
        recognition.onresult = null;
        recognition.onerror = null;
      }
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    if (!recognitionRef.current) return;

    try {
      setError(null);
      setTranscript('');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setError('Failed to start speech recognition');
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
