import { Request, Response } from "express";
import asaasWebhookService from "../../services/api/asaasWebhookService";

export class AsaasWebhookController {

    async handle(request: Request, response: Response) {


        try {

            const body = request.body;
            const payment = body.payment;

            const headersSignature = request.headers["asaas-access-token"] as string;

            const asaasWebhookSecret = process.env.ASAAS_WEBHOOK_SECRET;

            if (!asaasWebhookSecret || !headersSignature || headersSignature !== asaasWebhookSecret) {
                console.error("Invalid webhook signature");
                return response.status(400).send("Invalid webhook signature");
            }

            console.log("Received webhook event:", body);

            const serviceWebhook = new asaasWebhookService();
            const responseService = await serviceWebhook.execute({ checkoutSessionId: payment.checkoutSession, customerId: payment.customer, event: body.event, eventId: body.id });


            return response.json({
                received: true
            });

        } catch (error) {
            console.error('Erro ao processar webhook do Asaas:', error);
            return response.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        }


    }
}


export default AsaasWebhookController;