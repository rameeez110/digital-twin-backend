import { model, Schema, Document } from 'mongoose';
import { Filter } from '@interfaces/filter.interface';
import { HouseType } from '@/enums/housetype.enum';

const filterSchema: Schema = new Schema(
  {
    // city: { type: String },
    streetAddress: { type: String },
    bedroom: [{ type: Number }],
    bathroom: [{ type: Number }],
    parking: [{ type: Number }],
    priceRange: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
    },
    keywords: [{ type: String }],
    houseType: [{ type: Number }],
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      radius: { type: Number },
    },
    province: { type: String },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

filterSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    ret.userId = ret.userId.toString();
  },
});

const filterModel = model<Filter & Document>('Filter', filterSchema);
export default filterModel;
