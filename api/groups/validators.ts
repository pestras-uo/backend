import { Validall } from "@pestras/validall";

export enum GroupsValidators {
  CREATE = 'createGroup',
  UPDATE = 'updateGroup'
}

new Validall(GroupsValidators.CREATE, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' }
});

new Validall(GroupsValidators.UPDATE, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' }
});