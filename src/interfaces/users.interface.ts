import { UserRole } from "@/enums/user-role.enum";
import { UserType } from "@/enums/usertype.enum";

export interface User {
  _id: string;
  id: string;
  sequence: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  imageUrl: string;
  socialSignIn: boolean;
  isFirstLogin: boolean;
  verificationToken: string;
  isVerified: boolean;
  hasTemporaryPassword: boolean;
  userType: UserType;
  role: UserRole;
}
