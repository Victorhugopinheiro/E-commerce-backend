import { stripe } from "../lib/stripe";
import orderModel from "../model/orderModel";
import userModel from "../model/userModel";

export interface Subscription {
    sessionId: string;
    userId: string;
    createAction: boolean;
    refoundAction: boolean;
}

export const manageSubscription = async ({ createAction, refoundAction, sessionId, userId }: Subscription) => {

    const user = userModel.findById(userId);

    if (!user) {
        throw new Error('Usuário não encontrado.');
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items'],
    });
    const metadata = checkoutSession.metadata;
    const orderId = metadata?.orderId;

    if(createAction){
        
        const changingOrder = await orderModel.findOneAndUpdate
        ({_id: orderId}, { status: 'paid' }, { new: true });

    }else if(refoundAction){
        await orderModel.findOneAndUpdate({_id:orderId}, {status: 'refunded'}, {new: true});
    }




    return checkoutSession

   


}