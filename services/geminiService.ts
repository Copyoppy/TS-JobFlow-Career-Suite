
import { GoogleGenAI, Type, Content } from "@google/genai";
import { Job } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Existing Services ---

export const generateCoverLetter = async (
  company: string,
  role: string,
  description: string,
  userSkills: string = "general professional skills"
): Promise<string> => {
  try {
    const prompt = `
      Write a professional and engaging cover letter for the position of ${role} at ${company}.
      
      Job Description:
      ${description}
      
      My Skills/Background:
      ${userSkills}
      
      Keep it concise (under 300 words), professional, and enthusiastic. 
      Do not include placeholders like [Your Name] or [Address], start directly with "Dear Hiring Manager,".
    `;

    // Fix: Using gemini-3-flash-preview for text generation tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not generate cover letter. Please try again.";
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return "Error generating cover letter. Please check your API key.";
  }
};

export const generateInterviewGuide = async (
  company: string,
  role: string,
  description: string
): Promise<string> => {
  try {
    const prompt = `
      Create a comprehensive interview preparation guide for the role of ${role} at ${company}.
      
      Leverage your existing knowledge about ${company} (culture, products, industry standing) combined with the Job Description below.
      
      Job Description provided:
      ${description}
      
      The guide must include:
      1. **Company & Role Insight**: Brief analysis of ${company}'s current focus and what they likely value in this ${role} role.
      2. **Key Technical/Soft Skills**: What specific skills from the description should be emphasized.
      3. **5 Potential Interview Questions**: Specific to ${company} and this role, with brief tips on how to answer.
      4. **3 Questions to Ask the Interviewer**: Strategic questions showing deep interest in ${company}.
      
      Format the output clearly with headings and bullet points. Keep it practical and ready to use.
    `;

    // Fix: Using gemini-3-flash-preview for text generation tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not generate interview guide. Please try again.";
  } catch (error) {
    console.error("Error generating interview guide:", error);
    return "Error generating interview guide. Please check your API key.";
  }
};

export const generateResumeSummary = async (resumeData: any): Promise<string> => {
  try {
    const prompt = `
      Write a professional and impactful resume summary (max 3-4 sentences) for a candidate with the following background:
      
      Skills: ${resumeData.skills}
      
      Experience: ${resumeData.experience?.map((e: any) => `${e.title} at ${e.company} (${e.details})`).join('; ') || ''}
      
      Education: ${resumeData.education?.map((e: any) => `${e.title} from ${e.company}`).join('; ') || ''}
      
      Focus on key achievements and technical strengths. Write in the first person but without using "I" directly (e.g., "Senior Engineer with...").
    `;

    // Fix: Using gemini-3-flash-preview for summarization tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generating summary.";
  }
};

export const generateAvatar = async (imageBase64: string, stylePrompt: string): Promise<string | null> => {
  try {
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const mimeType = imageBase64.includes(';') ? imageBase64.split(';')[0].split(':')[1] : 'image/png';

    const prompt = `Transform this image into a professional LinkedIn profile picture headshot. 
    Maintain the person's identity but improve lighting, background, and attire to be professional.
    Style details: ${stylePrompt || 'Professional business attire, neutral background, soft studio lighting'}.
    Output a high quality photorealistic image.`;

    // Correct: Use gemini-2.5-flash-image for image generation/editing tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating avatar:", error);
    throw error;
  }
};

export const parseAndImproveResume = async (fileBase64: string, mimeType: string): Promise<any> => {
  try {
    const base64Data = fileBase64.split(',')[1] || fileBase64;

    // Fix: Using gemini-3-flash-preview for text extraction and analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analyze this resume document. Extract all the information and rewriting the content to be more professional, impactful, and concise using strong action verbs.
            
            Return the result strictly as a JSON object matching this schema:
            {
              fullName: string,
              email: string,
              phone: string,
              summary: string,
              skills: string,
              experience: [{ id: string, title: string, company: string, date: string, details: string }],
              education: [{ id: string, title: string, company: string, date: string, details: string }],
              certifications: [{ id: string, title: string, company: string, date: string, details: string }],
              projects: [{ id: string, name: string, technologies: string, link: string, description: string }]
            }
            
            Ensure dates are properly formatted. If a field is missing, use an empty string.
            For Certifications: title is the certification name, company is the issuing organization.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
};

export const createChatSession = (history: Content[] = [], jobsContext?: string) => {
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
    model: 'gemini-3-flash-preview',
    history: history,
    config: {
      systemInstruction: baseInstruction + jobEditInstruction
    }
  });
};

// --- NEW FEATURES ---

// 1. ATS Match Score Analyzer
export const analyzeResumeMatch = async (resumeText: string, jobDescription: string): Promise<any> => {
  try {
    const prompt = `
      Act as an Applicant Tracking System (ATS). Compare the Resume below against the Job Description.
      
      Job Description:
      ${jobDescription.substring(0, 5000)}
      
      Resume:
      ${resumeText.substring(0, 5000)}
      
      Provide:
      1. A Match Score (0-100).
      2. A list of 3-5 critical Missing Keywords that appear in the job description but not in the resume.
      3. A 1-sentence explanation of the score.

      Return JSON: { "matchScore": number, "missingKeywords": string[], "explanation": string }
    `;

    // Fix: Using gemini-3-flash-preview for ATS analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error analyzing match:", error);
    throw error;
  }
};

// Feature 1 Implementation: Skill Gap Roadmap
export const generateLearningRoadmap = async (
  missingSkills: string[],
  role: string
): Promise<any> => {
  try {
    const prompt = `
      You are a senior technical mentor. The user is applying for a ${role} position but is missing the following skills: ${missingSkills.join(', ')}.
      
      Create a 3-Day "Crash Course" Learning Roadmap to help them understand the basics of these skills quickly.
      
      For each day (Day 1, Day 2, Day 3):
      1. Assign a "Theme" (e.g. "Fundamentals", "Practical Application").
      2. List 3 specific learning tasks.
      3. Suggest 2 search queries that would find the best tutorials (e.g. "React hooks crash course youtube").
      
      Return JSON: 
      [
        {
          "day": "Day 1",
          "theme": "string",
          "tasks": ["string", "string", "string"],
          "resources": [ {"title": "string", "searchQuery": "string"} ]
        }
      ]
    `;

    // Fix: Using gemini-3-flash-preview for roadmap planning
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw error;
  }
};

// Feature 5 Implementation: Offer Comparison
export const compareJobOffers = async (job1: Job, job2: Job): Promise<any> => {
  try {
    const prompt = `
      Compare these two job offers and provide a structured comparison matrix.
      
      Job A:
      Role: ${job1.role}
      Company: ${job1.company}
      Salary: ${job1.salary}
      Location: ${job1.location}
      Description: ${job1.description.substring(0, 500)}
      
      Job B:
      Role: ${job2.role}
      Company: ${job2.company}
      Salary: ${job2.salary}
      Location: ${job2.location}
      Description: ${job2.description.substring(0, 500)}
      
      Compare them on these criteria: "Salary & Compensation", "Tech Stack & Growth", "Work Life Balance", "Commute/Location".
      For each criteria, pick a winner (job1, job2, or tie) and explain why briefly.
      
      Finally, provide a "verdict": a 2-sentence summary helping the user decide.
      
      Return JSON:
      {
        "points": [
          { "criteria": "string", "job1Value": "string", "job2Value": "string", "winner": "job1" | "job2" | "tie" }
        ],
        "verdict": "string"
      }
    `;

    // Fix: Using gemini-3-flash-preview for offer comparison logic
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error comparing offers:", error);
    throw error;
  }
};

// 2. Red Flag Detector
export const detectJobRedFlags = async (jobDescription: string): Promise<any> => {
  try {
    const prompt = `
      Analyze this job description for "Red Flags" (toxic culture, bad work-life balance) and "Green Flags" (benefits, growth).
      
      Job Description:
      ${jobDescription.substring(0, 5000)}
      
      Return JSON: { "pros": string[], "cons": string[], "verdict": string }
      Limit pros/cons to 3 bullet points each. Verdict should be "Safe", "Caution", or "Avoid" with a tiny reason.
    `;

    // Fix: Using gemini-3-flash-preview for content analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error detecting flags:", error);
    throw error;
  }
};

// 3. LinkedIn & Cold Email Writer
export const generateNetworkingDrafts = async (
  company: string,
  role: string,
  hiringManagerName: string,
  userResumeSummary: string
): Promise<any> => {
  try {
    const prompt = `
      Write 3 networking messages for a candidate applying for ${role} at ${company}.
      Hiring Manager Name: ${hiringManagerName || "the hiring team"}.
      Candidate Summary: ${userResumeSummary}
      
      1. LinkedIn Connection Request (max 300 chars).
      2. Cold Email (Professional, persuasive, mentioning 1 key strength).
      3. Follow-up Email (Polite nudge after 1 week).
      
      Return JSON: { "linkedin": string, "email": string, "followup": string }
    `;

    // Fix: Using gemini-3-flash-preview for copywriting
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating drafts:", error);
    throw error;
  }
};

// 4. Salary Negotiation Coach
export const generateNegotiationAdvice = async (
  role: string,
  company: string,
  offerAmount: string,
  jobDescription: string
): Promise<any> => {
  try {
    const prompt = `
      The user received an offer of ${offerAmount} for ${role} at ${company}.
      Job Description Context: ${jobDescription.substring(0, 1000)}...
      
      Generate a salary negotiation script to ask for 10-15% more.
      Also provide a 1-sentence strategy tip.
      
      Return JSON: { "script": string, "strategy": string }
    `;

    // Fix: Using gemini-3-flash-preview for negotiation scripts
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating negotiation:", error);
    throw error;
  }
};

// 5. Audio Mock Interview Analyzer
export const analyzeMockInterview = async (
  question: string,
  userSpokenText: string
): Promise<any> => {
  try {
    const prompt = `
      You are an expert interview coach. 
      Question asked: "${question}"
      Candidate Answer (Transcribed): "${userSpokenText}"
      
      Provide:
      1. Feedback (What was good, what was bad, tone check).
      2. An Improved Version of the answer.
      
      Return JSON: { "feedback": string, "improvedAnswer": string }
    `;

    // Fix: Using gemini-3-flash-preview for reasoning-based feedback
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error analyzing interview:", error);
    throw error;
  }
};

// 6. Tailor Resume
export const tailorResumeToJob = async (
  resumeText: string,
  jobDescription: string
): Promise<any> => {
  try {
    const prompt = `
      You are an expert Resume Writer. Your goal is to tailor the candidate's Resume to better match the Job Description.
      
      Job Description:
      ${jobDescription.substring(0, 5000)}
      
      Current Resume:
      ${resumeText.substring(0, 5000)}
      
      TASKS:
      1. Rewrite the "Summary" to highlight experience relevant to this specific job.
      2. Update the "Skills" list to include relevant keywords from the Job Description that the candidate likely possesses based on their experience, but might have missed. Keep the format compatible.

      Return JSON: { "summary": string, "skills": string }
    `;

    // Fix: Using gemini-3-flash-preview for content tailoring
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error tailoring resume:", error);
    throw error;
  }
};
