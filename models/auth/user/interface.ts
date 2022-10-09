import { Role } from "../../../auth/roles";
import { Group } from "../groups/interface";

interface userBase {
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

export interface DBUser extends userBase {
  roles: string;
  groups: string;  
}

export interface User extends userBase {
  groups: Group[];
  roles: Role[];
}