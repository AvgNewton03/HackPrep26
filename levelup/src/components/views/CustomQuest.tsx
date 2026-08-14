"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Skull, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { submitCustomQuestAction } from "@/app/actions/customQuest";
import QuizStats, { QuizResultData } from "@/components/views/QuizStats";

interface CustomQuestProps {
  topic: string;
  onBack: (updates?: any) => void;
}

export default function CustomQuest({ topic, onBack }: CustomQuestProps) {
  const [phase, setPhase] = useState<"loading" | "error" | "lesson" | "quiz" | "stats" | "boss-warning" | "boss" | "victory" | "defeat">("loading");
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResultData[]>([]);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    async function generateQuest() {
      try {
        const res = await fetch("/api/generate-module", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
        });

        const json = await res.json();
        
        if (!res.ok) {
          throw new Error(json.error || "Generation failed");
        }

        setData(json);
        setPhase("lesson");
      } catch (err: any) {
        setErrorMsg(err.message || "The magic fizzled! Please try generating again.");
        setPhase("error");
      }
    }

    generateQuest();
  }, [topic]);

  const handleStartQuiz = () => {
    setPhase("quiz");
    const now = Date.now();
    setStartTime(now);
    setQuestionStartTime(now);
  };

  const handleSelectOption = (opt: string) => {
    if (phase === "boss" && feedback) return;
    setSelectedOpt(opt);
  };

  const handleNextQuizArea = () => {
    if (!selectedOpt) return;
    
    const isCorrect = selectedOpt === data.quiz[currentQIdx].correctAnswer;
    if (isCorrect) setScore(s => s + 1);

    const now = Date.now();
    const timeTaken = Math.floor((now - questionStartTime) / 1000);
    
    setQuizResults(prev => [
      ...prev,
      { 
        questionIndex: currentQIdx, 
        questionId: String(currentQIdx),
        isCorrect, 
        timeTaken,
        questionText: data.quiz[currentQIdx].question,
        correctOptionText: data.quiz[currentQIdx].correctAnswer,
        selectedOptionText: selectedOpt
      }
    ]);

    setSelectedOpt(null);

    if (currentQIdx < 4) {
      setCurrentQIdx(q => q + 1);
      setQuestionStartTime(now);
    } else {
      setPhase("stats");
    }
  };

  const handleEnterBossRoom = () => {
    setPhase("boss");
  };

  const handleSubmitBossAnswer = async () => {
    if (!selectedOpt) return;

    const isCorrect = selectedOpt === data.bossFight.challenge.correctAnswer;
    const finalScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) setScore(finalScore);
    setFeedback(isCorrect ? "correct" : "incorrect");
    
    // Submit results to backend to get XP
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    try {
      const res = await submitCustomQuestAction({
        score: finalScore,
        totalQuestions: 6,
        timeTakenSeconds: timeTaken,
        topicName: topic,
        performanceStats: quizResults,
      });
      if (res.success) {
        setResults(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFinishQuest = () => {
    setFeedback(null);
    setSelectedOpt(null);

    if (feedback === "correct") {
      setPhase("victory");
    } else {
      setPhase("defeat");
    }
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

      {data && phase !== "loading" && phase !== "error" && (
        <div className="mb-8 border-b border-[#333] pb-4">
          <h1 className="text-3xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
            <span className="text-[#00e5ff] animate-pulse">●</span> GATE: {data.topic}
          </h1>
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-[#00e5ff] border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_#00e5ff]" />
              <h2 className="text-[#00e5ff] font-mono font-bold tracking-widest animate-pulse uppercase">Summoning Enemies & Writing Lore...</h2>
            </div>
          </motion.div>
        )}

        {phase === "error" && (
          <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
            <XCircle size={100} className="text-[#ff003c] mb-6 shadow-[0_0_40px_#ff003c] rounded-full" />
            <h1 className="text-4xl font-bold text-[#ff003c] tracking-[0.1em] mb-4 uppercase">Generation Failed</h1>
            <p className="text-xl text-gray-300 font-mono tracking-wider mb-8">{errorMsg}</p>
            <button onClick={onBack} className="bg-transparent border-2 border-[#ff003c] text-[#ff003c] font-bold tracking-[0.2em] px-12 py-4 rounded-sm hover:bg-[#ff003c] hover:text-black hover:shadow-[0_0_30px_#ff003c] transition-all duration-300 uppercase">
              Return to Hub
            </button>
          </motion.div>
        )}

        {phase === "lesson" && data && (
          <motion.div key="lesson" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
            <h3 className="text-[#00e5ff] font-mono text-sm tracking-widest mb-4">&gt; SYSTEM KNOWLEDGE DOWNLOAD...</h3>
            <div className="bg-black/60 backdrop-blur-md border border-[#333] p-8 rounded-sm text-lg leading-relaxed shadow-inner mb-8">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
                {data.lessonContent ? data.lessonContent.split('\n\n').map((para: string, i: number) => {
                  const cleanedPara = para.replace(/[*#`_~]/g, '').trim();
                  return cleanedPara ? <span key={i} className="block mb-4">{cleanedPara}</span> : null;
                }) : <span className="block text-gray-400 italic">No context data provided by the system. Rely on your instincts.</span>}
              </motion.p>
            </div>
            <div className="mt-auto flex justify-end">
              <button onClick={handleStartQuiz} className="bg-transparent border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black px-8 py-4 rounded-sm font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)]">
                Commence Raid
              </button>
            </div>
          </motion.div>
        )}

        {phase === "quiz" && data && (
          <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[#ff003c] font-mono text-sm tracking-widest uppercase">
                &gt; Boss Encounter: Phase {currentQIdx + 1}/5
              </h3>
              <div className="flex gap-2">
                {data.quiz.map((_: any, i: number) => (
                  <div key={i} className={`h-1.5 w-8 rounded-full ${i <= currentQIdx ? 'bg-[#00e5ff] shadow-[0_0_5px_#00e5ff]' : 'bg-[#333]'}`} />
                ))}
              </div>
            </div>

            <div className="text-2xl text-white font-medium mb-12">{data.quiz[currentQIdx].question}</div>
            
            <div className="space-y-4 mb-8">
              {data.quiz[currentQIdx].options.map((opt: string, i: number) => {
                const isSelected = selectedOpt === opt;
                const style = isSelected 
                  ? "bg-[#004d40]/80 border-[#00e5ff] text-white shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                  : "bg-black/60 border-[#333] hover:border-[#00e5ff]/50 text-gray-300";

                return (
                  <button key={i} onClick={() => handleSelectOption(opt)} className={twMerge("w-full text-left p-6 rounded-sm border transition-all duration-300 text-lg backdrop-blur-md", style)}>
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto flex justify-end">
              <button 
                onClick={handleNextQuizArea} 
                disabled={!selectedOpt}
                className="bg-white text-black font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-sm hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.5)] disabled:opacity-50 disabled:shadow-none"
              >
                {currentQIdx < 4 ? "Next Area" : "Analyze Performance"}
              </button>
            </div>
          </motion.div>
        )}

        {phase === "stats" && (
          <QuizStats 
            results={quizResults} 
            onProceed={() => setPhase("boss-warning")} 
          />
        )}

        {phase === "boss-warning" && (
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
            
            <button onClick={handleEnterBossRoom} className="bg-transparent border-2 border-[#ff003c] text-[#ff003c] font-bold tracking-[0.2em] px-12 py-4 rounded-sm hover:bg-[#ff003c] hover:text-black hover:shadow-[0_0_30px_#ff003c] transition-all duration-300 uppercase">
              Enter Boss Room
            </button>
          </motion.div>
        )}

        {phase === "boss" && data && (
          <motion.div key="boss" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col">
            <div className="flex flex-col items-center justify-center mb-8 border-b border-[#ff003c]/30 pb-6">
              <Skull size={48} className="text-[#ff003c] mb-4 animate-pulse shadow-[0_0_20px_#ff003c] rounded-full" />
              <h2 className="text-3xl text-[#ff003c] font-bold tracking-[0.2em] uppercase" style={{ textShadow: '0 0 10px #ff003c' }}>
                {data.bossFight.bossName}
              </h2>
            </div>
            
            <p className="text-xl text-gray-300 italic mb-10 text-center leading-relaxed">
              "{data.bossFight.scenario}"
            </p>

            <div className="text-2xl text-white font-medium mb-12 border-l-4 border-[#ff003c] pl-6 py-2 bg-[#ff003c]/5">
              {data.bossFight.challenge.question}
            </div>
            
            <div className="space-y-4 mb-8">
              {data.bossFight.challenge.options.map((opt: string, i: number) => {
                const isSelected = selectedOpt === opt;
                let style = "bg-black/60 border-[#333] hover:border-[#ff003c]/50 text-gray-300";
                
                if (feedback) {
                  const isCorrectAnswer = opt === data.bossFight.challenge.correctAnswer;
                  if (isCorrectAnswer) {
                    style = "bg-green-900/40 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                  } else if (isSelected) {
                    style = "bg-red-900/40 border-red-500 text-white opacity-50";
                  } else {
                    style = "bg-black/60 border-[#333] opacity-30";
                  }
                } else if (isSelected) {
                  style = "bg-[#4d0000]/80 border-[#ff003c] text-white shadow-[0_0_15px_rgba(255,0,60,0.3)]";
                }

                return (
                  <button key={i} onClick={() => handleSelectOption(opt)} disabled={feedback !== null} className={twMerge("w-full text-left p-6 rounded-sm border transition-all duration-300 text-lg backdrop-blur-md", style)}>
                    {opt}
                  </button>
                );
              })}
            </div>

            {feedback && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={twMerge("p-6 rounded-sm border mb-8 flex flex-col backdrop-blur-md", feedback === "correct" ? "bg-green-900/20 border-green-500 text-green-100" : "bg-red-900/20 border-red-500 text-red-100")}>
                <div className="flex items-center gap-3 mb-2 font-bold text-xl uppercase tracking-widest">
                  {feedback === "correct" ? <><CheckCircle2 className="text-green-500" /> Critical Hit!</> : <><XCircle className="text-red-500" /> Attack Missed!</>}
                </div>
                <p className="text-lg">{data.bossFight.challenge.explanation}</p>
              </motion.div>
            )}

            <div className="mt-auto flex justify-end">
              {!feedback ? (
                <button 
                  onClick={handleSubmitBossAnswer} 
                  disabled={!selectedOpt}
                  className="bg-[#ff003c]/10 border border-[#ff003c] text-[#ff003c] hover:bg-[#ff003c] hover:text-black font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-sm transition-colors shadow-[0_0_15px_rgba(255,0,60,0.2)] disabled:opacity-50 disabled:shadow-none"
                >
                  Strike Boss
                </button>
              ) : (
                <button 
                  onClick={handleFinishQuest} 
                  className="bg-white text-black font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-sm hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                >
                  Conclude Quest
                </button>
              )}
            </div>
          </motion.div>
        )}

        {phase === "victory" && (
          <motion.div key="victory" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center w-full">
            <CheckCircle2 size={100} className="text-[#00e5ff] mb-6 shadow-[0_0_40px_#00e5ff] rounded-full" />
            <h1 className="text-5xl font-bold text-white tracking-[0.2em] mb-4" style={{ textShadow: '0 0 20px #00e5ff' }}>BOSS DEFEATED</h1>
            
            <div className="bg-black/60 border border-[#00e5ff]/30 p-6 rounded-sm mb-12 w-full max-w-md">
              <h3 className="text-[#00e5ff] font-mono text-xl tracking-widest uppercase mb-4">RAID REPORT</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Score</span>
                <span className="font-bold text-white text-xl">{score} / 6</span>
              </div>
              {results && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">XP Gained</span>
                  <span className="font-bold text-[#00e5ff] text-xl">+{results.gamificationUpdates.xpGained} XP</span>
                </div>
              )}
            </div>

            <button onClick={() => onBack(results?.gamificationUpdates)} className="bg-transparent border-2 border-[#00e5ff] text-[#00e5ff] font-bold tracking-[0.2em] px-12 py-4 rounded-sm hover:bg-[#00e5ff] hover:text-black hover:shadow-[0_0_30px_#00e5ff] transition-all duration-300 uppercase">
              Return to Hub
            </button>
          </motion.div>
        )}

        {phase === "defeat" && (
          <motion.div key="defeat" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center w-full">
            <Skull size={100} className="text-[#ff003c] mb-6 shadow-[0_0_40px_#ff003c] rounded-full" />
            <h1 className="text-5xl font-bold text-white tracking-[0.2em] mb-4" style={{ textShadow: '0 0 20px #ff003c' }}>YOU DIED</h1>
            
            <div className="bg-black/60 border border-[#ff003c]/30 p-6 rounded-sm mb-12 w-full max-w-md">
              <h3 className="text-[#ff003c] font-mono text-xl tracking-widest uppercase mb-4">RAID REPORT</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Score</span>
                <span className="font-bold text-white text-xl">{score} / 6</span>
              </div>
              {results && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">XP Gained</span>
                  <span className="font-bold text-[#ff003c] text-xl">+{results.gamificationUpdates.xpGained} XP</span>
                </div>
              )}
            </div>

            <button onClick={() => onBack(results?.gamificationUpdates)} className="bg-transparent border-2 border-[#ff003c] text-[#ff003c] font-bold tracking-[0.2em] px-12 py-4 rounded-sm hover:bg-[#ff003c] hover:text-black hover:shadow-[0_0_30px_#ff003c] transition-all duration-300 uppercase">
              Return to Hub
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
