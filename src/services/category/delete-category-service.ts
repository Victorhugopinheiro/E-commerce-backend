import categoriesModel from '../../model/categoriesModel';

class DeleteCategoryService {
    async execute(categoryId: string): Promise<{ success: boolean; message: string }> {
        try {

            if (!categoryId) {
                return { success: false, message: 'Category ID is required' };
            }

            const categoryExists = await categoriesModel.findById(categoryId);

            if (!categoryExists) {
                return { success: false, message: 'Categoria não encontrada' };
            }

            await categoriesModel.findByIdAndDelete(categoryId);

            return { success: true, message: 'Categoria deletada com sucesso' };
        } catch (err) {
            console.error(err);
            return { success: false, message: 'Erro no servidor' };
        }

    }
}

export default DeleteCategoryService;
