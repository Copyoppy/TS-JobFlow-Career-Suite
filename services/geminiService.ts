import { GoogleGenAI } from "@google/genai";
import { Job } from "../types";

// Standard initialization for @google/genai
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
const MODEL_NAME = "gemini-1.5-flash";

/**
 * Helper to extract and parse JSON from AI responses (handles markdown wrapping)
 */
const parseAIJSON = (text: string | undefined): any => {
  if (!text) return null;
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse AI JSON:", e);
    return null;
  }
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
  userSpokenText: string
): Promise<any> => {
  try {
    const prompt = `Interview feedback for Q: ${question}, A: ${userSpokenText}. JSON: {feedback, improvedAnswer}`;
    const res = await ai.models.generateContent({ model: MODEL_NAME, contents: [{ role: 'user', parts: [{ text: prompt }] }] });
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
