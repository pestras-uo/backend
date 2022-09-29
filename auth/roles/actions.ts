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

  
  // Orgunits
  "orgunits.*",
  "orgunits.get.*",
  "orgunits.get.one",
  "orgunits.get.many",
  "orgunits.create",
  "orgunits.update.*",
  "orgunits.update.name",

  // Categories
  "categories.*",
  "categories.get.all",
  "categories.get.one",
  "categories.create",
  "categories.update",

  // topics
  "topics.*",
  "topics.get.*",
  "topics.get.all",
  "topics.get.one",
  "topics.get.documents",
  "topics.create.*",
  "topics.create.one",
  "topics.create.documents",
  "topics.update.*",
  "topics.update.one",
  "topics.update.groups",
  "topics.update.categories",
  "topics.delete.*",
  "topics.delete.documents",

  // indicators
  "indicators.*",
  "indicators.get.*",
  "indicators.get.topic",
  "indicators.get.orgunit",
  "indicators.get.one",
  "indicators.get.documents",
  "indicators.create.*",
  "indicators.create.one",
  "indicators.create.documents",
  "indicators.update.*",
  "indicators.update.one",
  "indicators.update.orgunit",
  "indicators.update.topic",
  "indicators.update.activate",
  "indicators.update.groups",
  "indicators.update.categories",
  "indicators.delete.*",
  "indicators.delete.documents",

  // indicator config
  "indicators.config.*",
  "indicators.config.get.one",
  "indicators.config.get.arguments",
  "indicators.config.create",
  "indicators.config.update.*",
  "indicators.config.update.intervals",
  "indicators.config.update.kpis",
  "indicators.config.update.equation",
  "indicators.config.update.evaluation-day",
  "indicators.config.update.readings-view",

  // readings
  "readings.*",
  "readings.get.*",
  "readings.get.all",
  "readings.get.one",
  "readings.get.categories",
  "readings.get.documents",
  "readings.create.*",
  "readings.create.one",
  "readings.create.documents",
  "readings.update.*",
  "readings.update.one",
  "readings.update.approve",
  "readings.update.categories",
  "readings.delete.*",
  "readings.delete.one",
  "readings.delete.documents",
  
] as const;

export type Action = typeof Actions[number];