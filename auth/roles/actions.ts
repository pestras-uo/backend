export const Actions = [
  "*",

  // Users
  "users.*",
  "users.get.*",
  "users.get.all",
  "users.get.one",
  "users.get.inactive",
  "users.get.by-orgunit",
  "users.create.*",
  "users.create.one",
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
  "groups.create.*",
  "groups.create.one",
  "groups.update.*",
  "groups.update.one",
  "groups.update.actions",
  "groups.update.orgunit",

  
  // Orgunits
  "orgunits.*",
  "orgunits.get.*",
  "orgunits.get.one",
  "orgunits.get.many",
  "orgunits.create.*",
  "orgunits.create.one",
  "orgunits.update.*",
  "orgunits.update.one",

  // Categories
  "categories.*",
  "categories.get.*",
  "categories.get.all",
  "categories.get.one",
  "categories.create.*",
  "categories.create.one",
  "categories.update.*",
  "categories.update.one",

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
  "indicator-config.*",
  "indicator-config.get.*",
  "indicator-config.get.one",
  "indicator-config.get.arguments",
  "indicator-config.create.*",
  "indicator-config.create.manual",
  "indicator-config.create.computational",
  "indicator-config.create.external",
  "indicator-config.create.split",
  "indicator-config.update.*",
  "indicator-config.update.one",
  "indicator-config.update.state",
  "indicator-config.update.external",

  // readings
  "indicator-readings.*",
  "indicator-readings.get.*",
  "indicator-readings.get.all",
  "indicator-readings.get.one",
  "indicator-readings.get.categories",
  "indicator-readings.get.documents",
  "indicator-readings.create.*",
  "indicator-readings.create.one",
  "indicator-readings.create.documents",
  "indicator-readings.update.*",
  "indicator-readings.update.one",
  "indicator-readings.update.approve",
  "indicator-readings.update.categories",
  "indicator-readings.delete.*",
  "indicator-readings.delete.one",
  "indicator-readings.delete.documents",

  // stats
  "indicator-stats-results.*",
  "indicator-stats-results.get.*",
  "indicator-stats-results.get.one"
  
] as const;

export type Action = typeof Actions[number];