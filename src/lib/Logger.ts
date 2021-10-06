import type { AnyFunction } from '$/types/Utility.js';
import debug from 'debug';
import { sortPaths } from './utility.js';

const requiredLogLevels = ['log', 'error'] as const;
const optionalLogLevels = ['info', 'trace', 'warn', 'dir'] as const;

type RequiredLogLevel = typeof requiredLogLevels[number];
type OptionalLogLevel = typeof optionalLogLevels[number];

export type LoggerUtility = {
  [OptionalLoggerName in OptionalLogLevel]?: AnyFunction;
} &
  {
    [RequiredLoggerName in RequiredLogLevel]: AnyFunction;
  };

export class Logger {
  private static _debuggers: { [namePath: string]: debug.Debugger } = {};
  private static _utility: LoggerUtility = console;

  private static _debuggerPaths: Set<string> = new Set();

  /**
   * Always log something using the provided logging utility's `log` method,
   * without using `DEBUG` environment variable settings.
   */
  static log(...args: any[]) {
    Logger._utility.log.bind(Logger._utility)(...args);
  }

  /**
   * Always log something using the provided logging utility's `warn` method,
   * without using `DEBUG` environment variable settings.
   */
  static warn(...args: any[]) {
    (Logger._utility.warn || Logger._utility.error).bind(Logger._utility)(
      ...args,
    );
  }

  /**
   * Always log something using the provided logging utility's `error` method,
   * without using `DEBUG` environment variable settings.
   */
  static error(...args: any[]) {
    Logger._utility.error.bind(Logger._utility)(...args);
  }

  static getDebugLogger(path: string, parentPath?: string) {
    const fullPath = parentPath ? `${parentPath}:${path}` : path;
    this._debuggers[fullPath] ||= debug(fullPath);
    this._debuggers[fullPath].log = Logger.log;
    this._debuggerPaths.add(fullPath);
    return this._debuggers[fullPath];
  }

  static set loggingUtility(utility: LoggerUtility) {
    Logger._utility = utility;
  }

  static get debugPaths() {
    return sortPaths([...this._debuggerPaths], ':');
  }
}
