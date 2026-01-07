import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function generateSmartReplies(
  customerMessage: string,
  context: {
    businessName: string
    customerName: string
    serviceType?: string
    quoteAmount?: number
    tone?: string
  }
): Promise<string[]> {
  const { businessName, customerName, serviceType, quoteAmount, tone = 'friendly' } = context

  const prompt = `You are an AI assistant helping ${businessName} respond to customer messages via SMS.

TONE: ${tone}
RULES:
- Generate exactly 2 short reply options (under 160 characters each)
- Be helpful and move toward booking/closing
- Include pricing if relevant and known
- Never be pushy

CONTEXT:
- Customer: ${customerName}
- Service: ${serviceType || 'General inquiry'}
- Quote Amount: ${quoteAmount ? `$${(quoteAmount / 100).toFixed(0)}` : 'Not quoted yet'}

CUSTOMER MESSAGE:
"${customerMessage}"

Respond with exactly 2 options in this format:
OPTION 1: [reply]
OPTION 2: [reply]`

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  
  const suggestions: string[] = []
  const option1 = text.match(/OPTION 1:\s*(.+?)(?=OPTION 2:|$)/i)
  const option2 = text.match(/OPTION 2:\s*(.+?)$/i)
  
  if (option1) suggestions.push(option1[1].trim())
  if (option2) suggestions.push(option2[1].trim())

  return suggestions
}

export async function generateFollowUpMessage(
  context: {
    businessName: string
    customerName: string
    serviceType: string
    quoteAmount: number
    daysSinceQuote: number
    tone?: string
  }
): Promise<string> {
  const { businessName, customerName, serviceType, quoteAmount, daysSinceQuote, tone = 'friendly' } = context

  const prompt = `Generate a brief SMS follow-up message (under 160 characters) for ${businessName}.

CONTEXT:
- Customer: ${customerName}
- Service: ${serviceType}
- Quote: $${(quoteAmount / 100).toFixed(0)}
- Days since quote: ${daysSinceQuote}
- Tone: ${tone}

Generate a single follow-up message that's natural and not pushy.`

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].type === 'text' ? response.content[0].text.trim() : ''
}
