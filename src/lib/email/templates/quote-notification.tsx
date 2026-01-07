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
} from '@react-email/components'

interface QuoteNotificationEmailProps {
  businessName: string
  customerName: string
  serviceType: string
  amount: number
  quoteId: string
}

export default function QuoteNotificationEmail({
  businessName,
  customerName,
  serviceType,
  amount,
  quoteId,
}: QuoteNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New quote request from {customerName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Quote Request 📋</Heading>
          
          <Text style={text}>
            You have a new quote request for {businessName}!
          </Text>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Customer</Text>
            <Text style={detailValue}>{customerName}</Text>
            
            <Text style={detailLabel}>Service</Text>
            <Text style={detailValue}>{serviceType}</Text>
            
            <Text style={detailLabel}>Amount</Text>
            <Text style={detailValue}>${(amount / 100).toFixed(2)}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={`https://selestial.io/quotes/${quoteId}`}>
              View Quote
            </Button>
          </Section>

          <Text style={footer}>
            Quick follow-up leads to more wins! 🚀
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#FAFAFA',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '700' as const,
  margin: '0 0 20px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const detailsBox = {
  backgroundColor: '#fff',
  border: '1px solid #E5E5E5',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const detailLabel = {
  color: '#666',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  margin: '0',
  letterSpacing: '0.5px',
}

const detailValue = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600' as const,
  margin: '4px 0 16px',
}

const buttonContainer = {
  margin: '32px 0',
}

const button = {
  backgroundColor: '#5500FF',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 28px',
  display: 'inline-block',
}

const footer = {
  color: '#666',
  fontSize: '14px',
  marginTop: '32px',
  textAlign: 'center' as const,
}
