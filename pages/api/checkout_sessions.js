import { stripe } from '../../lib/stripe'

export default async function handler(req, res) {
  const allowedOrigins = [
    'https://grademelon.org',
    'https://www.grademelon.org',
    process.env.NEXT_PUBLIC_BASE_URL,
  ].filter(Boolean)

  const requestOrigin = req.headers.origin
  const corsOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0]

  res.setHeader('Access-Control-Allow-Origin', corsOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const { price, district, username,specialOrigin } = req.body || {}
    const origin = specialOrigin || req.headers.origin || process.env.NEXT_PUBLIC_BASE_URL || 'https://grademelon.org'
    let session

    if (price) {
      // ---- Monthly custom-amount donation ----
      const amount = Math.round(Number(price) * 100)

      if (isNaN(amount) || amount < 100) {
        return res.status(400).json({ error: 'Invalid price' })
      }

      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        metadata: {
          district: district || '',
          username: username || '',
          type: 'subscription',
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Monthly Donation',
                images: ['https://grademelon.org/assets/logo.png'],
              },
              recurring: {
                interval: 'month',
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/grades?session_id2={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/grades`,
      })
    } else {
      // ---- Existing one-time donation ----
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        metadata: {
          district: district || '',
          username: username || '',
          type: 'single',
        },
        line_items: [
          {
            price: process.env.NODE_ENV == "development" ? 'price_1SyPjlFde5fK0JnrASUJF3eE' : 'price_1SyfOvFlbEXEUnKR4vlKUIWB',
            quantity: 1,
          },
        ],
        success_url: `${origin}/grades?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/grades`,
      })
    }

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error(err)
    res.status(err.statusCode || 500).json({ error: err.message })
  }
}
