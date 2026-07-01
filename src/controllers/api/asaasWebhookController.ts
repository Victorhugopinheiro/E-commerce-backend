import { Request, Response } from "express";


export class AsaasWebhookController {

    async handle(request: Request, response: Response) {


        const body = request.body;
        const payment = body.payment;
       
        const headersSignature = request.headers["asaas-access-token"] as string;

        const asaasWebhookSecret = process.env.ASAAS_WEBHOOK_SECRET;

        if(!asaasWebhookSecret || !headersSignature || headersSignature !== asaasWebhookSecret) {
            console.error("Invalid webhook signature");
            return response.status(400).send("Invalid webhook signature");
        }



        switch (body.event) {

            case 'PAYMENT_CREATED':
                
                break;

            case 'PAYMENT_RECEIVED':
              
                break;

            default:
                break;
        }

        return response.json({
            received: true
        });


    }
}


export default AsaasWebhookController;