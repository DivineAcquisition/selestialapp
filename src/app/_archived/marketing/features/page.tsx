import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Zap, 
  MessageSquare, 
  BarChart3, 
  Brain, 
  Bell,
  Clock,
  Shield,
  Smartphone,
  ArrowRight,
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Automated Sequences',
    description: 'Create custom follow-up sequences that run automatically. Set delays, conditions, and personalization rules.',
    benefits: ['Multi-channel sequences', 'Smart timing optimization', 'A/B testing'],
  },
  {
    icon: Brain,
    title: 'AI Smart Replies',
    description: 'Get intelligent response suggestions powered by Claude AI. Reply to customers in seconds with professional messages.',
    benefits: ['Context-aware suggestions', 'Tone customization', 'Learn from your style'],
  },
  {
    icon: MessageSquare,
    title: 'Unified Inbox',
    description: 'Manage all customer conversations in one place. SMS, email, and more - all in a single view.',
    benefits: ['Real-time sync', 'Conversation history', 'Team collaboration'],
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track your win rate, response times, and revenue. Make data-driven decisions to grow your business.',
    benefits: ['Revenue tracking', 'Performance insights', 'Custom reports'],
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Never miss an important lead. Get alerts when customers respond or when action is needed.',
    benefits: ['Push notifications', 'Email alerts', 'Custom triggers'],
  },
  {
    icon: Clock,
    title: 'Business Hours',
    description: 'Respect your customers\' time and yours. Schedule messages to send during business hours only.',
    benefits: ['Time zone support', 'Holiday scheduling', 'Custom schedules'],
  },
]

export default function FeaturesPage() {
  return (
    <div className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful features for home services
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to automate your quote follow-ups and win more jobs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 feature-card">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/signup">
            <Button size="lg" className="text-lg h-14 px-8 glow">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
