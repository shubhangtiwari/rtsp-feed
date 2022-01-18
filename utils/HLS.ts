'use strict';

import fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import { CONFIG } from '../constants/configuration';
import { Camera, Service } from './Types';

const KILL_CODE: NodeJS.Signals = 'SIGKILL';

export class HLS extends Service<ChildProcess> {

  constructor(camera: Camera) {
    super(camera, `${camera.name} Stream`);
    this.start();
  }

  start() {
    fs.mkdirSync(`${CONFIG.ROOT_PATH}/${this.camera.id}/hls`, { recursive: true });

    this.process = spawn('ffmpeg', [
      '-i', `${this.camera.mainStream}`,
      '-c:v', 'libx264', '-crf', '21', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-f', 'hls', '-hls_time', `${CONFIG.STREAM.FRAGMENT_LENGTH}`, '-hls_list_size', `${CONFIG.STREAM.LIST_SIZE}`, '-hls_base_url', `/${this.camera.id}/hls/`, '-hls_segment_filename', `${CONFIG.ROOT_PATH}/${this.camera.id}/hls/%5d.ts`, '-hls_playlist_type', 'event', `${CONFIG.ROOT_PATH}/${this.camera.id}/index.m3u8`
    ], { stdio: 'ignore' });

    this.process.on('close', (code, signal) => {
      this.logger.error(`Streaming terminated due to ${code} and ${signal}`);
      if (KILL_CODE !== signal) {
        this.logger.info(`Attempting to restart streaming in ${CONFIG.RECORDER.RETRY_DELAY} seconds`);
        setTimeout(this.start.bind(this), CONFIG.RECORDER.RETRY_DELAY * 1000);
      }
    });

    this.logger.info(`Streaming started`);
    return this.process;
  }

  stop() {
    this.process?.kill(KILL_CODE);
    this.logger.info(`Streaming stopped`);
  }

  restart() {
    this.stop();
    this.logger.info(`Restarting Streaming`);
    return this.start();
  }

}