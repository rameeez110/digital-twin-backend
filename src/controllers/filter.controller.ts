import { Controller, Param, Body, Get, Post, Put, Delete, HttpCode, UseBefore, QueryParam, Req } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { FilterDto } from '@dtos/filter.dto';
import { User } from '@interfaces/users.interface';
import FilterService from '@services/filter.service';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { RequestWithUser } from '@/interfaces/auth.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { Filter } from '@/interfaces/filter.interface';

@Controller('/filters')
@UseBefore(authMiddleware)
export class FilterController {
  public filterService = new FilterService();

  @Get('')
  @OpenAPI({ summary: 'Get filters' })
  async getUserById(@Req() req: RequestWithUser) {
    const data = await this.filterService.getFilterByUserId(req.user.id);
    return { data, message: 'findOne', success: true };
  }

  @Put('')
  @UseBefore(validationMiddleware(FilterDto, 'body', true))
  @OpenAPI({ summary: 'Set filters' })
  async updateUser(@Req() req: RequestWithUser,  @Body() filterData: FilterDto) {
    const data: Filter = await this.filterService.setFilterByUserId(req.user.id, filterData);
    return { data, message: 'updated', success: true };
  }
}
