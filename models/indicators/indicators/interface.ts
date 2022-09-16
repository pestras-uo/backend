export interface Indicator {
  ID: number;

  SERIAL: string;
  ORGUNIT_SERIAL: string;
  TOPIC_SERIAL: string;

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