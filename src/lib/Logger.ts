import type { DebugPaths } from '$/types/ObjectPaths.js';
import type { AnyFunction } from '$/types/Utility.js';
import debug from 'debug';

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

export type DebugPath = DebugPaths<typeof Logger['debugHeirarchy']>;
export type DebugPathSetting = DebugPath | `-${DebugPath}`;

export class Logger {
  private static _debuggers: { [namePath: string]: debug.Debugger } = {};
  private static _utility: LoggerUtility = console;

  private static _debuggerPaths: Set<string> = new Set();

  static get debugHeirarchy() {
    return {
      bravo: {
        http: {
          basic: null,
          headers: null,
          bodies: null,
          stats: null,
        },
        paging: {
          next: null,
        },
      },
    } as const;
  }

  static enableDebug(debugNamespaces: DebugPathSetting[]) {
    debug.enable(debugNamespaces.join(','));
  }

  static disableDebug() {
    debug.disable();
  }

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

  static debug(path: DebugPath) {
    this._debuggers[path] ||= debug(path);
    this._debuggers[path].log = Logger.log;
    this._debuggerPaths.add(path);
    return this._debuggers[path];
  }

  static set loggingUtility(utility: LoggerUtility) {
    Logger._utility = utility;
  }
}
