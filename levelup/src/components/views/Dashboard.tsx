"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { topics, badges } from "@/lib/mockData";
import { twMerge } from "tailwind-merge";
import { Lock, ShieldAlert, Flame } from "lucide-react";

interface DashboardProps {
  unlockedBadges: string[];
  onSelectTopic: (topicId: string, topicName: string, rank: string) => void;
  onEnterPenaltyZone?: () => void;
  onGenerateCustomQuest?: (topic: string) => void;
}

const rankColors: Record<string, string> = {
  E: "border-gray-500 text-gray-400 shadow-gray-500/20",
  D: "border-green-500 text-green-400 shadow-green-500/20",
  C: "border-[#00e5ff] text-[#00e5ff] shadow-[#00e5ff]/20",
  B: "border-purple-500 text-purple-400 shadow-purple-500/20",
  A: "border-orange-500 text-orange-400 shadow-orange-500/20",
  S: "border-[#ff003c] text-[#ff003c] shadow-[#ff003c]/20",
};

export default function Dashboard({ unlockedBadges, onSelectTopic, onEnterPenaltyZone, onGenerateCustomQuest }: DashboardProps) {
  const [customTopic, setCustomTopic] = useState("");

  const handleGenerate = () => {
    if (customTopic.trim() && onGenerateCustomQuest) {
      onGenerateCustomQuest(customTopic.trim());
    }
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto w-full p-8"
    >
      
      {/* Red Gate Alert */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="mb-12 bg-black/40 backdrop-blur-md border border-[#ff003c] p-6 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer group shadow-[0_0_15px_rgba(255,0,60,0.2)] hover:shadow-[0_0_30px_rgba(255,0,60,0.4)] transition-all"
      >
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <ShieldAlert size={40} className="text-[#ff003c] animate-pulse" />
          <div>
            <h3 className="text-[#ff003c] font-bold text-xl tracking-widest uppercase mb-1">Red Gate Detected</h3>
            <p className="text-gray-300">Daily Challenge: Survive 60 seconds of rapid-fire questions.</p>
          </div>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onEnterPenaltyZone) onEnterPenaltyZone();
          }}
          className="bg-transparent border border-[#ff003c] text-[#ff003c] group-hover:bg-[#ff003c] group-hover:text-black font-mono font-bold tracking-widest px-6 py-3 transition-colors"
        >
          ENTER PENALTY ZONE
        </button>
      </motion.div>

      {/* Custom Quest Generator */}
      <div className="mb-12 bg-black/40 backdrop-blur-md border border-[#00e5ff] p-6 rounded-sm shadow-[0_0_15px_rgba(0,229,255,0.1)]">
        <h2 className="text-[#00e5ff] font-mono text-sm tracking-widest uppercase mb-4">&gt; Custom Quest Generator</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            maxLength={50}
            placeholder="Enter any topic to learn... (max 50 chars)"
            className="flex-1 bg-black/60 border border-[#333] focus:border-[#00e5ff] rounded-sm px-4 py-3 text-white font-mono tracking-wide outline-none transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button 
            onClick={handleGenerate}
            disabled={!customTopic.trim()}
            className="bg-[#00e5ff]/10 border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black disabled:opacity-50 disabled:hover:bg-[#00e5ff]/10 disabled:hover:text-[#00e5ff] font-mono font-bold tracking-widest px-8 py-3 transition-colors rounded-sm"
          >
            GENERATE QUEST
          </button>
        </div>
      </div>

      {/* Gates Grid */}
      <div className="mb-12">
        <h2 className="text-[#00e5ff] font-mono text-sm tracking-widest uppercase mb-6">&gt; Available Gates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topics.map((topic, i) => {
            const rankStyle = rankColors[topic.rank];
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => onSelectTopic(topic.id, topic.title, topic.rank)}
                className="bg-black/60 backdrop-blur-md p-6 border border-[#333] hover:border-[#00e5ff] rounded-sm cursor-pointer flex flex-col h-56 transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] relative"
              >
                <div className={twMerge("absolute top-0 right-0 px-3 py-1 text-xs font-bold font-mono border-b border-l rounded-bl-sm bg-black/80", rankStyle)}>
                  RANK {topic.rank}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 pr-12">{topic.title}</h3>
                <p className="text-gray-400 text-sm flex-1">{topic.description}</p>
                <div className="mt-4 text-[#00e5ff] text-xs font-mono tracking-widest uppercase">
                  ENTER DUNGEON &gt;
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Badges Gallery */}
      <div>
        <h2 className="text-[#ffc700] font-mono text-sm tracking-widest uppercase mb-6">&gt; Hunter Milestones</h2>
        <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar">
          {badges.map((badge, i) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={twMerge(
                  "min-w-[250px] p-4 border rounded-sm flex items-start gap-4 transition-all bg-black/60 backdrop-blur-md",
                  isUnlocked 
                    ? "border-[#ffc700]/50 shadow-[0_0_15px_rgba(255,199,0,0.15)] opacity-100" 
                    : "border-[#333] opacity-40 grayscale"
                )}
              >
                <div className={twMerge("p-3 rounded-full border", isUnlocked ? "border-[#ffc700] text-[#ffc700] bg-[#ffc700]/10" : "border-[#555] text-[#555]")}>
                  {isUnlocked ? <Flame size={24} /> : <Lock size={24} />}
                </div>
                <div>
                  <h4 className={twMerge("font-bold text-sm mb-1 uppercase tracking-wider", isUnlocked ? "text-white" : "text-gray-500")}>
                    {badge.name}
                  </h4>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </motion.div>
  );
}
