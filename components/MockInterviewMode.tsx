import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, User, Loader2, Mic, MicOff, PlayCircle, Trophy, MessageSquare, ArrowLeft, Video, VideoOff, CheckCircle2, Sparkles } from 'lucide-react';
import { createInterviewSession, analyzeMockInterview } from '../services/geminiService';
import { Message, Job, InterviewFeedback } from '../types';
import { useToast } from './Toast';

interface MockInterviewModeProps {
    job: Job;
    onClose: () => void;
    onSaveFeedback: (feedback: InterviewFeedback) => void;
}

const MockInterviewMode: React.FC<MockInterviewModeProps> = ({ job, onClose, onSaveFeedback }) => {
    const { showToast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // Initialize Interview Session
    useEffect(() => {
        const startInterview = async () => {
            setIsLoading(true);
            try {
                const session = createChatSessionForInterview();
                const result = await session.sendMessage({ message: "Introduce yourself as the interviewer and ask the first question." });
                const text = result.text || "";
                setMessages([{ id: '1', role: 'model', text }]);
            } catch (error) {
                console.error("Failed to start interview:", error);
                showToast("Failed to start interview. Check your API key.", "error");
            } finally {
                setIsLoading(false);
            }
        };

        startInterview();
    }, [job]);

    const createChatSessionForInterview = (history: any[] = []) => {
        return createInterviewSession(job, history);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Voice Input Setup
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const sr = new SpeechRecognition();
                sr.continuous = false;
                sr.interimResults = false;
                sr.lang = 'en-US';
                recognitionRef.current = sr;
            }
        }
    }, []);

    const handleToggleVoice = useCallback(() => {
        const sr = recognitionRef.current;
        if (!sr) return;

        if (isRecording) {
            sr.stop();
            setIsRecording(false);
            return;
        }

        setIsRecording(true);
        sr.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setIsRecording(false);
            setInputText(transcript);
            // Auto-send after short delay
            setTimeout(() => {
                handleSendMessage(transcript);
            }, 500);
        };
        sr.onerror = () => setIsRecording(false);
        sr.onend = () => setIsRecording(false);
        sr.start();
    }, [isRecording]);

    const handleSendMessage = async (textOverride?: string) => {
        const text = textOverride || inputText;
        if (!text.trim() || isLoading) return;

        if (!textOverride) setInputText('');
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim() };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const session = createChatSessionForInterview(history);
            const result = await session.sendMessage({ message: text.trim() });
            const aiText = result.text || "";

            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: aiText }]);
        } catch (error) {
            console.error("Chat error:", error);
            showToast("Connection error. Try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinishAndAnalyze = async () => {
        if (messages.length < 2) return;
        setIsFinishing(true);

        try {
            // Analyze the last exchange for feedback
            const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
            const lastAiMsg = [...messages].reverse().find(m => m.role === 'model' && messages.indexOf(m) < messages.lastIndexOf(lastUserMsg!));

            if (lastUserMsg && lastAiMsg) {
                const feedback = await analyzeMockInterview(lastAiMsg.text, lastUserMsg.text, videoFile || undefined);
                onSaveFeedback({
                    id: Date.now().toString(),
                    question: lastAiMsg.text,
                    userAudioTranscript: lastUserMsg.text,
                    feedback: feedback.feedback,
                    improvedAnswer: feedback.improvedAnswer,
                    nonVerbalCues: feedback.nonVerbalCues,
                    timestamp: Date.now()
                });
                showToast(videoFile ? "Multimodal feedback generated!" : "Interview feedback saved!", "success");
            }
            onClose();
        } catch (error) {
            showToast("Failed to generate feedback.", "error");
        } finally {
            setIsFinishing(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-brand-mint dark:border-slate-800 shadow-xl">
            {/* Header */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-brand-mint dark:border-slate-800 flex items-center justify-between">
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                    <ArrowLeft size={20} />
                </button>
                <div className="text-center">
                    <h2 className="text-sm font-bold text-brand-deep dark:text-white uppercase tracking-wider">Mock Interview</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{job.company} • {job.role}</p>
                </div>
                <button
                    onClick={handleFinishAndAnalyze}
                    disabled={messages.length < 2 || isFinishing}
                    className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-lg hover:bg-brand-deep transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {isFinishing ? <Loader2 size={16} className="animate-spin" /> : (videoFile ? <Sparkles size={16} /> : null)}
                    {isFinishing ? 'Analyzing...' : (videoFile ? 'Deep Analysis' : 'Finish Session')}
                </button>
            </div>

            {/* Video Upload Indicator */}
            {videoFile ? (
                <div className="bg-emerald-500/10 dark:bg-emerald-500/5 px-4 py-2 flex items-center justify-between border-b border-emerald-500/20">
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                        <CheckCircle2 size={12} /> Video Recording Added: {videoFile.name}
                    </div>
                    <button onClick={() => setVideoFile(null)} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Remove</button>
                </div>
            ) : (
                <div className="bg-brand-rose/10 dark:bg-slate-900/50 px-4 py-2 flex items-center justify-between border-b border-brand-mint dark:border-slate-800">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Video size={12} /> Add Video for Non-Verbal Analysis
                    </div>
                    <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest cursor-pointer hover:underline">
                        Upload Recording
                        <input type="file" className="hidden" accept="video/*" onChange={(e) => e.target.files?.[0] && setVideoFile(e.target.files[0])} />
                    </label>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-brand-rose/30 dark:bg-slate-950/50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                            ? 'bg-brand-primary text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-brand-mint dark:border-slate-800 rounded-tl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl rounded-tl-none border border-brand-mint dark:border-slate-800 shadow-sm">
                            <Loader2 size={16} className="animate-spin text-brand-primary" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-brand-mint dark:border-slate-800">
                <div className="flex items-center gap-2 max-w-4xl mx-auto relative">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isLoading || isRecording}
                        placeholder="Type your answer or use voice..."
                        className="flex-1 pl-4 pr-24 py-3 bg-brand-rose dark:bg-slate-800 border border-brand-mint dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm dark:text-white"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                        <button
                            onClick={handleToggleVoice}
                            disabled={isLoading}
                            className={`p-2 rounded-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!inputText.trim() || isLoading}
                            className="p-2 bg-brand-primary text-white rounded-lg hover:bg-brand-deep disabled:opacity-50 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MockInterviewMode;
