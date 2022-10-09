import { Action } from "./actions";

export enum Role {
  ROOT,
  ADMIN,
  AUTHOR,
  ANALYST,
  CONTRIBUTER,
  VIEWER
}

export const RolesMap = new Map<Role, Action[]>();

// root
RolesMap.set(Role.ROOT, ["*"]);
// admin
RolesMap.set(Role.ADMIN, [
  "users.*",
  "groups.*",
  "orgunits.*"
]);
// author
RolesMap.set(Role.AUTHOR, [
  "users.get.*",
  "orgunits.get.*",
  "categories.*",
  "topics.*",
  "indicators.*",
  "indicator-config.*",
  "indicator-stats.get.*",
  "indicator-readings.get.*"
]);
// analyst
RolesMap.set(Role.ANALYST, [
  "users.get.*",
  "orgunits.get.*",
  "categories.get.*",
  "topics.get.*",
  "indicators.get.*",
  "indicator-config.get.*",
  "indicator-stats.*",
  "indicator-readings.get.*"
]);
// contributer
RolesMap.set(Role.CONTRIBUTER, [
  "users.get.*",
  "orgunits.get.*",
  "categories.get.*",
  "topics.get.*",
  "indicators.get.*",
  "indicator-config.get.*",
  "indicator-stats.get.*",
  "indicator-readings.*"
]);
// viewer
RolesMap.set(Role.VIEWER, [
  "users.get.*",
  "orgunits.get.*",
  "categories.get.*",
  "topics.get.*",
  "indicators.get.*",
  "indicator-config.get.*",
  "indicator-readings.get.*",
  "indicator-stats.get.*"
]);