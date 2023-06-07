export interface Building {
    bathroomTotal: string;
    bedroomsTotal: string;
    bedroomsAboveGround: string;
    bedroomsBelowGround: string;
    basementDevelopment: string;
    basementType: string;
    constructionStyleAttachment: string;
    coolingType: string;
    exteriorFinish: string;
    fireplacePresent: string;
    heatingFuel: string;
    heatingType: string;
    sizeInterior?: any;
    storiesTotal: string;
    type: string;
}

export interface Land {
    sizeTotalText: string;
    acreage: string;
    amenities: string;
    sizeIrregular: string;
}

export interface Address {
    streetAddress: string;
    addressLine1: string;
    streetNumber: string;
    streetName: string;
    streetSuffix: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    communityName: string;
    longitude: string;
    latitude: string;
}

export interface Phone {
    contactType: string;
    phoneType: string;
    text: string;
}

export interface Website {
    contactType: string;
    websiteType: string;
    text: string;
}

export interface Websites {
    website: Website;
}

export interface Office {
    id: string;
    lastUpdated: string;
    name: string;
    address: Address;
    phones: Phone[];
    websites: Websites;
    organizationType: string;
}

export interface Agent {
    id: string;
    name: string;
    phones: Phone[];
    websites: Websites;
    office: Office[];
    photoLastUpdated: string;
    position: string;
}

export interface Property {
    id: string;
    listingId: string;
    url: string;
    building: Building;
    land: Land;
    address: Address;
    agent: Agent[];
    nearBy: string;
    features: string;
    ownershipType: string;
    images: string[];
    pollType: any;
    price: number;
    lease: number;
    leasePerUnit: string;
    propertyType: string;
    transactionType: string;
    description: string;
    lastUpdated: Date;
}
