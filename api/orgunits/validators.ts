import { Validall } from "@pestras/validall";

enum OrgunitsValidators {
  CREATE = "createOrgunit",
  UPDATE_NAME = "updateOrgunitName"
}

new Validall(OrgunitsValidators.CREATE, {
  name_ar: { $type: 'string', $required: true, $message: 'orgunitNameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'orgunitNameEnIsRequired' },
  parent_id: { $type: 'string', $default: '', $message: 'invalidParentId' }
});

new Validall(OrgunitsValidators.UPDATE_NAME, {
  name_ar: { $type: 'string', $required: true, $message: 'orgunitNameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'orgunitNameEnIsRequired' }
});

export default OrgunitsValidators;