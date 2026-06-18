const CONFIG = {
  PAGES: ['setup','consent','aft','practice','scientific-color','face-color','color-face','memory','summary'],
  EVENT_TYPES: {
    PAGE_ENTER: 'page_enter', PAGE_EXIT: 'page_exit', SESSION_START: 'session_start',
    SESSION_END: 'session_end', RESPONSE: 'response', SKIP: 'skip', PAUSE: 'pause', RESUME: 'resume', STOP: 'stop', COMPLETE: 'complete'
  },
  TASKS: {
    SETUP: 'setup', CONSENT: 'consent', AFT: 'aft', PRACTICE: 'practice', SCIENTIFIC: 'scientific_colour',
    FACE_TO_COLOUR: 'face_to_colour', COLOUR_TO_FACE: 'colour_to_face', MEMORY: 'indian_memory'
  },
  SKIP_REASONS: ['participant refused','participant fatigue','did not understand','technical issue','researcher decision','not applicable','other'],
  // Demo mode remains short for testing; research mode uses longer colour exposure for AFT / pupil recording.
  DEMO_TIMINGS: { baseline: 800, fixation: 600, exposure: 1800, washout: 800, break: 1200 },
  RESEARCH_TIMINGS: { baseline: 3000, fixation: 1000, exposure: 8000, washout: 5000, break: 30000 }
};
