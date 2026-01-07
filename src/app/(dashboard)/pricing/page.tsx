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
  ArrowRight,
  Info,
  Loader2,
  MapPin,
  Bot,
  Layers,
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
  LucideIcon,
  Target,
  Clock,
  Lightbulb,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  INDUSTRIES, 
  REGIONAL_MULTIPLIERS, 
  CANADIAN_MULTIPLIERS,
  CONVERSION_INSIGHTS,
  getIndustryBySlug,
  type IndustryPricing,
  type PricingModel,
  type ServicePricing,
  type RetentionModel,
} from '@/lib/pricing/pricing-data'

// Icon mapping for industries
const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  thermometer: Thermometer,
  wrench: Wrench,
  zap: Zap,
  leaf: Leaf,
  bug: Bug,
  home: Home,
  paintbrush: Paintbrush,
  hammer: Hammer,
  droplets: Droplets,
  waves: Waves,
}

function IndustryIcon({ icon, className }: { icon: string; className?: string }) {
  const IconComponent = INDUSTRY_ICONS[icon] || Sparkles
  return <IconComponent className={className} />
}

export default function PricingIntelligencePage() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('')
  const [industryData, setIndustryData] = useState<IndustryPricing | null>(null)
  const [region, setRegion] = useState<string>('')
  const [country, setCountry] = useState<'us' | 'canada'>('us')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState<any>(null)
  const [regionalMultiplier, setRegionalMultiplier] = useState(1.0)
  const [basePrice, setBasePrice] = useState<string>('')

  const regions = country === 'us' ? REGIONAL_MULTIPLIERS : CANADIAN_MULTIPLIERS

  useEffect(() => {
    if (selectedIndustry) {
      setLoading(true)
      // Simulate loading for UX
      setTimeout(() => {
        const data = getIndustryBySlug(selectedIndustry)
        setIndustryData(data || null)
        setLoading(false)
      }, 300)
    }
  }, [selectedIndustry])

  useEffect(() => {
    if (region) {
      const regionData = regions.find(r => r.region === region)
      if (regionData) {
        setRegionalMultiplier((regionData.multiplier.low + regionData.multiplier.high) / 2)
      }
    } else {
      setRegionalMultiplier(1.0)
    }
  }, [region, regions])

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

  const getRecommendedModel = () => {
    if (!industryData) return null
    return industryData.pricingModels.reduce((best, current) => 
      current.conversionImpact > best.conversionImpact ? current : best
    )
  }

  return (
    <Layout title="Pricing Intelligence">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pricing Intelligence</h1>
            <p className="text-gray-500 mt-1">Data-driven pricing recommendations for home services</p>
          </div>
          <Badge className="bg-gradient-to-r from-primary to-[#9D96FF] text-white border-0 px-4 py-2">
            <Bot className="h-4 w-4 mr-2" />
            AI-Powered
          </Badge>
        </div>

        {/* Industry & Region Selection */}
        <Card className="p-6 border-0 shadow-sm bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configure Your Market</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Industry</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="h-11 bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind.slug} value={ind.slug}>
                      <span className="flex items-center gap-2">
                        <IndustryIcon icon={ind.icon} className="h-4 w-4 text-gray-500" />
                        <span>{ind.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Country</label>
              <Select value={country} onValueChange={(v) => { setCountry(v as 'us' | 'canada'); setRegion(''); }}>
                <SelectTrigger className="h-11 bg-gray-50 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Region</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="h-11 bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r.region} value={r.region}>
                      {r.region} ({r.multiplier.low.toFixed(2)}x - {r.multiplier.high.toFixed(2)}x)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {regionalMultiplier !== 1.0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Regional adjustment: <span className="font-semibold">{((regionalMultiplier - 1) * 100).toFixed(0)}%</span> {regionalMultiplier > 1 ? 'above' : 'below'} baseline
              </p>
            </div>
          )}
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="p-16 border-0 shadow-sm">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-gray-500">Loading industry data...</p>
            </div>
          </Card>
        )}

        {/* Industry Data Display */}
        {industryData && !loading && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 border-0 shadow-sm border-l-4 border-l-primary">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Avg Ticket</p>
                <p className="text-2xl font-bold text-gray-900">${adjustPrice(industryData.avgTicket.avg).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">
                  ${adjustPrice(industryData.avgTicket.low).toLocaleString()} - ${adjustPrice(industryData.avgTicket.high).toLocaleString()}
                </p>
              </Card>

              <Card className="p-5 border-0 shadow-sm border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{industryData.conversionRate}%</p>
                <Progress value={industryData.conversionRate} className="mt-2 h-1" />
              </Card>

              <Card className="p-5 border-0 shadow-sm border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Percent className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Gross Margin</p>
                <p className="text-2xl font-bold text-gray-900">{industryData.grossMargin.low}-{industryData.grossMargin.high}%</p>
                <p className="text-xs text-gray-400 mt-1">Net: {industryData.netMargin.avg}-{industryData.netMargin.top}%</p>
              </Card>

              <Card className="p-5 border-0 shadow-sm border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Sales Cycle</p>
                <p className="text-2xl font-bold text-gray-900">{industryData.salesCycle}</p>
                <p className="text-xs text-gray-400 mt-1">Labor: {industryData.laborPercent.low}-{industryData.laborPercent.high}%</p>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="models" className="space-y-4">
              <TabsList className="bg-gray-100 p-1 h-auto">
                <TabsTrigger value="models" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2">
                  <Zap className="h-4 w-4 mr-2" />
                  Pricing Models
                </TabsTrigger>
                <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Service Pricing
                </TabsTrigger>
                <TabsTrigger value="retention" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2">
                  <Users className="h-4 w-4 mr-2" />
                  Retention
                </TabsTrigger>
                <TabsTrigger value="ai" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2">
                  <Bot className="h-4 w-4 mr-2" />
                  AI Assistant
                </TabsTrigger>
              </TabsList>

              {/* Pricing Models Tab */}
              <TabsContent value="models" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pricing Models</h3>
                    <p className="text-sm text-gray-500">Conversion data from thousands of businesses</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {industryData.pricingModels.map((model: PricingModel) => {
                    const isRecommended = model === getRecommendedModel()
                    return (
                      <Card key={model.type} className={cn(
                        "p-5 border-0 shadow-sm relative",
                        isRecommended && "ring-2 ring-primary/20 bg-primary/[0.02]"
                      )}>
                        {isRecommended && (
                          <Badge className="absolute top-4 right-4 bg-emerald-500 text-white border-0">
                            <Check className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                        
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <Layers className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900">{model.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">{model.description}</p>
                            
                            <div className="mt-4 space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Industry Adoption</span>
                                <span className="font-medium">{model.prevalence}%</span>
                              </div>
                              <Progress value={model.prevalence} className="h-1" />
                              
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
                              
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-400 mb-1">Example</p>
                                <p className="text-sm font-medium text-gray-700">{model.example}</p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-400 mb-2">Best For:</p>
                                <div className="flex flex-wrap gap-1">
                                  {model.bestFor.map((use, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs font-normal">
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
                <Card className="p-6 border-0 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Conversion Insights
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-emerald-600">{CONVERSION_INSIGHTS.flatRatePreference}%</p>
                      <p className="text-sm text-gray-600 mt-1">prefer flat-rate pricing</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-blue-600">{CONVERSION_INSIGHTS.speedToQuote.under5Min / 100}x</p>
                      <p className="text-sm text-gray-600 mt-1">more likely with 5 min response</p>
                    </div>
                    <div className="p-4 bg-violet-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-violet-600">+{CONVERSION_INSIGHTS.tieredPricing.revenueIncrease}%</p>
                      <p className="text-sm text-gray-600 mt-1">revenue with tiered pricing</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Service Pricing Tab */}
              <TabsContent value="services" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Service Pricing Guide</h3>
                    <p className="text-sm text-gray-500">Market-based pricing for your region</p>
                  </div>
                  {regionalMultiplier !== 1.0 && (
                    <Badge className="bg-blue-100 text-blue-700 border-0">
                      {regionalMultiplier.toFixed(2)}x multiplier
                    </Badge>
                  )}
                </div>
                
                {Object.entries(
                  industryData.services.reduce((acc: Record<string, ServicePricing[]>, service) => {
                    if (!acc[service.category]) acc[service.category] = []
                    acc[service.category].push(service)
                    return acc
                  }, {})
                ).map(([category, services]) => (
                  <Card key={category} className="p-5 border-0 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">{category}</h4>
                    <div className="space-y-2">
                      {services.map((service, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
                
                {/* Price Calculator */}
                <Card className="p-5 border-0 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Price Calculator
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Base Price</label>
                      <Input 
                        type="number"
                        placeholder="Enter amount" 
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        className="h-11 bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Multiplier</label>
                      <Input 
                        value={`${regionalMultiplier.toFixed(2)}x`}
                        disabled
                        className="h-11 bg-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Adjusted Price</label>
                      <Input 
                        value={basePrice ? `$${Math.round(parseFloat(basePrice) * regionalMultiplier).toLocaleString()}` : ''}
                        placeholder="Result"
                        disabled
                        className="h-11 bg-primary/5 font-bold text-primary"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Retention Models Tab */}
              <TabsContent value="retention" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Retention Programs</h3>
                  <p className="text-sm text-gray-500">Build recurring revenue with service agreements</p>
                </div>
                
                <Card className="p-4 border-0 shadow-sm bg-violet-50">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-violet-900">Why Retention Matters</p>
                      <p className="text-sm text-violet-700">
                        Subscription customers have <span className="font-semibold">3x higher LTV</span> and 
                        cost <span className="font-semibold">5-7x less</span> to serve than new customers.
                      </p>
                    </div>
                  </div>
                </Card>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {industryData.retentionModels.map((model: RetentionModel, idx: number) => (
                    <Card key={idx} className="p-5 border-0 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-emerald-100">
                          <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-gray-900">{model.name}</h4>
                            <Badge className="bg-emerald-100 text-emerald-700 border-0">
                              +{model.retentionLift}% retention
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-500 mt-1">
                            {model.type.replace(/_/g, ' ')} • {model.frequency}
                          </p>
                          
                          <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-xs text-gray-400">Price Range</p>
                              <p className="text-lg font-bold text-gray-900">
                                ${adjustPrice(model.priceRange.low)} - ${adjustPrice(model.priceRange.high)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">LTV Multiplier</p>
                              <p className="text-lg font-bold text-emerald-600">{model.ltv_multiplier}x</p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-xs text-gray-400 mb-2">Includes:</p>
                            <ul className="space-y-1">
                              {model.includes.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {model.recommendedDiscount > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">
                                Tip: Offer <span className="font-semibold">{model.recommendedDiscount}%</span> annual prepay discount
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {/* Retention Metrics */}
                <Card className="p-6 border-0 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">Industry Benchmarks</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-600">37%</p>
                      <p className="text-sm text-gray-600">Higher Retention</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">3x</p>
                      <p className="text-sm text-gray-600">Customer LTV</p>
                    </div>
                    <div className="text-center p-4 bg-violet-50 rounded-lg">
                      <p className="text-2xl font-bold text-violet-600">60-70%</p>
                      <p className="text-sm text-gray-600">Renewal Rate</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <p className="text-2xl font-bold text-amber-600">15-20%</p>
                      <p className="text-sm text-gray-600">Prepay Discount</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* AI Assistant Tab */}
              <TabsContent value="ai" className="space-y-4">
                <Card className="p-5 border-0 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Pricing Assistant
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">Get data-backed pricing recommendations</p>
                  
                  <div className="flex gap-3">
                    <Input
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="Ask about pricing strategies, margins, or recommendations..."
                      onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
                      className="h-11 bg-gray-50 flex-1"
                    />
                    <Button
                      onClick={handleAIQuery}
                      disabled={aiLoading || !selectedIndustry}
                      className="h-11 px-6 bg-gradient-to-r from-primary to-[#9D96FF]"
                    >
                      {aiLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Bot className="h-4 w-4 mr-2" />
                          Ask
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Best pricing model for conversion?',
                        'How to structure tiered pricing?',
                        'Emergency service pricing?',
                        'Maintenance agreement strategy?',
                      ].map((prompt, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          onClick={() => setAiQuery(prompt)}
                          className="text-xs"
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>
                
                {/* AI Response */}
                {aiResponse?.recommendation && (
                  <Card className="p-5 border-0 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">Recommendation</h4>
                    
                    <div className="p-4 bg-violet-50 rounded-lg mb-4">
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
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
                        <h5 className="font-medium text-gray-900 mb-3">Suggested Prices</h5>
                        <div className="space-y-2">
                          {aiResponse.suggestedPrices.map((price: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{price.service}</p>
                                {price.notes && <p className="text-xs text-gray-400">{price.notes}</p>}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">${price.recommendedPrice}</p>
                                <p className="text-xs text-gray-400">${price.lowPrice} - ${price.highPrice}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {aiResponse.pricingTips?.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Tips</h5>
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
          <Card className="p-16 border-0 shadow-sm">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-[#9D96FF]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Select an Industry</h3>
              <p className="text-gray-500 mb-8">
                Access pricing data from thousands of home service businesses
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INDUSTRIES.slice(0, 8).map((ind) => (
                  <button
                    key={ind.slug}
                    onClick={() => setSelectedIndustry(ind.slug)}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-center group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center mx-auto mb-2 transition-colors">
                      <IndustryIcon icon={ind.icon} className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                    </div>
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
