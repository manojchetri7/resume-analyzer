import React, { forwardRef } from 'react';
import { ResumeData, ResumeStyling } from '../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, FileText, Calendar, Award, GraduationCap, Briefcase } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
  styling: ResumeStyling;
  scale?: number;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, styling, scale = 1 }, ref) => {
    const {
      contact,
      professionalSummary,
      education,
      skills,
      experience,
      projects,
      certifications,
      achievements,
      languages,
      customSections,
    } = data;
    const { template, accentColor, fontFamily, fontSize, spacing, sectionOrder } = styling;

    // Font mapping
    const fontClass =
      fontFamily === 'merriweather'
        ? 'font-serif'
        : fontFamily === 'roboto-mono'
        ? 'font-mono'
        : fontFamily === 'outfit'
        ? 'font-sans'
        : 'font-sans';

    // Spacing mapping for A4 layout (Standard ISO 20-25mm margins)
    const spacingPadding =
      spacing === 'tight' ? 'p-8 sm:p-9 space-y-4' : spacing === 'spacious' ? 'p-12 sm:p-14 space-y-6' : 'p-10 sm:p-11 space-y-5';

    const itemSpacing =
      spacing === 'tight' ? 'space-y-2.5' : spacing === 'spacious' ? 'space-y-4' : 'space-y-3';

    // Font size mapping for crisp hierarchical typography
    const textBaseClass =
      fontSize === 'compact' ? 'text-[11px]' : fontSize === 'relaxed' ? 'text-[13px]' : 'text-[12px]';
    const textSmallClass =
      fontSize === 'compact' ? 'text-[10px]' : fontSize === 'relaxed' ? 'text-[11.5px]' : 'text-[11px]';
    const titleClass =
      fontSize === 'compact' ? 'text-xs' : fontSize === 'relaxed' ? 'text-sm' : 'text-[13px]';

    // Render section title according to selected template style
    const renderHeading = (title: string, icon?: React.ReactNode) => {
      if (template === 'executive') {
        return (
          <div
            style={{ borderBottomColor: '#cbd5e1' }}
            className="flex items-center justify-between mb-3 pb-1.5 border-b-2"
          >
            <div className="flex items-center gap-2">
              <span
                style={{ backgroundColor: accentColor }}
                className="w-3.5 h-3.5 rounded-xs flex items-center justify-center shrink-0 shadow-xs"
              >
                <span className="w-1.5 h-1.5 bg-white rounded-2xs" />
              </span>
              <h3
                style={{ color: '#0f172a' }}
                className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
              >
                {icon}
                <span>{title}</span>
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase"
              >
                Section
              </span>
            </div>
          </div>
        );
      }

      if (template === 'modern') {
        return (
          <div
            style={{ borderBottomColor: '#e2e8f0' }}
            className="flex items-center gap-2 mb-2 pb-1.5 border-b"
          >
            <span
              style={{ backgroundColor: accentColor }}
              className="w-2.5 h-2.5 rounded-xs shrink-0"
            />
            <h3
              style={{ color: accentColor }}
              className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
            >
              {icon}
              <span>{title}</span>
            </h3>
          </div>
        );
      }

      if (template === 'professional') {
        return (
          <div
            style={{
              borderLeft: `4px solid ${accentColor}`,
              paddingLeft: '10px',
            }}
            className="mb-2.5 py-0.5"
          >
            <h3
              style={{ color: accentColor }}
              className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
            >
              {icon}
              <span>{title}</span>
            </h3>
          </div>
        );
      }

      if (template === 'minimal') {
        return (
          <div
            style={{ borderBottomColor: '#e2e8f0' }}
            className="mb-2 pb-1 border-b"
          >
            <h3
              style={{ color: '#0f172a' }}
              className="text-xs font-bold uppercase tracking-widest"
            >
              {title}
            </h3>
          </div>
        );
      }

      // Classic (Ivy-league editorial style)
      return (
        <div
          style={{ borderBottomColor: '#0f172a' }}
          className="mb-2 pb-1 border-b-2"
        >
          <h3
            style={{ color: '#0f172a' }}
            className="text-xs font-black uppercase tracking-wider"
          >
            {title}
          </h3>
        </div>
      );
    };

    // Render individual section blocks with high-craft styling
    const renderSection = (sectionKey: string) => {
      switch (sectionKey) {
        case 'summary':
          if (!professionalSummary || !professionalSummary.trim()) return null;
          return (
            <section key="summary" className="section-block">
              {renderHeading('Professional Summary')}
              <div
                style={{
                  borderLeftColor: template === 'modern' ? `${accentColor}50` : '#e2e8f0',
                  backgroundColor: template === 'modern' ? `${accentColor}06` : 'transparent',
                }}
                className={`mt-1.5 ${template === 'modern' ? 'border-l-2 pl-3 py-1 rounded-r-md' : ''}`}
              >
                <p
                  style={{ color: '#334155' }}
                  className={`${textBaseClass} leading-relaxed font-normal whitespace-pre-line`}
                >
                  {professionalSummary}
                </p>
              </div>
            </section>
          );

        case 'experience':
          if (!experience || experience.length === 0) return null;
          return (
            <section key="experience" className="section-block">
              {renderHeading('Work Experience', <Briefcase className="w-3.5 h-3.5" />)}
              <div className={itemSpacing}>
                {experience.map((item) => (
                  <div key={item.id} className="item-block">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          style={{ color: '#0f172a' }}
                          className={`font-bold ${titleClass}`}
                        >
                          {item.position}
                        </span>
                        {item.company && (
                          <span
                            style={{ color: accentColor }}
                            className="font-semibold text-xs"
                          >
                            @ {item.company}
                          </span>
                        )}
                        {item.location && (
                          <span
                            style={{ color: '#64748b' }}
                            className={`${textSmallClass}`}
                          >
                            • {item.location}
                          </span>
                        )}
                      </div>
                      {(item.startDate || item.endDate) && (
                        <span
                          style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap border border-slate-200"
                        >
                          {item.startDate} — {item.current ? 'Present' : item.endDate}
                        </span>
                      )}
                    </div>
                    {item.bulletPoints && item.bulletPoints.length > 0 && (
                      <ul
                        style={{ color: '#334155' }}
                        className={`mt-1.5 space-y-1 ${textBaseClass} leading-relaxed pl-1`}
                      >
                        {item.bulletPoints
                          .filter((bp) => bp && bp.trim())
                          .map((bp, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span
                                style={{ color: accentColor }}
                                className="mt-1 text-[10px] shrink-0 leading-none"
                              >
                                ▸
                              </span>
                              <span className="flex-1 leading-snug">{bp}</span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );

        case 'education':
          if (!education || education.length === 0) return null;
          return (
            <section key="education" className="section-block">
              {renderHeading('Education', <GraduationCap className="w-3.5 h-3.5" />)}
              <div className={itemSpacing}>
                {education.map((item) => (
                  <div key={item.id} className="item-block">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          style={{ color: '#0f172a' }}
                          className={`font-bold ${titleClass}`}
                        >
                          {item.degree}
                        </span>
                        {item.fieldOfStudy && (
                          <span
                            style={{ color: '#334155' }}
                            className="text-xs font-medium"
                          >
                            in {item.fieldOfStudy}
                          </span>
                        )}
                        {item.institution && (
                          <span
                            style={{ color: accentColor }}
                            className="font-semibold text-xs"
                          >
                            • {item.institution}
                          </span>
                        )}
                      </div>
                      {(item.startDate || item.endDate) && (
                        <span
                          style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap border border-slate-200"
                        >
                          {item.startDate} {item.endDate ? `— ${item.endDate}` : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                      {item.grade && (
                        <span
                          style={{ color: '#0f172a', backgroundColor: '#e2e8f0' }}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-300"
                        >
                          Grade / GPA: {item.grade}
                        </span>
                      )}
                      {item.location && (
                        <span
                          style={{ color: '#64748b' }}
                          className={`${textSmallClass}`}
                        >
                          {item.location}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p
                        style={{ color: '#475569' }}
                        className={`mt-1 ${textSmallClass} leading-relaxed`}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );

        case 'skills':
          if (!skills || skills.length === 0) return null;
          return (
            <section key="skills" className="section-block">
              {renderHeading('Skills & Technical Proficiencies')}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      borderColor: `${accentColor}30`,
                      backgroundColor:
                        template === 'modern' || template === 'professional'
                          ? `${accentColor}0e`
                          : '#f1f5f9',
                      color: '#0f172a',
                    }}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border shadow-2xs transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          );

        case 'projects':
          if (!projects || projects.length === 0) return null;
          return (
            <section key="projects" className="section-block">
              {renderHeading('Projects & Key Deliverables')}
              <div className={itemSpacing}>
                {projects.map((item) => (
                  <div key={item.id} className="item-block">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          style={{ color: '#0f172a' }}
                          className={`font-bold ${titleClass}`}
                        >
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span
                            style={{ color: '#475569' }}
                            className="text-xs italic"
                          >
                            ({item.subtitle})
                          </span>
                        )}
                        {item.link && (
                          <a
                            href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: accentColor }}
                            className={`${textSmallClass} underline font-mono hover:opacity-80`}
                          >
                            {item.link}
                          </a>
                        )}
                      </div>
                      {(item.startDate || item.endDate) && (
                        <span
                          style={{ color: '#64748b' }}
                          className={`${textSmallClass} font-medium whitespace-nowrap`}
                        >
                          {item.startDate} {item.endDate ? `— ${item.endDate}` : ''}
                        </span>
                      )}
                    </div>
                    {item.techStack && item.techStack.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Tech:
                        </span>
                        {item.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-[10.5px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.bulletPoints && item.bulletPoints.length > 0 && (
                      <ul
                        style={{ color: '#334155' }}
                        className={`mt-1.5 space-y-1 ${textBaseClass} leading-relaxed pl-1`}
                      >
                        {item.bulletPoints
                          .filter((bp) => bp && bp.trim())
                          .map((bp, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span
                                style={{ color: accentColor }}
                                className="mt-1 text-[10px] shrink-0 leading-none"
                              >
                                ▸
                              </span>
                              <span className="flex-1 leading-snug">{bp}</span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );

        case 'certifications':
          if (!certifications || certifications.length === 0) return null;
          return (
            <section key="certifications" className="section-block">
              {renderHeading('Certifications & Credentials', <Award className="w-3.5 h-3.5" />)}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                {certifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-xs text-slate-900 leading-tight">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {item.issuer}
                      </p>
                    </div>
                    {item.issueDate && (
                      <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                        {item.issueDate}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );

        case 'achievements':
          if (!achievements || achievements.length === 0) return null;
          return (
            <section key="achievements" className="section-block">
              {renderHeading('Key Achievements & Honors')}
              <div className={itemSpacing}>
                {achievements.map((item) => (
                  <div key={item.id} className="item-block">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {item.title}
                      </span>
                      {item.date && (
                        <span className="text-[10.5px] text-slate-500 font-medium">
                          {item.date}
                        </span>
                      )}
                    </div>
                    <p className={`mt-0.5 text-slate-600 ${textSmallClass} leading-relaxed`}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );

        case 'languages':
          if (!languages || languages.length === 0) return null;
          return (
            <section key="languages" className="section-block">
              {renderHeading('Languages')}
              <div className="flex flex-wrap gap-2 mt-1.5">
                {languages.map((item) => (
                  <div
                    key={item.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs"
                  >
                    <span className="font-bold text-slate-800">{item.language}</span>
                    <span className="text-[10.5px] text-slate-500">• {item.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          );

        default:
          return null;
      }
    };

    // Determine if the resume has any input at all
    const isEmptyResume =
      !contact.fullName?.trim() &&
      !contact.jobTitle?.trim() &&
      !contact.email?.trim() &&
      !contact.phone?.trim() &&
      !contact.location?.trim() &&
      !professionalSummary?.trim() &&
      (!education || education.length === 0) &&
      (!skills || skills.length === 0) &&
      (!experience || experience.length === 0) &&
      (!projects || projects.length === 0) &&
      (!certifications || certifications.length === 0) &&
      (!achievements || achievements.length === 0) &&
      (!languages || languages.length === 0);

    if (isEmptyResume) {
      return (
        <div
          ref={ref}
          id="resume-export-target"
          style={{
            transform: scale !== 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top center',
            width: '794px',
            minHeight: '1123px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
          }}
          className={`resume-document shadow-2xl mx-auto rounded-none print:shadow-none print:m-0 print:w-full print:min-h-0 ${fontClass} p-12 flex flex-col items-center justify-center text-center`}
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">
            Upload your resume PDF to get started.
          </h2>
          <p className="text-xs text-slate-500 max-w-sm">
            Upload your existing PDF resume or fill in your details on the left to see your formatted resume live.
          </p>
        </div>
      );
    }

    // Photo alignment
    const photoPos = contact.photoPosition || 'right';
    const isPhotoCenter = photoPos === 'center';
    const isPhotoLeft = photoPos === 'left';

    // Photo element
    const renderPhoto = () => {
      if (!contact.showPhoto || !contact.photoUrl) return null;
      const shapeClass =
        contact.photoShape === 'square'
          ? 'rounded-md'
          : contact.photoShape === 'rounded'
          ? 'rounded-2xl'
          : 'rounded-full';

      return (
        <div className="shrink-0">
          <img
            src={contact.photoUrl}
            alt={contact.fullName || 'Profile'}
            style={{
              borderColor: accentColor,
            }}
            className={`w-24 h-24 sm:w-26 sm:h-26 object-cover border-2 shadow-md ${shapeClass}`}
          />
        </div>
      );
    };

    return (
      <div
        ref={ref}
        id="resume-export-target"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          width: '794px', // Exactly 210mm at 96 DPI (ISO standard A4)
          minHeight: '1123px', // Exactly 297mm at 96 DPI
          backgroundColor: '#ffffff',
          color: '#0f172a',
        }}
        className={`resume-document shadow-2xl mx-auto rounded-none print:shadow-none print:m-0 print:w-full print:min-h-0 ${fontClass} ${spacingPadding}`}
      >
        {/* TOP ACCENT BAR FOR MODERN & PROFESSIONAL */}
        {template === 'modern' && (
          <div
            style={{ backgroundColor: accentColor }}
            className="h-2 -mx-10 sm:-mx-11 -mt-10 sm:-mt-11 mb-6"
          />
        )}
        {template === 'professional' && (
          <div
            style={{
              background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}40 100%)`,
            }}
            className="h-1.5 -mx-10 sm:-mx-11 -mt-10 sm:-mt-11 mb-6"
          />
        )}

        {/* 1. EXECUTIVE TEMPLATE: MODERN DARK HEADER LAYOUT */}
        {template === 'executive' ? (
          <div
            style={{
              backgroundColor: '#0A1226',
              borderBottom: `4px solid ${accentColor}`,
            }}
            className="-mx-10 sm:-mx-11 -mt-10 sm:-mt-11 mb-6 p-7 sm:p-8 text-white shadow-md"
          >
            <div
              className={`flex ${
                isPhotoCenter
                  ? 'flex-col items-center text-center gap-4'
                  : isPhotoLeft
                  ? 'flex-row-reverse items-center justify-end gap-6'
                  : 'items-center justify-between gap-6'
              }`}
            >
              <div className="flex-1 space-y-2">
                <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-white/10 text-white/90 border border-white/15">
                  Executive Profile
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  {contact.fullName || 'Your Name'}
                </h1>
                {contact.jobTitle && (
                  <p
                    style={{ color: accentColor }}
                    className="text-xs sm:text-sm font-bold tracking-wider uppercase"
                  >
                    {contact.jobTitle}
                  </p>
                )}

                {/* Executive Contact Strip with dark badges */}
                <div
                  className={`flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] pt-1.5 font-medium ${
                    isPhotoCenter ? 'justify-center' : ''
                  }`}
                >
                  {contact.email && (
                    <span className="flex items-center gap-1.5 bg-white/10 border border-white/10 px-2.5 py-1 rounded-md text-slate-200">
                      <Mail style={{ color: accentColor }} className="w-3.5 h-3.5 shrink-0" />
                      <a href={`mailto:${contact.email}`} className="hover:text-white">
                        {contact.email}
                      </a>
                    </span>
                  )}
                  {contact.phone && (
                    <span className="flex items-center gap-1.5 bg-white/10 border border-white/10 px-2.5 py-1 rounded-md text-slate-200">
                      <Phone style={{ color: accentColor }} className="w-3.5 h-3.5 shrink-0" />
                      <span>{contact.phone}</span>
                    </span>
                  )}
                  {contact.location && (
                    <span className="flex items-center gap-1.5 bg-white/10 border border-white/10 px-2.5 py-1 rounded-md text-slate-200">
                      <MapPin style={{ color: accentColor }} className="w-3.5 h-3.5 shrink-0" />
                      <span>{contact.location}</span>
                    </span>
                  )}
                  {contact.linkedin && (
                    <span className="flex items-center gap-1.5 bg-white/10 border border-white/10 px-2.5 py-1 rounded-md text-slate-200">
                      <Linkedin style={{ color: accentColor }} className="w-3.5 h-3.5 shrink-0" />
                      <a
                        href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white"
                      >
                        LinkedIn
                      </a>
                    </span>
                  )}
                  {contact.github && (
                    <span className="flex items-center gap-1.5 bg-white/10 border border-white/10 px-2.5 py-1 rounded-md text-slate-200">
                      <Github style={{ color: accentColor }} className="w-3.5 h-3.5 shrink-0" />
                      <a
                        href={contact.github.startsWith('http') ? contact.github : `https://${contact.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white"
                      >
                        GitHub
                      </a>
                    </span>
                  )}
                  {contact.portfolio && (
                    <span className="flex items-center gap-1.5 bg-white/10 border border-white/10 px-2.5 py-1 rounded-md text-slate-200">
                      <Globe style={{ color: accentColor }} className="w-3.5 h-3.5 shrink-0" />
                      <a
                        href={contact.portfolio.startsWith('http') ? contact.portfolio : `https://${contact.portfolio}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white"
                      >
                        Portfolio
                      </a>
                    </span>
                  )}
                </div>
              </div>

              {/* Candidate photo */}
              {renderPhoto()}
            </div>
          </div>
        ) : (
          /* 2. STANDARD / MODERN / CLASSIC / MINIMAL / PROFESSIONAL HEADER */
          <header
            style={{ borderBottomColor: '#e2e8f0' }}
            className={`border-b pb-4 ${isPhotoCenter ? 'text-center' : ''}`}
          >
            <div
              className={`flex ${
                isPhotoCenter
                  ? 'flex-col items-center gap-3'
                  : isPhotoLeft
                  ? 'flex-row-reverse items-start justify-end gap-6'
                  : 'items-start justify-between gap-6'
              }`}
            >
              <div className="flex-1 space-y-1">
                <h1
                  style={{
                    color:
                      template === 'modern' || template === 'professional'
                        ? accentColor
                        : '#0f172a',
                  }}
                  className="text-2xl sm:text-3xl font-black tracking-tight leading-tight"
                >
                  {contact.fullName || 'Your Name'}
                </h1>
                {contact.jobTitle && (
                  <p
                    style={{ color: '#475569' }}
                    className="text-xs sm:text-sm font-semibold tracking-wider uppercase"
                  >
                    {contact.jobTitle}
                  </p>
                )}

                {/* Contact item row with icons and responsive wrapping */}
                <div
                  style={{ color: '#475569' }}
                  className={`flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[11px] pt-2 font-medium ${
                    isPhotoCenter ? 'justify-center' : ''
                  }`}
                >
                  {contact.email && (
                    <span className="flex items-center gap-1">
                      <Mail style={{ color: accentColor }} className="w-3.5 h-3.5 shrink-0" />
                      <a
                        href={`mailto:${contact.email}`}
                        style={{ color: '#475569' }}
                        className="hover:underline"
                      >
                        {contact.email}
                      </a>
                    </span>
                  )}
                  {contact.phone && (
                    <span className="flex items-center gap-1">
                      <Phone style={{ color: accentColor }} className="w-3.5 h-3.5 shrink-0" />
                      <span style={{ color: '#475569' }}>{contact.phone}</span>
                    </span>
                  )}
                  {contact.location && (
                    <span className="flex items-center gap-1">
                      <MapPin style={{ color: accentColor }} className="w-3.5 h-3.5 shrink-0" />
                      <span style={{ color: '#475569' }}>{contact.location}</span>
                    </span>
                  )}
                  {contact.linkedin && (
                    <span className="flex items-center gap-1">
                      <Linkedin style={{ color: accentColor }} className="w-3.5 h-3.5 shrink-0" />
                      <span style={{ color: '#475569' }}>{contact.linkedin}</span>
                    </span>
                  )}
                  {contact.github && (
                    <span className="flex items-center gap-1">
                      <Github style={{ color: accentColor }} className="w-3.5 h-3.5 shrink-0" />
                      <span style={{ color: '#475569' }}>{contact.github}</span>
                    </span>
                  )}
                  {contact.portfolio && (
                    <span className="flex items-center gap-1">
                      <Globe style={{ color: accentColor }} className="w-3.5 h-3.5 shrink-0" />
                      <span style={{ color: '#475569' }}>{contact.portfolio}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Photo */}
              {renderPhoto()}
            </div>
          </header>
        )}

        {/* SECTION BLOCKS IN CUSTOM ORDER */}
        <div className="space-y-4 pt-1">
          {sectionOrder.map((secKey) => renderSection(secKey))}

          {/* Render any Custom Sections */}
          {customSections &&
            customSections.map((sec) => (
              <section key={sec.id} className="section-block">
                {renderHeading(sec.title)}
                <ul
                  style={{ color: '#334155' }}
                  className={`mt-1 list-disc list-inside space-y-0.5 ${textBaseClass} leading-normal pl-1`}
                >
                  {sec.items.map((item, i) => (
                    <li key={i} className="leading-snug">
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      </div>
    );
  }
);

ResumePreview.displayName = 'ResumePreview';
