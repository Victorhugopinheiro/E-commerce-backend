import mongoose from "mongoose";

const userIdentificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    userCpf:{
        type: String,
        required: true,
        unique: true,
        sparse: true
    },
    firstName: {
        type: String,
        required: true
    },
    secondName: {
        type: String,
        required: true
    }
})

const userIdentificationModel = mongoose.models.userIdentification || mongoose.model('userIdentification', userIdentificationSchema);
export default userIdentificationModel;