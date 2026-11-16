import { Request, Response } from "express";
import HomeShowcaseService from "../../services/product/home-showcase-service";

class HomeShowcaseController {
  async handle(_request: Request, response: Response) {
    try {
      const showcase = await new HomeShowcaseService().execute();
      return response.status(200).json({ success: true, ...showcase });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ success: false });
    }
  }
}

export default HomeShowcaseController;
