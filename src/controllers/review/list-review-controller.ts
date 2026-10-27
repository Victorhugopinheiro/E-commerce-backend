import { Request, Response } from 'express';
import ListReviewService from '../../services/review/list-review-service';

class ListReviewController {
  async handle(req: Request, res: Response) {

    const { productId } = req.query;

    const newListReviewService = new ListReviewService();
    const reviews = await newListReviewService.execute({
      productId: typeof productId === 'string' ? productId : undefined,
    });

    return res.status(200).json({ success: true, message: 'Listagem de avaliações', reviews });
  }
}

export default ListReviewController;
