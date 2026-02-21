import React, { useState, useEffect, useRef } from 'react';
import { Job, JobStatus, Resume, TailoredResume, OfferComparisonResult, AppSettings } from '../types';
import {
  generateCoverLetter,
  generateInterviewGuide,
  analyzeResumeMatch,
  detectJobRedFlags,
  generateNetworkingDrafts,
  generateNegotiationAdvice,
  analyzeMockInterview,
  tailorResumeToJob,
  generateLearningRoadmap,
  compareJobOffers
} from '../services/geminiService';
import {
  Plus, Search, MapPin, DollarSign, Calendar, ChevronRight, X, Loader2, Sparkles, Download,
  Trash2, CheckCircle2, FileText, BookOpen, LayoutGrid, List, MoreHorizontal, Target,
  ShieldAlert, XCircle, Send, Mic, MicOff, PlayCircle, BarChart3, Users, DollarSignIcon, Copy, Check, ArrowRight,
  RefreshCw, Trophy, Scale, ExternalLink, GraduationCap, Bell, CalendarClock, CalendarPlus, BellRing, AlertCircle, Clock,
  Link2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ATSGauge, parseBold, FormattedDisplay } from './JobTrackerHelpers';
import AddJobModal from './AddJobModal';
import CompareOffersModal from './CompareOffersModal';
import { useToast } from './Toast';

interface JobTrackerProps {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  viewMode?: 'applications' | 'offers';
  onStatusChange?: (job: Job, newStatus: JobStatus) => void;
  resume: Resume;
  setResume: React.Dispatch<React.SetStateAction<Resume>>;
  settings: AppSettings;
}


const KANBAN_COLUMNS = [
  { id: JobStatus.APPLIED, label: 'Applied', color: 'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200' },
  { id: JobStatus.INTERVIEW, label: 'Interview', color: 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200' },
  { id: JobStatus.OFFER, label: 'Offer', color: 'bg-brand-mint/50 border-brand-mint text-brand-deep dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-200' },
  { id: JobStatus.ACCEPTED, label: 'Accepted', color: 'bg-indigo-50 border-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-200' },
  { id: JobStatus.REJECTED, label: 'Rejected', color: 'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200' },
];

const JobTracker: React.FC<JobTrackerProps> = ({ jobs, setJobs, viewMode = 'applications', onStatusChange, resume, setResume, settings }) => {
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'networking' | 'practice'>('overview');

  // Feature State: Offer Comparison
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareSelection, setCompareSelection] = useState<[string, string]>(['', '']);
  const [comparisonResult, setComparisonResult] = useState<OfferComparisonResult | null>(null);

  // Loading States for new Features
  const [loadingFeature, setLoadingFeature] = useState<string | null>(null);
  const [tailoredResumeData, setTailoredResumeData] = useState<TailoredResume | null>(null);

  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // View State
  const [viewType, setViewType] = useState<'list' | 'board'>('list');
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [activeMenuJobId, setActiveMenuJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isOffersMode = viewMode === 'offers';

  // Notification logic is now handled centrally by NotificationContext

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';
        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const displayedJobs = jobs.filter(job => {
    const origin = job.origin || (job.status === JobStatus.OFFER ? 'offer' : 'application');
    const matchesMode = isOffersMode ? origin === 'offer' : origin === 'application';
    if (!matchesMode) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return job.company.toLowerCase().includes(q) || job.role.toLowerCase().includes(q) || (job.location && job.location.toLowerCase().includes(q));
  });

  const [newJob, setNewJob] = useState<Partial<Job>>({
    status: isOffersMode ? JobStatus.OFFER : JobStatus.APPLIED,
    description: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setNewJob(prev => ({
      ...prev,
      status: isOffersMode ? JobStatus.OFFER : JobStatus.APPLIED
    }));
  }, [viewMode, isOffersMode]);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (activeMenuJobId && !(event.target as Element).closest('.job-menu-trigger')) {
        setActiveMenuJobId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeMenuJobId]);

  // --- Handlers ---

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.company || !newJob.role) return;

    setIsGenerating(true);
    let coverLetter = '';
    let interviewGuide = '';

    try {
      if (isOffersMode) {
        interviewGuide = await generateInterviewGuide(newJob.company!, newJob.role!, newJob.description || 'General Role');
      } else {
        coverLetter = await generateCoverLetter(newJob.company!, newJob.role!, newJob.description || 'General Application');
      }
    } catch (err) { console.error(err); }

    const today = new Date();
    const dateString = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    const jobToAdd: Job = {
      id: Date.now().toString(),
      company: newJob.company!,
      role: newJob.role!,
      location: newJob.location || 'Remote',
      salary: newJob.salary || 'Negotiable',
      status: newJob.status as JobStatus,
      dateApplied: dateString,
      description: newJob.description || '',
      email: newJob.email || '',
      coverLetter: coverLetter,
      interviewGuide: interviewGuide,
      origin: isOffersMode ? 'offer' : 'application'
    };

    setJobs(prev => [jobToAdd, ...prev]);
    setIsGenerating(false);
    setShowAddModal(false);
    setNewJob({ status: isOffersMode ? JobStatus.OFFER : JobStatus.APPLIED, description: '', company: '', role: '', location: '', salary: '', email: '' });
  };

  const handleDeleteJob = (jobId: string, e?: React.MouseEvent) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    setPendingDeleteId(jobId);
  };

  const confirmDeleteJob = () => {
    if (!pendingDeleteId) return;
    const job = jobs.find(j => j.id === pendingDeleteId);
    setJobs(prev => prev.filter(j => j.id !== pendingDeleteId));
    if (selectedJob?.id === pendingDeleteId) setSelectedJob(null);
    setPendingDeleteId(null);
    if (job) showToast(`Deleted ${job.role} at ${job.company}`, 'info');
  };

  const handleStatusChange = (jobId: string, newStatusStr: string) => {
    const newStatus = newStatusStr as JobStatus;
    const jobToUpdate = jobs.find(j => j.id === jobId);
    if (onStatusChange && jobToUpdate && jobToUpdate.status !== newStatus) {
      onStatusChange(jobToUpdate, newStatus);
    }
    setJobs(prev => prev.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(prev => prev ? { ...prev, status: newStatus } : null);
    }
    setActiveMenuJobId(null);

    // 🎉 Confetti for positive milestones
    if ([JobStatus.APPLIED, JobStatus.OFFER, JobStatus.ACCEPTED].includes(newStatus)) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    }
  };

  const updateSelectedJob = (updater: (j: Job) => Job) => {
    if (!selectedJob) return;
    const updated = updater(selectedJob);
    setSelectedJob(updated);
    setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
  };

  const handleDateChange = (date: string) => {
    updateSelectedJob(j => ({ ...j, followUpDate: date }));
  };

  const handleInterviewDateChange = (date: string) => {
    updateSelectedJob(j => ({ ...j, interviewDate: date }));
  };

  const addToGoogleCalendar = (job: Job) => {
    if (!job.interviewDate) return;
    const startDate = new Date(job.interviewDate);
    // End date +1 hour for default duration
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const formatTime = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const details = `Role: ${job.role}\nCompany: ${job.company}\n\nNotes:\n${job.description ? job.description.substring(0, 200) + '...' : ''}`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Interview: ${job.role} at ${job.company}`)}&dates=${formatTime(startDate)}/${formatTime(endDate)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(job.location || 'Remote')}`;

    window.open(url, '_blank');
  };

  const getIsOverdue = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminder = new Date(date);
    return reminder < today;
  };

  // --- Feature Handlers ---

  const handleAnalyzeMatch = async () => {
    if (!selectedJob) return;
    setLoadingFeature('match');
    try {
      const resumeText = JSON.stringify(resume);
      const result = await analyzeResumeMatch(resumeText, selectedJob.description);
      updateSelectedJob(j => ({ ...j, atsAnalysis: result }));
      showToast('ATS analysis complete!', 'success');
    } catch (e) { showToast('Analysis failed. Please try again.', 'error'); } finally { setLoadingFeature(null); }
  };

  const handleTailorResume = async () => {
    if (!selectedJob) return;
    setLoadingFeature('tailor');
    try {
      const resumeText = JSON.stringify(resume);
      const result = await tailorResumeToJob(resumeText, selectedJob.description);
      setTailoredResumeData(result);
    } catch (e) { showToast('Resume tailoring failed. Please try again.', 'error'); } finally { setLoadingFeature(null); }
  };

  const handleGenerateRoadmap = async () => {
    if (!selectedJob || !selectedJob.atsAnalysis) return;
    setLoadingFeature('roadmap');
    try {
      const roadmap = await generateLearningRoadmap(selectedJob.atsAnalysis.missingKeywords, selectedJob.role);
      updateSelectedJob(j => ({ ...j, learningRoadmap: roadmap }));
    } catch (e) { showToast('Roadmap generation failed. Please try again.', 'error'); } finally { setLoadingFeature(null); }
  };

  const handleApplyTailoredResume = async () => {
    if (!tailoredResumeData || !selectedJob) return;

    // 1. Construct new resume object locally to ensure we use latest data
    const updatedResume = {
      ...resume,
      summary: tailoredResumeData.summary,
      skills: tailoredResumeData.skills
    };

    // 2. Update Global State
    setResume(updatedResume);

    // 3. Close Modal
    setTailoredResumeData(null);

    // 4. Auto Re-check Score with new data
    setLoadingFeature('match');
    try {
      const resumeText = JSON.stringify(updatedResume);
      const result = await analyzeResumeMatch(resumeText, selectedJob.description);
      updateSelectedJob(j => ({ ...j, atsAnalysis: result }));
    } catch (e) {
      console.error("Re-analysis failed", e);
      showToast('Resume updated, but failed to re-check score automatically.', 'error');
    } finally {
      setLoadingFeature(null);
    }
  };

  const handleRedFlagScan = async () => {
    if (!selectedJob) return;
    setLoadingFeature('redflags');
    try {
      const result = await detectJobRedFlags(selectedJob.description);
      updateSelectedJob(j => ({ ...j, redFlags: result }));
    } catch (e) { showToast('Red flag scan failed. Please try again.', 'error'); } finally { setLoadingFeature(null); }
  };

  const handleGenerateNetworking = async (hmName: string) => {
    if (!selectedJob) return;
    setLoadingFeature('networking');
    try {
      const result = await generateNetworkingDrafts(selectedJob.company, selectedJob.role, hmName, resume.summary);
      updateSelectedJob(j => ({ ...j, networking: result }));
    } catch (e) { showToast('Draft generation failed. Please try again.', 'error'); } finally { setLoadingFeature(null); }
  };

  const handleNegotiate = async (offerAmount: string) => {
    if (!selectedJob) return;
    setLoadingFeature('negotiation');
    try {
      const result = await generateNegotiationAdvice(
        selectedJob.role,
        selectedJob.company,
        offerAmount,
        selectedJob.description
      );
      updateSelectedJob(j => ({ ...j, negotiation: result }));
    } catch (error) {
      console.error("Negotiation advice generation failed:", error);
      showToast('Failed to generate negotiation advice. Please try again.', 'error');
    } finally {
      setLoadingFeature(null);
    }
  };

  const handleStartRecording = (question: string) => {
    if (!recognition) {
      showToast('Microphone not supported in this browser. Please use Chrome/Edge.', 'error');
      return;
    }
    setIsRecording(true);
    recognition.start();

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      setLoadingFeature('interview-' + question); // unique loader key

      try {
        const feedback = await analyzeMockInterview(question, transcript);
        const newEntry = {
          id: Date.now().toString(),
          question,
          userAudioTranscript: transcript,
          feedback: feedback.feedback,
          improvedAnswer: feedback.improvedAnswer,
          timestamp: Date.now()
        };
        updateSelectedJob(j => ({ ...j, interviewPractice: [...(j.interviewPractice || []), newEntry] }));
      } catch (e) { showToast('Interview feedback failed. Please try again.', 'error'); } finally { setLoadingFeature(null); }
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsRecording(false);
      showToast('Microphone error: ' + event.error, 'error');
    };
  };

  const handleStopRecording = () => {
    if (recognition) recognition.stop();
    setIsRecording(false);
  };

  const handleCompareOffers = async () => {
    if (!compareSelection[0] || !compareSelection[1]) return;
    const job1 = jobs.find(j => j.id === compareSelection[0]);
    const job2 = jobs.find(j => j.id === compareSelection[1]);
    if (!job1 || !job2) return;

    setLoadingFeature('compare');
    try {
      const result = await compareJobOffers(job1, job2);
      setComparisonResult(result);
    } catch (e) { showToast('Offer comparison failed. Please try again.', 'error'); } finally { setLoadingFeature(null); }
  };

  // --- Drag & Drop ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedJobId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e: React.DragEvent, status: JobStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) handleStatusChange(id, status);
    setDraggedJobId(null);
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.APPLIED: return 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300';
      case JobStatus.INTERVIEW: return 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300';
      case JobStatus.OFFER: return 'bg-brand-mint text-brand-deep border border-brand-secondary dark:bg-teal-900/50 dark:border-teal-700 dark:text-teal-200';
      case JobStatus.ACCEPTED: return 'bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300';
      case JobStatus.REJECTED: return 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300';
      default: return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="h-full flex flex-col relative pt-16 md:pt-8">
      {/* Header */}
      <div className="p-8 pb-4 flex justify-between items-center border-b border-brand-mint dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-brand-deep dark:text-white">{isOffersMode ? 'Offers Received' : 'My Applications'}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{displayedJobs.length} {isOffersMode ? 'Active Offers' : 'Active applications'}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Feature 5: Compare Offers Button */}
          {isOffersMode && displayedJobs.length >= 2 && (
            <button onClick={() => setShowCompareModal(true)} className="flex items-center gap-2 bg-white dark:bg-slate-800 text-brand-deep dark:text-white border border-brand-mint dark:border-slate-700 px-4 py-2.5 rounded-xl hover:bg-brand-rose dark:hover:bg-slate-700 transition shadow-sm font-medium">
              <Scale size={18} /><span>Compare Offers</span>
            </button>
          )}

          {!isOffersMode && (
            <div className="bg-brand-rose dark:bg-slate-800 p-1 rounded-lg border border-brand-mint dark:border-slate-700 hidden md:flex">
              <button onClick={() => setViewType('list')} className={`p-2 rounded-md transition-all ${viewType === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-brand-primary dark:text-white' : 'text-slate-400 hover:text-brand-deep dark:hover:text-slate-200'}`}><List size={18} /></button>
              <button onClick={() => setViewType('board')} className={`p-2 rounded-md transition-all ${viewType === 'board' ? 'bg-white dark:bg-slate-600 shadow-sm text-brand-primary dark:text-white' : 'text-slate-400 hover:text-brand-deep dark:hover:text-slate-200'}`}><LayoutGrid size={18} /></button>
            </div>
          )}
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl hover:bg-brand-deep transition shadow-lg shadow-brand-primary/20">
            <Plus size={18} /><span>{isOffersMode ? 'Log New Offer' : 'New Application'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex relative">
        {/* Main Content (List/Board) */}
        <div className={`flex-1 overflow-y-auto transition-all custom-scrollbar ${selectedJob ? (viewType === 'list' ? 'w-1/2 hidden md:block' : 'w-full md:w-1/2 hidden md:block') : 'w-full'}`}>
          <div className="sticky top-0 z-10 p-8 pb-4 pt-4 bg-brand-rose dark:bg-slate-950">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company, role, or location..."
                className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-brand-mint dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-slate-700 dark:text-slate-200 placeholder-brand-primary/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="px-8 pb-8">
            {displayedJobs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>{isOffersMode ? 'No offers received yet.' : 'No applications yet.'}</p>
              </div>
            ) : (
              <>
                {viewType === 'list' || isOffersMode ? (
                  <div className="space-y-4">
                    {displayedJobs.map(job => (
                      <div key={job.id} onClick={() => setSelectedJob(job)} className={`bg-white dark:bg-slate-900 p-5 rounded-xl border transition cursor-pointer hover:shadow-md group relative ${selectedJob?.id === job.id ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-brand-mint dark:border-slate-800'}`}>
                        <button onClick={(e) => handleDeleteJob(job.id, e)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all z-10"><Trash2 size={18} /></button>
                        <div className="flex justify-between items-start mb-3 pr-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-brand-deep dark:text-blue-200 font-bold text-lg border border-brand-mint dark:border-blue-800">{job.role.substring(0, 1)}</div>
                            <div>
                              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                {job.role}
                                {job.followUpDate && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${getIsOverdue(job.followUpDate) ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300'}`}>
                                    <Bell size={10} /> {job.followUpDate}
                                  </span>
                                )}
                                {job.interviewDate && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300">
                                    <CalendarClock size={10} /> {new Date(job.interviewDate).toLocaleDateString()}
                                  </span>
                                )}
                              </h3>
                              <p className="text-slate-500 dark:text-slate-400 text-sm">{job.company}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>{job.status}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                          <div className="flex items-center gap-1"><MapPin size={14} /> {job.location}</div>
                          <div className="flex items-center gap-1"><DollarSign size={14} /> {job.salary}</div>
                          <div className="flex items-center gap-1 ml-auto"><Calendar size={14} /> {job.dateApplied}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-220px)] items-start">
                    {KANBAN_COLUMNS.map(column => {
                      const columnJobs = displayedJobs.filter(j => j.status === column.id);
                      return (
                        <div key={column.id} className={`min-w-[280px] w-[280px] flex-shrink-0 flex flex-col h-full rounded-2xl border ${column.color} bg-opacity-30`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, column.id)}>
                          <div className="p-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                            <h3 className={`font-bold text-sm ${column.color.split(' ')[2]}`}>{column.label}</h3>
                            <span className="text-xs font-medium px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded-full">{columnJobs.length}</span>
                          </div>
                          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                            {columnJobs.map(job => (
                              <div key={job.id} draggable onDragStart={(e) => handleDragStart(e, job.id)} onClick={() => setSelectedJob(job)} className={`bg-white dark:bg-slate-900 p-3 rounded-xl border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition group relative ${selectedJob?.id === job.id ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-transparent dark:border-slate-800'}`}>
                                <div className="flex justify-between items-start mb-2">
                                  <div className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{job.role}</div>
                                  <div className="relative job-menu-trigger">
                                    <button onClick={(e) => { e.stopPropagation(); setActiveMenuJobId(activeMenuJobId === job.id ? null : job.id); }} className="text-slate-400 hover:text-brand-primary p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><MoreHorizontal size={16} /></button>
                                    {activeMenuJobId === job.id && (
                                      <div className="absolute right-0 top-6 w-40 bg-white dark:bg-slate-900 border border-brand-mint dark:border-slate-700 shadow-xl rounded-lg z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        {KANBAN_COLUMNS.filter(c => c.id !== job.status).map(col => (
                                          <button key={col.id} onClick={(e) => { e.stopPropagation(); handleStatusChange(job.id, col.id); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-brand-rose dark:hover:bg-slate-800 hover:text-brand-primary">{col.label}</button>
                                        ))}
                                        <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                                        <button onClick={(e) => handleDeleteJob(job.id, e)} className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30">Delete</button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">{job.company}</div>
                                <div className="flex flex-wrap gap-1">
                                  {job.followUpDate && (
                                    <div className={`text-[10px] px-2 py-1 rounded inline-flex items-center gap-1 ${getIsOverdue(job.followUpDate) ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300'}`}>
                                      <Bell size={10} /> {job.followUpDate}
                                    </div>
                                  )}
                                  {job.interviewDate && (
                                    <div className="text-[10px] px-2 py-1 rounded inline-flex items-center gap-1 bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300">
                                      <CalendarClock size={10} /> {new Date(job.interviewDate).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* --- JOB DETAIL PANEL --- */}
        {selectedJob && (
          <div className="fixed top-16 md:top-[52px] bottom-0 right-0 z-[60] bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-brand-mint dark:border-slate-800 transition-all duration-300 w-full md:w-[650px]">
            {/* Detail Header */}
            <div className="p-6 border-b border-brand-mint dark:border-slate-800 flex justify-between items-start bg-white dark:bg-slate-900 z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{selectedJob.role}</h2>
                <div className="text-brand-primary font-medium">{selectedJob.company}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-brand-primary"><X size={20} /></button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-brand-mint dark:border-slate-800 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: FileText, visible: true },
                { id: 'analysis', label: 'Analysis', icon: BarChart3, visible: true },
                { id: 'networking', label: 'Networking', icon: Users, visible: true },
                { id: 'practice', label: 'Practice', icon: Mic, visible: true }
              ].filter(t => t.visible).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-brand-rose dark:bg-slate-950">

              {/* --- TAB: OVERVIEW --- */}
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-brand-mint dark:border-slate-800">
                      <div className="text-xs text-brand-deep dark:text-blue-300 uppercase font-bold mb-1">Salary</div>
                      <div className="text-slate-700 dark:text-slate-200 font-medium">{selectedJob.salary}</div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-brand-mint dark:border-slate-800">
                      <label className="text-xs text-brand-deep dark:text-blue-300 uppercase font-bold mb-1 block">Status</label>
                      <select
                        value={selectedJob.status}
                        onChange={(e) => handleStatusChange(selectedJob.id, e.target.value)}
                        className="bg-transparent font-medium text-brand-primary outline-none cursor-pointer w-full dark:bg-slate-900"
                      >
                        <option value={JobStatus.APPLIED}>Applied</option>
                        <option value={JobStatus.INTERVIEW}>Interviewing</option>
                        <option value={JobStatus.OFFER}>Offer</option>
                        <option value={JobStatus.ACCEPTED}>Accepted</option>
                        <option value={JobStatus.REJECTED}>Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Interview Scheduling */}
                  {selectedJob.status === JobStatus.INTERVIEW && (
                    <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300 shadow-sm border border-purple-200 dark:border-purple-800">
                            <CalendarPlus size={16} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-purple-900 dark:text-purple-200">Interview Date</div>
                            <div className="text-xs text-purple-700 dark:text-purple-400">Schedule your session</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <input
                          type="datetime-local"
                          value={selectedJob.interviewDate || ''}
                          onChange={(e) => handleInterviewDateChange(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900/30 text-purple-900 dark:text-purple-200 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-purple-400"
                        />

                        {selectedJob.interviewDate && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => addToGoogleCalendar(selectedJob)}
                              className="flex-1 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900/30 text-purple-700 dark:text-purple-300 py-2 rounded-lg text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/30 flex items-center justify-center gap-2 transition"
                            >
                              <Calendar size={14} /> Add to Google Calendar
                            </button>
                            <div className="flex-1 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900/30 text-purple-700 dark:text-purple-300 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2" title={`We'll notify you ${settings.reminderTiming} mins before if this tab is open`}>
                              <BellRing size={14} /> Auto-Reminder Set
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Follow Up Reminder */}
                  {(selectedJob.status === JobStatus.APPLIED) && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-amber-900/30">
                          <CalendarClock size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-amber-900 dark:text-amber-200">Follow-up Reminder</div>
                          <div className="text-xs text-amber-700 dark:text-amber-400">Set a date to nudge the recruiter.</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={selectedJob.followUpDate || ''}
                          onChange={(e) => handleDateChange(e.target.value)}
                          className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/30 text-amber-900 dark:text-amber-200 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        {selectedJob.followUpDate && (
                          <button onClick={() => updateSelectedJob(j => ({ ...j, followUpDate: undefined }))} className="p-2 bg-white dark:bg-slate-800 rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 mt-4">Description</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">{selectedJob.description || 'No description provided.'}</p>
                  </div>

                  {/* Application URL */}
                  {selectedJob.applicationUrl && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                      <Link2 size={16} className="text-brand-primary flex-shrink-0" />
                      <a
                        href={selectedJob.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-primary hover:text-brand-deep truncate underline underline-offset-2"
                      >
                        {selectedJob.applicationUrl}
                      </a>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 mt-2">Notes</h3>
                    <textarea
                      defaultValue={selectedJob.notes || ''}
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (val !== (selectedJob.notes || '')) {
                          updateSelectedJob(j => ({ ...j, notes: val }));
                          showToast('Notes saved', 'success');
                        }
                      }}
                      placeholder="Add personal notes about this position..."
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 resize-none h-28 outline-none focus:ring-2 focus:ring-brand-primary/30 transition placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  {/* Negotiation Section (Only if Offer) */}
                  {(selectedJob.status === JobStatus.OFFER || selectedJob.status === JobStatus.ACCEPTED) && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-5">
                      <h3 className="text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2 mb-3">
                        <DollarSignIcon size={18} /> Salary Negotiation Coach
                      </h3>
                      {!selectedJob.negotiation ? (
                        <div className="flex gap-2">
                          <input type="text" placeholder="Offer Amount (e.g. $120k)" className="flex-1 p-2 border border-emerald-200 dark:border-emerald-800 dark:bg-slate-800 dark:text-emerald-200 rounded-lg text-sm" id="offerInput" />
                          <button
                            onClick={() => handleNegotiate((document.getElementById('offerInput') as HTMLInputElement).value)}
                            disabled={loadingFeature === 'negotiation'}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {loadingFeature === 'negotiation' ? <Loader2 className="animate-spin" size={16} /> : 'Generate Script'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-sm text-emerald-900 dark:text-emerald-200 bg-white dark:bg-slate-800 p-3 rounded border border-emerald-100 dark:border-emerald-800 italic">"{selectedJob.negotiation.strategy}"</div>
                          <div className="bg-white dark:bg-slate-900 p-3 rounded border border-emerald-100 dark:border-emerald-800 text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">{selectedJob.negotiation.script}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Standard AI Content */}
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-brand-mint dark:border-slate-800 flex flex-col">
                    <h3 className="font-bold text-brand-deep dark:text-blue-300 mb-4 flex items-center gap-2">
                      <Sparkles size={16} /> AI Generated Assets
                    </h3>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-brand-mint dark:border-slate-700 h-60 overflow-y-auto custom-scrollbar">
                      <FormattedDisplay text={selectedJob.interviewGuide || selectedJob.coverLetter} />
                    </div>
                  </div>
                </>
              )}

              {/* --- TAB: ANALYSIS (ATS & Red Flags) --- */}
              {activeTab === 'analysis' && (
                <div className="space-y-6">
                  {/* ATS Score - Conditional Rendering */}
                  {(selectedJob.status === JobStatus.OFFER || selectedJob.status === JobStatus.ACCEPTED) ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-6 shadow-sm text-center">
                      <div className="w-16 h-16 bg-white dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
                        <Trophy size={32} className="text-emerald-500" />
                      </div>
                      <h3 className="font-bold text-emerald-800 dark:text-emerald-200 text-lg mb-2">Resume Validated!</h3>
                      <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                        You have already secured an offer for this position. The ATS analysis is no longer necessary as your resume has successfully passed the screening process.
                      </p>
                    </div>
                  ) : selectedJob.status === JobStatus.INTERVIEW ? (
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-6 shadow-sm text-center">
                      <div className="w-16 h-16 bg-white dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-800">
                        <CheckCircle2 size={32} className="text-blue-500" />
                      </div>
                      <h3 className="font-bold text-blue-800 dark:text-blue-200 text-lg mb-2">Resume Passed!</h3>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        Since you are interviewing, you've already beaten the ATS. Focus on your interview preparation now!
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-brand-mint dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col items-center">
                      <div className="w-full flex justify-between items-center mb-6">
                        <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-widest text-xs"><Target size={18} className="text-brand-primary" /> ATS Match Score</h3>
                        <div className="flex gap-2">
                          {selectedJob.atsAnalysis ? (
                            <button
                              onClick={handleAnalyzeMatch}
                              disabled={loadingFeature === 'match'}
                              className="text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-800 border border-brand-mint dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:text-brand-primary hover:border-brand-primary transition-all disabled:opacity-50 flex items-center gap-1.5"
                            >
                              <RefreshCw size={14} className={loadingFeature === 'match' ? 'animate-spin' : ''} />
                              {loadingFeature === 'match' ? 'Re-checking...' : 'Update Match'}
                            </button>
                          ) : (
                            <button
                              onClick={handleAnalyzeMatch}
                              disabled={loadingFeature === 'match'}
                              className="text-[10px] font-black uppercase tracking-widest bg-brand-primary text-white px-3 py-1.5 rounded-lg hover:bg-brand-deep disabled:opacity-50"
                            >
                              {loadingFeature === 'match' ? 'Analyzing...' : 'Run Analysis'}
                            </button>
                          )}
                        </div>
                      </div>

                      {selectedJob.atsAnalysis ? (
                        <div className="w-full space-y-6">
                          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <ATSGauge score={selectedJob.atsAnalysis.matchScore} />
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 text-center max-w-sm italic">"{selectedJob.atsAnalysis.explanation}"</p>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Keywords Analysis</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedJob.atsAnalysis.missingKeywords.length > 0 ? (
                                selectedJob.atsAnalysis.missingKeywords.map(k => (
                                  <span key={k} className="px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-lg border border-rose-100 dark:border-rose-900/50 flex items-center gap-1.5">
                                    <AlertCircle size={12} /> {k}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">No critical keywords missing!</span>
                              )}
                            </div>
                          </div>

                          {/* Feature 1: Learning Roadmap UI */}
                          {selectedJob.atsAnalysis.missingKeywords.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                              <h4 className="font-black text-slate-800 dark:text-white text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                                <GraduationCap size={16} className="text-brand-primary" /> Skill Gap Crash Course
                              </h4>
                              {!selectedJob.learningRoadmap ? (
                                <button
                                  onClick={handleGenerateRoadmap}
                                  disabled={loadingFeature === 'roadmap'}
                                  className="w-full bg-blue-50 dark:bg-blue-900/20 text-brand-primary dark:text-blue-300 border border-brand-mint dark:border-blue-800 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition flex items-center justify-center gap-2"
                                >
                                  {loadingFeature === 'roadmap' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                  Generate 3-Day Study Plan
                                </button>
                              ) : (
                                <div className="space-y-3">
                                  {selectedJob.learningRoadmap.map((day, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-brand-primary bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-brand-mint dark:border-slate-700">{day.day}</span>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{day.theme}</span>
                                      </div>
                                      <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1 mb-2">
                                        {day.tasks.map((t, i) => <li key={i}>{t}</li>)}
                                      </ul>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {day.resources.map((res, i) => (
                                          <a
                                            key={i}
                                            href={`https://www.google.com/search?q=${encodeURIComponent(res.searchQuery)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[10px] flex items-center gap-1 bg-white dark:bg-slate-900 border border-brand-mint dark:border-slate-700 text-brand-secondary px-2 py-1 rounded-md hover:text-brand-primary hover:border-brand-primary"
                                          >
                                            <ExternalLink size={10} /> {res.title}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Tailor Resume Action */}
                          {!tailoredResumeData ? (
                            <button
                              onClick={handleTailorResume}
                              disabled={loadingFeature === 'tailor'}
                              className="w-full bg-brand-primary/10 dark:bg-blue-900/30 text-brand-primary dark:text-blue-300 border border-brand-primary/20 dark:border-blue-800 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition flex items-center justify-center gap-2 mt-4"
                            >
                              {loadingFeature === 'tailor' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                              Tailor Resume for this Job
                            </button>
                          ) : (
                            <div className="bg-brand-rose dark:bg-slate-800 rounded-2xl p-5 border border-brand-mint dark:border-slate-700 animate-in fade-in slide-in-from-top-2 mt-4">
                              <h4 className="font-black text-brand-deep dark:text-white text-[10px] uppercase tracking-widest mb-4">Suggested Resume Updates</h4>

                              <div className="space-y-4 mb-6">
                                <div>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Summary</span>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-brand-mint dark:border-slate-700 mt-2">{tailoredResumeData.summary}</p>
                                </div>
                                <div>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enhanced Skills</span>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-brand-mint dark:border-slate-700 mt-2">{tailoredResumeData.skills}</p>
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <button onClick={handleApplyTailoredResume} className="flex-1 bg-brand-primary text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-deep shadow-lg shadow-brand-primary/20 transition-all">Apply to Resume</button>
                                <button onClick={() => setTailoredResumeData(null)} className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Dismiss</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-10">Run the analysis to see how well your resume matches this job description.</p>}
                    </div>
                  )}

                  {/* Red Flags - Conditional Rendering */}
                  {(selectedJob.status === JobStatus.OFFER || selectedJob.status === JobStatus.ACCEPTED) ? (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-6 shadow-sm text-center">
                      <div className="w-16 h-16 bg-white dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
                        <ShieldAlert size={32} className="text-amber-500" />
                      </div>
                      <h3 className="font-bold text-amber-800 dark:text-amber-200 text-lg mb-2">Vibe Check Passed</h3>
                      <p className="text-amber-700 dark:text-amber-300 text-sm">
                        You've secured the offer, which is the ultimate green flag! Trust your interview experience over the job description now.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-brand-mint dark:border-slate-800 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><ShieldAlert size={18} className="text-amber-500" /> Vibe Check</h3>
                        {!selectedJob.redFlags && (
                          <button onClick={handleRedFlagScan} disabled={loadingFeature === 'redflags'} className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 disabled:opacity-50">
                            {loadingFeature === 'redflags' ? 'Scanning...' : 'Scan Description'}
                          </button>
                        )}
                      </div>

                      {selectedJob.redFlags ? (() => {
                        const getVerdictStyles = (verdict: string) => {
                          const lowerVerdict = verdict.toLowerCase();
                          if (lowerVerdict.includes('safe')) {
                            return {
                              bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                              borderColor: 'border-emerald-200 dark:border-emerald-800',
                              textColor: 'text-emerald-800 dark:text-emerald-300',
                              icon: <CheckCircle2 size={18} />
                            };
                          }
                          if (lowerVerdict.includes('caution')) {
                            return {
                              bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                              borderColor: 'border-amber-200 dark:border-amber-800',
                              textColor: 'text-amber-800 dark:text-amber-300',
                              icon: <ShieldAlert size={18} />
                            };
                          }
                          if (lowerVerdict.includes('avoid')) {
                            return {
                              bgColor: 'bg-rose-50 dark:bg-rose-900/20',
                              borderColor: 'border-rose-200 dark:border-rose-800',
                              textColor: 'text-rose-800 dark:text-rose-300',
                              icon: <XCircle size={18} />
                            };
                          }
                          return { // default
                            bgColor: 'bg-slate-50 dark:bg-slate-800',
                            borderColor: 'border-slate-200 dark:border-slate-700',
                            textColor: 'text-slate-800 dark:text-slate-300',
                            icon: <ShieldAlert size={18} />
                          };
                        };
                        const verdictStyles = getVerdictStyles(selectedJob.redFlags.verdict);

                        return (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase block mb-2">Green Flags</span>
                                <ul className="text-sm space-y-1 text-emerald-800 dark:text-emerald-200">
                                  {selectedJob.redFlags.pros.map((p, i) => <li key={i} className="flex gap-2 items-start"><Check size={14} className="mt-0.5 shrink-0" /> {p}</li>)}
                                </ul>
                              </div>
                              <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30">
                                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase block mb-2">Red Flags</span>
                                <ul className="text-sm space-y-1 text-rose-800 dark:text-rose-200">
                                  {selectedJob.redFlags.cons.map((c, i) => <li key={i} className="flex gap-2 items-start"><ShieldAlert size={14} className="mt-0.5 shrink-0" /> {c}</li>)}
                                </ul>
                              </div>
                            </div>
                            <div className={`p-4 rounded-xl border ${verdictStyles.bgColor} ${verdictStyles.borderColor}`}>
                              <div className="flex items-start gap-3">
                                <span className={`${verdictStyles.textColor} flex-shrink-0 mt-0.5`}>
                                  {verdictStyles.icon}
                                </span>
                                <p className={`font-medium text-sm ${verdictStyles.textColor}`}>
                                  <span className="font-bold">AI Verdict:</span> {selectedJob.redFlags.verdict}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })() : <p className="text-sm text-slate-500 dark:text-slate-400 italic">Analyze the job description for toxic workplace signals or hidden benefits.</p>}
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB: NETWORKING --- */}
              {activeTab === 'networking' && (
                <div className="space-y-4">
                  {(selectedJob.status === JobStatus.OFFER || selectedJob.status === JobStatus.ACCEPTED) ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-6 shadow-sm text-center animate-in fade-in zoom-in-95 duration-300">
                      <div className="w-16 h-16 bg-white dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                        <Users size={32} className="text-emerald-500" />
                      </div>
                      <h3 className="font-bold text-emerald-800 dark:text-emerald-200 text-lg mb-2">Network Established!</h3>
                      <p className="text-emerald-700 dark:text-emerald-300 text-sm max-w-xs mx-auto">
                        You've secured the position. Your outreach efforts have paid off! Now focus on building relationships with your new team.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-brand-mint dark:border-blue-900/30">
                        <label className="block text-sm font-bold text-brand-deep dark:text-blue-300 mb-2">Hiring Manager Name (Optional)</label>
                        <div className="flex gap-2">
                          <input type="text" id="hmName" placeholder="e.g. Sarah Smith" className="flex-1 p-2 border border-brand-mint dark:border-blue-800 dark:bg-slate-800 dark:text-white rounded-lg text-sm" />
                          <button
                            onClick={() => handleGenerateNetworking((document.getElementById('hmName') as HTMLInputElement).value)}
                            disabled={loadingFeature === 'networking'}
                            className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-deep disabled:opacity-50 flex items-center gap-2"
                          >
                            {loadingFeature === 'networking' ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Generate Drafts
                          </button>
                        </div>
                      </div>

                      {selectedJob.networking ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                          {[
                            { title: 'LinkedIn Connect', content: selectedJob.networking.linkedin },
                            { title: 'Cold Email', content: selectedJob.networking.email },
                            { title: 'Follow Up (1 week later)', content: selectedJob.networking.followup }
                          ].map((msg, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 border border-brand-mint dark:border-slate-700 rounded-xl overflow-hidden group">
                              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 border-b border-brand-mint dark:border-slate-700 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{msg.title}</span>
                                <button onClick={() => navigator.clipboard.writeText(msg.content)} className="text-brand-primary hover:bg-blue-100 dark:hover:bg-blue-900/30 p-1 rounded"><Copy size={14} /></button>
                              </div>
                              <div className="p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{msg.content}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                          <Users size={48} className="mx-auto mb-2 opacity-20" />
                          <p className="text-sm">Generate personalized outreach messages to 3x your interview chances.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* --- TAB: PRACTICE (Mock Interview) --- */}
              {activeTab === 'practice' && (
                <div className="space-y-6">
                  {(selectedJob.status === JobStatus.OFFER || selectedJob.status === JobStatus.ACCEPTED) ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-6 shadow-sm text-center animate-in fade-in zoom-in-95 duration-300">
                      <div className="w-16 h-16 bg-white dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                        <Mic size={32} className="text-emerald-500" />
                      </div>
                      <h3 className="font-bold text-emerald-800 dark:text-emerald-200 text-lg mb-2">Interview Phase Complete!</h3>
                      <p className="text-emerald-700 dark:text-emerald-300 text-sm max-w-xs mx-auto">
                        You've successfully passed the interviews. No need to practice for this role anymore. Great job!
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-brand-mint dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Mic size={18} className="text-brand-primary" /> Audio Simulator</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Practice answering common questions. The AI will analyze your speech and provide feedback.</p>

                        <div className="space-y-3">
                          {["Tell me about yourself.", "Why do you want this role?", "What is your biggest weakness?"].map((q) => (
                            <div key={q} className="border border-slate-100 dark:border-slate-700 rounded-lg p-3 hover:border-brand-mint dark:hover:border-slate-600 transition-colors">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{q}</span>
                                <button
                                  onClick={() => isRecording ? handleStopRecording() : handleStartRecording(q)}
                                  className={`p-2 rounded-full transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-brand-rose dark:bg-slate-700 text-brand-primary hover:bg-brand-primary hover:text-white'}`}
                                >
                                  {isRecording ? <MicOff size={16} /> : <PlayCircle size={16} />}
                                </button>
                              </div>
                              {loadingFeature === 'interview-' + q && <div className="text-xs text-brand-primary flex gap-2 items-center"><Loader2 size={12} className="animate-spin" /> Analyzing your answer...</div>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Feedback List */}
                      {selectedJob.interviewPractice && selectedJob.interviewPractice.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Recent Feedback</h4>
                          {selectedJob.interviewPractice.map((entry) => (
                            <div key={entry.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                              <div className="text-xs font-bold text-brand-primary mb-1">{entry.question}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">"{entry.userAudioTranscript}"</div>
                              <div className="bg-white dark:bg-slate-900 p-3 rounded border border-brand-mint dark:border-slate-700 mb-2">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Feedback</span>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{entry.feedback}</p>
                              </div>
                              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded border border-emerald-100 dark:border-emerald-900/30">
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block mb-1">Improved Answer</span>
                                <p className="text-sm text-emerald-800 dark:text-emerald-200">{entry.improvedAnswer}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Feature 5 Modal: Offer Comparison */}
      {showCompareModal && (
        <CompareOffersModal
          jobs={jobs}
          displayedJobs={displayedJobs}
          compareSelection={compareSelection}
          setCompareSelection={setCompareSelection}
          comparisonResult={comparisonResult}
          setComparisonResult={setComparisonResult}
          loadingFeature={loadingFeature}
          onCompare={handleCompareOffers}
          onClose={() => setShowCompareModal(false)}
        />
      )}

      {/* Add Job Modal */}
      {showAddModal && (
        <AddJobModal
          isOffersMode={isOffersMode}
          newJob={newJob}
          setNewJob={setNewJob}
          isGenerating={isGenerating}
          onSubmit={handleCreateJob}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {pendingDeleteId && (() => {
        const jobToDelete = jobs.find(j => j.id === pendingDeleteId);
        return (
          <div className="fixed inset-0 bg-brand-deep/20 dark:bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-rose-200 dark:border-slate-700">
              <div className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
                  <Trash2 size={24} className="text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete Job?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Are you sure you want to delete <strong className="text-slate-700 dark:text-slate-200">{jobToDelete?.role}</strong> at <strong className="text-slate-700 dark:text-slate-200">{jobToDelete?.company}</strong>? This can't be undone.
                </p>
              </div>
              <div className="flex border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setPendingDeleteId(null)}
                  className="flex-1 py-3.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteJob}
                  className="flex-1 py-3.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition border-l border-slate-100 dark:border-slate-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default JobTracker;