interface ScrapeResult {
  success: boolean
  data?: {
    markdown?: string
    html?: string
    metadata?: {
      title?: string
      description?: string
      ogImage?: string
    }
  }
  error?: string
}

export async function scrapeWebsite(url: string): Promise<ScrapeResult> {
  const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    return {
      success: false,
      error: `Firecrawl API error: ${response.status}`,
    }
  }

  return response.json()
}

interface CrawlResult {
  success: boolean
  jobId?: string
  data?: Array<{
    url: string
    markdown?: string
    metadata?: {
      title?: string
      description?: string
    }
  }>
  error?: string
}

export async function crawlWebsite(
  url: string, 
  options?: { limit?: number }
): Promise<CrawlResult> {
  const response = await fetch('https://api.firecrawl.dev/v0/crawl', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      crawlerOptions: { limit: options?.limit || 10 },
    }),
  })

  if (!response.ok) {
    return {
      success: false,
      error: `Firecrawl API error: ${response.status}`,
    }
  }

  return response.json()
}

export async function extractBusinessInfo(url: string): Promise<{
  name?: string
  description?: string
  services?: string[]
  contact?: {
    phone?: string
    email?: string
    address?: string
  }
}> {
  const result = await scrapeWebsite(url)
  
  if (!result.success || !result.data) {
    return {}
  }

  return {
    name: result.data.metadata?.title,
    description: result.data.metadata?.description,
  }
}
