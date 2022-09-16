export interface CreateUserBody {
  orgunit: number;
  username: string;
  password: string;
  roles: number[];
}

export interface UpdateRolesBody {
  roles: number[];
}

export interface ChangeOrgunit {
  orgunit: number;
}