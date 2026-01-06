import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Zap, 
  MessageSquare, 
  BarChart3, 
  Brain, 
  CheckCircle2,
  ArrowRight,
  Star,
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Automated Follow-ups',
    description: 'Set up sequences that automatically follow up with leads at the perfect time.',
  },
  {
    icon: Brain,
    title: 'AI Smart Replies',
    description: 'Get intelligent response suggestions powered by Claude AI to reply faster.',
  },
  {
    icon: MessageSquare,
    title: 'Unified Inbox',
    description: 'Manage all your customer conversations from SMS and email in one place.',
  },
  {
    icon: BarChart3,
    title: 'Revenue Analytics',
    description: 'Track your win rate, response times, and revenue with detailed insights.',
  },
]

const benefits = [
  'Increase quote win rate by 35%',
  'Save 10+ hours per week on follow-ups',
  'Never miss a lead again',
  'Professional responses in seconds',
]

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-primary" />
              Trusted by 500+ home service businesses
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Turn more quotes into{' '}
              <span className="text-primary">paying customers</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stop losing leads to slow follow-ups. Selestial automates your quote follow-up 
              with AI-powered messaging so you can close more deals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 glow">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8">
                  See How It Works
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              14-day free trial • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to win more jobs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for home service businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="p-6 feature-card">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to close more deals?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join 500+ home service businesses using Selestial to automate their follow-ups.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg h-14 px-8">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
