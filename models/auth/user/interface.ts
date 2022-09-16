export interface User {
  ID: number;
  ORGUNIT_ID: number;

  USERNAME: string;
  IS_ACTIVE: number;

  // document id
  AVATAR?: number;

  FULLNAME: string;
  EMAIL?: string;
  MOBILE?: string;

  CREATE_DATE: Date;
  UPDATE_DATE?: Date;
}

export interface UserDetails extends User {
  GROUPS: number[];
  ROLES: number[];
}

export interface UserDetailsQueryResultItem extends User {
  GROUP_ID: number;
  ROLE_ID: number;
}