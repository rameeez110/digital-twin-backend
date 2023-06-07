import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { ANDROID_GOOGLE_CLIENT_ID, APPLE_CLIENT_ID, GOOGLE_CLIENT_ID, HOST, PORT, SECRET_KEY } from '@config';
import {
  LoginAppleUserDto,
  LoginGoogleUserDto,
  LoginUserDto,
  RegisterUserDto,
  ResetPasswordDto,
} from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import { generateRandomString, isEmpty } from '@utils/util';
import { sendEmail } from '@/utils/email.util';
import { Types } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import verifyAppleToken from 'verify-apple-id-token';
import invitationModel from '@/models/invitation.model';

class AuthService {
  public users = userModel;
  public invitations = invitationModel;

  public async login(userData: LoginUserDto): Promise<{ token: string; findUser: User }> {
    if (isEmpty(userData)) throw new HttpException(400, 'Username or Password is missing');

    const findUser = await this.users.findOne({ email: new RegExp(`^${userData.email}$`, 'i') }, { friends: 0 });
    if (!findUser) throw new HttpException(409, 'User does not exists with given email address');

    if (findUser?.socialSignIn) throw new HttpException(403, 'You cannot logged in using this method!');
    if (!findUser?.isVerified)
      throw new HttpException(
        403,
        'Your account is not verified, please follow the instructions in the verification email!'
      );

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, 'Incorrect username or password');

    const tokenData = this.createToken(findUser, 30 * 24 * 60 * 60);
    const user = findUser.toJSON() as User;
    delete user.password;

    return { token: tokenData.token, findUser: user };
  }

  public async loginGoogle(userData: LoginGoogleUserDto): Promise<{ token: string; data: User }> {
    if (isEmpty(userData)) throw new HttpException(400, 'Token is missing');

    const result = await this.verifyGoogleToken(userData.token, userData.platform);
    if (!result) throw new HttpException(409, 'Invalid token');

    const user = await this.users
      .findOneAndUpdate(
        { email: new RegExp(`^${result.email}$`, 'i') },
        {
          email: result.email.toLowerCase(),
          firstName: result.given_name,
          lastName: result.family_name,
          imageUrl: result.picture,
          isVerified: true,
          socialSignIn: true,
        },
        {
          upsert: true,
          returnOriginal: false,
        }
      )
      .select({
        password: 0,
      });

    const tokenData = this.createToken(user, 30 * 24 * 60 * 60);
    const data = user.toJSON() as User;
    return { token: tokenData.token, data };
  }

  public async loginApple(userData: LoginAppleUserDto): Promise<{ token: string; data: User }> {
    if (isEmpty(userData)) throw new HttpException(400, 'Token is missing');

    const result = await this.verifyAppleToken(userData.token);
    if (!result) throw new HttpException(409, 'Invalid token');

    const user = await this.users
      .findOneAndUpdate(
        { email: new RegExp(`^${result.email}$`, 'i') },
        {
          email: result.email.toLowerCase(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          isVerified: true,
          socialSignIn: true,
        },
        {
          upsert: true,
          returnOriginal: false,
        }
      )
      .select({
        password: 0,
      });

    const tokenData = this.createToken(user, 30 * 24 * 60 * 60);
    const data = user.toJSON() as User;
    return { token: tokenData.token, data };
  }

  public async register(userData: RegisterUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'Required fields are missing');

    const userCount = await userModel.count({ email: userData.email });
    if (userCount !== 0) throw new HttpException(422, 'User already exists with given email address');

    const hashedPassword = await hash(userData.password, 10);

    const createdUser = await userModel.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      imageUrl: userData.imageUrl,
      isVerified: false,
    });
    const user = createdUser.toJSON() as User;
    delete user.password;

    const { token } = this.createToken(createdUser, 24 * 60 * 60);
    await userModel.findByIdAndUpdate(createdUser._id, { $set: { verificationToken: token } });

    const link = `${HOST}:${PORT}/verify?token=${token}`;
    const emailText = `Hello ${user.firstName}\n\nWelcome to Sould App! Please click on the following link to activate your account:\n\n ${link}`;

    await sendEmail({
      to: user.email,
      text: emailText,
      subject: 'Registration Verification',
    }).catch(async (err) => {
      await userModel.deleteOne({ _id: createdUser._id });
      throw new HttpException(422, 'Error creating user');
    });

    // invitation flow
    await this.invitations.updateMany(
      { toUserEmail: user.email },
      {
        $set: {
          toUserId: user.id,
        },
      }
    );

    return user;
  }

  public async verify(token: string): Promise<void> {
    const decoded = await this.verifyToken(token).catch((err) => {
      throw new HttpException(409, 'Error verifying user');
    });

    await userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(decoded.id), verificationToken: token },
      { $set: { isVerified: true }, $unset: { verificationToken: 1 } }
    );
  }

  public async forgotPassword(email: string): Promise<void> {
    const user = await userModel.findOne({ email });
    if (isEmpty(user)) throw new HttpException(400, 'User doesnot exists with given email');

    const tempPassword = generateRandomString(16);
    const encryptedPassword = await hash(tempPassword, 8);

    await sendEmail({
      to: email,
      subject: 'Temporary Login Password',
      text: `Your temporary generated login password is: ${tempPassword}`,
    });

    await userModel.updateOne({ email }, { $set: { password: encryptedPassword, hasTemporaryPassword: true } });
  }

  public async resetPassword(userId: string, body: ResetPasswordDto): Promise<void> {
    const user = await userModel.findById(userId);

    const passwordIsValid = await compare(body.oldPassword, user.password);
    if (!passwordIsValid) {
      throw new HttpException(409, 'Invalid old password!');
    }

    const encryptedPassword = await hash(body.newPassword, 8);
    await userModel.findByIdAndUpdate(userId, {
      $set: { password: encryptedPassword },
      $unset: { hasTemporaryPassword: 1 },
    });
  }

  public createToken(user: User, expiresIn: number = 60 * 60): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user._id, role: user.role };
    const secretKey: string = SECRET_KEY;
    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public async verifyToken(token: string): Promise<DataStoredInToken> {
    return new Promise((resolve, reject) => {
      verify(token, SECRET_KEY, (err: any, decoded: DataStoredInToken) => {
        if (err) return reject(err);
        return resolve(decoded);
      });
    });
  }

  public async verifyGoogleToken(token: string, platform: string = 'ios'): Promise<any> {
    let clientId: string;
    if (platform === 'android') {
      clientId = ANDROID_GOOGLE_CLIENT_ID;
    } else {
      clientId = GOOGLE_CLIENT_ID;
    }
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: platform !== 'android' ? clientId : undefined,
    });
    return ticket.getPayload();
  }

  public async verifyAppleToken(token: string): Promise<any> {
    try {
      return await verifyAppleToken({
        idToken: token,
        clientId: APPLE_CLIENT_ID,
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export default AuthService;
