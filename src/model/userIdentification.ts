import mongoose from "mongoose";


const userIdentificationSchema = new mongoose.Schema({
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
})

const userIdentificationModel = mongoose.models.userIdentification || mongoose.model('userIdentification', userIdentificationSchema);

export default userIdentificationModel;