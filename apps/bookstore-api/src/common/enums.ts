export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
};

export enum AllowedSortFields {
  POINTS = 'points',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'

  // We could have more fields here, if we ever want to expand
}

export enum AllowedSearchFields {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'

  // We can have here any common fields we want to search against (createdAt, and updatedAt are surely not the best use cases)
}

export enum Statuses {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELED = 'canceled'
};

export enum Roles {
  USER = 'user',
  SELLER = 'seller',
  ADMIN = 'admin'
};
