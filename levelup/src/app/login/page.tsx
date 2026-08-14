import SystemAuth from '@/components/auth/SystemAuth'

export const metadata = {
  title: 'System Access - LevelUp',
  description: 'Authenticate to access the LevelUp system.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Deep black background with a subtle, pulsating cyan radial gradient in the center */}
      <div 
        className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.15)_0%,transparent_50%)] opacity-80"
        style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg px-4 flex flex-col items-center">
        <SystemAuth />
      </div>
    </div>
  )
}
