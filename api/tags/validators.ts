import { Validall } from "@pestras/validall";

export enum TagsValidators {
  CREATE_KEY = 'createTagKey',
  CREATE_VALUE = 'createTagValue',
  UPDATE_KEY = 'updateTagKey',
  UPDATE_VALUE = 'updateTagValue'
}

new Validall(TagsValidators.CREATE_KEY, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' }
});

new Validall(TagsValidators.CREATE_VALUE, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' }
});

new Validall(TagsValidators.UPDATE_KEY, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' }
});

new Validall(TagsValidators.UPDATE_VALUE, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' }
});