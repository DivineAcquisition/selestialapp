export async function searchWithPerplexity(query: string): Promise<string> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [{ role: 'user', content: query }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

export async function researchCompetitor(businessUrl: string): Promise<{
  summary: string
  services: string[]
  pricing?: string
}> {
  const query = `Research the business at ${businessUrl}. Provide:
1. A brief summary of what they do
2. Their main services
3. Any visible pricing information`

  const result = await searchWithPerplexity(query)
  
  return {
    summary: result,
    services: [],
    pricing: undefined,
  }
}
