import { model, Schema, Document } from 'mongoose';
import { Comment } from '@/interfaces/comment.interface';

const commentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    propertyId: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

commentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const commentsModel = model<Comment & Document>('Comments', commentSchema);
export default commentsModel;
