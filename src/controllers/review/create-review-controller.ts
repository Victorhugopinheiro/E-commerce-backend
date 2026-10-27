import { Request, Response } from 'express';
import { cloudinary } from '../../config/cloudinary';
import CreateReviewService from '../../services/review/create-review-service';

class CreateReviewController {
    async handle(req: Request, res: Response) {

        try {
            const { productId, message, platform } = req.body;
            const mediaFile = req.file;

            let mediaUrl: string | undefined;
            let mediaType: 'image' | 'video' | undefined;

            if (mediaFile) {
                mediaType = mediaFile.mimetype.startsWith('video') ? 'video' : 'image';

                const result = await cloudinary.uploader.upload(mediaFile.path, { resource_type: mediaType });

                mediaUrl = result.secure_url;
            }

            const newReviewService = new CreateReviewService();
            await newReviewService.execute({ productId, message, platform, mediaUrl, mediaType });

            res.json({ success: true, message: 'Avaliação adicionada com sucesso' });

        } catch (error) {
            console.error('Error adding review:', error);
            return res.status(500).json({ success: false, message: 'Erro interno ao adicionar avaliação' });
        }
    }
}

export default CreateReviewController;
