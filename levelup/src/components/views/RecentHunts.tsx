"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ShieldAlert, CheckCircle2, XCircle, Clock } from "lucide-react";
import { RaidHistory } from "@/types/database";
import { getRecentHuntsAction } from "@/app/actions/history";
import { twMerge } from "tailwind-merge";

export default function RecentHunts() {
  const [history, setHistory] = useState<RaidHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await getRecentHuntsAction("usr_12345"); // In a real app, use the actual logged-in ID
        if (res.success && res.data) {
          setHistory(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto w-full p-8"
    >
      <div className="flex items-center gap-4 mb-8 border-b border-[#333] pb-4">
        <History size={32} className="text-[#00e5ff]" />
        <h1 className="text-3xl font-bold text-white uppercase tracking-widest">Recent Hunts</h1>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#00e5ff] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#00e5ff] font-mono tracking-widest uppercase text-sm animate-pulse">Syncing Database...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-black/40 border border-[#333] rounded-sm">
          <ShieldAlert size={60} className="text-gray-600 mb-4" />
          <h2 className="text-xl text-gray-400 font-mono tracking-widest uppercase">No hunts completed yet!</h2>
          <p className="text-gray-500 mt-2">Enter a Dungeon or generate a Custom Quest to begin.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {history.map((hunt, i) => (
              <motion.div
                key={hunt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={twMerge(
                  "bg-black/60 backdrop-blur-md border p-6 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                  hunt.boss_defeated ? "border-[#00e5ff]/30 hover:border-[#00e5ff]" : "border-[#ff003c]/30 hover:border-[#ff003c]"
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={twMerge(
                    "p-4 rounded-full border shadow-inner",
                    hunt.boss_defeated ? "bg-[#00e5ff]/10 border-[#00e5ff]/50 text-[#00e5ff]" : "bg-[#ff003c]/10 border-[#ff003c]/50 text-[#ff003c]"
                  )}>
                    {hunt.boss_defeated ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-1">{hunt.topic_name}</h3>
                    <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
                      <span>{new Date(hunt.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {hunt.time_taken}s</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end md:items-center min-w-[150px]">
                  <div className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-1">Raid Score</div>
                  <div className={twMerge(
                    "text-3xl font-bold",
                    hunt.boss_defeated ? "text-[#00e5ff]" : "text-[#ff003c]"
                  )}>
                    {hunt.score} <span className="text-lg text-gray-500">/ {hunt.total_questions}</span>
                  </div>
                </div>

                {hunt.performance_stats && hunt.performance_stats.length > 0 && (
                  <div className="flex flex-col gap-1 min-w-[120px]">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1 text-right md:text-left">Analytics</div>
                    <div className="flex gap-1 justify-end md:justify-start">
                      {hunt.performance_stats.map((stat: any, idx: number) => (
                        <div 
                          key={idx} 
                          title={`Q${idx + 1}: ${stat.timeTaken}s`}
                          className={twMerge(
                            "w-4 h-6 rounded-sm opacity-80",
                            stat.isCorrect ? "bg-[#00e5ff]" : "bg-[#ff003c]"
                          )} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
