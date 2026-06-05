import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import WebhookService from "../../services/api/webhookService";



export class WebhookController {

    async handle(req: any, res: any) {


        const payload = req.body;
        const sig = req.headers['stripe-signature'];

        let event: Stripe.Event;
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

        try {
            event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err}`);
        }

        const webhookService = new WebhookService();
        const result = await webhookService.execute({ event });

       res.status(200).json({ received: true });



    }

}

export default WebhookController;