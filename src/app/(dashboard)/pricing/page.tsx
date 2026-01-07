"use client"

import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DollarSign, 
  TrendingUp, 
  Percent,
  Calculator,
  Sparkles,
  Wrench,
  Thermometer,
  Leaf,
  Bug,
  Home,
  Paintbrush,
  Hammer,
  Droplets,
  Waves,
  Zap,
  ArrowRight,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Simplified industry data
const INDUSTRIES = [
  { slug: 'cleaning', name: 'Cleaning', icon: Sparkles, avgTicket: 175, margin: '40-55%', conversion: 17.65 },
  { slug: 'hvac', name: 'HVAC', icon: Thermometer, avgTicket: 750, margin: '30-40%', conversion: 5 },
  { slug: 'plumbing', name: 'Plumbing', icon: Wrench, avgTicket: 350, margin: '45-65%', conversion: 14 },
  { slug: 'electrical', name: 'Electrical', icon: Zap, avgTicket: 275, margin: '40-60%', conversion: 12 },
  { slug: 'landscaping', name: 'Landscaping', icon: Leaf, avgTicket: 150, margin: '35-45%', conversion: 15 },
  { slug: 'pest_control', name: 'Pest Control', icon: Bug, avgTicket: 200, margin: '50-65%', conversion: 18 },
  { slug: 'roofing', name: 'Roofing', icon: Home, avgTicket: 7500, margin: '20-40%', conversion: 5 },
  { slug: 'painting', name: 'Painting', icon: Paintbrush, avgTicket: 2500, margin: '35-50%', conversion: 12 },
  { slug: 'handyman', name: 'Handyman', icon: Hammer, avgTicket: 350, margin: '35-55%', conversion: 13.45 },
  { slug: 'pressure_washing', name: 'Pressure Washing', icon: Droplets, avgTicket: 350, margin: '50-65%', conversion: 18 },
  { slug: 'pool_spa', name: 'Pool & Spa', icon: Waves, avgTicket: 175, margin: '45-60%', conversion: 20 },
]

const PRICING_TIPS = [
  { title: 'Flat-rate pricing', desc: '92% of customers prefer upfront pricing', impact: '+25% conversion' },
  { title: 'Respond within 5 min', desc: '21x more likely to win the job', impact: '+21x close rate' },
  { title: 'Offer 3 options', desc: 'Good-Better-Best increases revenue', impact: '+30% ticket size' },
  { title: 'Show transparency', desc: 'Clear pricing builds trust', impact: '+94% loyalty' },
]

export default function PricingPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [markup, setMarkup] = useState('50')
  
  const industry = INDUSTRIES.find(i => i.slug === selectedIndustry)
  const calculatedPrice = basePrice ? Math.round(parseFloat(basePrice) * (1 + parseInt(markup) / 100)) : 0

  return (
    <Layout title="Pricing">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Guide</h1>
          <p className="text-gray-500 mt-1">Industry benchmarks to help you price competitively</p>
        </div>

        {/* Industry Selection */}
        <Card className="p-6 border-0 shadow-sm">
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Select Your Industry</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {INDUSTRIES.map((ind) => {
                const Icon = ind.icon
                const isSelected = selectedIndustry === ind.slug
                return (
                  <button
                    key={ind.slug}
                    onClick={() => setSelectedIndustry(ind.slug)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-center transition-all",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center transition-colors",
                      isSelected ? "bg-primary/10" : "bg-gray-100"
                    )}>
                      <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-gray-500")} />
                    </div>
                    <p className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-gray-700")}>
                      {ind.name}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Industry Stats */}
        {industry && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 border-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Ticket</p>
                  <p className="text-2xl font-bold text-gray-900">${industry.avgTicket.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-5 border-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100">
                  <Percent className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gross Margin</p>
                  <p className="text-2xl font-bold text-gray-900">{industry.margin}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-5 border-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{industry.conversion}%</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Calculator */}
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Quick Calculator</h2>
              <p className="text-sm text-gray-500">Calculate your selling price from cost</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Your Cost</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="100"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="pl-9 h-12 rounded-xl bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Markup %</label>
              <Select value={markup} onValueChange={setMarkup}>
                <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30%</SelectItem>
                  <SelectItem value="40">40%</SelectItem>
                  <SelectItem value="50">50% (Recommended)</SelectItem>
                  <SelectItem value="60">60%</SelectItem>
                  <SelectItem value="75">75%</SelectItem>
                  <SelectItem value="100">100%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Selling Price</label>
              <div className="h-12 rounded-xl bg-primary/5 border border-primary/20 flex items-center px-4">
                <span className="text-xl font-bold text-primary">
                  {calculatedPrice > 0 ? `$${calculatedPrice.toLocaleString()}` : '—'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing Tips */}
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-amber-100">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Pricing Tips</h2>
              <p className="text-sm text-gray-500">Data-backed strategies to win more jobs</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRICING_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{tip.title}</p>
                  <p className="text-sm text-gray-500">{tip.desc}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 flex-shrink-0">
                  {tip.impact}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA */}
        <Card className="p-6 border-0 shadow-sm bg-gradient-to-r from-primary/5 to-[#9D96FF]/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Ready to win more jobs?</h3>
              <p className="text-sm text-gray-500">Create a quote and let Selestial follow up automatically</p>
            </div>
            <Button className="h-12 px-6 bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90 rounded-xl shadow-lg shadow-primary/25">
              Create Quote
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
