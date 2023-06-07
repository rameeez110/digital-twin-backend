import { Filter } from '@interfaces/filter.interface';
import filterModel from '@/models/filter.model';
import propertyModel from '@/models/property.model';
import { Property } from '@/interfaces/property.interface';
import { Document, PaginateResult } from 'mongoose';
import { LocationDto } from '@/dtos/filter.dto';
import { PropertySelectionDto } from '@/dtos/property-selection.dto';
import propertySelectionModel from '@/models/property-selection.models';
import { HouseType } from '@/enums/housetype.enum';
import { HttpException } from '@/exceptions/HttpException';
import invitationModel from '@/models/invitation.model';
import { InvitationStatus } from '@/enums/invitation-status.enum';

class PropertyService {
  public filters = filterModel;
  public properties = propertyModel;
  public propertySelections = propertySelectionModel;
  public invitations = invitationModel;

  private HouseTypeMapping = {
    [HouseType.DETATCHED]: 'Detached',
    [HouseType.SEMI_DETATCHED]: 'Semi-detached',
    [HouseType.OTHER]: 'Other',
  }

  public async search(userId: string, page: number, limit: number): Promise<PaginateResult<Property>> {
    const query = await this.getSavedFilters(userId);
    const res = await this.properties.paginate(query, {
      page,
      limit,
      forceCountFn: true
    });
    res.docs = res.docs.map(item => item.toJSON() as any);
    return res;
  }

  public async searchByLocation(userId: string, location: LocationDto, page: number, limit: number) {
    const query = await this.getSavedFilters(userId);
    query['location'] = {
      $near: {
        $maxDistance: location?.radius * 1000,
        $geometry: {
          type: 'Point',
          coordinates: [location?.longitude, location?.latitude],
        }
      }
    };
    const res = await this.properties.paginate(query, {
      page,
      limit,
      forceCountFn: true
    });
    res.docs = res.docs.map(item => item.toJSON() as any);
    return res;
  }

  public async setPropertyStatus(userId: string, body: PropertySelectionDto) {
    await this.propertySelections.create({
      userId,
      ...body
    })
  }

  public async getSelectedProperties(userId: string) {
    const data = await this.propertySelections.find({
      userId,
    }).populate('property');
    return data.map(x => x.toJSON());
  }

  public async getSelectedPropertiesByClient(userId: string, clientId: string) {
    const hasAccess = await this.invitations.exists({
      fromUserId: userId, 
      toUserId: clientId,
      status: InvitationStatus.ACCEPTED
    });
    if (!hasAccess) throw new HttpException(400, "You doesn't have access to this client");

    const data = await this.propertySelections.find({
      userId: clientId,
    }).populate('property');
    return data.map(x => x.toJSON());
  }

  public async deleteSelectedProperty(userId: string, propertyId: string) {
    if (!propertyId) throw new HttpException(400, "Property Id missing or invalid");
    await this.propertySelections.remove({
      userId,
      propertyId
    })
  }

  private async getSavedFilters(userId: string, locationFilter = true) {
    const filter: Filter = await this.filters.findOne({ userId });
    const selectedProperties = await this.propertySelections.find({ userId }).select({ propertyId: 1 });
    const propertyIds = selectedProperties.map(x => x.propertyId);

    const query: any = {
      'id': { $nin: propertyIds },
      'transactionType': 'For sale',
      'address.province': { $in: ['British Columbia', 'Ontario'] },
      '$and': [],
      '$or': [],
      'isDeleted': false
    };

    if (filter?.bathroom?.length) {
      if (filter?.bathroom.includes(6)) {
        query['$and'].push({
          '$or': [
            { 'building.bathroomTotal': { $in: filter.bathroom.map(i => i.toString()) } },
            { 'building.bathroomTotal': { $gt: '6' } }
          ]
        });
      } else {
        query['$and'].push({
          'building.bathroomTotal': { $in: filter.bathroom.map(i => i.toString()) }
        })
      }
    }

    if (filter?.bedroom?.length) {
      if (filter?.bedroom.includes(6)) {
        query['$and'].push({
          '$or': [
            { 'building.bedroomsTotal': { $in: filter.bedroom.map(i => i.toString()) } },
            { 'building.bedroomsTotal': { $gt: '6' } }
          ]
        });
      } else {
        query['$and'].push({
          'building.bedroomsTotal': { $in: filter.bedroom.map(i => i.toString()) }
        })
      }
    }

    if (!query['$and'].length)
      delete query['$and'];

    // if (filter?.city) query['address.city'] = {
    //   $regex: new RegExp(filter.city),
    //   $options: 'i'
    // };
    if (filter?.keywords?.length) query['$text'] = {
      $search: filter?.keywords.join(' ')
    };
    if (filter?.houseType?.length) {

      filter.houseType.forEach(type => {
        switch (type) {
          case HouseType.DETATCHED:
            query['$or'].push({
              '$and': [
                { 'propertyType': 'Single Family' },
                { 'building.type': { $in: ['House', 'Manufactured Home', 'Manufactured Home/Mobile'] } },
                { 'building.constructionStyleAttachment': 'Detached' }
              ]
            });
            break;
          case HouseType.SEMI_DETATCHED:
            query['$or'].push({
              '$and': [
                { 'propertyType': 'Single Family' },
                { 'building.type': { $in: ['House', 'Manufactured Home', 'Manufactured Home/Mobile'] } },
                { 'building.constructionStyleAttachment': 'Semi-detached' }
              ]
            });
            break;
          case HouseType.TOWNHOUSE:
            query['$or'].push({
              '$and': [
                { 'propertyType': 'Single Family' },
                { 'building.type': 'Row / Townhouse' },
                {
                  'building.constructionStyleAttachment': {
                    $in: [
                      'Detached',
                      'Front and back',
                      'Link',
                      'Side by side',
                      'Stacked',
                      'Up and down'
                    ]
                  }
                }
              ]
            });
            break;
          case HouseType.CONDO:
            query['$or'].push({
              '$and': [
                { 'propertyType': 'Single Family' },
                { 'building.type': 'Apartment' }
              ]
            });
            break;
          case HouseType.MULTIPLEX:
            query['$or'].push({
              '$and': [
                { 'propertyType': 'Multi-family' }
              ]
            });
            break;
          case HouseType.OTHER:
            query['$or'].push({
              '$and': [
                { 'propertyType': 'Other' }
              ]
            });
            break;
        }
      });
    }

    if (filter?.priceRange?.min && filter?.priceRange?.max)
      query['price'] = {
        '$gte': filter?.priceRange?.min,
        '$lte': filter?.priceRange?.max
      }
    else if (filter?.priceRange?.min)
      query['price'] = {
        '$gte': filter?.priceRange?.min,
      }
    else if (filter?.priceRange?.max)
      query['price'] = {
        '$lte': filter?.priceRange?.max
      }

    if (locationFilter && filter?.location && filter?.location?.radius !== 0) {
      if (filter?.location?.radius >= 50) {
        query['address.province'] = filter?.province;
      } else {
        query['location'] = {
          $near: {
            $maxDistance: filter?.location?.radius * 1000,
            $geometry: {
              type: 'Point',
              coordinates: [filter?.location?.longitude, filter?.location?.latitude],
            }
          }
        };  
      }
    }

    if (!query['$or'].length)
      delete query['$or'];

    return query;
  }
}

export default PropertyService;
