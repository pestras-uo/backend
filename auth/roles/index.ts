import { Action } from "./actions";

const RolesMap = new Map<number, Action[]>();

// root
RolesMap.set(0, ["*"]);
// admin
RolesMap.set(1, ["*"]);
// viewer
RolesMap.set(2, ["users.get.one"]);

const RolesList = Array.from(RolesMap.keys());

export { RolesMap, RolesList };