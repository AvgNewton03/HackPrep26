"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface EditProfileModalProps {
  currentUsername: string;
  onClose: () => void;
  onSave: (username: string) => Promise<void>;
  hunterId: string;
}

export default function EditProfileModal({ currentUsername, onClose, onSave, hunterId }: EditProfileModalProps) {
  const [username, setUsername] = useState(currentUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from('hunters')
        .update({ username })
        .eq('id', hunterId);
        
      if (dbError) throw dbError;
      
      await onSave(username);
      setSuccess("System Alert: Profile Synchronized");
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-neutral-950 border border-cyan-900/50 rounded-sm shadow-[0_0_30px_rgba(0,229,255,0.15)] overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00e5ff] opacity-50" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00e5ff] opacity-50" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00e5ff] opacity-50" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00e5ff] opacity-50" />

        <div className="p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-cyan-900/30 pb-4">
            <h2 className="text-[#00e5ff] font-mono text-xl uppercase tracking-widest">Update Identity</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          {error && (
            <div className="bg-[#ff003c]/10 border border-[#ff003c]/50 text-[#ff003c] p-3 rounded-sm mb-4 flex items-center gap-2 font-mono text-sm shadow-[0_0_15px_rgba(255,0,60,0.2)]">
              <AlertCircle size={16} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-[#00e5ff]/10 border border-[#00e5ff]/50 text-[#00e5ff] p-3 rounded-sm mb-4 flex items-center gap-2 font-mono text-sm shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <CheckCircle2 size={16} className="shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 font-mono text-xs uppercase tracking-widest ml-1">Hunter Call-sign</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black/50 border border-neutral-800 text-white p-3 rounded-sm focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] font-mono text-sm transition-all"
                placeholder="Enter call-sign"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isLoading || !username.trim()}
            className="mt-4 w-full relative group bg-[#00e5ff]/10 border border-[#00e5ff] text-[#00e5ff] font-bold tracking-widest px-6 py-4 rounded-sm uppercase overflow-hidden transition-all hover:text-black disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
          >
            <div className="absolute inset-0 bg-[#00e5ff] translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 ease-out z-0" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <>
                  <Save size={18} />
                  Save System Changes
                </>
              )}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
