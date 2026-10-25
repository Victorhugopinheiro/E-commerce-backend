import mongoose from 'mongoose';



const categoriesModel = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
})

export default mongoose.models.categories || mongoose.model('categories', categoriesModel);