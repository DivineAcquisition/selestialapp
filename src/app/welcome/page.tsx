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
                        <a href="#" className="text-primary hover:underline">Terms</a> and{' '}
                        <a href="#" className="text-primary hover:underline">Privacy Policy</a>
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

// Features Section
function FeaturesSection() {
  const features = [
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
// INTERACTIVE PRICING WIZARD
// ============================================================================

const industries = [
  { id: 'hvac', name: 'HVAC', icon: 'snowflake' as IconName },
  { id: 'plumbing', name: 'Plumbing', icon: 'droplet' as IconName },
  { id: 'electrical', name: 'Electrical', icon: 'bolt' as IconName },
  { id: 'cleaning', name: 'Cleaning', icon: 'sparkles' as IconName },
  { id: 'roofing', name: 'Roofing', icon: 'home' as IconName },
  { id: 'landscaping', name: 'Landscaping', icon: 'tree' as IconName },
];

const pricingData: Record<string, { services: { name: string; price: number }[] }> = {
  hvac: {
    services: [
      { name: 'Diagnostic Call', price: 89 },
      { name: 'AC Tune-Up', price: 129 },
      { name: 'Furnace Tune-Up', price: 129 },
      { name: 'Thermostat Install', price: 175 },
      { name: 'Duct Cleaning', price: 399 },
      { name: 'System Install', price: 7500 },
    ],
  },
  plumbing: {
    services: [
      { name: 'Service Call', price: 99 },
      { name: 'Drain Cleaning', price: 175 },
      { name: 'Toilet Repair', price: 150 },
      { name: 'Faucet Replace', price: 225 },
      { name: 'Water Heater Install', price: 1200 },
      { name: 'Leak Repair', price: 250 },
    ],
  },
  electrical: {
    services: [
      { name: 'Service Call', price: 99 },
      { name: 'Outlet Install', price: 150 },
      { name: 'Switch Replace', price: 125 },
      { name: 'Ceiling Fan', price: 225 },
      { name: 'Panel Upgrade', price: 2500 },
      { name: 'EV Charger Install', price: 800 },
    ],
  },
  cleaning: {
    services: [
      { name: 'Standard (1500sf)', price: 150 },
      { name: 'Deep Clean (1500sf)', price: 275 },
      { name: 'Move-Out (1500sf)', price: 350 },
      { name: 'Post-Construction', price: 500 },
      { name: 'Office (1000sf)', price: 125 },
      { name: 'Carpet (per room)', price: 50 },
    ],
  },
  roofing: {
    services: [
      { name: 'Inspection', price: 150 },
      { name: 'Emergency Tarp', price: 350 },
      { name: 'Leak Repair', price: 450 },
      { name: 'Shingle Repair', price: 275 },
      { name: 'Gutter Clean', price: 175 },
      { name: 'Partial Reroof', price: 2500 },
    ],
  },
  landscaping: {
    services: [
      { name: 'Mow (Medium)', price: 55 },
      { name: 'Leaf Cleanup', price: 150 },
      { name: 'Mulch (per yard)', price: 85 },
      { name: 'Hedge Trim', price: 150 },
      { name: 'Spring Cleanup', price: 275 },
      { name: 'Tree Trim', price: 200 },
    ],
  },
};

function PricingWizardDemo() {
  const [selectedIndustry, setSelectedIndustry] = useState('hvac');
  const [selectedServices, setSelectedServices] = useState<string[]>(['AC Tune-Up']);
  
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
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {industries.map((industry) => (
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
    quote: "Selestial helped us close 40% more quotes in our first month. The AI responses are so good, customers think they're talking to me!",
    author: 'Mike Johnson',
    role: 'Owner, Johnson Plumbing Co.',
    avatar: 'MJ',
  },
  {
    quote: "We went from a 2-day response time to under 5 minutes. Our conversion rate doubled and we're booking jobs we would have lost.",
    author: 'Sarah Chen',
    role: 'Operations Manager, CoolAir HVAC',
    avatar: 'SC',
  },
  {
    quote: "The automated follow-ups alone are worth it. I used to lose track of quotes. Now every lead gets the attention they deserve.",
    author: 'David Rodriguez',
    role: 'Owner, Sparkling Clean Services',
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
            Loved by home service pros
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join hundreds of contractors who are winning more jobs with Selestial.
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
      <PricingWizardDemo />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
