import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import WebhookService from "../../services/api/webhookService";
import AsaasWebhookService from "../../services/api/asaasWebhookService";



export class WebhookController {

    async handle(req: any, res: any) {


        const payload = req.body;


        try {

            const asaasService = new AsaasWebhookService();
            const response = await asaasService.execute();




        } catch (err) {
            console.error('Error processing webhook:', err);
            return res.status(400).send(`Webhook Error: ${err}`);
        }



    }

}

export default WebhookController;