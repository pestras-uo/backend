import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Document } from "../../misc/document/interface";
import { exists } from "./util";
import { randomUUID } from 'crypto';

export async function getDocuments(indicator_id: string) {
  return (await oracle.op().read<Document>(`
  
    SELECT D.*
    FROM ${TablesNames.DOCUMENTS} D, ${TablesNames.INDICATOR_DOCUMENT} ID
    WHERE ID.INDICATOR_ID = :a AND D.ID = ID.DOCUMENT_ID
  
  `, [indicator_id])).rows || [];
}

export async function addDocument(topic_id: string, path: string, name_ar: string, name_en: string) {
  if (!(await exists(topic_id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'topicNotFound');

  const doc_id = randomUUID();

  await oracle.op()
    .write(`

      INSERT INTO ${TablesNames.DOCUMENTS} (id, path, name_ar, name_en)
      VALUES (:a, :b, :c, :d)

    `, [doc_id, path, name_ar, name_en])
    .write(`
    
      INSERT INTO ${TablesNames.TOPIC_DOCUMENT} (topic_id, document_id)
      SET (:a, :b)
    
    `, [topic_id, doc_id])
    .commit();

  return true;
}

export async function deleteDocument(topic_id: string, doc_id: string) {
  await oracle.op()
    .write(`
    
      DELETE FROM ${TablesNames.TOPIC_DOCUMENT}
      WHERE topic_id = :a document_id = :b
    
    `, [topic_id, doc_id])
    .write(`

      DELETE FROM ${TablesNames.DOCUMENTS}
      WHERE id = :id
      
    `, [doc_id])
    .commit();

  return true;
}