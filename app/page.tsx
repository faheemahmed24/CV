'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { CVPreview, ResumeData, ResumeTheme } from '@/components/cv-preview';
import { ResumeForm } from '@/components/resume-form';
import { 
  Loader2, FileText, Code, LayoutTemplate, AlertCircle, 
  Printer, RefreshCw, MessageSquare, Sparkles, Wand2, 
  ChevronRight, ChevronLeft, Search, Target, CheckCircle2,
  Palette, Briefcase as BriefcaseIcon, GraduationCap, Languages,
  Download, Trash2, Plus
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType
} from 'docx';
import { saveAs } from 'file-saver';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  User,
  handleFirestoreError,
  OperationType
} from '@/firebase';

// Zod Schema for Validation
const ResumeZodSchema = z.object({
  personal_info: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    links: z.array(z.string())
  }),
  summary: z.string(),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    duration: z.string(),
    highlights: z.array(z.string())
  })),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.string()
  })),
  skills: z.object({
    technical: z.array(z.object({
      name: z.string(),
      level: z.number().min(0).max(100).default(80)
    })),
    soft: z.array(z.string())
  }),
  languages: z.array(z.string()),
  certifications: z.array(z.string()).optional().default([]),
  projects: z.array(z.object({
    title: z.string(),
    description: z.string(),
    link: z.string().optional()
  })).optional().default([]),
  volunteer: z.array(z.object({
    role: z.string(),
    organization: z.string(),
    duration: z.string(),
    highlights: z.array(z.string())
  })).optional().default([]),
  awards: z.array(z.string()).optional().default([]),
  memberships: z.array(z.string()).optional().default([]),
  headline: z.string().optional().default('')
});

const SYSTEM_PROMPT = `### SYSTEM_PROMPT: CV_ARCHITECT_ENGINE
Role: Expert ATS Resume Parser.

Task: Convert the provided raw, unstructured text into a professional, structured JSON object.

Instructions:
1. ENTITY EXTRACTION: Identify Name, Headline (a catchy professional title/value proposition), Email, Phone, Location, Summary, Experience, Education, Skills (with proficiency levels if mentioned), Languages, Certifications, Projects, Volunteer Work, Awards, and Professional Memberships.
2. STRICT VERBATIM: You MUST use the exact words, phrases, and sentences from the input text. Do NOT summarize, do NOT rephrase, do NOT "improve" the language, and do NOT add any words that are not in the source text.
3. NO ENHANCEMENTS: Do NOT add high-impact verbs, do NOT fix grammar, and do NOT change the tone. The output must be a direct reflection of the input.
4. STRUCTURE: Map the extracted text strictly to the provided JSON schema.
5. MISSING DATA: Use "N/A" for missing strings and an empty array [] for missing lists.

Output: Return ONLY valid JSON. No prose, no markdown formatting.`;

const RESUME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    personal_info: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        links: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          company: { type: Type.STRING },
          duration: { type: Type.STRING },
          highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          institution: { type: Type.STRING },
          year: { type: Type.STRING }
        }
      }
    },
    skills: {
      type: Type.OBJECT,
      properties: {
        technical: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              level: { type: Type.NUMBER, description: "Proficiency level from 0 to 100" }
            }
          } 
        },
        soft: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    languages: { type: Type.ARRAY, items: { type: Type.STRING } },
    certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          link: { type: Type.STRING }
        }
      }
    },
    volunteer: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          organization: { type: Type.STRING },
          duration: { type: Type.STRING },
          highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    awards: { type: Type.ARRAY, items: { type: Type.STRING } },
    memberships: { type: Type.ARRAY, items: { type: Type.STRING } },
    headline: { type: Type.STRING, description: "A catchy professional headline or value proposition" }
  }
};

const SUGGESTED_SKILLS_MAP: Record<string, string[]> = {
  'Software Engineer': ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'Git', 'SQL', 'Unit Testing', 'CI/CD'],
  'Web Developer': ['HTML5', 'CSS3', 'JavaScript', 'React', 'Next.js', 'Tailwind CSS', 'Responsive Design', 'Vercel', 'Firebase'],
  'Data Scientist': ['Python', 'R', 'SQL', 'Machine Learning', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'Data Visualization', 'Statistics'],
  'Product Manager': ['Agile', 'Scrum', 'Product Roadmap', 'User Research', 'A/B Testing', 'Jira', 'Stakeholder Management', 'Market Analysis'],
  'UX Designer': ['Figma', 'Adobe XD', 'User Research', 'Wireframing', 'Prototyping', 'User Flows', 'Visual Design', 'Accessibility'],
};

export default function ResumeParserApp() {
  const [rawText, setRawText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [feedback, setFeedback] = useState('');
  const [parsedData, setParsedData] = useState<ResumeData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [parsingStage, setParsingStage] = useState<'parsing' | 'tailoring' | 'idle'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'json'>('edit');
  const [showJDInput, setShowJDInput] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ResumeTheme>('professional');
  const [user, setUser] = useState<User | null>(null);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchSavedResumes(currentUser.uid);
      } else {
        setSavedResumes([]);
      }
    });
    return () => unsubscribe();
  }, [fetchSavedResumes]);

  const fetchSavedResumes = useCallback(async (userId: string) => {
    try {
      const q = query(
        collection(db, 'users', userId, 'resumes'),
        orderBy('updatedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const resumes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSavedResumes(resumes);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, `users/${userId}/resumes`);
      });
      
      return unsubscribe;
    } catch (err) {
      console.error('Error fetching resumes:', err);
    }
  }, []);

  const saveResume = useCallback(async (userId: string, data: ResumeData, forceNew = false) => {
    try {
      setIsSaving(true);
      
      let resumeId = activeResumeId;
      if (!resumeId || forceNew) {
        // Create new doc if no active ID or if we want a new version
        const newDocRef = doc(collection(db, 'users', userId, 'resumes'));
        resumeId = newDocRef.id;
        setActiveResumeId(resumeId);
      }

      const resumeDoc = doc(db, 'users', userId, 'resumes', resumeId);
      
      await setDoc(resumeDoc, {
        userId,
        data: { ...data, id: resumeId },
        updatedAt: new Date().toISOString(),
        name: data.personal_info.name || 'Untitled Resume'
      }, { merge: true });
      
    } catch (err) {
      console.error('Error saving resume:', err);
    } finally {
      setIsSaving(false);
    }
  }, [activeResumeId]);

  // Auto-save logic
  useEffect(() => {
    if (user && parsedData && !isParsing) {
      const timer = setTimeout(() => {
        saveResume(user.uid, parsedData);
      }, 2000); // Debounce save
      return () => clearTimeout(timer);
    }
  }, [parsedData, user, isParsing, saveResume]);

  const handleSaveAsNew = () => {
    if (user && parsedData) {
      saveResume(user.uid, parsedData, true);
    }
  };

  const loadResume = (resume: any) => {
    setParsedData(resume.data);
    setActiveResumeId(resume.id);
    setActiveTab('preview');
    setShowHistory(false);
  };

  const deleteResume = async (resumeId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'resumes', resumeId));
    } catch (err) {
      console.error('Error deleting resume:', err);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: (parsedData?.personal_info?.name || 'Resume').replace(/[^a-z0-9]/gi, '_') + '_Resume',
  });

  const handleDownloadPDF = async () => {
    if (!resumeRef.current || !parsedData) return;

    try {
      setIsGeneratingPDF(true);
      const element = resumeRef.current;
      
      // Use html-to-image instead of html2canvas for better modern CSS support (oklch)
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: (node) => {
          const exclusionClasses = ['print:hidden'];
          if (node instanceof Element) {
            return !exclusionClasses.some(cls => node.classList.contains(cls)) && 
                   node.getAttribute('data-html2canvas-ignore') !== 'true';
          }
          return true;
        }
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${(parsedData.personal_info.name || 'Resume').replace(/[^a-z0-9]/gi, '_')}_Resume.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError('PDF generation failed. Please try the standard print option.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadExcel = () => {
    if (!parsedData) return;

    const wb = XLSX.utils.book_new();
    
    // Personal Info
    const personalData = [
      ['Field', 'Value'],
      ['Name', parsedData.personal_info.name],
      ['Headline', parsedData.headline || ''],
      ['Email', parsedData.personal_info.email],
      ['Phone', parsedData.personal_info.phone],
      ['Location', parsedData.personal_info.location],
      ['Links', parsedData.personal_info.links.join(', ')]
    ];
    const wsPersonal = XLSX.utils.aoa_to_sheet(personalData);
    XLSX.utils.book_append_sheet(wb, wsPersonal, 'Personal Info');

    // Experience
    const expData = [['Title', 'Company', 'Duration', 'Highlights']];
    parsedData.experience.forEach(exp => {
      expData.push([exp.title, exp.company, exp.duration, exp.highlights.join('\n')]);
    });
    const wsExp = XLSX.utils.aoa_to_sheet(expData);
    XLSX.utils.book_append_sheet(wb, wsExp, 'Experience');

    // Projects
    if (parsedData.projects && parsedData.projects.length > 0) {
      const projData = [['Title', 'Description', 'Link']];
      parsedData.projects.forEach(proj => {
        projData.push([proj.title, proj.description, proj.link || '']);
      });
      const wsProj = XLSX.utils.aoa_to_sheet(projData);
      XLSX.utils.book_append_sheet(wb, wsProj, 'Projects');
    }

    // Education
    const eduData = [['Degree', 'Institution', 'Year']];
    parsedData.education.forEach(edu => {
      eduData.push([edu.degree, edu.institution, edu.year]);
    });
    const wsEdu = XLSX.utils.aoa_to_sheet(eduData);
    XLSX.utils.book_append_sheet(wb, wsEdu, 'Education');

    // Volunteer
    if (parsedData.volunteer && parsedData.volunteer.length > 0) {
      const volData = [['Role', 'Organization', 'Duration', 'Highlights']];
      parsedData.volunteer.forEach(vol => {
        volData.push([vol.role, vol.organization, vol.duration, vol.highlights.join('\n')]);
      });
      const wsVol = XLSX.utils.aoa_to_sheet(volData);
      XLSX.utils.book_append_sheet(wb, wsVol, 'Volunteer Work');
    }

    // Skills
    const skillsData = [
      ['Type', 'Skills'],
      ['Technical', parsedData.skills.technical.map(s => `${s.name} (${s.level}%)`).join(', ')],
      ['Soft', parsedData.skills.soft.join(', ')],
      ['Languages', parsedData.languages.join(', ')],
      ['Certifications', parsedData.certifications?.join(', ') || ''],
      ['Awards', parsedData.awards?.join(', ') || ''],
      ['Memberships', parsedData.memberships?.join(', ') || '']
    ];
    const wsSkills = XLSX.utils.aoa_to_sheet(skillsData);
    XLSX.utils.book_append_sheet(wb, wsSkills, 'Skills');

    XLSX.writeFile(wb, `${(parsedData.personal_info.name || 'Resume').replace(/[^a-z0-9]/gi, '_')}_Resume.xlsx`);
  };

  const handleDownloadWord = async () => {
    if (!parsedData) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: parsedData.personal_info.name.toUpperCase(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          ...(parsedData.headline ? [
            new Paragraph({
              text: parsedData.headline,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            })
          ] : []),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun(`${parsedData.personal_info.location} | ${parsedData.personal_info.phone} | ${parsedData.personal_info.email}`),
            ],
          }),
          new Paragraph({
            text: "PROFESSIONAL SUMMARY",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
          }),
          new Paragraph({
            text: parsedData.summary,
          }),
          new Paragraph({
            text: "WORK EXPERIENCE",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
          }),
          ...parsedData.experience.flatMap(exp => [
            new Paragraph({
              children: [
                new TextRun({ text: `${exp.title} | ${exp.company}`, bold: true }),
                new TextRun({ text: `\t${exp.duration}`, italics: true }),
              ],
            }),
            ...exp.highlights.map(h => new Paragraph({
              text: h,
              bullet: { level: 0 },
            }))
          ]),
          
          // Projects
          ...(parsedData.projects && parsedData.projects.length > 0 ? [
            new Paragraph({
              text: "PROJECTS",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 },
            }),
            ...parsedData.projects.flatMap(proj => [
              new Paragraph({
                children: [
                  new TextRun({ text: proj.title, bold: true }),
                  ...(proj.link ? [new TextRun({ text: ` | ${proj.link}`, italics: true })] : []),
                ],
              }),
              new Paragraph({ text: proj.description })
            ])
          ] : []),

          new Paragraph({
            text: "EDUCATION",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
          }),
          ...parsedData.education.flatMap(edu => [
            new Paragraph({
              children: [
                new TextRun({ text: edu.degree, bold: true }),
                new TextRun({ text: ` | ${edu.institution}`, italics: true }),
                new TextRun({ text: `\t${edu.year}` }),
              ],
            }),
          ]),

          // Volunteer
          ...(parsedData.volunteer && parsedData.volunteer.length > 0 ? [
            new Paragraph({
              text: "VOLUNTEER WORK",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 },
            }),
            ...parsedData.volunteer.flatMap(vol => [
              new Paragraph({
                children: [
                  new TextRun({ text: `${vol.role} | ${vol.organization}`, bold: true }),
                  new TextRun({ text: `\t${vol.duration}`, italics: true }),
                ],
              }),
              ...vol.highlights.map(h => new Paragraph({
                text: h,
                bullet: { level: 0 },
              }))
            ])
          ] : []),

          // Certifications
          ...(parsedData.certifications && parsedData.certifications.length > 0 ? [
            new Paragraph({
              text: "CERTIFICATIONS",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 },
            }),
            ...parsedData.certifications.map(cert => new Paragraph({
              text: cert,
              bullet: { level: 0 },
            }))
          ] : []),

          // Awards
          ...(parsedData.awards && parsedData.awards.length > 0 ? [
            new Paragraph({
              text: "AWARDS & HONORS",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 },
            }),
            ...parsedData.awards.map(award => new Paragraph({
              text: award,
              bullet: { level: 0 },
            }))
          ] : []),

          // Memberships
          ...(parsedData.memberships && parsedData.memberships.length > 0 ? [
            new Paragraph({
              text: "PROFESSIONAL MEMBERSHIPS",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 },
            }),
            ...parsedData.memberships.map(membership => new Paragraph({
              text: membership,
              bullet: { level: 0 },
            }))
          ] : []),

          new Paragraph({
            text: "SKILLS",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Technical: ", bold: true }),
              new TextRun(parsedData.skills.technical.map(s => `${s.name} (${s.level}%)`).join(', ')),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Soft: ", bold: true }),
              new TextRun(parsedData.skills.soft.join(', ')),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Languages: ", bold: true }),
              new TextRun(parsedData.languages.join(', ')),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${(parsedData.personal_info.name || 'Resume').replace(/[^a-z0-9]/gi, '_')}_Resume.docx`);
  };

  const handleParse = async (isRegenerate = false) => {
    if (!rawText.trim() && !isRegenerate) {
      setError('Please enter some text to parse.');
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Gemini API key is missing.');

      const ai = new GoogleGenAI({ apiKey });
      
      // STAGE 1: Parsing
      setParsingStage('parsing');
      let prompt = rawText;
      if (isRegenerate && feedback.trim()) {
        prompt = `Original Data: ${JSON.stringify(parsedData)}\n\nUser Feedback for refinement: ${feedback}\n\nApply this feedback to the original data and return the updated JSON.`;
      }

      if (!isRegenerate) {
        setActiveResumeId(null);
      }

      const parseResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: RESUME_SCHEMA,
          temperature: 0.1,
        }
      });

      let currentData = JSON.parse(parseResponse.text || '{}');

      // STAGE 2: Tailoring (Optional)
      if (jobDescription.trim()) {
        setParsingStage('tailoring');
        const tailorResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Tailor this resume to the following Job Description. You may re-order (re-rank) the existing skills and experience highlights to better match the requirements, but you MUST NOT change the wording, phrases, or sentences. Do NOT add any new information.
          Job Description: ${jobDescription}
          Resume JSON: ${JSON.stringify(currentData)}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: RESUME_SCHEMA,
            temperature: 0.1,
          }
        });
        currentData = JSON.parse(tailorResponse.text || '{}');
      }

      // Final Validation with Zod
      const validatedData = ResumeZodSchema.parse(currentData);
      setParsedData(validatedData as ResumeData);
      setActiveTab('preview');
      if (isRegenerate) setFeedback('');
    } catch (err: any) {
      console.error('Parsing error:', err);
      setError(err.message || 'Failed to process. Please try again.');
    } finally {
      setIsParsing(false);
      setParsingStage('idle');
    }
  };

  const handleNewResume = () => {
    setParsedData(null);
    setActiveResumeId(null);
    setRawText('');
    setJobDescription('');
    setActiveTab('edit');
  };

  const handleLiveEdit = (newData: ResumeData) => {
    setParsedData(newData);
  };

  const addSuggestedSkill = (skill: string) => {
    if (!parsedData) return;
    if (parsedData.skills.technical.some(s => s.name === skill)) return;
    const newData = {
      ...parsedData,
      skills: {
        ...parsedData.skills,
        technical: [...parsedData.skills.technical, { name: skill, level: 80 }]
      }
    };
    setParsedData(newData);
  };

  const getSuggestedSkills = () => {
    if (!parsedData) return [];
    const title = parsedData.experience[0]?.title || '';
    for (const [key, skills] of Object.entries(SUGGESTED_SKILLS_MAP)) {
      if (title.toLowerCase().includes(key.toLowerCase())) return skills;
    }
    return SUGGESTED_SKILLS_MAP['Software Engineer']; // Default
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-900">CV Architect Pro</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI-Powered Career Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <button 
                onClick={handleNewResume}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                New Resume
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                {parsedData && (
                  <button 
                    onClick={handleSaveAsNew}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
                  >
                    <Plus className="w-3 h-3" />
                    Save as New Version
                  </button>
                )}
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                  {showHistory ? 'Close History' : 'History'}
                </button>
                <div className="h-8 w-[1px] bg-slate-200" />
                {user.photoURL && (
                  <Image 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    width={32}
                    height={32}
                    className="rounded-full border border-slate-200"
                  />
                )}
                <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-rose-500">Logout</button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <Image src="https://www.google.com/favicon.ico" width={16} height={16} alt="Google" />
                Sign in to Auto-Save
              </button>
            )}
            {parsedData && (
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'edit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'json' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  JSON
                </button>
              </div>
            )}
            {parsedData && (
              <button
                onClick={() => handleDownloadPDF()}
                disabled={isGeneratingPDF}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50"
              >
                {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* History Sidebar */}
        {showHistory && (
          <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-slate-200 z-[60] animate-in slide-in-from-right duration-300">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-900 uppercase tracking-tight">Saved Resumes</h3>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto space-y-3 scrollbar-hide">
                {savedResumes.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <FileText className="w-8 h-8 text-slate-200 mx-auto" />
                    <p className="text-xs font-bold text-slate-400 uppercase">No resumes saved yet</p>
                  </div>
                ) : (
                  savedResumes.map((resume) => (
                    <div 
                      key={resume.id}
                      className={`group p-4 rounded-xl border transition-all cursor-pointer relative ${
                        activeResumeId === resume.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30'
                      }`}
                      onClick={() => loadResume(resume)}
                    >
                      {activeResumeId === resume.id && (
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-full" />
                      )}
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            saveResume(user.uid, resume.data, true);
                          }}
                          title="Duplicate as New Version"
                          className="text-slate-300 hover:text-indigo-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteResume(resume.id);
                          }}
                          title="Delete"
                          className="text-slate-300 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate pr-6">{resume.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                        Updated {new Date(resume.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {!parsedData && !isParsing ? (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Transform your career story.</h2>
              <p className="text-slate-500 text-lg">Paste your raw experience, and let our AI Architect build your professional identity.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Raw Resume / LinkedIn Content
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste your unorganized text here..."
                  className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none text-slate-700 placeholder:text-slate-300 font-medium transition-all"
                />
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setShowJDInput(!showJDInput)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-2 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  {showJDInput ? 'Hide Job Description' : 'Tailor to a specific Job Description? (Optional)'}
                </button>

                {showJDInput && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the Job Description here to tailor your resume..."
                      className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none text-sm text-slate-600"
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-shake">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={() => handleParse()}
                disabled={isParsing || !rawText.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 text-lg group"
              >
                {isParsing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                )}
                {isParsing ? `Stage: ${parsingStage.toUpperCase()}...` : 'Architect My Resume'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Pane: Form / Input */}
            <div className="space-y-8 h-[calc(100vh-10rem)] overflow-y-auto pr-4 scrollbar-hide">
              {isParsing ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">AI is Architecting...</h3>
                    <div className="flex items-center justify-center gap-4">
                      <div className={`flex items-center gap-1 text-xs font-bold ${parsingStage === 'parsing' ? 'text-indigo-600' : 'text-slate-300'}`}>
                        <div className={`w-2 h-2 rounded-full ${parsingStage === 'parsing' ? 'bg-indigo-600 animate-ping' : 'bg-slate-300'}`} />
                        Parsing
                      </div>
                      {jobDescription && (
                        <>
                          <ChevronRight className="w-3 h-3 text-slate-300" />
                          <div className={`flex items-center gap-1 text-xs font-bold ${parsingStage === 'tailoring' ? 'text-indigo-600' : 'text-slate-300'}`}>
                            <div className={`w-2 h-2 rounded-full ${parsingStage === 'tailoring' ? 'bg-indigo-600 animate-ping' : 'bg-slate-300'}`} />
                            Tailoring
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : activeTab === 'edit' ? (
                <div className="animate-in fade-in slide-in-from-left-8 duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Editor</h2>
                    <div className="flex gap-2">
                      <button onClick={() => setParsedData(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Reset
                      </button>
                    </div>
                  </div>
                  
                  <ResumeForm data={parsedData!} onChange={handleLiveEdit} />

                  {/* Skill Suggestions */}
                  <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Suggested Skills for {parsedData?.experience[0]?.title || 'your role'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {getSuggestedSkills().map((skill, i) => (
                        <button
                          key={i}
                          onClick={() => addSuggestedSkill(skill)}
                          className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeTab === 'json' ? (
                <div className="h-full bg-slate-900 rounded-3xl p-8 overflow-auto shadow-2xl animate-in fade-in duration-500">
                  <pre className="text-xs text-emerald-400 font-mono leading-relaxed">
                    {JSON.stringify(parsedData, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>

            {/* Right Pane: Preview */}
            <div className="h-[calc(100vh-10rem)] overflow-y-auto pr-2 scrollbar-hide flex flex-col items-center">
              <div className="w-full max-w-[210mm] animate-in fade-in slide-in-from-right-8 duration-700">
                
                {/* Theme Selector */}
                {!isParsing && parsedData && (
                  <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Palette className="w-4 h-4 text-indigo-600" />
                      Select Design Theme
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(['professional', 'modern', 'minimalist', 'islamic', 'creative', 'executive', 'canva_sidebar', 'canva_elegant', 'canva_tech', 'canva_bold'] as ResumeTheme[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedTheme(t)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedTheme === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                        >
                          {t.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* CV Completeness Checklist */}
                {!isParsing && parsedData && (
                  <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-600" />
                        CV Completeness Checklist
                      </h3>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                        {Math.round((
                          [
                            parsedData.personal_info.name !== 'N/A',
                            parsedData.personal_info.email !== 'N/A',
                            parsedData.personal_info.phone !== 'N/A',
                            parsedData.summary !== 'N/A',
                            parsedData.experience.length > 0,
                            parsedData.education.length > 0,
                            parsedData.skills.technical.length > 0,
                            (parsedData.certifications?.length || 0) > 0,
                            (parsedData.projects?.length || 0) > 0,
                            (parsedData.languages?.length || 0) > 0,
                            (parsedData.volunteer?.length || 0) > 0,
                            (parsedData.awards?.length || 0) > 0,
                            (parsedData.memberships?.length || 0) > 0
                          ].filter(Boolean).length / 13
                        ) * 100)}% Complete
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      {[
                        { label: 'Contact Info', status: parsedData.personal_info.name !== 'N/A' && parsedData.personal_info.email !== 'N/A', type: 'essential' },
                        { label: 'Professional Summary', status: parsedData.summary !== 'N/A', type: 'essential' },
                        { label: 'Work Experience', status: parsedData.experience.length > 0, type: 'essential' },
                        { label: 'Core Skills', status: parsedData.skills.technical.length > 0, type: 'essential' },
                        { label: 'Education', status: parsedData.education.length > 0, type: 'essential' },
                        { label: 'Certifications', status: (parsedData.certifications?.length || 0) > 0, type: 'extra' },
                        { label: 'Projects/Portfolio', status: (parsedData.projects?.length || 0) > 0, type: 'extra' },
                        { label: 'Languages', status: (parsedData.languages?.length || 0) > 0, type: 'extra' },
                        { label: 'Volunteer Work', status: (parsedData.volunteer?.length || 0) > 0, type: 'extra' },
                        { label: 'Awards & Achievements', status: (parsedData.awards?.length || 0) > 0, type: 'extra' },
                        { label: 'Professional Memberships', status: (parsedData.memberships?.length || 0) > 0, type: 'extra' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                          <div className="flex items-center gap-2">
                            {item.status ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <AlertCircle className={`w-4 h-4 ${item.type === 'essential' ? 'text-rose-500' : 'text-slate-300'}`} />
                            )}
                            <span className={`text-xs ${item.status ? 'text-slate-600' : 'text-slate-400 font-medium'}`}>
                              {item.label}
                            </span>
                          </div>
                          {!item.status && (
                            <button 
                              onClick={() => setActiveTab('edit')}
                              className="text-[10px] font-bold text-indigo-600 hover:underline"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!parsedData?.summary || parsedData.summary === 'N/A') && (
                  <div className="mb-6 p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Summary is missing</p>
                        <p className="text-xs text-slate-500 font-medium">AI can generate a professional summary based on your experience.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFeedback('Generate a professional summary based on my experience.');
                        handleParse(true);
                      }}
                      disabled={isParsing}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-black transition-all shadow-lg shadow-amber-100 flex items-center gap-2"
                    >
                      {isParsing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      Generate Summary
                    </button>
                  </div>
                )}

                <div className="origin-top scale-[0.85] xl:scale-100 transition-transform">
                  <CVPreview 
                    ref={resumeRef}
                    data={parsedData!} 
                    isGhost={!parsedData?.summary || parsedData.summary === 'N/A'} 
                    theme={selectedTheme}
                  />
                </div>

                {/* Multi-Format Download Section */}
                {!isParsing && parsedData && (
                  <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-100">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest mb-6">
                      <LayoutTemplate className="w-4 h-4 text-indigo-600" />
                      Download Options
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => handleDownloadPDF()}
                        disabled={isGeneratingPDF}
                        className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-xs font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group shadow-lg disabled:opacity-50"
                      >
                        {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                        {isGeneratingPDF ? 'Generating...' : 'PDF Format'}
                      </button>
                      <button
                        onClick={() => handleDownloadWord()}
                        className="bg-blue-600 text-white px-6 py-4 rounded-2xl text-xs font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-lg"
                      >
                        <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Word (.docx)
                      </button>
                      <button
                        onClick={() => handleDownloadExcel()}
                        className="bg-emerald-600 text-white px-6 py-4 rounded-2xl text-xs font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group shadow-lg"
                      >
                        <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Excel (.xlsx)
                      </button>
                    </div>
                    <div className="mt-6 flex flex-col items-center gap-2">
                      <button
                        onClick={async () => {
                          await handleDownloadPDF();
                          await handleDownloadWord();
                          handleDownloadExcel();
                        }}
                        className="w-full bg-slate-100 text-slate-600 px-6 py-3 rounded-xl text-[10px] font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 border border-slate-200"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Download All Formats
                      </button>
                      <button 
                        onClick={() => handlePrint()}
                        className="text-[10px] text-slate-400 hover:text-slate-600 font-medium underline underline-offset-4"
                      >
                        Trouble downloading? Try standard print option
                      </button>
                    </div>
                  </div>
                )}

                {/* Refinement Section */}
                {!isParsing && (
                  <div className="mt-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                        AI Refinement
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Stage 2: Polish & Tailor</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="relative flex-grow">
                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="E.g. 'Focus more on my leadership' or 'Make it more concise'"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium"
                        />
                      </div>
                      <button
                        onClick={() => handleParse(true)}
                        disabled={isParsing || !feedback.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 py-4 rounded-2xl text-sm font-black transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                      >
                        {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refine
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
