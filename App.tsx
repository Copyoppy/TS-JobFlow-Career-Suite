
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
import CalendarView from './components/CalendarView';
import Insights from './components/Insights';
import RecruiterCRM from './components/RecruiterCRM';
import PortfolioEditor from './components/PortfolioEditor';
import PublicProfile from './components/PublicProfile';
import OfferComparisonDashboard from './components/OfferComparisonDashboard';
import ApplicationScanner from './components/ApplicationScanner';
import NetworkingTracker from './components/NetworkingTracker';
import CareerTrajectoryMap from './components/CareerTrajectoryMap';
import FollowUpAssistant from './components/FollowUpAssistant';
import { ToastProvider } from './components/Toast';
import { NotificationProvider, useNotifications } from './components/NotificationContext';
import NotificationBell from './components/NotificationBell';
import { Job, ViewState, Resume, Message, JobStatus, Theme, AppSettings, Recruiter, OfferComparisonResult, PortfolioSettings, NetworkingContact } from './types';
import {
  Menu, Sun, Moon, Monitor, Lock, Unlock,
  Globe, Layout, CheckCircle2, Circle, Edit3, Image as ImageIcon, Plus, Trash2,
  ExternalLink, Sparkles, User, Briefcase, Code, LayoutDashboard, FileText, UserCircle2, LogOut, CheckCircle, X, Calendar as CalendarIcon, BarChart3, Users, FileSearch, Milestone
} from 'lucide-react';

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
    interviewDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    recruiterId: 'rec-1'
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
    origin: 'application',
    followUpDate: getPastDate(-2), // 2 days from now
    recruiterId: 'rec-2'
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
    negotiation: "I'm very excited about the offer to join EcoVision. Based on my research of similar roles in the market and my specialized experience with React and D3.js, I was hoping we could discuss moving the base salary to €95k...",
    recruiterId: 'rec-3'
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
    origin: 'application',
    recruiterId: 'rec-4'
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
    origin: 'application',
    recruiterId: 'rec-5'
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
    interviewGuide: '**Company Insight:** AutoDrive is a leader in L4 autonomy...\n\n**Key Questions:**\n1. Explain object detection architectures.\n2. How do you handle sensor fusion?',
    interviewDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    recruiterId: 'rec-6'
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
    origin: 'application',
    recruiterId: 'rec-2'
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
    origin: 'application',
    recruiterId: 'rec-4'
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
    negotiation: "I'm thrilled about the mission at GreenEnergy. Given the specific IoT experience I bring...",
    recruiterId: 'rec-3'
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
    interviewGuide: '**Company Insight:** Traditional bank moving to cloud-native...\n\n**Key Questions:**\n1. Experience with event sourcing?\n2. How do you handle distributed transactions?',
    interviewDate: new Date(Date.now() + 86400000 * 1).toISOString(), // Tomorrow
    recruiterId: 'rec-7'
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
    origin: 'application',
    recruiterId: 'rec-1'
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
    origin: 'application',
    recruiterId: 'rec-2'
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
    negotiation: "Thank you for the offer. Starlight is my top choice. However, I have another offer at $190k...",
    recruiterId: 'rec-6'
  },
  // --- ADDITIONAL MOCK JOBS ---
  {
    id: 'job-16',
    company: 'Astra Biotech',
    role: 'Bioinformatics Engineer',
    location: 'Cambridge, MA',
    salary: '$150k - $170k',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(1),
    description: 'Developing algorithms to analyze genomic data and accelerate drug discovery.',
    email: 'careers@astrabio.com',
    origin: 'application',
    recruiterId: 'rec-9'
  },
  {
    id: 'job-17',
    company: 'Zenith Retail',
    role: 'Mobile Lead (Android)',
    location: 'Remote (US)',
    salary: '$175k',
    status: JobStatus.INTERVIEW,
    dateApplied: getPastDate(4),
    description: 'Leading the Android development team for Zenith’s global retail app.',
    email: 'hiring@zenith.com',
    origin: 'application',
    interviewDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    recruiterId: 'rec-7'
  },
  {
    id: 'job-18',
    company: 'Solaris Space',
    role: 'Embedded Systems Engineer',
    location: 'Denver, CO',
    salary: '$160k',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(9),
    description: 'Engineering the flight software for Solaris’s next-generation satellite constellation.',
    email: 'hr@solaris.space',
    origin: 'application'
  },
  {
    id: 'job-19',
    company: 'HyperApp',
    role: 'Senior React Developer',
    location: 'Remote (Global)',
    salary: '$140k',
    status: JobStatus.OFFER,
    dateApplied: getPastDate(11),
    description: 'Scaling our flagship productivity application to millions of users worldwide.',
    email: 'recruiting@hyperapp.io',
    origin: 'offer'
  },
  {
    id: 'job-20',
    company: 'Titan Insurance',
    role: 'Backend Engineer (Java)',
    location: 'Columbus, OH',
    salary: '$135k',
    status: JobStatus.REJECTED,
    dateApplied: getPastDate(40),
    description: 'Modernizing core insurance processing systems using Spring Boot and microservices.',
    email: 'jobs@titanins.com',
    origin: 'application'
  },
  {
    id: 'job-21',
    company: 'Easel Art',
    role: 'UI/UX Engineer',
    location: 'Brooklyn, NY',
    salary: '$150k',
    status: JobStatus.INTERVIEW,
    dateApplied: getPastDate(2),
    description: 'Collaborating with artists and designers to build beautiful creation tools for the web.',
    email: 'talent@easel.art',
    origin: 'application',
    interviewDate: new Date(Date.now() + 86400000 * 6).toISOString()
  },
  {
    id: 'job-22',
    company: 'Nova Crypto',
    role: 'Smart Contract Developer',
    location: 'Miami, FL (Hybrid)',
    salary: '$180k + Tokens',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(3),
    description: 'Building secure and efficient DeFi protocols on Ethereum and Polygon.',
    email: 'hiring@novacrypto.xyz',
    origin: 'application'
  },
  {
    id: 'job-23',
    company: 'PetPals',
    role: 'Frontend Developer',
    location: 'Remote (US)',
    salary: '$125k',
    status: JobStatus.OFFER,
    dateApplied: getPastDate(14),
    description: 'Empowering pet owners with high-quality telehealth and community resources.',
    email: 'careers@petpals.com',
    origin: 'offer'
  },
  {
    id: 'job-24',
    company: 'Swift Logistics',
    role: 'Warehouse Systems Architect',
    location: 'Dallas, TX',
    salary: '$165k',
    status: JobStatus.ACCEPTED,
    dateApplied: getPastDate(45),
    description: 'Designing automated warehouse management systems to optimize shipping efficiency.',
    email: 'hr@swiftlog.com',
    origin: 'application'
  },
  {
    id: 'job-25',
    company: 'CloudScale',
    role: 'Principal SRE',
    location: 'Seattle, WA',
    salary: '$210k',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(0),
    description: 'Driving reliability and scalability across our extensive cloud-hosting platform.',
    email: 'jobs@cloudscale.net',
    origin: 'application'
  },
  {
    id: 'job-26',
    company: 'Oceanic Research',
    role: 'Data Scientist',
    location: 'San Diego, CA (Hybrid)',
    salary: '$155k',
    status: JobStatus.INTERVIEW,
    dateApplied: getPastDate(10),
    description: 'Analyzing oceanic data to model climate change impact and support marine conservation.',
    email: 'research@oceanic.org',
    origin: 'application',
    interviewDate: new Date(Date.now() + 86400000 * 8).toISOString()
  },
  {
    id: 'job-27',
    company: 'Peak Software',
    role: 'C++ Developer',
    location: 'Remote (Canada)',
    salary: '$140k CAD',
    status: JobStatus.REJECTED,
    dateApplied: getPastDate(30),
    description: 'Improving the performance of our industry-leading 3D rendering engine.',
    email: 'careers@peaksoftware.ca',
    origin: 'application'
  },
  {
    id: 'job-28',
    company: 'Vital Health',
    role: 'Security Analyst',
    location: 'Nashville, TN',
    salary: '$130k',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(12),
    description: 'Ensuring HIPAA compliance and strengthening our cybersecurity posture.',
    email: 'security@vitalhealth.com',
    origin: 'application'
  },
  {
    id: 'job-29',
    company: 'Skyway Travel',
    role: 'Mobile Engineer (SwiftUI)',
    location: 'Remote (Global)',
    salary: '$150k',
    status: JobStatus.OFFER,
    dateApplied: getPastDate(18),
    description: 'Building world-class travel experiences for iPhone and iPad.',
    email: 'travel@skyway.io',
    origin: 'offer'
  },
  {
    id: 'job-30',
    company: 'Frontier AI',
    role: 'NLP Researcher',
    location: 'San Francisco, CA',
    salary: '$200k + Equity',
    status: JobStatus.INTERVIEW,
    dateApplied: getPastDate(5),
    description: 'Advancing the state-of-the-art in large language models and conversational agents.',
    email: 'research@frontier.ai',
    origin: 'application',
    interviewDate: new Date(Date.now() + 86400000 * 4).toISOString()
  },
  {
    id: 'job-31',
    company: 'Vanguard Media',
    role: 'Content Platform Lead',
    location: 'New York, NY',
    salary: '$180k',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(2),
    description: 'Developing the future of digital journalism and media consumption.',
    email: 'media@vanguard.com',
    origin: 'application'
  },
  {
    id: 'job-32',
    company: 'Bolt Payments',
    role: 'API Engineer',
    location: 'Remote (US)',
    salary: '$160k',
    status: JobStatus.OFFER,
    dateApplied: getPastDate(6),
    description: 'Building the fastest checkout experience on the internet.',
    email: 'hiring@bolt.com',
    origin: 'offer'
  },
  {
    id: 'job-33',
    company: 'Ironclad Security',
    role: 'Staff Security Engineer',
    location: 'Arlington, VA',
    salary: '$190k',
    status: JobStatus.REJECTED,
    dateApplied: getPastDate(50),
    description: 'Leading defensive security initiatives for federal and commercial clients.',
    email: 'iron@clad.sec',
    origin: 'application'
  },
  {
    id: 'job-34',
    company: 'Leaf & Stem',
    role: 'E-commerce Dev',
    location: 'Portland, OR',
    salary: '$120k',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(14),
    description: 'Maintaining and enhancing our Shopify-based floral delivery platform.',
    email: 'hello@leafstem.com',
    origin: 'application'
  },
  {
    id: 'job-35',
    company: 'Aura Fintech',
    role: 'Compliance Officer',
    location: 'Remote (US)',
    salary: '$140k',
    status: JobStatus.INTERVIEW,
    dateApplied: getPastDate(8),
    description: 'Managing regulatory filings and ensuring AML compliance across our global operations.',
    email: 'aura@fintech.co',
    origin: 'application',
    interviewDate: new Date(Date.now() + 86400000 * 7).toISOString()
  },
  {
    id: 'job-36',
    company: 'Silver Lining',
    role: 'Cloud Architect',
    location: 'Chicago, IL (Hybrid)',
    salary: '$185k',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(20),
    description: 'Helping enterprises transition their legacy infrastructure to modern cloud-native environments.',
    email: 'silver@lining.cloud',
    origin: 'application'
  },
  {
    id: 'job-37',
    company: 'Mainframe Labs',
    role: 'Rust Developer',
    location: 'Remote (Europe)',
    salary: '€90k - €110k',
    status: JobStatus.OFFER,
    dateApplied: getPastDate(22),
    description: 'Building high-performance blockchain infrastructure using Rust.',
    email: 'labs@mainframe.xyz',
    origin: 'offer'
  },
  {
    id: 'job-38',
    company: 'Crest View',
    role: 'Senior Project Manager',
    location: 'Salt Lake City, UT',
    salary: '$145k',
    status: JobStatus.INTERVIEW,
    dateApplied: getPastDate(12),
    description: 'Driving the successful delivery of complex software projects for our diverse client base.',
    email: 'hiring@crestview.pm',
    origin: 'application',
    interviewDate: new Date(Date.now() + 86400000 * 9).toISOString()
  },
  {
    id: 'job-39',
    company: 'Blue Dot',
    role: 'GIS Analyst',
    location: 'Denver, CO',
    salary: '$115k',
    status: JobStatus.REJECTED,
    dateApplied: getPastDate(60),
    description: 'Applying spatial thinking and data analysis to solve complex environmental and urban planning challenges.',
    email: 'jobs@bluedot.gis',
    origin: 'application'
  },
  {
    id: 'job-40',
    company: 'NexGen Gaming',
    role: 'Engine Engineer',
    location: 'Remote (US)',
    salary: '$165k',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(15),
    description: 'Optimizing and expanding our proprietary game engine for the next generation of console and PC games.',
    email: 'nex@gen.game',
    origin: 'application'
  },
  {
    id: 'job-41',
    company: 'BioLogic',
    role: 'Scientific Programmer',
    location: 'Boston, MA',
    salary: '$140k',
    status: JobStatus.INTERVIEW,
    dateApplied: getPastDate(6),
    description: 'Bridging the gap between biology and computing to solve the world’s most pressing health issues.',
    email: 'careers@biologic.bio',
    origin: 'application',
    interviewDate: new Date(Date.now() + 86400000 * 10).toISOString()
  },
  {
    id: 'job-42',
    company: 'Clearwater Systems',
    role: 'Firmware Engineer',
    location: 'Austin, TX (Hybrid)',
    salary: '$150k',
    status: JobStatus.OFFER,
    dateApplied: getPastDate(25),
    description: 'Developing the firmware for our high-precision water quality sensors.',
    email: 'clear@water.sys',
    origin: 'offer'
  },
  {
    id: 'job-43',
    company: 'SwiftPay',
    role: 'Lead Full Stack',
    location: 'Remote (Global)',
    salary: '$190k',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(4),
    description: 'Leading the development of our next-gen mobile payment and digital wallet platform.',
    email: 'hiring@swiftpay.io',
    origin: 'application'
  },
  {
    id: 'job-44',
    company: 'Stellar Tech',
    role: 'Systems Admin',
    location: 'Phoenix, AZ',
    salary: '$120k',
    status: JobStatus.REJECTED,
    dateApplied: getPastDate(70),
    description: 'Managing and securing our server infrastructure and corporate network.',
    email: 'jobs@stellar.tech',
    origin: 'application'
  },
  {
    id: 'job-45',
    company: 'Evergreen Edu',
    role: 'Content Specialist',
    location: 'Remote (US)',
    salary: '$105k',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(10),
    description: 'Creating and curating engaging educational content for our online K-12 learning platform.',
    email: 'hello@evergreen.ed',
    origin: 'application'
  },
  {
    id: 'job-46',
    company: 'Nova Home',
    role: 'UX Designer',
    location: 'Seattle, WA (Hybrid)',
    salary: '$145k',
    status: JobStatus.OFFER,
    dateApplied: getPastDate(30),
    description: 'Designing intuitive and delightful user experiences for our suite of smart home management tools.',
    email: 'nova@home.xyz',
    origin: 'offer'
  },
  {
    id: 'job-47',
    company: 'Atlas Mapping',
    role: 'Data Engineer (Scala)',
    location: 'Remote (Canada)',
    salary: '$155k CAD',
    status: JobStatus.INTERVIEW,
    dateApplied: getPastDate(15),
    description: 'Processing and managing global mapping data to empower world-class navigation experiences.',
    email: 'jobs@atlas.map',
    origin: 'application',
    interviewDate: new Date(Date.now() + 86400000 * 12).toISOString()
  },
  {
    id: 'job-48',
    company: 'Fusion Lab',
    role: 'Front End Engineer',
    location: 'Portland, OR',
    salary: '$135k',
    status: JobStatus.REJECTED,
    dateApplied: getPastDate(80),
    description: 'Developing the interface for our proprietary research management software.',
    email: 'lab@fusion.io',
    origin: 'application'
  },
  {
    id: 'job-49',
    company: 'Prime Retail',
    role: 'Back End Developer',
    location: 'Columbus, OH',
    salary: '$140k',
    status: JobStatus.APPLIED,
    dateApplied: getPastDate(20),
    description: 'Designing and scaling back-end services to power our high-volume retail platform.',
    email: 'jobs@primeretail.com',
    origin: 'application'
  },
  {
    id: 'job-50',
    company: 'Echo Audio',
    role: 'Audio Software Engineer',
    location: 'Remote (US)',
    salary: '$160k',
    status: JobStatus.OFFER,
    dateApplied: getPastDate(35),
    description: 'Building high-performance audio processing software for the next generation of music production.',
    email: 'echo@audio.co',
    origin: 'offer'
  }
];

const MOCK_CONTACTS: NetworkingContact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Staff Engineer',
    company: 'Google',
    relationship: 'Mentor',
    lastContact: '2024-02-15',
    nextFollowUpDate: '2024-03-15',
    notes: 'Discussed career growth and navigating large engineering organizations. Very helpful with architecture reviews.',
    linkedinUrl: 'https://linkedin.com/in/sarahchen',
    referralStatus: 'Not Applicable',
    isPriority: true
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    role: 'Lead AI Researcher',
    company: 'OpenAI',
    relationship: 'Internal Referral',
    lastContact: '2024-02-10',
    notes: 'Former colleague. Expressed interest in referring me for the new LLM Platform team.',
    linkedinUrl: 'https://linkedin.com/in/mt-openai',
    referralStatus: 'Provided',
    isPriority: true
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    role: 'Head of Recruiting',
    company: 'Stripe',
    relationship: 'Recruiter',
    lastContact: '2024-01-10',
    nextFollowUpDate: '2024-02-25',
    notes: 'Emailed about potential Senior Role in the payments core team. Need to send updated portfolio.',
    linkedinUrl: 'https://linkedin.com/in/elena-stripe',
    referralStatus: 'Not Applicable',
    isPriority: false
  }
];

const MOCK_RESUME: Resume = {
  id: 'default',
  name: 'Main Resume',
  fullName: 'Kingsford Johnson',
  email: 'kingsford.johnson@example.dev',
  phone: '+1 (415) 555-0199',
  summary: 'Innovative Senior Software Engineer with 8+ years of experience building scalable web applications. Expert in React, TypeScript, and AI integrations.',
  skills: 'React, TypeScript, Node.js, GraphQL, AWS, Python, Generative AI',
  experience: [
    {
      id: 'exp1',
      title: 'Senior Software Engineer',
      company: 'TechFlow Systems',
      date: '2020 - Present',
      details: 'Led the development of a real-time collaboration platform, improving system performance by 40%.'
    },
    {
      id: 'exp2',
      title: 'Software Developer',
      company: 'InnovateCorp',
      date: '2016 - 2020',
      details: 'Built and maintained multiple high-traffic e-commerce websites using React and Next.js.'
    }
  ],
  education: [
    {
      id: 'edu1',
      title: 'B.S. in Computer Science',
      company: 'University of Technology',
      date: '2012 - 2016',
      details: 'Graduated with Honors. Specialized in Distributed Systems.'
    }
  ],
  projects: [
    {
      id: 'proj1',
      name: 'AI Career Suite',
      technologies: 'React, Gemini API, TypeScript',
      link: 'github.com/kings/career-suite',
      description: 'An all-in-one platform for job searching and career management powered by AI.'
    }
  ],
  isDefault: true,
  updatedAt: Date.now()
};

const MOCK_RECRUITERS: Recruiter[] = [
  { id: 'rec-1', name: 'Sarah Chen', company: 'TechTalent Partners', agency: 'TechTalent Partners', email: 'sarah@techtalent.io', linkedin: 'linkedin.com/in/sarahchen', notes: 'Very responsive, specializes in Frontend roles.', lastContact: getPastDate(2) },
  { id: 'rec-2', name: 'Marcus Bloom', company: 'Quantum Search', agency: 'Quantum Search', email: 'marcus@quantumsearch.com', linkedin: 'linkedin.com/in/mbloom', notes: 'Direct and focused on FinTech.', lastContact: getPastDate(5) },
  { id: 'rec-3', name: 'Elena Rodriguez', company: 'EcoRecruit', agency: 'EcoRecruit', email: 'elena@ecorecruit.eu', linkedin: 'linkedin.com/in/elena-rodriguez', notes: 'Passionate about sustainability focus.', lastContact: getPastDate(15) },
  { id: 'rec-4', name: 'David Smith', company: 'CyberHire', agency: 'CyberHire', email: 'david.smith@cyberhire.sec', linkedin: 'linkedin.com/in/dsmith-sec', notes: 'Expert in cybersecurity placements.', lastContact: getPastDate(20) },
  { id: 'rec-5', name: 'Jessica Wu', company: 'Global Logistics Talent', agency: 'Global Logistics Talent', email: 'jwu@gl-talent.com', linkedin: 'linkedin.com/in/jessica-wu', notes: 'Focuses on architectural and solutions roles.', lastContact: getPastDate(10) },
  { id: 'rec-6', name: 'Michael O\'Connor', company: 'AutoDrive Talent', agency: 'AutoDrive Talent', email: 'm.oconnor@autodrive-talent.ai', linkedin: 'linkedin.com/in/moconnor', notes: 'Specializes in ML and Computer Vision.', lastContact: getPastDate(3) },
  { id: 'rec-7', name: 'Lisa Varma', company: 'Retail Connect', agency: 'Retail Connect', email: 'lisa.v@retailconnect.com', linkedin: 'linkedin.com/in/lisavarma', notes: 'Great network in mobile/app development.', lastContact: getPastDate(4) },
  { id: 'rec-8', name: 'Tom Hiddleston', company: 'Summit Search', agency: 'Summit Search', email: 'tom@summitsearch.co', linkedin: 'linkedin.com/in/thiddleston', notes: 'Handles DevOps and SRE roles.', lastContact: getPastDate(1) },
  { id: 'rec-9', name: 'Rachel Zane', company: 'EduSearch', agency: 'EduSearch', email: 'rachel@edusearch.global', linkedin: 'linkedin.com/in/rachelzane', notes: 'Very helpful with React/Frontend specific roles.', lastContact: getPastDate(30) },
  { id: 'rec-10', name: 'James Pearson', company: 'Astra Biotech Recruitment', agency: 'Astra Biotech Recruitment', email: 'j.pearson@astrabio.com', linkedin: 'linkedin.com/in/james-pearson', notes: 'Focuses on bioinformatics and health-tech.', lastContact: getPastDate(1) }
];

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
  userName: 'Alex Rivera',
  targetRole: 'Senior Software Engineer',
  minSalary: '180000',
  locationPreference: 'Remote',
  autoSync: true,
  notifications: true,
  theme: 'system',
  reminderTiming: 15
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
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeRecruiterId, setActiveRecruiterId] = useState<string | null>(null);
  const [portfolioSettings, setPortfolioSettings] = useState<PortfolioSettings>({
    name: 'Alex Rivera',
    tagline: 'Senior Full Stack Product Engineer',
    bio: 'Passionate about building intuitive user experiences and high-performance applications. 6+ years of experience in React, Node.js, and Cloud Architecture.',
    featuredJobs: ['job-1', 'job-5', 'job-10'],
    projects: [
      {
        id: 'p-1',
        title: 'Nebula Streaming UI',
        description: 'Led the UI overhaul for the flagship video streaming platform, improving load times by 40%.',
        isFeatured: true
      },
      {
        id: 'p-2',
        title: 'Open Source UI Library',
        description: 'A collection of accessible, glassmorphic React components used by over 5k developers.',
        isFeatured: true
      }
    ],
    theme: 'modern',
    isPublic: true
  });
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
      let initialJobs = (parsedJobs && parsedJobs.length > 0) ? parsedJobs : MOCK_JOBS;

      // Sync recruiterId from MOCK_JOBS if missing in saved jobs (for mock job entries)
      if (parsedJobs) {
        initialJobs = initialJobs.map(job => {
          const mockJob = MOCK_JOBS.find(mj => mj.id === job.id);
          if (mockJob && mockJob.recruiterId && !job.recruiterId) {
            return { ...job, recruiterId: mockJob.recruiterId };
          }
          return job;
        });
      }
      return initialJobs;
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

  // Recruiters State
  const [recruiters, setRecruiters] = useState<Recruiter[]>(() => {
    try {
      const saved = localStorage.getItem('jobflow_recruiters');
      const parsed = saved ? JSON.parse(saved) : [];

      // Ensure MOCK_RECRUITERS are present
      const merged = [...parsed];
      MOCK_RECRUITERS.forEach(mr => {
        if (!merged.find(r => r.id === mr.id)) {
          merged.push(mr);
        }
      });
      return merged;
    } catch { return MOCK_RECRUITERS; }
  });

  // Networking Contacts State
  const [contacts, setContacts] = useState<NetworkingContact[]>(() => {
    try {
      const saved = localStorage.getItem('jobflow_contacts');
      return saved ? JSON.parse(saved) : MOCK_CONTACTS;
    } catch { return MOCK_CONTACTS; }
  });

  // Resumes State (Migration from single to multi)
  const [resumes, setResumes] = useState<Resume[]>(() => {
    try {
      const savedMulti = localStorage.getItem('jobflow_resumes');
      if (savedMulti) return JSON.parse(savedMulti);

      const savedSingle = localStorage.getItem('jobflow_resume');
      if (savedSingle) {
        const parsed = JSON.parse(savedSingle);
        const migrated: Resume = {
          ...parsed,
          id: 'default',
          name: 'Default Resume',
          isDefault: true,
          updatedAt: Date.now(),
          certifications: parsed.certifications || []
        };
        return [migrated];
      }
    } catch (e) { console.error("Resume migration failed", e); }
    return [{ ...MOCK_RESUME, id: 'default', name: 'Default Resume', isDefault: true, updatedAt: Date.now() }];
  });

  const [activeResumeId, setActiveResumeId] = useState<string>(() => {
    const defaultRes = resumes.find(r => r.isDefault) || resumes[0];
    return defaultRes.id;
  });

  const resume = resumes.find(r => r.id === activeResumeId) || resumes[0];

  const setResume = (updater: React.SetStateAction<Resume>) => {
    setResumes(prev => prev.map(r => {
      if (r.id === activeResumeId) {
        return typeof updater === 'function' ? (updater as any)(r) : updater;
      }
      return r;
    }));
  };

  const [unreadNtim, setUnreadNtim] = useState(false);

  // Follow-up Assistant State
  const [showFollowUp, setShowFollowUp] = useState(false);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('jobflow_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('jobflow_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('jobflow_resumes', JSON.stringify(resumes));
  }, [resumes]);

  useEffect(() => {
    localStorage.setItem('jobflow_recruiters', JSON.stringify(recruiters));
  }, [recruiters]);

  useEffect(() => {
    localStorage.setItem('jobflow_ntim_messages', JSON.stringify(ntimMessages));
  }, [ntimMessages]);

  useEffect(() => {
    if (currentView === ViewState.NTIM) setUnreadNtim(false);
  }, [currentView]);

  const handleAttachAvatar = (avatarUrl: string) => {
    setResume(prev => ({ ...prev, avatar: avatarUrl }));
  };

  const handleJobStatusChange = (job: Job, newStatus: JobStatus) => {
    if (newStatus === JobStatus.ACCEPTED) {
      notifyRef.current?.('status_change', `Offer Accepted! 🎉`, `You accepted the ${job.role} position at ${job.company}.`, job.id);
    } else if (newStatus === JobStatus.REJECTED) {
      notifyRef.current?.('status_change', `Application Update`, `${job.role} at ${job.company} was marked as rejected.`, job.id);
    } else if (newStatus === JobStatus.INTERVIEW) {
      notifyRef.current?.('status_change', `Interview Scheduled`, `${job.role} at ${job.company} moved to interview stage.`, job.id);
    } else if (newStatus === JobStatus.OFFER) {
      notifyRef.current?.('status_change', `New Offer! 🎉`, `You received an offer for ${job.role} at ${job.company}!`, job.id);
    }

    if (newStatus === JobStatus.ACCEPTED || newStatus === JobStatus.REJECTED) {
      let messageText = '';
      if (newStatus === JobStatus.ACCEPTED) {
        messageText = `🎉 Congratulations! I noticed you accepted an offer for the **${job.role}** position at **${job.company}**! That is absolutely fantastic news! Do you need any tips on salary negotiation or preparing for your first day?`;
      } else if (newStatus === JobStatus.REJECTED) {
        messageText = `I saw the update about the **${job.role}** role at **${job.company}**. I know that can be disappointing, but don't let it discourage you. Rejection is often just redirection. 🦁 Would you like to analyze the job description together to see if there are any skills we can highlight better for next time?`;
      }
      if (messageText) {
        const newMessage: Message = { id: Date.now().toString(), role: 'model', text: messageText };
        setNtimMessages(prev => [...prev, newMessage]);
        if (currentView !== ViewState.NTIM) setUnreadNtim(true);
      }
    }
  };

  const handleImportData = (data: { jobs: Job[]; resume: Resume }) => {
    if (data.jobs) setJobs(data.jobs);
    if (data.resume) setResume(data.resume);
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all data?")) {
      setJobs(MOCK_JOBS);
      setResumes([{ ...MOCK_RESUME, id: 'default', name: 'Default Resume', isDefault: true, updatedAt: Date.now() }]);
      setRecruiters([]);
      localStorage.removeItem('jobflow_jobs');
      localStorage.removeItem('jobflow_resumes');
      localStorage.removeItem('jobflow_recruiters');
      localStorage.removeItem('jobflow_resume');
    }
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

  const handleNavigateToJob = (job: Job) => {
    setActiveJobId(job.id);
    const origin = job.origin || (job.status === JobStatus.OFFER ? 'offer' : 'application');
    setCurrentView(origin === 'offer' ? ViewState.OFFERS : ViewState.JOBS);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard jobs={jobs} onViewChange={setCurrentView} userName={userName} onCardClick={handleDashboardCardClick} onOpenFollowUp={() => setShowFollowUp(true)} />;
      case ViewState.JOBS:
        return <JobTracker jobs={jobs} setJobs={setJobs} viewMode="applications" onStatusChange={handleJobStatusChange} resume={resume} setResume={setResume} settings={settings} statusFilter={statusFilter} onClearStatusFilter={() => setStatusFilter(null)} initialJobId={activeJobId} onJobSelected={setActiveJobId} recruiters={recruiters} />;
      case ViewState.OFFERS:
        return <OfferComparisonDashboard jobs={jobs} />;
      case ViewState.RESUME:
        return (
          <ResumeBuilder
            resumes={resumes}
            setResumes={setResumes}
            activeResumeId={activeResumeId}
            onSetActiveResume={setActiveResumeId}
          />
        );
      case ViewState.AVATAR:
        return <AvatarGenerator onAttachToResume={handleAttachAvatar} />;
      case ViewState.NTIM:
        return <NtimChat messages={ntimMessages} setMessages={setNtimMessages} jobs={jobs} onEditJob={(jobId, updates) => setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...updates } : j))} />;
      case ViewState.SETTINGS:
        return <Settings jobs={jobs} resume={resume} onImport={handleImportData} onReset={handleResetData} settings={settings} onUpdateSettings={setSettings} />;
      case ViewState.CRM:
        return <RecruiterCRM recruiters={recruiters} setRecruiters={setRecruiters} jobs={jobs} onNavigateToJob={handleNavigateToJob} />;
      case ViewState.CALENDAR:
        return <CalendarView jobs={jobs} onNavigateToJob={handleNavigateToJob} />;
      case ViewState.INSIGHTS:
        return <Insights jobs={jobs} />;
      case ViewState.SCAN:
        return <ApplicationScanner onAddJob={(newJob) => setJobs(prev => [newJob, ...prev])} onViewChange={setCurrentView} />;
      case ViewState.TRAJECTORY:
        return <CareerTrajectoryMap jobs={jobs} />;
      case ViewState.NETWORKING:
        return <NetworkingTracker contacts={contacts} setContacts={setContacts} />;
      case ViewState.PORTFOLIO:
        return (
          <div className="flex-1 overflow-hidden relative">
            <PortfolioEditor
              jobs={jobs}
              portfolioSettings={portfolioSettings}
              setPortfolioSettings={setPortfolioSettings}
            />
            <button
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium shadow-md hover:shadow-lg transition-all"
              onClick={() => setPortfolioSettings(prev => ({ ...prev, isPublic: !prev.isPublic }))}
            >
              {portfolioSettings.isPublic ? <Unlock size={16} /> : <Lock size={16} />}
              {portfolioSettings.isPublic ? 'Public' : 'Private'}
            </button>
          </div>
        );
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
