import categoriesModel from '../../model/categoriesModel';

interface CategoryProps {
    type: string;
    image: string;
}

class CreateCategoryService {
    async execute({ type, image }: CategoryProps) {

        try {

            if (!type) {
                throw new Error('O campo type é obrigatório');
            }

            if (!image) {
                throw new Error('O campo image é obrigatório');
            }

            const categoryExists = await categoriesModel.findOne({ type });
            
            if (categoryExists) {
                throw new Error('Categoria já existe');
            }

            const newCategory = new categoriesModel({ type, image });
            await newCategory.save();

            return { success: true, message: 'Categoria adicionada com sucesso' };

        } catch (err) {

            throw new Error('Erro ao adicionar categoria');
        }

    }

}

export default CreateCategoryService;
