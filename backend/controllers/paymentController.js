import Stripe from 'stripe';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const processPayment = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // amount in cents
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
  });

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

export { processPayment };