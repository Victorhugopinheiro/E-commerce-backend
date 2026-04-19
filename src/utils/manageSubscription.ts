
export interface Subscription {
    subscriptionId: string;
    userId: string;
    createAction: boolean;
    deleteAction: boolean;
}

const manageSubscription = ({createAction, deleteAction, subscriptionId, userId}:Subscription) => {

}