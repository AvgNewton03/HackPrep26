"use client";

import { motion } from "framer-motion";
import { Trophy, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Hunter {
  id: string;
  name: string;
  rank: number;
  class: string;
  level: number;
  isCurrentUser?: boolean;
}

// Mock data removed

interface LeaderboardProps {
  currentUsername?: string;
  currentLevel?: number;
  currentClass?: string;
  currentUserId?: string;
}

export default function Leaderboard({ currentUsername = "Hunter", currentLevel = 1, currentClass = "E-Rank Hunter", currentUserId }: LeaderboardProps) {
  const [hunters, setHunters] = useState<Hunter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('hunters')
        .select('id, username, level, mana_xp')
        .order('mana_xp', { ascending: false })
        .limit(10);
      
      if (data) {
        setHunters(data.map((h, i) => {
          let title = "E-Class";
          if (i === 0) title = "National Level";
          else if (i <= 2) title = "S-Class";
          else title = "A-Class";
          
          return {
            id: h.id,
            name: h.username,
            rank: i + 1,
            class: title,
            level: h.level
          };
        }));
      }
      setIsLoading(false);
    };
    fetchLeaderboard();
  }, []);
  const currentUser: Hunter = {
    id: "usr_12345",
    name: currentUsername,
    rank: 42,
    class: currentClass,
    level: currentLevel,
    isCurrentUser: true,
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) {
      return "bg-[#ffc700]/10 border-[#ffc700] text-[#ffc700] shadow-[0_0_15px_rgba(255,199,0,0.3)]";
    }
    if (rank === 2 || rank === 3) {
      return "bg-purple-900/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]";
    }
    return "bg-cyan-950/20 border-cyan-900 text-[#00e5ff]";
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6 relative">
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <div className="w-16 h-16 rounded-xl bg-cyan-950/50 border border-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)]">
          <Trophy className="text-[#00e5ff]" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-widest text-white uppercase shadow-cyan-500/50 drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]">
            Hunter Association Rankings
          </h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase">Global Classification System</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2 pb-28">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#00e5ff]" />
              <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase animate-pulse">SYSTEM: Accessing Hunter Association Database...</p>
            </div>
          ) : (
            hunters.map((hunter, index) => {
              const isMe = hunter.id === currentUserId;
              return (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={hunter.id}
                  className={`flex items-center p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
                    isMe 
                      ? "bg-yellow-900/30 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]" 
                      : getRankStyle(hunter.rank)
                  }`}
                >
                  <div className="w-12 text-center font-bold text-xl font-mono">
                    {hunter.rank === 1 ? <Crown className={isMe ? "mx-auto text-yellow-500" : "mx-auto"} size={24} /> : `#${hunter.rank}`}
                  </div>
                  <div className="flex-1 ml-4">
                    <h3 className={`font-bold text-lg tracking-wider uppercase ${isMe ? "text-yellow-400" : "text-white"}`}>
                      {hunter.name} {isMe && "(You)"}
                    </h3>
                    <p className={`text-xs uppercase tracking-widest opacity-80 ${isMe ? "text-yellow-200" : ""}`}>{hunter.class}</p>
                  </div>
                  <div className={`text-right ${isMe ? "text-yellow-400" : ""}`}>
                    <div className="font-mono font-bold text-xl">LVL {hunter.level}</div>
                    <div className="text-xs uppercase tracking-widest opacity-80">Hunter</div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Current User Fixed at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-6 right-6 p-4 rounded-lg border bg-cyan-950/80 border-cyan-400 backdrop-blur-xl shadow-[0_0_30px_rgba(0,229,255,0.4)] flex items-center"
      >
        <div className="w-12 text-center font-bold text-xl font-mono text-[#00e5ff]">
          #{currentUser.rank}
        </div>
        <div className="flex-1 ml-4">
          <h3 className="font-bold text-lg tracking-wider uppercase text-white">{currentUser.name} (You)</h3>
          <p className="text-xs uppercase tracking-widest text-[#00e5ff]">{currentUser.class}</p>
        </div>
        <div className="text-right text-[#00e5ff]">
          <div className="font-mono font-bold text-xl">LVL {currentUser.level}</div>
          <div className="text-xs uppercase tracking-widest">Hunter</div>
        </div>
      </motion.div>
    </div>
  );
}
