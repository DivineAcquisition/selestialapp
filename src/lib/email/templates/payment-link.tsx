import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface PaymentLinkEmailProps {
  businessName: string
  customerName: string
  amount: number // in cents
  description: string
  paymentUrl: string
  expiresAt?: string | null
  customMessage?: string
}

export default function PaymentLinkEmail({
  businessName,
  customerName,
  amount,
  description,
  paymentUrl,
  expiresAt,
  customMessage,
}: PaymentLinkEmailProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <Html>
      <Head />
      <Preview>Payment Request from {businessName} - {formattedAmount}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={businessTitle}>{businessName}</Text>
          </Section>

          {/* Main Content */}
          <Heading style={h1}>Payment Request</Heading>
          
          <Text style={greeting}>
            Hi {customerName.split(' ')[0]},
          </Text>

          {customMessage ? (
            <Text style={text}>{customMessage}</Text>
          ) : (
            <Text style={text}>
              {businessName} has sent you a payment request. Please review the details below and click the button to complete your payment securely.
            </Text>
          )}

          {/* Amount Box */}
          <Section style={amountBox}>
            <Text style={amountLabel}>Amount Due</Text>
            <Text style={amountValue}>{formattedAmount}</Text>
            <Text style={descriptionText}>{description}</Text>
          </Section>

          {/* Pay Button */}
          <Section style={buttonContainer}>
            <Button style={button} href={paymentUrl}>
              Pay {formattedAmount}
            </Button>
          </Section>

          {/* Expiry Notice */}
          {formattedExpiry && (
            <Text style={expiryText}>
              ⏰ This payment link expires on {formattedExpiry}
            </Text>
          )}

          <Hr style={divider} />

          {/* Security Notice */}
          <Section style={securitySection}>
            <Text style={securityTitle}>🔒 Secure Payment</Text>
            <Text style={securityText}>
              Your payment is processed securely through Stripe. Your card details are never stored on our servers.
            </Text>
          </Section>

          {/* Footer */}
          <Text style={footer}>
            Questions? Reply to this email or contact {businessName} directly.
          </Text>
          
          <Text style={footerSmall}>
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
  borderRadius: '8px',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const businessTitle = {
  color: '#8B5CF6',
  fontSize: '20px',
  fontWeight: '700' as const,
  margin: '0',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700' as const,
  margin: '0 0 16px',
  textAlign: 'center' as const,
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

const amountBox = {
  backgroundColor: '#8B5CF6',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const amountLabel = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '14px',
  fontWeight: '500' as const,
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const amountValue = {
  color: '#ffffff',
  fontSize: '42px',
  fontWeight: '700' as const,
  margin: '0 0 8px',
}

const descriptionText = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '14px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
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

const expiryText = {
  color: '#f59e0b',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '16px 0 24px',
  fontWeight: '500' as const,
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const securitySection = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const securityTitle = {
  color: '#333',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 8px',
}

const securityText = {
  color: '#666',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
}

const footer = {
  color: '#666',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '24px 0 8px',
}

const footerSmall = {
  color: '#999',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
}
