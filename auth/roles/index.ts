import { Action } from "./actions";

const RolesMap = new Map<number, Action[]>();

// root
RolesMap.set(0, ["*"]);
// admin
RolesMap.set(1, ["users.*", "groups.*", "orgunits.*"]);
// author
RolesMap.set(2, ["categories.*", "topics.*", "indicators.*", "indicator-config.*"]);
// analyst
RolesMap.set(3, ["indicator-stats.*"]);
// contributer
RolesMap.set(4, ["indicator-readings.*"]);
// viewer
RolesMap.set(5, [
  "users.get.one",
  "groups.get.*",
  "orgunits.get.*",
  "categories.get.*",
  "topics.get.*",
  "indicators.get.*",
  "indicator-config.get.*",
  "indicator-readings.get.*",
  "indicator-stats.get.*"
]);

const RolesList = Array.from(RolesMap.keys());

export { RolesMap, RolesList };