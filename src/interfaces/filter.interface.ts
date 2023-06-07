import { HouseType } from '@/enums/housetype.enum';

export interface Filter {
  _id: string;
  id: string;
  // city: string;
  province: string;
  streetAddress: string;
  bedroom: number[];
  bathroom: number[];
  parking: number[];
  priceRange: {
    min: number;
    max: number;
  };
  location: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  keywords: string[];
  houseType: HouseType[];
  userId: string;
}
