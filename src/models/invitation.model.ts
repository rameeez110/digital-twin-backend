import { model, Schema, Document } from 'mongoose';
import { Invitation } from '@/interfaces/invitation.interface';
import { InvitationStatus } from '@/enums/invitation-status.enum';

const invitationSchema: Schema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'User',
    },
    toUserEmail: {
      type: String
    },
    status: {
      type: Number,
      default: InvitationStatus.PENDING,
      min: InvitationStatus.PENDING,
      max: InvitationStatus.ACCEPTED,
    },
  },
  { timestamps: true }
);

invitationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const invitationModel = model<Invitation & Document>('Invitations', invitationSchema);
export default invitationModel;
