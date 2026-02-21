
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import JobTracker from './components/JobTracker';
import ResumeBuilder from './components/ResumeBuilder';
import AvatarGenerator from './components/AvatarGenerator';
import NtimChat from './components/ClaireChat';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import AuthScreen from './components/AuthScreen';
import { ToastProvider } from './components/Toast';
import { NotificationProvider, useNotifications } from './components/NotificationContext';
import NotificationBell from './components/NotificationBell';
import { Job, ViewState, Resume, Message, JobStatus, Theme, AppSettings } from './types';
import { Menu, Sun, Moon, Monitor } from 'lucide-react';

// --- MOCK DATA START ---

// Helper to generate dynamic dates so the dashboard always looks alive
const getPastDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

const MOCK_JOBS: Job[] = [
  {
    id: 'job-1',
    company: 'Nebula Stream',
    role: 'Senior Frontend Engineer',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$160k - $180k',
    status: JobStatus.INTERVIEW,
    dateApplied: getPastDate(2),
    description: 'We are looking for a Senior Frontend Engineer to lead our video streaming platform UI. You will work with React, WebGL, and WebSockets to deliver high-performance video experiences.',
    coverLetter: 'Dear Hiring Manager,\n\nI am thrilled to apply for the Senior Frontend Engineer position at Nebula Stream. As a passionate consumer of streaming content and a developer with 6 years of experience in high-performance web applications, I am excited about the challenge of optimizing video delivery UI...',
    email: 'talent@nebulastream.io',
    origin: 'application',
    redFlags: {
      pros: ["High Performance Tech Stack", "Hybrid Work"],
      cons: ["Startups often have long hours"],
      verdict: "Safe"
    }
  },
  {
    id: 'job-2',
    company: 'Quantum FinTech',
    role: 'Full Stack Developer',
    location: 'New York, NY',
    salary: '$150k + Bonus',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(5),
    description: 'Join our high-frequency trading platform team. Requires deep knowledge of Node.js, low-latency systems, and React for data visualization dashboards.',
    coverLetter: '',
    email: 'careers@quantumfin.tech',
    origin: 'application'
  },
  {
    id: 'job-3',
    company: 'EcoVision',
    role: 'Product Designer / Dev',
    location: 'Remote (Europe)',
    salary: '€80k - €100k',
    status: JobStatus.OFFER,
    dateApplied: getPastDate(15),
    description: 'Help us design the future of sustainable energy monitoring. You will be bridging the gap between design (Figma) and implementation (React/Tailwind).',
    interviewGuide: '**Company Insight:** EcoVision is heavily focused on green tech...\n\n**Key Questions:**\n1. How do you handle design handoffs?\n2. Experience with D3.js?',
    email: 'hello@ecovision.eu',
    origin: 'offer',
    negotiation: {
      script: "I'm very excited about the offer to join EcoVision. Based on my research of similar roles in the market and my specialized experience with React and D3.js, I was hoping we could discuss moving the base salary to €95k...",
      strategy: "Focus on your unique hybrid design/dev skills which are rare."
    }
  },
  {
    id: 'job-4',
    company: 'CyberGuard Security',
    role: 'Security Engineer',
    location: 'Austin, TX',
    salary: '$140k',
    status: JobStatus.REJECTED,
    dateApplied: getPastDate(20),
    description: 'Focus on application security and penetration testing for our enterprise clients.',
    coverLetter: 'Dear Hiring Team...',
    email: 'jobs@cyberguard.sec',
    origin: 'application'
  },
  {
    id: 'job-5',
    company: 'Global Logistics Co.',
    role: 'Solutions Architect',
    location: 'Chicago, IL',
    salary: '$175k',
    status: JobStatus.ACCEPTED,
    dateApplied: getPastDate(10),
    description: 'Architecting the next gen logistics tracking system using microservices.',
    coverLetter: '',
    email: 'hr@global-logistics.com',
    origin: 'application'
  },
  {
    id: 'job-6',
    company: 'AutoDrive AI',
    role: 'Machine Learning Engineer',
    location: 'Pittsburgh, PA',
    salary: '$190k',
    status: JobStatus.INTERVIEW,
    dateApplied: getPastDate(3),
    description: 'Developing computer vision models for autonomous vehicle navigation systems using PyTorch and TensorFlow.',
    email: 'careers@autodrive.ai',
    origin: 'application',
    interviewGuide: '**Company Insight:** AutoDrive is a leader in L4 autonomy...\n\n**Key Questions:**\n1. Explain object detection architectures.\n2. How do you handle sensor fusion?'
  },
  {
    id: 'job-7',
    company: 'Streamline Commerce',
    role: 'Backend Engineer',
    location: 'Remote (US)',
    salary: '$145k - $165k',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(8),
    description: 'Building scalable e-commerce APIs with Node.js and GraphQL to handle Black Friday traffic loads.',
    email: 'jobs@streamline.com',
    origin: 'application'
  },
  {
    id: 'job-8',
    company: 'BlueSky Banking',
    role: 'Mobile Developer (iOS)',
    location: 'Charlotte, NC',
    salary: '$150k',
    status: JobStatus.REJECTED,
    dateApplied: getPastDate(25),
    description: 'Main iOS app development using Swift and SwiftUI for a major regional bank.',
    email: 'recruiting@bluesky.bank',
    origin: 'application'
  },
  {
    id: 'job-9',
    company: 'GreenEnergy Systems',
    role: 'Full Stack Engineer',
    location: 'Seattle, WA',
    salary: '$170k + Equity',
    status: JobStatus.OFFER,
    dateApplied: getPastDate(12),
    description: 'Developing IoT dashboards for solar panel array monitoring using React and Python.',
    email: 'hr@greenenergy.sys',
    origin: 'application',
    negotiation: {
      script: "I'm thrilled about the mission at GreenEnergy. Given the specific IoT experience I bring...",
      strategy: "Emphasize the direct relevance of your IoT background."
    }
  },
  {
    id: 'job-10',
    company: 'EduTech Global',
    role: 'Senior React Developer',
    location: 'Boston, MA (Hybrid)',
    salary: '$160k',
    status: JobStatus.ACCEPTED,
    dateApplied: getPastDate(30),
    description: 'Leading the frontend team for our primary LMS platform serving 2M+ students.',
    email: 'careers@edutech.global',
    origin: 'application'
  },
  // --- NEW 5 JOBS ADDED BELOW ---
  {
    id: 'job-11',
    company: 'Summit Peak',
    role: 'DevOps Engineer',
    location: 'Denver, CO',
    salary: '$155k',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(1),
    description: 'Managing cloud infrastructure on AWS and optimizing CI/CD pipelines for a fast-growing outdoor retailer.',
    email: 'jobs@summitpeak.com',
    origin: 'application'
  },
  {
    id: 'job-12',
    company: 'RiverBank Digital',
    role: 'Technical Lead',
    location: 'London, UK (Remote)',
    salary: '£110k',
    status: JobStatus.INTERVIEW,
    dateApplied: getPastDate(4),
    description: 'Leading a team of 6 engineers to rebuild our core banking ledger system using Go and Kafka.',
    email: 'hiring@riverbank.com',
    origin: 'application',
    interviewGuide: '**Company Insight:** Traditional bank moving to cloud-native...\n\n**Key Questions:**\n1. Experience with event sourcing?\n2. How do you handle distributed transactions?'
  },
  {
    id: 'job-13',
    company: 'Bright Future Ed',
    role: 'Frontend Developer',
    location: 'Austin, TX',
    salary: '$130k',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(6),
    description: 'Creating accessible and interactive learning modules for K-12 students using Vue.js.',
    email: 'careers@brightfuture.ed',
    origin: 'application'
  },
  {
    id: 'job-14',
    company: 'DarkMatter Analytics',
    role: 'Data Engineer',
    location: 'Remote (US)',
    salary: '$165k',
    status: JobStatus.REJECTED,
    dateApplied: getPastDate(18),
    description: 'Building data pipelines for large-scale consumer behavior analysis.',
    email: 'talent@darkmatter.io',
    origin: 'application'
  },
  {
    id: 'job-15',
    company: 'Starlight Systems',
    role: 'Senior Full Stack',
    location: 'Los Angeles, CA',
    salary: '$185k',
    status: JobStatus.OFFER,
    dateApplied: getPastDate(7),
    description: 'Working on next-gen entertainment platforms.',
    email: 'recruiting@starlight.sys',
    origin: 'offer',
    negotiation: {
      script: "Thank you for the offer. Starlight is my top choice. However, I have another offer at $190k...",
      strategy: "Leverage competing offer from AutoDrive AI (if valid)."
    }
  }
];

const MOCK_RESUME: Resume = {
  fullName: 'Kingsford Johnson',
  email: 'kingsford.johnson@example.dev',
  phone: '+1 (415) 555-0199',
  summary: 'Innovative Senior Software Engineer with 7+ years of experience building scalable web applications. Expert in the React ecosystem, TypeScript, and cloud-native architecture. Proven track record of improving site performance by 40% and leading cross-functional teams of 10+ developers.',
  skills: 'Languages: TypeScript, JavaScript (ES6+), Python, Go\nFrontend: React, Next.js, Tailwind CSS, Redux, WebGL\nBackend: Node.js, Express, GraphQL, PostgreSQL, Redis\nDevOps: Docker, Kubernetes, AWS (EC2, S3, Lambda), CI/CD (GitHub Actions)',
  experience: [
    {
      id: 'exp-1',
      title: 'Senior Frontend Engineer',
      company: 'TechFlow Solutions',
      date: '2021 - Present',
      details: '• Architected the core design system used across 5 distinct products, reducing development time by 30%.\n• Led the migration of a legacy jQuery application to Next.js, improving Core Web Vitals scores from 45 to 95.\n• Mentored 4 junior developers, conducting code reviews and weekly pair programming sessions.'
    },
    {
      id: 'exp-2',
      title: 'Software Engineer',
      company: 'Innovate AI',
      date: '2019 - 2021',
      details: '• Developed and maintained the client-facing dashboard for NLP model training using React and D3.js.\n• Implemented real-time collaboration features using WebSockets and Redis.\n• Collaborated with data scientists to visualize complex datasets for enterprise clients.'
    },
    {
      id: 'exp-3',
      title: 'Junior Web Developer',
      company: 'Creative Agency XYZ',
      date: '2017 - 2019',
      details: '• Built responsive marketing websites for over 20 clients using HTML, SCSS, and JavaScript.\n• Optimized images and assets, reducing average page load time by 1.5 seconds.\n• Worked directly with clients to gather requirements and iterate on designs.'
    },
    {
      id: 'exp-4',
      title: 'Freelance Developer',
      company: 'Self-Employed',
      date: '2016 - 2017',
      details: '• Delivered custom WordPress themes and plugins for local businesses.\n• Integrated payment gateways (Stripe, PayPal) for e-commerce clients.'
    },
    {
      id: 'exp-5',
      title: 'Intern',
      company: 'StartUp Hub',
      date: 'Summer 2016',
      details: '• Assisted in the development of an internal tool for tracking expenses.\n• Learned git workflows and agile development methodologies.'
    }
  ],
  education: [
    {
      id: 'edu-1',
      title: 'M.S. Computer Science',
      company: 'Stanford University',
      date: '2015 - 2017',
      details: 'Focus on Human-Computer Interaction and Distributed Systems.'
    },
    {
      id: 'edu-2',
      title: 'B.S. Computer Science',
      company: 'University of California, Berkeley',
      date: '2011 - 2015',
      details: 'Graduated Magna Cum Laude. President of the Web Development Club.'
    },
    {
      id: 'edu-3',
      title: 'Full Stack Certification',
      company: 'FreeCodeCamp',
      date: '2015',
      details: 'Completed 300+ hours of coursework in MERN stack development.'
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      title: 'AWS Certified Solutions Architect',
      company: 'Amazon Web Services',
      date: '2022',
      details: 'Associate Level Certification.'
    },
    {
      id: 'cert-2',
      title: 'Certified Scrum Master',
      company: 'Scrum Alliance',
      date: '2020',
      details: 'Certification for Agile project management.'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'TS JobFlow',
      technologies: 'React, TypeScript, Tailwind, Gemini API',
      link: 'github.com/kingsford/jobflow',
      description: 'A comprehensive job application dashboard featuring AI-powered cover letter generation and resume building. Uses local storage for persistence and Gemini for generative AI tasks.'
    },
    {
      id: 'proj-2',
      name: 'CryptoTracker',
      technologies: 'React Native, Redux, CoinGecko API',
      link: 'github.com/kingsford/crypto',
      description: 'Mobile application for tracking cryptocurrency prices in real-time. Features price alerts, portfolio management, and historical charts.'
    },
    {
      id: 'proj-3',
      name: 'OpenSource UI Library',
      technologies: 'Vue.js, Storybook, Jest',
      link: 'npmjs.com/package/my-ui-lib',
      description: 'Published a lightweight UI component library on NPM with over 1k weekly downloads. Includes accessible modal, dropdown, and datepicker components.'
    },
    {
      id: 'proj-4',
      name: 'SmartHome Hub',
      technologies: 'Python, Raspberry Pi, MQTT',
      link: 'github.com/kingsford/smarthome',
      description: 'IoT project connecting various smart devices (lights, thermostat) to a centralized dashboard running on a Raspberry Pi.'
    },
    {
      id: 'proj-5',
      name: 'TaskMaster',
      technologies: 'Electron, SQLite',
      link: 'github.com/kingsford/taskmaster',
      description: 'Desktop productivity application for task management. Features offline support and cross-platform synchronization.'
    }
  ]
};

const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    role: 'model',
    text: "Hi Kingsford! I'm Ntim, your personal job search assistant. How can I help you land your dream job today?"
  },
  {
    id: 'msg-2',
    role: 'user',
    text: "I'm feeling a bit discouraged. I got a rejection from CyberGuard Security yesterday."
  },
  {
    id: 'msg-3',
    role: 'model',
    text: "I'm sorry to hear that, Kingsford. Rejections are tough, but they are a normal part of the process. Remember, CyberGuard's loss is another company's gain! 🦁\n\nBased on your resume, your skills in Security and Cloud are very strong. Would you like me to help you draft a follow-up email to ask for feedback, or should we look for similar roles at other companies?"
  },
  {
    id: 'msg-4',
    role: 'user',
    text: "Let's look for other roles. What should I focus on?"
  },
  {
    id: 'msg-5',
    role: 'model',
    text: "Great attitude! Given your experience with **React** and **AWS**, I'd suggest targeting 'Frontend Infrastructure' or 'Full Stack' roles in FinTech or HealthTech sectors, as they are hiring aggressively right now.\n\nI also see you have a pending application with **Quantum FinTech**. Have you followed up with them yet?"
  }
];

// --- MOCK DATA END ---

const DEFAULT_SETTINGS: AppSettings = {
  reminderTiming: 15 // Default to 15 minutes
};

const ThemeToggle = ({ theme, setTheme, onNavigate }: { theme: Theme, setTheme: (t: Theme) => void, onNavigate: (v: ViewState) => void }) => {
  return (
    <div className="hidden md:flex items-center justify-end gap-2 p-3 sticky top-0 z-50 bg-brand-rose/90 dark:bg-slate-950/90 backdrop-blur-sm">
      <NotificationBell onNavigate={onNavigate} />
      <div className="bg-white dark:bg-slate-800 border border-brand-mint dark:border-slate-700 rounded-xl p-1 flex shadow-sm">
        <button
          onClick={() => setTheme('light')}
          className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'bg-brand-rose dark:bg-slate-700 text-brand-primary' : 'text-slate-400 hover:text-brand-deep dark:hover:text-slate-200'}`}
          title="Light Mode"
        >
          <Sun size={16} />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-brand-rose dark:bg-slate-700 text-brand-primary' : 'text-slate-400 hover:text-brand-deep dark:hover:text-slate-200'}`}
          title="Dark Mode"
        >
          <Moon size={16} />
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`p-2 rounded-lg transition-all ${theme === 'system' ? 'bg-brand-rose dark:bg-slate-700 text-brand-primary' : 'text-slate-400 hover:text-brand-deep dark:hover:text-slate-200'}`}
          title="System Default"
        >
          <Monitor size={16} />
        </button>
      </div>
    </div>
  );
};

// Bridge component to expose useNotifications() to the App parent via a ref callback
const StatusNotifier: React.FC<{ onReady: (fn: (type: string, title: string, message: string, jobId?: string) => void) => void }> = ({ onReady }) => {
  const { addNotification } = useNotifications();
  React.useEffect(() => {
    onReady((type: string, title: string, message: string, jobId?: string) => {
      addNotification(type as any, title, message, jobId, ViewState.JOBS);
    });
  }, [addNotification, onReady]);
  return null;
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [statusFilter, setStatusFilter] = useState<JobStatus | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
  const notifyRef = React.useRef<((type: string, title: string, message: string, jobId?: string) => void) | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('jobflow_onboarding_seen') !== 'true';
  });
  const [showAuth, setShowAuth] = useState<boolean>(() => {
    return localStorage.getItem('jobflow_authenticated') !== 'true';
  });
  const [userName, setUserName] = useState<string>(() => {
    try {
      const user = localStorage.getItem('jobflow_user');
      return user ? JSON.parse(user).fullName : '';
    } catch { return ''; }
  });

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('jobflow_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Save settings on change
  useEffect(() => {
    localStorage.setItem('jobflow_settings', JSON.stringify(settings));
  }, [settings]);

  // Theme Handling
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initialize state from localStorage, fallback to MOCK_JOBS
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const savedJobs = localStorage.getItem('jobflow_jobs');
      const parsedJobs = savedJobs ? JSON.parse(savedJobs) : null;
      return (parsedJobs && parsedJobs.length > 0) ? parsedJobs : MOCK_JOBS;
    } catch (e) {
      console.error("Failed to parse jobs from local storage", e);
      return MOCK_JOBS;
    }
  });

  // Chat State — persisted to localStorage
  const [ntimMessages, setNtimMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('jobflow_ntim_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse chat messages from local storage", e);
    }
    return MOCK_MESSAGES;
  });

  const [unreadNtim, setUnreadNtim] = useState(false);

  // Resume State, fallback to MOCK_RESUME
  const [resume, setResume] = useState<Resume>(() => {
    try {
      const savedResume = localStorage.getItem('jobflow_resume');
      if (savedResume) {
        // Migration check: if old resume doesn't have certifications, add empty array
        const parsed = JSON.parse(savedResume);
        if (!parsed.certifications) parsed.certifications = [];
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse resume from local storage", e);
    }
    // Return Mock Data if no local storage
    return MOCK_RESUME;
  });

  // Save to localStorage whenever jobs change
  useEffect(() => {
    try {
      localStorage.setItem('jobflow_jobs', JSON.stringify(jobs));
    } catch (e) {
      console.error("Failed to save jobs to local storage", e);
    }
  }, [jobs]);

  // Save to localStorage whenever resume changes
  useEffect(() => {
    try {
      localStorage.setItem('jobflow_resume', JSON.stringify(resume));
    } catch (e) {
      console.error("Failed to save resume to local storage", e);
    }
  }, [resume]);

  // Save chat messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jobflow_ntim_messages', JSON.stringify(ntimMessages));
    } catch (e) {
      console.error("Failed to save chat messages to local storage", e);
    }
  }, [ntimMessages]);

  // Clear unread badge when viewing Ntim
  useEffect(() => {
    if (currentView === ViewState.NTIM) {
      setUnreadNtim(false);
    }
  }, [currentView]);

  const handleAttachAvatar = (avatarUrl: string) => {
    setResume(prev => ({ ...prev, avatar: avatarUrl }));
  };

  const handleJobStatusChange = (job: Job, newStatus: JobStatus) => {
    // Push to Notification Center
    if (newStatus === JobStatus.ACCEPTED) {
      notifyRef.current?.('status_change', `Offer Accepted! 🎉`, `You accepted the ${job.role} position at ${job.company}.`, job.id);
    } else if (newStatus === JobStatus.REJECTED) {
      notifyRef.current?.('status_change', `Application Update`, `${job.role} at ${job.company} was marked as rejected.`, job.id);
    } else if (newStatus === JobStatus.INTERVIEW) {
      notifyRef.current?.('status_change', `Interview Scheduled`, `${job.role} at ${job.company} moved to interview stage.`, job.id);
    } else if (newStatus === JobStatus.OFFER) {
      notifyRef.current?.('status_change', `New Offer! 🎉`, `You received an offer for ${job.role} at ${job.company}!`, job.id);
    }

    // Also send Ntim chat messages for Accepted/Rejected
    if (newStatus === JobStatus.ACCEPTED || newStatus === JobStatus.REJECTED) {
      let messageText = '';

      if (newStatus === JobStatus.ACCEPTED) {
        messageText = `🎉 Congratulations! I noticed you accepted an offer for the **${job.role}** position at **${job.company}**! That is absolutely fantastic news! Do you need any tips on salary negotiation or preparing for your first day?`;
      } else if (newStatus === JobStatus.REJECTED) {
        messageText = `I saw the update about the **${job.role}** role at **${job.company}**. I know that can be disappointing, but don't let it discourage you. Rejection is often just redirection. 🦁 Would you like to analyze the job description together to see if there are any skills we can highlight better for next time?`;
      }

      if (messageText) {
        const newMessage: Message = {
          id: Date.now().toString(),
          role: 'model',
          text: messageText
        };

        setNtimMessages(prev => [...prev, newMessage]);

        if (currentView !== ViewState.NTIM) {
          setUnreadNtim(true);
        }
      }
    }
  };

  const handleImportData = (data: { jobs: Job[]; resume: Resume }) => {
    if (data.jobs) setJobs(data.jobs);
    if (data.resume) setResume(data.resume);
  };

  const handleResetData = () => {
    setJobs(MOCK_JOBS);
    setResume(MOCK_RESUME);
    localStorage.removeItem('jobflow_jobs');
    localStorage.removeItem('jobflow_resume');
  };

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('jobflow_onboarding_seen', 'true');
  };

  const handleAuthComplete = (name: string) => {
    setUserName(name);
    setShowAuth(false);
  };

  // Dashboard card click: navigate to Jobs with a pre-set status filter
  const handleDashboardCardClick = (status: JobStatus) => {
    setStatusFilter(status);
    setCurrentView(ViewState.JOBS);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard jobs={jobs} onViewChange={setCurrentView} userName={userName} onCardClick={handleDashboardCardClick} />;
      case ViewState.JOBS:
        return <JobTracker jobs={jobs} setJobs={setJobs} viewMode="applications" onStatusChange={handleJobStatusChange} resume={resume} setResume={setResume} settings={settings} statusFilter={statusFilter} onClearStatusFilter={() => setStatusFilter(null)} />;
      case ViewState.OFFERS:
        return <JobTracker jobs={jobs} setJobs={setJobs} viewMode="offers" onStatusChange={handleJobStatusChange} resume={resume} setResume={setResume} settings={settings} statusFilter={statusFilter} onClearStatusFilter={() => setStatusFilter(null)} />;
      case ViewState.RESUME:
        return <ResumeBuilder resume={resume} setResume={setResume} />;
      case ViewState.AVATAR:
        return <AvatarGenerator onAttachToResume={handleAttachAvatar} />;
      case ViewState.NTIM:
        return <NtimChat messages={ntimMessages} setMessages={setNtimMessages} jobs={jobs} onEditJob={(jobId, updates) => setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...updates } : j))} />;
      case ViewState.SETTINGS:
        return <Settings jobs={jobs} resume={resume} onImport={handleImportData} onReset={handleResetData} settings={settings} onUpdateSettings={setSettings} />;
      default:
        return <Dashboard jobs={jobs} onViewChange={setCurrentView} onCardClick={handleDashboardCardClick} />;
    }
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleCompleteOnboarding} />;
  }

  if (showAuth) {
    return <AuthScreen onComplete={handleAuthComplete} />;
  }

  return (
    <ToastProvider>
      <NotificationProvider jobs={jobs} settings={settings}>
        <StatusNotifier onReady={(fn) => { notifyRef.current = fn; }} />
        <div className="flex h-screen bg-brand-rose dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
          <Sidebar
            currentView={currentView}
            onChangeView={setCurrentView}
            hasUnreadMessages={unreadNtim}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            userName={userName}
            onLogout={() => setShowAuth(true)}
          />

          <main className="flex-1 h-screen overflow-auto relative custom-scrollbar w-full">
            <ThemeToggle theme={theme} setTheme={setTheme} onNavigate={setCurrentView} />

            {/* Mobile Header */}
            <div className="md:hidden p-4 flex items-center gap-3 sticky top-0 z-40 bg-brand-rose/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-brand-mint/50 dark:border-slate-800">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg-white dark:bg-slate-900 border border-brand-mint dark:border-slate-800 rounded-lg text-brand-deep dark:text-white shadow-sm active:bg-brand-mint/50"
              >
                <Menu size={20} />
              </button>
              <span className="font-bold text-brand-deep dark:text-white flex-1">TS JobFlow</span>
              <NotificationBell onNavigate={setCurrentView} />
            </div>

            {renderContent()}
          </main>
        </div>
      </NotificationProvider>
    </ToastProvider>
  );
};

export default App;
