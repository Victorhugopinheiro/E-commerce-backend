import { Request, Response } from 'express';
import DeleteCategoryService from '../../services/category/delete-category-service';

class DeleteCategoryController {
    async handle(req: Request, res: Response) {

        const { categoryId } = req.body;

        try {
            if (!categoryId) {
                return res.status(400).json({ success: false, message: 'ID da categoria é obrigatório.' });
            }

            const deleteCategoryService = new DeleteCategoryService();
            const result = await deleteCategoryService.execute(categoryId);

            if (!result.success) {
                return res.status(404).json(result);
            }

            return res.status(200).json(result);
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Erro no servidor' });
        }
    }
}

export default DeleteCategoryController;
