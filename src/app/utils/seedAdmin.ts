import { IAuthProvider, IUser, UserRole, isActive } from './../modules/user/user.interface';
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import { Wallet } from "../modules/wallet/wallet.model"; // Import Wallet model
import bcryptjs from "bcryptjs";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL });
    if (isSuperAdminExist) {
      console.log("Super Admin already exists");
      return;
    }
    const hashedPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUNDS));

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: envVars.SUPER_ADMIN_EMAIL,
    }

    const payload: IUser = {
        name: "Super Admin",
        email: envVars.SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        isVerified: true,
        isActive: isActive.ACTIVE, // Added isActive field
        auths: [authProvider]
    }

    const superAdmin = await User.create(payload);

    // Create wallet for the Super Admin
    await Wallet.create({
      user: superAdmin._id,
      balance: Number(envVars.INITIAL_BALANCE),
    });

    console.log("Super Admin created successfully", superAdmin);
  } catch (error) {
    console.error("Error seeding Super Admin:", error);
  }
};