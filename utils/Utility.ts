'use strict';

import { mkdirSync } from "fs";
import { CONFIG } from "../constants/configuration";
import { Service } from "./Types";

export function appendZero(date: number | string): string {
  return (date < 10 ? `0${date}` : `${date}`);
}

export function initializePath(service: Service<any>, path: string, appendDate: boolean = false, today: boolean = false) {
  path = `${CONFIG.ROOT_PATH}/${path}`;

  if (appendDate) {
    let now = new Date();
    let date = appendZero(today ? now.getDate() : now.getDate() + 1);
    let month = appendZero(now.getMonth() + 1);
    let year = now.getFullYear();

    path = `${path}/${year}${month}${date}`;
  }

  service.logger.debug(`Creating ${path} for recording`);
  mkdirSync(path, { recursive: true });
}