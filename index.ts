'use strict';

import express from 'express';
import { Logger } from './utils/Logger';
import { ProxyObject } from './utils/Types';
import { CONFIG, CAMERAS } from './constants/configuration';
import { Recorder } from './utils/Recorder';
import { Reclaimer } from './utils/Reclaimer';
import cors from 'cors';

const app = express();
const logger = new Logger('RTSP Recorder');
const operation: ProxyObject = {};

// Record all cameras into files
CAMERAS.forEach(camera => {
  operation[`${camera.id}`] = {
    recorder: new Recorder(camera),
    reclaimer: new Reclaimer(camera)
  };
});

app.use(cors());
app.use('/', express.static(CONFIG.ROOT_PATH));

app.listen(CONFIG.PORT, () => {
  logger.info(`RTSP Feed Server started at port ${CONFIG.PORT}`);
});