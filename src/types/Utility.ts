export type ArrayMatchFunction<T> = (
  item: T,
  idx?: number,
  allItems?: T[],
) => any | Promise<any>;

type EmptyArray = [];

export type AnyFunction = (...args: any[]) => any;

export type ReplaceArrayIndices<
  AnyArray extends any[],
  ReplaceIndices extends number,
  ReplaceWith = undefined,
> = {
  [P in keyof AnyArray]: P extends Exclude<keyof AnyArray, keyof any[]>
    ? P extends `${ReplaceIndices}`
      ? ReplaceWith
      : AnyArray[P]
    : AnyArray[P];
};

export type SpliceBy<
  AnyArray extends any[],
  Exclude = undefined,
> = AnyArray extends EmptyArray
  ? EmptyArray
  : AnyArray extends [infer H, ...infer R]
  ? H extends Exclude
    ? SpliceBy<R, Exclude>
    : [H, ...SpliceBy<R, Exclude>]
  : AnyArray;

// Need to replace by subbing in something that can be filtered
// out easily, that is also unlikely to create conflicts with
// actual array contents. Emoji are probably sufficient!
export type SpliceByIndices<
  AnyArray extends any[],
  Indices extends number,
> = SpliceBy<ReplaceArrayIndices<AnyArray, Indices, '🔪'>, '🔪'>;

export type ParametersExcludingIndices<
  AnyFunc extends AnyFunction,
  Indices extends number,
> = SpliceByIndices<Parameters<AnyFunc>, Indices>;

export type ParametersExcludingFirst<AnyFunc extends AnyFunction> =
  ParametersExcludingIndices<AnyFunc, 0>;

export type ValueOrValueArray<T> = T[] | T;

export type ExtractKeysByValue<Container, ValueTypeFilter> = {
  [Key in keyof Container]-?: Container[Key] extends Function
    ? ValueTypeFilter extends Container[Key]
      ? Key
      : never
    : Container[Key] extends ValueTypeFilter
    ? Key
    : never;
}[keyof Container];

export type ExcludeKeysByValue<Container, ValueTypeFilter> = Exclude<
  keyof Container,
  ExtractKeysByValue<Container, ValueTypeFilter>
>;

export type MimeType =
  | 'application/octet-stream'
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'text/plain'
  | 'text/html'
  | 'text/markdown';
