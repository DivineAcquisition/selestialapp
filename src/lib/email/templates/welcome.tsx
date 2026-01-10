import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface WelcomeEmailProps {
  name: string
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Selestial - Let&apos;s get you set up!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Selestial!</Heading>
          
          <Text style={text}>Hi {name},</Text>
          
          <Text style={text}>
            Thanks for signing up! We&apos;re excited to help you turn more quotes into paying customers.
          </Text>

          <Text style={text}>
            Here&apos;s what you can do with Selestial:
          </Text>

          <ul style={list}>
            <li>Automate quote follow-up sequences</li>
            <li>Use AI-powered smart replies</li>
            <li>Track your win rate and revenue</li>
            <li>Manage all conversations in one inbox</li>
          </ul>

          <Section style={buttonContainer}>
            <Button style={button} href="https://selestial.io/">
              Go to Dashboard
            </Button>
          </Section>

          <Text style={text}>
            Need help getting started? Check out our{' '}
            <Link href="https://selestial.io/docs" style={link}>
              quick start guide
            </Link>{' '}
            or reply to this email - we&apos;re here to help!
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Selestial - Turn more quotes into customers
            <br />
            <Link href="https://selestial.io/unsubscribe" style={link}>
              Unsubscribe
            </Link>
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
  color: '#5500FF',
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

const list = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '32px',
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

const link = {
  color: '#5500FF',
  textDecoration: 'underline',
}

const hr = {
  borderColor: '#E5E5E5',
  margin: '32px 0',
}

const footer = {
  color: '#999',
  fontSize: '12px',
  lineHeight: '20px',
}
