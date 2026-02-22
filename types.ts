export interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  status: JobStatus;
  dateApplied: string;
  description: string;
  email?: string;
  notes?: string;
  followUpDate?: string;
  interviewDate?: string;
  interviewPractice?: InterviewFeedback;
  origin?: 'application' | 'offer' | 'referral' | 'outreach';
  priority?: 1 | 2 | 3;
  coverLetter?: string;
  interviewGuide?: string;
  recruiterId?: string;
  negotiation?: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export enum JobStatus {
  APPLIED = 'Applied',
  INTERVIEW = 'Interview',
  OFFER = 'Offer',
  REJECTED = 'Rejected',
  ACCEPTED = 'Accepted'
}

export interface InterviewFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  aiAdvice: string;
  recordedDate: string;
}

export interface Resume {
  id: string;
  name: string;
  avatar?: string;
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  skills: string;
  experience: ResumeSection[];
  education: ResumeSection[];
  certifications?: ResumeSection[];
  projects: ResumeProject[];
  isDefault: boolean;
  updatedAt: number;
}

export interface ResumeSection {
  id: string;
  title: string;
  company: string;
  date: string;
  details: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  technologies: string;
  link: string;
  description: string;
}

export interface Recruiter {
  id: string;
  name: string;
  company: string;
  email: string;
  linkedin: string;
  lastContact: string;
  notes: string;
  agency?: string;
  associatedJobId?: string;
}

export interface AppSettings {
  userName: string;
  targetRole: string;
  minSalary: string;
  locationPreference: string;
  autoSync: boolean;
  notifications: boolean;
  theme: Theme;
  reminderTiming?: number;
}

export interface CareerInsight {
  title: string;
  description: string;
  type: 'market' | 'skill' | 'action';
  impact: 'high' | 'medium' | 'low';
}

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  url: string;
  tags: string[];
}

export interface MarketTrend {
  skill: string;
  demand: number;
  growth: number;
  resources: LearningResource[];
}

export interface OfferComparisonResult {
  verdict: string;
  points: {
    criteria: string;
    job1Value: string;
    job2Value: string;
    winner: 'job1' | 'job2' | 'tie';
  }[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  skills?: string[];
  url?: string;
  imageUrl?: string;
  isFeatured?: boolean;
}

export interface PortfolioSettings {
  name: string;
  tagline: string;
  bio: string;
  featuredJobs: string[];
  projects: PortfolioProject[];
  theme: 'minimal' | 'modern' | 'glass';
  isPublic: boolean;
}

export interface NetworkingContact {
  id: string;
  name: string;
  role: string;
  company: string;
  relationship: 'Mentor' | 'Peer' | 'Recruiter' | 'Internal Referral' | 'Other';
  lastContact: string;
  nextFollowUpDate?: string;
  notes: string;
  linkedinUrl?: string;
  referralStatus: 'Requested' | 'Provided' | 'Not Applicable';
  isPriority: boolean;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  JOBS = 'JOBS',
  OFFERS = 'OFFERS',
  RESUME = 'RESUME',
  AVATAR = 'AVATAR',
  NTIM = 'NTIM',
  CRM = 'CRM',
  CALENDAR = 'CALENDAR',
  INSIGHTS = 'INSIGHTS',
  PORTFOLIO = 'PORTFOLIO',
  NETWORKING = 'NETWORKING',
  SCAN = 'SCAN',
  TRAJECTORY = 'TRAJECTORY',
  SETTINGS = 'SETTINGS'
}
