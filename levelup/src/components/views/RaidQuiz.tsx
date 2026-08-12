"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ContentData, Topic } from "@/lib/mockData";
import { ChevronLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface RaidQuizProps {
  topic: Topic;
  contentData: ContentData;
  onCorrectAnswer: () => void;
  onWrongAnswer: () => void;
  onComplete: () => void;
  onBack: () => void;
}

export default function RaidQuiz({ topic, contentData, onCorrectAnswer, onWrongAnswer, onComplete, onBack }: RaidQuizProps) {
  const [phase, setPhase] = useState<"lesson" | "quiz" | "cleared">("lesson");
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showExp, setShowExp] = useState(false);
  const [floatingXp, setFloatingXp] = useState(false);

  const currentQ = contentData.questions[currentQIdx];
  const isCorrect = selectedOpt === currentQ?.correctAnswer;

  const handleNext = () => {
    if (phase === "lesson") {
      setPhase("quiz");
    } else if (phase === "quiz") {
      if (currentQIdx < contentData.questions.length - 1) {
        setCurrentQIdx(prev => prev + 1);
        setSelectedOpt(null);
        setShowExp(false);
        setFloatingXp(false);
      } else {
        setPhase("cleared");
      }
    }
  };

  const handleSelect = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    setShowExp(true);
    
    if (idx === currentQ.correctAnswer) {
      setFloatingXp(true);
      onCorrectAnswer();
    } else {
      onWrongAnswer();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto w-full p-8 relative flex flex-col h-[calc(100vh-100px)]"
    >
      {/* Floating XP Animation */}
      <AnimatePresence>
        {floatingXp && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -100, scale: 1.5 }}
            exit={{ opacity: 0, y: -150 }}
            transition={{ duration: 1 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <span className="text-[#00e5ff] font-bold font-mono text-4xl" style={{ textShadow: '0 0 20px #00e5ff' }}>
              +20 XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors w-fit mb-8 z-10 relative">
        <ChevronLeft size={20} /> <span className="font-mono uppercase text-sm tracking-widest">Retreat</span>
      </button>

      <div className="mb-8 border-b border-[#333] pb-4">
        <h1 className="text-3xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
          <span className="text-[#00e5ff] animate-pulse">●</span> GATE: {topic.title}
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {phase === "lesson" && (
          <motion.div key="lesson" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
            <h3 className="text-[#00e5ff] font-mono text-sm tracking-widest mb-4">&gt; SYSTEM KNOWLEDGE DOWNLOAD...</h3>
            <div className="bg-black/60 backdrop-blur-md border border-[#333] p-8 rounded-sm text-lg leading-relaxed shadow-inner mb-8">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
                {contentData.lesson.split('\n\n').map((para, i) => (
                  <span key={i} className="block mb-4">{para}</span>
                ))}
              </motion.p>
            </div>
            <div className="mt-auto flex justify-end">
              <button onClick={handleNext} className="bg-transparent border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black px-8 py-4 rounded-sm font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)]">
                Commence Raid
              </button>
            </div>
          </motion.div>
        )}

        {phase === "quiz" && (
          <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[#ff003c] font-mono text-sm tracking-widest uppercase">
                &gt; Boss Encounter: Phase {currentQIdx + 1}/{contentData.questions.length}
              </h3>
              <div className="flex gap-2">
                {contentData.questions.map((_, i) => (
                  <div key={i} className={`h-1.5 w-8 rounded-full ${i <= currentQIdx ? 'bg-[#00e5ff] shadow-[0_0_5px_#00e5ff]' : 'bg-[#333]'}`} />
                ))}
              </div>
            </div>

            <div className="text-2xl text-white font-medium mb-12">{currentQ.question}</div>
            
            <div className="space-y-4 mb-8">
              {currentQ.options.map((opt, idx) => {
                let style = "bg-black/60 border-[#333] hover:border-[#00e5ff]/50 text-gray-300";
                if (selectedOpt !== null) {
                  if (idx === currentQ.correctAnswer) style = "bg-[#004d40]/80 border-[#00e5ff] text-white shadow-[0_0_15px_rgba(0,229,255,0.3)]";
                  else if (idx === selectedOpt) style = "bg-[#4a000f]/80 border-[#ff003c] text-white shadow-[0_0_15px_rgba(255,0,60,0.3)]";
                  else style = "bg-black/40 border-[#222] text-gray-600 opacity-40";
                }
                return (
                  <button key={idx} onClick={() => handleSelect(idx)} disabled={selectedOpt !== null} className={twMerge("w-full text-left p-6 rounded-sm border transition-all duration-300 text-lg backdrop-blur-md", style)}>
                    <span className="font-mono text-[#808080] mr-6 font-bold">{String.fromCharCode(65 + idx)}.</span>{opt}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {showExp && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-auto">
                  <div className={`p-6 rounded-sm mb-6 border backdrop-blur-md ${isCorrect ? 'bg-[#002b24]/80 border-[#00e5ff]/50 text-[#00e5ff]' : 'bg-[#2b0009]/80 border-[#ff003c]/50 text-[#ff003c]'}`}>
                    <div className="flex items-start gap-4">
                      {isCorrect ? <CheckCircle2 className="shrink-0 mt-1" size={24} /> : <ShieldAlert className="shrink-0 mt-1" size={24} />}
                      <div>
                        <p className="font-bold mb-2 uppercase tracking-widest text-base">{isCorrect ? "Attack Successful" : "System Alert: Incorrect Strategy"}</p>
                        <p className="text-gray-300">{currentQ.explanation}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleNext} className="bg-white text-black font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-sm hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                      {currentQIdx < contentData.questions.length - 1 ? "Proceed to next area" : "Defeat Boss"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {phase === "cleared" && (
          <motion.div key="cleared" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
            <CheckCircle2 size={100} className="text-[#00e5ff] mb-6 shadow-[0_0_40px_#00e5ff] rounded-full" />
            <h1 className="text-5xl font-bold text-white tracking-[0.2em] mb-4" style={{ textShadow: '0 0 20px #00e5ff' }}>GATE CLEARED</h1>
            <p className="text-gray-400 font-mono text-sm animate-pulse mb-12">Extracting Hunter from Dungeon...</p>
            <button onClick={onComplete} className="bg-transparent border-2 border-[#00e5ff] text-[#00e5ff] font-bold tracking-[0.2em] px-12 py-4 rounded-sm hover:bg-[#00e5ff] hover:text-black hover:shadow-[0_0_30px_#00e5ff] transition-all duration-300 uppercase">
              Return to Hub
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
