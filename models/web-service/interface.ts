export enum WebServiceInterval {
  MONTHLY = 1,
  QUARTERLY = 3,
  BIANNUAL = 6,
  ANNUAL = 12
}

export enum WebServiceState {
  IDLE,
  PENDING
}

export interface IndicatorWebServiceConfig {
  id: string;

  resource_uri: string;
  username?: string;
  password?: string;
  access_token?: string;
  query?: string;
  data_path?: string;

  intervals?: WebServiceInterval;
  evaluation_day?: number;
  is_cumulative?: 1 | 0;

  values_columns: string;
  additional_columns: string;

  state: WebServiceState
}