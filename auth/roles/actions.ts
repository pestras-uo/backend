export const Actions = [
  "*",

  // Users
  "users.*",
  "users.get.*",
  "users.get.all",
  "users.get.one",
  "users.get.inactive",
  "users.get.by-orgunit",
  "users.create",
  "users.update.*",
  "users.update.orgunit",
  "users.update.username",
  "users.update.email",
  "users.update.password",
  "users.update.groups",
  "users.update.roles",
  "users.update.active",


  // Groups
  "groups.*",
  "groups.get.*",
  "groups.get.all",
  "groups.get.one",
  "groups.create",
  "groups.update",

  // Documents
  "documents.*",
  "documents.create",
  "documents.delete",

  
  // Orgunits
  "orgunits.*",
  "orgunits.get.*",
  "orgunits.get.one",
  "orgunits.get.many",
  "orgunits.create",
  "orgunits.update.*",
  "orgunits.update.name",
  "orgunits.update.tags",

  // Categories
  "categories.*",
  "categories.get.all",
  "categories.get.one",
  "categories.create",
  "categories.update",

  // tags
  "tags.*",
  "tags.get.*",
  "tags.get.keys",
  "tags.get.values",
  "tags.create.*",
  "tags.create.key",
  "tags.create.value",
  "tags.update.*",
  "tags.update.key",
  "tags.update.value"

] as const;

export type Action = typeof Actions[number];