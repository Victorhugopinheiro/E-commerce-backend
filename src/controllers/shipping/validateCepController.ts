import { Request, Response } from "express";
import ValidateCepService from "../../services/shipping/ValidateCepService";
import CepValidator from "../../utils/cepValidator";
import { priceOrderItems } from "../../services/product/resolve-purchase-line";
import { quoteStoreBox } from "../../services/shipping/quote-shipping";
import { pickShippingOptions } from "../../services/shipping/pick-shipping-options";

class ValidateCepController {
  async handle(req: Request, res: Response) {
    try {
      const { cep, items } = req.body ?? {};

      if (!cep) {
        return res
          .status(400)
          .json({ success: false, message: "CEP é obrigatório" });
      }

      const cepValidator = new CepValidator();
      if (!cepValidator.isValidFormat(cep)) {
        return res.status(400).json({
          success: false,
          message: "CEP inválido. O formato deve ser XXXXX-XXX ou XXXXXXXX.",
        });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Items são obrigatórios" });
      }

      const validateCepService = new ValidateCepService();
      const address = await validateCepService.execute(cep);
      const priced = await priceOrderItems(items);

      if (!priced.ok) {
        return res
          .status(400)
          .json({ success: false, message: priced.message });
      }

      let shipping: ReturnType<typeof pickShippingOptions> = [];
      try {
        const quotes = await quoteStoreBox(address.zipCode, priced.total);
        shipping = pickShippingOptions(quotes);
      } catch (error) {
        console.error(error);
        shipping = [];
      }

      return res.status(200).json({
        success: true,
        message: "CEP válido",
        data: {
          street: address.street,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          ibgeCode: address.ibgeCode,
          shipping,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao validar o CEP";
      const status = message === "CEP não encontrado." ? 400 : 500;
      return res.status(status).json({ success: false, message });
    }
  }
}

export default ValidateCepController;
