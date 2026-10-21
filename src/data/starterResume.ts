import { ResumeData } from '../types';

export const INITIAL_EMPTY_RESUME: ResumeData = {
  contact: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    photoUrl: '',
    showPhoto: false,
  },
  professionalSummary: '',
  education: [],
  skills: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
};
