export function omit<T = any, U extends Object = any>(src: U, props: (keyof U)[]): T {
  const output = {} as T;

  for (const prop in src)
    if (!props.includes(prop as keyof U))
      (output as any)[prop] = src[prop];

  return output;
}

export function pick<T = any, U extends Object = any>(src: U, props: (keyof U)[]): T {
  const output = {} as T;

  for (const prop in props)
    (output as any)[prop] = (src as any)[prop];

  return output;
}