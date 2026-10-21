export interface ScoringAlignment {
  score: number;
  details: string;
}

export interface ScoringBreakdown {
  skillsAlignment: ScoringAlignment;
  experienceAlignment: ScoringAlignment;
  educationAlignment: ScoringAlignment;
  keywordsAlignment: ScoringAlignment;
}

export interface ActionableRecommendation {
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  rationale: string;
}

export interface QuickResumeAnalysisResult {
  candidateSummary: string;
  readinessScore: number;
  readinessNote: string;
  education: {
    degrees: string[];
    details: string;
  };
  experience: {
    level: string;
    summary: string;
  };
  identifiedSkills: string[];
  missingSkills: string[];
  resumeStrengths: string[];
  resumeWeaknesses: string[];
  improvementSuggestions: string[];
  recommendedEntryRoles: string[];
  skillsToLearnNext: Array<{
    skill: string;
    reason: string;
    importance: string;
  }>;
}

export interface ResumeAnalysisResult {
  overallScore: number;
  scoreEstimationNote: string;
  scoringBreakdown: ScoringBreakdown;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  relevantKeywords: string[];
  resumeStrengths: string[];
  improvementSuggestions: string[];
  actionableRecommendations: ActionableRecommendation[];
}

export interface PracticalProject {
  title: string;
  description: string;
  techStack: string[];
}

export interface LearningResource {
  title: string;
  provider: string;
  type: string;
}

export interface RecommendedCareerPath {
  id: string;
  title: string;
  fitScore: number;
  whyItSuits: string;
  existingStrengths: string[];
  skillsToLearn: string[];
  entryLevelRoles: string[];
  practicalProjects: PracticalProject[];
  recommendedNextAction: string;
  learningResources: LearningResource[];
}

export interface RoadmapPeriod {
  focus: string;
  milestones: string[];
  deliverables: string[];
}

export interface LearningRoadmap {
  thirtyDays: RoadmapPeriod;
  sixtyDays: RoadmapPeriod;
  ninetyDays: RoadmapPeriod;
}

export interface CareerFinderResult {
  userProfileSummary: string;
  possessedSkills: string[];
  missingSkills: string[];
  skillsToPrioritizeNext: Array<{
    skill: string;
    importance: string;
    timeframe: string;
  }>;
  recommendedCareerPaths: RecommendedCareerPath[];
  learningRoadmap: LearningRoadmap;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SampleResume {
  id: string;
  title: string;
  role: string;
  experienceLevel: string;
  content: string;
}

export interface SampleJob {
  id: string;
  title: string;
  companyPlaceholder: string;
  description: string;
}

// ==========================================
// RESUME BUILDER & EDITOR DATA STRUCTURES
// ==========================================

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  location?: string;
  description?: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  bulletPoints: string[];
}

export interface ResumeProject {
  id: string;
  title: string;
  subtitle?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  techStack: string[];
  bulletPoints: string[];
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface ResumeAchievement {
  id: string;
  title: string;
  description: string;
  date?: string;
}

export interface ResumeLanguage {
  id: string;
  language: string;
  proficiency: string; // e.g. Native, Fluent, Intermediate, Basic
}

export interface ResumeCustomSection {
  id: string;
  title: string;
  items: string[];
}

export interface ResumeContactInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  photoUrl?: string; // base64 or URL
  showPhoto?: boolean;
  photoPosition?: 'left' | 'right' | 'center';
  photoShape?: 'circle' | 'rounded' | 'square';
}

export interface ResumeData {
  contact: ResumeContactInfo;
  professionalSummary: string;
  education: ResumeEducation[];
  skills: string[]; // categorized or flat list
  experience: ResumeExperience[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  achievements: ResumeAchievement[];
  languages: ResumeLanguage[];
  customSections?: ResumeCustomSection[];
}

export type ResumeTemplateId = 'modern' | 'classic' | 'minimal' | 'professional' | 'executive';

export interface ResumeStyling {
  template: ResumeTemplateId;
  accentColor: string; // hex color e.g. #238BFF, #7657FF, #0D9488, #E11D48
  fontFamily: 'inter' | 'merriweather' | 'roboto-mono' | 'outfit';
  fontSize: 'compact' | 'normal' | 'relaxed';
  spacing: 'tight' | 'normal' | 'spacious';
  sectionOrder: Array<
    | 'summary'
    | 'experience'
    | 'education'
    | 'skills'
    | 'projects'
    | 'certifications'
    | 'achievements'
    | 'languages'
  >;
}

