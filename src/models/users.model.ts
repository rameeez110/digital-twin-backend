import { model, Schema, Document } from 'mongoose';
import { User } from '@interfaces/users.interface';
import { UserType } from '@/enums/usertype.enum';
import { UserRole } from '@/enums/user-role.enum';

const userSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    userType: {
      type: Number,
      default: UserType.VISITOR,
    },
    role: {
      type: Number,
      default: UserRole.USER,
    },
    phone: {
      type: String,
      required: false,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    socialSignIn: {
      type: Boolean,
      required: false,
      default: false
    },
    isFirstLogin: {
      type: Boolean,
      required: false,
      default: true
    },
    verificationToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    hasTemporaryPassword: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const userModel = model<User & Document>('User', userSchema);
export default userModel;
