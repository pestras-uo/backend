import { Validall } from "@pestras/validall";

export enum ReadingsValidators {
  GET_ALL = 'getAllReadingsQuery',
  CREATE = 'createReading',
  UPDATE = 'updateReading',
  UPDATE_CATEGORIES = 'updateReadingCategories',
  ADD_DOCUMENT = 'addReadingDocument',
  DELETE_DOCUMENT = 'deleteReadingDocument'
}

new Validall(ReadingsValidators.DELETE_DOCUMENT, {
  offset: { $type: 'string', $cast: 'number', $required: true, $message: 'offsetIsRequired' },
  limit: { $type: 'string', $cast: 'number', $required: true, $message: 'limitIsRequired' }
});

new Validall(ReadingsValidators.CREATE, {
  reading_value: { $type: 'number', $required: true, $message: 'valueIsRequired' },
  reading_date: { $type: 'string', $cast: 'date', $required: true, $message: 'readingDateIsRequired' },
  note_ar: { $type: 'string', $nullable: true, $message: 'invalidDescAr' },
  note_en: { $type: 'string', $nullable: true, $message: 'invalidDescEn' }
});

new Validall(ReadingsValidators.UPDATE, {
  reading_value: { $type: 'number', $required: true, $message: 'valueIsRequired' },
  reading_date: { $type: 'string', $cast: 'date', $required: true, $message: 'readingDateIsRequired' },
  note_ar: { $type: 'string', $nullable: true, $message: 'invalidDescAr' },
  note_en: { $type: 'string', $nullable: true, $message: 'invalidDescEn' }
});

new Validall(ReadingsValidators.UPDATE_CATEGORIES, {
  categories: { $default: [], $each: { $type: 'string', $message: 'invalidCategory' } }
});

new Validall(ReadingsValidators.ADD_DOCUMENT, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' },
  document: { $required: true, $message: 'documentIsRequired' }
});

new Validall(ReadingsValidators.DELETE_DOCUMENT, {
  path: { $type: 'string', $required: true, $message: 'documentPathIsRequired' }
});