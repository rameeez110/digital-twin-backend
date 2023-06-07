import { Controller, Param, Body, Get, Post, Put, Delete, HttpCode, UseBefore, QueryParam, Req } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Invitation } from '@/interfaces/invitation.interface';
import InvitationService from '@/services/invitation.service';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { RequestWithUser } from '@/interfaces/auth.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { S3_BUCKET_FOLDER_USERS, S3_CDN_ENDPOINT } from '@/config';
import { CommentDto } from '@/dtos/comment.dto';
import { InvitationDto } from '@/dtos/invitation.dto';

@Controller('/invitation')
@UseBefore(authMiddleware)
export class InvitationController {
  public invitationService = new InvitationService();

  @Get('/accepted')
  @OpenAPI({ summary: 'Accepted Invitations' })
  async accepted(@Req() req: RequestWithUser) {
    const data = await this.invitationService.getAcceptedInvitations(req.user.id);
    return { data, message: 'search', success: true };  
  }

  @Get('/pending')
  @OpenAPI({ summary: 'Pending Invitations' })
  async pending(@Req() req: RequestWithUser) {
    const data = await this.invitationService.getPendingInvitations(req.user.id);
    return { data, message: 'search', success: true };  
  }
  
  @Get('/received')
  @OpenAPI({ summary: 'Received Invitations' })
  async received(@Req() req: RequestWithUser) {
    const data = await this.invitationService.getReceivedInvitations(req.user.id);
    return { data, message: 'search', success: true };  
  }

  @Post('/')
  @HttpCode(201)
  @UseBefore(validationMiddleware(InvitationDto, 'body'))
  @OpenAPI({ summary: 'Send invitation' })
  async createUser(@Req() req: RequestWithUser, @Body() invitation: InvitationDto) {
    const data: Invitation = await this.invitationService.create(req.user, invitation);
    return { data, message: 'created', success: true };
  }

  @Put('/accept/:id')
  @OpenAPI({ summary: 'Accept invitation' })
  async accept(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.invitationService.accept(req.user.id, id);
    return { message: 'Invitation accepted', success: true };
  }

  @Put('/reject/:id')
  @OpenAPI({ summary: 'Reject invitation' })
  async reject(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.invitationService.reject(req.user.id, id);
    return { message: 'Invitation rejected', success: true };
  }

  @Put('/delete/:id')
  @OpenAPI({ summary: 'Delete invitation' })
  async delete(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.invitationService.delete(req.user.id, id);
    return { message: 'Invitation deleted', success: true };
  }
}
