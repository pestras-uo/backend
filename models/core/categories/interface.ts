export enum CategoryType {
  TOPIC,
  INDICATOR,
  READING
}

export interface Category {
  id: string;

  name_ar: string;
  name_en: string;

  type: CategoryType;
}