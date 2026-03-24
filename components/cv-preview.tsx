import React, { forwardRef } from 'react';
import { Mail, Phone, MapPin, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ResumeData {
  id?: string;
  personal_info: {
    name: string;
    email: string;
    phone: string;
    location: string;
    links: string[];
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    highlights: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: {
    technical: Array<{
      name: string;
      level: number;
    }>;
    soft: string[];
  };
  languages: string[];
  certifications?: string[];
  projects?: Array<{
    title: string;
    description: string;
    link?: string;
  }>;
  volunteer?: Array<{
    role: string;
    organization: string;
    duration: string;
    highlights: string[];
  }>;
  awards?: string[];
  memberships?: string[];
  headline?: string;
}

export type ResumeTheme = 'professional' | 'modern' | 'minimalist' | 'islamic' | 'creative' | 'executive' | 'canva_sidebar' | 'canva_elegant' | 'canva_tech' | 'canva_bold';

export const CVPreview = forwardRef<HTMLDivElement, { data: ResumeData; isGhost?: boolean; theme?: ResumeTheme }>(
  ({ data, isGhost = false, theme = 'professional' }, ref) => {
    if (!data) return null;

    // Calculate ATS Score Mockup
    const calculateATSScore = () => {
      let score = 0;
      if (data.personal_info.name && data.personal_info.name !== 'N/A') score += 10;
      if (data.personal_info.email && data.personal_info.email !== 'N/A') score += 5;
      if (data.personal_info.phone && data.personal_info.phone !== 'N/A') score += 5;
      if (data.personal_info.links && data.personal_info.links.filter(l => l && l !== 'N/A').length > 0) score += 5;
      if (data.summary && data.summary !== 'N/A') {
        if (data.summary.length > 150) score += 15;
        else if (data.summary.length > 50) score += 10;
      }
      if (data.experience && data.experience.length > 0) {
        score += 20; // Base score for having experience
        const totalHighlights = data.experience.reduce((acc, exp) => acc + (exp.highlights?.length || 0), 0);
        if (totalHighlights >= 10) score += 20;
        else if (totalHighlights >= 5) score += 10;
      }
      if (data.skills.technical.length >= 8) score += 10;
      else if (data.skills.technical.length >= 3) score += 5;
      
      if (data.education.length > 0) score += 10;
      return Math.min(score, 100);
    };

    const atsScore = calculateATSScore();

    // Theme-specific styles
    const themeStyles: Record<ResumeTheme, { 
      container: string; 
      header: string; 
      sectionHeader: string; 
      accent: string;
      font: string;
      itemTitle: string;
      sidebar?: string;
      divider?: string;
    }> = {
      professional: {
        container: "bg-white text-gray-800",
        header: "border-b-2 border-slate-900 pb-6 mb-8 text-center",
        sectionHeader: "text-lg font-bold uppercase text-slate-900 mb-2 mt-8",
        accent: "text-indigo-700",
        font: "font-sans",
        itemTitle: "font-bold",
        divider: "border-t border-slate-200 my-6"
      },
      modern: {
        container: "bg-white text-slate-800",
        header: "bg-slate-900 text-white p-10 -mx-[20mm] -mt-[20mm] mb-10",
        sectionHeader: "text-sm font-black uppercase tracking-widest text-slate-400 mb-4 mt-10 flex items-center gap-2 after:content-[''] after:h-[1px] after:flex-grow after:bg-slate-100",
        accent: "text-blue-600",
        font: "font-sans",
        itemTitle: "font-black text-slate-900",
        divider: "border-t border-slate-50 my-8"
      },
      minimalist: {
        container: "bg-white text-zinc-700",
        header: "mb-16",
        sectionHeader: "text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 mb-6 mt-12",
        accent: "text-zinc-900",
        font: "font-light",
        itemTitle: "font-medium text-zinc-900",
        divider: "h-[1px] bg-zinc-100 my-10"
      },
      islamic: {
        container: "bg-[#fdfcf0] text-[#3d3d3d] relative overflow-hidden",
        header: "border-b-4 border-[#c5a059] pb-8 mb-10 text-center relative z-10",
        sectionHeader: "text-xl font-serif italic text-[#1b4332] border-l-4 border-[#c5a059] pl-3 mb-6 mt-10 bg-[#f4f1de]/50 py-2",
        accent: "text-[#c5a059]",
        font: "font-serif",
        itemTitle: "font-bold text-[#1b4332]",
        divider: "border-t-2 border-[#c5a059]/20 my-8"
      },
      creative: {
        container: "bg-white text-gray-900",
        header: "flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6",
        sectionHeader: "text-2xl font-black italic -rotate-1 origin-left mb-8 mt-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600",
        accent: "text-pink-600",
        font: "font-sans",
        itemTitle: "font-extrabold text-gray-900",
        divider: "h-1 bg-gradient-to-r from-purple-100 to-pink-100 my-10 rounded-full"
      },
      executive: {
        container: "bg-[#fcfcfc] text-[#2c3e50]",
        header: "border-l-[16px] border-[#1a365d] pl-10 py-6 mb-12 bg-white shadow-sm",
        sectionHeader: "text-base font-bold tracking-tight text-white bg-[#1a365d] px-4 py-2 mb-6 mt-10 uppercase",
        accent: "text-[#1a365d]",
        font: "font-serif",
        itemTitle: "font-bold text-[#1a365d]",
        divider: "border-t border-slate-200 my-8"
      },
      canva_sidebar: {
        container: "bg-white text-slate-700 flex flex-row p-0",
        header: "mb-10",
        sectionHeader: "text-sm font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-100 pb-2 mb-6 mt-10",
        accent: "text-indigo-600",
        font: "font-sans",
        itemTitle: "font-bold text-slate-900",
        sidebar: "w-[35%] bg-slate-900 text-slate-300 p-10 min-h-full",
        divider: "border-t border-slate-100 my-8"
      },
      canva_elegant: {
        container: "bg-[#fffdfa] text-[#4a3728]",
        header: "text-center mb-16 border-double border-b-4 border-[#d7ccc8] pb-10",
        sectionHeader: "text-lg font-serif italic text-[#6d4c41] text-center mb-8 mt-12 after:content-[''] after:block after:w-16 after:h-[1px] after:bg-[#d7ccc8] after:mx-auto after:mt-3",
        accent: "text-[#8d6e63]",
        font: "font-serif",
        itemTitle: "font-bold text-[#3e2723]",
        divider: "border-t border-[#efebe9] my-10"
      },
      canva_tech: {
        container: "bg-[#020617] text-slate-400",
        header: "border-l-8 border-cyan-500 pl-10 mb-16 py-4",
        sectionHeader: "text-xs font-mono font-bold uppercase tracking-[0.4em] text-cyan-500 mb-8 mt-16 flex items-center gap-4 before:content-['//']",
        accent: "text-cyan-400",
        font: "font-mono",
        itemTitle: "font-bold text-white",
        divider: "border-t border-slate-800 my-12"
      },
      canva_bold: {
        container: "bg-white text-black",
        header: "mb-20 border-b-[16px] border-black pb-10",
        sectionHeader: "text-5xl font-black uppercase tracking-tighter mb-10 mt-20",
        accent: "text-red-600",
        font: "font-sans",
        itemTitle: "font-black text-3xl uppercase tracking-tight",
        divider: "h-2 bg-black my-12"
      }
    };

    const currentTheme = themeStyles[theme];

    // Helper to render content sections
    const renderSections = (isSidebar = false) => (
      <>
        {/* Summary */}
        {(!isSidebar || theme !== 'canva_sidebar') && (
          <section className="break-inside-avoid">
            <h2 className={currentTheme.sectionHeader}>Professional Summary</h2>
            <p className="text-justify leading-relaxed text-sm md:text-base">{data.summary || 'N/A'}</p>
            {currentTheme.divider && <div className={currentTheme.divider} />}
          </section>
        )}

        {/* Experience */}
        {(!isSidebar || theme !== 'canva_sidebar') && (
          <section>
            <h2 className={currentTheme.sectionHeader}>Experience</h2>
            {data.experience && data.experience.length > 0 ? (
              data.experience.map((job, index) => (
                <div key={index} className="mb-8 break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className={`${currentTheme.itemTitle} ${theme === 'canva_bold' ? 'text-2xl' : 'text-lg'}`}>{job.title}</span>
                    <span className="text-gray-500 italic text-sm">{job.duration}</span>
                  </div>
                  <div className={`${currentTheme.accent} font-bold mb-3 text-sm uppercase tracking-wide`}>{job.company}</div>
                  {job.highlights && job.highlights.length > 0 && (
                    <ul className="space-y-2">
                      {job.highlights.map((point, i) => (
                        <li key={i} className="text-sm flex gap-3 leading-relaxed">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${theme === 'canva_tech' ? 'bg-cyan-500' : theme === 'canva_bold' ? 'bg-black' : 'bg-slate-300'}`} />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p className="italic text-gray-400">No experience listed.</p>
            )}
            {currentTheme.divider && <div className={currentTheme.divider} />}
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className="break-inside-avoid">
            <h2 className={currentTheme.sectionHeader}>Projects</h2>
            {data.projects.map((proj, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-baseline">
                  <span className={currentTheme.itemTitle}>{proj.title}</span>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className={`text-xs ${currentTheme.accent} hover:underline font-bold`}>
                      {proj.link.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{proj.description}</p>
              </div>
            ))}
            {currentTheme.divider && <div className={currentTheme.divider} />}
          </section>
        )}

        {/* Education */}
        <section className="break-inside-avoid">
          <h2 className={currentTheme.sectionHeader}>Education</h2>
          {data.education && data.education.length > 0 ? (
            data.education.map((edu, index) => (
              <div key={index} className="mb-6 flex justify-between items-start">
                <div>
                  <div className={currentTheme.itemTitle}>{edu.degree}</div>
                  <div className={`text-sm mt-1 ${theme === 'canva_tech' ? 'text-slate-500' : 'text-gray-600'}`}>{edu.institution}</div>
                </div>
                <div className="text-gray-500 italic text-sm">{edu.year}</div>
              </div>
            ))
          ) : (
            <p className="italic text-gray-400">No education listed.</p>
          )}
          {currentTheme.divider && <div className={currentTheme.divider} />}
        </section>

        {/* Volunteer Work */}
        {data.volunteer && data.volunteer.length > 0 && (
          <section className="break-inside-avoid">
            <h2 className={currentTheme.sectionHeader}>Volunteer Work</h2>
            {data.volunteer.map((vol, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-baseline">
                  <span className={currentTheme.itemTitle}>{vol.role}</span>
                  <span className="text-gray-500 italic text-sm">{vol.duration}</span>
                </div>
                <div className={`${currentTheme.accent} text-sm font-bold mt-1 uppercase tracking-wider`}>{vol.organization}</div>
                {vol.highlights && vol.highlights.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {vol.highlights.map((point, i) => (
                      <li key={i} className="text-xs text-gray-600 flex gap-2">
                        <span className="text-slate-300">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {currentTheme.divider && <div className={currentTheme.divider} />}
          </section>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <section className="break-inside-avoid">
            <h2 className={currentTheme.sectionHeader}>Certifications</h2>
            <ul className="space-y-2">
              {data.certifications.map((cert, index) => (
                <li key={index} className="text-sm flex gap-3">
                  <span className="text-slate-300">★</span>
                  {cert}
                </li>
              ))}
            </ul>
            {currentTheme.divider && <div className={currentTheme.divider} />}
          </section>
        )}

        {/* Awards */}
        {data.awards && data.awards.length > 0 && (
          <section className="break-inside-avoid">
            <h2 className={currentTheme.sectionHeader}>Awards & Honors</h2>
            <ul className="space-y-2">
              {data.awards.map((award, index) => (
                <li key={index} className="text-sm flex gap-3">
                  <span className="text-slate-300">🏆</span>
                  {award}
                </li>
              ))}
            </ul>
            {currentTheme.divider && <div className={currentTheme.divider} />}
          </section>
        )}

        {/* Memberships */}
        {data.memberships && data.memberships.length > 0 && (
          <section className="break-inside-avoid">
            <h2 className={currentTheme.sectionHeader}>Professional Memberships</h2>
            <ul className="space-y-2">
              {data.memberships.map((membership, index) => (
                <li key={index} className="text-sm flex gap-3">
                  <span className="text-slate-300">👥</span>
                  {membership}
                </li>
              ))}
            </ul>
            {currentTheme.divider && <div className={currentTheme.divider} />}
          </section>
        )}

        {/* Skills */}
        <section className="break-inside-avoid">
          <h2 className={currentTheme.sectionHeader}>Skills & Expertise</h2>
          <div className={theme === 'canva_sidebar' ? 'space-y-8' : 'grid grid-cols-1 md:grid-cols-2 gap-10'}>
            <div>
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Technical Proficiency</h3>
              <div className="space-y-4">
                {data.skills?.technical && data.skills.technical.length > 0 ? (
                  data.skills.technical.map((skill, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className={theme === 'canva_tech' ? 'text-white' : 'text-slate-700'}>{skill.name}</span>
                        <span className={currentTheme.accent}>{skill.level}%</span>
                      </div>
                      <div className={`h-1.5 w-full rounded-full ${theme === 'canva_tech' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${theme === 'canva_tech' ? 'bg-cyan-500' : theme === 'canva_bold' ? 'bg-black' : 'bg-indigo-600'}`}
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="italic text-gray-400">No technical skills listed.</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Soft Skills & Languages</h3>
              <div className="flex flex-wrap gap-2">
                {data.skills?.soft?.map((skill, index) => (
                  <span key={index} className={`text-xs font-bold px-3 py-1 rounded-full ${theme === 'canva_tech' ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'} border border-slate-100`}>
                    {skill}
                  </span>
                ))}
                {data.languages?.map((lang, index) => (
                  <span key={index} className={`text-xs font-black uppercase tracking-tighter px-3 py-1 rounded-full ${theme === 'canva_tech' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-indigo-50 text-indigo-700'}`}>
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* References Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-100 text-center break-inside-avoid">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">References available upon request</p>
        </footer>
      </>
    );

    return (
      <div className="flex flex-col items-center gap-6 w-full">
        {/* ATS Score Indicator */}
        {!isGhost && (
          <div className="w-full max-w-[210mm] bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm print:hidden">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${atsScore > 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ATS Optimization Score</p>
                <p className="text-lg font-bold text-slate-900">{atsScore}/100</p>
              </div>
            </div>
            <div className="flex gap-2">
              {atsScore < 90 && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Add more highlights for 100%
                </span>
              )}
            </div>
          </div>
        )}

        {/* A4 Page Container */}
        <div 
          ref={ref}
          className={`w-full max-w-[210mm] bg-white shadow-2xl print:shadow-none print:p-0 print:max-w-none print:w-full print:bg-white relative transition-all duration-300 ${currentTheme.container} ${currentTheme.font} ${isGhost ? 'border-2 border-dashed border-amber-200' : ''} ${theme !== 'canva_sidebar' ? 'p-[20mm]' : ''}`}
          style={{ minHeight: '297mm' }}
        >
          {theme === 'canva_sidebar' ? (
            <>
              {/* Sidebar Layout */}
              <div className={currentTheme.sidebar}>
                <div className="mb-12">
                  <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{data.personal_info.name}</h1>
                  <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest leading-tight">{data.headline || data.experience[0]?.title || 'Professional'}</p>
                </div>
                
                <div className="space-y-10">
                  <section>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Contact</h3>
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center gap-4">
                        <div className="p-1.5 bg-slate-800 rounded-lg"><Mail className="w-3 h-3 text-indigo-400" /></div>
                        <span className="break-all">{data.personal_info.email}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-1.5 bg-slate-800 rounded-lg"><Phone className="w-3 h-3 text-indigo-400" /></div>
                        <span>{data.personal_info.phone}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-1.5 bg-slate-800 rounded-lg"><MapPin className="w-3 h-3 text-indigo-400" /></div>
                        <span>{data.personal_info.location}</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Summary</h3>
                    <p className="text-xs leading-relaxed text-slate-400 text-justify">{data.summary}</p>
                  </section>

                  {/* QR Code Placeholder */}
                  <section className="pt-10 flex flex-col items-center gap-3">
                    <div className="w-24 h-24 bg-white p-2 rounded-xl">
                      <div className="w-full h-full border-4 border-slate-900 flex items-center justify-center text-[8px] font-black text-slate-900 text-center uppercase">
                        Portfolio<br/>QR Code
                      </div>
                    </div>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Scan to view portfolio</p>
                  </section>

                  {renderSections(true)}
                </div>
              </div>
              
              <div className="flex-grow p-16 bg-white">
                {/* Main Content for Sidebar Theme */}
                <section>
                  <h2 className={currentTheme.sectionHeader}>Experience</h2>
                  {data.experience && data.experience.length > 0 ? (
                    data.experience.map((job, index) => (
                      <div key={index} className="mb-10 break-inside-avoid">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-black text-slate-900 text-xl uppercase tracking-tight">{job.title}</span>
                          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{job.duration}</span>
                        </div>
                        <div className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-4">{job.company}</div>
                        {job.highlights && job.highlights.length > 0 && (
                          <ul className="space-y-3">
                            {job.highlights.map((point, i) => (
                              <li key={i} className="text-sm text-slate-600 flex gap-4 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-100 mt-1.5 flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="italic text-gray-400">No experience listed.</p>
                  )}
                </section>
              </div>
            </>
          ) : (
            <>
              {/* Standard Layouts */}
              {theme === 'islamic' && (
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30-15 30-15-30z' fill='%231b4332' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />
              )}

              {isGhost && (
                <div className="absolute top-4 right-4 z-20 print:hidden" data-html2canvas-ignore="true">
                  <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm border border-amber-200">
                    <AlertCircle className="w-3 h-3" />
                    Draft: Missing Summary
                  </div>
                </div>
              )}

              <header className={`${currentTheme.header} relative z-10`}>
                {theme === 'creative' ? (
                  <>
                    <div className="flex-grow">
                      <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">{data.personal_info?.name || 'Your Name'}</h1>
                      <p className="text-xl font-black text-slate-400 mt-3 uppercase tracking-widest">{data.headline || data.experience[0]?.title || 'Professional'}</p>
                    </div>
                    <div className="text-right text-xs font-bold space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-end gap-3"><span className="text-slate-400">{data.personal_info.email}</span><Mail className="w-4 h-4 text-pink-600" /></div>
                      <div className="flex items-center justify-end gap-3"><span className="text-slate-400">{data.personal_info.phone}</span><Phone className="w-4 h-4 text-pink-600" /></div>
                      <div className="flex items-center justify-end gap-3"><span className="text-slate-400">{data.personal_info.location}</span><MapPin className="w-4 h-4 text-pink-600" /></div>
                    </div>
                  </>
                ) : theme === 'canva_tech' ? (
                  <>
                    <h1 className="text-6xl font-mono font-black text-white tracking-tighter mb-4">{data.personal_info.name}</h1>
                    <p className="text-cyan-500 font-mono text-sm mb-8 uppercase tracking-[0.4em] font-bold">{data.headline || data.experience[0]?.title || 'Professional'}</p>
                    <div className="flex flex-wrap gap-8 text-xs font-mono text-slate-500">
                      <div className="flex items-center gap-3"><Mail className="w-3 h-3 text-cyan-500" />{data.personal_info.email}</div>
                      <div className="flex items-center gap-3"><Phone className="w-3 h-3 text-cyan-500" />{data.personal_info.phone}</div>
                      <div className="flex items-center gap-3"><MapPin className="w-3 h-3 text-cyan-500" />{data.personal_info.location}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className={`${theme === 'modern' ? 'text-5xl' : theme === 'canva_bold' ? 'text-8xl' : 'text-4xl'} font-black tracking-tighter uppercase mb-2`}>{data.personal_info?.name || 'Your Name'}</h1>
                    <p className={`text-lg font-bold mb-6 uppercase tracking-widest ${theme === 'modern' ? 'text-blue-400' : theme === 'canva_bold' ? 'text-red-600' : 'text-slate-500'}`}>{data.headline || data.experience[0]?.title || 'Professional'}</p>
                    <div className={`flex flex-wrap justify-center gap-8 ${theme === 'modern' ? 'text-slate-400' : 'text-slate-600'} font-bold text-xs uppercase tracking-widest`}>
                      <div className="flex items-center gap-2"><MapPin className={`w-3 h-3 ${currentTheme.accent}`} />{data.personal_info?.location}</div>
                      <div className="flex items-center gap-2"><Phone className={`w-3 h-3 ${currentTheme.accent}`} />{data.personal_info?.phone}</div>
                      <div className="flex items-center gap-2"><Mail className={`w-3 h-3 ${currentTheme.accent}`} />{data.personal_info?.email}</div>
                    </div>
                  </>
                )}
                
                {data.personal_info?.links && data.personal_info.links.filter(l => l && l !== 'N/A').length > 0 && (
                  <div className={`mt-6 flex flex-wrap justify-center gap-6 ${theme === 'modern' ? 'text-blue-300' : currentTheme.accent} font-bold text-xs uppercase tracking-widest`}>
                    {data.personal_info.links.filter(l => l && l !== 'N/A').map((link, i) => (
                      <a key={i} href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                        <LinkIcon className="w-3 h-3" />
                        {link.replace(/^https?:\/\//, '')}
                      </a>
                    ))}
                  </div>
                )}
              </header>

              {renderSections()}
            </>
          )}
        </div>
      </div>
    );
  }
);


CVPreview.displayName = 'CVPreview';

