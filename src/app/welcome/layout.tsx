'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/ui/icon';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/welcome" className="flex items-center gap-2.5">
            <Image
              src="/logo-icon-new.png"
              alt="Selestial"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-semibold text-gray-900">Selestial</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#sequences" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Workflows
            </a>
            <a href="#demo" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Demo
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main>{children}</main>
      
      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/welcome" className="flex items-center gap-2.5 mb-4">
                <Image
                  src="/logo-icon-new.png"
                  alt="Selestial"
                  width={28}
                  height={28}
                  className="rounded-lg"
                />
                <span className="text-lg font-semibold text-gray-900">Selestial</span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed">
                AI-powered quote follow-up for home service businesses. Win more jobs, automatically.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#sequences" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Workflows</a></li>
                <li><a href="#demo" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="https://selestial.io/privacy" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Privacy</a></li>
                <li><a href="https://selestial.io/terms" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Terms</a></li>
                <li><a href="https://selestial.io/disclaimer" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Selestial. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Icon name="globe" size="sm" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
