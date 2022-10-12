import { ColumnType, FilterOptions } from "./config/interface";

export const systemColumns = {
  id: {
    name: "id",
    name_ar: "id",
    name_en: "id",
    type: ColumnType.ID,
    is_system: true
  },
  is_approved: {
    name: "is_approved",
    name_ar: "معتمد",
    name_en: "Approved",
    type: ColumnType.NUMBER,
    is_system: true
  },
  approve_date: {
    name: "approve_date",
    name_ar: "تاريخ الإعتماد",
    name_en: "Approval Date",
    type: ColumnType.DATE,
    is_system: true
  },
  create_date: {
    name: "create_date",
    name_ar: "تاريخ الإدخال",
    name_en: "Entry Date",
    type: ColumnType.DATE,
    is_system: true
  },
  create_by: {
    name: "create_by",
    name_ar: "إدخال من قبل",
    name_en: "Entry By",
    type: ColumnType.REF,
    is_system: true
  },
  update_date: {
    name: "update_date",
    name_ar: "تاريخ التعديل",
    name_en: "Update Date",
    type: ColumnType.DATE,
    is_system: true
  },
  update_by: {
    name: "update_by",
    name_ar: "تعديل من قبل",
    name_en: "Update By",
    type: ColumnType.REF,
    is_system: true
  },
  history: {
    name: "history",
    name_ar: "التعديلات السابقة",
    name_en: "History",
    type: ColumnType.JSON,
    is_system: true
  }
} as const;

export function mapColumnTypeToDbType(type: ColumnType) {
  switch (type) {
    case ColumnType.ID:
    case ColumnType.REF:
      return 'VARCHAR(36) NOT NULL';
    case ColumnType.BOOL:
      return 'NUMBER(1) NOT NULL';
    case ColumnType.CATEGORY:
      return 'VARCHAR(64) NOT NULL';
    case ColumnType.DATE:
      return 'DATE NOT NULL';
    case ColumnType.NUMBER:
      return 'NUMBER NOT NULL';
    case ColumnType.JSON:
      return 'VARCHAR(1024) NOT NULL';
    default:
      return 'VARCHAR(256)';
  }
}



// where formatter
// ==============================================================================================
function toDate(d: Date) {
  const year = d.getFullYear();
  const month = d.getMonth() <= 8 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
  const day = d.getDate() <= 8 ? "0" + (d.getDate() + 1) : d.getDate() + 1;
  return `to_date('${year}-${month}-${day}','YYYY-MM-DD')`;
}

function getBlockValue(block: string | number): string | number {
  if (typeof block === 'string') {
    if (block.indexOf('@date:') === 0)
      return toDate(new Date(block.slice(6)));

    else if (block.indexOf('@year:') === 0)
      return `YEAR(${getBlockValue(block.slice(6))})`;

    else if (block.indexOf('@month:') === 0)
      return `MONTH(${getBlockValue(block.slice(7))})`;

    else if (block.indexOf('@day:') === 0)
      return `DAY(${getBlockValue(block.slice(5))})`;

    else if (block.charAt(0) === '$')
      return block.slice(1);

    else if (block.toLowerCase() !== "null" && block.toLowerCase() !== "not null")
      return `'${block}'`;
  }

  return block;
}

export function buildWhereClause(filterOptions: FilterOptions) {
  let clause = "";
  const operator = filterOptions.and ? 'and' : 'or';
  const blocks = filterOptions[operator];

  if (!blocks)
    return "";

  for (const block of blocks)
    if (Array.isArray(block))
      clause += ` ${operator} ${getBlockValue(block[0])} ${block[1]} ${getBlockValue(block[2])}`;
    else
      clause += ` ${operator} ${buildWhereClause(block)}`;

  return `(${clause.slice(operator.length + 2)})`;
}