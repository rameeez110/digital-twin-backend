import { Controller, Param, Body, Get, Post, Put, Delete, HttpCode, UseBefore, QueryParam, Req } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { RegisterUserDto, UpdateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import userService from '@services/users.service';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { RequestWithUser } from '@/interfaces/auth.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { uploader } from '@/utils/uploader.util';
import { S3_BUCKET_FOLDER_USERS, S3_CDN_ENDPOINT } from '@/config';
import { UserType } from '@/enums/usertype.enum';
import InvitationService from '@/services/invitation.service';

@Controller('/users')
@UseBefore(authMiddleware)
export class UsersController {
  public userService = new userService();
  public invitationService = new InvitationService();

  // @Get('')
  // @OpenAPI({ summary: 'Return a list of users' })
  // async getUsers(@QueryParam('query') query: string, @Req() req: RequestWithUser) {
  //   const findAllUsersData: User[] = await this.userService.searchUsers(query, req.user.id);
  //   return { data: findAllUsersData, message: 'Search result', success: true };
  // }

  // @Get('/:id')
  // @OpenAPI({ summary: 'Return find a user' })
  // async getUserById(@Param('id') userId: string) {
  //   const findOneUserData: User = await this.userService.findUserById(userId);
  //   return { data: findOneUserData, message: 'findOne', success: true };
  // }

  // @Post('')
  // @HttpCode(201)
  // @UseBefore(validationMiddleware(RegisterUserDto, 'body'))
  // @OpenAPI({ summary: 'Create a new user' })
  // async createUser(@Body() userData: RegisterUserDto) {
  //   const createUserData: User = await this.userService.createUser(userData);
  //   delete createUserData.password;
  //   return { data: createUserData, message: 'created', success: true };
  // }

  // @Put('/profile')
  // @UseBefore(validationMiddleware(UpdateUserDto, 'body', true))
  // @OpenAPI({ summary: 'Update profile' })
  // async updateUser(@Req() req: RequestWithUser,  @Body() userData: UpdateUserDto) {
  //   const updateUserData: User = await this.userService.updateProfile(req.user.id, userData);
  //   return { data: updateUserData, message: 'updated', success: true };
  // }

  // @Delete('/:id')
  // @OpenAPI({ summary: 'Delete a user' })
  // async deleteUser(@Param('id') userId: string) {
  //   const deleteUserData: User = await this.userService.deleteUser(userId);
  //   delete deleteUserData.password;
  //   return { data: deleteUserData, message: 'deleted', success: true };
  // }

  @Put('/userType/:userType')
  @OpenAPI({ summary: 'Update user type' })
  async updateUser(@Req() req: RequestWithUser,  @Param('userType') userType: UserType) {
    const data: User = await this.userService.updateUserType(req.user.id, userType);
    return { data, message: 'updated', success: true };
  }

  @Post('/uploadImage')
  @OpenAPI({ summary: 'Upload user image' })
  async uploadImage(@Req() req: RequestWithUser) {
    return new Promise((resolve, reject) => {
      uploader(S3_BUCKET_FOLDER_USERS).single('file')(req, null, (err: any) => {
        if (err) {
          console.log(err);
          return reject({ success: false, message: 'Error uploading image' });
        }

        const file = req.file as any;
        return resolve({
          success: true,
          data: `${S3_CDN_ENDPOINT}/${file.key}`,
          message: 'Image uploaded successfully!',
        });
      });
    });
  }

  @Get('/clients')
  @OpenAPI({ summary: 'Get clients' })
  async getClients(@Req() req: RequestWithUser) {
    const data = await this.invitationService.getClients(req.user.id);
    return { data, message: 'findOne', success: true };
  }

  @Get('/all')
  @OpenAPI({ summary: 'Get users' })
  async getUsers(@Req() req: RequestWithUser) {
    const data = await this.userService.getAllUsers(req.user.role, req.user.id);
    return { data, message: 'Get all users', success: true };
  }

  @Put('/makeAdmin/:id')
  @OpenAPI({ summary: 'Set as admin' })
  async makeAdmin(@Req() req: RequestWithUser, @Param('id') userId: string) {
    await this.userService.makeAdmin(req.user.role, userId);
    return { message: 'updated', success: true };
  }

  @Put('/removeAdmin/:id')
  @OpenAPI({ summary: 'Remove as admin' })
  async removeAdmin(@Req() req: RequestWithUser, @Param('id') userId: string) {
    await this.userService.removeAdmin(req.user.role, userId);
    return { message: 'updated', success: true };
  }

  @Delete('/id/:id')
  @OpenAPI({ summary: 'Delete a user' })
  async deleteUser(@Req() req: RequestWithUser, @Param('id') userId: string) {
    await this.userService.deleteUser(req.user.role, userId);
    return { message: 'User deleted successfully', success: true };
  }

  @Delete('/self')
  @OpenAPI({ summary: 'Self Delete' })
  async selfDelete(@Req() req: RequestWithUser) {
    await this.userService.selfDelete(req.user.id);
    return { message: 'Your account has been deleted successfully!', success: true };
  }
}
