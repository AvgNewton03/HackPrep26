'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { login, signup, resetPassword } from '@/app/auth/actions'

type AuthView = 'login' | 'signup' | 'forgot'

export default function SystemAuth() {
  const [view, setView] = useState<AuthView>('login')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleViewChange = (newView: AuthView) => {
    setView(newView)
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      if (view === 'login') {
        const res = await login(formData)
        if (res?.error) setError(res.error)
      } else if (view === 'signup') {
        const res = await signup(formData)
        if (res?.error) {
          setError(res.error)
        } else {
          setSuccess('SYSTEM ALERT: Verification email dispatched. Await awakening.')
        }
      } else if (view === 'forgot') {
        const res = await resetPassword(formData)
        if (res?.error) {
          setError(res.error)
        } else {
          setSuccess('SYSTEM ALERT: Password reset protocol initiated. Check your inbox.')
        }
      }
    } catch (err: any) {
      setError('Critical System Failure: Communication intercepted.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        layout
        className="bg-black/50 backdrop-blur-xl border border-[#00e5ff]/30 p-8 rounded-sm shadow-[0_0_40px_rgba(0,229,255,0.15)] relative overflow-hidden"
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00e5ff] opacity-50" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00e5ff] opacity-50" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00e5ff] opacity-50" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00e5ff] opacity-50" />

        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 border-2 border-[#00e5ff] rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)] animate-pulse">
            <span className="text-[#00e5ff] font-mono font-bold text-xl">SYS</span>
          </div>
        </div>

        <motion.h2 
          layout="position"
          className="text-2xl font-bold text-white text-center mb-6 uppercase tracking-widest font-mono"
        >
          {view === 'login' && 'System Login'}
          {view === 'signup' && 'Hunter Registration'}
          {view === 'forgot' && 'Reset Protocol'}
        </motion.h2>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="bg-[#ff003c]/10 border border-[#ff003c]/50 text-[#ff003c] p-4 rounded-sm mb-6 flex items-start gap-3 font-mono text-sm shadow-[0_0_15px_rgba(255,0,60,0.15)]"
            >
              <ShieldAlert className="shrink-0 mt-0.5" size={18} />
              <p>{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="bg-[#00e5ff]/10 border border-[#00e5ff]/50 text-[#00e5ff] p-4 rounded-sm mb-6 flex items-start gap-3 font-mono text-sm shadow-[0_0_15px_rgba(0,229,255,0.15)]"
            >
              <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
              <p>{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div layout="position" className="space-y-2">
            <label className="text-[#00e5ff] text-xs font-mono uppercase tracking-widest ml-1">Email Coordinates</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00e5ff]/50" size={18} />
              <input
                name="email"
                type="email"
                required
                className="w-full bg-neutral-950/80 border border-[#333] text-white p-3 pl-10 rounded-sm outline-none transition-all focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] font-mono text-sm placeholder:text-gray-600"
                placeholder="hunter@system.kr"
              />
            </div>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {(view === 'login' || view === 'signup') && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <label className="text-[#00e5ff] text-xs font-mono uppercase tracking-widest ml-1">Access Cipher</label>
                  {view === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleViewChange('forgot')}
                      className="text-gray-400 hover:text-[#00e5ff] text-xs font-mono transition-colors uppercase tracking-widest"
                    >
                      Lost Cipher?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00e5ff]/50" size={18} />
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="w-full bg-neutral-950/80 border border-[#333] text-white p-3 pl-10 rounded-sm outline-none transition-all focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] font-mono text-sm placeholder:text-gray-600"
                    placeholder="••••••••"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {view === 'login' && (
            <motion.div layout="position" className="flex items-center gap-3 mt-4">
              <div 
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded-sm border flex items-center justify-center cursor-pointer transition-all ${rememberMe ? 'bg-[#00e5ff]/20 border-[#00e5ff]' : 'border-[#333] bg-neutral-950'}`}
              >
                {rememberMe && <CheckCircle2 size={14} className="text-[#00e5ff]" />}
              </div>
              <span className="text-gray-400 text-xs font-mono uppercase tracking-widest cursor-pointer select-none" onClick={() => setRememberMe(!rememberMe)}>
                Maintain Connection
              </span>
            </motion.div>
          )}

          <motion.div layout="position" className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group bg-transparent border border-[#00e5ff] text-[#00e5ff] font-bold tracking-widest px-6 py-4 rounded-sm uppercase overflow-hidden transition-all hover:text-black disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
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
                    {view === 'login' && 'Initialize'}
                    {view === 'signup' && 'Awaken'}
                    {view === 'forgot' && 'Transmit Request'}
                  </>
                )}
              </span>
            </button>
          </motion.div>
        </form>

        <motion.div layout="position" className="mt-8 text-center border-t border-[#333] pt-6">
          {view === 'login' ? (
            <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">
              Unregistered entity?{' '}
              <button onClick={() => handleViewChange('signup')} className="text-[#00e5ff] hover:underline hover:text-white transition-colors ml-1 font-bold">
                Register Now
              </button>
            </p>
          ) : (
            <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">
              Return to login sequence?{' '}
              <button onClick={() => handleViewChange('login')} className="text-[#00e5ff] hover:underline hover:text-white transition-colors ml-1 font-bold">
                Proceed
              </button>
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
