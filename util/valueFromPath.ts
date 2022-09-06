export default function (obj: any, path: string) {
  if (!path || !obj || typeof obj !== "object")
    return undefined;
    
  const blocks = path.split(".");

  while (blocks.length > 1) {
    const curr = blocks.shift() as string;
    obj = obj[curr];

    if (!obj)
      return undefined;
  }

  return obj ? obj[blocks[0]] : undefined;
}