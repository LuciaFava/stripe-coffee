// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Stripe from 'stripe';
import { STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET } from '../../config';
import {buffer} from 'micro';

const stripe = new Stripe(STRIPE_API_KEY, {
  apiVersion: '2022-08-01',
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }
  
  const signature = req.headers["stripe-signature"]

  if(!signature) {
    return res.status(400).json({ message: "Missing signature"})
  }

  let event = Stripe.Event;
  const buf = await buffer(req);

  try {
    event = stripe.webhooks.constructEvent(
      buf, 
      signature,
      STRIPE_WEBHOOK_SECRET
    )
  } catch (e) {
    console.error("Invalid signature" + e)
    return res.status(400).json({ message: "Invalid signature"});
  }

  if (event.type !== "checkout.session.completed") {
    return res.status(400).json({ message: "Invalid event type"});
  }

  return res.status(200).json({ message: 'Success'});
}
