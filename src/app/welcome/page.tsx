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
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]" />
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0A0A0F_70%)]" />
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm text-gray-400">Now with AI-powered responses</span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
              Win more jobs.
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
                Automatically.
              </span>
            </h1>
            
            <p className="text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
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
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
              <div className="flex items-center gap-2 text-gray-500">
                <Icon name="shield" size="sm" />
                <span className="text-sm">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Icon name="lock" size="sm" />
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
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-violet-500/50 to-primary/50 rounded-2xl blur-xl opacity-20" />
              
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Start your free trial</h2>
                        <p className="text-gray-400">No credit card required. Get started in 2 minutes.</p>
                      </div>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                          <Input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Smith"
                            className="w-full h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Work Email</label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@company.com"
                            className="w-full h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                            required
                          />
                        </div>
                        
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg"
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
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <Icon name="check" size="xl" className="text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">You&apos;re in!</h3>
                      <p className="text-gray-400 mb-6">Check your email to complete setup.</p>
                      <Link href="/signup">
                        <Button className="bg-primary hover:bg-primary/90">
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
          className="flex flex-col items-center gap-2 text-gray-500"
        >
          <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
          <Icon name="chevronDown" size="sm" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================================================
// FEATURES SECTION
// ============================================================================

const features: {
  icon: IconName;
  title: string;
  description: string;
  color: string;
}[] = [
  {
    icon: 'bolt',
    title: 'Speed-to-Lead Automation',
    description: 'Respond to new leads in under 60 seconds with AI-powered messages. First to respond wins 78% of jobs.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: 'message',
    title: 'Smart Quote Follow-Up',
    description: '6-touch nurture sequences that convert estimates to booked jobs. Target 30-40% close rate.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: 'users',
    title: 'Customer Retention',
    description: 'Detect at-risk customers before they churn. 5% retention improvement = 25-95% profit increase.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: 'chart',
    title: 'Revenue Analytics',
    description: 'Track pipeline velocity, conversion rates, and revenue forecasts in real-time dashboards.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: 'calendar',
    title: 'Smart Scheduling',
    description: 'Automated booking reminders reduce no-shows by 38-50%. Customers confirm with one tap.',
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: 'star',
    title: 'Review Automation',
    description: 'Request reviews at the perfect moment. Build your 5-star reputation on autopilot.',
    color: 'from-amber-500 to-yellow-500',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-4">
            Everything you need to win more jobs
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Powerful automation tools designed specifically for home service businesses. 
            Set it up once, then watch your close rate soar.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500" 
                   style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }} />
              
              <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br",
                  feature.color
                )}>
                  <Icon name={feature.icon} size="lg" className="text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
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
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
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
    <section id="demo" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Interactive Demo</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-4">
            Try our Pricing Wizard
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
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
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-violet-500/30 to-primary/30 rounded-3xl blur-xl" />
            
            <div className="relative bg-[#12121A] border border-white/10 rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-gray-500">Pricing Wizard</span>
              </div>
              
              <div className="p-6 md:p-8">
                {/* Industry Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
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
                          "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                          selectedIndustry === industry.id
                            ? "bg-primary/20 border-primary text-white"
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
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
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Select services for your quote
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {currentPricing.services.map((service) => (
                      <button
                        key={service.name}
                        onClick={() => toggleService(service.name)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                          selectedServices.includes(service.name)
                            ? "bg-primary/20 border-primary"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        )}
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{service.name}</p>
                          <p className="text-xs text-gray-500">${service.price}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          selectedServices.includes(service.name)
                            ? "bg-primary border-primary"
                            : "border-gray-600"
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
                <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-violet-500/20 border border-primary/30">
                  <div>
                    <p className="text-sm text-gray-400">Quote Total</p>
                    <p className="text-3xl font-bold text-white">
                      ${totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
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
// SOCIAL PROOF / TESTIMONIALS
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
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-4">
            Loved by home service pros
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
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
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Icon key={j} name="star" size="sm" className="text-yellow-500" />
                ))}
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">&quot;{testimonial.quote}&quot;</p>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-white font-medium">{testimonial.author}</p>
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
    <section id="pricing" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 rounded-3xl blur-2xl" />
          
          <div className="relative bg-gradient-to-br from-primary/20 to-violet-500/20 border border-white/10 rounded-3xl p-12 text-center overflow-hidden">
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
              <p className="text-gray-300 max-w-xl mx-auto mb-8">
                Join 500+ home service businesses already using Selestial to close more deals 
                and grow their revenue.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8">
                    Start Free Trial
                    <Icon name="arrowRight" size="sm" className="ml-2" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Icon name="play" size="sm" className="mr-2" />
                    Watch Demo
                  </Button>
                </Link>
              </div>
              
              <p className="text-gray-500 text-sm mt-6">
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
