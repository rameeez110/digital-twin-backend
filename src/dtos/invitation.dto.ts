import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class InvitationDto {
  @IsString()
  @IsNotEmpty()
  public toUserEmail: string;
}