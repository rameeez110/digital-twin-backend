import { HttpException } from '@exceptions/HttpException';
import { Invitation } from '@/interfaces/invitation.interface';
import commentModel from '@/models/comment.model';
import { isEmpty } from '@utils/util';
import { Types } from 'mongoose';
import invitationModel from '@/models/invitation.model';
import { User } from '@/interfaces/users.interface';
import { InvitationStatus } from '@/enums/invitation-status.enum';
import { InvitationDto } from '@/dtos/invitation.dto';
import userModel from '@/models/users.model';
import { sendEmail } from '@/utils/email.util';

class InvitationService {
  public invitations = invitationModel;
  public users = userModel;

  public async getPendingInvitations(userId: string): Promise<Invitation[]> {
    const invitation = await this.invitations
      .find({
        fromUserId: userId,
        status: InvitationStatus.PENDING,
      })
      .populate('toUserId', { password: 0 });
    return invitation.map((invitation) => invitation.toJSON()) as Invitation[];
  }

  public async getAcceptedInvitations(userId: string): Promise<Invitation[]> {
    const invitation = await this.invitations
      .find({
        fromUserId: userId,
        status: InvitationStatus.ACCEPTED,
      })
      .populate('toUserId', { password: 0 });
    return invitation.map((invitation) => invitation.toJSON()) as Invitation[];
  }

  public async getReceivedInvitations(userId: string): Promise<Invitation[]> {
    const invitation = await this.invitations
      .find({
        toUserId: userId,
      })
      .populate('fromUserId', { password: 0 });
    return invitation.map((invitation) => invitation.toJSON()) as Invitation[];
  }

  public async create(
    fromUser: User,
    body: InvitationDto
  ): Promise<Invitation> {
    if (isEmpty(body))
      throw new HttpException(400, 'Required fields are missing');

    const alreadySent = await this.invitations.exists({
      toUserEmail: body.toUserEmail,
      fromUserId: fromUser.id
    });
    if (alreadySent)
      throw new HttpException(
        400,
        'Either user is already your client or you have already sent an invitation to this user'
      );

    const user = await this.users.findOne({ email: body.toUserEmail });

    const createdInvitation = await this.invitations.create({
      fromUserId: fromUser.id,
      status: InvitationStatus.PENDING,
      toUserId: user?.id,
      toUserEmail: body.toUserEmail,
    });

    let emailText;
    if (user)
      emailText = `Hello ${user.firstName}\n\nYou have received an invitation from ${fromUser.firstName}. Please login in application to accept the invitation.`;
    else
      emailText = `Hello\n\nYou have received an invitation from ${fromUser.firstName}. Please signup in application to accept the invitation `;

    await sendEmail({
      to: user?.email ?? body.toUserEmail,
      text: emailText,
      subject: 'Invitation for Application Access',
    }).catch(async (err) => {
      throw new HttpException(422, 'Error sending invitation');
    });

    return createdInvitation.toJSON() as Invitation;
  }

  public async getClients(userId: string): Promise<User[]> {
    const invites = await this.invitations
      .find({
        fromUserId: userId,
        status: InvitationStatus.ACCEPTED,
      })
      .populate('toUserId', { password: 0 });
    return invites.map((invite) => invite.toJSON()) as User[];
  }

  public async accept(userId: string, id: string): Promise<void> {
    await this.invitations.findOneAndUpdate(
      {
        _id: id,
        toUserId: userId,
      },
      { status: InvitationStatus.ACCEPTED }
    );
  }

  public async reject(userId: string, id: string): Promise<void> {
    await this.invitations.findOneAndDelete({
      _id: id,
      toUserId: userId,
    });
  }

  public async delete(userId: string, id: string): Promise<void> {
    await this.invitations.findOneAndDelete({
      _id: id,
      fromUserId: userId,
    });
  }
}

export default InvitationService;
