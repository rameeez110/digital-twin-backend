import { Controller, Param, Body, Get, Post, Put, Delete, HttpCode, UseBefore, QueryParam, Req } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestWithUser } from '@/interfaces/auth.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import PropertyService from '@/services/property.service';
import { Property } from '@/interfaces/property.interface';
import { PropertySelectionDto } from '@/dtos/property-selection.dto';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { LocationDto } from '@/dtos/filter.dto';

@Controller('/properties')
@UseBefore(authMiddleware)
export class PropertyController {
  public propertyService = new PropertyService();

  @Get('/search')
  @OpenAPI({ summary: 'Search Properties' })
  async search(@Req() req: RequestWithUser, @QueryParam('page') page: number, @QueryParam('limit') limit: number) {
    page = !isNaN(page) ? +page : 1;
    limit = !isNaN(limit) ? +limit : 10;
    const data = await this.propertyService.search(req.user.id, page, limit);
    return { data, message: 'search', success: true };
  }

  @Post('/search/location')
  @OpenAPI({ summary: 'Search property by location' })
  @UseBefore(validationMiddleware(LocationDto, 'body'))
  async searchByLocation(
      @Req() req: RequestWithUser, 
      @Body() body: LocationDto, 
      @QueryParam('page') page: number, 
      @QueryParam('limit') limit: number
    ) {
    page = !isNaN(page) ? +page : 1;
    limit = !isNaN(limit) ? +limit : 10;
    const data = await this.propertyService.searchByLocation(req.user.id, body, page, limit);
    return { data, message: 'Search by location', success: true };
  }

  @Post('/action')
  @OpenAPI({ summary: 'Like or Dislike the property' })
  @UseBefore(validationMiddleware(PropertySelectionDto, 'body', true))
  async action(@Req() req: RequestWithUser, @Body() body: PropertySelectionDto) {
    await this.propertyService.setPropertyStatus(req.user.id, body);
    return { message: 'Action successful', success: true };
  }

  @Get('/selection')
  @OpenAPI({ summary: 'Like or Dislike the property' })
  async selection(@Req() req: RequestWithUser) {
    const data = await this.propertyService.getSelectedProperties(req.user.id);
    return { data, message: 'Action successful', success: true };
  }

  @Get('/selection/:clientId')
  @OpenAPI({ summary: 'Like or Dislike the property of client' })
  async selectionByClient(@Req() req: RequestWithUser, @Param('clientId') clientId: string) {
    const data = await this.propertyService.getSelectedPropertiesByClient(req.user.id, clientId);
    return { data, message: 'Action successful', success: true };
  }

  @Delete('/selection/:propertyId')
  @OpenAPI({ summary: 'Delete property selection / like, dislike' })
  async deleteSlection(@Req() req: RequestWithUser, @Param('propertyId') propertyId: string) {
    await this.propertyService.deleteSelectedProperty(req.user.id, propertyId);
    return { message: 'Action successful', success: true };
  }
}
