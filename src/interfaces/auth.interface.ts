import { Request } from 'express';
import { User } from '@interfaces/users.interface';
import { UserRole } from '@/enums/user-role.enum';

export interface DataStoredInToken {
  id: string;
  role: UserRole;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}
