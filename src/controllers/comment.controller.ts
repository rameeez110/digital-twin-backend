import { Controller, Param, Body, Get, Post, Put, Delete, HttpCode, UseBefore, QueryParam, Req } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Comment } from '@/interfaces/comment.interface';
import CommentService from '@/services/comment.service';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { RequestWithUser } from '@/interfaces/auth.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { CommentDto } from '@/dtos/comment.dto';

@Controller('/comment')
@UseBefore(authMiddleware)
export class CommentsController {
  public commentService = new CommentService();

  @Get('/:propertyId')
  @OpenAPI({ summary: 'Get comments by property' })
  async commentByProperty(@Req() req: RequestWithUser, @Param('propertyId') propertyId: string) {
    const data = await this.commentService.findAllByProperty(propertyId);
    return { data, message: 'search', success: true };  
  }

  @Get('/client/:propertyId')
  @OpenAPI({ summary: 'Get client comments by property' })
  async clientPropertyComments(@Req() req: RequestWithUser, @Param('propertyId') propertyId: string) {
    const data = await this.commentService.findAllClientComments(req.user.id, propertyId);
    return { data, message: 'search', success: true };  
  }

  @Post('/')
  @HttpCode(201)
  @UseBefore(validationMiddleware(CommentDto, 'body'))
  @OpenAPI({ summary: 'Create comment' })
  async createUser(@Req() req: RequestWithUser, @Body() commentDto: CommentDto) {
    const data: Comment = await this.commentService.create(req.user.id, commentDto);
    return { data, message: 'created', success: true };
  }

  @Put('/:id')
  @UseBefore(validationMiddleware(CommentDto, 'body', true))
  @OpenAPI({ summary: 'Update' })
  async update(@Req() req: RequestWithUser, @Param('id') id: string,  @Body() commentDto: CommentDto) {
    const updateCommentData: Comment = await this.commentService.update(id, commentDto);
    return { data: updateCommentData, message: 'updated', success: true };
  }

  @Delete('/:id')
  @OpenAPI({ summary: 'Delete by comment id' })
  async delete(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.commentService.delete(id);
    return { message: 'Action successful', success: true };
  }
}
