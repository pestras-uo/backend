export interface CreateOrganziationBody {
  name_ar: string;
  name_en: string;
  parent_id?: string;
}

export interface UpdateOrganziationName {
  name_ar: string;
  name_en: string;
}