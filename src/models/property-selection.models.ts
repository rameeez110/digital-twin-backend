import { model, Schema, Document } from 'mongoose';
import { PropertySelection } from '@/interfaces/property-selection.interface';

const schema: Schema = new Schema({
  status: {
    type: Boolean,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  propertyId: {
    type: String,
    required: true,
  },
}, { timestamps: true });

schema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    if (ret.userId) ret.userId = ret.userId.toString();
    if (ret.propertyId) ret.propertyId = ret.propertyId.toString();
  },
});

schema.virtual('property', {
  ref: 'Property',
  localField: 'propertyId',
  foreignField: 'id',
  justOne: true
});

schema.index({ userId: 1, propertyId: 1 }, { unique: true });

const propertySelectionModel = model<PropertySelection & Document>('PropertySelection', schema);
export default propertySelectionModel;
