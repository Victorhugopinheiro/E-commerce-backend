import mongoose from 'mongoose';
import productModel from '../../model/productModel';
import reviewModel from '../../model/reviewModel';

interface ReviewProps {
  productId: string;
  message: string;
  platform: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

class CreateReviewService {
  async execute({ productId, message, platform, mediaUrl, mediaType }: ReviewProps) {

    try {

      if (!productId || !message || !platform) {
        throw new Error('Todos os campos são obrigatórios');
      }

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Id do produto inválido');
      }

      const productExists = await productModel.findById(productId);

      if (!productExists) {
        throw new Error('Produto não encontrado');
      }

      const review = {
        productId,
        message,
        platform,
        mediaUrl,
        mediaType
      };

      const newReview = new reviewModel(review);
      await newReview.save();

      return { success: true, message: 'Avaliação adicionada com sucesso' };

    } catch (err) {

      throw new Error('Erro ao adicionar avaliação');
    }

  }

}

export default CreateReviewService;
