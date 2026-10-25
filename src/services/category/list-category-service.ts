import categoriesModel from '../../model/categoriesModel';

class ListCategoryService {
    async execute() {

        try {
            const categories = await categoriesModel.find();
            return categories;
        } catch (err) {
            console.error(err);
            return [];
        }
    }
}

export default ListCategoryService;
