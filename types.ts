
export enum JobStatus {
  APPLIED = 'Applied',
  INTERVIEW = 'Interview',
  OFFER = 'Offer',
  REJECTED = 'Rejected',
  DRAFT = 'Draft',
  ACCEPTED = 'Accepted'
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
  reminderTiming: number; // Minutes before interview to notify
}

export interface AnalysisResult {
  matchScore: number;
  missingKeywords: string[];
  explanation: string;
}

export interface RedFlagAnalysis {
  pros: string[];
  cons: string[];
  verdict: string;
}

export interface NetworkingDrafts {
  linkedin: string;
  email: string;
  followup: string;
}

export interface NegotiationAdvice {
  script: string;
  strategy: string;
}

export interface InterviewFeedback {
  id: string;
  question: string;
  userAudioTranscript: string;
  feedback: string;
  improvedAnswer: string;
  timestamp: number;
}

export interface TailoredResume {
  summary: string;
  skills: string;
}

// Feature 1: Learning Roadmap Types
export interface LearningResource {
  title: string;
  searchQuery: string;
}

export interface LearningDay {
  day: string;
  theme: string;
  tasks: string[];
  resources: LearningResource[];
}

// Feature 5: Offer Comparison Types
export interface OfferComparisonPoint {
  criteria: string;
  job1Value: string;
  job2Value: string;
  winner: 'job1' | 'job2' | 'tie';
}

export interface OfferComparisonResult {
  points: OfferComparisonPoint[];
  verdict: string;
}

export interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  status: JobStatus;
  dateApplied: string;
  description: string;
  coverLetter?: string;
  interviewGuide?: string;
  email: string;
  origin?: 'application' | 'offer';

  // New AI Feature Fields
  atsAnalysis?: AnalysisResult;
  learningRoadmap?: LearningDay[]; // New field for Roadmap
  redFlags?: RedFlagAnalysis;
  networking?: NetworkingDrafts;
  negotiation?: NegotiationAdvice;
  interviewPractice?: InterviewFeedback[];

  // Reminder Features
  followUpDate?: string;
  interviewDate?: string; // ISO DateTime string
}

export interface ResumeSection {
  id: string;
  title: string;
  company: string;
  date: string;
  details: string;
}

export interface Project {
  id: string;
  name: string;
  technologies: string;
  link: string;
  description: string;
}

export interface Resume {
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  skills: string;
  experience: ResumeSection[];
  education: ResumeSection[];
  projects: Project[];
  certifications: ResumeSection[];
  avatar?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export type NotificationType = 'interview_reminder' | 'followup_due' | 'followup_overdue' | 'status_change' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  jobId?: string;
  actionView?: ViewState;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  JOBS = 'JOBS',
  OFFERS = 'OFFERS',
  RESUME = 'RESUME',
  AVATAR = 'AVATAR',
  NTIM = 'NTIM',
  SETTINGS = 'SETTINGS'
}
