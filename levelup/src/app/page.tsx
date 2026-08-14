"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SystemHUD from "@/components/layout/SystemHUD";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/views/Dashboard";
import RaidQuiz from "@/components/views/RaidQuiz";
import BossFight from "@/components/views/BossFight";
import Leaderboard from "@/components/views/Leaderboard";
import PenaltyZone from "@/components/views/PenaltyZone";
import CustomQuest from "@/components/views/CustomQuest";
import RecentHunts from "@/components/views/RecentHunts";
import Profile from "@/components/views/Profile";

// Import Server Actions
import { getUserProfileAction } from "@/app/actions/hunter";
import { generateLessonAction } from "@/app/actions/lessons";
import { submitQuizAction } from "@/app/actions/quiz";

// Import gamification helpers
import { calculateLevel } from "@/lib/gamification/xp";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  
  const [hunterId, setHunterId] = useState("usr_12345");
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [hunterClass, setHunterClass] = useState("E-Rank Hunter");
  const [dailyStreak, setDailyStreak] = useState(0);
  const [answerStreak, setAnswerStreak] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [username, setUsername] = useState("Hunter");
  
  const [activeView, setActiveView] = useState<"dashboard" | "quiz" | "boss-fight" | "leaderboard" | "penalty" | "custom-quest" | "recent-hunts" | "profile">("dashboard");
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState<string>("");
  
  const [isLoadingLLM, setIsLoadingLLM] = useState(false);
  const [currentLessonData, setCurrentLessonData] = useState<any>(null);
  const [penaltyLessonData, setPenaltyLessonData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async (sessionUser: any) => {
      try {
        let { data: profile } = await supabase.from('hunters').select('*').eq('id', sessionUser.id).single();
        
        if (!profile) {
          const emailPrefix = sessionUser.email ? sessionUser.email.split('@')[0] : 'Hunter';
          const { data: newProfile, error } = await supabase.from('hunters').insert({
            id: sessionUser.id,
            username: emailPrefix,
            level: 1,
            mana_xp: 0,
            current_streak: 1,
            highest_streak: 1,
            hunter_class: "E-Rank Hunter",
            total_answered: 0,
            unlocked_badges: []
          }).select().single();
          
          if (error) throw error;
          profile = newProfile;
        }

        if (profile) {
          setUsername(profile.username || "Hunter");
          setXp(profile.mana_xp);
          setLevel(profile.level);
          setHunterClass(profile.hunter_class);
          setDailyStreak(profile.current_streak);
          setAnswerStreak(profile.highest_streak);
          setUnlockedBadges(profile.unlocked_badges || []);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      } else {
        setHunterId(session.user.id);
        await fetchProfile(session.user);
        setIsAuthenticating(false);
      }
    };
    checkAuth();
  }, [router, supabase]);

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

  const handleEnterPenaltyZone = async () => {
    setIsLoadingLLM(true);
    try {
      const res = await generateLessonAction({ 
        topic: "Hard General Knowledge (Computer Science, Tech, and Logic)", 
        gateRank: "S" 
      });
      if (res.success && res.data) {
        setPenaltyLessonData(res.data);
        setActiveView("penalty");
      } else {
        alert("System Error: Failed to generate Penalty Zone.");
      }
    } catch (err) {
      console.error(err);
      alert("System Error: Penalty generation failed.");
    } finally {
      setIsLoadingLLM(false);
    }
  };

  const handleGenerateCustomQuest = (topic: string) => {
    setCustomTopic(topic);
    setActiveView("custom-quest");
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
        setHunterClass(updates.hunterClass);
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

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.1)_0%,transparent_50%)] animate-pulse" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#00e5ff] border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_15px_#00e5ff]" />
          <h1 className="text-[#00e5ff] font-mono text-xl md:text-2xl font-bold tracking-widest uppercase animate-pulse mb-2">
            SYSTEM ACCESS
          </h1>
          <p className="text-gray-400 font-mono text-sm tracking-widest uppercase animate-pulse">
            Verifying Hunter Signature...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white relative overflow-hidden flex flex-col">
      {/* Metallic Image Background */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen grayscale contrast-150 bg-cover bg-center" 
        style={{ backgroundImage: "url('/1347885.jpeg')" }} 
      />
      {/* Grid Overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 z-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle_at_center,#00e5ff15,transparent_60%)] blur-3xl pointer-events-none" />

      <SystemHUD 
        username={username}
        hunterClass={hunterClass}
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
                onEnterPenaltyZone={handleEnterPenaltyZone}
                onGenerateCustomQuest={handleGenerateCustomQuest}
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
              <Leaderboard 
                currentUsername={username}
                currentLevel={level}
                currentClass={hunterClass}
                currentUserId={hunterId}
              />
            </motion.div>
          )}

          {activeView === "recent-hunts" && (
            <motion.div 
              key="recent-hunts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 overflow-y-auto custom-scrollbar"
            >
              <RecentHunts />
            </motion.div>
          )}

          {activeView === "penalty" && penaltyLessonData && (
            <motion.div 
              key="penalty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 overflow-y-auto custom-scrollbar bg-black"
            >
              <PenaltyZone 
                lessonData={penaltyLessonData}
                hunterId={hunterId}
                onComplete={handleQuizComplete}
                onBack={() => {
                  setPenaltyLessonData(null);
                  setActiveView("dashboard");
                }}
              />
            </motion.div>
          )}

          {activeView === "custom-quest" && customTopic && (
            <motion.div 
              key="custom-quest"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 overflow-y-auto custom-scrollbar bg-black/50"
            >
              <CustomQuest 
                topic={customTopic}
                onBack={(updates) => {
                  if (updates) {
                    setXp(updates.totalXp);
                    setLevel(updates.currentLevel);
                    setHunterClass(updates.hunterClass);
                    setDailyStreak(updates.streak?.currentStreak || 0);
                    
                    if (updates.newBadges?.length > 0) {
                      setUnlockedBadges(prev => [...prev, ...updates.newBadges.map((b: any) => b.badgeId)]);
                    }
                  }
                  setCustomTopic("");
                  setActiveView("dashboard");
                }}
              />
            </motion.div>
          )}

          {activeView === "profile" && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 overflow-y-auto custom-scrollbar"
            >
              <Profile 
                hunterId={hunterId}
                onProfileUpdate={(newUsername) => {
                  setUsername(newUsername);
                }}
                stats={{
                  username,
                  hunterClass,
                  currentRank: level >= 50 ? "S-Rank" : level >= 40 ? "A-Rank" : level >= 30 ? "B-Rank" : level >= 20 ? "C-Rank" : level >= 10 ? "D-Rank" : "E-Rank",
                  totalXp: xp,
                  gatesCleared: Math.floor(xp / 100),
                  highestStreak: answerStreak,
                  unlockedBadges
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
