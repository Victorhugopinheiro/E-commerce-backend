import mongoose, {Model} from "mongoose";
import { UserIdentification } from "../types/userIdentification";


const userIdentificationSchema = new mongoose.Schema<UserIdentification>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    userCpf: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true

    }
}, { timestamps: true });

const userIdentificationModel: Model<UserIdentification> = mongoose.models.userIdentification || mongoose.model<UserIdentification>('userIdentification', userIdentificationSchema);

export default userIdentificationModel;