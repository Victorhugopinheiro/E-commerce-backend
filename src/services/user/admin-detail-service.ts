
import userModel from "../../model/userModel";



class AdminDetailService {
    async execute(userId: string) {
        if (!userId) {
            throw new Error('User ID not found in admin request');
        }


        const userAdmin = await userModel.findById(userId);


        if (!userAdmin) {
            throw new Error('Admin user not found');
        }


        return userAdmin;

    }
}

export default AdminDetailService;