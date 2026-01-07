import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface CustomerQuoteEmailProps {
  businessName: string
  businessPhone?: string
  businessEmail?: string
  customerName: string
  serviceType: string
  amount: number // in cents
  description?: string
  paymentUrl: string
  quoteId: string
  expiresAt?: string | null
}

export default function CustomerQuoteEmail({
  businessName,
  businessPhone,
  businessEmail,
  customerName,
  serviceType,
  amount,
  description,
  paymentUrl,
  quoteId,
  expiresAt,
}: CustomerQuoteEmailProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <Html>
      <Head />
      <Preview>Your quote from {businessName} - {formattedAmount}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={businessTitle}>{businessName}</Text>
            <Text style={tagline}>Your Quote is Ready!</Text>
          </Section>

          {/* Greeting */}
          <Text style={greeting}>
            Hi {customerName.split(' ')[0]},
          </Text>

          <Text style={text}>
            Thank you for your interest! We&apos;ve prepared a quote for your {serviceType.toLowerCase()} service. Review the details below and pay securely online when you&apos;re ready to proceed.
          </Text>

          {/* Quote Details Box */}
          <Section style={quoteBox}>
            <Text style={quoteLabel}>Quote #{quoteId.slice(-8).toUpperCase()}</Text>
            
            <Section style={serviceRow}>
              <Text style={serviceName}>{serviceType}</Text>
              {description && <Text style={serviceDescription}>{description}</Text>}
            </Section>

            <Hr style={quoteDivider} />

            <Section style={totalRow}>
              <Text style={totalLabel}>Total</Text>
              <Text style={totalAmount}>{formattedAmount}</Text>
            </Section>
          </Section>

          {/* Pay Button */}
          <Section style={buttonContainer}>
            <Button style={button} href={paymentUrl}>
              Accept & Pay {formattedAmount}
            </Button>
          </Section>

          <Text style={orText}>
            or copy this link: {paymentUrl}
          </Text>

          {/* Expiry Notice */}
          {formattedExpiry && (
            <Section style={expiryBox}>
              <Text style={expiryText}>
                ⏰ This quote is valid until {formattedExpiry}
              </Text>
            </Section>
          )}

          <Hr style={divider} />

          {/* What's Next */}
          <Section style={nextStepsSection}>
            <Text style={nextStepsTitle}>What happens next?</Text>
            <Text style={nextStepsItem}>✓ Complete your secure payment</Text>
            <Text style={nextStepsItem}>✓ Receive instant confirmation</Text>
            <Text style={nextStepsItem}>✓ We&apos;ll schedule your service</Text>
          </Section>

          {/* Contact Info */}
          <Section style={contactSection}>
            <Text style={contactTitle}>Questions?</Text>
            <Text style={contactText}>
              Contact {businessName}
              {businessPhone && ` at ${businessPhone}`}
              {businessEmail && ` or email ${businessEmail}`}
            </Text>
          </Section>

          {/* Footer */}
          <Text style={footer}>
            Powered by Selestial • Secure payments for service businesses
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const businessTitle = {
  color: '#8B5CF6',
  fontSize: '24px',
  fontWeight: '700' as const,
  margin: '0 0 8px',
}

const tagline = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600' as const,
  margin: '0',
}

const greeting = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const text = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 24px',
}

const quoteBox = {
  backgroundColor: '#fafafa',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
}

const quoteLabel = {
  color: '#8B5CF6',
  fontSize: '12px',
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 16px',
}

const serviceRow = {
  margin: '0 0 16px',
}

const serviceName = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600' as const,
  margin: '0 0 4px',
}

const serviceDescription = {
  color: '#666',
  fontSize: '14px',
  margin: '0',
}

const quoteDivider = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
}

const totalRow = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
}

const totalLabel = {
  color: '#666',
  fontSize: '14px',
  fontWeight: '500' as const,
  margin: '0',
}

const totalAmount = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700' as const,
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0 16px',
}

const button = {
  backgroundColor: '#8B5CF6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '16px 48px',
  display: 'inline-block',
}

const orText = {
  color: '#999',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
  wordBreak: 'break-all' as const,
}

const expiryBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '16px 0',
}

const expiryText = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '500' as const,
  margin: '0',
  textAlign: 'center' as const,
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const nextStepsSection = {
  margin: '24px 0',
}

const nextStepsTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 12px',
}

const nextStepsItem = {
  color: '#555',
  fontSize: '14px',
  margin: '0 0 8px',
  lineHeight: '20px',
}

const contactSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const contactTitle = {
  color: '#333',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 8px',
}

const contactText = {
  color: '#666',
  fontSize: '14px',
  margin: '0',
}

const footer = {
  color: '#999',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '24px 0 0',
}
