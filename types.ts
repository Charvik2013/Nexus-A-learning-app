export enum ViewState {
  GRADE_SELECT = 'GRADE_SELECT',
  DASHBOARD = 'DASHBOARD',
  QUIZ = 'QUIZ',
  ARCADE = 'ARCADE',
  VAULT = 'VAULT'
}

export interface PlayerState {
  xp: number;
  grade: number; // 1-12
  level: number;
  completedWorksheets: number;
  recentScores: number[]; 
  inventory: Artifact[];
  unlockedAvatars: string[];
  currentAvatar: string;
}

export interface Subject {
  id: string;
  name: string;
  topicKeyword: string; 
  description: string;
  icon: string; // lucide icon name
  color: string;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizData {
  topic: string;
  grade: number;
  questions: Question[];
}

export interface GeminiQuizResponse {
  questions: {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }[];
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
  rarity: 'Common' | 'Rare' | 'Legendary';
  dateAcquired: number;
}

export interface Avatar {
  id: string;
  name: string;
  icon: string;
  color: string;
  requiredLevel: number;
}
