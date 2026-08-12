"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface BossFightProps {
  topic: string;
  onVictory: () => void;
  onDefeat: () => void;
}

export default function BossFight({ topic, onVictory, onDefeat }: BossFightProps) {
  const [bossHp, setBossHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  
  const [chatHistory, setChatHistory] = useState<{role: 'boss' | 'hunter', content: string}[]>([
    { role: 'boss', content: `So, you've survived the lower floors. But you know nothing of ${topic}. Prove your worth, or perish here.` }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isBossTyping, setIsBossTyping] = useState(false);
  const [fightConcluded, setFightConcluded] = useState<"victory" | "defeat" | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isBossTyping]);

  useEffect(() => {
    if (bossHp <= 0) {
      setFightConcluded("victory");
    } else if (playerHp <= 0) {
      setFightConcluded("defeat");
    }
  }, [bossHp, playerHp]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isBossTyping || fightConcluded) return;

    const newHunterMsg = { role: 'hunter' as const, content: inputMessage };
    setChatHistory(prev => [...prev, newHunterMsg]);
    setInputMessage("");
    setIsBossTyping(true);

    try {
      const res = await fetch('/api/boss/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          chatHistory: chatHistory.map(m => ({ role: m.role, content: m.content })),
          userMessage: newHunterMsg.content
        })
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        const result = data.data;
        setChatHistory(prev => [...prev, { role: 'boss', content: result.bossResponse }]);
        
        if (result.playerDamageTaken > 0) {
          setPlayerHp(prev => Math.max(0, prev - result.playerDamageTaken));
        }
        if (result.bossDamageTaken > 0) {
          setBossHp(prev => Math.max(0, prev - result.bossDamageTaken));
        }
        
        if (result.isDefeated) {
          setBossHp(0);
        }
      } else {
        throw new Error("Failed response");
      }
    } catch (err) {
      // Fallback in case of error
      setChatHistory(prev => [...prev, { role: 'boss', content: "Your connection is weak. My aura disrupts your magic." }]);
      setPlayerHp(prev => Math.max(0, prev - 10));
    } finally {
      setIsBossTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto w-full p-8 relative flex flex-col h-[calc(100vh-100px)]"
    >
      {/* HP HUD */}
      <div className="flex justify-between items-center mb-8 bg-black/60 backdrop-blur-md p-4 rounded-sm border border-[#333]">
        <div className="flex-1 mr-8">
          <div className="flex justify-between mb-2">
            <span className="font-bold text-[#ff003c] tracking-widest uppercase">Boss HP</span>
            <span className="text-[#ff003c]">{bossHp}%</span>
          </div>
          <div className="h-4 bg-[#333] rounded-full overflow-hidden border border-[#ff003c]/30">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: `${bossHp}%` }}
              className="h-full bg-[#ff003c] shadow-[0_0_10px_#ff003c]"
            />
          </div>
        </div>
        
        <div className="text-3xl font-bold text-white tracking-widest px-4">VS</div>

        <div className="flex-1 ml-8 text-right">
          <div className="flex justify-between mb-2 flex-row-reverse">
            <span className="font-bold text-[#00e5ff] tracking-widest uppercase">Hunter HP</span>
            <span className="text-[#00e5ff]">{playerHp}%</span>
          </div>
          <div className="h-4 bg-[#333] rounded-full overflow-hidden border border-[#00e5ff]/30 flex justify-end">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: `${playerHp}%` }}
              className="h-full bg-[#00e5ff] shadow-[0_0_10px_#00e5ff]"
            />
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mb-6 p-4 rounded-sm custom-scrollbar bg-black/40 border border-[#333] shadow-inner">
        <AnimatePresence>
          {chatHistory.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={twMerge(
                "mb-6 max-w-[80%] p-4 rounded-lg backdrop-blur-md relative",
                msg.role === 'boss' 
                  ? "mr-auto bg-[#3a000d]/80 border border-[#ff003c] text-[#ffcccc] shadow-[0_0_15px_rgba(255,0,60,0.1)] rounded-tl-none" 
                  : "ml-auto bg-[#004d40]/80 border border-[#00e5ff] text-[#e0ffff] shadow-[0_0_15px_rgba(0,229,255,0.1)] rounded-tr-none text-right"
              )}
            >
              <div className={twMerge(
                "absolute -top-3 text-xs font-bold font-mono tracking-widest uppercase px-2 bg-black",
                msg.role === 'boss' ? "-left-px text-[#ff003c]" : "-right-px text-[#00e5ff]"
              )}>
                {msg.role === 'boss' ? "Dungeon Boss" : "Hunter"}
              </div>
              <p className="leading-relaxed mt-1 whitespace-pre-wrap">{msg.content}</p>
            </motion.div>
          ))}
          {isBossTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 mr-auto max-w-[80%] p-4 text-[#ff003c] font-mono text-sm tracking-widest">
              &gt; Boss is preparing an attack...
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Result Overlays */}
      <AnimatePresence>
        {fightConcluded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            {fightConcluded === 'victory' ? (
              <div className="text-center">
                <h1 className="text-5xl font-bold text-[#00e5ff] tracking-[0.3em] mb-6 shadow-[0_0_40px_#00e5ff] py-4">SHADOW EXTRACTED</h1>
                <p className="text-xl text-white mb-12">Boss Defeated. Massive Mana Boost Awarded!</p>
                <button onClick={onVictory} className="bg-[#00e5ff] text-black font-bold uppercase tracking-widest px-12 py-4 rounded-sm hover:shadow-[0_0_30px_#00e5ff] transition-all">
                  Claim Reward
                </button>
              </div>
            ) : (
              <div className="text-center">
                <h1 className="text-7xl font-bold text-[#ff003c] tracking-[0.3em] mb-6 shadow-[0_0_40px_#ff003c] py-4 font-serif">YOU DIED</h1>
                <p className="text-xl text-gray-400 mb-12 font-mono uppercase tracking-widest">Your mana has been depleted.</p>
                <button onClick={onDefeat} className="border-2 border-[#ff003c] text-[#ff003c] font-bold uppercase tracking-widest px-12 py-4 rounded-sm hover:bg-[#ff003c] hover:text-black transition-all">
                  Return to Hub
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-4">
        <input 
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isBossTyping || fightConcluded !== null}
          placeholder="Counter the Boss's argument..."
          className="flex-1 bg-black/60 border border-[#333] text-white p-4 rounded-sm focus:border-[#00e5ff] outline-none transition-colors disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={isBossTyping || !inputMessage.trim() || fightConcluded !== null}
          className="bg-transparent border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black font-bold uppercase tracking-widest px-8 rounded-sm transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#00e5ff]"
        >
          Strike
        </button>
      </form>
    </motion.div>
  );
}
