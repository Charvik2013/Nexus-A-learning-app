import React from 'react';
import { PlayerState, Avatar, Artifact } from '../types';
import { User, Shield, Zap, Box, Star, Lock, CircuitBoard } from 'lucide-react';

interface ProfileVaultProps {
  player: PlayerState;
  avatars: Avatar[];
  onSelectAvatar: (id: string) => void;
  onClose: () => void;
}

const ProfileVault: React.FC<ProfileVaultProps> = ({ player, avatars, onSelectAvatar, onClose }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-space-light to-white">
          Access Vault
        </h2>
        <button onClick={onClose} className="text-space-light hover:text-white underline">
          Close Vault
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Avatars Section */}
        <div className="bg-space-800/40 p-6 rounded-2xl border border-space-700 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-space-accent" />
            <h3 className="text-xl font-bold text-white">Identity Matrices</h3>
          </div>
          <p className="text-sm text-space-light mb-6">Unlock new digital identities by leveling up.</p>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {avatars.map(avatar => {
              const isUnlocked = player.unlockedAvatars.includes(avatar.id);
              const isSelected = player.currentAvatar === avatar.id;
              
              return (
                <button
                  key={avatar.id}
                  disabled={!isUnlocked}
                  onClick={() => onSelectAvatar(avatar.id)}
                  className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                    isSelected 
                      ? 'border-space-accent bg-space-accent/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]' 
                      : isUnlocked 
                        ? 'border-space-700 bg-space-900/60 hover:bg-space-800 hover:border-space-600' 
                        : 'border-space-800 bg-space-900/40 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {!isUnlocked && (
                    <div className="absolute top-1 right-1">
                      <Lock size={12} className="text-space-light" />
                    </div>
                  )}
                  <div className={`${avatar.color} mb-1`}>
                    {avatar.icon === 'user' && <User />}
                    {avatar.icon === 'shield' && <Shield />}
                    {avatar.icon === 'zap' && <Zap />}
                    {avatar.icon === 'box' && <Box />}
                    {avatar.icon === 'star' && <Star />}
                  </div>
                  <span className="text-[10px] text-space-light font-mono truncate w-full px-2 text-center">
                    {isUnlocked ? avatar.name : `Lvl ${avatar.requiredLevel}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Artifacts Section */}
        <div className="bg-space-800/40 p-6 rounded-2xl border border-space-700 backdrop-blur-sm">
           <div className="flex items-center gap-2 mb-4">
            <CircuitBoard className="text-space-accent" />
            <h3 className="text-xl font-bold text-white">Relic Archive</h3>
          </div>
          <p className="text-sm text-space-light mb-6">Rare data fragments recovered from perfect runs.</p>

          {player.inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-space-light border border-dashed border-space-700 rounded-xl bg-space-900/20">
              <Box className="w-8 h-8 mb-2 opacity-50" />
              <p>No fragments recovered yet.</p>
              <p className="text-xs mt-1">Score 100% on quizzes to find them.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {player.inventory.map((item, idx) => (
                <div key={idx} className="bg-space-900/60 border border-space-700 p-3 rounded-lg flex items-start gap-3 hover:border-space-600 transition-colors">
                  <div className={`p-2 rounded bg-space-800 ${item.rarity === 'Legendary' ? 'text-yellow-400' : 'text-cyan-400'}`}>
                    <Box size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{item.name}</h4>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        item.rarity === 'Legendary' 
                          ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' 
                          : 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10'
                      }`}>
                        {item.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-space-light mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfileVault;