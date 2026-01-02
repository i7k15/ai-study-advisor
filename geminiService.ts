
import { GoogleGenAI } from "@google/genai";
import { StudyMode, FilePart, UserProfile } from "../types";
import { MODES_CONFIG, SYSTEM_RULES } from "../constants";

export async function generateStudyResponse(topic: string, mode: StudyMode, files: FilePart[] = [], profile: UserProfile) {
  const config = MODES_CONFIG[mode];
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  // Customizing based on detail level
  let detailInstruction = "";
  if (profile.detailLevel === 'short') detailInstruction = "اجعل الإجابة مختصرة جداً ومركزة.";
  else if (profile.detailLevel === 'detailed') detailInstruction = "قدم شرحاً مفصلاً ومعمقاً مع كافة التفاصيل الممكنة.";
  else detailInstruction = "اجعل مستوى التفصيل متوسطاً وشاملاً لأهم النقاط.";

  // Source restrictions
  let sourceInstruction = "";
  if (profile.strictSourcesOnly && files.length > 0) {
    sourceInstruction = "\nتحذير صارم: لا تجب إلا من واقع الملفات المرفقة فقط. إذا لم تكن المعلومة موجودة في الملفات، قل بوضوح أنك لا تعرف لأن المصادر لا تحتوي عليها.";
  }

  const systemInstruction = `${SYSTEM_RULES}\n\n${config.systemPrompt}\n\n${detailInstruction}${sourceInstruction}\n\nملاحظة: إذا تم تقديم ملفات (صور أو مستندات)، فاجعلها هي السياق الأساسي لإجابتك.`;
  
  try {
    const parts: any[] = [{ text: `الموضوع/السؤال: ${topic}` }];
    
    // Add files to the parts array
    files.forEach(file => {
      parts.push({
        inlineData: file.inlineData
      });
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("حدث خطأ أثناء التواصل مع المستشار التعليمي. يرجى التأكد من حجم الملفات والمحاولة مرة أخرى.");
  }
}
