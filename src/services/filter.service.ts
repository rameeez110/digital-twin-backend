import { hash } from 'bcrypt';
import { FilterDto } from '@dtos/filter.dto';
import { HttpException } from '@exceptions/HttpException';
import { Filter } from '@interfaces/filter.interface';
import { isEmpty } from '@utils/util';
import filterModel from '@/models/filter.model';

class FilterService {
  public filters = filterModel;

  public async getFilterByUserId(userId: string): Promise<Partial<Filter>> {
    const data = await this.filters.findOne(
      { userId }
    );
    return (data?.toJSON() as Filter) ?? {};
  }

  public async setFilterByUserId(userId: string, filterData: FilterDto): Promise<Filter> {
    if (isEmpty(filterData)) throw new HttpException(400, "Filter data is empty or invalid");

    const data = await this.filters.findOneAndUpdate(
      { userId },
      {
        userId,
        ...filterData
      },
      { upsert: true, returnOriginal: false }
    );
    return data.toJSON() as Filter;
  }
}

export default FilterService;
