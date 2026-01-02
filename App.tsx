
import React, { useState, useRef, useEffect } from 'react';
import { StudyMode, ChatMessage, FilePart, OnboardingStep, UserProfile, DetailLevel, ThemeMode } from './types';
import { MODES_CONFIG, TRANSLATIONS } from './constants';
import { generateStudyResponse } from './services/geminiService';
import { 
  BookOpen, 
  MessageSquare, 
  Search, 
  Layout, 
  Zap, 
  Target, 
  GraduationCap, 
  Menu, 
  X,
  SendHorizontal,
  Copy,
  Check,
  BrainCircuit,
  Settings as SettingsIcon,
  HelpCircle,
  Clock,
  Briefcase,
  Library,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Trash2,
  UploadCloud,
  Moon,
  Sun,
  ExternalLink,
  Info,
  ChevronRight,
  ChevronLeft,
  Globe,
  LogIn,
  UserCheck,
  Monitor,
  Eye,
  ShieldCheck,
  LogOut,
  UserX
} from 'lucide-react';

const App: React.FC = () => {
  // --- Flow State ---
  const [step, setStep] = useState<OnboardingStep>(() => {
    const saved = localStorage.getItem('onboarding_step');
    return (saved as OnboardingStep) || 'language';
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      return JSON.parse(saved);
    }
    return { 
      language: 'ar', 
      theme: 'auto', 
      defaultStyle: StudyMode.ADVISOR, 
      detailLevel: 'medium', 
      allowGeneralChat: true, 
      strictSourcesOnly: false,
      saveHistory: true
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Main App State ---
  const [currentMode, setCurrentMode] = useState<StudyMode>(userProfile.defaultStyle || StudyMode.ADVISOR);
  const [topic, setTopic] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<FilePart[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const t = TRANSLATIONS[userProfile.language];
  const isRtl = userProfile.language === 'ar';
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Theme Management ---
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (mode: ThemeMode) => {
      if (mode === 'dark') {
        root.classList.add('dark');
      } else if (mode === 'light') {
        root.classList.remove('dark');
      } else {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemDark) root.classList.add('dark');
        else root.classList.remove('dark');
      }
    };

    applyTheme(userProfile.theme);

    // Watch for system changes if 'auto'
    if (userProfile.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => applyTheme('auto');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [userProfile.theme]);

  // --- Persistence & Localization ---
  useEffect(() => {
    localStorage.setItem('onboarding_step', step);
    localStorage.setItem('user_profile', JSON.stringify(userProfile));
    
    document.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = userProfile.language;
  }, [step, userProfile, isRtl]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (step === 'app') scrollToBottom();
  }, [messages, isLoading, step]);

  // --- Handlers ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: FilePart[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
      });
      newFiles.push({
        fileName: file.name,
        inlineData: { data: base64Data, mimeType: file.type }
      });
    }
    setAttachedFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!topic.trim() && attachedFiles.length === 0) || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: topic || (attachedFiles.length > 0 ? (isRtl ? "تحليل الملفات المرفقة" : "Analyze attached files") : ""),
      mode: currentMode,
      files: attachedFiles.map(f => f.fileName)
    };

    if (userProfile.saveHistory) {
      setMessages(prev => [...prev, userMessage]);
    } else {
       setMessages([userMessage]);
    }
    
    const currentFiles = [...attachedFiles];
    const currentTopic = topic;
    setTopic('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const response = await generateStudyResponse(currentTopic, currentMode, currentFiles, userProfile);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response || 'Error generating response',
        mode: currentMode
      };
      
      if (userProfile.saveHistory) {
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: error.message || 'Error occurred',
        mode: currentMode
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({ ...prev, [key]: value }));
  };

  const clearHistory = () => {
    setMessages([]);
    setIsSettingsOpen(false);
  };

  // --- Onboarding Renderers ---
  if (step === 'language') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl shadow-blue-500/20">
          <Globe size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {TRANSLATIONS.ar.welcome}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-sm">
          Select your preferred interface language to continue
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          <button 
            onClick={() => { setUserProfile({ ...userProfile, language: 'ar' }); setStep('login'); }}
            className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-blue-500 hover:ring-2 hover:ring-blue-500/10 transition-all group"
          >
            <span className="text-xl font-bold dark:text-white">العربية</span>
            <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">SA</div>
          </button>
          <button 
            onClick={() => { setUserProfile({ ...userProfile, language: 'en' }); setStep('login'); }}
            className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-blue-500 hover:ring-2 hover:ring-blue-500/10 transition-all group"
          >
            <span className="text-xl font-bold dark:text-white">English</span>
            <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">US</div>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <div className="inline-flex p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 mb-4">
              <LogIn size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.loginTitle}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t.loginSubtitle}</p>
          </div>
          
          <div className="space-y-3">
            <button onClick={() => setStep('profiling')} className="w-full py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center gap-3 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-all">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              {t.loginGoogle}
            </button>
            <button onClick={() => setStep('profiling')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
              {t.loginEmail}
            </button>
          </div>
          
          <button onClick={() => setStep('language')} className="mt-8 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-2 mx-auto">
            {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            تغيير اللغة / Change Language
          </button>
        </div>
      </div>
    );
  }

  if (step === 'profiling') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6 transition-colors duration-300">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl"><UserCheck size={24} /></div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.profilingTitle}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.profilingSubtitle}</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden"><div className="w-3/4 bg-purple-600 h-full"></div></div>
          </div>
          <div className="space-y-8">
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-200 mb-4">{t.qLevel}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {t.levels.map(l => (
                  <button key={l} onClick={() => setUserProfile({...userProfile, studyLevel: l})} className={`p-4 border rounded-2xl text-sm font-semibold transition-all ${userProfile.studyLevel === l ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-200 mb-4">{t.qMajor}</p>
              <div className="flex flex-wrap gap-3">
                {t.majors.map(m => (
                  <button key={m} onClick={() => setUserProfile({...userProfile, major: m})} className={`px-6 py-3 border rounded-full text-sm font-semibold transition-all ${userProfile.major === m ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}>{m}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setStep('app')} className="text-gray-400 hover:text-gray-600 font-semibold">{t.skip}</button>
              <button onClick={() => setStep('app')} className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/20 active:scale-95">{t.finish}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Application UI Renderers ---
  const getIconForMode = (mode: StudyMode) => {
    switch (mode) {
      case StudyMode.ADVISOR: return <Briefcase size={20} />;
      case StudyMode.UNIVERSITY: return <Library size={20} />;
      case StudyMode.NOTEBOOK_LM: return <FileText size={20} />;
      case StudyMode.GENERAL: return <BookOpen size={20} />;
      case StudyMode.TEACHING: return <GraduationCap size={20} />;
      case StudyMode.QA: return <MessageSquare size={20} />;
      case StudyMode.SUMMARY: return <Target size={20} />;
      case StudyMode.GUIDE: return <Layout size={20} />;
      case StudyMode.SMART: return <BrainCircuit size={20} />;
      case StudyMode.FAST: return <Clock size={20} />;
      case StudyMode.GENERAL_DEFAULT: return <HelpCircle size={20} />;
      case StudyMode.UX_IMPROVED: return <Zap size={20} />;
      default: return <SettingsIcon size={20} />;
    }
  };

  const renderEmptyState = () => {
    if (currentMode === StudyMode.NOTEBOOK_LM && attachedFiles.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="relative"><div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800 shadow-sm"><FileText size={48} /></div><div className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">PRO</div></div>
          <div><h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{isRtl ? "متوافق مع أسلوب NotebookLM" : "NotebookLM-style Analysis"}</h3><p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto">{isRtl ? 'هذا الوضع مخصص لتحليل المصادر المرفقة "فقط" بأسلوب أكاديمي صارم.' : 'This mode is strictly for analyzing attached sources with academic rigour.'}</p></div>
          <div className="flex flex-col sm:flex-row gap-4"><button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/20 group"><UploadCloud size={20} />{isRtl ? 'رفع المصادر' : 'Upload Sources'}</button><button onClick={() => window.open('https://notebooklm.google.com/', '_blank')} className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all group"><ExternalLink size={20} />NotebookLM</button></div>
        </div>
      );
    }
    return (
      <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2"><BrainCircuit size={48} /></div>
        <div><h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{isRtl ? `أهلاً بك، ${userProfile.studyLevel || 'أيها الطالب'}` : `Welcome, ${userProfile.studyLevel || 'Student'}`}</h3><p className="text-gray-500 dark:text-gray-400 leading-relaxed">{isRtl ? 'اكتب المفهوم أو ارفع ملفاتك وسيقوم المستشار بتبسيطها لك.' : 'Type a concept or upload files and the advisor will simplify them for you.'}</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full px-4">{['شرح نظرية النسبية', 'ملخص لقوانين نيوتن', 'كيف أذاكر للامتحان بذكاء؟', 'تحليل ملف المرفق'].map((example) => (<button key={example} onClick={() => { setTopic(example); }} className="p-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-300 transition-all text-right">{example}</button>))}</div>
      </div>
    );
  };

  const SettingsPanel = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg"><SettingsIcon size={20} /></div>
            <h2 className="text-xl font-bold dark:text-white">{t.settings.title}</h2>
          </div>
          <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-10 custom-scrollbar">
          {/* Appearance Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Eye size={14} /> {t.settings.appearance}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.settings.language}</label>
                <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                  <button onClick={() => updateSetting('language', 'ar')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${userProfile.language === 'ar' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>العربية</button>
                  <button onClick={() => updateSetting('language', 'en')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${userProfile.language === 'en' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>English</button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.settings.theme}</label>
                <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                  <button onClick={() => updateSetting('theme', 'light')} className={`flex-1 py-2 flex items-center justify-center rounded-lg transition-all ${userProfile.theme === 'light' ? 'bg-white dark:bg-gray-700 shadow-sm text-orange-500' : 'text-gray-500'}`} title={t.settings.themeLight}><Sun size={14} /></button>
                  <button onClick={() => updateSetting('theme', 'dark')} className={`flex-1 py-2 flex items-center justify-center rounded-lg transition-all ${userProfile.theme === 'dark' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-400' : 'text-gray-500'}`} title={t.settings.themeDark}><Moon size={14} /></button>
                  <button onClick={() => updateSetting('theme', 'auto')} className={`flex-1 py-2 flex items-center justify-center rounded-lg transition-all ${userProfile.theme === 'auto' ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-500' : 'text-gray-500'}`} title={t.settings.themeAuto}><Monitor size={14} /></button>
                </div>
              </div>
            </div>
          </section>

          {/* Study Settings Section */}
          <section className="space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Target size={14} /> {t.settings.study}
            </h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.settings.defaultStyle}</label>
                <select 
                  value={userProfile.defaultStyle} 
                  onChange={(e) => updateSetting('defaultStyle', e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white"
                >
                  {Object.values(MODES_CONFIG).map(mode => <option key={mode.id} value={mode.id}>{mode.title}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.settings.detailLevel}</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['short', 'medium', 'detailed'] as DetailLevel[]).map(level => (
                    <button 
                      key={level} 
                      onClick={() => updateSetting('detailLevel', level)}
                      className={`p-3 border rounded-xl text-xs font-bold transition-all ${userProfile.detailLevel === level ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}
                    >
                      {level === 'short' ? t.settings.detailShort : level === 'medium' ? t.settings.detailMedium : t.settings.detailDetailed}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="text-sm font-medium dark:text-gray-300">{t.settings.generalChatToggle}</span>
                <button 
                  onClick={() => updateSetting('allowGeneralChat', !userProfile.allowGeneralChat)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors relative ${userProfile.allowGeneralChat ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full transition-transform ${userProfile.allowGeneralChat ? (isRtl ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Sources Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Library size={14} /> {t.settings.sources}
            </h3>
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-300">{t.settings.strictSources}</span>
              </div>
              <button 
                onClick={() => updateSetting('strictSourcesOnly', !userProfile.strictSourcesOnly)}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative ${userProfile.strictSourcesOnly ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full transition-transform ${userProfile.strictSourcesOnly ? (isRtl ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'}`} />
              </button>
            </div>
          </section>

          {/* Account & Privacy */}
          <section className="space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <UserCheck size={14} /> {t.settings.privacy}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <span className="text-sm font-medium dark:text-gray-300">{t.settings.saveHistory}</span>
                <button 
                  onClick={() => updateSetting('saveHistory', !userProfile.saveHistory)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors relative ${userProfile.saveHistory ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full transition-transform ${userProfile.saveHistory ? (isRtl ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={clearHistory} className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-all"><Trash2 size={16} /> {t.settings.clearHistory}</button>
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all"><LogOut size={16} /> {t.settings.logout}</button>
              </div>
              <button className="w-full flex items-center justify-center gap-3 p-4 text-xs font-bold text-gray-400 hover:text-red-500 transition-all uppercase"><UserX size={14} /> {t.settings.deleteAccount}</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-300">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      {isSettingsOpen && <SettingsPanel />}

      <aside className={`fixed inset-y-0 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} z-50 w-72 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2">
              <BrainCircuit className="text-blue-600 dark:text-blue-500" />
              {isRtl ? 'المستشار الذكي' : 'Study Advisor'}
            </h1>
            <button className="lg:hidden p-2 text-gray-400" onClick={() => setSidebarOpen(false)}><X size={24} /></button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-4 px-2 uppercase tracking-wider">{isRtl ? 'أنماط الدراسة' : 'Study Modes'}</p>
            <div className="space-y-1">
              {Object.values(MODES_CONFIG).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => { setCurrentMode(mode.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isRtl ? 'text-right' : 'text-left'} ${currentMode === mode.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold border-blue-600/20 border' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <span className={`${currentMode === mode.id ? 'text-blue-600' : 'text-gray-400'}`}>{getIconForMode(mode.id)}</span>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm leading-tight">{mode.title}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-normal truncate">{mode.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
             <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center justify-between p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-bold text-sm">
                <div className="flex items-center gap-3"><SettingsIcon size={18} /> {t.settings.title}</div>
                {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-950 relative transition-colors duration-300">
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
            <div className={`hidden sm:flex flex-col ${isRtl ? 'text-right' : 'text-left'}`}>
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200">{MODES_CONFIG[currentMode].title}</h2>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">{MODES_CONFIG[currentMode].description}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end text-[10px] text-gray-400 font-bold uppercase tracking-wider">
               <span>Gemini 3 Pro</span>
               <span className="text-green-500">Grounded Mode</span>
             </div>
             <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><SettingsIcon size={20} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar">
          {messages.length === 0 ? renderEmptyState() : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl px-6 py-4 shadow-sm border ${msg.role === 'user' ? 'bg-blue-600 text-white border-blue-700 dark:bg-blue-700 dark:border-blue-800' : 'bg-white text-gray-800 border-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800'}`}>
                  <div className="flex items-center justify-between mb-3 border-b border-black/10 dark:border-white/10 pb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>
                      {msg.role === 'user' ? (isRtl ? 'أنت' : 'You') : MODES_CONFIG[msg.mode].title}
                    </span>
                    {msg.role === 'assistant' && (
                      <button onClick={() => { navigator.clipboard.writeText(msg.content); setCopiedIndex(idx); setTimeout(() => setCopiedIndex(null), 2000); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-400">
                        {copiedIndex === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                  <div className={`whitespace-pre-wrap leading-relaxed markdown-content ${msg.role === 'assistant' ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`} dangerouslySetInnerHTML={{ __html: msg.role === 'assistant' ? msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') : msg.content }} />
                </div>
              </div>
            ))
          )}
          {isLoading && <div className="flex justify-start"><div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 shadow-sm animate-pulse flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-100"></span><span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-200"></span></div></div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 z-20">
          <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-3">
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto py-1 animate-in fade-in slide-in-from-bottom-2 custom-scrollbar">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-400">
                    <span className="max-w-[150px] truncate">{file.fileName}</span>
                    <button onClick={() => setAttachedFiles(f => f.filter((_, i) => i !== idx))} className="text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleSend} className="relative flex items-center h-14 w-full">
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={isRtl ? "اكتب سؤالك هنا..." : "Type your question..."} className={`w-full h-full ${isRtl ? 'pl-28 pr-14' : 'pr-28 pl-14'} bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm shadow-inner dark:text-gray-100`} disabled={isLoading} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className={`absolute ${isRtl ? 'right-3' : 'left-3'} p-2.5 text-gray-400 hover:text-blue-600 rounded-xl transition-all`}><Paperclip size={20} /></button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="application/pdf,image/*,text/plain" />
              <button type="submit" disabled={isLoading || (!topic.trim() && attachedFiles.length === 0)} className={`absolute ${isRtl ? 'left-2' : 'right-2'} h-10 px-6 rounded-xl font-bold flex items-center gap-2 transition-all ${(!topic.trim() && attachedFiles.length === 0) || isLoading ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}>
                <span className="hidden sm:inline">{t.next}</span>
                <SendHorizontal size={18} className={isRtl ? "rotate-180" : ""} />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
