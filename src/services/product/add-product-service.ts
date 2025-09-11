
import productModel from '../../model/productModel';

interface ProductProps {
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory: string;
  sizes: string[];
  bestseller: boolean;
  image: string[];
  date: number;
}


class AddProductService {
  async execute({ name, description, price, category, subCategory, sizes, bestseller, image, date }: ProductProps) {

    try {

      if (!name || !description || !price || !category || !subCategory || !sizes || sizes.length === 0 || !image || image.length === 0) {
        return { success: false, message: 'Está faltando informações sobre o produto' };
      }


      const product: ProductProps = {
        name,
        description,
        price,
        image,
        category,
        subCategory,
        sizes,
        bestseller: bestseller || false,
        date
      }


      const newProduct = new productModel(product);
      await newProduct.save();

      return { success: true, message: 'Produto adicionado com sucesso' }


    } catch (err) {
      console.error(err);
      return { success: false, message: 'Erro no servidor' };
    }

  }

}


export default AddProductService;