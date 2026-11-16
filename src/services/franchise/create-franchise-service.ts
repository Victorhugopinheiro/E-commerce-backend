import franchiseModel from "../../model/franchiseModel";

interface FranchiseProps {
  type: string;
}

class CreateFranchiseService {
  async execute({ type }: FranchiseProps) {
    try {
      if (!type) {
        throw new Error("O campo type é obrigatório");
      }

      const franchiseExists = await franchiseModel.findOne({ type });

      if (franchiseExists) {
        throw new Error("Franquia já existe");
      }

      const newFranchise = new franchiseModel({ type });
      await newFranchise.save();

      return { success: true, message: "Franquia adicionada com sucesso" };
    } catch (err) {
      throw new Error("Erro ao adicionar franquia");
    }
  }
}

export default CreateFranchiseService;
