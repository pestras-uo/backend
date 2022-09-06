import { Validall } from "@pestras/validall";

enum OrgValidators {
  CREATE = "createOrganization",
  UPDATE_NAME = "updateOrganizationName",
  UPDATE_TAGS = "updateOrganizationTags"
}

new Validall(OrgValidators.CREATE, {
  name: { $type: 'string', $required: true, $message: 'organizationNameIsRequired' },
  tags: {
    $default: [],
    $each: { $type: 'string', $message: 'invalidOrganizationTag' }
  }
});

new Validall(OrgValidators.UPDATE_NAME, {
  name: { $type: 'string', $required: true, $message: 'organizationNameIsRequired' }
});

new Validall(OrgValidators.UPDATE_TAGS, {
  tags: {
    $default: [],
    $each: { $type: 'string', $message: 'invalidOrganizationTag' }
  }
});

export default OrgValidators;