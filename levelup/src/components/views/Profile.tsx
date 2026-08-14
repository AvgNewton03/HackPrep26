"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Shield, Zap, Clock, Mail, Key, LogOut, Skull, Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";
import EditProfileModal from "@/components/modals/EditProfileModal";
import UpdateEmailModal from "@/components/modals/UpdateEmailModal";
import ResetPasswordModal from "@/components/modals/ResetPasswordModal";
import { updateHunterProfileAction } from "@/app/actions/hunter";
import { createClient } from "@/utils/supabase/client";

interface ProfileProps {
  stats: {
    username: string;
    hunterClass: string;
    currentRank: string;
    totalXp: number;
    gatesCleared: number;
    highestStreak: number;
    unlockedBadges: string[];
  };
  hunterId: string;
  onProfileUpdate: (username: string) => void;
}

export default function Profile({ stats, hunterId, onProfileUpdate }: ProfileProps) {
  const router = useRouter();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isUpdateEmailOpen, setIsUpdateEmailOpen] = useState(false);
  const [isResetKeyOpen, setIsResetKeyOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleProfileSave = async (newUsername: string) => {
    const res = await updateHunterProfileAction(hunterId, {
      username: newUsername,
    });
    
    if (res.success) {
      onProfileUpdate(newUsername);
    } else {
      throw new Error(res.error || "Failed to update system identity.");
    }
  };

  const statCards = [
    { label: "Current Rank", value: stats.currentRank, icon: Trophy, color: "text-[#00e5ff]" },
    { label: "Total Mana (XP)", value: stats.totalXp.toLocaleString(), icon: Zap, color: "text-[#ff003c]" },
    { label: "Gates Cleared", value: stats.gatesCleared, icon: Shield, color: "text-purple-400" },
    { label: "Longest Streak", value: `${stats.highestStreak} Days`, icon: Clock, color: "text-green-400" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-8 relative flex flex-col gap-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/60 backdrop-blur-xl border border-cyan-900/50 p-8 rounded-sm shadow-[0_0_30px_rgba(0,229,255,0.1)] flex items-center gap-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e5ff]/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="w-24 h-24 bg-neutral-900 border-2 border-[#00e5ff] rounded-sm flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)] shrink-0">
          <Skull size={48} className="text-[#00e5ff]" />
        </div>
        
        <div className="flex-1 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-widest uppercase font-mono mb-2">
              {stats.username}
            </h1>
            <div className="inline-block px-4 py-1 bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] font-mono text-sm tracking-widest uppercase rounded-sm">
              {stats.hunterClass}
            </div>
          </div>
          <button 
            onClick={() => setIsEditProfileOpen(true)}
            className="text-[#00e5ff] bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 border border-[#00e5ff]/30 p-2 rounded-sm transition-colors"
          >
            <Edit3 size={20} />
          </button>
        </div>
      </motion.div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 p-6 rounded-sm flex flex-col gap-4 relative group hover:border-[#00e5ff]/50 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#00e5ff]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-mono text-xs uppercase tracking-widest">{stat.label}</span>
                <Icon size={18} className={stat.color} />
              </div>
              <div className="text-2xl font-bold text-white font-mono tracking-wider">
                {stat.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Shadow Army (Badges) Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-4"
      >
        <h2 className="text-[#00e5ff] font-mono text-lg tracking-widest uppercase flex items-center gap-3">
          <span className="w-2 h-2 bg-[#00e5ff] rounded-full animate-pulse" />
          Shadow Army Extracted
        </h2>
        <div className="bg-black/60 backdrop-blur-xl border border-cyan-900/50 p-8 rounded-sm grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {stats.unlockedBadges.length > 0 ? (
            stats.unlockedBadges.map((badge, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-neutral-950 border border-neutral-800 rounded-sm p-4 flex flex-col items-center justify-center gap-3 cursor-pointer group hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/30 group-hover:bg-purple-500/20 transition-colors">
                  <Skull size={24} className="text-purple-400" />
                </div>
                <span className="text-gray-400 font-mono text-xs text-center uppercase tracking-wider group-hover:text-purple-300 transition-colors">
                  {badge.replace(/-/g, ' ')}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 font-mono text-sm tracking-widest uppercase">
              <Skull size={32} className="mb-4 opacity-50" />
              No shadows extracted yet
            </div>
          )}
        </div>
      </motion.div>

      {/* System Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-4"
      >
        <h2 className="text-gray-400 font-mono text-sm tracking-widest uppercase">
          System Preferences
        </h2>
        <div className="bg-black/60 backdrop-blur-xl border border-neutral-800 p-6 rounded-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 w-full sm:w-auto">
            <button 
              onClick={() => setIsUpdateEmailOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 border border-neutral-700 text-gray-300 font-mono text-xs uppercase tracking-widest hover:border-[#00e5ff] hover:text-[#00e5ff] transition-all rounded-sm group"
            >
              <Mail size={16} className="group-hover:text-[#00e5ff] transition-colors" /> Update Email
            </button>
            <button 
              onClick={() => setIsResetKeyOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 border border-neutral-700 text-gray-300 font-mono text-xs uppercase tracking-widest hover:border-[#ff003c] hover:text-[#ff003c] transition-all rounded-sm group"
            >
              <Key size={16} className="group-hover:text-[#ff003c] transition-colors" /> Reset Key
            </button>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#ff003c]/10 border border-[#ff003c]/50 text-[#ff003c] font-mono text-sm uppercase tracking-widest hover:bg-[#ff003c] hover:text-black transition-all rounded-sm shadow-[0_0_15px_rgba(255,0,60,0.2)]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isEditProfileOpen && (
          <EditProfileModal
            currentUsername={stats.username}
            onClose={() => setIsEditProfileOpen(false)}
            onSave={handleProfileSave}
            hunterId={hunterId}
          />
        )}
        {isUpdateEmailOpen && (
          <UpdateEmailModal onClose={() => setIsUpdateEmailOpen(false)} />
        )}
        {isResetKeyOpen && (
          <ResetPasswordModal onClose={() => setIsResetKeyOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
