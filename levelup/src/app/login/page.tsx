import SystemAuth from '@/components/auth/SystemAuth'

export const metadata = {
  title: 'System Access - LevelUp',
  description: 'Authenticate to access the LevelUp system.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Futuristic Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00e5ff 1px, transparent 1px),
            linear-gradient(to bottom, #00e5ff 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)'
        }}
      />
      
      {/* Decorative vertical lines */}
      <div className="absolute left-[10%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#00e5ff]/30 to-transparent z-0 pointer-events-none" />
      <div className="absolute right-[10%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#00e5ff]/30 to-transparent z-0 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg px-4 flex flex-col items-center">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-[0.3em] uppercase mb-2 font-mono" style={{ textShadow: '0 0 20px rgba(0,229,255,0.5)' }}>
            LevelUp
          </h1>
          <p className="text-[#00e5ff] font-mono text-sm tracking-widest uppercase opacity-80">
            System Initialization Sequence
          </p>
        </div>

        <SystemAuth />
      </div>
    </div>
  )
}
