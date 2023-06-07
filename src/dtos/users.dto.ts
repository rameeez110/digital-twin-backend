import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;
}
export class LoginGoogleUserDto {
  @IsString()
  @IsNotEmpty()
  public token: string;

  @IsString()
  @IsOptional()
  public platform: string;
}

export class LoginAppleUserDto {
  @IsString()
  @IsNotEmpty()
  public firstName: string;

  @IsString()
  @IsNotEmpty()
  public lastName: string;

  @IsString()
  @IsNotEmpty()
  public token: string;
}

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  public firstName: string;

  @IsString()
  @IsNotEmpty()
  public lastName: string;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public password: string;

  @IsString()
  @IsOptional()
  public imageUrl: string;

  @IsString()
  @IsOptional()
  public phone: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  public firstName: string;

  @IsString()
  @IsNotEmpty()
  public lastName: string;

  @IsString()
  @IsOptional()
  public imageUrl: string;

  @IsString()
  @IsOptional()
  public phone: string;
}

export class VerifyUserDto {
  @IsString()
  @IsNotEmpty()
  public token: string;
}

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  public email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  public oldPassword: string;

  @IsString()
  @IsNotEmpty()
  public newPassword: string;
}
