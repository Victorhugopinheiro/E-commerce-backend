
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/mongodb';
import { setupCloudinary } from './config/cloudinary';
import apiRouter from './routes'; // Importa o roteador principal
var cookieParser = require('cookie-parser')



const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5001', ],
  credentials: true,
}));

connectDB();
setupCloudinary();

app.use(cookieParser())

//app.use(express.urlencoded({ extended: true }));


const PORT = process.env.PORT || 3000;



app.use((req, res, next) => {
  if (req.path.includes('/api/webhook/call')) {
    return next();
  }
  express.json()(req, res, next);
});


app.use('/api', apiRouter);

app.get('/teste', (req, res) => {
  // Access unsigned cookies
  console.log('Cookies: ', req.cookies);
});

app.get('/', (req, res) => {
  res.send('Servidor do E-commerce rodando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});