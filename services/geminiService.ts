import { GoogleGenAI } from "@google/genai";
import { Job, Resume } from "../types";

// Standard initialization for @google/genai
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
const MODEL_NAME = "gemini-2.0-flash-exp";

/**
 * Helper to extract and parse JSON from AI responses (handles markdown wrapping)
 */
const parseAIJSON = (text: string | undefined): any => {
  if (!text) return null;
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    // Sometimes the AI adds text before or after the JSON, let's try to extract just the { } part
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
  } catch (e) {
    console.error("Failed to parse AI JSON:", e);
    return null;
  }
};

/**
 * Converts a File object to the format required for Google Generative AI Modal
 */
export const fileToInlineData = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- Services ---

export const generateCoverLetter = async (
  company: string,
  role: string,
  description: string,
  userSkills: string = "general professional skills"
): Promise<string> => {
  try {
    const prompt = `Write a professional cover letter for ${role} at ${company}. \nJD: ${description}\nSkills: ${userSkills}\nConcise, no placeholders.`;
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return response.text || "Could not generate cover letter.";
  } catch (error) {
    console.error("Cover letter error:", error);
    return "Error generating cover letter.";
  }
};

export const generateInterviewGuide = async (
  company: string,
  role: string,
  description: string
): Promise<string> => {
  try {
    const prompt = `Create an interview guide for ${role} at ${company}. JD: ${description}. Include insight, questions, and tips.`;
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return response.text || "Could not generate guide.";
  } catch (error) {
    return "Error generating guide.";
  }
};

export const generateResumeSummary = async (resumeData: any): Promise<string> => {
  try {
    const prompt = `Write a professional resume summary for: ${JSON.stringify(resumeData)}. 3-4 sentences.`;
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    return "Error generating summary.";
  }
};

export const parseAndImproveResume = async (fileBase64: string, mimeType: string): Promise<any> => {
  try {
    const base64Data = fileBase64.split(',')[1] || fileBase64;
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: "Extract and professionalize this resume into JSON schema: {fullName, email, phone, summary, skills, experience:[], education:[], certifications:[], projects:[]}" }
          ]
        }
      ],
    });
    return parseAIJSON(response.text);
  } catch (error) {
    console.error("Resume parse error:", error);
    throw error;
  }
};

// Placeholder for a feature that would normally use a dedicated image model
export const generateAvatar = async (imageBase64: string, stylePrompt: string): Promise<string | null> => {
  return imageBase64; // Fallback since 1.5-flash is text/analysis primarily
};

export const createChatSession = (history: any[] = [], jobsContext?: string) => {
  const baseInstruction = "You are Ntim, a friendly, encouraging, and highly knowledgeable job search assistant. You help users with career advice, resume tips, interview preparation, and staying motivated. Keep answers concise and helpful.";

  const jobEditInstruction = jobsContext ? `

CURRENT JOBS DATA:
${jobsContext}

JOB EDITING CAPABILITY:
When the user asks you to edit, update, or change an existing job/application, you MUST include an action tag at the END of your message in this exact format:
[ACTION:EDIT_JOB {"id":"<job_id>","updates":{<field>:<value>}}]

Editable fields: status (must be one of: Applied, Interview, Offer, Rejected, Accepted), salary, location, role, company, notes, followUpDate (YYYY-MM-DD), interviewDate (ISO datetime).

RULES:
- Match the job by company name, role, or both — use the id from the jobs data
- Always confirm what you changed in your message text
- You can include multiple [ACTION:EDIT_JOB ...] tags if the user asks to edit multiple jobs
- If the user's request is ambiguous about which job, ask for clarification instead of guessing
- NEVER fabricate job IDs — only use IDs from the CURRENT JOBS DATA above
- For general questions or advice that don't involve editing jobs, do NOT include any action tags` : '';

  return ai.chats.create({
    model: MODEL_NAME,
    history: history,
    config: {
      systemInstruction: baseInstruction + jobEditInstruction
    }
  });
};

export const createInterviewSession = (job: Job, history: any[] = []) => {
  const systemInstruction = `You are now an interviewer for ${job.company}, interviewing a candidate for the ${job.role} position. 
  
  JOB DESCRIPTION:
  ${job.description}
  
  YOUR GOAL:
  - Conduct a professional, rigorous, but fair interview.
  - Ask one question at a time.
  - Listen to the candidate's response (which will be a transcript of their voice) and ask a relevant follow-up or move to a new topic.
  - Be realistic for the role level.
  - If the user asks for help, briefly step out of character to coach them, then step back in.
  
  FORMAT:
  - Start by introducing yourself and welcoming the candidate.
  - Ask the first question immediately in your first response.`;

  return ai.chats.create({
    model: MODEL_NAME,
    history: history,
    config: { systemInstruction }
  });
};

export const extractJobDetails = async (text: string, file?: File): Promise<Partial<Job>> => {
  const prompt = `Extract the following job details from this input (which could be a job posting, confirmation email, resume snippet, or an image/PDF of a job post).
  
  Return ONLY a valid JSON object with these fields:
  {
    "company": "string",
    "role": "string",
    "location": "string",
    "salary": "string",
    "description": "string",
    "email": "string"
  }
  If a field is not found, use an empty string. Ensure the JSON is compact and has no extra text.`;

  try {
    const parts: any[] = [{ text: prompt }];
    if (file) {
      const fileData = await fileToInlineData(file);
      parts.push(fileData);
    }
    if (text) {
      parts.push({ text: `Input Text: "${text}"` });
    }

    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts }]
    });

    return parseAIJSON(result.text) || {};
  } catch (error) {
    console.error("Extraction failed:", error);
    return {};
  }
};

export const generateFollowUp = async (job: Job, resume?: Resume): Promise<string> => {
  const prompt = `Generate a professional, polite, and effective follow-up email/message for this job:
  Job: ${job.role} at ${job.company}
  Status: ${job.status}
  Date Applied/Interative: ${job.dateApplied || job.interviewDate}
  
  CONTEXT:
  - If it's after an application, keep it brief and show interest.
  - If it's after an interview, express gratitude and mention something specific if possible.
  - The tone should be enthusiastic but professional.
  
  Return ONLY the message text without subject lines or extra text.`;

  try {
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return result.text || "Failed to generate message.";
  } catch (error) {
    console.error("Follow-up generation failed:", error);
    return "Failed to generate message.";
  }
};

export const analyzeResumeMatch = async (resumeText: string, jobDescription: string): Promise<any> => {
  try {
    const prompt = `Match Score (0-100) for Resume vs JD. JSON: {matchScore, missingKeywords:[], explanation}. \n\nJD: ${jobDescription}\n\nResume: ${resumeText}`;
    const res = await ai.models.generateContent({ model: MODEL_NAME, contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return parseAIJSON(res.text);
  } catch (error) {
    console.error("Error analyzing match:", error);
    throw error;
  }
};

export const generateLearningRoadmap = async (missingSkills: string[], role: string): Promise<any> => {
  try {
    const prompt = `3-day roadmap for ${role} missing ${missingSkills.join(',')}. JSON: [{day, theme, tasks:[], resources:[]}]`;
    const res = await ai.models.generateContent({ model: MODEL_NAME, contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return parseAIJSON(res.text);
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw error;
  }
};

export const compareJobOffers = async (job1: Job, job2: Job): Promise<any> => {
  try {
    const prompt = `Compare these offers JSON: {points:[], verdict}. \nA: ${JSON.stringify(job1)}\nB: ${JSON.stringify(job2)}`;
    const res = await ai.models.generateContent({ model: MODEL_NAME, contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return parseAIJSON(res.text);
  } catch (error) {
    console.error("Error comparing offers:", error);
    throw error;
  }
};

export const detectJobRedFlags = async (jobDescription: string): Promise<any> => {
  try {
    const prompt = `Red flags in JD: ${jobDescription}. JSON: {pros, cons, verdict}`;
    const res = await ai.models.generateContent({ model: MODEL_NAME, contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return parseAIJSON(res.text);
  } catch (error) {
    console.error("Error detecting flags:", error);
    throw error;
  }
};

export const generateNetworkingDrafts = async (
  company: string,
  role: string,
  hiringManagerName: string,
  userResumeSummary: string
): Promise<any> => {
  try {
    const prompt = `Networking drafts for ${role} at ${company}. Hiring Manager: ${hiringManagerName}. Candidate Summary: ${userResumeSummary}. JSON: {linkedin, email, followup}`;
    const res = await ai.models.generateContent({ model: MODEL_NAME, contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return parseAIJSON(res.text);
  } catch (error) {
    console.error("Error generating drafts:", error);
    throw error;
  }
};

export const generateNegotiationAdvice = async (
  role: string,
  company: string,
  offerAmount: string,
  jobDescription: string
): Promise<any> => {
  try {
    const prompt = `Negotiation script for ${offerAmount} at ${company} (${role}). JD: ${jobDescription.substring(0, 1000)}. JSON: {script, strategy}`;
    const res = await ai.models.generateContent({ model: MODEL_NAME, contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return parseAIJSON(res.text);
  } catch (error) {
    console.error("Error generating negotiation:", error);
    throw error;
  }
};

export const analyzeMockInterview = async (
  question: string,
  userSpokenText: string,
  videoFile?: File
): Promise<any> => {
  try {
    const prompt = `Provide deep interview feedback for the following exchange:
    Interviewer Question: "${question}"
    Candidate Answer: "${userSpokenText}"

    ${videoFile ? "I have also provided a video of the candidate's performance. Please analyze their non-verbal communication (eye contact, posture, confidence, facial expressions) in addition to their verbal response." : ""}

    Return JSON: {
      "feedback": "string (comprehensive feedback including verbal and non-verbal if applicable)",
      "improvedAnswer": "string (a better version of the candidate's answer)",
      "nonVerbalCues": "string (optional: specific observations about video performance)"
    }`;

    const parts: any[] = [{ text: prompt }];
    if (videoFile) {
      const fileData = await fileToInlineData(videoFile);
      parts.push(fileData);
    }

    const res = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts }]
    });
    return parseAIJSON(res.text);
  } catch (error) {
    console.error("Error analyzing interview:", error);
    throw error;
  }
};

export const tailorResumeToJob = async (
  resumeText: string,
  jobDescription: string
): Promise<any> => {
  try {
    const prompt = `Tailor Resume to JD. JSON: {summary, skills}. \n\nJD: ${jobDescription}\n\nResume: ${resumeText}`;
    const res = await ai.models.generateContent({ model: MODEL_NAME, contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return parseAIJSON(res.text);
  } catch (error) {
    console.error("Error tailoring resume:", error);
    throw error;
  }
};
