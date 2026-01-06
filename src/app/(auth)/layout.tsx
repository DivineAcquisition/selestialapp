import Link from 'next/link'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#9D96FF]/50" />
        
        {/* Glow effects */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#9D96FF]/30 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <Link href="/home" className="flex items-center gap-3 text-white">
            <Image 
              src="/logo-icon-new.png" 
              alt="Selestial" 
              width={40} 
              height={40} 
              className="rounded-lg"
            />
            <span className="text-2xl font-bold">Selestial</span>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Turn more quotes into paying customers
          </h1>
          <p className="text-white/80 text-lg">
            Automate your follow-ups with AI-powered messaging. 
            Never let a lead go cold again.
          </p>
          
          <div className="flex items-center gap-4 pt-6">
            <div className="flex -space-x-3">
              {[1,2,3,4].map((i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-sm font-medium"
                >
                  {['JD', 'SK', 'MB', 'AL'][i-1]}
                </div>
              ))}
            </div>
            <p className="text-white/80 text-sm">
              Join 500+ home service businesses
            </p>
          </div>
        </div>
        
        <p className="relative z-10 text-white/60 text-sm">
          © {new Date().getFullYear()} Selestial. All rights reserved.
        </p>
      </div>
      
      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/home" className="lg:hidden flex items-center gap-2 text-primary mb-8 justify-center">
            <Image 
              src="/logo-icon-new.png" 
              alt="Selestial" 
              width={36} 
              height={36} 
              className="rounded-lg"
            />
            <span className="text-2xl font-bold">Selestial</span>
          </Link>
          
          {children}
        </div>
      </div>
    </div>
  )
}
