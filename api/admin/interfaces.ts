import { Role } from "../../auth/roles";
import { User, UserTitle } from "../../models/user/doc";

export interface CreateUserBody {
  organization: string;
  username: string;
  email: string;
  password: string;
  firstname: string;
  middlename: string;
  lastname: string;
  mobiles: string[];
  address: string;
  pobox: string;
  title: UserTitle;
  roles: Role[];
}

export interface UpdateRolesBody {
  roles: Role[];
}

export interface ChangeOrganziation {
  organization: string;
}