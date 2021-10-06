type Prev = [
  never,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  ...0[]
];

type Join<K, P, Sep extends string = ':'> = K extends string
  ? P extends string
    ? `${K}${'' extends P ? '' : Sep}${P}`
    : never
  : never;

export type DebugPaths<T, Depth extends number = 10> = [Depth] extends [never]
  ? never
  : T extends Record<string, any>
  ? {
      [K in keyof T]-?: K extends string
        ?
            | (T[K] extends null ? `${K}` : `${K}:*`)
            | Join<K, DebugPaths<T[K], Prev[Depth]>>
        : never;
    }[keyof T]
  : '';

// type Paths<T, Depth extends number = 10> = [Depth] extends [never]
//   ? never
//   : T extends Record<string, any>
//   ? {
//       [K in keyof T]-?: K extends string
//         ? `${K}` | Join<K, Paths<T[K], Prev[Depth]>>
//         : never;
//     }[keyof T]
//   : '';

// type Leaves<T, D extends number = 10> = [D] extends [never]
//   ? never
//   : T extends Record<string, any>
//   ? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
//   : '';
