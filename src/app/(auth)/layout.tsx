import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Account',
  robots: { index: false, follow: false },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Branding Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#9D96FF]" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-20 -left-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-32 w-[400px] h-[400px] bg-[#9D96FF]/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 rounded-full blur-2xl" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/logo-icon-white.png" 
              alt="Selestial" 
              width={44} 
              height={44} 
              className="drop-shadow-lg"
            />
            <span className="text-2xl font-bold text-white">Selestial</span>
          </Link>
          
          {/* Main content */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Selestial
              <br />
              <span className="text-white/80">workspace.</span>
            </h1>
            <p className="text-xl text-white/70 max-w-md leading-relaxed">
              Sign in to the tools your team already uses. Selestial is a Divine Acquisition company.
            </p>
          </div>
          
          {/* Footer */}
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Selestial. All rights reserved.
          </p>
        </div>
      </div>
      
      {/* Right side - Auth form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo-icon-new.png" 
              alt="Selestial" 
              width={32} 
              height={32} 
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-primary">Selestial</span>
          </Link>
        </div>
        
        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-[420px]">
            {children}
          </div>
        </div>
        
        {/* Mobile footer */}
        <div className="lg:hidden p-6 text-center text-sm text-muted-foreground border-t border-border">
          © {new Date().getFullYear()} Selestial. All rights reserved.
        </div>
      </div>
    </div>
  )
}
