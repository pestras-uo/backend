import { TablesNames } from "../..";
import oracle from "../../../db/oracle";

export async function exists(id: string) {
  return (await oracle.op().query<{ count: number }>(`

     SELECT COUNT(id) as count
     FROM ${TablesNames.INDICATORS}
     WHERE id = :id

   `, [id])).rows?.[0].count! > 0;
}

export async function nameExists(name_ar: string, name_en: string) {
  return (await oracle.op().query<{ COUNT: number }>(`

     SELECT COUNT(name) as count
     FROM ${TablesNames.INDICATORS}
     WHERE name_ar = :name_ar OR name_en = :name_en

   `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
}

export async function updatedNameExists(id: string, name_ar: string, name_en: string) {
  return (await oracle.op().query<{ count: number }>(`

     SELECT COUNT(name) as count
     FROM ${TablesNames.INDICATORS}
     WHERE (name_ar = :name_ar OR name_en = :name_en) AND id <> :id

   `, [name_ar, name_en, id])).rows?.[0].count! > 0;
}