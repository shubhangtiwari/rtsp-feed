'use strict';

import express from 'express';
import { Logger } from './utils/Logger';
import { ProxyObject } from './utils/Types';
import { CONFIG, CAMERAS } from './constants/configuration';
import { Recorder } from './services/Recorder';
import { Reclaimer } from './services/Reclaimer';
import serveIndex from 'serve-index';
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
app.use('/recording', express.static(CONFIG.ROOT_PATH), serveIndex(CONFIG.ROOT_PATH, {'icons': true}));

app.listen(CONFIG.PORT, () => {
  logger.info(`RTSP Feed Server started at port ${CONFIG.PORT}`);
});