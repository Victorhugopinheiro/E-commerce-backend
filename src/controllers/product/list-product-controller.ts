
import { Request, Response } from 'express';
import ListProductService from '../../services/product/list-product-service';

// Accepts a single value ("Men") or a comma-separated list ("Men,Women") from the query string.
function parseFilterParam(value: unknown): string[] | undefined {
    if (!value) return undefined;

    const values = Array.isArray(value) ? value : String(value).split(',');
    const parsed = values.map((v) => String(v).trim()).filter((v) => v.length > 0);

    return parsed.length > 0 ? parsed : undefined;
}

class ListProductController {
    async handle(request: Request, response: Response) {

        const category = parseFilterParam(request.query.category);
        const subCategory = parseFilterParam(request.query.subCategory);

        const newListProductService = new ListProductService();
        const resultNewListProductService = await newListProductService.execute({ category, subCategory });

        return response.status(200).json({ success: true, message: 'Listagem de produtos', products: resultNewListProductService });

    }
}

export default ListProductController;
