import { Request } from 'express';
import multer from 'multer';
import path from 'path';

// Configuração do diskStorage
const storage = multer.diskStorage({
 
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {

    cb(null, 'uploads/');
  },
  
  
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
  
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  
    const fileExtension = path.extname(file.originalname);
    

    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  }
});


export const upload = multer({ storage: storage });