export interface CreateIndicatorBody {
  orgunit_id: string;
  topic_id: string;

  name_ar: string;
  name_en: string;
  desc_ar?: string;
  desc_en?: string;
  unit_ar?: string;
  unit_en?: string;

  parent?: string;
}

export interface UpdateIndicatorBody {
  name_ar: string;
  name_en: string;
  desc_ar?: string;
  desc_en?: string;
  unit_ar?: string;
  unit_en?: string;
}

export interface UpdateIndicatorOrgunitBody {
  orgunit: string;
}

export interface UpdateIndicatorTopicBody {
  topic: string;
}

export interface UpdateIndicatorCategoriesBody {
  categories: string[];
}

export interface UpdateIndicatorGroupsBody {
  groups: string[];
}

export interface UpdateIndicatorTagsBody {
  tags: string[];
}

export interface AddIndicatorDocumentBody {
  name_ar: string;
  name_en: string;
  document: any;
}