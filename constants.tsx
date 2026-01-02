
import { StudyMode, ModeConfig } from './types';

export const SYSTEM_RULES = `
اللغة: العربية الفصحى المبسطة.
التنسيق: عناوين واضحة، نقاط مرقمة، فقرات قصيرة.
الأسلوب: احترافي، هادئ، مباشر، لا حشو، لا تكرار.
الكلمات المفتاحية: يتم إبرازها باستخدام التنسيق الغامق (Bold).
ممنوع: استخدام الإيموجي تماماً، الكلام الإنشائي، الإطالة بلا فائدة.
الهدف: تقديم رد دراسي مرتب وقابل للتطبيق فوراً.
`;

export const TRANSLATIONS = {
  ar: {
    welcome: "مرحباً بك في المستشار التعليمي الذكي",
    selectLanguage: "اختر لغة الواجهة",
    loginTitle: "تسجيل الدخول",
    loginSubtitle: "ابدأ رحلتك التعليمية المخصصة الآن",
    loginGoogle: "متابعة باستخدام جوجل",
    loginEmail: "متابعة بالبريد الإلكتروني",
    next: "التالي",
    skip: "تخطي",
    finish: "ابدأ الدراسة",
    profilingTitle: "لنخصص تجربتك",
    profilingSubtitle: "أجب عن بضعة أسئلة لنقدم لك أفضل أسلوب دراسي",
    qLevel: "ما هو مستواك الدراسي حالياً؟",
    qMajor: "ما هو تخصصك الأكاديمي؟",
    qStyle: "كيف تفضل أن يشرح لك الذكاء الاصطناعي؟",
    qGoal: "ما هو هدفك الأساسي من استخدام التطبيق؟",
    levels: ["ثانوي", "جامعي", "دراسات عليا"],
    majors: ["طب", "هندسة", "علوم", "إدارة أعمال", "تخصص آخر"],
    styles: ["شرح مبسّط", "شرح جامعي معمّق", "أسئلة وأجوبة", "ملخصات مركزة"],
    goals: ["فهم المادة", "التحضير للامتحان", "مراجعة سريعة"],
    settings: {
      title: "الإعدادات",
      appearance: "المظهر واللغة",
      language: "اللغة",
      theme: "المظهر",
      themeLight: "فاتح",
      themeDark: "داكن",
      themeAuto: "تلقائي",
      study: "إعدادات الدراسة",
      defaultStyle: "أسلوب الشرح الافتراضي",
      detailLevel: "مستوى التفصيل",
      detailShort: "مختصر",
      detailMedium: "متوسط",
      detailDetailed: "مفصل",
      generalChatToggle: "السماح بالدردشة العامة بدون مصادر",
      sources: "إعدادات المصادر",
      strictSources: "لا تجب إلا من المصادر المرفوعة",
      privacy: "الخصوصية والحساب",
      saveHistory: "حفظ سجل المحادثات",
      clearHistory: "مسح سجل الدراسة",
      logout: "تسجيل الخروج",
      deleteAccount: "حذف الحساب",
      apply: "تطبيق التغييرات",
      close: "إغلاق"
    }
  },
  en: {
    welcome: "Welcome to AI Study Advisor",
    selectLanguage: "Select Interface Language",
    loginTitle: "Sign In",
    loginSubtitle: "Start your personalized educational journey now",
    loginGoogle: "Continue with Google",
    loginEmail: "Continue with Email",
    next: "Next",
    skip: "Skip",
    finish: "Start Studying",
    profilingTitle: "Personalize Your Experience",
    profilingSubtitle: "Answer a few questions for the best study style",
    qLevel: "What is your current study level?",
    qMajor: "What is your academic major?",
    qStyle: "How do you prefer the AI to explain concepts?",
    qGoal: "What is your primary goal?",
    levels: ["Secondary", "University", "Post-graduate"],
    majors: ["Medicine", "Engineering", "Science", "Business", "Other"],
    styles: ["Simplified", "Deep Academic", "Q&A Mode", "Focused Summaries"],
    goals: ["Deep Understanding", "Exam Prep", "Quick Review"],
    settings: {
      title: "Settings",
      appearance: "Appearance & Language",
      language: "Language",
      theme: "Theme",
      themeLight: "Light",
      themeDark: "Dark",
      themeAuto: "Auto",
      study: "Study Settings",
      defaultStyle: "Default Explanation Style",
      detailLevel: "Detail Level",
      detailShort: "Short",
      detailMedium: "Medium",
      detailDetailed: "Detailed",
      generalChatToggle: "Allow general chat without sources",
      sources: "Source Settings",
      strictSources: "Only answer from uploaded sources",
      privacy: "Privacy & Account",
      saveHistory: "Save conversation history",
      clearHistory: "Clear study history",
      logout: "Log Out",
      deleteAccount: "Delete Account",
      apply: "Apply Changes",
      close: "Close"
    }
  }
};

export const MODES_CONFIG: Record<StudyMode, ModeConfig> = {
  [StudyMode.ADVISOR]: {
    id: StudyMode.ADVISOR,
    title: 'مستشار تعليمي',
    description: 'أسلوب احترافي وهادئ للتحليل الأكاديمي الشامل.',
    systemPrompt: `تصرّف كمستشار تعليمي وخبير ذكاء اصطناعي. قدم رداً دراسياً واضحاً، مرتباً، وقابلاً للتطبيق.`
  },
  [StudyMode.NOTEBOOK_LM]: {
    id: StudyMode.NOTEBOOK_LM,
    title: 'تجربة NotebookLM',
    description: 'تحليل صارم للمصادر المرفوعة فقط بدون معرفة خارجية.',
    systemPrompt: `تصرّف كمساعد ذكاء اصطناعي يعتمد كلياً على المصادر (Source-Grounded).
القواعد الصارمة:
1. لا تجب بناءً على معرفتك الخارجية؛ استخدم فقط المعلومات الموجودة في الملفات المرفقة.
2. إذا كانت المعلومة غير موجودة في الملفات، صرح بذلك بوضوح: "هذه المعلومة غير متوفرة في المصادر المرفقة".
3. استخدم الاقتباسات أو أشر إلى "المصدر" عند ذكر حقائق معينة.
4. الشرح يجب أن يكون منظماً أكاديمياً (مقدمة، نقاط تحليلية، استنتاج).`
  },
  [StudyMode.UNIVERSITY]: {
    id: StudyMode.UNIVERSITY,
    title: 'مصادر جامعية',
    description: 'شروحات أكاديمية مبنية على المناهج والكتب الجامعية الرسمية.',
    systemPrompt: `تصرّف كأستاذ جامعي وخبير أكاديمي. قدم شرحاً منظماً للموضوع يعتمد على المراجع العلمية والمناهج الجامعية الرسمية.`
  },
  [StudyMode.GENERAL]: {
    id: StudyMode.GENERAL,
    title: 'دراسة عامة',
    description: 'شرح المفاهيم خطوة بخطوة للمبتدئين.',
    systemPrompt: `تصرّف كمعلّم ذكي يشرح المفاهيم للطالب خطوة بخطوة.`
  },
  [StudyMode.TEACHING]: {
    id: StudyMode.TEACHING,
    title: 'وضع التعليم (Teaching)',
    description: 'الفهم العميق من الصفر حتى الإتقان.',
    systemPrompt: `تصرّف كمعلّم يشرح لطالب يريد الفهم وليس الحفظ.`
  },
  [StudyMode.QA]: {
    id: StudyMode.QA,
    title: 'سؤال وجواب',
    description: 'إجابات مباشرة ودقيقة على أسئلة محددة.',
    systemPrompt: `تصرّف كمدرّس يجيب على سؤال طالب بدقة.`
  },
  [StudyMode.SUMMARY]: {
    id: StudyMode.SUMMARY,
    title: 'ملخص دراسي',
    description: 'تحويل المحتوى إلى نقاط مركزة للمراجعة.',
    systemPrompt: `تصرّف كخبير تلخيص دراسي.`
  },
  [StudyMode.GUIDE]: {
    id: StudyMode.GUIDE,
    title: 'الدليل الكامل',
    description: 'دليل دراسي متكامل وشامل للموضوع.',
    systemPrompt: `تصرّف كمصمم دليل دراسي احترافي.`
  },
  [StudyMode.SMART]: {
    id: StudyMode.SMART,
    title: 'الدراسة الذكية',
    description: 'تقنيات لتقليل الوقت وزيادة الفهم.',
    systemPrompt: `تصرّف كمدرّب تعلم ذكي.`
  },
  [StudyMode.FAST]: {
    id: StudyMode.FAST,
    title: 'الدراسة السريعة',
    description: 'مراجعة ما قبل الامتحانات والتركيز على المهم.',
    systemPrompt: `تصرّف كمدرّس تجهيز امتحانات.`
  },
  [StudyMode.GENERAL_DEFAULT]: {
    id: StudyMode.GENERAL_DEFAULT,
    title: 'الوضع العام',
    description: 'مساعد تعليمي عام (سؤال وجواب تلقائي).',
    systemPrompt: `تصرّف كمساعد تعليمي عام.`
  },
  [StudyMode.UX_IMPROVED]: {
    id: StudyMode.UX_IMPROVED,
    title: 'تحسين تجربة الطالب',
    description: 'شرح واضح ومريح يقلل من التشتت المعلوماتي.',
    systemPrompt: `تصرّف كخبير تجربة مستخدم تعليمية.`
  }
};
