import mongoose from 'mongoose';


import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error('A variável de ambiente MONGODB_URI não está definida.');
        }

        mongoose.connection.on('connected', () => {
            console.log('Conectado ao MongoDB com sucesso!') });

        await mongoose.connect(`${uri}/ecommerce`);
        
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        process.exit(1); 
    }
};

export default connectDB;