export interface Indicator {
  ID: string;
  ORGUNIT_ID: string;
  TOPIC_ID: string;

  NAME_AR: string;
  NAME_EN: string;

  DESC_AR?: string;
  DESC_EN?: string;

  UNIT_AR?: string;
  UNIT_EN?: string;

  INTERVALS?: number;

  KPI_MIN?: number;
  KPI_MAX?: number;

  EQUATION?: string;

  IS_ACTIVE: 1 | 0;

  CREATE_DATE: Date;
  UPDATE_DATE?: Date;
}

export interface IndicatorDetails extends Indicator {
  GROUPS: number[];
  CATEGORIES: number[];
}

export interface IndicatorDetailsQueryResultItem extends Indicator {
  GROUP_ID: number;
  CATEGORY_ID: number;
}

export interface Arguments extends Indicator {
  VARIABLE: string;
}