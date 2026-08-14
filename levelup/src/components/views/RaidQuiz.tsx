"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { twMerge } from "tailwind-merge";
import QuizStats, { QuizResultData } from "@/components/views/QuizStats";

interface RaidQuizProps {
  lessonData: any;
  hunterId: string;
  onComplete: (answers: any[], timeTaken: number) => Promise<any>;
  onEnterBossRoom: () => void;
  onBack: () => void;
}

export default function RaidQuiz({ lessonData, hunterId, onComplete, onEnterBossRoom, onBack }: RaidQuizProps) {
  const [phase, setPhase] = useState<"lesson" | "quiz" | "stats" | "submitting" | "cleared" | "boss-warning">("lesson");
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{questionId: string, selectedOptionId: string}[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  
  // Results for analytics charts
  const [performanceStats, setPerformanceStats] = useState<QuizResultData[]>([]);

  // Results from backend
  const [quizResults, setQuizResults] = useState<any>(null);

  const currentQ = lessonData.quiz[currentQIdx];

  const handleStartQuiz = () => {
    setPhase("quiz");
    const now = Date.now();
    setStartTime(now);
    setQuestionStartTime(now);
  };

  const handleNext = async () => {
    if (selectedOptId) {
      const now = Date.now();
      const timeTaken = Math.floor((now - questionStartTime) / 1000);
      
      setAnswers(prev => [...prev, { questionId: currentQ.questionId, selectedOptionId: selectedOptId }]);
      setPerformanceStats(prev => [
        ...prev,
        { questionIndex: currentQIdx, isCorrect: false, timeTaken } as any // isCorrect handled by backend
      ]);
      setQuestionStartTime(now);
      
      if (currentQIdx < lessonData.quiz.length - 1) {
        setCurrentQIdx(prev => prev + 1);
        setSelectedOptId(null);
      } else {
        // Last question: submit to backend
        setPhase("submitting");
        const totalTimeTaken = Math.floor((Date.now() - startTime) / 1000);
        const allAnswers = [...answers, { questionId: currentQ.questionId, selectedOptionId: selectedOptId }];
        try {
          const results = await onComplete(allAnswers, totalTimeTaken);
          setQuizResults(results);
          setPhase("stats");
        } catch (err) {
          alert("Failed to submit to system.");
          onBack();
        }
      }
    }
  };

  const handleProceedFromStats = () => {
    if (quizResults?.score >= 2) {
      setPhase("boss-warning");
    } else {
      setPhase("cleared");
    }
  };



  const handleSelect = (optId: string) => {
    setSelectedOptId(optId);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto w-full p-8 relative flex flex-col h-[calc(100vh-100px)]"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors w-fit mb-8 z-10 relative">
        <ChevronLeft size={20} /> <span className="font-mono uppercase text-sm tracking-widest">Retreat</span>
      </button>

      <div className="mb-8 border-b border-[#333] pb-4">
        <h1 className="text-3xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
          <span className="text-[#00e5ff] animate-pulse">●</span> GATE: {lessonData.topic}
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {phase === "lesson" && (
          <motion.div key="lesson" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
            <h3 className="text-[#00e5ff] font-mono text-sm tracking-widest mb-4">&gt; SYSTEM KNOWLEDGE DOWNLOAD...</h3>
            <div className="bg-black/60 backdrop-blur-md border border-[#333] p-8 rounded-sm text-lg leading-relaxed shadow-inner mb-8">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
                {lessonData.lessonContent.split('\n\n').map((para: string, i: number) => {
                  const cleanedPara = para.replace(/[*#`_~]/g, '').trim();
                  return cleanedPara ? <span key={i} className="block mb-4">{cleanedPara}</span> : null;
                })}
              </motion.p>
            </div>
            <div className="mt-auto flex justify-end">
              <button onClick={handleStartQuiz} className="bg-transparent border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black px-8 py-4 rounded-sm font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)]">
                Commence Raid
              </button>
            </div>
          </motion.div>
        )}

        {phase === "quiz" && (
          <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[#ff003c] font-mono text-sm tracking-widest uppercase">
                &gt; Boss Encounter: Phase {currentQIdx + 1}/{lessonData.quiz.length}
              </h3>
              <div className="flex gap-2">
                {lessonData.quiz.map((_: any, i: number) => (
                  <div key={i} className={`h-1.5 w-8 rounded-full ${i <= currentQIdx ? 'bg-[#00e5ff] shadow-[0_0_5px_#00e5ff]' : 'bg-[#333]'}`} />
                ))}
              </div>
            </div>

            <div className="text-2xl text-white font-medium mb-12">{currentQ.question}</div>
            
            <div className="space-y-4 mb-8">
              {currentQ.options.map((opt: any) => {
                const isSelected = selectedOptId === opt.optionId;
                const style = isSelected 
                  ? "bg-[#004d40]/80 border-[#00e5ff] text-white shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                  : "bg-black/60 border-[#333] hover:border-[#00e5ff]/50 text-gray-300";

                return (
                  <button key={opt.optionId} onClick={() => handleSelect(opt.optionId)} className={twMerge("w-full text-left p-6 rounded-sm border transition-all duration-300 text-lg backdrop-blur-md", style)}>
                    {opt.text}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto flex justify-end">
              <button 
                onClick={handleNext} 
                disabled={!selectedOptId}
                className="bg-white text-black font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-sm hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.5)] disabled:opacity-50 disabled:shadow-none"
              >
                {currentQIdx < lessonData.quiz.length - 1 ? "Next Area" : "Analyze Performance"}
              </button>
            </div>
          </motion.div>
        )}

        {phase === "stats" && (
          <QuizStats 
            results={quizResults?.results?.map((r: any, idx: number) => ({
              ...r,
              questionIndex: idx,
              timeTaken: performanceStats[idx]?.timeTaken || 0
            }))} 
            onProceed={handleProceedFromStats} 
          />
        )}

        {phase === "submitting" && (
           <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-[#ff003c] border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_#ff003c]" />
                <h2 className="text-[#ff003c] font-mono font-bold tracking-widest animate-pulse">Calculating Combat Results...</h2>
              </div>
           </motion.div>
        )}

        {phase === "boss-warning" && quizResults && (
          <motion.div 
            key="boss-warning" 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: [0, -10, 10, -10, 10, 0],
              transition: { duration: 0.5 }
            }} 
            className="flex-1 flex flex-col items-center justify-center text-center w-full"
          >
            <ShieldAlert size={100} className="text-[#ff003c] mb-6 shadow-[0_0_40px_#ff003c] rounded-full animate-pulse" />
            <h1 className="text-4xl font-bold text-[#ff003c] tracking-[0.2em] mb-4" style={{ textShadow: '0 0 20px #ff003c' }}>
              WARNING
            </h1>
            <h2 className="text-2xl text-white font-mono tracking-widest mb-12 uppercase">
              High-level mana detected. The Dungeon Boss has awakened.
            </h2>
            
            <button onClick={onEnterBossRoom} className="bg-transparent border-2 border-[#ff003c] text-[#ff003c] font-bold tracking-[0.2em] px-12 py-4 rounded-sm hover:bg-[#ff003c] hover:text-black hover:shadow-[0_0_30px_#ff003c] transition-all duration-300 uppercase">
              Enter Boss Room
            </button>
          </motion.div>
        )}

        {phase === "cleared" && quizResults && (
          <motion.div key="cleared" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center w-full">
            <CheckCircle2 size={100} className="text-[#00e5ff] mb-6 shadow-[0_0_40px_#00e5ff] rounded-full" />
            <h1 className="text-5xl font-bold text-white tracking-[0.2em] mb-4" style={{ textShadow: '0 0 20px #00e5ff' }}>GATE CLEARED</h1>
            
            <div className="bg-black/60 border border-[#00e5ff]/30 p-6 rounded-sm mb-12 w-full max-w-md">
              <h3 className="text-[#00e5ff] font-mono text-xl tracking-widest uppercase mb-4">RAID REPORT</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Score</span>
                <span className="font-bold text-white text-xl">{quizResults.score} / {quizResults.totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">XP Gained</span>
                <span className="font-bold text-[#00e5ff] text-xl">+{quizResults.gamificationUpdates.xpGained} XP</span>
              </div>
            </div>

            <button onClick={onBack} className="bg-transparent border-2 border-[#00e5ff] text-[#00e5ff] font-bold tracking-[0.2em] px-12 py-4 rounded-sm hover:bg-[#00e5ff] hover:text-black hover:shadow-[0_0_30px_#00e5ff] transition-all duration-300 uppercase">
              Return to Hub
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
