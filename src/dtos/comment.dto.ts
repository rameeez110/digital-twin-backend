import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';


export class CommentDto {
  @IsString()
  @IsNotEmpty()
  public propertyId: string;

  @IsString()
  @IsNotEmpty()
  public comment: string;
}