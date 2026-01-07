import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export default function AboutPage() {
  return (
    <div className="py-20 md:py-32">
      <div className="container max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About Selestial
          </h1>
          <p className="text-xl text-muted-foreground">
            Helping home service businesses win more jobs with AI-powered automation.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2>Our Mission</h2>
          <p>
            We believe every home service business deserves the tools to compete with larger companies. 
            That's why we built Selestial – to level the playing field with smart automation.
          </p>

          <h2>The Problem We Solve</h2>
          <p>
            Home service businesses lose thousands of dollars every year because they can't follow up 
            with quotes fast enough. By the time you respond, the customer has already hired someone else.
          </p>
          <p>
            Selestial automates your follow-up process so you can respond to every lead instantly, 
            even when you're on a job site.
          </p>

          <h2>Our Story</h2>
          <p>
            Founded in 2024, Selestial was born from firsthand experience running a home services business. 
            We know the pain of losing jobs to slow follow-ups because we lived it.
          </p>
          <p>
            Today, we're helping hundreds of contractors, plumbers, electricians, and other home service 
            professionals win more jobs and grow their businesses.
          </p>

          <h2>Our Values</h2>
          <ul>
            <li><strong>Simplicity:</strong> Powerful doesn't have to mean complicated</li>
            <li><strong>Reliability:</strong> Your follow-ups need to work every time</li>
            <li><strong>Results:</strong> We're only successful when you win more jobs</li>
          </ul>
        </div>

        <div className="text-center mt-16">
          <Link href="/signup">
            <Button size="lg" className="text-lg h-14 px-8 glow">
              Join 500+ Businesses
              <Icon name="arrowRight" size="lg" className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
