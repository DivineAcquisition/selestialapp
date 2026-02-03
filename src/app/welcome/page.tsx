'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Icon, IconName } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;
    
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(229 231 235) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Gradient blobs */}
        <div className="absolute top-20 -left-32 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 -right-32 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-full blur-[80px]" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">AI-powered automation</span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-6">
              Win more jobs.
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">
                Automatically.
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Stop losing leads to slow follow-ups. Selestial uses AI to send perfect quote responses, 
              book more appointments, and close more deals—all on autopilot.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { value: '35%', label: 'Higher close rate' },
                { value: '10h+', label: 'Saved weekly' },
                { value: '5min', label: 'Avg response time' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
              <div className="flex items-center gap-2 text-gray-500">
                <Icon name="shield" size="sm" className="text-green-500" />
                <span className="text-sm">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Icon name="lock" size="sm" className="text-green-500" />
                <span className="text-sm">Bank-level encryption</span>
              </div>
            </div>
          </motion.div>
          
          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative">
              {/* Card shadow/glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 rounded-3xl blur-xl" />
              
              <div className="relative bg-white border border-gray-200 rounded-2xl p-8 shadow-2xl shadow-gray-200/50">
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Start your free trial</h2>
                        <p className="text-gray-500">No credit card required. Get started in 2 minutes.</p>
                      </div>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <Input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Smith"
                            className="w-full h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Work Email</label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@company.com"
                            className="w-full h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                            required
                          />
                        </div>
                        
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-lg shadow-primary/25"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <Icon name="spinner" size="sm" className="animate-spin" />
                              Creating account...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Get Started Free
                              <Icon name="arrowRight" size="sm" />
                            </span>
                          )}
                        </Button>
                      </form>
                      
                      <p className="text-center text-xs text-gray-500 mt-6">
                        By signing up, you agree to our{' '}
                        <a href="https://selestial.io/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms</a> and{' '}
                        <a href="https://selestial.io/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <Icon name="check" size="xl" className="text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">You&apos;re in!</h3>
                      <p className="text-gray-500 mb-6">Check your email to complete setup.</p>
                      <Link href="/signup">
                        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                          Continue to Dashboard
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2 text-gray-400"
        >
          <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
          <Icon name="chevronDown" size="sm" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================================================
// FEATURE DEMOS
// ============================================================================

// Speed-to-Lead Demo
function SpeedToLeadDemo() {
  const [stage, setStage] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStage(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const messages = [
    { type: 'incoming', text: 'Hi, I need a quote for AC repair', time: '2:34 PM' },
    { type: 'ai', text: "Hi! Thanks for reaching out. I'm here to help with your AC repair. What seems to be the issue?", time: '2:34 PM', delay: '< 60 sec' },
    { type: 'incoming', text: "It's not cooling properly", time: '2:35 PM' },
    { type: 'ai', text: "I understand - that's frustrating, especially in this heat! I can have a technician out today. Does 3-5 PM work for you?", time: '2:35 PM' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Browser chrome */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-4 py-1 bg-gray-100 rounded-lg text-xs text-gray-500">Inbox - Selestial</div>
        </div>
      </div>
      
      {/* Chat interface */}
      <div className="p-6 space-y-4 min-h-[300px]">
        {messages.slice(0, stage + 1).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex",
              msg.type === 'incoming' ? 'justify-start' : 'justify-end'
            )}
          >
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3",
              msg.type === 'incoming' 
                ? 'bg-gray-100 text-gray-900 rounded-bl-md' 
                : 'bg-primary text-white rounded-br-md'
            )}>
              <p className="text-sm">{msg.text}</p>
              <div className={cn(
                "flex items-center gap-2 mt-1 text-xs",
                msg.type === 'incoming' ? 'text-gray-500' : 'text-white/70'
              )}>
                <span>{msg.time}</span>
                {msg.delay && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Icon name="bolt" size="xs" />
                      {msg.delay}
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Quote Follow-up Demo
function QuoteFollowUpDemo() {
  const [selectedDay, setSelectedDay] = useState(2);
  
  const sequence = [
    { day: 0, action: 'Quote sent', status: 'completed', icon: 'send' as IconName },
    { day: 2, action: 'First follow-up', status: 'completed', icon: 'message' as IconName },
    { day: 5, action: 'Value email', status: 'active', icon: 'mail' as IconName },
    { day: 8, action: 'Urgency SMS', status: 'pending', icon: 'clock' as IconName },
    { day: 12, action: 'Final touch', status: 'pending', icon: 'check' as IconName },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">Quote Follow-Up Sequence</h4>
          <p className="text-sm text-gray-500">21-day nurture automation</p>
        </div>
        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          Active
        </div>
      </div>
      
      {/* Timeline */}
      <div className="p-6">
        <div className="relative">
          {/* Line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          <div className="space-y-6">
            {sequence.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "relative flex items-start gap-4 cursor-pointer",
                  selectedDay === step.day && "scale-[1.02]"
                )}
                onClick={() => setSelectedDay(step.day)}
              >
                <div className={cn(
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  step.status === 'completed' && "bg-green-500 text-white",
                  step.status === 'active' && "bg-primary text-white ring-4 ring-primary/20",
                  step.status === 'pending' && "bg-gray-200 text-gray-500"
                )}>
                  <Icon name={step.icon} size="sm" />
                </div>
                
                <div className="flex-1 pt-2">
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "font-medium",
                      step.status === 'active' ? 'text-primary' : 'text-gray-900'
                    )}>
                      {step.action}
                    </p>
                    <span className="text-xs text-gray-400">Day {step.day}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">35%</p>
            <p className="text-xs text-gray-500">Close Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">21</p>
            <p className="text-xs text-gray-500">Avg Days</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">6</p>
            <p className="text-xs text-gray-500">Touch Points</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Customer Retention Demo
function RetentionDemo() {
  const customers = [
    { name: 'Sarah M.', health: 95, status: 'healthy', lastService: '3 days ago' },
    { name: 'John D.', health: 72, status: 'warning', lastService: '45 days ago' },
    { name: 'Mike R.', health: 35, status: 'at-risk', lastService: '90 days ago' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h4 className="font-semibold text-gray-900">Customer Health Monitor</h4>
        <p className="text-sm text-gray-500">AI-powered churn prediction</p>
      </div>
      
      <div className="p-6 space-y-4">
        {customers.map((customer, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
              {customer.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{customer.name}</p>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  customer.status === 'healthy' && "bg-green-100 text-green-700",
                  customer.status === 'warning' && "bg-yellow-100 text-yellow-700",
                  customer.status === 'at-risk' && "bg-red-100 text-red-700"
                )}>
                  {customer.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">Last service: {customer.lastService}</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      customer.health >= 80 && "bg-green-500",
                      customer.health >= 50 && customer.health < 80 && "bg-yellow-500",
                      customer.health < 50 && "bg-red-500"
                    )}
                    style={{ width: `${customer.health}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{customer.health}</span>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Action panel */}
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <Icon name="alertCircle" size="sm" className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-900">1 customer needs attention</p>
              <p className="text-sm text-red-700">Win-back sequence ready to deploy</p>
            </div>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              Take Action
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Analytics Demo
function AnalyticsDemo() {
  const data = [35, 42, 38, 55, 48, 62, 58, 75, 68, 82, 78, 95];
  const max = Math.max(...data);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">Revenue Analytics</h4>
          <p className="text-sm text-gray-500">Last 12 months</p>
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <Icon name="trendingUp" size="sm" />
          <span className="text-sm font-medium">+127%</span>
        </div>
      </div>
      
      <div className="p-6">
        {/* Chart */}
        <div className="flex items-end gap-2 h-40 mb-6">
          {data.map((value, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(value / max) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="flex-1 bg-gradient-to-t from-primary to-violet-400 rounded-t-md relative group cursor-pointer hover:from-primary/90 hover:to-violet-400/90"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ${(value * 100).toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">$127,450</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-sm text-gray-500 mb-1">Avg Deal Size</p>
            <p className="text-2xl font-bold text-gray-900">$2,840</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Booking Widget Demo
function BookingWidgetDemo() {
  const [step, setStep] = useState(0);
  const steps = ['ZIP', 'Size', 'Service', 'Checkout'];
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Widget Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-primary to-violet-500 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center font-bold">
            SC
          </div>
          <div>
            <p className="font-semibold">Sparkle Clean Co.</p>
            <p className="text-xs text-white/80">(555) 123-4567</p>
          </div>
        </div>
      </div>
      
      {/* Promo Banner */}
      <div className="px-6 py-3 bg-green-50 text-center">
        <p className="text-green-700 font-semibold text-sm">🎉 Get 20% Off Your First Clean!</p>
      </div>
      
      {/* Trust Badges */}
      <div className="px-6 py-3 flex justify-center gap-3 border-b border-gray-100">
        {['Google Guaranteed', 'BBB A+', 'Insured'].map((badge, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-[10px] font-medium">
            <Icon name="shield" size="xs" className="text-green-500" />
            {badge}
          </span>
        ))}
      </div>
      
      {/* Step Indicator */}
      <div className="px-6 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                i <= step ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
              )}>
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 mx-1 transition-all",
                  i < step ? "bg-primary" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 min-h-[180px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="zip"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <Icon name="mapPin" size="xl" className="mx-auto text-gray-400 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Enter Your ZIP Code</h4>
              <p className="text-sm text-gray-500 mb-4">We'll check if we service your area</p>
              <Input placeholder="Enter ZIP code" className="max-w-[200px] mx-auto text-center" />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div
              key="size"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h4 className="font-semibold text-gray-900 mb-4">Select Home Size</h4>
              <div className="grid grid-cols-2 gap-2">
                {['1,000 sqft', '1,500 sqft', '2,000 sqft', '2,500 sqft'].map((size, i) => (
                  <div key={i} className="p-3 border rounded-lg text-center hover:border-primary/50 cursor-pointer transition-all">
                    <p className="font-medium text-sm">{size}</p>
                    <p className="text-primary font-bold">${149 + (i * 40)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h4 className="font-semibold text-gray-900 mb-4">Choose Service</h4>
              <div className="space-y-2">
                {[
                  { name: 'Standard Clean', price: 189, popular: false },
                  { name: 'Deep Clean', price: 249, popular: true },
                  { name: 'Move In/Out', price: 299, popular: false },
                ].map((service, i) => (
                  <div key={i} className={cn(
                    "p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-all",
                    service.popular && "border-primary/50 bg-primary/5"
                  )}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{service.name}</span>
                      {service.popular && (
                        <span className="px-1.5 py-0.5 bg-primary text-white text-[9px] rounded font-medium">Popular</span>
                      )}
                    </div>
                    <span className="font-bold text-primary">${service.price}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Icon name="check" size="lg" className="text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Ready to Book!</h4>
              <p className="text-sm text-gray-500 mb-4">Secure checkout with Stripe</p>
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex justify-between mb-1">
                  <span>Deep Clean</span>
                  <span>$249</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>First-time Discount</span>
                  <span>-$50</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>$199</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Navigation */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        <Button 
          size="sm" 
          onClick={() => setStep(Math.min(3, step + 1))}
          className="bg-primary"
        >
          {step === 3 ? 'Book Now' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      title: 'Online Booking Widget',
      description: 'Let customers book appointments 24/7 from your website with real-time pricing and secure Stripe payments.',
      demo: <BookingWidgetDemo />,
    },
    {
      title: 'Speed-to-Lead Automation',
      description: 'Respond to new leads in under 60 seconds. First to respond wins 78% of jobs.',
      demo: <SpeedToLeadDemo />,
    },
    {
      title: 'Smart Quote Follow-Up',
      description: 'Automated 21-day nurture sequences that convert estimates to booked jobs.',
      demo: <QuoteFollowUpDemo />,
    },
    {
      title: 'Customer Retention AI',
      description: 'Detect at-risk customers before they churn. Save relationships proactively.',
      demo: <RetentionDemo />,
    },
    {
      title: 'Revenue Analytics',
      description: 'Track pipeline velocity, conversion rates, and revenue in real-time.',
      demo: <AnalyticsDemo />,
    },
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to win more jobs
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Powerful automation tools designed specifically for home service businesses. 
            Set it up once, then watch your close rate soar.
          </p>
        </motion.div>
        
        <div className="space-y-24">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={cn(
                "grid lg:grid-cols-2 gap-12 items-center",
                i % 2 === 1 && "lg:flex-row-reverse"
              )}
            >
              <div className={cn(i % 2 === 1 && "lg:order-2")}>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                  Learn More
                  <Icon name="arrowRight" size="sm" className="ml-2" />
                </Button>
              </div>
              <div className={cn(i % 2 === 1 && "lg:order-1")}>
                {feature.demo}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SEQUENCES SHOWCASE
// ============================================================================

const sequenceCategories = [
  {
    id: 'speed-to-lead',
    name: 'Speed-to-Lead',
    icon: 'bolt' as IconName,
    color: 'red',
    description: 'Respond instantly to new leads',
    sequences: [
      { name: 'Speed-to-Lead', metric: '< 60 sec', description: 'Instant response to new inquiries' },
      { name: 'Missed Call Recovery', metric: '40% recovery', description: 'Text back when you miss a call' },
      { name: 'After Hours Response', metric: '24/7 capture', description: 'Never miss a lead overnight' },
      { name: 'Hot Lead Fast Track', metric: '5 touches/24hr', description: 'Aggressive follow-up for urgent buyers' },
    ],
  },
  {
    id: 'quote-followup',
    name: 'Quote Follow-Up',
    icon: 'fileText' as IconName,
    color: 'blue',
    description: 'Convert estimates to booked jobs',
    sequences: [
      { name: 'Quote Follow-Up', metric: '21-day nurture', description: '6+ touchpoints until conversion' },
      { name: 'Estimate Expiry', metric: 'Urgency trigger', description: 'Create FOMO before quote expires' },
      { name: 'Pipeline Nurture', metric: '60-day drip', description: 'Stay top of mind for big projects' },
      { name: 'Good-Better-Best', metric: 'Option follow-up', description: 'Help customers decide on package' },
      { name: 'Financing Follow-Up', metric: 'Payment plans', description: 'Close deals with financing options' },
      { name: 'Second Estimate', metric: 'Competitive', description: 'Win against competitor quotes' },
    ],
  },
  {
    id: 'booking-service',
    name: 'Booking & Service',
    icon: 'calendar' as IconName,
    color: 'green',
    description: 'Reduce no-shows and get reviews',
    sequences: [
      { name: 'Booking Reminder', metric: '< 5% no-show', description: 'Multi-touch confirmation sequence' },
      { name: 'Post-Service Thank You', metric: 'Same-day', description: 'Build goodwill immediately after service' },
      { name: 'Review Request', metric: '30% response', description: 'Automated 5-star review collection' },
      { name: 'Referral Request', metric: 'Day 7', description: 'Ask happy customers for referrals' },
    ],
  },
  {
    id: 'retention',
    name: 'Customer Retention',
    icon: 'heart' as IconName,
    color: 'purple',
    description: 'Keep customers coming back',
    sequences: [
      { name: 'At-Risk Intervention', metric: 'Churn prevention', description: 'Detect and save at-risk customers' },
      { name: 'Rebooking Reminder', metric: 'Service intervals', description: 'Proactive scheduling for recurring' },
      { name: 'Win-Back Campaign', metric: 'Lapsed customers', description: 'Re-engage inactive accounts' },
      { name: 'VIP Nurture', metric: 'High-value', description: 'Special treatment for top customers' },
      { name: 'Subscription Conversion', metric: 'Recurring revenue', description: 'Convert one-time to recurring' },
      { name: 'Contract Renewal', metric: '30-day notice', description: 'Renew annual agreements' },
    ],
  },
  {
    id: 'seasonal',
    name: 'Seasonal Campaigns',
    icon: 'sun' as IconName,
    color: 'orange',
    description: 'Cleaning-specific campaigns',
    sequences: [
      { name: 'Spring Cleaning', metric: 'Mar-Apr', description: 'Annual deep cleaning promotion' },
      { name: 'Holiday Prep', metric: 'Nov-Dec', description: 'Deep cleaning before holidays' },
      { name: 'Back to School', metric: 'Aug-Sep', description: 'Post-summer home refresh' },
      { name: 'Move Season', metric: 'May-Sep', description: 'Move in/out cleaning surge' },
      { name: 'New Year Fresh Start', metric: 'Jan', description: 'Start the year clean promo' },
      { name: 'Seasonal Turnover', metric: 'Quarterly', description: 'Airbnb/vacation rental seasonality' },
    ],
  },
];

function SequencesSection() {
  const [activeCategory, setActiveCategory] = useState('speed-to-lead');
  
  const currentCategory = sequenceCategories.find(c => c.id === activeCategory);
  
  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
  };

  return (
    <section id="sequences" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Built-in Automation Library
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            34+ ready-to-deploy workflows
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Every Selestial account includes our complete library of automation sequences. 
            Install with one click from the <span className="font-medium text-gray-900">Sequences → Templates</span> page in your dashboard.
          </p>
        </motion.div>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {sequenceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all",
                activeCategory === category.id
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              <Icon name={category.icon} size="sm" />
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
        
        {/* App Preview Frame */}
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 via-violet-500/5 to-primary/5 rounded-3xl blur-2xl" />
          
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-200/50 overflow-hidden">
            {/* Browser chrome */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-500 flex items-center gap-2">
                  <Icon name="lock" size="xs" className="text-green-500" />
                  access.selestial.io/sequences/templates
                </div>
              </div>
            </div>
            
            {/* Sequences Grid */}
            <div className="p-6">
              {currentCategory && (
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {currentCategory.sequences.map((sequence, i) => {
                    const colors = colorClasses[currentCategory.color];
                    return (
                      <motion.div
                        key={sequence.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          "p-5 rounded-xl border-2 bg-white transition-all hover:shadow-lg cursor-pointer group",
                          colors.border
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">{sequence.name}</h3>
                          <span className={cn(
                            "px-2 py-1 rounded-md text-xs font-medium",
                            colors.bg,
                            colors.text
                          )}>
                            {sequence.metric}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{sequence.description}</p>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            Preview
                          </Button>
                          <Button size="sm" className="text-xs h-7 bg-primary hover:bg-primary/90">
                            <Icon name="download" size="xs" className="mr-1" />
                            Install
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <Icon name="check" size="sm" className="text-green-500" />
              <span>One-click install</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="check" size="sm" className="text-green-500" />
              <span>Fully customizable</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="check" size="sm" className="text-green-500" />
              <span>Industry-optimized</span>
            </div>
          </div>
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
              <Icon name="sparkles" size="sm" className="mr-2" />
              Get Access to All Workflows
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// INTERACTIVE PRICING WIZARD
// ============================================================================

const cleaningTypes = [
  { id: 'residential', name: 'Residential', icon: 'home' as IconName },
  { id: 'deep', name: 'Deep Clean', icon: 'sparkles' as IconName },
  { id: 'moveinout', name: 'Move In/Out', icon: 'package' as IconName },
  { id: 'airbnb', name: 'Airbnb', icon: 'star' as IconName },
  { id: 'commercial', name: 'Commercial', icon: 'building' as IconName },
];

const pricingData: Record<string, { services: { name: string; price: number }[] }> = {
  residential: {
    services: [
      { name: '1-2 Bedrooms', price: 120 },
      { name: '3-4 Bedrooms', price: 180 },
      { name: '5+ Bedrooms', price: 250 },
      { name: 'Inside Fridge', price: 35 },
      { name: 'Inside Oven', price: 35 },
      { name: 'Laundry', price: 25 },
    ],
  },
  deep: {
    services: [
      { name: 'Deep (1-2 BR)', price: 220 },
      { name: 'Deep (3-4 BR)', price: 320 },
      { name: 'Deep (5+ BR)', price: 450 },
      { name: 'Inside Cabinets', price: 50 },
      { name: 'Baseboards Detail', price: 45 },
      { name: 'Wall Washing', price: 60 },
    ],
  },
  moveinout: {
    services: [
      { name: 'Move-Out (1-2 BR)', price: 280 },
      { name: 'Move-Out (3-4 BR)', price: 380 },
      { name: 'Move-Out (5+ BR)', price: 500 },
      { name: 'Interior Windows', price: 40 },
      { name: 'Garage Sweep', price: 50 },
      { name: 'Carpet Spot Clean', price: 75 },
    ],
  },
  airbnb: {
    services: [
      { name: 'Turnover (Studio)', price: 85 },
      { name: 'Turnover (1 BR)', price: 110 },
      { name: 'Turnover (2 BR)', price: 145 },
      { name: 'Turnover (3+ BR)', price: 200 },
      { name: 'Linen Change', price: 25 },
      { name: 'Restocking', price: 30 },
    ],
  },
  commercial: {
    services: [
      { name: 'Office (1000sf)', price: 125 },
      { name: 'Office (2500sf)', price: 275 },
      { name: 'Office (5000sf)', price: 500 },
      { name: 'Retail Space', price: 200 },
      { name: 'Post-Construction', price: 750 },
      { name: 'Floor Waxing', price: 300 },
    ],
  },
};

function PricingWizardDemo() {
  const [selectedIndustry, setSelectedIndustry] = useState('residential');
  const [selectedServices, setSelectedServices] = useState<string[]>(['3-4 Bedrooms']);
  
  const currentPricing = pricingData[selectedIndustry];
  
  const toggleService = (serviceName: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceName) 
        ? prev.filter(s => s !== serviceName)
        : [...prev, serviceName]
    );
  };
  
  const totalPrice = currentPricing.services
    .filter(s => selectedServices.includes(s.name))
    .reduce((sum, s) => sum + s.price, 0);

  return (
    <section id="demo" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Interactive Demo
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Try our Pricing Wizard
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how Selestial helps you build quotes instantly. Select your industry and services below.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10 rounded-3xl blur-2xl" />
            
            <div className="relative bg-white border border-gray-200 rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Pricing Wizard</span>
              </div>
              
              <div className="p-6 md:p-8">
                {/* Industry Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select your industry
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {cleaningTypes.map((industry) => (
                      <button
                        key={industry.id}
                        onClick={() => {
                          setSelectedIndustry(industry.id);
                          setSelectedServices([]);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                          selectedIndustry === industry.id
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
                        )}
                      >
                        <Icon name={industry.icon} size="lg" />
                        <span className="text-xs font-medium">{industry.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Services */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select services for your quote
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {currentPricing.services.map((service) => (
                      <button
                        key={service.name}
                        onClick={() => toggleService(service.name)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                          selectedServices.includes(service.name)
                            ? "bg-primary/10 border-primary"
                            : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{service.name}</p>
                          <p className="text-xs text-gray-500">${service.price}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          selectedServices.includes(service.name)
                            ? "bg-primary border-primary"
                            : "border-gray-300"
                        )}>
                          {selectedServices.includes(service.name) && (
                            <Icon name="check" size="xs" className="text-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Total */}
                <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-primary to-violet-500 text-white">
                  <div>
                    <p className="text-sm text-white/80">Quote Total</p>
                    <p className="text-3xl font-bold">
                      ${totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <Button className="bg-white text-primary hover:bg-gray-100 shadow-lg">
                    <Icon name="send" size="sm" className="mr-2" />
                    Send Quote
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// TESTIMONIALS
// ============================================================================

const testimonials = [
  {
    quote: "Selestial helped us close 40% more cleaning quotes in our first month. The AI responses are so good, customers think they're talking to me!",
    author: 'Sarah Williams',
    role: 'Owner, Sparkle Clean Co.',
    avatar: 'SW',
  },
  {
    quote: "We went from a 2-day response time to under 5 minutes. Our booking conversion rate doubled and we're taking on more recurring clients.",
    author: 'Maria Santos',
    role: 'Operations Manager, Fresh Start Maids',
    avatar: 'MS',
  },
  {
    quote: "The automated follow-ups alone are worth it. I used to lose track of cleaning quotes. Now every lead gets the attention they deserve.",
    author: 'David Rodriguez',
    role: 'Owner, Crystal Clear Cleaning',
    avatar: 'DR',
  },
];

function TestimonialsSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Loved by cleaning businesses
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join hundreds of cleaning companies who are booking more jobs with Selestial.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg shadow-gray-100"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Icon key={j} name="star" size="sm" className="text-yellow-400" />
                ))}
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">&quot;{testimonial.quote}&quot;</p>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-gray-900 font-medium">{testimonial.author}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA SECTION
// ============================================================================

function CTASection() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 rounded-3xl blur-2xl" />
          
          <div className="relative bg-gradient-to-br from-primary to-violet-600 rounded-3xl p-12 text-center overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
                backgroundSize: '32px 32px',
              }} />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to win more jobs?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Join 500+ home service businesses already using Selestial to close more deals 
                and grow their revenue.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 shadow-lg">
                    Start Free Trial
                    <Icon name="arrowRight" size="sm" className="ml-2" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <Icon name="play" size="sm" className="mr-2" />
                    Watch Demo
                  </Button>
                </Link>
              </div>
              
              <p className="text-white/60 text-sm mt-6">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <SequencesSection />
      <PricingWizardDemo />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
