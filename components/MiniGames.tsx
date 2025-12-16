import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCcw, Gamepad2, Timer, AlertCircle, Zap } from 'lucide-react';

// --- GAME 1: MEMORY MATRIX ---
const MemoryGame = ({ onComplete }: { onComplete: () => void }) => {
  const icons = ['🤖', '🚀', '⭐', '🧬', '📐', '🧠', '⚡', '🔋'];
  const [cards, setCards] = useState<{ id: number; content: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    // Select 6 icons (12 cards total) for a quick game
    const gameIcons = icons.slice(0, 6);
    const doubled = [...gameIcons, ...gameIcons];
    const shuffled = doubled.sort(() => Math.random() - 0.5).map((icon, i) => ({
      id: i,
      content: icon,
      flipped: false,
      matched: false
    }));
    setCards(shuffled);
  }, []);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [first, second] = flippedIndices;
      if (cards[first].content === cards[second].content) {
        setCards(prev => prev.map((c, i) => 
          i === first || i === second ? { ...c, matched: true } : c
        ));
        setMatchedCount(p => p + 1);
        setFlippedIndices([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            i === first || i === second ? { ...c, flipped: false } : c
          ));
          setFlippedIndices([]);
        }, 800);
      }
    }
  }, [flippedIndices, cards]);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length >= 2 || cards[index].flipped || cards[index].matched) return;
    
    setCards(prev => prev.map((c, i) => i === index ? { ...c, flipped: true } : c));
    setFlippedIndices(prev => [...prev, index]);
  };

  if (matchedCount === 6) {
    return (
      <div className="text-center p-8 animate-in zoom-in">
        <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce" />
        <h2 className="text-3xl font-bold mb-2 text-white">Victory!</h2>
        <p className="mb-6 text-space-light">Memory modules synchronized.</p>
        <button onClick={onComplete} className="bg-space-accent hover:bg-cyan-300 text-space-900 px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105">
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(idx)}
            className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all duration-300 transform ${
              card.flipped || card.matched 
                ? 'bg-gradient-to-br from-space-accent to-blue-500 rotate-y-180 scale-100 shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                : 'bg-space-800 border border-space-700 hover:bg-space-700 hover:scale-95'
            }`}
          >
            {(card.flipped || card.matched) ? card.content : ''}
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-space-light mt-6">Find all matching pairs to win.</p>
    </div>
  );
};

// --- GAME 2: CYBER REFLEX ---
const ReflexGame = ({ onComplete }: { onComplete: () => void }) => {
    const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        if (gameStarted && timeLeft > 0 && !gameOver) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setGameOver(true);
        }
    }, [timeLeft, gameOver, gameStarted]);

    const moveTarget = () => {
        setScore(s => s + 10);
        setTargetPos({
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`
        });
    };

    const startGame = () => {
        setGameStarted(true);
        moveTarget();
    }

    if (!gameStarted) {
        return (
             <div className="text-center p-10">
                <Timer className="w-16 h-16 text-space-accent mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Cyber Reflex</h3>
                <p className="text-space-light mb-6">Click the targets as fast as you can in 15 seconds!</p>
                <button onClick={startGame} className="bg-space-accent text-space-900 px-8 py-3 rounded-xl font-bold">Start Game</button>
            </div>
        )
    }

    if (gameOver) {
        return (
            <div className="text-center p-10 animate-in zoom-in">
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Time's Up!</h2>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mb-6">
                    {score} PTS
                </div>
                <button onClick={onComplete} className="bg-space-accent hover:bg-cyan-300 text-space-900 px-8 py-3 rounded-xl font-bold">
                    Collect Rewards
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-lg h-80 bg-space-900/50 rounded-2xl overflow-hidden border border-space-600 cursor-crosshair mx-auto shadow-inner">
            <div className="absolute top-4 left-4 right-4 flex justify-between text-lg font-mono font-bold text-white z-10 pointer-events-none">
                <span className="text-red-400">Time: {timeLeft}s</span>
                <span className="text-cyan-400">Score: {score}</span>
            </div>
            <button
                onMouseDown={moveTarget}
                style={{ top: targetPos.top, left: targetPos.left }}
                className="absolute w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)] transform -translate-x-1/2 -translate-y-1/2 active:scale-90 transition-all duration-75 border-2 border-white"
            >
                <div className="absolute inset-0 bg-white opacity-20 rounded-full animate-ping"></div>
            </button>
        </div>
    );
}

interface MiniGamesProps {
    onExit: () => void;
}

const MiniGames: React.FC<MiniGamesProps> = ({ onExit }) => {
    const [selectedGame, setSelectedGame] = useState<'memory' | 'reflex' | null>(null);

    if (selectedGame === 'memory') {
        return <MemoryGame onComplete={onExit} />;
    }
    
    if (selectedGame === 'reflex') {
        return <ReflexGame onComplete={onExit} />;
    }

    return (
        <div className="max-w-2xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4">
            <Gamepad2 className="w-16 h-16 text-space-accent mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">The Arcade</h2>
            <p className="text-space-light mb-8 max-w-md mx-auto">
                Excellent work on your worksheet! You've unlocked the game zone. Choose your reward.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                    onClick={() => setSelectedGame('memory')}
                    className="group relative p-6 bg-space-800/60 rounded-2xl border border-space-700 hover:border-space-accent hover:bg-space-800 transition-all text-left overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Timer size={100} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400">Memory Matrix</h3>
                    <p className="text-sm text-space-light">Match symbols to synchronize the system.</p>
                </button>

                <button 
                    onClick={() => setSelectedGame('reflex')}
                    className="group relative p-6 bg-space-800/60 rounded-2xl border border-space-700 hover:border-space-accent hover:bg-space-800 transition-all text-left overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={100} /> {/* Assuming Zap is imported or exists */}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400">Cyber Reflex</h3>
                    <p className="text-sm text-space-light">Test your reaction speed against moving targets.</p>
                </button>
            </div>
            
             <button onClick={onExit} className="mt-12 text-space-light hover:text-white underline">
                Skip Games & Return to Dashboard
            </button>
        </div>
    );
};

export default MiniGames;