import franchiseModel from "../../model/franchiseModel";

class DeleteFranchiseService {
  async execute(
    franchiseId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!franchiseId) {
        return { success: false, message: "Franchise ID is required" };
      }

      const franchiseExists = await franchiseModel.findById(franchiseId);

      if (!franchiseExists) {
        return { success: false, message: "Franquia não encontrada" };
      }

      await franchiseModel.findByIdAndDelete(franchiseId);

      return { success: true, message: "Franquia deletada com sucesso" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Erro no servidor" };
    }
  }
}

export default DeleteFranchiseService;
