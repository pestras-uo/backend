import { Validall } from "@pestras/validall";

export enum TopicsValidators {
  CREATE = 'createTopic',
  UPDATE = 'updateTopic',
  UPDATE_CATEGORIES = 'updateTopicCategories',
  ADD_DOCUMENT = 'addTopicDocument',
  DELETE_DOCUMENT = 'deleteTopicDocument'
}

new Validall(TopicsValidators.CREATE, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' },
  desc_ar: { $type: 'string', $default: '', $message: 'invalidDescAr' },
  desc_en: { $type: 'string', $default: '', $message: 'invalidDescEn' },
  categories: { $default: [], $each: { $type: 'string', $message: 'invalidCategoriesId' } },
  parent_id: { $type: 'string', $default: '', $message: 'invalidParentId' }
});

new Validall(TopicsValidators.UPDATE, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' },
  desc_ar: { $type: 'string', $default: '', $message: 'invalidDescAr' },
  desc_en: { $type: 'string', $default: '', $message: 'invalidDescEn' }
});

new Validall(TopicsValidators.UPDATE_CATEGORIES, {
  categories: { $default: [], $each: { $type: 'string', $message: 'invalidCategoriesId' } }
});

new Validall(TopicsValidators.ADD_DOCUMENT, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' },
  document: { $required: true, $message: 'documentIsRequired' }
});

new Validall(TopicsValidators.DELETE_DOCUMENT, {
  path: { $type: 'string', $required: true, $message: 'documentPathIsRequired' }
});