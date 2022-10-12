import { Validall } from "@pestras/validall";
import { CategoryType } from "../../models/core/categories/interface";

export enum CategoriesValidators {
  CREATE = 'createCategory',
  UPDATE = 'updateCategories'
}

new Validall(CategoriesValidators.CREATE, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' },
  type: { $type: 'number', $default: CategoryType.TOPIC, $inRange: [CategoryType.TOPIC, CategoryType.READING] },
  parent: { $type: 'string', $default: '', $message: 'invalidParent' }
});

new Validall(CategoriesValidators.UPDATE, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' }
});