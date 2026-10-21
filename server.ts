import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import * as pdfParseModule from 'pdf-parse';

dotenv.config();

const app = express();
const PORT = 3000;

// Support large payload for base64 PDFs up to 25MB
app.use(express.json({ limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Resilient wrapper to handle transient 503/429 and fallback across models
async function generateContentWithRetry(params: any): Promise<any> {
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    params.model || 'gemini-3.8-flash',
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));
  let lastError: any = null;

  for (const modelName of uniqueModels) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model: modelName,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err?.message || err || '');
      const isQuotaOrOverload =
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('Quota exceeded') ||
        errMsg.includes('quota') ||
        errMsg.includes('429') ||
        errMsg.includes('503') ||
        errMsg.includes('high demand');

      if (isQuotaOrOverload) {
        // Fallback to next model
        console.warn(`Model ${modelName} encountered rate limit/quota, trying fallback...`);
        continue;
      }
    }
  }

  throw lastError;
}

interface PdfExtractionResult {
  text: string;
  isScanned: boolean;
  method: 'pdf-parse' | 'gemini-ocr' | 'none' | 'error';
}

// Helper to extract text from PDF buffer, with Gemini OCR fallback for scanned documents
async function extractTextFromPdf(base64Data: string): Promise<PdfExtractionResult> {
  const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');

  // 1. Attempt standard selectable text extraction with pdf-parse
  try {
    const PDFParseClass: any = (pdfParseModule as any).PDFParse || (pdfParseModule as any).default?.PDFParse || (pdfParseModule as any).default || pdfParseModule;
    if (typeof PDFParseClass === 'function') {
      const parser = new PDFParseClass({ data: buffer });
      const data = await parser.getText();
      await parser.destroy?.();
      if (data && data.text && data.text.trim().length >= 30) {
        return {
          text: data.text.trim(),
          isScanned: false,
          method: 'pdf-parse',
        };
      }
    }
  } catch (err) {
    console.warn('pdf-parse primary extraction fallback triggered:', err);
  }

  // 2. Fallback to Gemini Multimodal OCR (handles scanned documents, images, flattened vector PDFs)
  try {
    const res = await generateContentWithRetry({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: cleanBase64,
          },
        },
        {
          text: `You are an expert OCR and resume document transcription engine.
Extract and transcribe the full text content from this PDF resume.
If this is a scanned document, image-based PDF, or photo: perform optical character recognition (OCR) to carefully transcribe all readable text, including candidate name, contact details, summary, professional experience, job titles, dates, education, skills, and projects.
If the document is completely empty, blank, or contains no readable text, respond with "NO_READABLE_TEXT_FOUND".
Output ONLY the clean transcribed resume text without any conversational introduction or closing comments.`,
        },
      ],
    });

    const ocrText = (res.text || '').trim();
    if (ocrText && ocrText !== 'NO_READABLE_TEXT_FOUND' && ocrText.length >= 30) {
      return {
        text: ocrText,
        isScanned: true,
        method: 'gemini-ocr',
      };
    }

    return {
      text: '',
      isScanned: true,
      method: 'none',
    };
  } catch (geminiErr) {
    console.error('Gemini PDF extraction error:', geminiErr);
    return {
      text: '',
      isScanned: true,
      method: 'error',
    };
  }
}

// 1. Endpoint: Extract text from uploaded PDF
app.post('/api/extract-resume', async (req: Request, res: Response) => {
  try {
    const { base64, filename } = req.body;
    if (!base64) {
      return res.status(400).json({ error: 'No PDF file data provided.' });
    }

    const extraction = await extractTextFromPdf(base64);
    const hasSufficientText = Boolean(extraction.text && extraction.text.trim().length >= 30);

    return res.json({
      filename: filename || 'resume.pdf',
      extractedText: extraction.text,
      charCount: extraction.text.length,
      isScanned: extraction.isScanned,
      method: extraction.method,
      isSufficient: hasSufficientText,
      warning: !hasSufficientText
        ? extraction.isScanned
          ? 'This PDF appears to be a scanned image or photo without selectable text. Automated OCR could not extract sufficient content.'
          : 'Could not find sufficient resume content in this PDF document.'
        : undefined,
    });
  } catch (error: any) {
    console.error('Extraction error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to extract text from resume.',
      isScanned: true,
      extractedText: '',
    });
  }
});

// 2. Endpoint: Resume Analyzer & Job Matcher (Supports Quick Analysis & Job Match)
app.post('/api/analyze-resume', async (req: Request, res: Response) => {
  try {
    const { resumeText, resumeBase64, jobDescription, mode = 'quick' } = req.body;

    let resolvedResumeText = resumeText || '';
    let isScannedPdf = false;

    if (!resolvedResumeText && resumeBase64) {
      const extraction = await extractTextFromPdf(resumeBase64);
      resolvedResumeText = extraction.text;
      isScannedPdf = extraction.isScanned;
    }

    if (!resolvedResumeText || resolvedResumeText.trim().length < 30) {
      return res.status(400).json({
        error: isScannedPdf
          ? 'Could not extract sufficient text from this scanned image-based PDF. Please ensure your PDF contains readable text or try one of the sample resumes below.'
          : 'Could not find sufficient resume content to evaluate. Please ensure the PDF has readable text or pick a sample resume.',
        isScanned: isScannedPdf,
        insufficientContent: true,
      });
    }

    const isJobMatchMode = mode === 'job_match' || (jobDescription && jobDescription.trim().length >= 15);

    if (isJobMatchMode) {
      if (!jobDescription || jobDescription.trim().length < 15) {
        return res.status(400).json({
          error: 'Please paste a target job description (at least 15 characters) to use Job Match mode, or switch to Quick Resume Analysis.',
        });
      }

      const prompt = `You are the lead career intelligence engine of Cosmic Career AI.
Analyze the following Candidate Resume against the Target Job Description with high precision.

--- CANDIDATE RESUME ---
${resolvedResumeText.slice(0, 15000)}

--- TARGET JOB DESCRIPTION ---
${jobDescription.slice(0, 10000)}

Analyze with rigorous objectivity.
Respond strictly in valid JSON format matching this JSON schema:
{
  "mode": "job_match",
  "overallScore": number (integer 0 to 100),
  "scoreEstimationNote": string (explaining that this score reflects alignment of skills, experience, education, and keywords against the provided job description and is an AI analytical estimation, not a formal hiring guarantee),
  "scoringBreakdown": {
    "skillsAlignment": { "score": number (0-100), "details": string },
    "experienceAlignment": { "score": number (0-100), "details": string },
    "educationAlignment": { "score": number (0-100), "details": string },
    "keywordsAlignment": { "score": number (0-100), "details": string }
  },
  "summary": string (3-4 sentences executive summary of the fit),
  "matchingSkills": [string],
  "missingSkills": [string],
  "relevantKeywords": [string],
  "resumeStrengths": [string],
  "improvementSuggestions": [string],
  "actionableRecommendations": [
    {
      "priority": "High" | "Medium" | "Low",
      "action": string,
      "rationale": string
    }
  ]
}`;

      const response = await generateContentWithRetry({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      parsed.mode = 'job_match';
      return res.json(parsed);
    } else {
      // QUICK RESUME ANALYSIS MODE (No job description required)
      const quickPrompt = `You are the friendly, encouraging career advisor of Cosmic Career AI.
Analyze the following Candidate Resume in detail. DO NOT expect any job description. Provide a beginner-friendly, crystal-clear breakdown of the user's current skills, education, strengths, areas for improvement, and career potential.

--- CANDIDATE RESUME ---
${resolvedResumeText.slice(0, 15000)}

Respond strictly in valid JSON matching this schema:
{
  "mode": "quick",
  "candidateSummary": string (3-4 sentences written in an encouraging, warm, beginner-friendly tone summarizing the candidate's professional identity and core capabilities),
  "readinessScore": number (integer 55 to 95 representing resume completeness and polish),
  "readinessNote": string (beginner-friendly explanation of what this resume readiness score reflects),
  "education": {
    "degrees": [string] (degrees/diplomas/certifications found, e.g. "B.S. in Computer Science (2020-2024)"),
    "details": string (commentary on their educational background)
  },
  "experience": {
    "level": string (e.g. "Entry-Level (1-2 years)" or "Student / Recent Graduate" or "Mid-Level"),
    "summary": string (summary of work history, internships, or practical project experience)
  },
  "identifiedSkills": [string] (all technical, tools, and soft skills identified directly from the resume),
  "missingSkills": [string] (key industry skills commonly expected in their field that are missing or underrepresented),
  "resumeStrengths": [string] (clear bullet points highlighting what they did well, e.g. quantifiable impact, clean organization, strong projects),
  "resumeWeaknesses": [string] (gentle, clear points where the resume could be improved, e.g. missing metrics, vague bullet points, missing portfolio link),
  "improvementSuggestions": [string] (simple, actionable tips to make this resume shine for hiring managers),
  "recommendedEntryRoles": [string] (3-5 beginner or entry-level job titles that suit this candidate's actual background right now),
  "skillsToLearnNext": [
    {
      "skill": string,
      "reason": string (why this skill is worth learning in simple terms),
      "importance": "High" | "Medium" | "Recommended"
    }
  ]
}`;

      const response = await generateContentWithRetry({
        model: 'gemini-3.8-flash',
        contents: quickPrompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      parsed.mode = 'quick';
      return res.json(parsed);
    }
  } catch (error: any) {
    console.error('Analyze resume error:', error);
    return res.status(500).json({ error: error.message || 'Error occurred while analyzing resume.' });
  }
});

// 3. Endpoint: Career & Skills Finder
app.post('/api/career-finder', async (req: Request, res: Response) => {
  try {
    const {
      resumeText,
      resumeBase64,
      qualification,
      existingSkills,
      interests,
      preferredIndustry,
      goals,
    } = req.body;

    let resolvedResume = resumeText || '';
    if (!resolvedResume && resumeBase64) {
      try {
        const extraction = await extractTextFromPdf(resumeBase64);
        resolvedResume = extraction.text;
      } catch (e) {
        // Continue with manual inputs if available
      }
    }

    if (!resolvedResume && !qualification && !existingSkills && !interests) {
      return res.status(400).json({ error: 'Please provide either a resume or your current education/skills/interests.' });
    }

    const prompt = `You are the Cosmic Career AI Pathfinder.
Given the candidate's actual background and goals, generate a personalized career navigation report with multiple matching career paths and a structured learning roadmap.

Candidate Profile:
- Resume Content (if provided): ${resolvedResume ? resolvedResume.slice(0, 10000) : 'None provided'}
- Current Course / Qualification: ${qualification || 'Not specified'}
- Existing Skills: ${existingSkills || 'Derived from resume'}
- Career Interests: ${interests || 'Open to high-growth fields'}
- Preferred Industry: ${preferredIndustry || 'Technology / General'}
- Short & Long-Term Goals: ${goals || 'Career growth and skill advancement'}

Generate 3 to 4 distinct, realistic, high-potential career paths suited specifically to this person.
Also generate an actionable 30-day, 60-day, and 90-day learning roadmap.

Respond strictly in valid JSON matching this schema:
{
  "userProfileSummary": string (2-3 sentences overview of candidate's starting position and core potential),
  "possessedSkills": [string],
  "missingSkills": [string],
  "skillsToPrioritizeNext": [
    { "skill": string, "importance": string, "timeframe": "Next 2 Weeks" | "Month 1" | "Month 2" }
  ],
  "recommendedCareerPaths": [
    {
      "id": string (unique slug like "ai-solutions-architect"),
      "title": string,
      "fitScore": number (integer 60-98),
      "whyItSuits": string,
      "existingStrengths": [string],
      "skillsToLearn": [string],
      "entryLevelRoles": [string],
      "practicalProjects": [
        {
          "title": string,
          "description": string,
          "techStack": [string]
        }
      ],
      "recommendedNextAction": string,
      "learningResources": [
        {
          "title": string,
          "provider": string,
          "type": string
        }
      ]
    }
  ],
  "learningRoadmap": {
    "thirtyDays": {
      "focus": string,
      "milestones": [string],
      "deliverables": [string]
    },
    "sixtyDays": {
      "focus": string,
      "milestones": [string],
      "deliverables": [string]
    },
    "ninetyDays": {
      "focus": string,
      "milestones": [string],
      "deliverables": [string]
    }
  }
}`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Career finder error:', error);
    return res.status(500).json({ error: error.message || 'Error finding career recommendations.' });
  }
});

// 4. Endpoint: AI Conversational Guide & Career Mentor Chatbot
app.post('/api/career-chat', async (req: Request, res: Response) => {
  try {
    const { messages, resumeContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Valid messages array is required.' });
    }

    const systemInstruction = `You are Cosmic AI — an intelligent, natural, and genuinely helpful conversational AI assistant with deep expertise in career planning, skills, technology, and learning.

How you think and converse (natural like ChatGPT):
1. Talk naturally, warmly, and casually — like a brilliant, supportive, and articulate friend. Speak like a real human conversational partner, never like a rigid corporate bot or a pre-programmed script.
2. Listen and understand FIRST before answering. Directly address whatever the user asks or says, whether it is:
   - A general question ("How does GPS work?", "Why is the sky blue?")
   - Brainstorming or discussing ideas ("I have an idea for an app", "Help me write a cold email")
   - Venting or sharing a problem ("I feel overwhelmed with college", "I failed my interview")
   - Deep career, resume, and skills guidance ("What should I learn next?", "How do I break into AI?")
   - Explaining complex concepts simply with intuitive real-world analogies.
3. DO NOT force every conversation toward career advice! If the user asks about an everyday concept, coding bug, general knowledge, or casual topic, answer their question thoroughly and warmly without artificially steering them toward resumes or job hunting.
4. DO NOT repeatedly re-introduce yourself or repeatedly ask for personal details (name, degree, year) after every turn. Only ask 1 follow-up question when genuinely needed for clarity or when exploring a topic together.
5. REMEMBER conversation history: Keep track of facts the user shared earlier in this conversation (their name, current subjects, goals, preferred tools) and naturally reference them in subsequent replies.
6. Language & Communication Style Matching (Multilingual & Hinglish):
   - Flawlessly match the user's language and tone!
   - If the user writes in English, reply in natural, clear English.
   - If the user writes in Hindi or everyday Hinglish (e.g., "yaar mujhe samajh nahi aa raha kya karu", "kaunse skills demand me hai?"), respond warmly and fluently in natural conversational Hindi/Hinglish!
   - Be concise when a quick answer is needed; be detailed and well-structured when the user asks for roadmaps, tutorials, or in-depth breakdowns.
7. Career Specialization as a Superpower:
   - When the user DOES ask for career, educational, or job advice: provide top-tier, practical, actionable advice. Break things down with clear next steps, concrete project ideas, and honest industry realities.
   - Be supportive and encouraging without pretending to be a physical human.

${resumeContext ? `\n[SHARED CANDIDATE RESUME CONTEXT]\nThe user has explicitly shared their resume analysis with you:\n${resumeContext.slice(0, 4000)}\nUse this to personalize your career advice whenever relevant, but don't force it if they are asking about other topics.` : ''}`;

    // Structure messages ensuring valid alternating user/model turns starting with user
    const formattedContents: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];
    for (const m of messages) {
      if (!m.content || !m.content.trim()) continue;
      const role = m.role === 'assistant' ? 'model' : 'user';

      // Skip initial static assistant welcome message if it appears before any user message
      if (formattedContents.length === 0 && role === 'model') {
        continue;
      }

      // If consecutive messages have the same role, combine them
      if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
        formattedContents[formattedContents.length - 1].parts[0].text += `\n\n${m.content}`;
      } else {
        formattedContents.push({
          role,
          parts: [{ text: m.content }],
        });
      }
    }

    // Fallback if empty
    if (formattedContents.length === 0) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: 'Hello!' }],
      });
    }

    const response = await generateContentWithRetry({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    const reply =
      response.text ||
      "I'm here to chat, brainstorm, or help you navigate your career path. What's on your mind?";
    return res.json({ reply });
  } catch (error: any) {
    console.error('Career chat error:', error);
    return res.status(500).json({ error: error.message || 'Chat service is temporarily unavailable.' });
  }
});

// 5. Endpoint: Extract Resume into Structured JSON for Resume Builder & Editor
app.post('/api/parse-resume-to-builder', async (req: Request, res: Response) => {
  try {
    const { resumeText, resumeBase64 } = req.body;

    let textContent = resumeText || '';
    if (!textContent && resumeBase64) {
      const extraction = await extractTextFromPdf(resumeBase64);
      textContent = extraction.text;
    }

    if (!textContent || textContent.trim().length < 20) {
      return res.status(400).json({
        error: 'Unable to extract resume content. Please ensure the file contains readable text or enter details manually.',
      });
    }

    const parsePrompt = `You are an expert resume parsing intelligence system.
Analyze the following raw resume text and organize every detail into cleanly structured JSON.

CRITICAL INSTRUCTIONS:
- Extract ONLY information that actually and explicitly exists in the provided resume text.
- NEVER invent, hallucinate, or insert fictional names, contact information, photos, experience, education, skills, or projects.
- If any information is missing or not mentioned in the text, you MUST leave that field blank (empty string "" or empty array []). NEVER use placeholder or sample data.
- If phone, LinkedIn, GitHub, or portfolio is not in the text, return "".
- If professional summary is not in the text, return "".

--- RESUME TEXT ---
${textContent.slice(0, 20000)}

Respond strictly in valid JSON matching this schema:
{
  "contact": {
    "fullName": string,
    "jobTitle": string (e.g. "Software Engineer" or current profession),
    "email": string,
    "phone": string,
    "location": string (e.g. "San Francisco, CA" or "New Delhi, India"),
    "linkedin": string,
    "github": string,
    "portfolio": string
  },
  "professionalSummary": string (1-3 sentences summary based faithfully on the resume, or an empty string if none provided),
  "education": [
    {
      "id": string (random short id like "edu-1"),
      "institution": string,
      "degree": string,
      "fieldOfStudy": string,
      "startDate": string,
      "endDate": string,
      "grade": string (GPA or percentage if found),
      "location": string,
      "description": string
    }
  ],
  "skills": [string] (list of specific technical, tool, and professional skills extracted),
  "experience": [
    {
      "id": string (e.g. "exp-1"),
      "company": string,
      "position": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "current": boolean,
      "bulletPoints": [string] (exact or cleanly formatted achievement bullet points)
    }
  ],
  "projects": [
    {
      "id": string (e.g. "proj-1"),
      "title": string,
      "subtitle": string,
      "link": string,
      "startDate": string,
      "endDate": string,
      "techStack": [string],
      "bulletPoints": [string]
    }
  ],
  "certifications": [
    {
      "id": string (e.g. "cert-1"),
      "name": string,
      "issuer": string,
      "issueDate": string,
      "credentialUrl": string
    }
  ],
  "achievements": [
    {
      "id": string (e.g. "ach-1"),
      "title": string,
      "description": string,
      "date": string
    }
  ],
  "languages": [
    {
      "id": string (e.g. "lang-1"),
      "language": string,
      "proficiency": string
    }
  ]
}`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.8-flash',
      contents: parsePrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({ resumeData: parsedData, rawText: textContent });
  } catch (error: any) {
    console.error('Parse resume to builder error:', error);
    return res.status(500).json({ error: error.message || 'Failed to parse resume into structured builder data.' });
  }
});

// 6. Endpoint: Natural Language AI Resume Editor
app.post('/api/ai-resume-edit', async (req: Request, res: Response) => {
  try {
    const { currentResume, instructions } = req.body;

    if (!instructions || !instructions.trim()) {
      return res.status(400).json({ error: 'Please enter instructions for what you would like AI to change.' });
    }

    if (!currentResume) {
      return res.status(400).json({ error: 'Current resume data is missing.' });
    }

    const editPrompt = `You are Cosmic AI's Precision Resume Editor.
The candidate has provided their current structured resume data and a natural language instruction of changes they want made.

--- CURRENT RESUME DATA (JSON) ---
${JSON.stringify(currentResume, null, 2).slice(0, 25000)}

--- USER INSTRUCTIONS ---
"${instructions.trim()}"

CRITICAL RULES:
1. Apply the user's instructions with high fidelity.
2. PRESERVE all other existing sections, details, contact information, education, and dates that the user did NOT ask to modify.
3. NEVER invent or hallucinate fake degrees, fake work experience companies, certifications, or grades. If the user asks to "highlight Python", rewrite bullet points to emphasize Python or add Python to skills, but do NOT make up fictitious employer names or fake degrees.
4. If missing specific details are required to complete the user's wish (for example, if they say "add my college project" but provide no project details), fulfill as much as possible, add a clear placeholder project with whatever hints they gave, AND include a helpful message in "aiNote" asking for the missing details.
5. In "changedSections", list which top-level keys were modified (e.g. ["professionalSummary", "skills", "experience"]).
6. In "changeSummary", explain in 1-3 concise, encouraging bullet points what was improved.

Respond strictly in valid JSON matching this schema:
{
  "updatedResume": <The complete updated ResumeData JSON object with identical structure to input>,
  "changedSections": [string],
  "changeSummary": string,
  "aiNote": string (optional friendly advice, or questions for missing details)
}`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.8-flash',
      contents: editPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('AI resume edit error:', error);
    return res.status(500).json({ error: error.message || 'Failed to apply AI changes to resume.' });
  }
});


// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cosmic Career AI server listening on port ${PORT}`);
  });
}

startServer();
