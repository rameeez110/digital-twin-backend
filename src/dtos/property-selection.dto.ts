import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';


export class PropertySelectionDto {
  @IsString()
  @IsNotEmpty()
  public propertyId: string;

  @IsBoolean()
  @IsNotEmpty()
  public status: boolean;
}