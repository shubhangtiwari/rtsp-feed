'use strict';

import fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import { CONFIG } from '../constants/configuration';
import { Camera, Service } from './Types';

const RESTART_CODE: NodeJS.Signals = 'SIGHUP';
const KILL_CODE: NodeJS.Signals = 'SIGKILL';

export class Recorder extends Service<ChildProcess> {

  constructor(camera: Camera) {
    super(camera, `${camera.name} Recorder`);
    this.start();
  }

  start() {
    fs.mkdirSync(`${CONFIG.ROOT_PATH}/${this.camera.id}/archive`, { recursive: true });
    fs.mkdirSync(`${CONFIG.ROOT_PATH}/${this.camera.id}/hls`, { recursive: true });

    this.process = spawn('ffmpeg', [
      '-i', `${this.camera.mainStream}`,
      '-acodec', 'copy', '-vcodec', 'copy', '-f', 'segment', '-segment_time', `${CONFIG.RECORDER.CLIP_LENGTH}`, '-strftime', '1', '-segment_format', 'mov', '-segment_format_options', 'movflags=+faststart', '-reset_timestamps', '1', `${CONFIG.ROOT_PATH}/${this.camera.id}/archive/${this.camera.filePrefix}_%Y%m%d_%H%M%S.mov`,
      '-c:v', 'libx264', '-crf', '21', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-f', 'hls', '-hls_time', `${CONFIG.STREAM.FRAGMENT_LENGTH}`, '-hls_list_size', `${CONFIG.STREAM.LIST_SIZE}`, '-hls_base_url', `/hls/`, '-hls_segment_filename', `${CONFIG.ROOT_PATH}/${this.camera.id}/hls/%5d.ts`, '-hls_playlist_type', 'event', `${CONFIG.ROOT_PATH}/${this.camera.id}/index.m3u8`],
      { stdio: 'ignore' });

    this.process.on('close', (code, signal) => {
      this.logger.error(`Recording terminated due to ${code} and ${signal}`);
      if (KILL_CODE !== signal) {
        this.logger.info(`Attempting to restart recording in ${CONFIG.RECORDER.RETRY_DELAY} seconds`);
        setTimeout(this.start.bind(this), CONFIG.RECORDER.RETRY_DELAY * 1000);
      }
    });

    this.logger.info(`Recording started`);
    return this.process;
  }

  stop() {
    this.process?.kill(KILL_CODE);
    this.logger.info(`Recording stopped`);
  }

  restart() {
    this.stop();
    this.logger.info(`Restarting recording`);
    return this.start();
  }

}