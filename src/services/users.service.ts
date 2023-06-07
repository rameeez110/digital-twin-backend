import { hash } from 'bcrypt';
import { RegisterUserDto, UpdateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import { isEmpty } from '@utils/util';
import { Types } from 'mongoose';
import { UserType } from '@/enums/usertype.enum';
import { UserRole } from '@/enums/user-role.enum';

class UserService {
  public users = userModel;

  public async getAllUsers(role: UserRole, currentUserId: string): Promise<User[]> {
    if (role !== UserRole.SUPER_ADMIN)
      throw new HttpException(403, `You don't have the access to this API`);

    const users = await this.users.find(
      { isVerified: true, _id: { $ne: new Types.ObjectId(currentUserId) } },
      { password: 0, verificationToken: 0 }
    );
    return users.map((user) => user.toJSON()) as User[];
  }

  public async searchUsers(query: string, _id: string): Promise<User[]> {
    const users = await this.users.find(
      {
        $or: [
          { firstName: new RegExp(query, 'i') },
          { lastName: new RegExp(query, 'i') },
        ],
        _id: { $ne: new Types.ObjectId(_id) },
        isVerified: true,
      },
      { password: 0, verificationToken: 0 }
    );
    return users.map((user) => user.toJSON()) as User[];
  }

  public async findUserById(userId: string): Promise<User> {
    if (isEmpty(userId))
      throw new HttpException(400, 'User Id is missing or invalid');

    const findUser = await this.users.findOne(
      { _id: userId, isVerified: true },
      { password: 0, verificationToken: 0 }
    );
    if (!findUser)
      throw new HttpException(409, 'User does not exists with given id');

    return findUser.toJSON() as User;
  }

  public async createUser(userData: RegisterUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (findUser)
      throw new HttpException(
        409,
        `You're email ${userData.email} already exists`
      );

    const hashedPassword = await hash(userData.password, 10);
    const createUserData = await this.users.create({
      ...userData,
      password: hashedPassword,
    });

    return createUserData.toJSON() as User;
  }

  public async updateUser(
    userId: string,
    userData: RegisterUserDto
  ): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    if (userData.email) {
      const findUser: User = await this.users.findOne({
        email: userData.email,
      });
      if (findUser && findUser._id != userId)
        throw new HttpException(
          409,
          `You're email ${userData.email} already exists`
        );
    }

    if (userData.password) {
      const hashedPassword = await hash(userData.password, 10);
      userData = { ...userData, password: hashedPassword };
    }

    const updateUserById = await this.users.findByIdAndUpdate(
      userId,
      {
        userData,
      },
      { returnOriginal: false }
    );
    if (!updateUserById) throw new HttpException(409, "You're not user");

    return updateUserById.toJSON() as User;
  }

  public async updateProfile(
    userId: string,
    userData: UpdateUserDto
  ): Promise<User> {
    if (isEmpty(userData))
      throw new HttpException(400, 'Required properties are missing');

    const updateUserById = await this.users
      .findByIdAndUpdate(
        userId,
        {
          $set: userData,
        },
        { returnOriginal: false }
      )
      .select({
        password: 0,
        verificationToken: 0,
      });
    if (!updateUserById)
      throw new HttpException(409, 'User missing with given user Id');

    return updateUserById.toJSON() as User;
  }

  public async updateUserType(
    userId: string,
    userType: UserType
  ): Promise<User> {
    if (isEmpty(userType))
      throw new HttpException(400, 'Usertype missing or invalid');

    const updateUserById = await this.users
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            userType,
            isFirstLogin: false,
          },
        },
        { returnOriginal: false }
      )
      .select({
        password: 0,
        verificationToken: 0,
      });
    return updateUserById.toJSON() as User;
  }

  public async deleteUser(role: UserRole, userId: string): Promise<void> {
    if (role !== UserRole.SUPER_ADMIN)
      throw new HttpException(403, `You don't have the access to this API`);

    await this.users.findByIdAndDelete(userId);
  }

  public async selfDelete(userId: string): Promise<void> {
    await this.users.findByIdAndDelete(userId);
  }

  public async makeAdmin(role: UserRole, userId: string) {
    if (role !== UserRole.SUPER_ADMIN)
      throw new HttpException(403, `You don't have the access to this API`);

    await this.users.findByIdAndUpdate(
      userId,
      {
        $set: {
          role: UserRole.ADMIN,
        },
      },
      { returnOriginal: false }
    );
  }

  public async removeAdmin(role: UserRole, userId: string) {
    if (role !== UserRole.SUPER_ADMIN)
      throw new HttpException(403, `You don't have the access to this API`);

    await this.users.findByIdAndUpdate(
      userId,
      {
        $set: {
          role: UserRole.USER,
        },
      },
      { returnOriginal: false }
    );
  }
}

export default UserService;
