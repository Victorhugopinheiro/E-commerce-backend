import { Request, Response } from 'express';
import DeleteReviewService from '../../services/review/delete-review-service';

class DeleteReviewController {
  async handle(req: Request, res: Response) {

    const { reviewId } = req.body;

    try {
      if (!reviewId) {
        return res.status(400).json({ success: false, message: 'ID da avaliação é obrigatório.' });
      }

      const deleteReviewService = new DeleteReviewService();
      const result = await deleteReviewService.execute(reviewId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    }
    catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  }
}

export default DeleteReviewController;
