
import productModel from "../../model/productModel";

interface ListProductFilters {
    category?: string[];
    subCategory?: string[];
}

class ListProductService {
    async execute(filters?: ListProductFilters) {

        try {
            const query: Record<string, any> = {};

            if (filters?.category && filters.category.length > 0) {
                query.category = { $in: filters.category };
            }

            if (filters?.subCategory && filters.subCategory.length > 0) {
                query.subCategory = { $in: filters.subCategory };
            }

    

            const findProdcuts = await productModel.find(query);
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