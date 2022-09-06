import { Validall } from "@pestras/validall";

enum DocumentValidators {
  CREATE = "createDocument"
}

new Validall(DocumentValidators.CREATE, {
  name: { $type: 'string', $required: true, $message: 'nameIsRequired' },
  groups: {
    $default: [],
    $each: {
      $type: 'string',
      $message: 'invalidDocumentGroup'
    }
  }
});

export default DocumentValidators;