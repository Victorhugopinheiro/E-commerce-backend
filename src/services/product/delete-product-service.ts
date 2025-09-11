import productModel from "../../model/productModel";


class DeleteProductService {
    async execute(productId: string): Promise<{ success: boolean; message: string }> {
        try {

            if (!productId) {
                return { success: false, message: 'Product ID is required' };
            }

            const response = await productModel.findByIdAndDelete(productId);



            return { success: true, message: 'Produto deletado com sucesso' };
        } catch (err) {
            console.error(err);
            return { success: false, message: 'Erro no servidor' };
        }

    }
}


export default DeleteProductService;