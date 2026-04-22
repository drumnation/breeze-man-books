import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  render,
} from '@react-email/components';
import * as React from 'react';

interface OrderDownloadEmailProps {
  bookTitle: string;
  buyerName?: string;
  orderDate?: string;
}

export async function renderOrderDownloadEmail(props: OrderDownloadEmailProps) {
  const subject = `Your copy of "${props.bookTitle}" is confirmed`;
  const html = await render(<OrderDownloadEmail {...props} />);
  return { subject, html };
}

export function OrderDownloadEmail({
  bookTitle = 'Your Book',
  buyerName,
  orderDate,
}: OrderDownloadEmailProps) {
  const greeting = buyerName ? `Hey ${buyerName},` : 'Hey,';

  return (
    <Html>
      <Head />
      <Preview>Your purchase of &quot;{bookTitle}&quot; is confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brandName}>THE BRAIN ROT BOOKS</Text>
            <Hr style={headerRule} />
          </Section>

          <Section style={body}>
            <Heading style={h1}>PURCHASE CONFIRMED</Heading>
            <Hr style={divider} />

            <Text style={greetingText}>{greeting}</Text>
            <Text style={paragraph}>
              Your order for <strong>&quot;{bookTitle}&quot;</strong> has been
              confirmed{orderDate ? ` on ${orderDate}` : ''}.
            </Text>

            <Section style={callout}>
              <Text style={calloutText}>📦 YOUR DOWNLOAD LINK IS ON ITS WAY</Text>
              <Text style={calloutSub}>
                We&apos;re preparing your copy and will send a follow-up email
                with your download link shortly.
              </Text>
            </Section>

            <Text style={paragraph}>
              Questions? Reply to this email or contact{' '}
              <Link href="mailto:orders@thebrainrotbooks.com" style={link}>
                orders@thebrainrotbooks.com
              </Link>
              .
            </Text>
          </Section>

          <Hr style={footerRule} />
          <Section style={footer}>
            <Text style={footerText}>
              © The Brain Rot Books —{' '}
              <Link href="https://thebrainrotbooks.com" style={footerLink}>
                thebrainrotbooks.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  border: '2px solid #000000',
};

const header: React.CSSProperties = {
  backgroundColor: '#000000',
  padding: '24px 32px 16px',
};

const brandName: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#ffffff',
  letterSpacing: '4px',
  margin: '0 0 8px',
  textAlign: 'center',
};

const headerRule: React.CSSProperties = {
  borderColor: '#ffffff',
  opacity: 0.3,
  margin: '8px 0 0',
};

const body: React.CSSProperties = { padding: '32px' };

const h1: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#000000',
  letterSpacing: '2px',
  margin: '0 0 16px',
};

const divider: React.CSSProperties = { borderColor: '#000000', margin: '0 0 24px' };

const greetingText: React.CSSProperties = { fontSize: '16px', color: '#000000', margin: '0 0 8px' };

const paragraph: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#333333',
  margin: '0 0 20px',
};

const callout: React.CSSProperties = {
  backgroundColor: '#000000',
  padding: '20px 24px',
  margin: '24px 0',
};

const calloutText: React.CSSProperties = {
  fontFamily: 'Courier New, monospace',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 8px',
  letterSpacing: '1px',
};

const calloutSub: React.CSSProperties = {
  fontSize: '13px',
  color: '#cccccc',
  margin: '0',
  lineHeight: '1.5',
};

const link: React.CSSProperties = { color: '#000000', textDecoration: 'underline' };

const footerRule: React.CSSProperties = { borderColor: '#000000', margin: '0' };

const footer: React.CSSProperties = { padding: '16px 32px', backgroundColor: '#fafafa' };

const footerText: React.CSSProperties = {
  fontSize: '12px',
  color: '#666666',
  margin: '0',
  textAlign: 'center',
};

const footerLink: React.CSSProperties = { color: '#000000', textDecoration: 'underline' };
