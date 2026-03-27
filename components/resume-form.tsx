import React from 'react';
import { ResumeData } from './cv-preview';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Code, Languages, Plus, Trash2, Sparkles } from 'lucide-react';

interface ResumeFormProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
}

export function ResumeForm({ data, onChange }: ResumeFormProps) {
  const updatePersonalInfo = (field: string, value: any) => {
    onChange({
      ...data,
      personal_info: { ...data.personal_info, [field]: value }
    });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const newExperience = [...data.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    onChange({ ...data, experience: newExperience });
  };

  const addExperience = () => {
    onChange({
      ...data,
      experience: [...data.experience, { title: '', company: '', duration: '', highlights: [] }]
    });
  };

  const removeExperience = (index: number) => {
    onChange({
      ...data,
      experience: data.experience.filter((_, i) => i !== index)
    });
  };

  const updateEducation = (index: number, field: string, value: any) => {
    const newEducation = [...data.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    onChange({ ...data, education: newEducation });
  };

  const addEducation = () => {
    onChange({
      ...data,
      education: [...data.education, { degree: '', institution: '', year: '' }]
    });
  };

  const removeEducation = (index: number) => {
    onChange({
      ...data,
      education: data.education.filter((_, i) => i !== index)
    });
  };

  const updateTechnicalSkill = (index: number, field: 'name' | 'level', value: any) => {
    const newTechnical = [...data.skills.technical];
    newTechnical[index] = { ...newTechnical[index], [field]: value };
    onChange({
      ...data,
      skills: { ...data.skills, technical: newTechnical }
    });
  };

  const addTechnicalSkill = () => {
    onChange({
      ...data,
      skills: {
        ...data.skills,
        technical: [...data.skills.technical, { name: '', level: 80 }]
      }
    });
  };

  const removeTechnicalSkill = (index: number) => {
    const newTechnical = data.skills.technical.filter((_, i) => i !== index);
    onChange({
      ...data,
      skills: { ...data.skills, technical: newTechnical }
    });
  };

  const updateSoftSkills = (value: string) => {
    const skillsArray = value.split(',').map(s => s.trim()).filter(s => s !== '');
    onChange({
      ...data,
      skills: { ...data.skills, soft: skillsArray }
    });
  };

  const updateLanguages = (value: string) => {
    const languagesArray = value.split(',').map(s => s.trim()).filter(s => s !== '');
    onChange({
      ...data,
      languages: languagesArray
    });
  };

  const getProficiencyLabel = (level: number) => {
    if (level < 30) return 'Beginner';
    if (level < 60) return 'Intermediate';
    if (level < 90) return 'Advanced';
    return 'Expert';
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Personal Info */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 uppercase tracking-wider">
          <User className="w-4 h-4 text-indigo-600" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Full Name</label>
            <input 
              type="text" 
              value={data.personal_info.name} 
              onChange={(e) => updatePersonalInfo('name', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Email</label>
            <input 
              type="email" 
              value={data.personal_info.email} 
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Phone</label>
            <input 
              type="text" 
              value={data.personal_info.phone} 
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Location</label>
            <input 
              type="text" 
              value={data.personal_info.location} 
              onChange={(e) => updatePersonalInfo('location', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Links (Comma separated)</label>
            <input 
              type="text" 
              value={data.personal_info.links.join(', ')} 
              onChange={(e) => updatePersonalInfo('links', e.target.value.split(',').map(s => s.trim()).filter(s => s !== ''))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Professional Headline</label>
            <input 
              type="text" 
              value={data.headline || ''} 
              onChange={(e) => onChange({ ...data, headline: e.target.value })}
              placeholder="e.g. Results-driven Sales Manager with 5+ years of experience..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 uppercase tracking-wider">
          <Briefcase className="w-4 h-4 text-indigo-600" />
          Professional Summary
        </h3>
        <textarea 
          value={data.summary} 
          onChange={(e) => onChange({ ...data, summary: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
        />
      </section>

      {/* Experience */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Experience
          </h3>
          <button onClick={addExperience} className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="space-y-6">
          {data.experience.map((exp, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
              <button 
                onClick={() => removeExperience(i)}
                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Job Title</label>
                  <input 
                    type="text" 
                    value={exp.title} 
                    onChange={(e) => updateExperience(i, 'title', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Company</label>
                  <input 
                    type="text" 
                    value={exp.company} 
                    onChange={(e) => updateExperience(i, 'company', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Duration</label>
                  <input 
                    type="text" 
                    value={exp.duration} 
                    onChange={(e) => updateExperience(i, 'duration', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Highlights (One per line)</label>
                <textarea 
                  value={exp.highlights.join('\n')} 
                  onChange={(e) => updateExperience(i, 'highlights', e.target.value.split('\n'))}
                  rows={3}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            Education
          </h3>
          <button onClick={addEducation} className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="space-y-4">
          {data.education.map((edu, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
              <button 
                onClick={() => removeEducation(i)}
                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Degree</label>
                  <input 
                    type="text" 
                    value={edu.degree} 
                    onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Institution</label>
                  <input 
                    type="text" 
                    value={edu.institution} 
                    onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Year</label>
                  <input 
                    type="text" 
                    value={edu.year} 
                    onChange={(e) => updateEducation(i, 'year', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 uppercase tracking-wider">
          <Code className="w-4 h-4 text-indigo-600" />
          Skills & Expertise
        </h3>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Technical Proficiency</label>
              <button 
                onClick={addTechnicalSkill}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Skill
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {data.skills.technical.map((skill, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 group relative">
                  <button 
                    onClick={() => removeTechnicalSkill(index)}
                    className="absolute -top-2 -right-2 p-1.5 bg-white text-rose-500 rounded-full shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="flex-grow space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Skill Name</label>
                    <input 
                      type="text" 
                      value={skill.name} 
                      onChange={(e) => updateTechnicalSkill(index, 'name', e.target.value)}
                      placeholder="e.g. React, Python, Excel"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="w-full md:w-56 space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Proficiency</label>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          skill.level < 30 ? 'bg-slate-100 text-slate-500' :
                          skill.level < 60 ? 'bg-blue-50 text-blue-600' :
                          skill.level < 90 ? 'bg-indigo-50 text-indigo-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {getProficiencyLabel(skill.level)}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600">{skill.level}%</span>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={skill.level} 
                      onChange={(e) => updateTechnicalSkill(index, 'level', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Soft Skills (Comma separated)
            </label>
            <textarea 
              value={data.skills.soft.join(', ')} 
              onChange={(e) => updateSoftSkills(e.target.value)}
              placeholder="e.g. Leadership, Communication, Problem Solving"
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Languages className="w-3 h-3" />
              Languages (Comma separated)
            </label>
            <textarea 
              value={data.languages.join(', ')} 
              onChange={(e) => updateLanguages(e.target.value)}
              placeholder="e.g. English, Urdu, Arabic"
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 uppercase tracking-wider">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          Certifications & Training
        </h3>
        <textarea 
          value={data.certifications?.join('\n') || ''} 
          onChange={(e) => onChange({ ...data, certifications: e.target.value.split('\n').filter(s => s.trim() !== '') })}
          placeholder="One certification per line..."
          rows={3}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
        />
      </section>

      {/* Projects */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <Code className="w-4 h-4 text-indigo-600" />
            Projects
          </h3>
          <button 
            onClick={() => onChange({ ...data, projects: [...(data.projects || []), { title: '', description: '', link: '' }] })}
            className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Project
          </button>
        </div>
        <div className="space-y-4">
          {data.projects?.map((proj, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
              <button 
                onClick={() => onChange({ ...data, projects: data.projects?.filter((_, idx) => idx !== i) })}
                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Project Title</label>
                  <input 
                    type="text" 
                    value={proj.title} 
                    onChange={(e) => {
                      const newProjs = [...(data.projects || [])];
                      newProjs[i].title = e.target.value;
                      onChange({ ...data, projects: newProjs });
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Link</label>
                  <input 
                    type="text" 
                    value={proj.link} 
                    onChange={(e) => {
                      const newProjs = [...(data.projects || [])];
                      newProjs[i].link = e.target.value;
                      onChange({ ...data, projects: newProjs });
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                  <textarea 
                    value={proj.description} 
                    onChange={(e) => {
                      const newProjs = [...(data.projects || [])];
                      newProjs[i].description = e.target.value;
                      onChange({ ...data, projects: newProjs });
                    }}
                    rows={2}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Volunteer Work */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <User className="w-4 h-4 text-indigo-600" />
            Volunteer Work
          </h3>
          <button 
            onClick={() => onChange({ ...data, volunteer: [...(data.volunteer || []), { role: '', organization: '', duration: '', highlights: [] }] })}
            className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Volunteer
          </button>
        </div>
        <div className="space-y-4">
          {data.volunteer?.map((vol, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
              <button 
                onClick={() => onChange({ ...data, volunteer: data.volunteer?.filter((_, idx) => idx !== i) })}
                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Role</label>
                  <input 
                    type="text" 
                    value={vol.role} 
                    onChange={(e) => {
                      const newVol = [...(data.volunteer || [])];
                      newVol[i].role = e.target.value;
                      onChange({ ...data, volunteer: newVol });
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Organization</label>
                  <input 
                    type="text" 
                    value={vol.organization} 
                    onChange={(e) => {
                      const newVol = [...(data.volunteer || [])];
                      newVol[i].organization = e.target.value;
                      onChange({ ...data, volunteer: newVol });
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Duration</label>
                  <input 
                    type="text" 
                    value={vol.duration} 
                    onChange={(e) => {
                      const newVol = [...(data.volunteer || [])];
                      newVol[i].duration = e.target.value;
                      onChange({ ...data, volunteer: newVol });
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Highlights (One per line)</label>
                <textarea 
                  value={vol.highlights.join('\n')} 
                  onChange={(e) => {
                    const newVol = [...(data.volunteer || [])];
                    newVol[i].highlights = e.target.value.split('\n');
                    onChange({ ...data, volunteer: newVol });
                  }}
                  rows={2}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Awards */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Awards & Honors
        </h3>
        <textarea 
          value={data.awards?.join('\n') || ''} 
          onChange={(e) => onChange({ ...data, awards: e.target.value.split('\n').filter(s => s.trim() !== '') })}
          placeholder="One award per line..."
          rows={3}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
        />
      </section>

      {/* Memberships */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 uppercase tracking-wider">
          <User className="w-4 h-4 text-indigo-600" />
          Professional Memberships
        </h3>
        <textarea 
          value={data.memberships?.join('\n') || ''} 
          onChange={(e) => onChange({ ...data, memberships: e.target.value.split('\n').filter(s => s.trim() !== '') })}
          placeholder="One membership per line..."
          rows={3}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
        />
      </section>
    </div>
  );
}
