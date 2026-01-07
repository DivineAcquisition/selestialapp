"use client"

import { useState, useEffect } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Check,
  Zap,
  Target,
  ArrowRight,
  Info,
  Loader2,
  MapPin,
  Bot,
  Layers,
  Percent,
  Clock,
  ChevronRight,
  Lightbulb,
  Calculator,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Industry {
  slug: string
  name: string
  icon: string
  description: string
  avgTicket: { low: number; avg: number; high: number }
  conversionRate: number
}

interface PricingModel {
  type: string
  name: string
  prevalence: number
  conversionImpact: number
  description: string
  bestFor: string[]
  example: string
}

interface ServicePricing {
  name: string
  category: string
  pricingUnit: string
  lowPrice: number
  avgPrice: number
  highPrice: number
}

interface RetentionModel {
  name: string
  type: string
  frequency: string
  priceRange: { low: number; high: number }
  retentionLift: number
  ltv_multiplier: number
  includes: string[]
  recommendedDiscount: number
}

export default function PricingIntelligencePage() {
  const [industries, setIndustries] = useState<Industry[]>([])
  const [selectedIndustry, setSelectedIndustry] = useState<string>('')
  const [industryData, setIndustryData] = useState<any>(null)
  const [region, setRegion] = useState<string>('')
  const [country, setCountry] = useState<'us' | 'canada'>('us')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState<any>(null)
  const [regionalMultiplier, setRegionalMultiplier] = useState(1.0)
  const [regions, setRegions] = useState<any>({ us: [], canada: [] })
  const [basePrice, setBasePrice] = useState<string>('')

  useEffect(() => {
    fetchIndustries()
  }, [])

  useEffect(() => {
    if (selectedIndustry) {
      fetchIndustryDetails()
    }
  }, [selectedIndustry, region, country])

  const fetchIndustries = async () => {
    try {
      const res = await fetch('/api/ai/pricing-suggestion')
      const data = await res.json()
      setIndustries(data.industries || [])
      setRegions(data.regions || { us: [], canada: [] })
    } catch (error) {
      console.error('Failed to fetch industries:', error)
    }
  }

  const fetchIndustryDetails = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/pricing-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Provide overview pricing recommendations',
          industry: selectedIndustry,
          region,
          country
        })
      })
      const data = await res.json()
      setIndustryData(data.industryData)
      setRegionalMultiplier(data.regionalMultiplier || 1.0)
      setAiResponse(data)
    } catch (error) {
      console.error('Failed to fetch industry data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return
    
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/pricing-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: aiQuery,
          industry: selectedIndustry,
          region,
          country
        })
      })
      const data = await res.json()
      setAiResponse(data)
    } catch (error) {
      console.error('AI query failed:', error)
    } finally {
      setAiLoading(false)
    }
  }

  const adjustPrice = (price: number) => Math.round(price * regionalMultiplier)

  return (
    <Layout title="Pricing Intelligence">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pricing Intelligence</h1>
            <p className="text-gray-500 mt-1">AI-powered pricing recommendations based on industry data</p>
          </div>
          <Badge className="bg-gradient-to-r from-primary to-[#9D96FF] text-white border-0 px-3 py-1.5">
            <Bot className="h-3.5 w-3.5 mr-1.5" />
            25+ Industries
          </Badge>
        </div>

        {/* Industry & Region Selection */}
        <Card className="card-elevated p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Your Industry & Region</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Industry</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select your industry..." />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind.slug} value={ind.slug}>
                      <span className="flex items-center gap-2">
                        <span>{ind.icon}</span>
                        <span>{ind.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Country</label>
              <Select value={country} onValueChange={(v) => setCountry(v as 'us' | 'canada')}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">🇺🇸 United States</SelectItem>
                  <SelectItem value="canada">🇨🇦 Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Region / City</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select region..." />
                </SelectTrigger>
                <SelectContent>
                  {regions[country]?.map((r: any) => (
                    <SelectItem key={r.region} value={r.region}>
                      {r.region} ({r.multiplier.low.toFixed(2)}x - {r.multiplier.high.toFixed(2)}x)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {regionalMultiplier !== 1.0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                Prices adjusted by <strong>{((regionalMultiplier - 1) * 100).toFixed(0)}%</strong> for your region
              </p>
            </div>
          )}
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="card-elevated p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-gray-500">Loading industry data...</p>
            </div>
          </Card>
        )}

        {/* Industry Data Display */}
        {industryData && !loading && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="card-elevated p-5 border-t-4 border-t-primary">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Avg Ticket</p>
                <p className="text-2xl font-bold text-gray-900">${adjustPrice(industryData.avgTicket.avg)}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Range: ${adjustPrice(industryData.avgTicket.low)} - ${adjustPrice(industryData.avgTicket.high)}
                </p>
              </Card>

              <Card className="card-elevated p-5 border-t-4 border-t-emerald-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{industryData.conversionRate}%</p>
                <Progress value={industryData.conversionRate} className="mt-2 h-1.5" />
              </Card>

              <Card className="card-elevated p-5 border-t-4 border-t-blue-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-100">
                    <Percent className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Gross Margin</p>
                <p className="text-2xl font-bold text-gray-900">{industryData.grossMargin.low}-{industryData.grossMargin.high}%</p>
                <Progress value={(industryData.grossMargin.low + industryData.grossMargin.high) / 2} className="mt-2 h-1.5" />
              </Card>

              <Card className="card-elevated p-5 border-t-4 border-t-amber-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-100">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Regional Multiplier</p>
                <p className="text-2xl font-bold text-gray-900">{regionalMultiplier.toFixed(2)}x</p>
                <p className="text-xs text-gray-400 mt-1">{region || 'Baseline pricing'}</p>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="models" className="space-y-4">
              <TabsList className="bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="models" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Pricing Models
                </TabsTrigger>
                <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Service Pricing
                </TabsTrigger>
                <TabsTrigger value="retention" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Users className="h-4 w-4 mr-2" />
                  Retention
                </TabsTrigger>
                <TabsTrigger value="ai" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Bot className="h-4 w-4 mr-2" />
                  AI Assistant
                </TabsTrigger>
              </TabsList>

              {/* Pricing Models Tab */}
              <TabsContent value="models" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Recommended Pricing Models</h3>
                    <p className="text-sm text-gray-500">Based on conversion data from thousands of home service businesses</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {industryData.pricingModels?.map((model: PricingModel) => {
                    const isRecommended = model.conversionImpact === Math.max(...industryData.pricingModels.map((m: PricingModel) => m.conversionImpact))
                    return (
                      <Card key={model.type} className={cn(
                        "card-elevated p-5 relative",
                        isRecommended && "ring-2 ring-primary/20 border-primary/30"
                      )}>
                        {isRecommended && (
                          <Badge className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 border-0">
                            <Check className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                        
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-primary/10">
                            <Layers className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900">{model.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">{model.description}</p>
                            
                            <div className="mt-4 space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Industry Adoption</span>
                                <Badge variant="outline">{model.prevalence}%</Badge>
                              </div>
                              <Progress value={model.prevalence} className="h-1.5" />
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Conversion Impact</span>
                                <Badge className={cn(
                                  "border-0",
                                  model.conversionImpact > 0 
                                    ? "bg-emerald-100 text-emerald-700" 
                                    : "bg-red-100 text-red-700"
                                )}>
                                  {model.conversionImpact > 0 ? '+' : ''}{model.conversionImpact}%
                                </Badge>
                              </div>
                              
                              <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-400 mb-1">Example</p>
                                <p className="text-sm font-medium text-gray-700">{model.example}</p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-400 mb-2">Best For:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {model.bestFor.map((use, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {use}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
                
                {/* Conversion Insights */}
                <Card className="card-elevated p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Conversion Optimization Insights
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-xl text-center">
                      <p className="text-3xl font-bold text-emerald-600">92%</p>
                      <p className="text-sm text-gray-600 mt-1">of customers prefer flat-rate pricing</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl text-center">
                      <p className="text-3xl font-bold text-blue-600">21x</p>
                      <p className="text-sm text-gray-600 mt-1">more likely to convert with &lt;5 min response</p>
                    </div>
                    <div className="p-4 bg-violet-50 rounded-xl text-center">
                      <p className="text-3xl font-bold text-violet-600">+30%</p>
                      <p className="text-sm text-gray-600 mt-1">revenue increase with tiered pricing</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Service Pricing Tab */}
              <TabsContent value="services" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Service Price Guide</h3>
                    <p className="text-sm text-gray-500">Market-based pricing adjusted for your region</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-0">
                    {regionalMultiplier.toFixed(2)}x Regional Adjustment
                  </Badge>
                </div>
                
                {Object.entries(
                  industryData.services?.reduce((acc: any, service: ServicePricing) => {
                    if (!acc[service.category]) acc[service.category] = []
                    acc[service.category].push(service)
                    return acc
                  }, {}) || {}
                ).map(([category, services]) => (
                  <Card key={category} className="card-elevated p-5">
                    <h4 className="font-semibold text-gray-900 mb-4">{category}</h4>
                    <div className="space-y-2">
                      {(services as ServicePricing[]).map((service, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{service.name}</p>
                            <p className="text-xs text-gray-400">Per {service.pricingUnit}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-400">${adjustPrice(service.lowPrice)}</span>
                              <ArrowRight className="w-3 h-3 text-gray-300" />
                              <span className="font-bold text-primary text-base">${adjustPrice(service.avgPrice)}</span>
                              <ArrowRight className="w-3 h-3 text-gray-300" />
                              <span className="text-gray-400">${adjustPrice(service.highPrice)}</span>
                            </div>
                            <p className="text-xs text-gray-400">Low → Recommended → Premium</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
                
                {/* Price Calculator */}
                <Card className="card-elevated p-5">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Quick Price Calculator
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Base Price ($)</label>
                      <Input 
                        type="number"
                        placeholder="Enter base price..." 
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Regional Multiplier</label>
                      <Input 
                        value={`${regionalMultiplier.toFixed(2)}x`}
                        disabled
                        className="h-11 rounded-xl bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Adjusted Price</label>
                      <Input 
                        value={basePrice ? `$${Math.round(parseFloat(basePrice) * regionalMultiplier)}` : ''}
                        placeholder="Enter base price first"
                        disabled
                        className="h-11 rounded-xl bg-primary/5 font-bold text-primary"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Retention Models Tab */}
              <TabsContent value="retention" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Retention & Recurring Revenue</h3>
                  <p className="text-sm text-gray-500">Build predictable revenue with maintenance agreements and subscriptions</p>
                </div>
                
                <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl flex items-start gap-3">
                  <Info className="h-5 w-5 text-violet-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-violet-900">Why Retention Matters</p>
                    <p className="text-sm text-violet-700">
                      Subscription customers have <strong>3x higher lifetime value</strong> and 
                      cost <strong>5-7x less</strong> to serve than acquiring new customers.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {industryData.retentionModels?.map((model: RetentionModel, idx: number) => (
                    <Card key={idx} className="card-elevated p-5">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-emerald-100">
                          <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-gray-900">{model.name}</h4>
                            <Badge className="bg-emerald-100 text-emerald-700 border-0">
                              +{model.retentionLift}% Retention
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-500 mt-1">
                            {model.type.replace(/_/g, ' ')} • {model.frequency}
                          </p>
                          
                          <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div>
                              <p className="text-xs text-gray-400">Price Range</p>
                              <p className="text-lg font-bold text-gray-900">
                                ${adjustPrice(model.priceRange.low)} - ${adjustPrice(model.priceRange.high)}
                              </p>
                              <p className="text-xs text-gray-400">per {model.frequency}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">LTV Multiplier</p>
                              <p className="text-lg font-bold text-emerald-600">{model.ltv_multiplier}x</p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-xs text-gray-400 mb-2">Includes:</p>
                            <ul className="space-y-1.5">
                              {model.includes.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                  <Check className="w-4 h-4 text-emerald-500" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {model.recommendedDiscount > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                              <p className="text-sm text-blue-800">
                                💡 Offer <strong>{model.recommendedDiscount}%</strong> annual prepay discount
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {/* Retention Metrics */}
                <Card className="card-elevated p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Expected Retention Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-xl">
                      <p className="text-2xl font-bold text-emerald-600">37%</p>
                      <p className="text-sm text-gray-600">Higher Retention</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <p className="text-2xl font-bold text-blue-600">3x</p>
                      <p className="text-sm text-gray-600">Customer LTV</p>
                    </div>
                    <div className="text-center p-4 bg-violet-50 rounded-xl">
                      <p className="text-2xl font-bold text-violet-600">60-70%</p>
                      <p className="text-sm text-gray-600">Renewal Rate</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-xl">
                      <p className="text-2xl font-bold text-amber-600">15-20%</p>
                      <p className="text-sm text-gray-600">Prepay Discount</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* AI Assistant Tab */}
              <TabsContent value="ai" className="space-y-4">
                <Card className="card-elevated p-5">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Pricing Assistant
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">Ask any pricing question and get data-backed recommendations</p>
                  
                  <div className="flex gap-3">
                    <Input
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="e.g., How should I price deep cleaning for 3-bedroom homes in my area?"
                      onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
                      className="h-11 rounded-xl flex-1"
                    />
                    <Button
                      onClick={handleAIQuery}
                      disabled={aiLoading}
                      className="h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-[#9D96FF]"
                    >
                      {aiLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Bot className="h-4 w-4 mr-2" />
                          Ask AI
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'What pricing model converts best?',
                        'How do I structure tiered pricing?',
                        'What should I charge for emergency service?',
                        'How to build a maintenance agreement?',
                      ].map((prompt, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          onClick={() => setAiQuery(prompt)}
                          className="rounded-lg text-xs"
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>
                
                {/* AI Response */}
                {aiResponse?.recommendation && (
                  <Card className="card-elevated p-5">
                    <h4 className="font-semibold text-gray-900 mb-4">AI Recommendation</h4>
                    
                    <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl mb-4">
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-violet-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-violet-900">{aiResponse.recommendation.primaryPricingModel}</p>
                          <p className="text-sm text-violet-700 mt-1">{aiResponse.recommendation.modelRationale}</p>
                          <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-0">
                            +{aiResponse.recommendation.conversionImpact}% conversion
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {aiResponse.suggestedPrices?.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-3">Suggested Pricing</h5>
                        <div className="space-y-2">
                          {aiResponse.suggestedPrices.map((price: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <div>
                                <p className="font-medium text-gray-900">{price.service}</p>
                                {price.notes && <p className="text-xs text-gray-400">{price.notes}</p>}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">${price.recommendedPrice}</p>
                                <p className="text-xs text-gray-400">Range: ${price.lowPrice} - ${price.highPrice}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {aiResponse.pricingTips?.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Pricing Tips</h5>
                        <ul className="space-y-2">
                          {aiResponse.pricingTips.map((tip: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* No Industry Selected State */}
        {!selectedIndustry && !loading && (
          <Card className="card-elevated p-12">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-[#9D96FF]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Select Your Industry to Get Started</h3>
              <p className="text-gray-500 mb-8">
                Get pricing recommendations based on data from thousands of home service businesses
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {industries.slice(0, 8).map((ind) => (
                  <button
                    key={ind.slug}
                    onClick={() => setSelectedIndustry(ind.slug)}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-center group"
                  >
                    <span className="text-2xl block mb-2">{ind.icon}</span>
                    <p className="font-medium text-gray-900 text-sm">{ind.name}</p>
                    <p className="text-xs text-gray-400">{ind.conversionRate}% conversion</p>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}
