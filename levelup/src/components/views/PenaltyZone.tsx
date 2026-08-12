"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Flame, ShieldAlert, CheckCircle2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface PenaltyZoneProps {
  lessonData: any;
  hunterId: string;
  onComplete: (answers: any[], timeTaken: number) => Promise<any>;
  onBack: () => void;
}

export default function PenaltyZone({ lessonData, hunterId, onComplete, onBack }: PenaltyZoneProps) {
  const [phase, setPhase] = useState<"intro" | "quiz" | "submitting" | "results">("intro");
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [answers, setAnswers] = useState<{questionId: string, selectedOptionId: string}[]>([]);
  const [quizResults, setQuizResults] = useState<any>(null);

  const currentQ = lessonData.quiz[currentQIdx];

  // Timer logic
  useEffect(() => {
    if (phase === "quiz" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === "quiz" && timeLeft === 0) {
      handleTimeOut();
    }
  }, [phase, timeLeft]);

  const handleStart = () => {
    setPhase("quiz");
  };

  const handleTimeOut = async () => {
    setPhase("submitting");
    const timeTaken = 60;
    try {
      const results = await onComplete(answers, timeTaken);
      setQuizResults(results);
      setPhase("results");
    } catch (err) {
      alert("System failure submitting penalty results.");
      onBack();
    }
  };

  const handleSelect = async (optId: string) => {
    const newAnswers = [...answers, { questionId: currentQ.questionId, selectedOptionId: optId }];
    setAnswers(newAnswers);

    if (currentQIdx < lessonData.quiz.length - 1) {
      setCurrentQIdx(prev => prev + 1);
    } else {
      // Finished all questions
      setPhase("submitting");
      const timeTaken = 60 - timeLeft;
      try {
        const results = await onComplete(newAnswers, timeTaken);
        setQuizResults(results);
        setPhase("results");
      } catch (err) {
        alert("System failure submitting penalty results.");
        onBack();
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto w-full p-8 relative flex flex-col h-[calc(100vh-100px)]"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-[#ff003c] hover:text-white transition-colors w-fit mb-8 z-10 relative">
        <ChevronLeft size={20} /> <span className="font-mono uppercase text-sm tracking-widest">Flee</span>
      </button>

      <div className="mb-8 border-b border-[#ff003c]/30 pb-4 flex justify-between items-end">
        <h1 className="text-3xl font-bold text-[#ff003c] uppercase tracking-widest flex items-center gap-3">
          <ShieldAlert className="animate-pulse" /> PENALTY ZONE
        </h1>
        {phase === "quiz" && (
          <div className="text-4xl font-mono font-bold text-white flex items-center gap-2">
            <Flame className="text-[#ff003c]" /> 
            <span className={timeLeft <= 10 ? "text-[#ff003c] animate-pulse" : ""}>
              00:{timeLeft.toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex-1 flex flex-col items-center justify-center text-center">
            <ShieldAlert size={80} className="text-[#ff003c] mb-6 shadow-[0_0_40px_#ff003c] rounded-full animate-pulse" />
            <h2 className="text-3xl font-bold text-white tracking-[0.1em] mb-4">SURVIVAL MISSION</h2>
            <p className="text-xl text-gray-300 max-w-lg mb-12">
              Answer as many questions as you can in 60 seconds. Only the strongest hunters survive the Penalty Zone.
            </p>
            <button 
              onClick={handleStart}
              className="bg-[#ff003c]/20 border-2 border-[#ff003c] text-[#ff003c] font-bold tracking-[0.2em] px-16 py-5 hover:bg-[#ff003c] hover:text-black hover:shadow-[0_0_30px_#ff003c] transition-all duration-300 uppercase text-lg"
            >
              Start Survival
            </button>
          </motion.div>
        )}

        {phase === "quiz" && (
          <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[#ff003c] font-mono text-sm tracking-widest uppercase">
                &gt; Target {currentQIdx + 1}/{lessonData.quiz.length}
              </h3>
            </div>

            <div className="text-2xl text-white font-medium mb-12">{currentQ.question}</div>
            
            <div className="space-y-4 mb-8">
              {currentQ.options.map((opt: any) => (
                <button 
                  key={opt.optionId} 
                  onClick={() => handleSelect(opt.optionId)} 
                  className="w-full text-left p-6 rounded-sm border bg-black/60 border-[#ff003c]/30 hover:border-[#ff003c] hover:bg-[#ff003c]/10 hover:shadow-[0_0_15px_rgba(255,0,60,0.3)] text-gray-300 hover:text-white transition-all duration-300 text-lg backdrop-blur-md"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "submitting" && (
           <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-[#ff003c] border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_#ff003c]" />
                <h2 className="text-[#ff003c] font-mono font-bold tracking-widest animate-pulse">EVALUATING SURVIVAL LOGS...</h2>
              </div>
           </motion.div>
        )}

        {phase === "results" && quizResults && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center w-full">
            <CheckCircle2 size={100} className="text-[#00e5ff] mb-6 shadow-[0_0_40px_#00e5ff] rounded-full" />
            <h1 className="text-4xl font-bold text-white tracking-[0.2em] mb-4" style={{ textShadow: '0 0 20px #00e5ff' }}>PENALTY ZONE SURVIVED</h1>
            
            <div className="bg-black/60 border border-[#00e5ff]/30 p-6 rounded-sm mb-12 w-full max-w-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Score</span>
                <span className="font-bold text-white text-xl">{quizResults.score} / {quizResults.totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Time Left</span>
                <span className="font-bold text-white text-xl">{timeLeft}s</span>
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
