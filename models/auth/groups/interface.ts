import { Role } from "../../../auth/roles";

export interface DBGroup {
  id: string;  
  orgunit_id: string;
  name_ar: string;
  name_en: string;
  roles: string;
}

export interface Group {
  id: string;  
  orgunit_id: string;
  name_ar: string;
  name_en: string;
  roles: Role[];
}