import Stripe from "stripe";

export type StripeEventType =
  | 'checkout.session.completed'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'charge.refunded'
  | 'customer.subscription.created'
  | 'customer.subscription.deleted'
  | 'customer.subscription.updated';


interface WebhookHandler {
  event: Stripe.Event;
  stripe?: Stripe;
}

export class WebhookService {
    async execute({ event, stripe }: WebhookHandler ) {

        switch (event.type) {
            case "checkout.session.completed":
                return { success: true, message: 'Checkout completed' };



            case "payment_intent.succeeded":
                return { success: true, message: 'Payment succeeded' };



            default:
                return { success: false, message: 'Unhandled webhook event' };

        }

    }
}

export default WebhookService;