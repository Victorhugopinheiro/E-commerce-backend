import Stripe from "stripe";
import { manageSubscription } from "../../utils/manageSubscription";

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
                const session = event.data.object as Stripe.Checkout.Session;

               const response = await manageSubscription(
                {createAction: true, refoundAction: false, sessionId: event.data.object.id, userId: session.customer as string});
                



            case "charge.refunded":
                const charge = event.data.object as Stripe.Charge;

                const refundResponse = await manageSubscription(
                    {createAction: false, refoundAction: true, sessionId: charge.id, userId: charge.customer as string}
                );

                return { success: true, message: 'Refound succeeded' };



            default:
                return { success: false, message: 'Unhandled webhook event' };

        }

    }
}

export default WebhookService;