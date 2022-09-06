export interface CreateOrganziationBody {
  name: string;
  tags: string[];
}

export interface UpdateOrganziationName {
  name: string;
}

export interface UpdateOrganziationTags {
  tags: string[];
}