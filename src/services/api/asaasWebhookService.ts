import orderModel from "../../model/orderModel";
import asaasProcessedWebhooksModel from "../../model/asaas_processed_webhooksModel";

interface AsaasWebhookPayload {
    eventId: string;
    event: string;
    customerId: string;
    checkoutSessionId: string;
}



class AsaasWebhookService {
    async execute({ checkoutSessionId, customerId, event, eventId }: AsaasWebhookPayload) {

        const order = await orderModel.findOne({ checkoutId: checkoutSessionId });

        if (!order) {
            throw new Error('Pedido não encontrado para o checkoutId fornecido.');
        }

        try {
            await asaasProcessedWebhooksModel.create({
                userId: order.userId,
                eventId: eventId,
            });

        } catch (error: any) {
            if (error?.code === 11000) {
                return {
                    success: true,
                    message: "Webhook already processed",
                };
            }

            throw new Error(`Erro ao processar o webhook: ${error.message}`);
        }


        switch (event) {
            case 'PAYMENT_CREATED':
                if (order.paymentStatus !== "pending") {
                    return {
                        success: true,
                        message: "Webhook ignored, order already pending",
                    };
                }
                order.status = 'pending';
                order.paymentStatus = 'pending';
                await order.save();
                break;
            case 'PAYMENT_CONFIRMED':
                if (order.paymentStatus === "paid") {
                    return {
                        success: true,
                        message: "Webhook ignored, order already paid",
                    };
                }
                order.status = 'confirmed';
                order.paymentStatus = 'paid';
                await order.save();
                break;
            case 'PAYMENT_FAILED':
                if (order.paymentStatus === "failed") {
                    return {
                        success: true,
                        message: "Webhook ignored, order already refunded",
                    };
                }
                order.status = 'cancelled';
                order.paymentStatus = 'failed';

                await order.save();
                break;
            case 'PAYMENT_REFUNDED':
                if (order.paymentStatus === "refunded") {
                    return {
                        success: true,
                        message: "Webhook ignored, order already refunded",
                    };
                }
                order.status = 'cancelled';
                order.paymentStatus = 'refunded';
                await order.save();
                break;
            default:
                throw new Error(`Evento desconhecido: ${event}`);
        }

    }
}

export default AsaasWebhookService;