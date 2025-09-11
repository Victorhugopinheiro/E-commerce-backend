
import productModel from '../../model/productModel';

class DetailProductService {
    async execute(productId: string) {
        try {
            if (!productId) {
                return { success: false, message: 'Product ID é obrigatório' };
            }


          const response = await productModel.findById(productId);

        

            return { success: true, message: 'Produto encontrado com sucesso', product: response };
        } catch (err) {
            console.error(err);
            return { success: false, message: 'Erro no servidor' };
        }
    }
}

export default DetailProductService;