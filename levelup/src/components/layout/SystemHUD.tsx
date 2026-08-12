"use client";

import { motion } from "framer-motion";
import { User, Flame, Zap, Shield } from "lucide-react";

interface SystemHUDProps {
  xp: number;
  level: number;
  dailyStreak: number;
  answerStreak: number;
}

export default function SystemHUD({ xp, level, dailyStreak, answerStreak }: SystemHUDProps) {
  const xpPerLevel = 250;
  const currentLevelXp = xp % xpPerLevel;
  const xpPercentage = (currentLevelXp / xpPerLevel) * 100;

  return (
    <div className="w-full bg-black/60 backdrop-blur-xl border-b border-[#00e5ff]/30 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Profile Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            <User className="text-[#00e5ff]" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-widest font-mono">
              Rishi Bhanushali <span className="text-[#808080] text-sm">(Necromancer)</span>
            </h1>
            <p className="text-[#00e5ff] text-sm font-bold uppercase tracking-widest">Level {level} Hunter</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="flex-1 max-w-md w-full">
          <div className="flex justify-between text-xs font-mono mb-1 text-gray-400">
            <span>XP PROGRESS</span>
            <span>{currentLevelXp} / {xpPerLevel}</span>
          </div>
          <div className="w-full h-3 bg-[#111] rounded-full overflow-hidden border border-[#333]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#0066cc] to-[#00e5ff] shadow-[0_0_10px_#00e5ff]"
            />
          </div>
        </div>

        {/* Streaks */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[#ffc700] font-bold text-lg">
              <Flame size={20} className="animate-pulse" /> {dailyStreak}
            </div>
            <span className="text-[10px] text-gray-500 font-mono uppercase">Daily Streak</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[#00e5ff] font-bold text-lg">
              <Zap size={20} className={answerStreak >= 3 ? "animate-pulse" : ""} /> {answerStreak}
            </div>
            <span className="text-[10px] text-gray-500 font-mono uppercase">Answer Streak</span>
          </div>
        </div>

      </div>
    </div>
  );
}
