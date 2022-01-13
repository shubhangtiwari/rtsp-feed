'use strict';

import fs from 'fs';
import { CONFIG } from '../constants/configuration';
import { Logger } from './Logger';
import { Camera } from './Types';

export class Reclaimer {

    #logger: Logger;
    #camera: Camera;
    #timer: NodeJS.Timer;

    constructor(camera: Camera) {
        this.#camera = camera;
        this.#logger = new Logger(`${camera.name} Reclaimer`);
        this.#timer = this.start();
    }

    #reclaim() {
        this.#logger.info('Starting storage reclaimation');
        let now = new Date().getTime();
        let cameraLocation = `${CONFIG.RECORDER.PATH}/${this.#camera.id}`;

        fs.readdir(cameraLocation, (err, files) => {
            if (err) {
                this.#logger.error(`Unable to fetch recordings for ${this.#camera.name}`);
                return;
            }
            let staleFiles = files.filter(file => {
                let createdOn = new Date(fs.lstatSync(`${cameraLocation}/${file}`).birthtime).getTime();
                let age = (now - createdOn) / 1000;
                if (age > CONFIG.RECLAIMER.AGE_THRESHOLD) {
                    return true;
                }

                return false;
            });

            if (!staleFiles.length) {
                this.#logger.info(`Nothing to reclaim from ${this.#camera.name}`);
                return;
            }

            let reclaimedStorage = staleFiles.reduce((sum, file) => {
                return sum + fs.lstatSync(`${cameraLocation}/${file}`).size;
            }, fs.lstatSync(`${cameraLocation}/${staleFiles[0]}`).size);

            this.#logger.info(`Reclaimed ${reclaimedStorage} bytes from ${this.#camera.name}`);
            staleFiles.forEach(staleFile => fs.rm(`${cameraLocation}/${staleFile}`, () => { }));
        });
    };

    start() {
        this.#logger.info('Starting reclaimer');
        this.#timer = setInterval(this.#reclaim.bind(this), CONFIG.RECLAIMER.FREQUENCY * 1000);
        return this.#timer;
    }

    stop() {
        this.#logger.info('Stopping reclaimer');
        clearInterval(this.#timer);
    }

    restart() {
        this.#logger.info('Restarting reclaimer');
        this.stop();
        this.start();
    }

}