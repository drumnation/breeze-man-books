import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  render,
} from '@react-email/components';

/**
 * New Order Notification Email — sent to the store owner (Zubair) when a new order comes in.
 *
 * Design: Matches the Brain Rot Books B&W comic aesthetic.
 * High-signal layout: all order details visible at a glance.
 */

const BRAND = 'Brain Rot Books';

interface ShippingAddress {
  name?: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Props {
  productName: string;
  amountPaid: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: ShippingAddress | null;
  quantity?: number;
}

export async function renderNewOrderNotificationEmail(props: Props) {
  const subject = `📦 NEW ORDER — ${props.productName} — ${props.amountPaid}`;

  const addressLines = props.shippingAddress
    ? [
        props.shippingAddress.name,
        props.shippingAddress.line1,
        props.shippingAddress.line2,
        `${props.shippingAddress.city}, ${props.shippingAddress.state} ${props.shippingAddress.postalCode}`,
        props.shippingAddress.country,
      ].filter(Boolean)
    : ['No shipping address captured'];

  const html = await render(
    <Html>
      <Head />
      <Preview>New order: {props.productName} — {props.amountPaid}</Preview>

      <Tailwind>
        <Body style={{ backgroundColor: '#ffffff', margin: 0, padding: 0 }}>
          <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '0 16px' }}>

            {/* ── HEADER ── */}
            <Section style={{ textAlign: 'center', paddingTop: '32px', paddingBottom: '20px' }}>
              <Text style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '24px',
                fontWeight: 900,
                letterSpacing: '-0.5px',
                color: '#000000',
                margin: 0,
                textTransform: 'uppercase',
              }}>
                📦 NEW ORDER ALERT
              </Text>
              <Text style={{
                fontFamily: 'Courier New, monospace',
                fontSize: '11px',
                color: '#666666',
                marginTop: '4px',
                marginBottom: 0,
                letterSpacing: '2px',
              }}>
                {BRAND} · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </Section>

            {/* ── THICK DIVIDER ── */}
            <Section style={{ height: '4px', backgroundColor: '#000000', margin: '0 0 24px 0' }} />

            {/* ── ORDER SUMMARY BOX ── */}
            <Section style={{
              border: '3px solid #000000',
              padding: '0',
              margin: '0 0 24px 0',
            }}>
              {/* Black header bar */}
              <Section style={{
                backgroundColor: '#000000',
                padding: '12px 16px',
              }}>
                <Text style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  Order #{props.orderId.slice(-8).toUpperCase()}
                </Text>
              </Section>

              {/* Detail rows */}
              <Section style={{ padding: '16px' }}>
                {/* Product */}
                <Row style={{ marginBottom: '12px' }}>
                  <Column style={{ width: '35%', verticalAlign: 'top' }}>
                    <Text style={{
                      fontFamily: 'Courier New, monospace',
                      fontSize: '11px',
                      color: '#999999',
                      margin: 0,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}>
                      Product
                    </Text>
                  </Column>
                  <Column style={{ width: '65%' }}>
                    <Text style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#000000',
                      margin: 0,
                    }}>
                      {props.productName}
                    </Text>
                  </Column>
                </Row>

                <Section style={{ height: '1px', backgroundColor: '#eeeeee', margin: '0 0 12px 0' }} />

                {/* Quantity */}
                {props.quantity && props.quantity > 1 && (
                  <>
                    <Row style={{ marginBottom: '12px' }}>
                      <Column style={{ width: '35%', verticalAlign: 'top' }}>
                        <Text style={{
                          fontFamily: 'Courier New, monospace',
                          fontSize: '11px',
                          color: '#999999',
                          margin: 0,
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                        }}>
                          Quantity
                        </Text>
                      </Column>
                      <Column style={{ width: '65%' }}>
                        <Text style={{
                          fontFamily: 'Courier New, monospace',
                          fontSize: '15px',
                          color: '#333333',
                          margin: 0,
                        }}>
                          {props.quantity}
                        </Text>
                      </Column>
                    </Row>
                    <Section style={{ height: '1px', backgroundColor: '#eeeeee', margin: '0 0 12px 0' }} />
                  </>
                )}

                {/* Amount */}
                <Row style={{ marginBottom: '12px' }}>
                  <Column style={{ width: '35%', verticalAlign: 'top' }}>
                    <Text style={{
                      fontFamily: 'Courier New, monospace',
                      fontSize: '11px',
                      color: '#999999',
                      margin: 0,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}>
                      Amount
                    </Text>
                  </Column>
                  <Column style={{ width: '65%' }}>
                    <Text style={{
                      fontFamily: 'Courier New, monospace',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#000000',
                      margin: 0,
                    }}>
                      {props.amountPaid}
                    </Text>
                  </Column>
                </Row>
              </Section>
            </Section>

            {/* ── CUSTOMER DETAILS ── */}
            <Section style={{ margin: '0 0 24px 0' }}>
              <Text style={{
                fontFamily: 'Courier New, monospace',
                fontSize: '11px',
                color: '#999999',
                margin: '0 0 8px 0',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>
                Customer
              </Text>
              <Section style={{
                border: '1px solid #000000',
                padding: '16px',
              }}>
                <Text style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000000',
                  margin: '0 0 4px 0',
                }}>
                  {props.customerName || 'Name not provided'}
                </Text>
                <Text style={{
                  fontFamily: 'Courier New, monospace',
                  fontSize: '13px',
                  color: '#333333',
                  margin: 0,
                }}>
                  {props.customerEmail}
                </Text>
              </Section>
            </Section>

            {/* ── SHIPPING ADDRESS ── */}
            <Section style={{ margin: '0 0 24px 0' }}>
              <Text style={{
                fontFamily: 'Courier New, monospace',
                fontSize: '11px',
                color: '#999999',
                margin: '0 0 8px 0',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>
                Ship To
              </Text>
              <Section style={{
                border: '1px solid #000000',
                padding: '16px',
                backgroundColor: '#fafafa',
              }}>
                {addressLines.map((line, i) => (
                  <Text key={i} style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '14px',
                    color: '#333333',
                    margin: 0,
                    lineHeight: 1.6,
                  }}>
                    {line}
                  </Text>
                ))}
              </Section>
            </Section>

            {/* ── ACTION NOTE ── */}
            <Section style={{
              padding: '16px',
              borderLeft: '4px solid #000000',
              backgroundColor: '#fafafa',
              margin: '0 0 24px 0',
            }}>
              <Text style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '13px',
                color: '#333333',
                margin: 0,
                lineHeight: 1.5,
              }}>
                Time to pack it up and ship it out! 📬 Mark as shipped when it's in the mail.
              </Text>
            </Section>

            {/* ── DIVIDER ── */}
            <Section style={{ height: '2px', backgroundColor: '#000000', margin: '0 0 20px 0' }} />

            {/* ── FOOTER ── */}
            <Section style={{ paddingBottom: '32px', textAlign: 'center' }}>
              <Text style={{
                fontFamily: 'Courier New, monospace',
                fontSize: '10px',
                color: '#cccccc',
                margin: 0,
              }}>
                Order notification from {BRAND} · thebrainrotbooks.com
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>,
  );

  return { html, subject };
}
