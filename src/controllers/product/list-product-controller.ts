
import { Request, Response } from 'express';
import ListProductService from '../../services/product/list-product-service';


class ListProductController {
    async handle(request: Request, response: Response) {

        const newListProductService = new ListProductService();
        const resultNewListProductService = await newListProductService.execute();

        return response.status(200).json({ success: true, message: 'Listagem de produtos', products: resultNewListProductService });

    }
}

export default ListProductController;
