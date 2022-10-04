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
  "indicators.config.get.*",
  "indicators.config.get.one",
  "indicators.config.get.arguments",
  "indicators.config.create.*",
  "indicators.config.create.manual",
  "indicators.config.create.computational",
  "indicators.config.create.view",
  "indicators.config.update.*",
  "indicators.config.update.one",

  // readings
  "indicators.readings.*",
  "indicators.readings.get.*",
  "indicators.readings.get.all",
  "indicators.readings.get.one",
  "indicators.readings.get.categories",
  "indicators.readings.get.documents",
  "indicators.readings.create.*",
  "indicators.readings.create.one",
  "indicators.readings.create.documents",
  "indicators.readings.update.*",
  "indicators.readings.update.one",
  "indicators.readings.update.approve",
  "indicators.readings.update.categories",
  "indicators.readings.delete.*",
  "indicators.readings.delete.one",
  "indicators.readings.delete.documents",

  // stats
  "indicators.stats.*",
  "indicators.stats.get.*",
  "indicators.stats.get.indicator",
  "indicators.stats.get.one",
  "indicators.stats.create.*",
  "indicators.stats.create.one",
  "indicators.stats.update.*",
  "indicators.stats.update.one"
  
] as const;

export type Action = typeof Actions[number];