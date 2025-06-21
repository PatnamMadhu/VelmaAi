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
  
  // Frontend/Backend terminology
  'front end': 'frontend',
  'frontend': 'frontend',
  'front-end': 'frontend',
  'fainting': 'frontend',
  'frant end': 'frontend',
  'front and': 'frontend',
  'fronted': 'frontend',
  'back end': 'backend',
  'backend': 'backend',
  'back-end': 'backend',
  'back and': 'backend',
  'backed': 'backend',
  'full stack': 'full stack',
  'fullstack': 'full stack',
  'full-stack': 'full stack',
  'full stuck': 'full stack',
  
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
        score += 10; // Higher weight for technical terms
      }
    });
    
    // Bonus for containing correctable terms (shows potential for improvement)
    const correctableTerms = ['front', 'back', 'end', 'script', 'node', 'react', 'angular', 'java', 'python', 'data', 'base', 'api', 'sql'];
    correctableTerms.forEach(term => {
      if (lowercased.includes(term)) score += 3;
    });
    
    // Bonus for longer, more complete sentences
    if (option.length > 20) score += 2;
    if (option.split(' ').length > 3) score += 2;
    
    // Higher bonus for proper sentence structure
    if (/^[A-Z]/.test(option)) score += 2; // Starts with capital
    if (/[.!?]$/.test(option)) score += 1; // Ends with punctuation
    if (option.includes(' and ') || option.includes(' with ') || option.includes(' using ')) score += 1; // Natural connectors
    
    // Penalty for very short or incomplete responses
    if (option.length < 5) score -= 5;
    if (option.split(' ').length < 2) score -= 3;
    
    // Penalty for nonsense words or unclear speech
    const nonsenseIndicators = ['umm', 'uhh', 'err', 'hmm', '...'];
    nonsenseIndicators.forEach(indicator => {
      if (lowercased.includes(indicator)) score -= 2;
    });
    
    // Bonus for containing common interview and tech words
    const interviewWords = ['experience', 'project', 'technology', 'framework', 'database', 'api', 'development', 'team', 'challenge', 'solution', 'worked', 'built', 'created', 'implemented', 'used', 'technologies', 'skills', 'knowledge'];
    interviewWords.forEach(word => {
      if (lowercased.includes(word)) score += 2;
    });
    
    // Bonus for grammatically correct patterns
    if (lowercased.includes('i have') || lowercased.includes('i worked') || lowercased.includes('i used') || lowercased.includes('i built')) score += 3;
    
    return { text: option, score };
  });
  
  // Sort by score and return the best option
  scoredOptions.sort((a, b) => b.score - a.score);
  return scoredOptions[0]?.text || defaultTranscript;
}

// Correct technical terms in the transcript with enhanced slang and accent handling
function correctTechnicalTerms(transcript: string): string {
  let corrected = transcript;
  
  // Check for exact matches first
  const lowerTranscript = transcript.toLowerCase().trim();
  if (technicalTermsMap[lowerTranscript]) {
    return technicalTermsMap[lowerTranscript];
  }
  
  // Enhanced correction with fuzzy matching for slang and accents
  Object.entries(technicalTermsMap).forEach(([incorrect, correct]) => {
    // Exact word boundary matches
    const exactRegex = new RegExp(`\\b${incorrect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    corrected = corrected.replace(exactRegex, correct);
    
    // Handle comprehensive accent variations and speech patterns
    const accentVariations = [
      // Indian accent variations
      incorrect.replace(/v/g, 'w').replace(/w/g, 'v'), // v/w confusion
      incorrect.replace(/th/g, 'd').replace(/d/g, 'th'), // th/d variations
      incorrect.replace(/er$/g, 'a'), // -er to -a endings
      incorrect.replace(/ing$/g, 'in'), // -ing to -in endings
      
      // Common mispronunciations
      incorrect.replace(/tion/g, 'shun'),
      incorrect.replace(/sure/g, 'cher'),
      incorrect.replace(/ture/g, 'cher'),
      
      // Syllable stress variations
      incorrect.replace(/([aeiou])([bcdfghjklmnpqrstvwxyz])\1/g, '$1$2'), // Remove doubled vowels
      incorrect.replace(/([bcdfghjklmnpqrstvwxyz])\1+/g, '$1'), // Remove doubled consonants
      
      // Additional phonetic variations for better recognition
      incorrect.replace(/f/g, 'ph').replace(/ph/g, 'f'), // f/ph confusion
      incorrect.replace(/s/g, 'z').replace(/z/g, 's'), // s/z confusion
      incorrect.replace(/c/g, 'k').replace(/k/g, 'c'), // c/k confusion
      incorrect.replace(/x/g, 'ks').replace(/ks/g, 'x'), // x/ks variations
      
      // Vowel confusion patterns common in accents
      incorrect.replace(/a/g, 'e').replace(/e/g, 'a'), // a/e confusion
      incorrect.replace(/i/g, 'e').replace(/e/g, 'i'), // i/e confusion
      incorrect.replace(/o/g, 'a').replace(/a/g, 'o'), // o/a confusion
      
      // Silent letter handling
      incorrect.replace(/h/g, ''), // Silent h
      incorrect.replace(/([bcdgkpt])$/g, ''), // Silent final consonants
      
      // Common speech patterns
      incorrect.replace(/ly$/g, 'lee'), // -ly to -lee
      incorrect.replace(/ary$/g, 'ery'), // -ary to -ery
      incorrect.replace(/ory$/g, 'ary'), // -ory to -ary
      
      // Stress pattern variations
      incorrect.charAt(0).toUpperCase() + incorrect.slice(1), // Capitalize first letter
      incorrect.toLowerCase(), // All lowercase
    ];
    
    accentVariations.forEach(variation => {
      if (variation !== incorrect && variation.length > 2) {
        const variationRegex = new RegExp(`\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        corrected = corrected.replace(variationRegex, correct);
      }
    });
  });
  
  // Comprehensive corrections for speech recognition errors across all words
  corrected = corrected
    // Fix common homophones in tech context
    .replace(/\brite\b/gi, 'write')
    .replace(/\bread\b/gi, 'read')
    .replace(/\bthere\b/gi, 'their')
    .replace(/\byour\b/gi, 'you are')
    .replace(/\bits\b/gi, "it's")
    .replace(/\btoo\b/gi, 'to')
    .replace(/\bfor\b/gi, 'for')
    
    // Fix common frontend/backend mispronunciations
    .replace(/\bfainting\b/gi, 'frontend')
    .replace(/\bfrant end\b/gi, 'frontend')
    .replace(/\bfront and\b/gi, 'frontend')
    .replace(/\bfronted\b/gi, 'frontend')
    .replace(/\bfrontent\b/gi, 'frontend')
    .replace(/\bbackend\b/gi, 'backend')
    .replace(/\bback and\b/gi, 'backend')
    .replace(/\bbacked\b/gi, 'backend')
    .replace(/\bfull stack\b/gi, 'full stack')
    .replace(/\bfull stuck\b/gi, 'full stack')
    
    // Common word mispronunciations due to accents
    .replace(/\bwith\b/gi, 'with')
    .replace(/\bwid\b/gi, 'with')
    .replace(/\bwhen\b/gi, 'when')
    .replace(/\bwen\b/gi, 'when')
    .replace(/\bwhat\b/gi, 'what')
    .replace(/\bwat\b/gi, 'what')
    .replace(/\bwhere\b/gi, 'where')
    .replace(/\bwere\b/gi, 'where')
    .replace(/\bwhich\b/gi, 'which')
    .replace(/\bwich\b/gi, 'which')
    .replace(/\bthis\b/gi, 'this')
    .replace(/\bdis\b/gi, 'this')
    .replace(/\bthat\b/gi, 'that')
    .replace(/\bdat\b/gi, 'that')
    .replace(/\bthese\b/gi, 'these')
    .replace(/\bdese\b/gi, 'these')
    .replace(/\bthose\b/gi, 'those')
    .replace(/\bdose\b/gi, 'those')
    
    // Technical interview common words
    .replace(/\bexperience\b/gi, 'experience')
    .replace(/\bexperiens\b/gi, 'experience')
    .replace(/\bproject\b/gi, 'project')
    .replace(/\bprojects\b/gi, 'projects')
    .replace(/\btechnology\b/gi, 'technology')
    .replace(/\btechnologies\b/gi, 'technologies')
    .replace(/\btecnology\b/gi, 'technology')
    .replace(/\bframework\b/gi, 'framework')
    .replace(/\bframeworks\b/gi, 'frameworks')
    .replace(/\bdatabase\b/gi, 'database')
    .replace(/\bdatabases\b/gi, 'databases')
    .replace(/\bdevelopment\b/gi, 'development')
    .replace(/\bdeveloping\b/gi, 'developing')
    .replace(/\bdeveloper\b/gi, 'developer')
    .replace(/\bapplication\b/gi, 'application')
    .replace(/\bapplications\b/gi, 'applications')
    
    // Common pronunciation variations
    .replace(/\babout\b/gi, 'about')
    .replace(/\babout\b/gi, 'about')
    .replace(/\bworked\b/gi, 'worked')
    .replace(/\bwork\b/gi, 'work')
    .replace(/\bworking\b/gi, 'working')
    .replace(/\bused\b/gi, 'used')
    .replace(/\busing\b/gi, 'using')
    .replace(/\bcreated\b/gi, 'created')
    .replace(/\bcreate\b/gi, 'create')
    .replace(/\bcreating\b/gi, 'creating')
    .replace(/\bbuilt\b/gi, 'built')
    .replace(/\bbuild\b/gi, 'build')
    .replace(/\bbuilding\b/gi, 'building')
    .replace(/\bimplemented\b/gi, 'implemented')
    .replace(/\bimplement\b/gi, 'implement')
    .replace(/\bimplementing\b/gi, 'implementing')
    
    // Fix common tech term corruptions
    .replace(/\bjava script\b/gi, 'JavaScript')
    .replace(/\bnode js\b/gi, 'Node.js')
    .replace(/\breact js\b/gi, 'React.js')
    .replace(/\bangular js\b/gi, 'Angular.js')
    .replace(/\btype script\b/gi, 'TypeScript')
    .replace(/\bmy sql\b/gi, 'MySQL')
    .replace(/\bpost gres\b/gi, 'PostgreSQL')
    .replace(/\bmongo db\b/gi, 'MongoDB')
    .replace(/\bgit hub\b/gi, 'GitHub')
    .replace(/\bpost man\b/gi, 'Postman')
    .replace(/\brest api\b/gi, 'REST API')
    .replace(/\bgraph ql\b/gi, 'GraphQL')
    .replace(/\bspring boot\b/gi, 'Spring Boot')
    .replace(/\bvisual studio code\b/gi, 'Visual Studio Code')
    .replace(/\bvs code\b/gi, 'VS Code')
    
    // Fix number pronunciations in tech context
    .replace(/\bwon\b/gi, 'one')
    .replace(/\btoo\b/gi, 'two')
    .replace(/\bfor\b/gi, 'four')
    .replace(/\bate\b/gi, 'eight')
    
    // Clean up extra spaces and formatting
    .replace(/\s+/g, ' ')
    .trim();
  
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
  
  // Adaptive learning storage for user-specific patterns
  const userPatternsRef = useRef<{ [key: string]: string }>({});

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
    
    // Extend listening timeout for longer sessions
    if ('speechTimeoutMs' in recognition) {
      (recognition as any).speechTimeoutMs = 30000; // 30 seconds
    }
    if ('speechStartTimeoutMs' in recognition) {
      (recognition as any).speechStartTimeoutMs = 10000; // 10 seconds to start
    }
    if ('speechEndTimeoutMs' in recognition) {
      (recognition as any).speechEndTimeoutMs = 5000; // 5 seconds after speech ends
    }

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      // Auto-restart if we were listening (handles browser timeouts)
      if (isListening) {
        setTimeout(() => {
          try {
            if (recognitionRef.current && isListening) {
              recognitionRef.current.start();
            }
          } catch (error) {
            console.log('Auto-restart failed, user may have stopped manually');
            setIsListening(false);
          }
        }, 100); // Small delay to prevent rapid restarts
      } else {
        setIsListening(false);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let completeTranscript = '';

      // Process all results to build complete transcript
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        
        if (result.isFinal) {
          // For final results, use the best alternative and apply corrections
          const alternatives: string[] = [];
          for (let j = 0; j < Math.min(result.length, 3); j++) {
            if (result[j] && result[j].transcript) {
              alternatives.push(result[j].transcript);
            }
          }
          
          const bestTranscript = findBestAlternative(alternatives, result[0].transcript);
          const corrected = correctTechnicalTerms(bestTranscript);
          completeTranscript += corrected + ' ';
        } else {
          // For interim results, use simple correction
          const interim = correctTechnicalTerms(result[0].transcript);
          completeTranscript += interim + ' ';
        }
      }

      // Clean up and set the final transcript
      const cleanedTranscript = completeTranscript
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanedTranscript) {
        setTranscript(cleanedTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      
      // Handle different types of errors
      if (event.error === 'no-speech') {
        // Don't show error for no-speech, just continue listening
        console.log('No speech detected, continuing to listen...');
        return;
      } else if (event.error === 'aborted') {
        // User manually stopped, don't restart
        setIsListening(false);
        return;
      } else if (event.error === 'network') {
        setError('Network error - check your internet connection');
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission denied - please allow microphone access');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      
      // For other errors, try to restart after a delay
      setIsListening(false);
      if (isListening) {
        setTimeout(() => {
          try {
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          } catch (error) {
            console.log('Failed to restart after error');
          }
        }, 2000); // 2 second delay before restart
      }
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
