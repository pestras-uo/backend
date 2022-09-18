export interface User {
  ID: string;
  ORGUNIT_ID: string;

  USERNAME: string;
  IS_ACTIVE: number;

  // document id
  AVATAR?: string;

  FULLNAME: string;
  EMAIL?: string;
  MOBILE?: string;

  CREATE_DATE: Date;
  UPDATE_DATE?: Date;
}

export interface UserDetails extends User {
  GROUPS: string[];
  ROLES: number[];
}

export interface UserDetailsQueryResultItem extends User {
  GROUP_ID: string;
  ROLE_ID: number;
}