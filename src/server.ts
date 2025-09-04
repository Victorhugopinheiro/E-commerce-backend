
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/mongodb';
import { setupCloudinary } from './config/cloudinary';



const app = express();
app.use(cors());

connectDB();
setupCloudinary();




const PORT = process.env.PORT || 3000;


app.use(express.json());


app.get('/', (req, res) => {
  res.send('Servidor do E-commerce rodando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});