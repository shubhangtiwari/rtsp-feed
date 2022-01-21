'use strict';

import { spawn, ChildProcess } from 'child_process';
import { CONFIG } from '../constants/configuration';
import { Camera, Service } from '../utils/Types';
import { initializePath } from '../utils/Utility';
import { ScheduledTask, schedule } from 'node-cron';

const KILL_CODE: NodeJS.Signals = 'SIGKILL';

export class Recorder extends Service<ChildProcess> {

  #directoryCron: ScheduledTask;

  constructor(camera: Camera) {
    super(camera, `${camera.name} Recorder`);

    initializePath(this, `${camera.id}/archive`, true, true);
    initializePath(this, `${camera.id}/hls`, false);
    this.logger.debug('Enabled automatic directory creation daily at 11.59 PM');
    this.#directoryCron = schedule('59 23 * * *', initializePath.bind(null, this, `${camera.id}/archive`, true, false));

    this.start();
  }

  async start() {
    this.process = spawn('ffmpeg', [
      '-i', `${this.camera.mainStream}`,
      '-vcodec', 'copy', '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-f', 'segment', '-segment_time', `${CONFIG.RECORDER.CLIP_LENGTH}`, '-strftime', '1', '-segment_format', 'mov', '-segment_format_options', 'movflags=+faststart', '-reset_timestamps', '1', `${CONFIG.ROOT_PATH}/${this.camera.id}/archive/%Y%m%d/${this.camera.filePrefix}_%Y%m%d_%H%M%S.mov`,
      '-vcodec', 'copy', '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-f', 'hls', '-hls_time', `${CONFIG.STREAM.FRAGMENT_LENGTH}`, '-hls_list_size', `${CONFIG.STREAM.LIST_SIZE}`, '-hls_base_url', `/${this.camera.id}/hls/`, '-hls_segment_filename', `${CONFIG.ROOT_PATH}/${this.camera.id}/hls/%5d.ts`, '-hls_playlist_type', 'event', `${CONFIG.ROOT_PATH}/${this.camera.id}/index.m3u8`
    ], { stdio: 'ignore' });

    this.process.on('close', (code, signal) => {
      this.logger.error(`Recording terminated due to ${code} and ${signal}`);
      if (KILL_CODE !== signal) {
        this.logger.info(`Attempting to restart recording in ${CONFIG.RECORDER.RETRY_DELAY} seconds`);
        setTimeout(this.start.bind(this), CONFIG.RECORDER.RETRY_DELAY * 1000);
      }
    });

    this.#directoryCron.start();
    this.logger.info(`Recording started`);
    return this.process;
  }

  stop() {
    this.process?.kill(KILL_CODE);
    this.#directoryCron.stop();
    this.logger.info(`Recording stopped`);
  }

  async restart() {
    this.stop();
    this.logger.info(`Restarting recording`);
    return this.start();
  }

}