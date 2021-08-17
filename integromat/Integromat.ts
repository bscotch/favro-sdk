export interface IntegromatParameterTypes {
  array: string;
  boolean: string;
  buffer: string;
  cert: string;
  collection: string;
  color: string;
  date: string;
  email: string;
  file: string;
  filename: string;
  filter: string;
  folder: string;
  hidden: string;
  integer: string;
  json: string;
  number: string;
  path: string;
  pkey: string;
  port: string;
  select: string;
  text: string;
  time: string;
  timestamp: string;
  timezone: string;
  uinteger: string;
  url: string;
  uuid: string;
}

export type IntegromatParameterType = keyof IntegromatParameterTypes;

export interface IntegromatParameter {
  name: string;
  /** Displayed in GUI */
  label?: string;
  help?: string;
  /** Default: 'text' */
  type?: IntegromatParameterType;
  required?: boolean;
  default?: any;
  /**
   *  If `true`, the parameter is hidden in the GUI
   *  unless the 'advanced' box is checked */
  advanced?: boolean;
}
