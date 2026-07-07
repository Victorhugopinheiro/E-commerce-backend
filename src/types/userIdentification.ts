import { Document, Types } from "mongoose";


export interface UserIdentification extends Document {
    userId: Types.ObjectId;
    userCpf: string;
    firstName: string;
    lastName: string;
    createdAt?: Date;
    updatedAt?: Date;
}