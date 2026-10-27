import mongoose from 'mongoose';
import reviewModel from '../../model/reviewModel';

interface ListReviewFilters {
  productId?: string;
}

class ListReviewService {
  async execute(filters?: ListReviewFilters) {

    try {
      const query: Record<string, any> = {};

      if (filters?.productId && mongoose.Types.ObjectId.isValid(filters.productId)) {
        query.productId = filters.productId;
      }

      const reviews = await reviewModel
        .find(query)
        .populate('productId', 'name image')
        .sort({ createdAt: -1 });

      return reviews;
    } catch (err) {
      console.error(err);
      return [];
    }
  }
}

export default ListReviewService;
