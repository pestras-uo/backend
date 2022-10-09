import { Validall } from "@pestras/validall";

export enum IndicatorsValidators {
  CREATE = 'createIndicator',
  UPDATE = 'updateIndicator',
  UPDATE_ORGUNIT = 'updateIndicatorOrgunit',
  UPDATE_TOPIC = 'updateIndicatorTopic',
  UPDATE_CATEGORIES = 'updateIndicatorCategories',
  ADD_DOCUMENT = 'addIndicatorDocument',
  DELETE_DOCUMENT = 'deleteIndicaotDocument'
}

new Validall(IndicatorsValidators.CREATE, {
  orgunit_id: { $type: 'string', $required: true, $message: 'orgunitIdIsRequired' },
  topic_id: { $type: 'string', $required: true, $message: 'topicIdIsRequired' },

  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' },

  desc_ar: { $type: 'string', $default: '', $message: 'invalidDescAr' },
  desc_en: { $type: 'string', $default: '', $message: 'invalidDescEn' },

  unit_ar: { $type: 'string', $default: '%', $message: 'invalidUnitAr' },
  unit_en: { $type: 'string', $default: '%', $message: 'invalidUnitEn' },

  categories: { $default: [], $each: { $type: 'string', $message: 'invalidCategory' } },
  
  parent_id: { $type: 'string', $default: '', $message: 'invalidParentId' }
});

new Validall(IndicatorsValidators.UPDATE, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' },

  desc_ar: { $type: 'string', $default: '', $message: 'invalidDescAr' },
  desc_en: { $type: 'string', $default: '', $message: 'invalidDescEn' },

  unit_ar: { $type: 'string', $default: '%', $message: 'invalidUnitAr' },
  unit_en: { $type: 'string', $default: '%', $message: 'invalidUnitEn' }
});

new Validall(IndicatorsValidators.UPDATE_ORGUNIT, {
  orgunit_id: { $type: 'string', $required: true, $message: 'orgunitIdIsRequired' }
});

new Validall(IndicatorsValidators.UPDATE_TOPIC, {
  topic_id: { $type: 'string', $required: true, $message: 'topicIdIsRequired' }
});

new Validall(IndicatorsValidators.UPDATE_CATEGORIES, {
  categories: { $default: [], $each: { $type: 'string', $message: 'invalidCategory' } }
});

new Validall(IndicatorsValidators.ADD_DOCUMENT, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' },
  document: { $required: true, $message: 'documentIsRequired' }
});

new Validall(IndicatorsValidators.DELETE_DOCUMENT, {
  path: { $type: 'string', $required: true, $message: 'documentPathIsRequired' }
});