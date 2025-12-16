
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-space-700 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-space-accent rounded-full animate-spin"></div>
                </div>
                <p className="text-space-light animate-pulse font-mono text-lg">Generating Worksheet...</p>
            </div>
        ) : (
            <>
                {view === ViewState.GRADE_SELECT && renderGradeSelector()}
                {view === ViewState.DASHBOARD && renderDashboard()}
                {view === ViewState.QUIZ && quizData && (
                    <QuizArena 
                        quizData={quizData} 
                        onComplete={handleWorksheetComplete} 
                        onExit={() => setView(ViewState.DASHBOARD)} 
                    />
                )}
                {view === ViewState.ARCADE && (
                    <div className="flex-1 flex flex-col justify-center">
                        <MiniGames onExit={() => setView(ViewState.DASHBOARD)} />
                    </div>
                )}
                {view === ViewState.VAULT && (
                    <ProfileVault 
                        player={player}
                        avatars={AVATARS}
                        onSelectAvatar={handleAvatarSelect}
                        onClose={() => setView(ViewState.DASHBOARD)}
                    />
                )}
            </>
        )}
      </main>

    </div>
  );
};

export default App;import React, { useState, useEffect } from 'react';
import { ViewState, PlayerState, Subject, Avatar, Artifact } from './types';
import { generateWorksheet, generateArtifact } from './services/geminiService';
import QuizArena from './components/QuizArena';
import ProfileVault from './components/ProfileVault';
import MiniGames from './components/MiniGames';
import { Star, BookOpen, User, Search, Calculator, FlaskConical, Languages, Globe, Code, GraduationCap, LayoutGrid, Gamepad2 } from 'lucide-react';

// --- Constants ---
const SUBJECTS: Subject[] = [
  { 
    id: 'math', 
    name: 'Mathematics', 
    topicKeyword: 'Math',
    description: 'Numbers, Logic, and Problem Solving.', 
    icon: 'calculator',
    color: 'text-blue-400', 
  },
  { 
    id: 'science', 
    name: 'Science', 
    topicKeyword: 'Science',
    description: 'Biology, Chemistry, and Physics.', 
    icon: 'flask',
    color: 'text-green-400',
  },
  { 
    id: 'english', 
    name: 'English', 
    topicKeyword: 'English Language Arts',
    description: 'Grammar, Reading Comprehension, and Vocabulary.', 
    icon: 'languages',
    color: 'text-yellow-400',
  },
  { 
    id: 'history', 
    name: 'History', 
    topicKeyword: 'History',
    description: 'Past events, Civilizations, and Cultures.', 
    icon: 'globe',
    color: 'text-orange-400',
  },
  {
    id: 'coding',
    name: 'Coding',
    topicKeyword: 'Computer Science',
    description: 'Logic, Algorithms, and Digital Skills.',
    icon: 'code',
    color: 'text-purple-400'
  }
];

const AVATARS: Avatar[] = [
  { id: 'student', name: 'Student', icon: 'user', color: 'text-space-light', requiredLevel: 1 },
  { id: 'scholar', name: 'Scholar', icon: 'box', color: 'text-blue-400', requiredLevel: 3 },
  { id: 'graduate', name: 'Graduate', icon: 'star', color: 'text-cyan-400', requiredLevel: 5 },
  { id: 'professor', name: 'Professor', icon: 'shield', color: 'text-green-400', requiredLevel: 10 },
  { id: 'genius', name: 'Genius', icon: 'zap', color: 'text-indigo-400', requiredLevel: 20 },
];

const INITIAL_PLAYER_STATE: PlayerState = {
  xp: 0,
  grade: 0, // 0 means not selected yet
  level: 1,
  completedWorksheets: 0,
  recentScores: [],
  inventory: [],
  unlockedAvatars: ['student'],
  currentAvatar: 'student'
};

// --- Main App Component ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [customTopic, setCustomTopic] = useState("");

  // Load state
  useEffect(() => {
    const saved = localStorage.getItem('nexus_school_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPlayer({ ...INITIAL_PLAYER_STATE, ...parsed });
      // If user hasn't selected grade yet, force that view
      if (!parsed.grade || parsed.grade === 0) {
        setView(ViewState.GRADE_SELECT);
      }
    } else {
      setView(ViewState.GRADE_SELECT);
    }
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem('nexus_school_v1', JSON.stringify(player));
    
    // Check for Avatar Unlocks
    let newAvatars = [...player.unlockedAvatars];
    AVATARS.forEach(avatar => {
        if (player.level >= avatar.requiredLevel && !player.unlockedAvatars.includes(avatar.id)) {
            newAvatars.push(avatar.id);
        }
    });

    if (newAvatars.length > player.unlockedAvatars.length) {
        setPlayer(prev => ({ ...prev, unlockedAvatars: newAvatars }));
    }

  }, [player.xp, player.level, player.grade]);

  const handleGradeSelect = (grade: number) => {
    setPlayer(prev => ({ ...prev, grade }));
    setView(ViewState.DASHBOARD);
  };

  const handleSubjectSelect = async (subject: Subject) => {
    setActiveSubject(subject);
    startWorksheet(subject.topicKeyword);
  };

  const handleCustomSubject = () => {
    if (!customTopic.trim()) return;
    const tempSubject: Subject = {
      id: 'custom',
      name: customTopic,
      topicKeyword: customTopic,
      description: 'Custom Study Module',
      icon: 'search',
      color: 'text-white'
    };
    setActiveSubject(tempSubject);
    startWorksheet(customTopic);
  };

  const startWorksheet = async (topic: string) => {
    setLoading(true);
    // Always generate 5 questions for a worksheet
    const data = await generateWorksheet(topic, player.grade, 5);
    setQuizData(data);
    setView(ViewState.QUIZ);
    setLoading(false);
  };

  const handleWorksheetComplete = async (score: number, totalQuestions: number) => {
    const percentage = score / totalQuestions;
    const xpEarned = (score * 20) + (totalQuestions * 5); 
    
    const newHistory = [...player.recentScores, percentage].slice(-5);
    
    // Chance for artifact if score is perfect
    let newArtifact: Artifact | null = null;
    if (percentage === 1.0 && activeSubject) {
        const artifactData = await generateArtifact(activeSubject.topicKeyword);
        if (artifactData && artifactData.name) {
            newArtifact = {
                id: Date.now().toString(),
                name: artifactData.name || "Sticker",
                description: artifactData.description || "A reward for excellence.",
                rarity: (artifactData.rarity as any) || 'Common',
                dateAcquired: Date.now()
            };
        }
    }

    setPlayer(prev => ({
      ...prev,
      xp: prev.xp + xpEarned,
      completedWorksheets: prev.completedWorksheets + 1,
      level: Math.floor((prev.xp + xpEarned) / 300) + 1,
      recentScores: newHistory,
      inventory: newArtifact ? [...prev.inventory, newArtifact] : prev.inventory
    }));
    
    // If passed (>50%), go to Arcade
    if (percentage >= 0.5) {
        setView(ViewState.ARCADE);
    } else {
        setView(ViewState.DASHBOARD);
    }
  };

  const handleAvatarSelect = (id: string) => {
    setPlayer(prev => ({ ...prev, currentAvatar: id }));
  };

  const renderGradeSelector = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in slide-in-from-bottom-8">
      <GraduationCap className="w-20 h-20 text-space-accent mb-6" />
      <h1 className="text-4xl md:text-5xl font-black text-white mb-4 text-center">Student Profile</h1>
      <p className="text-space-light text-xl mb-10 text-center">Select your current Grade Level to initialize the curriculum.</p>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-3xl w-full">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
          <button
            key={grade}
            onClick={() => handleGradeSelect(grade)}
            className="p-6 rounded-xl bg-space-800 border-2 border-space-700 hover:border-space-accent hover:bg-space-700 hover:scale-105 transition-all flex flex-col items-center gap-2 group"
          >
            <span className="text-sm text-space-light group-hover:text-white uppercase font-bold">Grade</span>
            <span className="text-3xl font-black text-white group-hover:text-cyan-300">{grade}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mb-4 tracking-tight">
          NEXUS LEARNING
        </h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-space-800 rounded-full border border-space-700 text-space-light">
          <GraduationCap size={18} />
          <span className="font-bold">Grade {player.grade} Curriculum</span>
          <button onClick={() => setView(ViewState.GRADE_SELECT)} className="ml-2 text-xs text-space-accent hover:underline">Change</button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="mb-12 max-w-xl mx-auto">
        <div className="relative flex items-center bg-space-900 rounded-xl p-2 border border-space-700 focus-within:border-space-accent transition-colors">
            <Search className="ml-3 text-space-light w-5 h-5" />
            <input 
                type="text" 
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Study any topic (e.g. 'Dinosaurs', 'Fractions')"
                className="w-full bg-transparent text-white px-4 py-3 focus:outline-none placeholder-space-700"
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubject()}
            />
            <button 
                onClick={handleCustomSubject}
                className="bg-space-accent hover:bg-cyan-400 text-space-900 px-6 py-2 rounded-lg font-bold transition-transform active:scale-95"
            >
                Start
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUBJECTS.map((subject) => (
          <button
            key={subject.id}
            onClick={() => handleSubjectSelect(subject)}
            className="relative group flex flex-col items-start text-left p-6 rounded-2xl border-2 border-space-700 bg-space-900/40 hover:bg-space-800 hover:border-space-accent transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
          >
            <div className={`p-3 rounded-xl mb-4 bg-space-800 group-hover:bg-space-700 transition-colors ${subject.color}`}>
              {subject.icon === 'calculator' && <Calculator size={28} />}
              {subject.icon === 'flask' && <FlaskConical size={28} />}
              {subject.icon === 'languages' && <Languages size={28} />}
              {subject.icon === 'globe' && <Globe size={28} />}
              {subject.icon === 'code' && <Code size={28} />}
            </div>
            
            <h3 className={`text-2xl font-bold mb-2 text-white group-hover:text-cyan-300`}>{subject.name}</h3>
            <p className="text-sm text-space-light mb-6">{subject.description}</p>
            
            <div className="mt-auto flex items-center gap-2 text-xs font-bold text-space-accent uppercase tracking-wider">
               <BookOpen size={14} />
               <span>Start Worksheet</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white font-sans selection:bg-space-accent selection:text-space-900 overflow-x-hidden">
      
      {/* Top Navigation / Stats Bar (Only show if not in Grade Select) */}
      {view !== ViewState.GRADE_SELECT && (
        <div className="sticky top-0 z-50 glass-panel border-b-0 border-b-space-700/30">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div 
                    className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setView(ViewState.DASHBOARD)}
                >
                    <div className="w-8 h-8 bg-space-accent rounded-lg flex items-center justify-center">
                        <LayoutGrid className="w-5 h-5 text-space-900" />
                    </div>
                    <span className="hidden sm:block">Nexus</span>
                </div>

                <div className="flex items-center gap-4 md:gap-8">
                    {/* Vault Button */}
                    <button 
                        onClick={() => setView(ViewState.VAULT)}
                        className="flex items-center gap-2 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <User className="w-4 h-4 text-space-light" />
                        <span className="text-xs font-bold hidden sm:inline">Profile</span>
                    </button>

                    {/* Level Badge */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-space-800 border border-space-600 flex items-center justify-center text-xs font-bold text-cyan-400 shadow-inner">
                            {player.level}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-space-light uppercase tracking-wider font-bold">Lvl</span>
                            <div className="w-24 h-1.5 bg-space-800 rounded-full overflow-hidden border border-space-700/50">
                                <div className="h-full bg-gradient-to-r from-cyan-400 to-green-500 transition-all duration-500" style={{ width: `${(player.xp % 300) / 3}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* XP Counter */}
                    <div className="flex items-center gap-2 bg-space-900/80 px-3 py-1.5 rounded-lg border border-space-700/50">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-mono font-bold text-white">{player.xp}</span>
                    </div>
                </div>
            </div>
        </div>
      )}

      <main className="min-h-[calc(100vh-64px)] flex flex-col">
        {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
