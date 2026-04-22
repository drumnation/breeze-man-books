import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  render,
} from '@react-email/components';

/**
 * Shipping Confirmation Email — sent to the customer when their order has shipped.
 *
 * Design: Brain Rot Books B&W comic-book aesthetic. Celebratory, fun tone.
 */

const BRAND = 'Brain Rot Books';
const SITE_URL = 'https://thebrainrotbooks.com';

interface Props {
  customerName: string;
  orderId: string;
  items: { title: string; quantity: number }[];
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

export async function renderShippingConfirmationEmail(props: Props) {
  const subject = `Your books are on the way! 📦 — Order #${props.orderId.slice(-8).toUpperCase()}`;

  const html = await render(
    <Html>
      <Head />
      <Preview>Your Brain Rot Books order has shipped! Tracking: {props.trackingNumber || 'N/A'}</Preview>

      <Tailwind>
        <Body style={{ backgroundColor: '#ffffff', margin: 0, padding: 0 }}>
          <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '0 16px' }}>

            {/* ── HEADER ── */}
            <Section style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '24px' }}>
              <Text style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '28px',
                fontWeight: 900,
                letterSpacing: '-0.5px',
                color: '#000000',
                margin: 0,
                lineHeight: 1.1,
                textTransform: 'uppercase',
              }}>
                ⚡ {BRAND} ⚡
              </Text>
              <Text style={{
                fontFamily: 'Courier New, monospace',
                fontSize: '11px',
                color: '#666666',
                marginTop: '4px',
                marginBottom: 0,
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>
                These Are Just Books. They Are A Vibe.
              </Text>
            </Section>

            {/* ── THICK DIVIDER ── */}
            <Section style={{ height: '4px', backgroundColor: '#000000', margin: '0 0 32px 0' }} />

            {/* ── SHIPPING BANNER ── */}
            <Section style={{
              border: '3px solid #000000',
              textAlign: 'center',
              padding: '28px 16px',
            }}>
              <Text style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '26px',
                fontWeight: 900,
                color: '#000000',
                margin: '0 0 4px 0',
                textTransform: 'uppercase',
              }}>
                🚀 YOUR BOOKS HAVE SHIPPED!
              </Text>
              <Text style={{
                fontFamily: 'Courier New, monospace',
                fontSize: '12px',
                color: '#666666',
                margin: 0,
                letterSpacing: '1px',
              }}>
                ORDER #{props.orderId.slice(-8).toUpperCase()}
              </Text>
            </Section>

            {/* ── GREETING ── */}
            <Section style={{ padding: '24px 0' }}>
              <Text style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '20px',
                fontWeight: 700,
                color: '#000000',
                margin: '0 0 12px 0',
              }}>
                Hey{props.customerName ? ` ${props.customerName}` : ''},
              </Text>
              <Text style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '15px',
                color: '#333333',
                lineHeight: 1.6,
                margin: 0,
              }}>
                Great news — your order is officially in transit! Brendan personally
                handed it to the mail carrier (probably). Your books are on their way to you.
              </Text>
            </Section>

            {/* ── WHAT'S IN THE BOX ── */}
            <Section style={{ margin: '0 0 24px 0' }}>
              <Text style={{
                fontFamily: 'Courier New, monospace',
                fontSize: '11px',
                color: '#999999',
                margin: '0 0 8px 0',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>
                What's In The Box
              </Text>
              <Section style={{
                border: '1px solid #000000',
                padding: '0',
              }}>
                {props.items.map((item, i) => (
                  <Section key={i} style={{
                    padding: '12px 16px',
                    borderTop: i > 0 ? '1px solid #e5e5e5' : 'none',
                  }}>
                    <Row>
                      <Column style={{ width: '75%' }}>
                        <Text style={{
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#000000',
                          margin: 0,
                        }}>
                          {item.title}
                        </Text>
                      </Column>
                      <Column style={{ width: '25%', textAlign: 'right' }}>
                        <Text style={{
                          fontFamily: 'Courier New, monospace',
                          fontSize: '14px',
                          color: '#333333',
                          margin: 0,
                        }}>
                          × {item.quantity}
                        </Text>
                      </Column>
                    </Row>
                  </Section>
                ))}
              </Section>
            </Section>

            {/* ── TRACKING INFO ── */}
            {props.trackingNumber && (
              <Section style={{
                margin: '0 0 24px 0',
                padding: '16px',
                backgroundColor: '#000000',
                color: '#ffffff',
              }}>
                <Text style={{
                  fontFamily: 'Courier New, monospace',
                  fontSize: '11px',
                  color: '#999999',
                  margin: '0 0 6px 0',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}>
                  Tracking Number
                </Text>
                <Text style={{
                  fontFamily: 'Courier New, monospace',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0,
                }}>
                  {props.trackingUrl ? (
                    <a href={props.trackingUrl} style={{ color: '#ffffff', textDecoration: 'underline' }}>
                      {props.trackingNumber}
                    </a>
                  ) : (
                    props.trackingNumber
                  )}
                </Text>
              </Section>
            )}

            {/* ── ESTIMATED DELIVERY ── */}
            {props.estimatedDelivery && (
              <Section style={{
                margin: '0 0 24px 0',
                padding: '16px',
                borderLeft: '4px solid #000000',
                backgroundColor: '#fafafa',
              }}>
                <Text style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: '14px',
                  color: '#333333',
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                  <strong>Estimated delivery:</strong> {props.estimatedDelivery}
                </Text>
              </Section>
            )}

            {/* ── COMIC DIVIDER ── */}
            <Section style={{ height: '2px', backgroundColor: '#000000', margin: '8px 0 24px 0' }} />

            {/* ── FOOTER ── */}
            <Section style={{ paddingBottom: '40px', textAlign: 'center' }}>
              <Text style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '16px',
                color: '#000000',
                margin: '0 0 8px 0',
              }}>
                Happy Reading! 📚⚡
              </Text>
              <Text style={{
                fontFamily: 'Courier New, monospace',
                fontSize: '11px',
                color: '#999999',
                margin: '0 0 4px 0',
              }}>
                <a href={SITE_URL} style={{ color: '#000000', textDecoration: 'none' }}>
                  {SITE_URL.replace('https://', '')}
                </a>
                {' · '}
                <a href="https://instagram.com/thebrainrotbooks" style={{ color: '#000000', textDecoration: 'none' }}>
                  @thebrainrotbooks
                </a>
              </Text>
              <Text style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '10px',
                color: '#cccccc',
                margin: '16px 0 0 0',
              }}>
                Brain Rot Books by Brendan · thebrainrotbooks.com
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>,
  );

  return { html, subject };
}
