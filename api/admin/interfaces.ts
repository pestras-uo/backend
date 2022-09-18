export interface CreateUserBody {
  orgunit: string;
  username: string;
  password: string;
  roles: number[];
}

export interface UpdateRolesBody {
  roles: number[];
}

export interface ChangeOrgunit {
  orgunit: string;
}

export interface UpdateGroupsBody {
  groups: string[];
}