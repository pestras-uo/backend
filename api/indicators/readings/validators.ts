import { Validall } from "@pestras/validall";

export enum ReadingsValidators {
  GET_ALL = 'getAllReadingsQuery',
  CREATE = 'createReading',
  UPDATE = 'updateReading',
  ADD_DOCUMENT = 'addReadingDocument',
  DELETE_DOCUMENT = 'deleteReadingDocument'
}

new Validall(ReadingsValidators.GET_ALL, {
  offset: { $type: 'string', $cast: 'number', $required: true, $message: 'offsetIsRequired' },
  limit: { $type: 'string', $cast: 'number', $required: true, $message: 'limitIsRequired' }
});

new Validall(ReadingsValidators.CREATE, {
  reading_value: { $type: 'number', $required: true, $message: 'readingValueIsRequired' }
});

new Validall(ReadingsValidators.UPDATE, {
  reading_value: { $type: 'number', $required: true, $message: 'valueIsRequired' }
});

new Validall(ReadingsValidators.ADD_DOCUMENT, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' },
  document: { $required: true, $message: 'documentIsRequired' }
});

new Validall(ReadingsValidators.DELETE_DOCUMENT, {
  path: { $type: 'string', $required: true, $message: 'documentPathIsRequired' }
});