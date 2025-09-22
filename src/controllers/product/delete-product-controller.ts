import { Request, Response } from 'express';
import DeleteProductService from '../../services/product/delete-product-service';



class DeleteProductController {
    async handle(req: Request, res: Response) {

        const { productId } = req.body;
        // Lógica para deletar o produto com o ID fornecido

        if (!productId) {
            return res.status(400).json({ success: false, message: 'ID do produto é obrigatório.' });
        }




        const deleteProductService = new DeleteProductService();
        const result = await deleteProductService.execute(productId);

        return res.status(200).json({ success: true, message: `Produto Deletado` });
    }
}


export default DeleteProductController;