"use client";

import { motion } from "framer-motion";
import { Home, Trophy, User, History } from "lucide-react";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: any) => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Gates", icon: Home },
    { id: "leaderboard", label: "Hunter Association", icon: Trophy },
    { id: "recent-hunts", label: "Recent Hunts", icon: History },
    { id: "profile", label: "Hunter Status", icon: User },
  ];

  return (
    <div className="w-64 bg-black/40 border-r border-cyan-900/50 backdrop-blur-xl flex flex-col p-4 h-full">
      <div className="flex flex-col gap-2 mt-4">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors text-left duration-300 relative overflow-hidden ${
                isActive
                  ? "bg-cyan-950/50 border border-cyan-500/50 text-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent"
              }`}
            >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <Icon size={20} className={isActive ? "animate-pulse" : ""} />
              </div>
              <span className="text-xs md:text-sm font-semibold tracking-wider whitespace-nowrap font-mono uppercase">{item.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-8 bg-[#00e5ff] rounded-r-full shadow-[0_0_10px_#00e5ff]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
