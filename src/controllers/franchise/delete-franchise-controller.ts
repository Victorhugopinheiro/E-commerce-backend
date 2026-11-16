import { Request, Response } from "express";
import DeleteFranchiseService from "../../services/franchise/delete-franchise-service";

class DeleteFranchiseController {
  async handle(req: Request, res: Response) {
    const { franchiseId } = req.body;

    try {
      if (!franchiseId) {
        return res
          .status(400)
          .json({ success: false, message: "ID da franquia é obrigatório." });
      }

      const deleteFranchiseService = new DeleteFranchiseService();
      const result = await deleteFranchiseService.execute(franchiseId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Erro no servidor" });
    }
  }
}

export default DeleteFranchiseController;
