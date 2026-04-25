import { stripe } from '../../../lib/stripe'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function getRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  let event

  try {
    const rawBody = await getRawBody(req)
    const signature = req.headers['stripe-signature']
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    if (session.payment_status === 'paid') {
      const { district, username, type } = session.metadata || {}

      if (district && username && type) {
        try {
          const suppressResponse = await fetch(
            'https://studentvuelibtest.up.railway.app/suppress',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: district, username, type }),
            }
          )

          if (!suppressResponse.ok) {
            console.error(`Suppress call failed with status ${suppressResponse.status}`)
          }
        } catch (err) {
          console.error(`Failed to call suppress endpoint: ${err.message}`)
        }
      } else {
        console.warn('checkout.session.completed missing metadata:', session.metadata)
      }
    }
  }

  res.status(200).json({ received: true })
}
