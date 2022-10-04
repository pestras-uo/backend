import { Validall } from "@pestras/validall";

export enum StatsConfigValidators {
  CREATE = 'createStatsConfig',
  UPDATE = 'updateStatsConfig'
}

new Validall(StatsConfigValidators.CREATE, {
  group_by_intervals: { $type: 'number', $enum: [0, 1], $default: 0 },
  group_by_column: { $type: 'string', $nullable: true }
});

new Validall(StatsConfigValidators.UPDATE, {
  group_by_intervals: { $type: 'number', $enum: [0, 1], $default: 0 },
  group_by_column: { $type: 'string', $nullable: true }
});