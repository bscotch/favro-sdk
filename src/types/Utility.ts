export type ArrayMatchFunction<T> = (
  item: T,
  idx?: number,
  allItems?: T[],
) => any | Promise<any>;
