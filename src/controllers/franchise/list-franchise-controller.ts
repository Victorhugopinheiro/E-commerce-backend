import { Request, Response } from "express";
import ListFranchiseService from "../../services/franchise/list-franchise-service";

class ListFranchiseController {
  async handle(request: Request, response: Response) {
    const newListFranchiseService = new ListFranchiseService();
    const franchises = await newListFranchiseService.execute();

    return response
      .status(200)
      .json({ success: true, message: "Listagem de franquias", franchises });
  }
}

export default ListFranchiseController;
