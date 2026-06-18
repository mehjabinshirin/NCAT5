# NeuroColor Atlas Test – Research Version 2

A dementia-friendly, modular browser-based research application for investigating colour perception, colour–emotion associations, facial-emotion associations, and culturally grounded chromatic memory in healthy aging, mild cognitive impairment, and early dementia.

**Research Prototype Only.** This is not a diagnostic instrument. See [Research Use and Validation Status](#research-use-and-validation-status) below.

## Features

✅ **Scientific Stimulus Design**
- 13 unique CIELCh/CIELAB colour conditions with scientifically defined target values
- D65, 2° observer CIELAB-to-sRGB conversion in JavaScript
- Full Version: 16 trials (all 13 conditions + 3 repeats)
- Short Version: 8 balanced trials for fatigue/early dementia
- Randomized trial sequencing with no consecutive duplicates

✅ **Passive Colour Exposure Protocol**
- Full-screen neutral baseline (3s) → colour stimulus (4s) → rating → washout (6s)
- Fullscreen mode with hidden UI during passive exposure
- Automatic timing with browser-generated timestamps
- Mandatory 30-second break after trial 8 (Full Version)

✅ **Emotion Rating System**
- Valence (Unpleasant / Neutral / Pleasant)
- Arousal (Calm / Neutral / Active)
- Emotion family (11 categories + Other)
- Intensity (0-3 scale)

✅ **Face-to-Colour Association**
- 6 facial emotions (Happiness, Sadness, Anger, Fear, Disgust, Neutral)
- SVG schematic faces (no emojis) – prototype stimuli, pilot validation pending
- 12-colour selection grid (large, dementia-friendly)
- Skip item, skip task, pause/resume controls

✅ **Colour-to-Face Association**
- Large colour display areas (full-screen background)
- Grayscale schematic faces with clear emotion labels
- Response timing and selection logging

✅ **Indian Chromatic Memory Task**
- 10 pilot cultural colours (Kumkum red, Haldi yellow, Kesari, Marigold, Mehendi, Indigo, Peacock, Chandan, Terracotta, Jasmine)
- CIELAB targets with provisional RGB/HEX display
- 4 core questions per colour:
  1. Familiarity (Yes/No/Not sure)
  2. Presence of a memory association
  3. Memory-association category (with free-text follow-up when "Other" is selected)
  4. Emotional valence (Pleasant/Neutral/Unpleasant)
- 30 predefined memory categories

✅ **Dementia-Friendly Design**
- High contrast (black on white, white on black)
- Large fonts (18px base, 32px headings, 24px buttons)
- Large buttons with yellow focus outline (4px)
- Simple, clear navigation
- Clear skip, pause, resume, and stop controls on all optional tasks

✅ **Local Client-Side Data Management**
- All data stays in browser (no intentional server transmission, no external APIs)
- Central dataLog array with all events timestamped
- Automatic localStorage saving after every response/skip/pause/resume
- Session recovery on page reload with researcher confirmation
- CSV export: `ParticipantID_behavioural_YYYY-MM-DD.csv`
- Backup before clearing, safe session wipe
- **Disclaimer:** localStorage and downloaded CSV files are not encrypted by default and must be stored on an institutionally approved, access-controlled device.

✅ **Complete Event Logging**
- participant_id, test_version, trial/item numbers
- Stimulus ID, CIELAB, CIELCh, RGB, HEX, gamut status
- Baseline/passive/rating/washout timestamps (ISO 8601 wall-clock and monotonic durations)
- Response data (valence, arousal, emotion, intensity)
- Skip reason, pause/resume, stop reason
- Response time (ms)
- AFT reference data

✅ **Modular Architecture**
- Small, focused JavaScript modules (max ~350 lines each)
- No frameworks, libraries, or build tools
- Vanilla JavaScript ES6 only
- Pure HTML5 and CSS3

## File Structure

```
neurocolor-atlas-test-v2/
├── index.html                      # Main entry point
├── README.md                       # This file
├── css/
│   ├── styles.css                  # Base dementia-friendly styles
│   ├── scientific-task.css         # Scientific task styling
│   └── association-tasks.css       # Face/colour association styling
└── js/
    ├── config.js                   # Constants and configuration
    ├── state.js                    # Global state management
    ├── storage.js                  # localStorage and session recovery
    ├── data-export.js              # CSV export and data summary
    ├── aft-module.js               # AFT reference/sync
    ├── ui-controls.js              # UI components and pages
    ├── scientific-stimuli.js        # CIELCh/CIELAB definitions and RGB conversion
    ├── scientific-task.js           # Scientific colour task controller
    ├── face-to-colour.js           # Face-to-colour association
    ├── colour-to-face.js           # Colour-to-face association
    ├── indian-memory.js            # Indian chromatic memory
    └── navigation.js               # Page routing and task initialization
```

## Pages (Complete Flow)

1. **Researcher and Participant Setup** – Participant code, version selection (Full/Short/Demo)
2. **Consent Confirmation** – Continuation is permitted only when participant consent or an IEC-approved legally authorized representative consent pathway has been completed. The application does not replace the formal informed-consent process.
3. **AFT Reference & Synchronization** – Separate AFT module with start times
4. **Practice Trial** – Placeholder for practice task
5. **Scientific Colour Task** – Full or Short version, 16 or 8 trials, passive exposure + rating
6. **Face-to-Colour Association** – 6 emotions, 12-colour grid
7. **Colour-to-Face Association** – 6 colours (6 items), grayscale faces
8. **Indian Chromatic Memory Task** – 10 cultural colours, 4 core questions each, with conditional free-text follow-up
9. **Final Summary & CSV Download** – Statistics, download, session clear

## Controls on All Tasks

- **Continue / Submit** – Confirm response
- **Skip Item** – Log item-level skip
- **Skip Task** – Skip entire task (logs reason)
- **Pause** – Pause session (resume on next render)
- **Resume** – Resume after pause
- **Stop Test** – End test immediately, go to summary
- **Not Sure** – Default response (e.g., neutral colour for Face-to-Colour)

## Data Export

**CSV Format:**
```
participant_id, test_version, trial_number, stimulus_id, stimulus_name,
cielab_L, cielab_a, cielab_b,
cielch_L, cielch_C, cielch_h,
rgb_r, rgb_g, rgb_b, hex_value, gamut_status,
baseline_onset_time, passive_start_time, passive_offset_time,
rating_onset_time, response_time_ms,
valence_response, arousal_response, emotion_response, emotion_other_text,
intensity_score, trial_status, skip_status, skip_reason, timestamp
```

**File naming:**
- `ParticipantID_behavioural_YYYY-MM-DD.csv`
- All times in ISO 8601 format

**Participant Identification:**
- No direct identifiers such as participant names, telephone numbers, hospital numbers, or contact details are collected.
- The CSV includes a coded participant ID for research linkage.

## Colour Conversion

**Scientific Task (13 conditions):**
- Stored as CIELCh targets (L*, C*, h)
- Converted to CIELAB (L*, a*, b*)
- Converted to XYZ (D65, 2° observer)
- Converted to linear RGB
- Gamma-corrected to sRGB (0-255)
- Flagged as in-gamut or out-of-gamut

**Indian Memory Task (10 colours):**
- Stored as CIELAB targets (L*, a*, b*)
- Converted using same pipeline
- Marked as provisional until physical spectrophotometer measurement

**Stimulus Display Clarification:**
- Stimulus IDs and colour-space values must not be displayed during passive full-screen exposure because text and local contrast may influence gaze and pupillary response.
- Scientific colour values are displayed only on the response or researcher screen and stored in the CSV.

**⚠️ Important:** All RGB/HEX values displayed in the browser are **provisional** until the monitor is calibrated and colours are measured with a spectrophotometer. CIELAB and CIELCh targets are definitive; browser RGB representation is for visual guidance only.

## Session Recovery

**On page reload:**
1. Check localStorage for unfinished session
2. If found, ask researcher: "Resume unfinished session?"
3. If Yes: restore state and continue
4. If No: discard and start new
5. Backup created before clearing

## Deployment

### GitHub Pages

1. Repository already enabled for GitHub Pages
2. Visit: `https://bellaaa001.github.io/neurocolor-atlas-test-v2/`
3. Site is live immediately; no build process

### Local Development

```bash
git clone https://github.com/bellaaa001/neurocolor-atlas-test-v2.git
cd neurocolor-atlas-test-v2
python -m http.server 8000  # or: npx http-server
# Open browser: http://localhost:8000
```

## Privacy & Data Handling

✅ **No participant-response data transmitted intentionally to GitHub or external servers**
- All participant processing happens in the browser
- localStorage stores data locally only
- CSV downloaded to local disk
- No network requests except to load static files
- **Note:** Because the application is hosted on GitHub Pages, ordinary hosting access logs may still be generated by the hosting platform.

✅ **Participant anonymity**
- Participant codes only (no names, IDs, phone)
- Session IDs are local and time-based
- No external tracking or analytics

✅ **Data at rest**
- localStorage is browser-local only
- Clear session after download with confirmation
- Backup available before clearing
- **Important:** localStorage and downloaded CSV files are not encrypted by default and must be stored on an institutionally approved, access-controlled device.

## Browser Support

- Chrome (tested, recommended)
- Firefox, Edge, Safari (modern versions)
- Requires ES6 support and localStorage
- Designed for static browser use. Reliable offline operation must be separately tested or implemented using a local web server or service-worker-based offline mode.

## Timing and Stimulus Accuracy

### Browser Timing

The application records browser-generated timestamps and response times with millisecond-valued resolution. Actual stimulus timing accuracy must be validated on the study computer and should not be assumed to equal laboratory-grade hardware timing.

**Wall-clock and monotonic timing:**
- ISO 8601 timestamps are recorded for alignment with separate AFT and eye-tracking files.
- Monotonic browser timing, such as performance.now(), is used for within-task durations and response-time calculations.

### Passive Exposure Timing

- Baseline, passive exposure, and washout durations: millisecond resolution (performance.now())
- Break timers: ~1-second accuracy (setTimeout)
- Response times: browser-dependent (typically ±50ms)
- Independent validation with eye-tracking or hardware timing is strongly recommended

## Stimulus Control

**Structured scientific stimulus specification:**
- CIELCh/CIELAB targets with provisional RGB/HEX display
- Pending physical monitor calibration and validation
- Schematic facial-expression stimuli are prototype stimuli and have not yet been independently validated for emotion-recognition accuracy in healthy older adults, MCI, or dementia populations.
- **Pilot validation is required before inferential use.**

## Calibration & Validation Notes

### Monitor Calibration Required

⚠️ **Before running studies:**
1. Calibrate display with a colourimeter or spectrophotometer
2. Measure actual RGB values of generated colours
3. Compare to CIELAB targets in CSV
4. Document any gamut limitations
5. Update README with calibration date and monitor model

### Gamut Clipping

Out-of-gamut colours are flagged in the CSV:
- `gamut_status: "out-of-gamut"` indicates RGB value required clipping
- Check HEX value; if clipped, consider target revision
- Scientific interpretation may differ from visual presentation

## Pre-Pilot Verification Checklist

* [ ] All pages navigate without getting stuck
* [ ] Every optional task has Skip button
* [ ] Pause and Resume tested and working
* [ ] Stop Test safely halts and goes to summary
* [ ] localStorage recovery tested and working
* [ ] Fullscreen mode exits safely (ESC key)
* [ ] CSV contains complete stimulus, response, timing data
* [ ] No direct identifiers (names, phone, hospital numbers) in CSV
* [ ] Coded participant ID present for research linkage
* [ ] Site works on GitHub Pages and Chrome
* [ ] All buttons large (50+ px) and dementia-friendly
* [ ] High contrast maintained throughout
* [ ] No intentional participant-response data transmission to external servers

## Known Limitations

- HRV not calculated in browser (timestamps only for later alignment with separate recordings)
- Colours not absolutely calibrated until monitor measurement
- Fullscreen mode requires user gesture (click required)
- localStorage limited by browser (typically 5-10 MB)
- No multi-participant session isolation (single researcher, single PC)
- Schematic facial-expression stimuli require pilot validation in target populations

## Future Enhancements (Beyond Stage 3)

- Stage 4: Eye-tracking integration
- Improved synchronization with separate AFT, ECG, EDA, and eye-tracking recordings
- Stage 6: Multi-site data synchronization (encrypted)
- Stage 7: Advanced statistical analysis
- Stage 8: Machine learning integration

## Research Use and Validation Status

**This is a research prototype only and must not be used as a diagnostic instrument.**

Before using this application for participant testing, ensure:

* ✓ Research prototype status acknowledged
* ✓ Application is not a diagnostic instrument
* ✓ Monitor calibration completed and documented
* ✓ Browser timing validated on study computer
* ✓ Schematic facial-expression stimuli pilot-validated in target populations (healthy older adults, MCI, dementia)
* ✓ AFT and eye-tracking recorded separately via dedicated hardware/software
* ✓ IEC (or equivalent ethics committee) approval obtained
* ✓ Formal informed-consent process completed before participant testing
* ✓ Data storage on institutionally approved, access-controlled device

## Study Design & Citation

**Lead Investigator:** University of Hyderabad
**Version:** 2.0 (Stage 3)
**Date:** 2026-06-05
**License:** Research Use Only

---

**Last Updated:** 2026-06-05
**Platform:** Static HTML/CSS/JavaScript (no server required)
**Browser:** Chrome/Chromium recommended

## Update: UI/UX and Data Safety Refinement

This version includes the following experiment-focused improvements:

- Automatic CSV download when the Summary page is reached, with manual download still available as a backup.
- Page scroll reset after every Submit/Continue/Skip navigation so the next stimulus or instruction starts at the top.
- Required Researcher Initials field; initials are written into every event row in the CSV.
- Optional Monitor / Device ID and Munsell / Calibration Reference fields for colour-calibration documentation.
- Scientific Colour Task question updates:
  - valence changed to a 5-point scale with Unsure / Neutral,
  - arousal changed to a 5-point scale with Unsure / Neutral,
  - “Closest emotional family” changed to “Closest emotional response,”
  - intensity changed to a 0–4 scale: No feeling, Mild, Moderate, High / Strong, Severe / Very strong.
- Munsell fields are recorded as pending calibrated measurement unless the researcher enters a calibration note.
- Face-to-Colour colour positions are randomized on every item to support attention and reduce location-memory responses.
- The selected colour is visibly applied to the face preview and the selected colour button is clearly highlighted.
- Colour-to-Face face options are randomized on every item and logged.
