import React, { useState } from 'react';
import {
  ResumeData,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
  ResumeCertification,
  ResumeAchievement,
  ResumeLanguage,
} from '../types';
import {
  User,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Award,
  Languages,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Camera,
  X,
  FileCheck2,
} from 'lucide-react';

interface ResumeFormProps {
  data: ResumeData;
  onChange: (updated: ResumeData) => void;
  onPhotoUpload: (file: File) => void;
  onRemovePhoto: () => void;
  onOpenCropEditor?: () => void;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({
  data,
  onChange,
  onPhotoUpload,
  onRemovePhoto,
  onOpenCropEditor,
}) => {
  // Collapsible accordion tabs
  const [openSection, setOpenSection] = useState<string>('contact');

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? '' : id));
  };

  // 1. Contact Info Changes
  const updateContact = (field: keyof ResumeData['contact'], value: any) => {
    onChange({
      ...data,
      contact: {
        ...data.contact,
        [field]: value,
      },
    });
  };

  // 2. Summary Change
  const updateSummary = (value: string) => {
    onChange({
      ...data,
      professionalSummary: value,
    });
  };

  // 3. Skills
  const [newSkillInput, setNewSkillInput] = useState('');
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const skillsList = newSkillInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const merged = Array.from(new Set([...data.skills, ...skillsList]));
    onChange({ ...data, skills: merged });
    setNewSkillInput('');
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    onChange({
      ...data,
      skills: data.skills.filter((_, idx) => idx !== indexToRemove),
    });
  };

  // 4. Education Handlers
  const handleAddEducation = () => {
    const newEdu: ResumeEducation = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
      location: '',
      description: '',
    };
    onChange({
      ...data,
      education: [newEdu, ...data.education],
    });
    setOpenSection('education');
  };

  const updateEducation = (id: string, field: keyof ResumeEducation, value: string) => {
    onChange({
      ...data,
      education: data.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter((item) => item.id !== id),
    });
  };

  // 5. Work Experience Handlers
  const handleAddExperience = () => {
    const newExp: ResumeExperience = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bulletPoints: [''],
    };
    onChange({
      ...data,
      experience: [newExp, ...data.experience],
    });
    setOpenSection('experience');
  };

  const updateExperience = (id: string, field: keyof ResumeExperience, value: any) => {
    onChange({
      ...data,
      experience: data.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experience: data.experience.filter((item) => item.id !== id),
    });
  };

  const updateExpBullet = (expId: string, bulletIdx: number, val: string) => {
    onChange({
      ...data,
      experience: data.experience.map((item) => {
        if (item.id !== expId) return item;
        const newBullets = [...item.bulletPoints];
        newBullets[bulletIdx] = val;
        return { ...item, bulletPoints: newBullets };
      }),
    });
  };

  const addExpBullet = (expId: string) => {
    onChange({
      ...data,
      experience: data.experience.map((item) => {
        if (item.id !== expId) return item;
        return { ...item, bulletPoints: [...item.bulletPoints, ''] };
      }),
    });
  };

  const removeExpBullet = (expId: string, bulletIdx: number) => {
    onChange({
      ...data,
      experience: data.experience.map((item) => {
        if (item.id !== expId) return item;
        return {
          ...item,
          bulletPoints: item.bulletPoints.filter((_, idx) => idx !== bulletIdx),
        };
      }),
    });
  };

  // 6. Projects Handlers
  const handleAddProject = () => {
    const newProj: ResumeProject = {
      id: `proj-${Date.now()}`,
      title: '',
      subtitle: '',
      link: '',
      startDate: '',
      endDate: '',
      techStack: [],
      bulletPoints: [''],
    };
    onChange({
      ...data,
      projects: [newProj, ...data.projects],
    });
    setOpenSection('projects');
  };

  const updateProject = (id: string, field: keyof ResumeProject, value: any) => {
    onChange({
      ...data,
      projects: data.projects.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter((item) => item.id !== id),
    });
  };

  const updateProjBullet = (projId: string, bulletIdx: number, val: string) => {
    onChange({
      ...data,
      projects: data.projects.map((item) => {
        if (item.id !== projId) return item;
        const newBullets = [...item.bulletPoints];
        newBullets[bulletIdx] = val;
        return { ...item, bulletPoints: newBullets };
      }),
    });
  };

  const addProjBullet = (projId: string) => {
    onChange({
      ...data,
      projects: data.projects.map((item) => {
        if (item.id !== projId) return item;
        return { ...item, bulletPoints: [...item.bulletPoints, ''] };
      }),
    });
  };

  const removeProjBullet = (projId: string, bulletIdx: number) => {
    onChange({
      ...data,
      projects: data.projects.map((item) => {
        if (item.id !== projId) return item;
        return {
          ...item,
          bulletPoints: item.bulletPoints.filter((_, idx) => idx !== bulletIdx),
        };
      }),
    });
  };

  // 7. Certifications
  const handleAddCertification = () => {
    const newCert: ResumeCertification = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      issueDate: '',
      credentialUrl: '',
    };
    onChange({
      ...data,
      certifications: [...data.certifications, newCert],
    });
    setOpenSection('certifications');
  };

  const updateCertification = (id: string, field: keyof ResumeCertification, val: string) => {
    onChange({
      ...data,
      certifications: data.certifications.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    });
  };

  const removeCertification = (id: string) => {
    onChange({
      ...data,
      certifications: data.certifications.filter((item) => item.id !== id),
    });
  };

  // 8. Achievements
  const handleAddAchievement = () => {
    const newAch: ResumeAchievement = {
      id: `ach-${Date.now()}`,
      title: '',
      description: '',
      date: '',
    };
    onChange({
      ...data,
      achievements: [...data.achievements, newAch],
    });
    setOpenSection('achievements');
  };

  const updateAchievement = (id: string, field: keyof ResumeAchievement, val: string) => {
    onChange({
      ...data,
      achievements: data.achievements.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    });
  };

  const removeAchievement = (id: string) => {
    onChange({
      ...data,
      achievements: data.achievements.filter((item) => item.id !== id),
    });
  };

  // 9. Languages
  const handleAddLanguage = () => {
    const newLang: ResumeLanguage = {
      id: `lang-${Date.now()}`,
      language: '',
      proficiency: 'Fluent',
    };
    onChange({
      ...data,
      languages: [...data.languages, newLang],
    });
    setOpenSection('languages');
  };

  const updateLanguage = (id: string, field: keyof ResumeLanguage, val: string) => {
    onChange({
      ...data,
      languages: data.languages.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    });
  };

  const removeLanguage = (id: string) => {
    onChange({
      ...data,
      languages: data.languages.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-4 text-left">
      {/* 1. CONTACT INFORMATION & PHOTO */}
      <div className="cosmic-card rounded-2xl border border-[#53D8FF]/20 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('contact')}
          className="w-full p-4 flex items-center justify-between text-left bg-[#07132E]/60 hover:bg-[#0A1633] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#238BFF]/20 border border-[#238BFF]/40 flex items-center justify-center text-[#53D8FF]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F4F7FF]">Contact & Profile Info</h3>
              <p className="text-xs text-[#A7B6D4]">
                {data.contact.fullName || 'Name, Email, Phone, Social Profiles'}
              </p>
            </div>
          </div>
          {openSection === 'contact' ? (
            <ChevronUp className="w-4 h-4 text-[#A7B6D4]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#A7B6D4]" />
          )}
        </button>

        {openSection === 'contact' && (
          <div className="p-5 border-t border-[#53D8FF]/10 space-y-4">
            {/* Profile Photo Upload and Toggle */}
            <div className="p-4 rounded-xl bg-[#0A1633] border border-[#53D8FF]/15 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group">
                {data.contact.photoUrl ? (
                  <img
                    src={data.contact.photoUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#53D8FF]/40 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#07132E] border-2 border-dashed border-[#53D8FF]/30 flex flex-col items-center justify-center text-[#A7B6D4]">
                    <Camera className="w-6 h-6 text-[#53D8FF]" />
                    <span className="text-[10px] mt-1 font-medium">Add Photo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#238BFF] to-[#7657FF] hover:brightness-110 text-xs font-semibold text-white transition-all shadow-sm">
                    <span>{data.contact.photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onPhotoUpload(file);
                      }}
                      className="hidden"
                    />
                  </label>

                  {data.contact.photoUrl && onOpenCropEditor && (
                    <button
                      type="button"
                      onClick={onOpenCropEditor}
                      className="px-3 py-1.5 rounded-lg bg-[#07132E] border border-[#53D8FF]/30 text-[#53D8FF] hover:bg-[#0A1633] text-xs font-medium flex items-center gap-1 transition-all"
                      title="Adjust photo crop and frame"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Adjust Crop</span>
                    </button>
                  )}

                  {data.contact.photoUrl && (
                    <button
                      type="button"
                      onClick={onRemovePhoto}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 text-xs font-medium flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <input
                    type="checkbox"
                    id="showPhotoCheck"
                    checked={data.contact.showPhoto || false}
                    onChange={(e) => updateContact('showPhoto', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-[#238BFF] focus:ring-[#53D8FF] bg-[#07132E]"
                  />
                  <label htmlFor="showPhotoCheck" className="text-xs text-[#A7B6D4] cursor-pointer">
                    Show photo on resume template
                  </label>
                </div>

                {data.contact.photoUrl && data.contact.showPhoto && (
                  <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-[#53D8FF]/10 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#A7B6D4] text-[11px] font-medium">Position:</span>
                      <div className="inline-flex rounded-lg bg-[#07132E] border border-slate-700 p-0.5">
                        {(['left', 'right', 'center'] as const).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => updateContact('photoPosition', pos)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize transition-all ${
                              (data.contact.photoPosition || 'right') === pos
                                ? 'bg-[#238BFF] text-white shadow-xs'
                                : 'text-[#A7B6D4] hover:text-white'
                            }`}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[#A7B6D4] text-[11px] font-medium">Shape:</span>
                      <div className="inline-flex rounded-lg bg-[#07132E] border border-slate-700 p-0.5">
                        {(['circle', 'rounded', 'square'] as const).map((shape) => (
                          <button
                            key={shape}
                            type="button"
                            onClick={() => updateContact('photoShape', shape)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize transition-all ${
                              (data.contact.photoShape || 'circle') === shape
                                ? 'bg-[#238BFF] text-white shadow-xs'
                                : 'text-[#A7B6D4] hover:text-white'
                            }`}
                          >
                            {shape}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#A7B6D4] mb-1">
                  Full Name <span className="text-[#53D8FF]">*</span>
                </label>
                <input
                  type="text"
                  value={data.contact.fullName}
                  onChange={(e) => updateContact('fullName', e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 bg-[#0A1633] border border-[#53D8FF]/20 rounded-xl text-sm text-[#F4F7FF] focus:outline-none focus:border-[#53D8FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B6D4] mb-1">
                  Professional Title
                </label>
                <input
                  type="text"
                  value={data.contact.jobTitle}
                  onChange={(e) => updateContact('jobTitle', e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-3 py-2 bg-[#0A1633] border border-[#53D8FF]/20 rounded-xl text-sm text-[#F4F7FF] focus:outline-none focus:border-[#53D8FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B6D4] mb-1">Email</label>
                <input
                  type="email"
                  value={data.contact.email}
                  onChange={(e) => updateContact('email', e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 bg-[#0A1633] border border-[#53D8FF]/20 rounded-xl text-sm text-[#F4F7FF] focus:outline-none focus:border-[#53D8FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B6D4] mb-1">Phone</label>
                <input
                  type="text"
                  value={data.contact.phone}
                  onChange={(e) => updateContact('phone', e.target.value)}
                  placeholder="Phone number"
                  className="w-full px-3 py-2 bg-[#0A1633] border border-[#53D8FF]/20 rounded-xl text-sm text-[#F4F7FF] focus:outline-none focus:border-[#53D8FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B6D4] mb-1">Location</label>
                <input
                  type="text"
                  value={data.contact.location}
                  onChange={(e) => updateContact('location', e.target.value)}
                  placeholder="City, State / Country"
                  className="w-full px-3 py-2 bg-[#0A1633] border border-[#53D8FF]/20 rounded-xl text-sm text-[#F4F7FF] focus:outline-none focus:border-[#53D8FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B6D4] mb-1">LinkedIn</label>
                <input
                  type="text"
                  value={data.contact.linkedin || ''}
                  onChange={(e) => updateContact('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full px-3 py-2 bg-[#0A1633] border border-[#53D8FF]/20 rounded-xl text-sm text-[#F4F7FF] focus:outline-none focus:border-[#53D8FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B6D4] mb-1">GitHub</label>
                <input
                  type="text"
                  value={data.contact.github || ''}
                  onChange={(e) => updateContact('github', e.target.value)}
                  placeholder="github.com/username"
                  className="w-full px-3 py-2 bg-[#0A1633] border border-[#53D8FF]/20 rounded-xl text-sm text-[#F4F7FF] focus:outline-none focus:border-[#53D8FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B6D4] mb-1">Portfolio Website</label>
                <input
                  type="text"
                  value={data.contact.portfolio || ''}
                  onChange={(e) => updateContact('portfolio', e.target.value)}
                  placeholder="portfolio.com"
                  className="w-full px-3 py-2 bg-[#0A1633] border border-[#53D8FF]/20 rounded-xl text-sm text-[#F4F7FF] focus:outline-none focus:border-[#53D8FF]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. PROFESSIONAL SUMMARY */}
      <div className="cosmic-card rounded-2xl border border-[#53D8FF]/20 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('summary')}
          className="w-full p-4 flex items-center justify-between text-left bg-[#07132E]/60 hover:bg-[#0A1633] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7657FF]/20 border border-[#7657FF]/40 flex items-center justify-center text-[#7657FF]">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F4F7FF]">Professional Summary</h3>
              <p className="text-xs text-[#A7B6D4]">
                {data.professionalSummary ? 'Summary defined' : 'Empty (Click to add)'}
              </p>
            </div>
          </div>
          {openSection === 'summary' ? (
            <ChevronUp className="w-4 h-4 text-[#A7B6D4]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#A7B6D4]" />
          )}
        </button>

        {openSection === 'summary' && (
          <div className="p-5 border-t border-[#53D8FF]/10 space-y-2">
            <textarea
              rows={4}
              value={data.professionalSummary}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="Write a concise 2-4 sentence summary of your background, key strengths, and goals..."
              className="w-full px-3 py-2 bg-[#0A1633] border border-[#53D8FF]/20 rounded-xl text-sm text-[#F4F7FF] focus:outline-none focus:border-[#53D8FF] leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* 3. SKILLS */}
      <div className="cosmic-card rounded-2xl border border-[#53D8FF]/20 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('skills')}
          className="w-full p-4 flex items-center justify-between text-left bg-[#07132E]/60 hover:bg-[#0A1633] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F4F7FF]">
                Skills ({data.skills.length})
              </h3>
              <p className="text-xs text-[#A7B6D4]">
                {data.skills.slice(0, 4).join(', ') || 'No skills yet'}
                {data.skills.length > 4 ? '...' : ''}
              </p>
            </div>
          </div>
          {openSection === 'skills' ? (
            <ChevronUp className="w-4 h-4 text-[#A7B6D4]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#A7B6D4]" />
          )}
        </button>

        {openSection === 'skills' && (
          <div className="p-5 border-t border-[#53D8FF]/10 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add skill (or comma-separated e.g. Python, SQL, Docker)..."
                className="flex-1 px-3 py-2 bg-[#0A1633] border border-[#53D8FF]/20 rounded-xl text-sm text-[#F4F7FF] focus:outline-none focus:border-[#53D8FF]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-[#238BFF] hover:bg-[#238BFF]/80 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              {data.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-[#0A1633] border border-[#53D8FF]/30 rounded-lg text-xs font-medium text-[#F4F7FF] flex items-center gap-2 group"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-[#A7B6D4] hover:text-rose-400 group-hover:opacity-100 transition-opacity"
                    title="Remove skill"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {data.skills.length === 0 && (
                <p className="text-xs text-[#A7B6D4] italic">No skills added yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. WORK EXPERIENCE */}
      <div className="cosmic-card rounded-2xl border border-[#53D8FF]/20 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('experience')}
          className="w-full p-4 flex items-center justify-between text-left bg-[#07132E]/60 hover:bg-[#0A1633] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F4F7FF]">
                Work Experience ({data.experience.length})
              </h3>
              <p className="text-xs text-[#A7B6D4]">
                Jobs, internships, and freelance projects
              </p>
            </div>
          </div>
          {openSection === 'experience' ? (
            <ChevronUp className="w-4 h-4 text-[#A7B6D4]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#A7B6D4]" />
          )}
        </button>

        {openSection === 'experience' && (
          <div className="p-5 border-t border-[#53D8FF]/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#A7B6D4]">Experience entries</span>
              <button
                type="button"
                onClick={handleAddExperience}
                className="px-3 py-1.5 rounded-lg bg-[#238BFF]/20 hover:bg-[#238BFF]/40 border border-[#238BFF]/40 text-[#53D8FF] text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            <div className="space-y-4">
              {data.experience.map((exp, expIdx) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-xl bg-[#0A1633] border border-[#53D8FF]/20 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#53D8FF]/10">
                    <span className="text-xs font-bold text-[#53D8FF]">
                      Position #{expIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                      title="Delete experience"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#A7B6D4] mb-1">Company / Organization</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A7B6D4] mb-1">Job Title</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                        placeholder="e.g. Software Engineer Intern"
                        className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A7B6D4] mb-1">Location</label>
                      <input
                        type="text"
                        value={exp.location || ''}
                        onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                        placeholder="e.g. San Francisco, CA / Remote"
                        className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] text-[#A7B6D4] mb-1">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate || ''}
                          onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                          placeholder="e.g. Jun 2023"
                          className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[11px] text-[#A7B6D4] mb-1">End Date</label>
                        <input
                          type="text"
                          value={exp.endDate || ''}
                          onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                          placeholder="e.g. Aug 2023"
                          className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bullet points */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-[#A7B6D4] font-medium">Achievement Bullet Points</label>
                      <button
                        type="button"
                        onClick={() => addExpBullet(exp.id)}
                        className="text-[11px] text-[#53D8FF] hover:underline"
                      >
                        + Add bullet
                      </button>
                    </div>

                    {exp.bulletPoints.map((bp, bpIdx) => (
                      <div key={bpIdx} className="flex gap-2 items-center">
                        <span className="text-[#53D8FF] text-xs">•</span>
                        <input
                          type="text"
                          value={bp}
                          onChange={(e) => updateExpBullet(exp.id, bpIdx, e.target.value)}
                          placeholder="e.g. Optimized database queries, reducing response times by 35%..."
                          className="flex-1 px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                        />
                        <button
                          type="button"
                          onClick={() => removeExpBullet(exp.id, bpIdx)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {data.experience.length === 0 && (
                <p className="text-xs text-[#A7B6D4] italic text-center py-2">
                  No work experience added yet. Click &quot;Add Position&quot; above.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. EDUCATION */}
      <div className="cosmic-card rounded-2xl border border-[#53D8FF]/20 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('education')}
          className="w-full p-4 flex items-center justify-between text-left bg-[#07132E]/60 hover:bg-[#0A1633] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F4F7FF]">
                Education ({data.education.length})
              </h3>
              <p className="text-xs text-[#A7B6D4]">
                Degrees, universities, colleges, and GPA
              </p>
            </div>
          </div>
          {openSection === 'education' ? (
            <ChevronUp className="w-4 h-4 text-[#A7B6D4]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#A7B6D4]" />
          )}
        </button>

        {openSection === 'education' && (
          <div className="p-5 border-t border-[#53D8FF]/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#A7B6D4]">Education records</span>
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-3 py-1.5 rounded-lg bg-[#238BFF]/20 hover:bg-[#238BFF]/40 border border-[#238BFF]/40 text-[#53D8FF] text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-4">
              {data.education.map((edu, eduIdx) => (
                <div
                  key={edu.id}
                  className="p-4 rounded-xl bg-[#0A1633] border border-[#53D8FF]/20 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#53D8FF]/10">
                    <span className="text-xs font-bold text-[#53D8FF]">
                      Degree #{eduIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                      title="Delete education"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#A7B6D4] mb-1">Institution / College Name</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        placeholder="e.g. Stanford University"
                        className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A7B6D4] mb-1">Degree / Qualification</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        placeholder="e.g. Bachelor of Science"
                        className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A7B6D4] mb-1">Field of Study / Major</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy || ''}
                        onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                        placeholder="e.g. Computer Science"
                        className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A7B6D4] mb-1">Grade / GPA / Percentage</label>
                      <input
                        type="text"
                        value={edu.grade || ''}
                        onChange={(e) => updateEducation(edu.id, 'grade', e.target.value)}
                        placeholder="e.g. 3.8 / 4.0 or 88%"
                        className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A7B6D4] mb-1">Start Year</label>
                      <input
                        type="text"
                        value={edu.startDate || ''}
                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                        placeholder="e.g. 2020"
                        className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A7B6D4] mb-1">End Year (or Expected)</label>
                      <input
                        type="text"
                        value={edu.endDate || ''}
                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                        placeholder="e.g. 2024"
                        className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#A7B6D4] mb-1">Notes / Capstone / Honors (Optional)</label>
                    <input
                      type="text"
                      value={edu.description || ''}
                      onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                      placeholder="e.g. Dean's List, Specialization in Artificial Intelligence"
                      className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                    />
                  </div>
                </div>
              ))}

              {data.education.length === 0 && (
                <p className="text-xs text-[#A7B6D4] italic text-center py-2">
                  No education entries yet. Click &quot;Add Education&quot; above.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 6. PROJECTS */}
      <div className="cosmic-card rounded-2xl border border-[#53D8FF]/20 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('projects')}
          className="w-full p-4 flex items-center justify-between text-left bg-[#07132E]/60 hover:bg-[#0A1633] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F4F7FF]">
                Projects ({data.projects.length})
              </h3>
              <p className="text-xs text-[#A7B6D4]">
                Technical and academic projects with tools and links
              </p>
            </div>
          </div>
          {openSection === 'projects' ? (
            <ChevronUp className="w-4 h-4 text-[#A7B6D4]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#A7B6D4]" />
          )}
        </button>

        {openSection === 'projects' && (
          <div className="p-5 border-t border-[#53D8FF]/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#A7B6D4]">Projects list</span>
              <button
                type="button"
                onClick={handleAddProject}
                className="px-3 py-1.5 rounded-lg bg-[#238BFF]/20 hover:bg-[#238BFF]/40 border border-[#238BFF]/40 text-[#53D8FF] text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="space-y-4">
              {data.projects.map((proj, projIdx) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl bg-[#0A1633] border border-[#53D8FF]/20 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#53D8FF]/10">
                    <span className="text-xs font-bold text-[#53D8FF]">
                      Project #{projIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeProject(proj.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#A7B6D4] mb-1">Project Title</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                        placeholder="e.g. AI Career Navigator"
                        className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A7B6D4] mb-1">Subtitle / Brief Category</label>
                      <input
                        type="text"
                        value={proj.subtitle || ''}
                        onChange={(e) => updateProject(proj.id, 'subtitle', e.target.value)}
                        placeholder="e.g. Full-Stack Web Application"
                        className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A7B6D4] mb-1">Project Link / GitHub URL</label>
                      <input
                        type="text"
                        value={proj.link || ''}
                        onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                        placeholder="e.g. github.com/user/project"
                        className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#A7B6D4] mb-1">Technologies (comma-separated)</label>
                      <input
                        type="text"
                        value={proj.techStack?.join(', ') || ''}
                        onChange={(e) =>
                          updateProject(
                            proj.id,
                            'techStack',
                            e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                          )
                        }
                        placeholder="React, TypeScript, Node.js"
                        className="w-full px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                      />
                    </div>
                  </div>

                  {/* Bullet points */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-[#A7B6D4] font-medium">Project Highlights</label>
                      <button
                        type="button"
                        onClick={() => addProjBullet(proj.id)}
                        className="text-[11px] text-[#53D8FF] hover:underline"
                      >
                        + Add bullet
                      </button>
                    </div>

                    {proj.bulletPoints.map((bp, bpIdx) => (
                      <div key={bpIdx} className="flex gap-2 items-center">
                        <span className="text-[#53D8FF] text-xs">•</span>
                        <input
                          type="text"
                          value={bp}
                          onChange={(e) => updateProjBullet(proj.id, bpIdx, e.target.value)}
                          placeholder="e.g. Built interactive dashboard with real-time analytics..."
                          className="flex-1 px-3 py-1.5 bg-[#07132E] border border-slate-700 rounded-lg text-xs text-[#F4F7FF] focus:border-[#53D8FF]"
                        />
                        <button
                          type="button"
                          onClick={() => removeProjBullet(proj.id, bpIdx)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {data.projects.length === 0 && (
                <p className="text-xs text-[#A7B6D4] italic text-center py-2">
                  No projects added yet. Click &quot;Add Project&quot; above.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 7. CERTIFICATIONS & ACHIEVEMENTS */}
      <div className="cosmic-card rounded-2xl border border-[#53D8FF]/20 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('certifications')}
          className="w-full p-4 flex items-center justify-between text-left bg-[#07132E]/60 hover:bg-[#0A1633] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F4F7FF]">
                Certifications & Achievements
              </h3>
              <p className="text-xs text-[#A7B6D4]">
                {data.certifications.length} certifications, {data.achievements.length} achievements
              </p>
            </div>
          </div>
          {openSection === 'certifications' ? (
            <ChevronUp className="w-4 h-4 text-[#A7B6D4]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#A7B6D4]" />
          )}
        </button>

        {openSection === 'certifications' && (
          <div className="p-5 border-t border-[#53D8FF]/10 space-y-6">
            {/* Certifications Sub-block */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F4F7FF]">Certifications</span>
                <button
                  type="button"
                  onClick={handleAddCertification}
                  className="px-2.5 py-1 rounded-lg bg-[#7657FF]/20 text-[#7657FF] border border-[#7657FF]/40 text-xs font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Cert</span>
                </button>
              </div>

              {data.certifications.map((cert) => (
                <div key={cert.id} className="p-3 bg-[#0A1633] rounded-xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                      placeholder="Certificate Name (e.g. AWS Certified Developer)"
                      className="flex-1 mr-2 px-2.5 py-1 bg-[#07132E] border border-slate-700 rounded text-xs text-[#F4F7FF]"
                    />
                    <button
                      type="button"
                      onClick={() => removeCertification(cert.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                      placeholder="Issuer (e.g. Amazon Web Services)"
                      className="px-2.5 py-1 bg-[#07132E] border border-slate-700 rounded text-xs text-[#F4F7FF]"
                    />
                    <input
                      type="text"
                      value={cert.issueDate || ''}
                      onChange={(e) => updateCertification(cert.id, 'issueDate', e.target.value)}
                      placeholder="Year / Date (e.g. 2024)"
                      className="px-2.5 py-1 bg-[#07132E] border border-slate-700 rounded text-xs text-[#F4F7FF]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Achievements Sub-block */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F4F7FF]">Achievements & Awards</span>
                <button
                  type="button"
                  onClick={handleAddAchievement}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Award</span>
                </button>
              </div>

              {data.achievements.map((ach) => (
                <div key={ach.id} className="p-3 bg-[#0A1633] rounded-xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={ach.title}
                      onChange={(e) => updateAchievement(ach.id, 'title', e.target.value)}
                      placeholder="Achievement Title (e.g. 1st Place Hackathon)"
                      className="flex-1 mr-2 px-2.5 py-1 bg-[#07132E] border border-slate-700 rounded text-xs text-[#F4F7FF]"
                    />
                    <button
                      type="button"
                      onClick={() => removeAchievement(ach.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={ach.description}
                    onChange={(e) => updateAchievement(ach.id, 'description', e.target.value)}
                    placeholder="Short description of the accomplishment..."
                    className="w-full px-2.5 py-1 bg-[#07132E] border border-slate-700 rounded text-xs text-[#F4F7FF]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 8. LANGUAGES */}
      <div className="cosmic-card rounded-2xl border border-[#53D8FF]/20 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('languages')}
          className="w-full p-4 flex items-center justify-between text-left bg-[#07132E]/60 hover:bg-[#0A1633] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F4F7FF]">
                Languages ({data.languages.length})
              </h3>
              <p className="text-xs text-[#A7B6D4]">
                Spoken and written languages
              </p>
            </div>
          </div>
          {openSection === 'languages' ? (
            <ChevronUp className="w-4 h-4 text-[#A7B6D4]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#A7B6D4]" />
          )}
        </button>

        {openSection === 'languages' && (
          <div className="p-5 border-t border-[#53D8FF]/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#A7B6D4]">Languages</span>
              <button
                type="button"
                onClick={handleAddLanguage}
                className="px-2.5 py-1 rounded-lg bg-[#238BFF]/20 text-[#53D8FF] border border-[#238BFF]/40 text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Language</span>
              </button>
            </div>

            {data.languages.map((lang) => (
              <div key={lang.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={lang.language}
                  onChange={(e) => updateLanguage(lang.id, 'language', e.target.value)}
                  placeholder="Language (e.g. English, Hindi)"
                  className="flex-1 px-3 py-1.5 bg-[#0A1633] border border-slate-700 rounded-lg text-xs text-[#F4F7FF]"
                />
                <select
                  value={lang.proficiency}
                  onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value)}
                  className="px-3 py-1.5 bg-[#0A1633] border border-slate-700 rounded-lg text-xs text-[#F4F7FF]"
                >
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Professional Working">Professional Working</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Basic">Basic</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeLanguage(lang.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
