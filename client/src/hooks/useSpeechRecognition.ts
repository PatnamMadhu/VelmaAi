import { useState, useRef, useCallback, useEffect } from 'react';

// Technical terms correction mapping - Enhanced for slang and accents
const technicalTermsMap: { [key: string]: string } = {
  // Company names with common mispronunciations
  'brio': 'Brillio',
  'brilliant': 'Brillio',
  'brillio': 'Brillio',
  'cap gemini': 'Capgemini',
  'capsule mini': 'Capgemini',
  'cap gemeni': 'Capgemini',
  'capgemini': 'Capgemini',
  'accenture': 'Accenture',
  'aksancher': 'Accenture',
  'tcs': 'TCS',
  'tata consultancy': 'TCS',
  'infosys': 'Infosys',
  'wipro': 'Wipro',
  'hcl': 'HCL',
  'tech mahindra': 'Tech Mahindra',
  'cognizant': 'Cognizant',
  'deloitte': 'Deloitte',
  'pwc': 'PwC',
  'ey': 'EY',
  'kpmg': 'KPMG',
  
  // Programming languages with slang
  'java script': 'JavaScript',
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'java': 'Java',
  'python': 'Python',
  'pie thon': 'Python',
  'c plus plus': 'C++',
  'c sharp': 'C#',
  'c hash': 'C#',
  'see sharp': 'C#',
  'go lang': 'Go',
  'golang': 'Go',
  'rust': 'Rust',
  'swift': 'Swift',
  'kotlin': 'Kotlin',
  'dart': 'Dart',
  'ruby': 'Ruby',
  'php': 'PHP',
  'scala': 'Scala',
  'r': 'R',
  'matlab': 'MATLAB',
  
  // Databases with common slang
  'my sequel': 'MySQL',
  'my sql': 'MySQL',
  'mysql': 'MySQL',
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'post gres': 'PostgreSQL',
  'mongodb': 'MongoDB',
  'mongo db': 'MongoDB',
  'mongo': 'MongoDB',
  'redis': 'Redis',
  'cassandra': 'Cassandra',
  'elastic search': 'Elasticsearch',
  'elasticsearch': 'Elasticsearch',
  'oracle': 'Oracle',
  'sql server': 'SQL Server',
  'sqlite': 'SQLite',
  'maria db': 'MariaDB',
  'mariadb': 'MariaDB',
  
  // Frameworks with slang
  'node j s': 'Node.js',
  'nodejs': 'Node.js',
  'node': 'Node.js',
  'react j s': 'React.js',
  'react js': 'React.js',
  'reactjs': 'React.js',
  'react': 'React',
  'angular j s': 'Angular.js',
  'angular js': 'Angular.js',
  'angularjs': 'Angular.js',
  'angular': 'Angular',
  'vue j s': 'Vue.js',
  'vue js': 'Vue.js',
  'vuejs': 'Vue.js',
  'vue': 'Vue',
  'express j s': 'Express.js',
  'express js': 'Express.js',
  'expressjs': 'Express.js',
  'express': 'Express',
  'next j s': 'Next.js',
  'next js': 'Next.js',
  'nextjs': 'Next.js',
  'nest j s': 'Nest.js',
  'nest js': 'Nest.js',
  'nestjs': 'Nest.js',
  'spring boot': 'Spring Boot',
  'springboot': 'Spring Boot',
  'spring': 'Spring',
  'django': 'Django',
  'flask': 'Flask',
  'fast api': 'FastAPI',
  'fastapi': 'FastAPI',
  'laravel': 'Laravel',
  'rails': 'Rails',
  'ruby on rails': 'Ruby on Rails',
  
  // Tools and technologies
  'type script': 'TypeScript',
  'typescript': 'TypeScript',
  'post man': 'Postman',
  'postman': 'Postman',
  'git hub': 'GitHub',
  'github': 'GitHub',
  'git': 'Git',
  'jenkins': 'Jenkins',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'kube': 'Kubernetes',
  'terraform': 'Terraform',
  'ansible': 'Ansible',
  'puppet': 'Puppet',
  'chef': 'Chef',
  'vagrant': 'Vagrant',
  'webpack': 'Webpack',
  'babel': 'Babel',
  'eslint': 'ESLint',
  'prettier': 'Prettier',
  'jest': 'Jest',
  'mocha': 'Mocha',
  'chai': 'Chai',
  'cypress': 'Cypress',
  'selenium': 'Selenium',
  'puppeteer': 'Puppeteer',
  'playwright': 'Playwright',
  
  // API and web technologies
  'rest api': 'REST API',
  'restapi': 'REST API',
  'rest': 'REST',
  'graphql': 'GraphQL',
  'graph ql': 'GraphQL',
  'grpc': 'gRPC',
  'soap': 'SOAP',
  'json': 'JSON',
  'xml': 'XML',
  'yaml': 'YAML',
  'yml': 'YAML',
  'html': 'HTML',
  'css': 'CSS',
  'sass': 'Sass',
  'scss': 'SCSS',
  'less': 'Less',
  'bootstrap': 'Bootstrap',
  'tailwind': 'Tailwind',
  'tailwind css': 'Tailwind CSS',
  'material ui': 'Material-UI',
  'mui': 'Material-UI',
  'chakra ui': 'Chakra UI',
  'ant design': 'Ant Design',
  'semantic ui': 'Semantic UI',
  
  // Cloud platforms
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'azure': 'Azure',
  'microsoft azure': 'Azure',
  'gcp': 'GCP',
  'google cloud': 'GCP',
  'google cloud platform': 'GCP',
  'heroku': 'Heroku',
  'netlify': 'Netlify',
  'vercel': 'Vercel',
  'digital ocean': 'DigitalOcean',
  'digitalocean': 'DigitalOcean',
  'linode': 'Linode',
  'firebase': 'Firebase',
  'supabase': 'Supabase',
  
  // Development methodologies
  'ci cd': 'CI/CD',
  'ci/cd': 'CI/CD',
  'devops': 'DevOps',
  'dev ops': 'DevOps',
  'microservices': 'Microservices',
  'micro services': 'Microservices',
  'monolith': 'Monolith',
  'serverless': 'Serverless',
  'solid principle': 'SOLID principles',
  'solid principles': 'SOLID principles',
  'dry principle': 'DRY principle',
  'kiss principle': 'KISS principle',
  'yagni': 'YAGNI',
  'agile': 'Agile',
  'scrum': 'Scrum',
  'kanban': 'Kanban',
  'waterfall': 'Waterfall',
  'lean': 'Lean',
  'safe': 'SAFe',
  
  // Tools and IDEs
  'jira': 'Jira',
  'confluence': 'Confluence',
  'slack': 'Slack',
  'teams': 'Teams',
  'microsoft teams': 'Microsoft Teams',
  'zoom': 'Zoom',
  'intellij': 'IntelliJ',
  'intellij idea': 'IntelliJ IDEA',
  'visual studio code': 'Visual Studio Code',
  'vs code': 'VS Code',
  'vscode': 'VS Code',
  'visual studio': 'Visual Studio',
  'eclipse': 'Eclipse',
  'sublime text': 'Sublime Text',
  'atom': 'Atom',
  'vim': 'Vim',
  'emacs': 'Emacs',
  'nano': 'Nano',
  'notepad plus plus': 'Notepad++',
  'notepad++': 'Notepad++',
  
  // Build tools
  'maven': 'Maven',
  'gradle': 'Gradle',
  'ant': 'Ant',
  'make': 'Make',
  'cmake': 'CMake',
  'npm': 'npm',
  'yarn': 'Yarn',
  'pnpm': 'pnpm',
  'pip': 'pip',
  'conda': 'Conda',
  'poetry': 'Poetry',
  'bundler': 'Bundler',
  'composer': 'Composer',
  'cargo': 'Cargo',
  'go mod': 'Go mod',
  
  // Testing frameworks
  'junit': 'JUnit',
  'junit 5': 'JUnit 5',
  'testng': 'TestNG',
  'mockito': 'Mockito',
  'powermock': 'PowerMock',
  'hamcrest': 'Hamcrest',
  'spock': 'Spock',
  'rspec': 'RSpec',
  'minitest': 'Minitest',
  'pytest': 'pytest',
  'unittest': 'unittest',
  'nose': 'Nose',
  'jasmine': 'Jasmine',
  'karma': 'Karma',
  'protractor': 'Protractor',
  'webdriverio': 'WebDriverIO',
  
  // Banks and financial institutions (Indian context)
  'hdfc': 'HDFC',
  'hdfc bank': 'HDFC Bank',
  'icici': 'ICICI',
  'icici bank': 'ICICI Bank',
  'sbi': 'SBI',
  'state bank of india': 'State Bank of India',
  'axis bank': 'Axis Bank',
  'kotak': 'Kotak',
  'kotak mahindra': 'Kotak Mahindra',
  'yes bank': 'Yes Bank',
  'indusind': 'IndusInd',
  'indusind bank': 'IndusInd Bank',
  'pnb': 'PNB',
  'punjab national bank': 'Punjab National Bank',
  'boi': 'BOI',
  'bank of india': 'Bank of India',
  'bob': 'BOB',
  'bank of baroda': 'Bank of Baroda',
  'canara bank': 'Canara Bank',
  'union bank': 'Union Bank',
  'indian bank': 'Indian Bank',
  'central bank': 'Central Bank',
  
  // Common tech abbreviations
  'api': 'API',
  'sdk': 'SDK',
  'ide': 'IDE',
  'ui': 'UI',
  'ux': 'UX',
  'qa': 'QA',
  'qc': 'QC',
  'ba': 'BA',
  'pm': 'PM',
  'po': 'PO',
  'sm': 'SM',
  'dev': 'Dev',
  'prod': 'Prod',
  'staging': 'Staging',
  'uat': 'UAT',
  'sit': 'SIT',
  'it': 'IT',
  'db': 'DB',
  'os': 'OS',
  'vm': 'VM',
  'vps': 'VPS',
  'cdn': 'CDN',
  'dns': 'DNS',
  'ssl': 'SSL',
  'tls': 'TLS',
  'https': 'HTTPS',
  'http': 'HTTP',
  'ftp': 'FTP',
  'ssh': 'SSH',
  'vpn': 'VPN',
  'lan': 'LAN',
  'wan': 'WAN',
  'iot': 'IoT',
  'ai': 'AI',
  'ml': 'ML',
  'dl': 'DL',
  'nlp': 'NLP',
  'cv': 'CV',
  'ar': 'AR',
  'vr': 'VR',
  'mr': 'MR',
  'xr': 'XR'
};

// Find the best alternative from speech recognition results
function findBestAlternative(alternatives: string[], defaultTranscript: string): string {
  if (!alternatives || alternatives.length === 0) return defaultTranscript;
  
  // Create a combined pool of all alternatives
  const allOptions = [defaultTranscript, ...alternatives].filter(Boolean);
  
  // Score each option based on various factors
  const scoredOptions = allOptions.map(option => {
    let score = 0;
    const lowercased = option.toLowerCase();
    
    // High bonus for exact technical term matches
    Object.keys(technicalTermsMap).forEach(term => {
      if (lowercased.includes(term.toLowerCase())) {
        score += 5; // Increased weight for technical terms
      }
    });
    
    // Bonus for longer, more complete sentences
    if (option.length > 20) score += 2;
    if (option.split(' ').length > 3) score += 2;
    
    // Bonus for proper capitalization and punctuation
    if (/[A-Z]/.test(option)) score += 1;
    if (/[.!?]$/.test(option)) score += 1;
    
    // Penalty for very short or incomplete responses
    if (option.length < 5) score -= 3;
    if (option.split(' ').length < 2) score -= 2;
    
    // Bonus for containing common interview words
    const interviewWords = ['experience', 'project', 'technology', 'framework', 'database', 'api', 'development', 'team', 'challenge', 'solution'];
    interviewWords.forEach(word => {
      if (lowercased.includes(word)) score += 1;
    });
    
    return { text: option, score };
  });
  
  // Sort by score and return the best option
  scoredOptions.sort((a, b) => b.score - a.score);
  return scoredOptions[0]?.text || defaultTranscript;
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
    recognition.continuous = true; // Enable continuous listening
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Set max alternatives if supported (helps with accuracy for different accents)
    if ('maxAlternatives' in recognition) {
      (recognition as any).maxAlternatives = 5;
    }

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
        
        // Collect all alternatives for this result segment
        const alternatives: string[] = [];
        for (let j = 0; j < result.length && j < 5; j++) {
          if (result[j] && result[j].transcript) {
            alternatives.push(result[j].transcript);
          }
        }
        
        // Use enhanced alternative selection for better accuracy
        const bestTranscript = findBestAlternative(alternatives, result[0].transcript);

        if (result.isFinal) {
          const corrected = correctTechnicalTerms(bestTranscript);
          // Capitalize first letter and ensure proper sentence ending
          const capitalized = corrected.charAt(0).toUpperCase() + corrected.slice(1);
          finalTranscript += capitalized + (capitalized.match(/[.!?]$/) ? ' ' : '. ');
        } else {
          // For interim results, apply basic corrections for real-time feedback
          interimTranscript += correctTechnicalTerms(bestTranscript);
        }
      }

      // Clean up transcript and set the result
      const cleanedTranscript = (finalTranscript || interimTranscript).trim();
      setTranscript(cleanedTranscript);
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
