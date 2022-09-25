export interface CreateTopicBody {
  name_ar: string;
  name_en: string;
  desc_ar?: string;
  desc_en?: string;
  parent?: string;
  groups?: string[];
  categories?: string[];
}

export interface UpdateTopicBody {
  name_ar: string;
  name_en: string;
  desc_ar?: string;
  desc_en?: string;
}

export interface UpdateTopicGroups {
  groups: string[];
}

export interface UpdateTopicCategories {
  categories: string[];
}

export interface AddTopicDocument {
  name_ar: string,
  name_en: string,
  document: any
}