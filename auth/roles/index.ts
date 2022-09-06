import { Action } from "./actions";

export const RolesList = ["root", "admin", "viewer"] as const;
export type Role = typeof RolesList[number];

const RolesMap = new Map<typeof RolesList[number], (Action | Role)[]>();

RolesMap.set("root", ["*"]);
RolesMap.set("admin", ["*"]);
RolesMap.set("viewer", ["users.get.one"]);

export { RolesMap };