'use strict';

import { Camera } from "../utils/Types";

export const CONFIG = {
  PORT: 8080,
  RECORDER: {
    CLIP_LENGTH: 10, // In Seconds
    RETRY_DELAY: 5, // In Seconds
    PATH: '/glacier/recording'
  },
  RECLAIMER: {
    FREQUENCY: 30, // In Seconds
    AGE_THRESHOLD: 120 // In Seconds
  }
};

export const CAMERAS: Camera[] = [{
  name: '<Camera Description/Name>',
  id: '<some_id',
  mainStream: 'rtsp://<username>:<password>@<ip>:554/<hd_stream_path>',
  subStream: 'rtsp://<username>:<password>@<ip>:554/<sd_stream_path>',
  filePrefix: '<recording_file_prefix>'
}];