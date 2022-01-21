'use strict';

import colors from 'colors';

export class Logger {

  #component: string;

  static LEVEL = {
    ERROR: 'error',
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn'
  };

  /**
   * Initializes a new logger instance for a component
   * @param component Component name
   */
  constructor(component: string) {
    this.#component = component;
  }

  /**
   * Logs messages to the log stream (console, etc)
   * @param level Log level. defaults to Logger.LEVEL.INFO
   * @param message Message to be logged
   */
  log(message: string, level: string = Logger.LEVEL.INFO) {
    let timestamp = new Date().toISOString();
    let logger = console.info;
    let messageFormatter = colors.white;
    switch (level) {
      case Logger.LEVEL.DEBUG: logger = console.debug; messageFormatter = colors.blue; break;
      case Logger.LEVEL.ERROR: logger = console.error; messageFormatter = colors.red; break;
      case Logger.LEVEL.WARN: logger = console.warn; messageFormatter = colors.yellow; break;
      default: logger = console.info; break;
    }
    logger(`[${colors.green(timestamp)}][${colors.magenta(this.#component)}] ${messageFormatter(message)}`);
  }

  /**
   * Logs debug message to the log stream
   * @param message Message to be logged
   */
  debug(message: string) {
    this.log(message, Logger.LEVEL.DEBUG);
  }

  /**
   * Logs error message to the log stream
   * @param message Message to be logged
   */
  error(message: string) {
    this.log(message, Logger.LEVEL.ERROR);
  }

  /**
   * Logs error message to the log stream
   * @param message Message to be logged
   */
  info(message: string) {
    this.log(message, Logger.LEVEL.INFO);
  }

  /**
   * Logs warning message to the log stream
   * @param message Message to be logged
   */
  warn(message: string) {
    this.log(message, Logger.LEVEL.WARN);
  }

}