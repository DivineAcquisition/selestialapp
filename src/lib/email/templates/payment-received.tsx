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

interface PaymentReceivedEmailProps {
  businessName: string
  amount: number
  customerEmail: string
}

export default function PaymentReceivedEmail({
  businessName,
  amount,
  customerEmail,
}: PaymentReceivedEmailProps) {
  const formattedAmount = `$${(amount / 100).toFixed(2)}`
  
  return (
    <Html>
      <Head />
      <Preview>You received a payment of {formattedAmount}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment Received! 💰</Heading>
          
          <Text style={text}>
            Great news, {businessName}! You just received a payment.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Amount</Text>
            <Text style={amountText}>{formattedAmount}</Text>
            
            <Text style={detailLabel}>From</Text>
            <Text style={detailValue}>{customerEmail}</Text>
          </Section>

          <Text style={text}>
            The funds will be transferred to your connected bank account according to your Stripe payout schedule.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href="https://selestial.io/">
              View in Dashboard
            </Button>
          </Section>

          <Text style={footer}>
            Keep up the great work! 🚀
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
  color: '#10B981',
  fontSize: '28px',
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
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const detailLabel = {
  color: '#666',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px 0',
  letterSpacing: '0.5px',
}

const amountText = {
  color: '#10B981',
  fontSize: '36px',
  fontWeight: '700' as const,
  margin: '0 0 20px 0',
}

const detailValue = {
  color: '#333',
  fontSize: '16px',
  margin: '0',
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
