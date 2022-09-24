export interface CreateTopicBody {
  name_ar: string;
  name_en: string;
  desc_ar: string;
  desc_en: string;

  groups: string[];
  categories: string[];
}