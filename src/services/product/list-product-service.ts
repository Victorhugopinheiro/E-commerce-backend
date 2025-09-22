
import productModel from "../../model/productModel";


class ListProductService {
    async execute() {


        try {
            const findProdcuts = productModel.find();
            if (findProdcuts) {
                return findProdcuts;
            }
            return [];
        } catch (err) {
            console.error(err);
            return [];
        }
    }
}

export default ListProductService;