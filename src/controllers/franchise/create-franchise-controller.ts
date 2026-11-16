import { Request, Response } from "express";
import CreateFranchiseService from "../../services/franchise/create-franchise-service";

class CreateFranchiseController {
  async handle(req: Request, res: Response) {
    try {
      const { type } = req.body;

      if (!type) {
        return res
          .status(400)
          .json({ success: false, message: "O campo type é obrigatório" });
      }

      const newFranchiseService = new CreateFranchiseService();
      await newFranchiseService.execute({ type });

      res.json({ success: true, message: "Franquia adicionada com sucesso" });
    } catch (error) {
      console.error("Error adding franchise:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Erro interno ao adicionar franquia",
        });
    }
  }
}

export default CreateFranchiseController;
