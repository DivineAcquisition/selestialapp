"use client"

import { useState, useEffect } from 'react'
import { 
  Card, 
  Title, 
  Text, 
  TabGroup, 
  TabList, 
  Tab, 
  TabPanels, 
  TabPanel,
  Badge,
  ProgressBar,
  Metric,
  Flex,
  Grid,
  Col,
  Select,
  SelectItem,
  TextInput,
  Button,
  Callout,
  List,
  ListItem,
  Divider,
  NumberInput,
} from '@tremor/react'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  RefreshCw,
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
  Clock
} from 'lucide-react'

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
  // State
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
  const [basePrice, setBasePrice] = useState<number | undefined>(undefined)

  // Fetch industries on mount
  useEffect(() => {
    fetchIndustries()
  }, [])

  // Fetch industry data when selection changes
  useEffect(() => {
    if (selectedIndustry) {
      fetchIndustryDetails()
    }
  }, [selectedIndustry, region, country])

  const fetchIndustries = async () => {
    try {
      const res = await fetch('/api/ai/pricing-suggestion')
      const data = await res.json()
      setIndustries(data.industries)
      setRegions(data.regions)
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title className="text-2xl font-bold text-gray-900">Pricing Intelligence</Title>
          <Text className="text-gray-500">AI-powered pricing recommendations based on industry data</Text>
        </div>
        <Badge color="violet" icon={Bot}>
          Powered by 25+ Industries Data
        </Badge>
      </div>

      {/* Industry & Region Selection */}
      <Card className="rounded-2xl">
        <div className="space-y-4">
          <Title className="text-lg">Select Your Industry & Region</Title>
          
          <Grid numItems={1} numItemsMd={3} className="gap-4">
            <Col>
              <Text className="mb-2 text-sm font-medium">Industry</Text>
              <Select
                value={selectedIndustry}
                onValueChange={setSelectedIndustry}
                placeholder="Select your industry..."
              >
                {industries.map((ind) => (
                  <SelectItem key={ind.slug} value={ind.slug}>
                    {ind.icon} {ind.name}
                  </SelectItem>
                ))}
              </Select>
            </Col>
            
            <Col>
              <Text className="mb-2 text-sm font-medium">Country</Text>
              <Select
                value={country}
                onValueChange={(v) => setCountry(v as 'us' | 'canada')}
              >
                <SelectItem value="us">🇺🇸 United States</SelectItem>
                <SelectItem value="canada">🇨🇦 Canada</SelectItem>
              </Select>
            </Col>
            
            <Col>
              <Text className="mb-2 text-sm font-medium">Region / City</Text>
              <Select
                value={region}
                onValueChange={setRegion}
                placeholder="Select region..."
              >
                {regions[country]?.map((r: any) => (
                  <SelectItem key={r.region} value={r.region}>
                    {r.region} ({r.multiplier.low.toFixed(2)}x - {r.multiplier.high.toFixed(2)}x)
                  </SelectItem>
                ))}
              </Select>
            </Col>
          </Grid>

          {regionalMultiplier !== 1.0 && (
            <Callout title="Regional Price Adjustment" icon={MapPin} color="blue">
              Prices adjusted by {((regionalMultiplier - 1) * 100).toFixed(0)}% for your region
            </Callout>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="rounded-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <Text className="ml-3">Loading industry data...</Text>
          </div>
        </Card>
      )}

      {/* Industry Data Display */}
      {industryData && !loading && (
        <>
          {/* Industry Overview Stats */}
          <Grid numItems={1} numItemsMd={4} className="gap-4">
            <Card decoration="top" decorationColor="violet" className="rounded-2xl">
              <Flex justifyContent="between" alignItems="center">
                <div>
                  <Text className="text-gray-500">Avg Ticket</Text>
                  <Metric className="text-gray-900">${adjustPrice(industryData.avgTicket.avg)}</Metric>
                </div>
                <div className="p-3 bg-violet-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-violet-600" />
                </div>
              </Flex>
              <Text className="mt-2 text-gray-400 text-sm">
                Range: ${adjustPrice(industryData.avgTicket.low)} - ${adjustPrice(industryData.avgTicket.high)}
              </Text>
            </Card>

            <Card decoration="top" decorationColor="emerald" className="rounded-2xl">
              <Flex justifyContent="between" alignItems="center">
                <div>
                  <Text className="text-gray-500">Conversion Rate</Text>
                  <Metric className="text-gray-900">{industryData.conversionRate}%</Metric>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </Flex>
              <ProgressBar value={industryData.conversionRate} color="emerald" className="mt-3" />
            </Card>

            <Card decoration="top" decorationColor="blue" className="rounded-2xl">
              <Flex justifyContent="between" alignItems="center">
                <div>
                  <Text className="text-gray-500">Gross Margin</Text>
                  <Metric className="text-gray-900">{industryData.grossMargin.low}% - {industryData.grossMargin.high}%</Metric>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Percent className="w-6 h-6 text-blue-600" />
                </div>
              </Flex>
              <ProgressBar value={(industryData.grossMargin.low + industryData.grossMargin.high) / 2} color="blue" className="mt-3" />
            </Card>

            <Card decoration="top" decorationColor="amber" className="rounded-2xl">
              <Flex justifyContent="between" alignItems="center">
                <div>
                  <Text className="text-gray-500">Regional Multiplier</Text>
                  <Metric className="text-gray-900">{regionalMultiplier.toFixed(2)}x</Metric>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
              </Flex>
              <Text className="mt-2 text-gray-400 text-sm">
                {region || 'Baseline pricing'}
              </Text>
            </Card>
          </Grid>

          {/* Tabs for different sections */}
          <TabGroup>
            <TabList className="mt-4">
              <Tab icon={Zap}>Pricing Models</Tab>
              <Tab icon={DollarSign}>Service Pricing</Tab>
              <Tab icon={Users}>Retention Models</Tab>
              <Tab icon={Bot}>AI Assistant</Tab>
            </TabList>
            
            <TabPanels>
              {/* Pricing Models Tab */}
              <TabPanel>
                <div className="mt-4 space-y-4">
                  <Title>Recommended Pricing Models</Title>
                  <Text>Based on conversion data from thousands of home service businesses</Text>
                  
                  <Grid numItems={1} numItemsMd={2} className="gap-4 mt-4">
                    {industryData.pricingModels?.map((model: PricingModel) => (
                      <Card key={model.type} className="relative rounded-2xl">
                        {model.conversionImpact === Math.max(...industryData.pricingModels.map((m: PricingModel) => m.conversionImpact)) && (
                          <Badge color="emerald" className="absolute top-4 right-4">
                            Recommended
                          </Badge>
                        )}
                        
                        <Flex alignItems="start" className="gap-4">
                          <div className="p-3 bg-violet-100 rounded-xl">
                            <Layers className="w-6 h-6 text-violet-600" />
                          </div>
                          <div className="flex-1">
                            <Title className="text-base">{model.name}</Title>
                            <Text className="mt-1 text-gray-500">{model.description}</Text>
                            
                            <Divider />
                            
                            <div className="space-y-3">
                              <Flex justifyContent="between">
                                <Text>Industry Adoption</Text>
                                <Badge color="gray">{model.prevalence}%</Badge>
                              </Flex>
                              <ProgressBar value={model.prevalence} color="gray" />
                              
                              <Flex justifyContent="between">
                                <Text>Conversion Impact</Text>
                                <Badge color={model.conversionImpact > 0 ? 'emerald' : 'red'}>
                                  {model.conversionImpact > 0 ? '+' : ''}{model.conversionImpact}%
                                </Badge>
                              </Flex>
                              
                              <div className="p-3 bg-gray-50 rounded-xl">
                                <Text className="text-xs text-gray-400">Example</Text>
                                <Text className="font-medium text-gray-700">{model.example}</Text>
                              </div>
                              
                              <div>
                                <Text className="text-xs text-gray-400 mb-2">Best For:</Text>
                                <Flex className="flex-wrap gap-1">
                                  {model.bestFor.map((use, i) => (
                                    <Badge key={i} color="violet" size="sm">{use}</Badge>
                                  ))}
                                </Flex>
                              </div>
                            </div>
                          </div>
                        </Flex>
                      </Card>
                    ))}
                  </Grid>
                  
                  {/* Conversion Insights */}
                  <Card className="mt-6 rounded-2xl">
                    <Title>Conversion Optimization Insights</Title>
                    <Grid numItems={1} numItemsMd={3} className="gap-4 mt-4">
                      <div className="p-4 bg-emerald-50 rounded-xl text-center">
                        <Metric className="text-emerald-600">92%</Metric>
                        <Text className="text-gray-600">of customers prefer flat-rate pricing</Text>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl text-center">
                        <Metric className="text-blue-600">21x</Metric>
                        <Text className="text-gray-600">more likely to convert with &lt;5 min response</Text>
                      </div>
                      <div className="p-4 bg-violet-50 rounded-xl text-center">
                        <Metric className="text-violet-600">+30%</Metric>
                        <Text className="text-gray-600">revenue increase with tiered pricing</Text>
                      </div>
                    </Grid>
                  </Card>
                </div>
              </TabPanel>

              {/* Service Pricing Tab */}
              <TabPanel>
                <div className="mt-4 space-y-4">
                  <Flex justifyContent="between" alignItems="center">
                    <div>
                      <Title>Service Price Guide</Title>
                      <Text>Market-based pricing adjusted for your region</Text>
                    </div>
                    <Badge color="blue">
                      {regionalMultiplier.toFixed(2)}x Regional Adjustment
                    </Badge>
                  </Flex>
                  
                  {/* Group services by category */}
                  {Object.entries(
                    industryData.services?.reduce((acc: any, service: ServicePricing) => {
                      if (!acc[service.category]) acc[service.category] = []
                      acc[service.category].push(service)
                      return acc
                    }, {}) || {}
                  ).map(([category, services]) => (
                    <Card key={category} className="rounded-2xl">
                      <Title className="text-base">{category}</Title>
                      <div className="mt-4 space-y-3">
                        {(services as ServicePricing[]).map((service, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <div>
                              <Text className="font-medium text-gray-900">{service.name}</Text>
                              <Text className="text-xs text-gray-400">
                                Per {service.pricingUnit}
                              </Text>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">
                                  ${adjustPrice(service.lowPrice)}
                                </span>
                                <ArrowRight className="w-3 h-3 text-gray-300" />
                                <span className="font-bold text-violet-600">
                                  ${adjustPrice(service.avgPrice)}
                                </span>
                                <ArrowRight className="w-3 h-3 text-gray-300" />
                                <span className="text-sm text-gray-400">
                                  ${adjustPrice(service.highPrice)}
                                </span>
                              </div>
                              <Text className="text-xs text-gray-400">
                                Low → Recommended → Premium
                              </Text>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                  
                  {/* Price Calculator */}
                  <Card className="rounded-2xl">
                    <Title className="text-base">Quick Price Calculator</Title>
                    <Text>Calculate adjusted pricing for any service</Text>
                    
                    <Grid numItems={1} numItemsMd={3} className="gap-4 mt-4">
                      <div>
                        <Text className="mb-2 text-sm font-medium">Base Price ($)</Text>
                        <NumberInput 
                          placeholder="Enter base price..." 
                          min={0}
                          value={basePrice}
                          onValueChange={setBasePrice}
                        />
                      </div>
                      <div>
                        <Text className="mb-2 text-sm font-medium">Regional Multiplier</Text>
                        <TextInput 
                          value={`${regionalMultiplier.toFixed(2)}x`}
                          disabled
                        />
                      </div>
                      <div>
                        <Text className="mb-2 text-sm font-medium">Adjusted Price</Text>
                        <TextInput 
                          value={basePrice ? `$${Math.round(basePrice * regionalMultiplier)}` : ''}
                          placeholder="Enter base price first"
                          disabled
                        />
                      </div>
                    </Grid>
                  </Card>
                </div>
              </TabPanel>

              {/* Retention Models Tab */}
              <TabPanel>
                <div className="mt-4 space-y-4">
                  <Title>Retention & Recurring Revenue</Title>
                  <Text>Build predictable revenue with maintenance agreements and subscriptions</Text>
                  
                  <Callout title="Why Retention Matters" icon={Info} color="violet">
                    Subscription customers have <strong>3x higher lifetime value</strong> and 
                    cost <strong>5-7x less</strong> to serve than acquiring new customers.
                  </Callout>
                  
                  <Grid numItems={1} numItemsMd={2} className="gap-4 mt-4">
                    {industryData.retentionModels?.map((model: RetentionModel, idx: number) => (
                      <Card key={idx} className="rounded-2xl">
                        <Flex alignItems="start" className="gap-4">
                          <div className="p-3 bg-emerald-100 rounded-xl">
                            <Users className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <Flex justifyContent="between" alignItems="start">
                              <Title className="text-base">{model.name}</Title>
                              <Badge color="emerald">
                                +{model.retentionLift}% Retention
                              </Badge>
                            </Flex>
                            
                            <Text className="mt-2 text-gray-500">
                              {model.type.replace(/_/g, ' ')} • {model.frequency}
                            </Text>
                            
                            <Divider />
                            
                            <Flex justifyContent="between" className="mt-4">
                              <div>
                                <Text className="text-xs text-gray-400">Price Range</Text>
                                <Metric className="text-lg text-gray-900">
                                  ${adjustPrice(model.priceRange.low)} - ${adjustPrice(model.priceRange.high)}
                                </Metric>
                                <Text className="text-xs text-gray-400">per {model.frequency}</Text>
                              </div>
                              <div className="text-right">
                                <Text className="text-xs text-gray-400">LTV Multiplier</Text>
                                <Metric className="text-lg text-emerald-600">
                                  {model.ltv_multiplier}x
                                </Metric>
                              </div>
                            </Flex>
                            
                            <div className="mt-4">
                              <Text className="text-xs text-gray-400 mb-2">Includes:</Text>
                              <List>
                                {model.includes.map((item, i) => (
                                  <ListItem key={i}>
                                    <Flex justifyContent="start" className="gap-2">
                                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                      <span className="text-gray-700">{item}</span>
                                    </Flex>
                                  </ListItem>
                                ))}
                              </List>
                            </div>
                            
                            {model.recommendedDiscount > 0 && (
                              <Callout 
                                title={`Offer ${model.recommendedDiscount}% annual prepay discount`}
                                color="blue"
                                className="mt-4"
                              />
                            )}
                          </div>
                        </Flex>
                      </Card>
                    ))}
                  </Grid>
                  
                  {/* Retention Metrics */}
                  <Card className="rounded-2xl">
                    <Title className="text-base">Expected Retention Metrics</Title>
                    <Grid numItems={1} numItemsMd={4} className="gap-4 mt-4">
                      <div className="text-center p-4 bg-emerald-50 rounded-xl">
                        <Metric className="text-emerald-600">37%</Metric>
                        <Text className="text-gray-600">Higher Retention</Text>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <Metric className="text-blue-600">3x</Metric>
                        <Text className="text-gray-600">Customer LTV</Text>
                      </div>
                      <div className="text-center p-4 bg-violet-50 rounded-xl">
                        <Metric className="text-violet-600">60-70%</Metric>
                        <Text className="text-gray-600">Renewal Rate</Text>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-xl">
                        <Metric className="text-amber-600">15-20%</Metric>
                        <Text className="text-gray-600">Prepay Discount</Text>
                      </div>
                    </Grid>
                  </Card>
                </div>
              </TabPanel>

              {/* AI Assistant Tab */}
              <TabPanel>
                <div className="mt-4 space-y-4">
                  <Card className="rounded-2xl">
                    <Title className="text-base">AI Pricing Assistant</Title>
                    <Text>Ask any pricing question and get data-backed recommendations</Text>
                    
                    <div className="mt-4 flex gap-3">
                      <TextInput
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        placeholder="e.g., How should I price deep cleaning for 3-bedroom homes in my area?"
                        onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
                      />
                      <Button
                        icon={Bot}
                        loading={aiLoading}
                        onClick={handleAIQuery}
                        color="violet"
                      >
                        Ask AI
                      </Button>
                    </div>
                    
                    {/* Quick prompts */}
                    <div className="mt-4">
                      <Text className="text-xs text-gray-400 mb-2">Quick questions:</Text>
                      <Flex className="flex-wrap gap-2">
                        {[
                          'What pricing model converts best?',
                          'How do I structure tiered pricing?',
                          'What should I charge for emergency service?',
                          'How to build a maintenance agreement?',
                          'What discounts should I offer?'
                        ].map((prompt, i) => (
                          <Button
                            key={i}
                            size="xs"
                            variant="secondary"
                            onClick={() => {
                              setAiQuery(prompt)
                            }}
                          >
                            {prompt}
                          </Button>
                        ))}
                      </Flex>
                    </div>
                  </Card>
                  
                  {/* AI Response */}
                  {aiResponse && aiResponse.recommendation && (
                    <Card className="rounded-2xl">
                      <Title className="text-base">AI Recommendation</Title>
                      
                      {/* Primary Recommendation */}
                      {aiResponse.recommendation && (
                        <Callout
                          title={aiResponse.recommendation.primaryPricingModel}
                          icon={Zap}
                          color="violet"
                          className="mt-4"
                        >
                          {aiResponse.recommendation.modelRationale}
                          <Badge color="emerald" className="ml-2">
                            +{aiResponse.recommendation.conversionImpact}% conversion
                          </Badge>
                        </Callout>
                      )}
                      
                      {/* Suggested Prices */}
                      {aiResponse.suggestedPrices?.length > 0 && (
                        <div className="mt-6">
                          <Title className="text-sm">Suggested Pricing</Title>
                          <div className="mt-3 space-y-2">
                            {aiResponse.suggestedPrices.map((price: any, idx: number) => (
                              <div 
                                key={idx}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                              >
                                <div>
                                  <Text className="font-medium text-gray-900">{price.service}</Text>
                                  {price.notes && (
                                    <Text className="text-xs text-gray-400">{price.notes}</Text>
                                  )}
                                </div>
                                <div className="text-right">
                                  <Metric className="text-lg text-violet-600">
                                    ${price.recommendedPrice}
                                  </Metric>
                                  <Text className="text-xs text-gray-400">
                                    Range: ${price.lowPrice} - ${price.highPrice}
                                  </Text>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Tiered Options */}
                      {aiResponse.tieredOptions?.enabled && (
                        <div className="mt-6">
                          <Title className="text-sm">Tiered Pricing Options</Title>
                          <Grid numItems={1} numItemsMd={3} className="gap-4 mt-3">
                            {aiResponse.tieredOptions.tiers.map((tier: any, idx: number) => (
                              <Card 
                                key={idx}
                                decoration="top"
                                decorationColor={idx === 1 ? 'violet' : 'gray'}
                                className="rounded-xl"
                              >
                                {idx === 1 && (
                                  <Badge color="violet" className="mb-2">Most Popular</Badge>
                                )}
                                <Title className="text-base">{tier.name}</Title>
                                <Metric className="mt-2 text-gray-900">${tier.price}</Metric>
                                <List className="mt-4">
                                  {tier.features.map((f: string, i: number) => (
                                    <ListItem key={i}>
                                      <Flex justifyContent="start" className="gap-2">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        <span className="text-gray-700">{f}</span>
                                      </Flex>
                                    </ListItem>
                                  ))}
                                </List>
                              </Card>
                            ))}
                          </Grid>
                        </div>
                      )}
                      
                      {/* Retention Strategy */}
                      {aiResponse.retentionStrategy && (
                        <div className="mt-6">
                          <Title className="text-sm">Retention Strategy</Title>
                          <Card className="mt-3 bg-emerald-50 rounded-xl border-0">
                            <Flex alignItems="start" className="gap-4">
                              <Users className="w-8 h-8 text-emerald-600" />
                              <div>
                                <Title className="text-base">{aiResponse.retentionStrategy.recommended}</Title>
                                <Text className="text-gray-600">
                                  ${aiResponse.retentionStrategy.priceRange.low} - ${aiResponse.retentionStrategy.priceRange.high} / {aiResponse.retentionStrategy.frequency}
                                </Text>
                                <Badge color="emerald" className="mt-2">
                                  {aiResponse.retentionStrategy.expectedLtvMultiplier}x LTV Multiplier
                                </Badge>
                                <List className="mt-3">
                                  {aiResponse.retentionStrategy.includes.map((item: string, i: number) => (
                                    <ListItem key={i}>
                                      <span className="text-gray-700">{item}</span>
                                    </ListItem>
                                  ))}
                                </List>
                              </div>
                            </Flex>
                          </Card>
                        </div>
                      )}
                      
                      {/* Pricing Tips */}
                      {aiResponse.pricingTips?.length > 0 && (
                        <div className="mt-6">
                          <Title className="text-sm">Pricing Tips</Title>
                          <List className="mt-3">
                            {aiResponse.pricingTips.map((tip: string, idx: number) => (
                              <ListItem key={idx}>
                                <Flex justifyContent="start" className="gap-2">
                                  <Zap className="w-4 h-4 text-violet-500 flex-shrink-0" />
                                  <span className="text-gray-700">{tip}</span>
                                </Flex>
                              </ListItem>
                            ))}
                          </List>
                        </div>
                      )}
                      
                      {/* Estimated Metrics */}
                      {aiResponse.estimatedMetrics && (
                        <div className="mt-6">
                          <Title className="text-sm">Expected Results</Title>
                          <Grid numItems={3} className="gap-4 mt-3">
                            <Card decoration="top" decorationColor="emerald" className="rounded-xl">
                              <Text className="text-gray-500">Conversion Rate</Text>
                              <Metric className="text-gray-900">{aiResponse.estimatedMetrics.conversionRate}%</Metric>
                            </Card>
                            <Card decoration="top" decorationColor="blue" className="rounded-xl">
                              <Text className="text-gray-500">Avg Ticket</Text>
                              <Metric className="text-gray-900">${aiResponse.estimatedMetrics.avgTicket}</Metric>
                            </Card>
                            <Card decoration="top" decorationColor="violet" className="rounded-xl">
                              <Text className="text-gray-500">Gross Margin</Text>
                              <Metric className="text-gray-900">{aiResponse.estimatedMetrics.grossMargin}%</Metric>
                            </Card>
                          </Grid>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </>
      )}

      {/* No Industry Selected State */}
      {!selectedIndustry && !loading && (
        <Card className="rounded-2xl">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-violet-600" />
            </div>
            <Title>Select Your Industry to Get Started</Title>
            <Text className="mt-2 text-gray-500">
              Get pricing recommendations based on data from thousands of home service businesses
            </Text>
            
            <Grid numItems={2} numItemsMd={4} className="gap-4 mt-8">
              {industries.slice(0, 8).map((ind) => (
                <Card
                  key={ind.slug}
                  className="cursor-pointer hover:border-violet-500 hover:shadow-md transition-all rounded-xl"
                  onClick={() => setSelectedIndustry(ind.slug)}
                >
                  <div className="text-center">
                    <span className="text-3xl">{ind.icon}</span>
                    <Text className="font-medium mt-2 text-gray-900">{ind.name}</Text>
                    <Text className="text-xs text-gray-400">
                      {ind.conversionRate}% avg conversion
                    </Text>
                  </div>
                </Card>
              ))}
            </Grid>
          </div>
        </Card>
      )}
    </div>
  )
}
