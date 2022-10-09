import { Validall } from "@pestras/validall";

export enum GroupsValidators {
  CREATE = 'createGroup',
  UPDATE = 'updateGroup',
  UPDATE_ROLES = 'updateGroupRoles',
  UPDATE_ORGUNIT = 'updateGroupOrgunit'
}

new Validall(GroupsValidators.CREATE, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' },
  roles: { 
    $is: 'notEmpty', 
    $required: true,
    $message: 'rolesAreRequired',
    $each: { $type: 'string', $inRange: [0, 5], $message: 'invalidGroupRole' }
  }
});

new Validall(GroupsValidators.UPDATE, {
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' }
});

new Validall(GroupsValidators.UPDATE_ROLES, {
  roles: { 
    $is: 'notEmpty', 
    $required: true,
    $message: 'rolesAreRequired',
    $each: { $type: 'string', $enum: [0, 5], $message: 'roleIsRequired' }
  }
});

new Validall(GroupsValidators.UPDATE_ORGUNIT, {
  orgunit_id: { $type: 'string', $required: true, $message: 'orgunitIdIsRequired' }
});