import mongoose from "mongoose";
import userModel from "../../model/userModel";
import { User } from "../../types/user";




class ChangePrimaryAddressService {
    async execute(addressId: string, userId: string) {

        const user = await userModel.findById(userId) as User



        if (!user) {
            return { success: false, message: "User not found." };
        }





        const objectIdAddressId = new mongoose.Types.ObjectId(addressId);

        const userAddresses = user.addresses;

        const userAddressesCopy = Array.isArray(user.addresses) ? [...userAddresses!] : []

        const addressIndex = userAddressesCopy.findIndex((items) => items._id?.toString() === objectIdAddressId.toString())

        if (addressIndex !== -1) {

            userAddressesCopy.forEach((address) => {
                address.isPrimary = false
            })
            
            userAddressesCopy[addressIndex].isPrimary = userAddressesCopy[addressIndex].isPrimary = true
        }


        const updatingAddressPrimary = await userModel.findByIdAndUpdate(userId, { addresses: userAddressesCopy }, { new: true })

        if (!updatingAddressPrimary) {
            throw new Error("Api error")
        }


        return { success: true, message: "Primary address updated successfully." };


    }
}


export default ChangePrimaryAddressService;