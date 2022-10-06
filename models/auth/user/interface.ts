export interface User {
  id: string;
  orgunit_id: string;

  username: string;
  is_active: number;

  // document id
  avatar?: string;

  fullname: string;
  email?: string;
  mobile?: string;

  create_date: Date;
  update_date?: Date;
}

export interface UserDetails extends User {
  groups: string[];
  roles: number[];
}

export interface UserDetailsQueryResultItem extends User {
  group_id: string;
  role_id: number;
}