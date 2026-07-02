import { Types } from 'mongoose';

export interface IAddress {
    _id?: Types.ObjectId;
    userId: Types.ObjectId;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    isPrimary: boolean;
    number: string;
    ibgeCode?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
