
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WordEntry, TargetLanguage, LanguageLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const languageNames = {
  'de': 'German',
  'en': 'English',
  'es': 'Spanish'
};

const voiceMap = {
  'de': 'Kore',
  'en': 'Puck',
  'es': 'Charon'
};

export async function fetchDailyWords(lang: TargetLanguage, level: LanguageLevel): Promise<WordEntry[]> {
  try {
    const langName = languageNames[lang];
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 3 random ${langName} words for a daily learning app. 
      Target level: ${level}. 
      Focus on high-frequency words for this level.
      Provide:
      1. The word in ${langName}.
      2. Russian translation.
      3. Grammar info: If German/Spanish, include definite article. If English, specify word type (noun, verb, etc).
      4. Plural form (if applicable).
      5. Pronunciation hint (transcription).
      6. A simple example sentence in ${langName} and its Russian translation.
      7. A short category (e.g., "Food", "Work", "Nature").`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              german: { type: Type.STRING, description: `The word in ${langName}` },
              russian: { type: Type.STRING },
              article: { type: Type.STRING, description: "Definite article or word type" },
              plural: { type: Type.STRING },
              exampleGerman: { type: Type.STRING, description: `Example in ${langName}` },
              exampleRussian: { type: Type.STRING },
              pronunciation: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["id", "german", "russian", "exampleGerman", "exampleRussian", "pronunciation", "category"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    const words = JSON.parse(text);
    return words.map((w: any) => ({ ...w, language: lang }));
  } catch (error) {
    console.error("Failed to fetch words:", error);
    throw error;
  }
}

export async function speakWord(text: string, lang: TargetLanguage = 'de'): Promise<void> {
  try {
    const voice = voiceMap[lang] || 'Kore';
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly in its native language: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (error) {
    console.error("TTS failed:", error);
  }
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
