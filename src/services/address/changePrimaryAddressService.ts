import mongoose from "mongoose";
import userModel from "../../model/userModel";
import { User } from "../../types/user";
import addressModel from "../../model/addressModel";
import { IAddress } from "../../types/adresses";



class ChangePrimaryAddressService {
    async execute(addressId: string, userId: string) {

        const user = await userModel.findById(userId) as User


        if (!user) {
            return { success: false, message: "User not found." };
        }


        const objectIdAddressId = new mongoose.Types.ObjectId(addressId);

        const allAdresses: IAddress[] = await addressModel.find({ userId })

        if (!allAdresses || allAdresses.length === 0) {
            return { success: false, message: "Address not found." };
        }

        const updatingToFalse = await addressModel.updateMany({ userId }, { isPrimary: false })

        if (!updatingToFalse) {
            throw new Error("Api error")
        }
        const updatePrimaryAddress = await addressModel.findByIdAndUpdate(objectIdAddressId, { isPrimary: true }, { new: true })

        if (!updatePrimaryAddress) {
            throw new Error("Api error")
        }

        return { success: true, message: "Primary address updated successfully." };


    }
}


export default ChangePrimaryAddressService;