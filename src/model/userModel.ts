import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    cartData: {
        type: Object,
        default: {}
    },
    stripeCustomerId: {
        type: String,
        unique: true,
        sparse: true
    },
    asaasCustomerId: {
        type: String,
        unique: true,
        sparse: true
    },
    addresses: {
        type: [{
            street: String,
            number:String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
            phone: String,
            ibgeCode: String,
            isPrimary: {
                type: Boolean,
                default: false
            }

        }],
        default: []
    },
    cpf: {
        type: String,
        unique: true,
        sparse: true
    }

}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;