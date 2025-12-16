import React, { useState, useEffect } from 'react';
import { QuizData, Question } from '../types';
import { CheckCircle, XCircle, ArrowRight, BrainCircuit, AlertTriangle, ShieldAlert, Star, Timer, BookOpenCheck } from 'lucide-react';

interface QuizArenaProps {
  quizData: QuizData;
  timeLimit?: number; // Optional time limit in seconds
  onComplete: (score: number, totalQuestions: number) => void;
  onExit: () => void;
}

const QuizArena: React.FC<QuizArenaProps> = ({ quizData, timeLimit, onComplete, onExit }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(timeLimit || null);

  const currentQuestion: Question = quizData.questions[currentQIndex];

  // Timer Logic
  useEffect(() => {
    if (timeLeft === null || showResults) return;

    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQIndex < quizData.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const finishQuiz = () => {
    setShowResults(true); 
  };

  const submitResults = () => {
    onComplete(score, quizData.questions.length);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const passed = (score / quizData.questions.length) >= 0.5;
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 animate-in fade-in zoom-in duration-500">
        <div className="glass-panel p-8 rounded-2xl border border-space-700 shadow-2xl max-w-md w-full text-center bg-space-800/80">
          <div className={`mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center ${passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {passed ? <Star className="w-10 h-10 fill-current" /> : <AlertTriangle className="w-10 h-10" />}
          </div>
          
          <h2 className="text-3xl font-bold mb-2 text-white">
            {passed ? "Worksheet Complete!" : "Keep Practicing"}
          </h2>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-green-300 mb-6">
            {Math.round((score / quizData.questions.length) * 100)}%
          </div>
          <p className="text-space-light mb-8">
            You answered {score} out of {quizData.questions.length} correctly.
          </p>
          <button
            onClick={submitResults}
            className={`w-full font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg ${
                passed 
                ? 'bg-space-accent hover:bg-cyan-300 text-space-900 shadow-cyan-900/50'
                : 'bg-space-700 hover:bg-space-600 text-white'
            }`}
          >
            {passed ? "Claim Reward & Unlock Games" : "Return to Dashboard"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <div className="text-sm font-medium text-space-light uppercase tracking-wider opacity-80">
            {quizData.topic}
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold border px-2 py-0.5 rounded-full w-fit mt-1 text-space-light border-space-600`}>
            <BookOpenCheck size={12} />
            <span>Grade {quizData.grade}</span>
          </div>
        </div>
        
        {/* Timer & Progress */}
        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
              <Timer className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs bg-space-800 px-2 py-1 rounded text-space-light border border-space-700">
              Q{currentQIndex + 1}/{quizData.questions.length}
            </span>
            <button onClick={onExit} className="text-space-light hover:text-white text-sm">Esc</button>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel rounded-2xl border border-space-700 p-6 md:p-8 shadow-xl relative overflow-hidden bg-space-800/60">
        {/* Progress Bar Top */}
        <div className="absolute top-0 left-0 h-1 bg-space-900 w-full">
            <div 
                className="h-full bg-space-accent transition-all duration-300 shadow-[0_0_10px_#22d3ee]" 
                style={{ width: `${((currentQIndex) / quizData.questions.length) * 100}%`}}
            />
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-white mb-6 leading-relaxed drop-shadow-sm">
          {currentQuestion.text}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let btnClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 flex justify-between items-center group ";
            
            if (isAnswered) {
              if (idx === currentQuestion.correctIndex) {
                btnClass += "bg-green-900/60 border-green-400 text-green-100";
              } else if (idx === selectedOption) {
                btnClass += "bg-red-900/60 border-red-400 text-red-100";
              } else {
                btnClass += "bg-space-900/40 border-space-700 text-space-light opacity-50";
              }
            } else {
              btnClass += "bg-space-900/40 border-space-700 hover:border-space-accent hover:bg-space-800 text-space-light hover:text-white";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isAnswered}
                className={btnClass}
              >
                <span>{option}</span>
                {isAnswered && idx === currentQuestion.correctIndex && <CheckCircle className="w-5 h-5 text-green-400" />}
                {isAnswered && idx === selectedOption && idx !== currentQuestion.correctIndex && <XCircle className="w-5 h-5 text-red-400" />}
              </button>
            );
          })}
        </div>

        {/* Feedback Area */}
        {isAnswered && (
          <div className="mt-6 p-4 bg-space-900/60 rounded-lg border border-space-600 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {selectedOption === currentQuestion.correctIndex 
                  ? <CheckCircle className="w-5 h-5 text-green-400" />
                  : <AlertTriangle className="w-5 h-5 text-yellow-400" />
                }
              </div>
              <div>
                <h4 className="font-bold text-sm text-white mb-1">
                  {selectedOption === currentQuestion.correctIndex ? "Correct" : "Incorrect"}
                </h4>
                <p className="text-sm text-space-light leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-space-accent hover:bg-cyan-300 text-space-900 px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-cyan-900/30"
              >
                {currentQIndex < quizData.questions.length - 1 ? "Next" : "Finish"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizArena;
