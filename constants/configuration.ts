'use strict';

import { Camera } from "../utils/Types";

export const CONFIG = {
  PORT: 2408,
  ROOT_PATH: '/glacier/recording',
  RECORDER: {
    CLIP_LENGTH: 30, // In Seconds
    RETRY_DELAY: 5 // In Seconds
  },
  RECLAIMER: {
    FREQUENCY: 86400, // In Seconds
    AGE_THRESHOLD: 2592000 // In Seconds
  },
  STREAM: {
    FRAGMENT_LENGTH: 10, // In Seconds
    LIST_SIZE: 8640
  }
};

const username: string = '<username>';
const password: string = '<password>';

export const CAMERAS: Camera[] = [{
  name: 'Front Door',
  id: 'front_door',
  mainStream: `rtsp://${username}:${password}@192.168.68.201:554/stream1`,
  subStream: `rtsp://${username}:${password}@192.168.68.201:554/stream2`,
  filePrefix: 'front_door'
}];