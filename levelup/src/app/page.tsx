"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SystemHUD from "@/components/layout/SystemHUD";
import Dashboard from "@/components/views/Dashboard";
import RaidQuiz from "@/components/views/RaidQuiz";
import { topics, content, badges } from "@/lib/mockData";

export default function Home() {
  // Gamified State
  const [xp, setXp] = useState(450);
  const [dailyStreak, setDailyStreak] = useState(3);
  const [answerStreak, setAnswerStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  
  // View State
  const [activeView, setActiveView] = useState<"dashboard" | "quiz">("dashboard");
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  const level = Math.floor(xp / 100) + 1;

  // Check badges whenever stats change
  const checkBadges = useCallback(() => {
    const stats = { xp, dailyStreak, answerStreak, totalAnswered };
    badges.forEach(badge => {
      if (!unlockedBadges.includes(badge.id) && badge.condition(stats)) {
        setUnlockedBadges(prev => [...prev, badge.id]);
        // In a real app, we'd trigger a toast notification here
        console.log(`Unlocked Badge: ${badge.name}`);
      }
    });
  }, [xp, dailyStreak, answerStreak, totalAnswered, unlockedBadges]);

  useEffect(() => {
    checkBadges();
  }, [xp, answerStreak, checkBadges]);

  // Quiz Event Handlers
  const handleCorrectAnswer = () => {
    setXp(prev => prev + 20);
    setAnswerStreak(prev => prev + 1);
    setTotalAnswered(prev => prev + 1);
  };

  const handleWrongAnswer = () => {
    setAnswerStreak(0);
    setTotalAnswered(prev => prev + 1);
  };

  const activeTopic = topics.find(t => t.id === activeTopicId) || null;
  const activeContent = activeTopicId ? content[activeTopicId] : null;

  return (
    <main className="min-h-screen bg-neutral-950 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] text-white relative overflow-hidden flex flex-col">
      {/* Background Holographic Orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle_at_center,#00e5ff15,transparent_60%)] blur-3xl pointer-events-none" />

      {/* Global Top HUD */}
      <SystemHUD 
        xp={xp}
        level={level}
        dailyStreak={dailyStreak}
        answerStreak={answerStreak}
      />

      {/* Dynamic Content Area */}
      <div className="flex-1 relative overflow-hidden">
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
                onSelectTopic={(id) => {
                  setActiveTopicId(id);
                  setActiveView("quiz");
                }}
              />
            </motion.div>
          )}

          {activeView === "quiz" && activeTopic && activeContent && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 overflow-y-auto custom-scrollbar"
            >
              <RaidQuiz 
                topic={activeTopic}
                contentData={activeContent}
                onCorrectAnswer={handleCorrectAnswer}
                onWrongAnswer={handleWrongAnswer}
                onComplete={() => {
                  setActiveTopicId(null);
                  setActiveView("dashboard");
                }}
                onBack={() => {
                  setActiveTopicId(null);
                  setActiveView("dashboard");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
