import mongoose from "mongoose";
import connectDB from "../config/mongodb";
import productModel from "../model/productModel";

async function backfillGtaFranchise() {
  await connectDB();

  const result = await productModel.updateMany(
    { category: "GTAIV" },
    { $set: { franchise: "GTA VI" } }
  );

  console.log(
    `Preenchimento GTA VI concluído. Encontrados: ${result.matchedCount}. Atualizados: ${result.modifiedCount}.`
  );

  await mongoose.disconnect();
}

backfillGtaFranchise().catch((error: unknown) => {
  console.error("Falha no preenchimento da franquia GTA VI.", error);
  void mongoose.disconnect().finally(() => process.exit(1));
});
