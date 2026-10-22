import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import * as pdfParseModule from 'pdf-parse';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function generateContentWithRetry(params: any): Promise<any> {
  const modelsToTry = [
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-1.5-flash',
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
        errMsg.includes('429') ||
        errMsg.includes('503') ||
        errMsg.includes('Not Found') ||
        errMsg.includes('high demand');

      if (isQuotaOrOverload) {
        console.warn(`Model ${modelName} failed, trying fallback...`);
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

async function extractTextFromPdf(base64Data: string): Promise<PdfExtractionResult> {
  const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');

  try {
    const PDFParseClass: any = (pdfParseModule as any).PDFParse || (pdfParseModule as any).default?.PDFParse || (pdfParseModule as any).default || pdfParseModule;
    if (typeof PDFParseClass === 'function') {
      const parser = new PDFParseClass({ data: buffer });
      const data = await parser.getText();
      await parser.destroy?.();
      if (data && data.text && data.text.trim().length >= 30) {
        return { text: data.text.trim(), isScanned: false, method: 'pdf-parse' };
      }
    }
  } catch (err) {
    console.warn('pdf-parse fallback:', err);
  }

  try {
    const res = await generateContentWithRetry({
      contents: [
        { inlineData: { mimeType: 'application/pdf', data: cleanBase64 } },
        { text: 'Extract and transcribe the full text content from this PDF resume. Output ONLY clean text.' },
      ],
    });

    const ocrText = (res.text || '').trim();
    if (ocrText && ocrText.length >= 30) {
      return { text: ocrText, isScanned: true, method: 'gemini-ocr' };
    }
    return { text: '', isScanned: true, method: 'none' };
  } catch (geminiErr) {
    return { text: '', isScanned: true, method: 'error' };
  }
}

app.post('/api/extract-resume', async (req: Request, res: Response) => {
  try {
    const { base64, filename } = req.body;
    if (!base64) return res.status(400).json({ error: 'No PDF file provided.' });
    const extraction = await extractTextFromPdf(base64);
    return res.json({
      filename: filename || 'resume.pdf',
      extractedText: extraction.text,
      charCount: extraction.text.length,
      isSufficient: extraction.text.length >= 30,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Extraction failed.' });
  }
});

app.post('/api/analyze-resume', async (req: Request, res: Response) => {
  try {
    const { resumeText, resumeBase64, jobDescription, mode = 'quick' } = req.body;
    let resolvedText = resumeText || '';
    if (!resolvedText && resumeBase64) {
      const extraction = await extractTextFromPdf(resumeBase64);
      resolvedText = extraction.text;
    }
    if (!resolvedText || resolvedText.length < 30) {
      return res.status(400).json({ error: 'Insufficient resume content.' });
    }

    const prompt = `You are a career advisor. Analyze this resume and return strictly valid JSON matching schema:
{
  "mode": "quick",
  "candidateSummary": string,
  "readinessScore": number,
  "readinessNote": string,
  "education": { "degrees": [string], "details": string },
  "experience": { "level": string, "summary": string },
  "identifiedSkills": [string],
  "missingSkills": [string],
  "resumeStrengths": [string],
  "resumeWeaknesses": [string],
  "improvementSuggestions": [string],
  "recommendedEntryRoles": [string],
  "skillsToLearnNext": [{ "skill": string, "reason": string, "importance": string }]
}`;

    const response = await generateContentWithRetry({
      contents: `${prompt}\n\nRESUME:\n${resolvedText}`,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.mode = 'quick';
    return res.json(parsed);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Analysis error.' });
  }
});

app.post('/api/career-finder', async (req: Request, res: Response) => {
  try {
    const { resumeText, resumeBase64, qualification, existingSkills, interests, preferredIndustry, goals } = req.body;
    let resolved = resumeText || '';
    if (!resolved && resumeBase64) {
      const ext = await extractTextFromPdf(resumeBase64);
      resolved = ext.text;
    }

    const prompt = `Generate personalized career report in valid JSON matching schema:
{
  "userProfileSummary": string,
  "possessedSkills": [string],
  "missingSkills": [string],
  "skillsToPrioritizeNext": [{ "skill": string, "importance": string, "timeframe": string }],
  "recommendedCareerPaths": [{
    "id": string,
    "title": string,
    "fitScore": number,
    "whyItSuits": string,
    "existingStrengths": [string],
    "skillsToLearn": [string],
    "entryLevelRoles": [string],
    "practicalProjects": [{ "title": string, "description": string, "techStack": [string] }],
    "recommendedNextAction": string,
    "learningResources": [{ "title": string, "provider": string, "type": string }]
  }],
  "learningRoadmap": {
    "thirtyDays": { "focus": string, "milestones": [string], "deliverables": [string] },
    "sixtyDays": { "focus": string, "milestones": [string], "deliverables": [string] },
    "ninetyDays": { "focus": string, "milestones": [string], "deliverables": [string] }
  }
}`;

    const response = await generateContentWithRetry({
      contents: `${prompt}\n\nProfile: Qual: ${qualification}, Skills: ${existingSkills}, Interests: ${interests}`,
      config: { responseMimeType: 'application/json' },
    });

    return res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Career finder error.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();