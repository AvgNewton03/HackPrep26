"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SystemHUD from "@/components/layout/SystemHUD";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/views/Dashboard";
import RaidQuiz from "@/components/views/RaidQuiz";
import BossFight from "@/components/views/BossFight";
import Leaderboard from "@/components/views/Leaderboard";

// Import Server Actions
import { getUserProfileAction } from "@/app/actions/hunter";
import { generateLessonAction } from "@/app/actions/lessons";
import { submitQuizAction } from "@/app/actions/quiz";

// Import gamification helpers
import { calculateLevel } from "@/lib/gamification/xp";

export default function Home() {
  const [hunterId] = useState("usr_12345");
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [answerStreak, setAnswerStreak] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  
  const [activeView, setActiveView] = useState<"dashboard" | "quiz" | "boss-fight" | "leaderboard">("dashboard");
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  
  const [isLoadingLLM, setIsLoadingLLM] = useState(false);
  const [currentLessonData, setCurrentLessonData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfileAction(hunterId);
        if (res.success && res.data) {
          setXp(res.data.stats.totalXp);
          setLevel(res.data.stats.currentLevel);
          setDailyStreak(res.data.stats.currentStreak);
          setAnswerStreak(res.data.stats.highestStreak);
          setUnlockedBadges(res.data.badges.map((b: any) => b.badgeId));
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, [hunterId]);

  const handleSelectTopic = async (topicId: string, topicName: string, rank: string) => {
    setIsLoadingLLM(true);
    try {
      const res = await generateLessonAction({ topic: topicName, gateRank: rank as any });
      if (res.success && res.data) {
        setCurrentLessonData(res.data);
        setActiveTopicId(topicId);
        setActiveView("quiz");
      } else {
        alert("System Error: Failed to synthesize dungeon data.");
      }
    } catch (err) {
      console.error(err);
      alert("System Error: LLM integration failed.");
    } finally {
      setIsLoadingLLM(false);
    }
  };

  const handleQuizComplete = async (answers: any[], timeTakenSeconds: number) => {
    try {
      const res = await submitQuizAction({
        lessonId: currentLessonData.lessonId,
        hunterId,
        answers,
        timeTakenSeconds
      });

      if (res.success && res.data) {
        const updates = res.data.gamificationUpdates;
        setXp(updates.totalXp);
        setLevel(updates.currentLevel);
        setDailyStreak(updates.streak.currentStreak);
        
        if (updates.newBadges && updates.newBadges.length > 0) {
          const newBadgeIds = updates.newBadges.map((b: any) => b.badgeId);
          setUnlockedBadges(prev => [...prev, ...newBadgeIds]);
        }
        
        return res.data;
      }
      throw new Error(res.error || "Submission failed");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleBossVictory = () => {
    setXp(prev => {
      const newXp = prev + 500;
      setLevel(calculateLevel(newXp));
      return newXp;
    });
    if (!unlockedBadges.includes("shadow-monarch")) {
      setUnlockedBadges(prev => [...prev, "shadow-monarch"]);
    }
    setActiveTopicId(null);
    setCurrentLessonData(null);
    setActiveView("dashboard");
  };

  const handleBossDefeat = () => {
    setActiveTopicId(null);
    setCurrentLessonData(null);
    setActiveView("dashboard");
  };

  return (
    <main className="min-h-screen bg-neutral-950 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] text-white relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle_at_center,#00e5ff15,transparent_60%)] blur-3xl pointer-events-none" />

      <SystemHUD 
        xp={xp}
        level={level}
        dailyStreak={dailyStreak}
        answerStreak={answerStreak}
      />

      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="flex-1 relative overflow-hidden">
          {isLoadingLLM && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 border-4 border-[#00e5ff] border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_#00e5ff]" />
              <h2 className="text-[#00e5ff] font-mono font-bold tracking-widest animate-pulse">SYSTEM ALERT: Synthesizing Dungeon Data...</h2>
            </motion.div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeView === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 overflow-y-auto custom-scrollbar"
            >
              <Dashboard 
                unlockedBadges={unlockedBadges}
                onSelectTopic={handleSelectTopic}
              />
            </motion.div>
          )}

          {activeView === "quiz" && currentLessonData && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 overflow-y-auto custom-scrollbar"
            >
              <RaidQuiz 
                lessonData={currentLessonData}
                hunterId={hunterId}
                onComplete={handleQuizComplete}
                onEnterBossRoom={() => setActiveView("boss-fight")}
                onBack={() => {
                  setActiveTopicId(null);
                  setCurrentLessonData(null);
                  setActiveView("dashboard");
                }}
              />
            </motion.div>
          )}

          {activeView === "boss-fight" && currentLessonData && (
            <motion.div 
              key="boss-fight"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 overflow-y-auto custom-scrollbar"
            >
              <BossFight 
                topic={currentLessonData.topic}
                onVictory={handleBossVictory}
                onDefeat={handleBossDefeat}
              />
            </motion.div>
          )}

          {activeView === "leaderboard" && (
            <motion.div 
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 overflow-y-auto custom-scrollbar"
            >
              <Leaderboard />
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
