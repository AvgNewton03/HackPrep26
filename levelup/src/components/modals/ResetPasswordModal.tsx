"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ResetPasswordModalProps {
  onClose: () => void;
}

export default function ResetPasswordModal({ onClose }: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  const handleUpdate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Keys do not match. Re-enter the cipher.");
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError("Access Key must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess("Security Protocol Updated. Access Key successfully altered.");
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to re-encrypt Access Key.");
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
        className="relative w-full max-w-md bg-neutral-950 border border-[#ff003c]/50 rounded-sm shadow-[0_0_40px_rgba(255,0,60,0.15)] overflow-hidden"
      >
        {/* Decorative corner accents in Red */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#ff003c] opacity-50" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#ff003c] opacity-50" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#ff003c] opacity-50" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#ff003c] opacity-50" />

        <div className="p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-[#ff003c]/30 pb-4">
            <h2 className="text-[#ff003c] font-mono text-xl uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={20} /> Reset Key
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="bg-[#ff003c]/10 border border-[#ff003c]/50 text-[#ff003c] p-3 rounded-sm flex items-start gap-3 font-mono text-sm shadow-[0_0_15px_rgba(255,0,60,0.15)]"
              >
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <p>{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="bg-[#00e5ff]/10 border border-[#00e5ff]/50 text-[#00e5ff] p-3 rounded-sm flex items-start gap-3 font-mono text-sm shadow-[0_0_15px_rgba(0,229,255,0.15)]"
              >
                <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
                <p>{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 font-mono text-xs uppercase tracking-widest ml-1">New Access Key</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ff003c]/50" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-neutral-800 text-white p-3 pl-10 rounded-sm focus:outline-none focus:border-[#ff003c] focus:ring-1 focus:ring-[#ff003c] font-mono text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-400 font-mono text-xs uppercase tracking-widest ml-1">Confirm Access Key</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ff003c]/50" size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/50 border border-neutral-800 text-white p-3 pl-10 rounded-sm focus:outline-none focus:border-[#ff003c] focus:ring-1 focus:ring-[#ff003c] font-mono text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleUpdate}
            disabled={isLoading || !password.trim() || !confirmPassword.trim() || success !== null}
            className="mt-4 w-full relative group bg-transparent border border-[#ff003c] text-[#ff003c] font-bold tracking-widest px-6 py-4 rounded-sm uppercase overflow-hidden transition-all hover:text-black disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
          >
            <div className="absolute inset-0 bg-[#ff003c] translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 ease-out z-0" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                "Re-Encrypt Access Key"
              )}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
