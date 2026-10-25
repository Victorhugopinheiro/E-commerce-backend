import { Request, Response } from 'express';
import ListCategoryService from '../../services/category/list-category-service';

class ListCategoryController {
    async handle(request: Request, response: Response) {

        const newListCategoryService = new ListCategoryService();
        const categories = await newListCategoryService.execute();

        return response.status(200).json({ success: true, message: 'Listagem de categorias', categories });
    }
}

export default ListCategoryController;
