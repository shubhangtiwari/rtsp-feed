'use strict';

import fs from 'fs';
import { spawn, ChildProcess } from "child_process";
import { Camera } from "./Types";
import { CONFIG } from '../constants/configuration';
import { Logger } from "./Logger";

const RESTART_CODE: NodeJS.Signals = 'SIGHUP';
const KILL_CODE: NodeJS.Signals = 'SIGKILL';

export class Recorder {

  #logger: Logger;
  #process: ChildProcess | undefined;
  #camera: Camera;

  constructor(camera: Camera) {
    this.#camera = camera;
    this.#logger = new Logger(`${camera.name} Recorder`);
    this.start();
  }

  start() {
    fs.mkdirSync(`${CONFIG.RECORDER.PATH}/${this.#camera.id}`, { recursive: true });
    this.#process = spawn('ffmpeg', ['-i', `${this.#camera.mainStream}`, '-acodec', 'copy', '-vcodec', 'copy', '-f', 'segment', '-segment_time', `${CONFIG.RECORDER.CLIP_LENGTH}`, '-strftime', '1', '-segment_format', 'mov', '-segment_format_options', 'movflags=+faststart', '-reset_timestamps', '1', `${CONFIG.RECORDER.PATH}/${this.#camera.id}/${this.#camera.filePrefix}_%Y%m%d_%H%M%S.mov`], { stdio: 'ignore' });

    this.#process?.on('close', (code, signal) => {
      this.#logger.error(`Recording terminated due to ${code} and ${signal}`);
      if (KILL_CODE !== signal) {
        this.#logger.info(`Attempting to restart recording in ${CONFIG.RECORDER.RETRY_DELAY} seconds`);
        setTimeout(this.start.bind(this), CONFIG.RECORDER.RETRY_DELAY * 1000);
      }
    });

    this.#logger.info(`Recording started`);
  }

  stop() {
    this.#process?.kill(KILL_CODE);
    this.#logger.info(`Recording stopped`);
  }

  restart() {
    this.#process?.kill(RESTART_CODE);
    this.#logger.info(`Restarting recording`);
  }

}