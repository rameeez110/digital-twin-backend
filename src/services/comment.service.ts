import { HttpException } from '@exceptions/HttpException';
import { Comment } from '@/interfaces/comment.interface';
import commentModel from '@/models/comment.model';
import { isEmpty } from '@utils/util';
import { Types } from 'mongoose';
import { CommentDto } from '@/dtos/comment.dto';
import invitationModel from '@/models/invitation.model';
import { InvitationStatus } from '@/enums/invitation-status.enum';

class CommentService {
  public comment = commentModel;
  public invitations = invitationModel;

  public async findAllByProperty(propertyId: string): Promise<Comment[]> {
    const comments = await this.comment.find({
      propertyId,
    });
    return comments.map((comment) => comment.toJSON()) as Comment[];
  }

  public async findAllClientComments(
    userId: string,
    propertyId: string
  ): Promise<Comment[]> {
    const clients = await this.invitations.find({
      status: InvitationStatus.ACCEPTED,
      fromUserId: userId,
    });

    const comments = await this.comment.find({
      propertyId,
      userId: { $in: [...clients.map((cl) => cl.toUserId), userId] },
    }).populate('userId', { password: 0 });
    return comments.map((comment) => comment.toJSON()) as Comment[];
  }

  public async create(userId: string, body: CommentDto): Promise<Comment> {
    if (isEmpty(body))
      throw new HttpException(400, 'Required fields are missing');

    const createdComment = await commentModel.create({
      propertyId: body.propertyId,
      comment: body.comment,
      userId: userId,
    });
    const comment = createdComment.toJSON() as Comment;
    return comment;
  }

  public async update(id: string, body: CommentDto): Promise<Comment> {
    if (isEmpty(body))
      throw new HttpException(400, 'Required properties are missing');

    const createdComment = await commentModel.findByIdAndUpdate(
      id,
      {
        comment: body.comment,
      },
      { returnOriginal: false }
    );

    if (!createdComment)
      throw new HttpException(409, 'User missing with given user Id');
    return createdComment.toJSON() as Comment;
  }

  public async delete(id: string) {
    if (!id) throw new HttpException(400, 'Comment Id missing or invalid');
    await this.comment.findByIdAndRemove(id);
  }
}

export default CommentService;
