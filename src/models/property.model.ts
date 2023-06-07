import { model, Schema, PaginateModel, Document } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { Property } from '@/interfaces/property.interface';

const propertySchema: Schema = new Schema({
  id: {
    type: String,
  },
  listingId: {
    type: String,
  },
  url: {
    type: String,
  },
  building: {
    type: Object,
  },
  land: {
    type: Object,
  },
  address: {
    type: Object,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  agent: [
    {
      type: Object,
    },
  ],
  nearBy: {
    type: String,
  },
  features: {
    type: String,
  },
  ownershipType: {
    type: String,
  },
  images: [
    {
      type: String,
    },
  ],
  poolType: {
    type: String,
  },
  price: {
    type: Number,
  },
  lease: {
    type: Number,
  },
  leasePerUnit: {
    type: String,
  },
  propertyType: {
    type: String,
  },
  transactionType: {
    type: String,
  },
  description: {
    type: String,
  },
  lastUpdated: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
});

propertySchema.plugin(paginate);

propertySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

propertySchema.index({ location: '2dsphere' });
propertySchema.index({ isDeleted: 1, deletedAt: -1 });

const propertyModel = model<Property & Document, PaginateModel<Property & Document>>('Property', propertySchema);
export default propertyModel;
