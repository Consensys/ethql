export type Overwrite<T1, T2> = { [P in Exclude<keyof T1, keyof T2>]: T1[P] } & T2;
