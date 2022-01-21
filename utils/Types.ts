import { Logger } from './Logger';
import { CONFIG } from '../constants/configuration';
import { schedule } from 'node-cron';
import { mkdirSync } from 'fs';
import { appendZero } from './Utility';

export abstract class Service<ServiceType> {
  logger: Logger;
  process: ServiceType | undefined;
  camera: Camera;
  path: string | undefined;

  constructor(camera: Camera, component: string, path?: string, enableCron?: boolean) {
    this.camera = camera;
    this.logger = new Logger(component);
    this.path = path;

    if (path) {
      this.initializePath(true);

      if (enableCron) {
        this.logger.debug('Enabled automatic directory creation daily at 11.59 PM');
        schedule('59 23 * * *', this.initializePath.bind(this, false));
      }
    }
  }

  initializePath(today: boolean = false) {
    let now = new Date();
    let date = appendZero(today ? now.getDate() : now.getDate() + 1);
    let month = appendZero(now.getMonth() + 1);
    let year = now.getFullYear();
    
    this.logger.debug(`Creating ${CONFIG.ROOT_PATH}/${this.path}/${year}${month}${date} for recording`);
    mkdirSync(`${CONFIG.ROOT_PATH}/${this.path}/${year}${month}${date}`, { recursive: true });
  }

  abstract start(): Promise<ServiceType>;
  abstract stop(): void;
  abstract restart(): Promise<ServiceType>;
};

export type Camera = {
  name: string,
  id: string,
  mainStream: string,
  subStream: string,
  filePrefix: string
};

export type ProxyObject = {
  [key: string]: any
};