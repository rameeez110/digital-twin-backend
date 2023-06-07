import { Response } from 'express';
import { Controller, Body, Post, UseBefore, Res, Get, QueryParams, Req, Put } from 'routing-controllers';
import { ForgotPasswordDto, LoginAppleUserDto, LoginGoogleUserDto, LoginUserDto, RegisterUserDto, ResetPasswordDto, UpdateUserDto, VerifyUserDto } from '@dtos/users.dto';
import { validationMiddleware } from '@middlewares/validation.middleware';
import AuthService from '@services/auth.service';
import authMiddleware from '@/middlewares/auth.middleware';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { OpenAPI } from 'routing-controllers-openapi';
import { User } from '@/interfaces/users.interface';
import UserService from '@/services/users.service';

@Controller()
export class AuthController {
  public authService = new AuthService();
  public userService = new UserService();

  @Post('/login')
  @UseBefore(validationMiddleware(LoginUserDto, 'body'))
  async logIn(@Res() res: Response, @Body() userData: LoginUserDto) {
    const { token, findUser } = await this.authService.login(userData);

    return {
      data: {
        token,
        user: findUser,
      },
      success: true,
      message: 'User logged in successfully',
    };
  }

  @Post('/login/google')
  @UseBefore(validationMiddleware(LoginGoogleUserDto, 'body'))
  async loginGoogle(@Res() res: Response, @Body() userData: LoginGoogleUserDto) {
    const { token, data } = await this.authService.loginGoogle(userData);

    return {
      data: {
        token,
        user: data,
      },
      success: true,
      message: 'User logged in successfully',
    };
  }

  @Post('/login/apple')
  @UseBefore(validationMiddleware(LoginAppleUserDto, 'body'))
  async loginApple(@Res() res: Response, @Body() userData: LoginAppleUserDto) {
    const { token, data } = await this.authService.loginApple(userData);

    return {
      data: {
        token,
        user: data,
      },
      success: true,
      message: 'User logged in successfully',
    };
  }

  @Post('/register')
  @UseBefore(validationMiddleware(RegisterUserDto, 'body'))
  async register(@Res() res: Response, @Body() body: RegisterUserDto) {
    const user = await this.authService.register(body);

    return {
      data: user,
      success: true,
      message: 'User registered successfully',
    };
  }

  @Get('/verify')
  @UseBefore(validationMiddleware(VerifyUserDto, 'query'))
  async verify(@Res() res: Response, @QueryParams() query: VerifyUserDto) {
    await this.authService.verify(query.token);

    return 'Account verified successfully! Please proceed to login';
  }

  @Post('/forgotPassword')
  @UseBefore(validationMiddleware(ForgotPasswordDto, 'query'))
  async forgotPassword(@Res() res: Response, @QueryParams() query: ForgotPasswordDto) {
    await this.authService.forgotPassword(query.email);

    return {
      success: true,
      message: 'Email has been sent for further instructions!',
    };
  }

  @Post('/resetPassword')
  @UseBefore(authMiddleware)
  @UseBefore(validationMiddleware(ResetPasswordDto, 'body'))
  async resetPassword(@Req() req: RequestWithUser, @Res() res: Response, @Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(req.user.id, body);

    return {
      success: true,
      message: 'Password updated successfully!',
    };
  }

  @Get('/profile')
  @UseBefore(authMiddleware)
  @OpenAPI({ summary: 'Get profile' })
  async getProfile(@Req() req: RequestWithUser) {
    const data: User = await this.userService.findUserById(req.user.id);
    return { data, message: 'Returns user profile data', success: true };
  }

  @Put('/profile')
  @UseBefore(authMiddleware)
  @UseBefore(validationMiddleware(UpdateUserDto, 'body', true))
  @OpenAPI({ summary: 'Update profile' })
  async updateUser(@Req() req: RequestWithUser, @Body() userData: UpdateUserDto) {
    const updateUserData: User = await this.userService.updateProfile(req.user.id, userData);
    return { data: updateUserData, message: 'updated', success: true };
  }
}
