import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  render,
} from '@react-email/components';

/**
 * Order Confirmation Email — sent to the customer after a successful purchase.
 *
 * Design: Black & white, bold comic-book aesthetic matching the Brain Rot Books brand.
 * Heavy serif headings, clean sans body, monospace accents, comic-style borders.
 */

const BRAND = 'Brain Rot Books';
const SITE_URL = 'https://thebrainrotbooks.com';

interface ShippingAddress {
  name?: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface OrderItem {
  title: string;
  quantity: number;
  price: string;
}

interface Props {
  customerName: string;
  orderId: string;
  items: OrderItem[];
  total: string;
  shippingAddress: ShippingAddress | null;
  estimatedDelivery?: string;
}

export async function renderOrderConfirmationEmail(props: Props) {
  const subject = `Order Confirmed — ${props.orderId.slice(-8).toUpperCase()}`;

  const addressLines = props.shippingAddress
    ? [
        props.shippingAddress.name,
        props.shippingAddress.line1,
        props.shippingAddress.line2,
        `${props.shippingAddress.city}, ${props.shippingAddress.state} ${props.shippingAddress.postalCode}`,
        props.shippingAddress.country,
      ].filter(Boolean)
    : [];

  const html = await render(
    <Html>
      <Head />
      <Preview>Your {BRAND} order is confirmed! Order #{props.orderId.slice(-8).toUpperCase()}</Preview>

      <Tailwind>
        <Body style={{ backgroundColor: '#ffffff', margin: 0, padding: 0 }}>
          {/* Outer wrapper */}
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

            {/* ── THICK COMIC BORDER DIVIDER ── */}
            <Section style={{
              height: '4px',
              backgroundColor: '#000000',
              margin: '0 0 32px 0',
            }} />

            {/* ── SUCCESS BANNER ── */}
            <Section style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              textAlign: 'center',
              padding: '24px 16px',
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}>
              <Text style={{
                fontSize: '22px',
                fontWeight: 700,
                margin: '0 0 4px 0',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                ✓ ORDER CONFIRMED
              </Text>
              <Text style={{
                fontFamily: 'Courier New, monospace',
                fontSize: '12px',
                color: '#cccccc',
                margin: 0,
                letterSpacing: '1px',
              }}>
                #{props.orderId.slice(-8).toUpperCase()}
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
                Your order is locked in. Brendan is suiting up and your books are
                getting ready to ship. Here's the rundown:
              </Text>
            </Section>

            {/* ── ORDER ITEMS ── */}
            <Section style={{
              border: '3px solid #000000',
              padding: '0',
              margin: '0 0 24px 0',
            }}>
              {/* Table header */}
              <Section style={{
                backgroundColor: '#000000',
                padding: '10px 16px',
              }}>
                <Row>
                  <Column style={{ width: '60%' }}>
                    <Text style={{
                      fontFamily: 'Courier New, monospace',
                      fontSize: '11px',
                      color: '#ffffff',
                      margin: 0,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                    }}>
                      Item
                    </Text>
                  </Column>
                  <Column style={{ width: '20%', textAlign: 'center' }}>
                    <Text style={{
                      fontFamily: 'Courier New, monospace',
                      fontSize: '11px',
                      color: '#ffffff',
                      margin: 0,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                    }}>
                      Qty
                    </Text>
                  </Column>
                  <Column style={{ width: '20%', textAlign: 'right' }}>
                    <Text style={{
                      fontFamily: 'Courier New, monospace',
                      fontSize: '11px',
                      color: '#ffffff',
                      margin: 0,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                    }}>
                      Price
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Items */}
              {props.items.map((item, i) => (
                <Section key={i} style={{
                  padding: '14px 16px',
                  borderTop: i > 0 ? '1px solid #e5e5e5' : 'none',
                }}>
                  <Row>
                    <Column style={{ width: '60%', verticalAlign: 'middle' }}>
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
                    <Column style={{ width: '20%', textAlign: 'center', verticalAlign: 'middle' }}>
                      <Text style={{
                        fontFamily: 'Courier New, monospace',
                        fontSize: '14px',
                        color: '#333333',
                        margin: 0,
                      }}>
                        {item.quantity}
                      </Text>
                    </Column>
                    <Column style={{ width: '20%', textAlign: 'right', verticalAlign: 'middle' }}>
                      <Text style={{
                        fontFamily: 'Courier New, monospace',
                        fontSize: '14px',
                        color: '#333333',
                        margin: 0,
                      }}>
                        {item.price}
                      </Text>
                    </Column>
                  </Row>
                </Section>
              ))}

              {/* Total */}
              <Section style={{
                borderTop: '2px solid #000000',
                padding: '12px 16px',
                backgroundColor: '#fafafa',
              }}>
                <Row>
                  <Column style={{ width: '80%' }}>
                    <Text style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#000000',
                      margin: 0,
                      textTransform: 'uppercase',
                    }}>
                      Total
                    </Text>
                  </Column>
                  <Column style={{ width: '20%', textAlign: 'right' }}>
                    <Text style={{
                      fontFamily: 'Courier New, monospace',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#000000',
                      margin: 0,
                    }}>
                      {props.total}
                    </Text>
                  </Column>
                </Row>
              </Section>
            </Section>

            {/* ── SHIPPING ADDRESS ── */}
            {addressLines.length > 0 && (
              <Section style={{ margin: '0 0 24px 0' }}>
                <Text style={{
                  fontFamily: 'Courier New, monospace',
                  fontSize: '11px',
                  color: '#999999',
                  margin: '0 0 8px 0',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}>
                  Shipping To
                </Text>
                <Section style={{
                  border: '1px solid #000000',
                  padding: '16px',
                }}>
                  {addressLines.map((line, i) => (
                    <Text key={i} style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontSize: '14px',
                      color: '#333333',
                      margin: 0,
                      lineHeight: 1.5,
                    }}>
                      {line}
                    </Text>
                  ))}
                </Section>
              </Section>
            )}

            {/* ── ESTIMATED DELIVERY ── */}
            {props.estimatedDelivery && (
              <Section style={{
                margin: '0 0 24px 0',
                padding: '16px',
                backgroundColor: '#fafafa',
                borderLeft: '4px solid #000000',
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
            <Section style={{
              height: '2px',
              backgroundColor: '#000000',
              margin: '8px 0 24px 0',
            }} />

            {/* ── FOOTER ── */}
            <Section style={{ paddingBottom: '40px', textAlign: 'center' }}>
              <Text style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '14px',
                color: '#000000',
                margin: '0 0 8px 0',
              }}>
                Stay Rotten 📚
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
