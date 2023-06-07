import { HouseType } from '@/enums/housetype.enum';
import { UserType } from '@/enums/usertype.enum';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';


class PriceRange {
  @IsNumber()
  @IsOptional()
  public min: number;

  @IsNumber()
  @IsOptional()
  public max: number;
}

export class LocationDto {
  @IsNumber()
  @IsNotEmpty()
  public latitude: number;

  @IsNumber()
  @IsNotEmpty()
  public longitude: number;

  @IsNumber()
  @IsNotEmpty()
  public radius: number;
}

export class FilterDto {

  @IsString()
  @IsOptional()
  public streetAddress: string;

  @IsString()
  @IsOptional()
  public province: string;

  @IsOptional()
  @IsNumber({}, { each: true })
  public bedroom: number[];

  @IsOptional()
  @IsNumber({}, { each: true })
  public bathroom: number[];

  @IsOptional()
  @IsNumber({}, { each: true })
  public parking: number[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => PriceRange)
  public priceRange: PriceRange;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  public location: LocationDto;

  @IsOptional()
  @IsString({ each: true })
  public keywords: string[];

  @IsOptional()
  @IsNumber({}, { each: true })
  public houseType: HouseType[];
}