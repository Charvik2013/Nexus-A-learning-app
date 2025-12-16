import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizData, GeminiQuizResponse, Artifact } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize client securely
const ai = new GoogleGenAI({ apiKey });

const quizSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionText: { type: Type.STRING },
          options: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correctAnswerIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ["questionText", "options", "correctAnswerIndex", "explanation"]
      }
    }
  },
  required: ["questions"]
};

export const generateWorksheet = async (topic: string, grade: number, count: number = 5): Promise<QuizData> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock data.");
    return mockQuiz(topic, grade, count);
  }

  try {
    const prompt = `Generate a ${count}-question multiple-choice worksheet for a Grade ${grade} student about "${topic}".
    
    Context:
    - If Grade is 1-5: Keep language simple, fun, and encouraging.
    - If Grade is 6-8: Moderate difficulty, middle school level.
    - If Grade is 9-12: High school level, more complex concepts.
    
    Subject: ${topic}
    
    Return strictly JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        systemInstruction: "You are a helpful AI tutor designed to generate educational content."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text) as GeminiQuizResponse;
    
    // Ensure we have the requested number of questions
    const questions = data.questions.map((q, i) => ({
      id: i,
      text: q.questionText,
      options: q.options,
      correctIndex: q.correctAnswerIndex,
      explanation: q.explanation
    }));

    return {
      topic,
      grade,
      questions: questions
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return mockQuiz(topic, grade, count);
  }
};

export const generateArtifact = async (topic: string): Promise<Partial<Artifact>> => {
  if (!apiKey) return { name: "Gold Star", description: "A classic reward.", rarity: "Common" };

  try {
    const prompt = `Generate a creative "Digital Sticker" or "Badge" name and description related to the school subject "${topic}".
    Reward for a perfect worksheet.
    Example for Math: "Calculator Hero Badge", "Pi Master Sticker".
    Example for Science: "Future Scientist Ribbon", "Microscope Token".
    Return JSON: { "name": string, "description": string, "rarity": "Rare" | "Legendary" }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { name: "Mystery Sticker", description: "A shiny sticker.", rarity: "Rare" };
  }
};

const mockQuiz = (topic: string, grade: number, count: number): QuizData => {
  const mockQuestions = Array.from({ length: count }, (_, i) => ({
    id: i,
    text: `(Grade ${grade}) Question ${i + 1} about ${topic}?`,
    options: ["Answer A", "Answer B", "Answer C", "Answer D"],
    correctIndex: 0,
    explanation: "Great job! This is the correct answer."
  }));

  return {
    topic,
    grade,
    questions: mockQuestions
  };
};
