import React, { useState, useRef } from 'react';
import { Resume, ResumeSection, Project } from '../types';
import { Printer, Plus, Trash2, ChevronDown, ChevronUp, Image as ImageIcon, Upload, Loader2, Sparkles, Save, Check } from 'lucide-react';
import { parseAndImproveResume, generateResumeSummary } from '../services/geminiService';

interface ResumeBuilderProps {
  resume: Resume;
  setResume: React.Dispatch<React.SetStateAction<Resume>>;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ resume, setResume }) => {
  const [editMode, setEditMode] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    try {
      localStorage.setItem('jobflow_resume', JSON.stringify(resume));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save resume", e);
      alert("Failed to save resume. Please check your browser settings.");
    }
  };

  const updateField = (field: keyof Resume, value: string) => {
    setResume(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (section: 'experience' | 'education' | 'projects' | 'certifications') => {
    const newId = Date.now().toString();
    if (section === 'projects') {
      setResume(prev => ({
        ...prev,
        projects: [...prev.projects, { id: newId, name: '', technologies: '', link: '', description: '' }]
      }));
    } else {
      setResume(prev => ({
        ...prev,
        [section]: [...(prev[section] || []), { id: newId, title: '', company: '', date: '', details: '' }]
      }));
    }
  };

  const removeItem = (section: 'experience' | 'education' | 'projects' | 'certifications', id: string) => {
    setResume(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((item: any) => item.id !== id)
    }));
  };

  const updateItem = (section: 'experience' | 'education' | 'projects' | 'certifications', id: string, field: string, value: string) => {
    setResume(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).map((item: any) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const summary = await generateResumeSummary(resume);
      updateField('summary', summary);
    } catch (error) {
      console.error("Failed to generate summary", error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        const mimeType = file.type; // e.g. application/pdf, image/png
        
        try {
          const parsedData = await parseAndImproveResume(result, mimeType);
          
          if (parsedData) {
            setResume(prev => ({
              ...prev,
              ...parsedData,
              // Generate unique IDs for arrays if missing
              experience: parsedData.experience?.map((item: any, idx: number) => ({
                ...item, 
                id: Date.now().toString() + 'exp' + idx 
              })) || [],
              education: parsedData.education?.map((item: any, idx: number) => ({
                ...item, 
                id: Date.now().toString() + 'edu' + idx 
              })) || [],
              certifications: parsedData.certifications?.map((item: any, idx: number) => ({
                ...item, 
                id: Date.now().toString() + 'cert' + idx 
              })) || [],
              projects: parsedData.projects?.map((item: any, idx: number) => ({
                ...item, 
                id: Date.now().toString() + 'proj' + idx 
              })) || [],
              avatar: prev.avatar // Keep existing avatar if any
            }));
          }
        } catch (err) {
          console.error("Gemini processing error", err);
          alert("Could not process the resume. Please ensure the file is readable.");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Editor Panel - Dark Mode Enabled */}
      <div className={`w-full md:w-1/3 bg-white dark:bg-slate-900 border-r border-brand-mint dark:border-slate-800 overflow-y-auto p-6 no-print custom-scrollbar ${!editMode ? 'hidden md:block' : ''}`}>
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-brand-deep dark:text-white">Editor</h2>
           <div className="flex items-center gap-2">
             <button 
                onClick={handleSave}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSaved 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                    : 'bg-brand-rose dark:bg-slate-800 text-brand-primary dark:text-slate-200 border border-brand-mint dark:border-slate-700 hover:bg-brand-mint dark:hover:bg-slate-700'
                }`}
             >
                {isSaved ? <Check size={14} /> : <Save size={14} />}
                {isSaved ? 'Saved' : 'Save Progress'}
             </button>
             <button onClick={() => setEditMode(false)} className="text-sm text-brand-primary dark:text-blue-300 hover:underline md:hidden">Preview</button>
           </div>
        </div>

        {/* Upload CV Button */}
        <div className="mb-8">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,image/*" 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-brand-secondary dark:border-slate-700 bg-blue-50 dark:bg-slate-800/50 rounded-xl hover:bg-blue-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin text-brand-primary mb-2" size={24} />
                <span className="text-sm font-medium text-brand-deep dark:text-slate-200">Analyzing CV with AI...</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Upload className="text-brand-primary dark:text-blue-400" size={20} />
                  <span className="font-bold text-brand-deep dark:text-slate-200">Upload CV to Auto-Fill</span>
                </div>
                <p className="text-xs text-brand-deep/70 dark:text-slate-400 text-center">
                  Ntim will analyze & professionalize your existing resume
                </p>
              </>
            )}
          </button>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-brand-primary dark:text-blue-300 uppercase tracking-wider mb-3">Personal Info</h3>
            <div className="space-y-3">
              <input 
                type="text" 
                value={resume.fullName} 
                onChange={(e) => updateField('fullName', e.target.value)}
                className="w-full p-2 border border-brand-mint dark:border-slate-700 rounded text-sm focus:border-brand-primary outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-white dark:bg-slate-800" placeholder="Full Name"
              />
              <input 
                type="text" 
                value={resume.email} 
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full p-2 border border-brand-mint dark:border-slate-700 rounded text-sm focus:border-brand-primary outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-white dark:bg-slate-800" placeholder="Email"
              />
              <input 
                type="text" 
                value={resume.phone} 
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full p-2 border border-brand-mint dark:border-slate-700 rounded text-sm focus:border-brand-primary outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-white dark:bg-slate-800" placeholder="Phone"
              />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-brand-primary dark:text-blue-300 uppercase tracking-wider">Professional Summary</h3>
              <button 
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-primary dark:text-blue-300 bg-blue-50 dark:bg-slate-800 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                title="Auto-Generate Summary"
              >
                {isGeneratingSummary ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Generate
              </button>
            </div>
            <textarea 
              value={resume.summary} 
              onChange={(e) => updateField('summary', e.target.value)}
              className="w-full p-2 border border-brand-mint dark:border-slate-700 rounded text-sm h-32 focus:border-brand-primary outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-white dark:bg-slate-800" placeholder="Summary"
            />
          </section>

          {/* Experience Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-brand-primary dark:text-blue-300 uppercase tracking-wider">Experience</h3>
              <button onClick={() => addItem('experience')} className="text-brand-primary dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 p-1 rounded" title="Add Experience">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {resume.experience.map(exp => (
                <div key={exp.id} className="p-4 bg-blue-50 dark:bg-slate-800 rounded-lg border border-brand-mint dark:border-slate-700 space-y-2 relative group">
                  <button onClick={() => removeItem('experience', exp.id)} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 transition-colors" title="Remove">
                    <Trash2 size={14} />
                  </button>
                  <input className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Job Title" value={exp.title} onChange={e => updateItem('experience', exp.id, 'title', e.target.value)} />
                  <input className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Company" value={exp.company} onChange={e => updateItem('experience', exp.id, 'company', e.target.value)} />
                  <input className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Date Range" value={exp.date} onChange={e => updateItem('experience', exp.id, 'date', e.target.value)} />
                  <textarea className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm h-20 resize-y focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Description" value={exp.details} onChange={e => updateItem('experience', exp.id, 'details', e.target.value)} />
                </div>
              ))}
            </div>
          </section>

          {/* Education Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-brand-primary dark:text-blue-300 uppercase tracking-wider">Education</h3>
              <button onClick={() => addItem('education')} className="text-brand-primary dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 p-1 rounded" title="Add Education">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {resume.education.map(edu => (
                <div key={edu.id} className="p-4 bg-blue-50 dark:bg-slate-800 rounded-lg border border-brand-mint dark:border-slate-700 space-y-2 relative group">
                  <button onClick={() => removeItem('education', edu.id)} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 transition-colors" title="Remove">
                    <Trash2 size={14} />
                  </button>
                  <input className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Degree / Certificate" value={edu.title} onChange={e => updateItem('education', edu.id, 'title', e.target.value)} />
                  <input className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Institution" value={edu.company} onChange={e => updateItem('education', edu.id, 'company', e.target.value)} />
                  <input className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Date Range" value={edu.date} onChange={e => updateItem('education', edu.id, 'date', e.target.value)} />
                  <textarea className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm h-20 resize-y focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Details" value={edu.details} onChange={e => updateItem('education', edu.id, 'details', e.target.value)} />
                </div>
              ))}
            </div>
          </section>

          {/* Certifications Section (New) */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-brand-primary dark:text-blue-300 uppercase tracking-wider">Certifications</h3>
              <button onClick={() => addItem('certifications')} className="text-brand-primary dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 p-1 rounded" title="Add Certification">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {(resume.certifications || []).map(cert => (
                <div key={cert.id} className="p-4 bg-blue-50 dark:bg-slate-800 rounded-lg border border-brand-mint dark:border-slate-700 space-y-2 relative group">
                  <button onClick={() => removeItem('certifications', cert.id)} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 transition-colors" title="Remove">
                    <Trash2 size={14} />
                  </button>
                  <input className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Certification Name" value={cert.title} onChange={e => updateItem('certifications', cert.id, 'title', e.target.value)} />
                  <input className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Issuing Organization" value={cert.company} onChange={e => updateItem('certifications', cert.id, 'company', e.target.value)} />
                  <input className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Date Issued / Expiry" value={cert.date} onChange={e => updateItem('certifications', cert.id, 'date', e.target.value)} />
                  <textarea className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm h-20 resize-y focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Credential ID / Description" value={cert.details} onChange={e => updateItem('certifications', cert.id, 'details', e.target.value)} />
                </div>
              ))}
            </div>
          </section>

          {/* Skills Section (Moved Down) */}
          <section>
            <h3 className="text-sm font-semibold text-brand-primary dark:text-blue-300 uppercase tracking-wider mb-3">Skills</h3>
            <textarea 
              value={resume.skills} 
              onChange={(e) => updateField('skills', e.target.value)}
              className="w-full p-2 border border-brand-mint dark:border-slate-700 rounded text-sm h-20 focus:border-brand-primary outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-white dark:bg-slate-800" placeholder="Skills (comma separated)"
            />
          </section>

          {/* Projects Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-brand-primary dark:text-blue-300 uppercase tracking-wider">Projects</h3>
              <button onClick={() => addItem('projects')} className="text-brand-primary dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 p-1 rounded" title="Add Project">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {resume.projects.map(proj => (
                <div key={proj.id} className="p-4 bg-blue-50 dark:bg-slate-800 rounded-lg border border-brand-mint dark:border-slate-700 space-y-2 relative group">
                  <button onClick={() => removeItem('projects', proj.id)} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 transition-colors" title="Remove">
                    <Trash2 size={14} />
                  </button>
                  <input className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Project Name" value={proj.name} onChange={e => updateItem('projects', proj.id, 'name', e.target.value)} />
                  <input className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Technologies" value={proj.technologies} onChange={e => updateItem('projects', proj.id, 'technologies', e.target.value)} />
                  <input className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Link (Optional)" value={proj.link} onChange={e => updateItem('projects', proj.id, 'link', e.target.value)} />
                  <textarea className="w-full p-2 border border-brand-mint dark:border-slate-600 rounded text-sm h-20 resize-y focus:border-brand-primary outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200" placeholder="Description" value={proj.description} onChange={e => updateItem('projects', proj.id, 'description', e.target.value)} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Preview Panel - FORCE WHITE for Paper Look even in Dark Mode */}
      <div className="flex-1 bg-brand-rose dark:bg-slate-950 p-8 overflow-y-auto print:bg-white print:p-0 print:overflow-visible custom-scrollbar">
        <div className="max-w-[210mm] mx-auto mb-4 flex justify-end no-print gap-2">
           <button 
             onClick={() => setEditMode(!editMode)} 
             className="px-4 py-2 bg-white dark:bg-slate-800 border border-brand-mint dark:border-slate-700 rounded-lg text-brand-deep dark:text-slate-200 text-sm font-medium hover:bg-brand-mint/20 dark:hover:bg-slate-700 md:hidden"
           >
             {editMode ? 'Full Preview' : 'Edit'}
           </button>
           <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-brand-deep dark:bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-brand-primary dark:hover:bg-slate-600 shadow-md"
          >
            <Printer size={16} />
            Print / Save PDF
          </button>
        </div>

        {/* Resume A4 Page - Always White Background for Paper Simulation */}
        <div className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl shadow-brand-primary/10 dark:shadow-none print:shadow-none p-[20mm]">
          <header className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 uppercase tracking-tight mb-2">{resume.fullName}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span>{resume.email}</span>
                <span className="w-1 h-1 bg-slate-400 rounded-full self-center"></span>
                <span>{resume.phone}</span>
              </div>
            </div>
            
            {/* Avatar Display in Header */}
            {resume.avatar ? (
              <img 
                src={resume.avatar} 
                alt="Profile" 
                className="w-24 h-24 object-cover rounded-lg border border-slate-200 ml-6"
              />
            ) : (
              <div className="w-24 h-24 border-2 border-dashed border-brand-secondary bg-blue-50 rounded-lg ml-6 flex flex-col items-center justify-center text-center p-1 print:hidden">
                <ImageIcon className="text-brand-secondary mb-1" size={20} />
                <span className="text-[10px] text-brand-deep font-medium leading-tight">Put the 1x1 image here</span>
              </div>
            )}
          </header>

          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Summary</h2>
              <p className="text-slate-700 leading-relaxed text-sm text-justify">
                {resume.summary}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Experience</h2>
              <div className="space-y-6">
                {resume.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-slate-800">{exp.title}</h3>
                      <span className="text-sm text-slate-500">{exp.date}</span>
                    </div>
                    <div className="text-sm font-medium text-brand-deep mb-2">{exp.company}</div>
                    <p className="text-sm text-slate-700 leading-relaxed text-justify">{exp.details}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Education</h2>
              <div className="space-y-6">
                {resume.education.map((edu) => (
                  <div key={edu.id}>
                     <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-slate-800">{edu.title}</h3>
                      <span className="text-sm text-slate-500">{edu.date}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-600 mb-1">{edu.company}</div>
                    <p className="text-sm text-slate-600 text-justify">{edu.details}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications Preview */}
            {(resume.certifications && resume.certifications.length > 0) && (
              <section>
                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Certifications</h2>
                <div className="space-y-6">
                  {resume.certifications.map((cert) => (
                    <div key={cert.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-800">{cert.title}</h3>
                        <span className="text-sm text-slate-500">{cert.date}</span>
                      </div>
                      <div className="text-sm font-medium text-slate-600 mb-1">{cert.company}</div>
                      <p className="text-sm text-slate-600 text-justify">{cert.details}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
               <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Skills</h2>
               <p className="text-sm text-slate-700 leading-relaxed">
                 {resume.skills}
               </p>
            </section>

            {/* Projects Section in Preview */}
            {resume.projects.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Projects</h2>
                <div className="space-y-6">
                  {resume.projects.map((proj) => (
                    <div key={proj.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-800">{proj.name}</h3>
                        <span className="text-sm text-slate-500">{proj.technologies}</span>
                      </div>
                      {proj.link && (
                        <div className="text-xs text-brand-primary mb-1">{proj.link}</div>
                      )}
                      <p className="text-sm text-slate-700 leading-relaxed text-justify">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;