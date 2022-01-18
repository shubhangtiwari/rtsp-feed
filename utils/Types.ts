import { Logger } from './Logger';

export abstract class Service<ServiceType> {
  logger: Logger;
  process: ServiceType | undefined;
  camera: Camera;

  constructor(camera: Camera, component: string) {
    this.camera = camera;
    this.logger = new Logger(component);
  }

  abstract start(): ServiceType;
  abstract stop(): void;
  abstract restart(): ServiceType;
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