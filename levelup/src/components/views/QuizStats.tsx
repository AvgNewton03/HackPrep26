"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ChevronRight, CheckCircle2, XCircle, X } from "lucide-react";

export interface QuizResultData {
  questionIndex: number;
  questionId: string;
  isCorrect: boolean;
  timeTaken: number; // in seconds
  questionText: string;
  correctOptionText: string;
  selectedOptionText?: string;
}

interface QuizStatsProps {
  results: QuizResultData[];
  onProceed: () => void;
}

export default function QuizStats({ results, onProceed }: QuizStatsProps) {
  const [showReview, setShowReview] = useState(false);
  const correctCount = results.filter((r) => r.isCorrect).length;
  const incorrectCount = results.length - correctCount;

  const pieData = [
    { name: "Correct", value: correctCount, color: "#00e5ff" },
    { name: "Incorrect", value: incorrectCount, color: "#ff003c" },
  ];

  const barData = results.map((r, i) => ({
    name: `Q${i + 1}`,
    timeTaken: r.timeTaken,
    isCorrect: r.isCorrect,
    fill: r.isCorrect ? "#00e5ff" : "#ff003c",
  }));

  const totalTime = results.reduce((acc, r) => acc + r.timeTaken, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-5xl mx-auto w-full p-8 flex flex-col h-full"
    >
      <div className="flex flex-col items-center justify-center mb-10 border-b border-[#333] pb-6">
        <h2 className="text-3xl text-white font-bold tracking-[0.2em] uppercase">
          PERFORMANCE ANALYSIS
        </h2>
        <p className="text-gray-400 font-mono mt-2 tracking-widest uppercase text-sm">
          Awaiting Boss Room Clearance
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Accuracy Pie Chart */}
        <div className="bg-black/60 backdrop-blur-md border border-[#333] p-6 rounded-sm shadow-inner flex flex-col items-center">
          <h3 className="text-[#00e5ff] font-mono text-sm tracking-widest uppercase mb-4">
            &gt; Accuracy Ratio
          </h3>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      style={{
                        filter: `drop-shadow(0px 0px 8px ${entry.color}80)`,
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    borderColor: "#333",
                    color: "#fff",
                    fontFamily: "monospace",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-6 mt-4 font-mono uppercase text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
              <span className="text-gray-300">Correct ({correctCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff003c] shadow-[0_0_8px_#ff003c]" />
              <span className="text-gray-300">
                Incorrect ({incorrectCount})
              </span>
            </div>
          </div>
        </div>

        {/* Time Histogram Bar Chart */}
        <div className="bg-black/60 backdrop-blur-md border border-[#333] p-6 rounded-sm shadow-inner flex flex-col items-center">
          <h3 className="text-[#00e5ff] font-mono text-sm tracking-widest uppercase mb-4">
            &gt; Time Elapsed Per Question (s)
          </h3>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#666"
                  tick={{ fill: "#888", fontSize: 12, fontFamily: "monospace" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#666"
                  tick={{ fill: "#888", fontSize: 12, fontFamily: "monospace" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#ffffff10" }}
                  contentStyle={{
                    backgroundColor: "#000",
                    borderColor: "#333",
                    color: "#fff",
                    fontFamily: "monospace",
                  }}
                  formatter={(value: any) => [`${value}s`, "Time Taken"]}
                />
                <Bar dataKey="timeTaken" radius={[2, 2, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      style={{
                        filter: `drop-shadow(0px 0px 5px ${entry.fill}80)`,
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 text-gray-400 font-mono text-sm uppercase tracking-widest">
            Total Time:{" "}
            <span className="text-white font-bold">{totalTime}s</span>
          </div>
        </div>
      </div>

      <div className="mt-auto flex justify-end gap-4">
        <button
          onClick={() => setShowReview(true)}
          className="bg-transparent border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black font-bold uppercase tracking-widest text-sm px-6 py-4 rounded-sm transition-colors shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] flex items-center gap-2 opacity-80"
        >
          Review Question Solutions &gt;
        </button>
        <button
          onClick={onProceed}
          className="bg-transparent border border-[#ff003c] text-[#ff003c] hover:bg-[#ff003c] hover:text-black font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-sm transition-colors shadow-[0_0_15px_rgba(255,0,60,0.2)] hover:shadow-[0_0_25px_rgba(255,0,60,0.5)] flex items-center gap-2"
        >
          Proceed to Boss Room <ChevronRight size={18} />
        </button>
      </div>

      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-black border border-[#333] shadow-[0_0_30px_rgba(0,229,255,0.1)] w-full max-w-4xl max-h-[80vh] flex flex-col rounded-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#333] bg-[#0a0a0a]">
                <h2 className="text-xl text-[#00e5ff] font-bold tracking-[0.2em] uppercase" style={{ textShadow: "0 0 10px rgba(0,229,255,0.5)" }}>
                  DETAILED QUESTION FEEDBACK
                </h2>
                <button
                  onClick={() => setShowReview(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                {results.map((r, i) => (
                  <div key={i} className="border border-[#222] bg-[#111] p-5 rounded-sm flex flex-col gap-3">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {r.isCorrect ? (
                          <CheckCircle2 className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" size={24} />
                        ) : (
                          <XCircle className="text-[#ff003c] drop-shadow-[0_0_8px_rgba(255,0,60,0.8)]" size={24} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 font-mono tracking-widest uppercase mb-1">
                          Question {i + 1}
                        </div>
                        <div className="text-lg text-gray-200 mb-4">{r.questionText}</div>
                        
                        {!r.isCorrect && (
                          <div className="mb-3">
                            <div className="text-xs text-[#ff003c] font-mono tracking-widest uppercase mb-1">Your Incorrect Selection</div>
                            <div className="bg-[#ff003c]/10 border border-[#ff003c]/30 text-gray-300 p-3 rounded-sm">{r.selectedOptionText}</div>
                          </div>
                        )}
                        
                        <div>
                          <div className="text-xs text-[#00e5ff] font-mono tracking-widest uppercase mb-1">Correct Answer</div>
                          <div className="bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-gray-300 p-3 rounded-sm">{r.correctOptionText}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
