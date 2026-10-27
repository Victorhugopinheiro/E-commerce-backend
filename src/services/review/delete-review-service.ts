import reviewModel from '../../model/reviewModel';

class DeleteReviewService {
  async execute(reviewId: string): Promise<{ success: boolean; message: string }> {
    try {

      if (!reviewId) {
        return { success: false, message: 'Review ID is required' };
      }

      const reviewExists = await reviewModel.findById(reviewId);

      if (!reviewExists) {
        return { success: false, message: 'Avaliação não encontrada' };
      }

      await reviewModel.findByIdAndDelete(reviewId);

      return { success: true, message: 'Avaliação deletada com sucesso' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Erro no servidor' };
    }

  }
}

export default DeleteReviewService;
