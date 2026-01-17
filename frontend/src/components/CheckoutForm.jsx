import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const CheckoutForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // UPDATED AXIOS: Added { withCredentials: true } to send the login token
      const { data } = await axios.post(
        'http://localhost:5000/api/payment/process', 
        { amount }, 
        { withCredentials: true } 
      );
      
      const clientSecret = data.client_secret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          onSuccess(result.paymentIntent);
        }
      }
    } catch (error) {
      const message = error.response && error.response.data.message 
                      ? error.response.data.message 
                      : error.message;
      toast.error(`Payment Error: ${message}`);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='p-3 border rounded mb-3 bg-light'>
        <CardElement options={{
          style: {
            base: { fontSize: '16px', color: '#32325d' },
          }
        }} />
      </div>
      <Button 
        type='submit' 
        variant='primary' 
        className='w-100' 
        disabled={!stripe || loading}
      >
        {loading ? 'Processing...' : `Pay $${amount}`}
      </Button>
    </form>
  );
};

export default CheckoutForm;