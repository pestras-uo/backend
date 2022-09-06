export const Actions = [
  "*",

  // Users
  "users.*",
  "users.get.*",
  "users.get.many",
  "users.get.one",
  "users.get.inactive",
  "users.create",
  "users.update.*",
  "user.update.organziation",
  "users.update.username",
  "users.update.email",
  "users.update.password",
  "users.update.profile",
  "users.update.roles",
  "users.update.active",


  // Documents
  "documents.*",
  "documents.create",
  "documents.delete",

  
  // Organizations
  "orgs.*",
  "orgs.get.*",
  "orgs.get.one",
  "orgs.get.many",
  "orgs.create",
  "orgs.update.*",
  "orgs.update.name",
  "orgs.update.tags"

] as const;

export type Action = typeof Actions[number];