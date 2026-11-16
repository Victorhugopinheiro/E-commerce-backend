import franchiseModel from "../../model/franchiseModel";

class ListFranchiseService {
  async execute() {
    try {
      const franchises = await franchiseModel.find();
      return franchises;
    } catch (err) {
      console.error(err);
      return [];
    }
  }
}

export default ListFranchiseService;
