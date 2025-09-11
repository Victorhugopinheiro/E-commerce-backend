import { Request, Response } from 'express';
import { cloudinary } from '../../config/cloudinary';
import AddProductService from '../../services/product/add-product-service';


class AddProductController {
    async handle(req: Request, res: Response) {

        try {
            const { name, description, price, category, subCategory, sizes, bestSellers } = req.body;

            const image1 = req.files && (req.files as any).image1 ? (req.files as any).image1[0] : null;
            const image2 = req.files && (req.files as any).image2 ? (req.files as any).image2[0] : null;
            const image3 = req.files && (req.files as any).image3 ? (req.files as any).image3[0] : null;
            const image4 = req.files && (req.files as any).image4 ? (req.files as any).image4[0] : null;




            const images = [image1, image2, image3, image4].filter(img => img !== null);

            let imagesUrl = await Promise.all(
                images.map(async (img) => {
                    let result = await cloudinary.uploader.upload(img.path, { resource_type: "image" })

                    return result.secure_url
                })
            )


            const newProductService = new AddProductService();
            const resultNewProductService = await newProductService.execute({
                name,
                description,
                price: parseFloat(price),
                category,
                subCategory,
                sizes: JSON.parse(sizes),
                bestseller: bestSellers === 'true',
                image: imagesUrl,
                date: Date.now()
            })


            res.json({ success: true, message: 'Produto adicionado com sucesso' });




        } catch (error) {
            console.error('Error adding product:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });

        }
    }
}


export default AddProductController;
