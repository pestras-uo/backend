import { ObjectId } from "mongodb";
import { Role } from "../../auth/roles";
import { Doc } from "../core";

export enum UserTitle {
  MR,
  MS,
  MRS
}

export class UserProfile {
  middlename = "";
  mobiles: string[] = [];
  emails: string[] = [];
  address: string = "";
  pobox: string = "";

  constructor(public title: UserTitle, public firstname: string, public lastname: string) {}
}

export class User extends Doc {
  backupEmail?: [string, boolean];
  roles: Role[] = ["viewer"];
  groups: string[] = [];

  // projection values
  fullname?: string;

  constructor(
    public organization: ObjectId,
    public email: [string, boolean], 
    public username: string, 
    public profile: UserProfile
  ) {
    super();
  }
}