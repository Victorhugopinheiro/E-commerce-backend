import { Request, Response } from 'express';
import { cloudinary } from '../../config/cloudinary';
import CreateCategoryService from '../../services/category/create-category-service';

class CreateCategoryController {
    async handle(req: Request, res: Response) {

        try {
            const { type } = req.body;
            const imageFile = req.file;

            if (!imageFile) {
                return res.status(400).json({ success: false, message: 'Imagem é obrigatória' });
            }

            const result = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });

            const newCategoryService = new CreateCategoryService();
            await newCategoryService.execute({ type, image: result.secure_url });

            res.json({ success: true, message: 'Categoria adicionada com sucesso' });

        } catch (error) {
            console.error('Error adding category:', error);
            return res.status(500).json({ success: false, message: 'Erro interno ao adicionar categoria' });
        }
    }
}

export default CreateCategoryController;
