const SCIENTIFIC_TASK = {
  trials: [],
  index: 0,
  current: null,
  currentTimes: {},
  ratingOnset: null,
  paused: false,
  responses: {},
  isSubmitting: false,

  timings() {
    return STATE.version === 'demo' ? CONFIG.DEMO_TIMINGS : CONFIG.RESEARCH_TIMINGS;
  },

  init(version) {
    STATE.version = ['full', 'short', 'demo'].includes(version) ? version : 'demo';
    const ids = STATE.version === 'full'
      ? TRIAL_SEQUENCES.generateFullVersion()
      : TRIAL_SEQUENCES.SHORT_VERSION;

    this.trials = TRIAL_SEQUENCES.randomizeTrials(ids).map((id, i) => ({
      ...SCIENTIFIC_STIMULI.enrichStimulus(SCIENTIFIC_STIMULI.getStimulusById(id)),
      trialNumber: i + 1
    }));

    this.index = 0;
    this.paused = false;
    this.responses = {};
    this.isSubmitting = false;
    STATE.pageState.scientificBreakDone = false;

    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
      task_name: CONFIG.TASKS.SCIENTIFIC,
      event: 'task_initialized',
      test_version: STATE.version,
      total_trials: this.trials.length,
      valence_scale: '5-point: very unpleasant, unpleasant, unsure/neutral, pleasant, very pleasant',
      intensity_scale: '0-4: no feeling, mild, moderate, high/strong, severe/very strong'
    });
  },

  async startFullscreen() {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen && !document.fullscreenElement) {
        await el.requestFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen unavailable:', error);
      STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
        task_name: CONFIG.TASKS.SCIENTIFIC,
        event: 'fullscreen_unavailable',
        error: String(error)
      });
    }
  },

  async exitFullscreenSafe() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn('Could not exit fullscreen:', error);
    }
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  formatSeconds(ms) {
    return Math.max(1, Math.ceil(ms / 1000));
  },

  renderTimedScreen({ color, label, ms, fixation = false, showTimer = true, dot = false }) {
    const seconds = this.formatSeconds(ms);
    const marker = fixation ? '<div class="fixation-cross">+</div>' : (dot ? '<div class="fixation-dot" aria-hidden="true"></div>' : '');
    document.getElementById('mainContent').innerHTML = `
      <div class="fullscreen-passive" style="background:${color};">
        ${showTimer ? `<div class="phase-timer" id="phaseTimer">${seconds}</div>` : ''}
        ${label ? `<div class="phase-label">${label}</div>` : ''}
        ${marker}
      </div>`;

    if (typeof NAVIGATION !== 'undefined') NAVIGATION.scrollToTop();

    if (showTimer) {
      let remaining = seconds;
      const timer = document.getElementById('phaseTimer');
      const interval = setInterval(() => {
        remaining -= 1;
        if (timer) timer.textContent = Math.max(0, remaining);
        if (remaining <= 0) clearInterval(interval);
      }, 1000);
    }
  },

  async runTrial() {
    if (this.index >= this.trials.length) return this.completeTask();

    if (STATE.version === 'full' && this.index === 8 && !STATE.pageState.scientificBreakDone) {
      return this.showBreak();
    }

    this.current = this.trials[this.index];
    this.responses = {};
    this.isSubmitting = false;
    const t = this.timings();

    const baselineOn = new Date().toISOString();
    this.renderTimedScreen({ color: '#919191', label: 'Grey baseline', ms: t.baseline, fixation: false, dot: false });
    await this.delay(t.baseline);
    if (this.paused) return;

    const fixationOn = new Date().toISOString();
    this.renderTimedScreen({ color: '#919191', label: 'Fixation', ms: t.fixation, fixation: true, dot: false });
    await this.delay(t.fixation);
    if (this.paused) return;

    const stimOn = new Date().toISOString();
    this.renderTimedScreen({ color: this.current.hex, label: 'Colour viewing', ms: t.exposure, fixation: false, dot: true });
    await this.delay(t.exposure);
    if (this.paused) return;

    const stimOff = new Date().toISOString();
    this.currentTimes = {
      baseline_onset_time: baselineOn,
      fixation_onset_time: fixationOn,
      stimulus_onset_time: stimOn,
      stimulus_offset_time: stimOff
    };

    this.showRating();
  },

  showBreak() {
    STATE.pageState.scientificBreakDone = true;
    const t = this.timings();
    document.getElementById('mainContent').innerHTML = `
      <section class="break-screen page-card">
        <h2>Mandatory Break</h2>
        <p>Please rest before continuing.</p>
        <div class="break-timer" id="breakTimer">${Math.ceil(t.break / 1000)}</div>
        <button class="btn-success" onclick="SCIENTIFIC_TASK.runTrial()">Continue Now</button>
        <button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button>
      </section>`;
    if (typeof NAVIGATION !== 'undefined') NAVIGATION.scrollToTop();

    let rem = Math.ceil(t.break / 1000);
    const int = setInterval(() => {
      rem -= 1;
      const el = document.getElementById('breakTimer');
      if (el) el.textContent = rem;
      if (rem <= 0) {
        clearInterval(int);
        this.runTrial();
      }
    }, 1000);
  },

  optionButtons(group, options) {
    return `<div class="response-button-grid ${group === 'emotion' ? 'emotion-grid' : ''}">${options.map(opt => {
      const value = opt.value || opt;
      const label = opt.label || opt;
      return `<button type="button" class="response-option" data-group="${group}" data-value="${value}" onclick="SCIENTIFIC_TASK.selectOption('${group}', '${String(value).replace(/'/g, "\\'")}', this)">${label}</button>`;
    }).join('')}</div>`;
  },

  showRating() {
    this.ratingOnset = new Date().toISOString();
    const s = this.current;
    const researcherMunsellNote = STATE.pageState.munsellReference || 'Not provided';
    document.getElementById('mainContent').innerHTML = `
      <section class="scientific-response-page page-card">
        <h2>Scientific Colour Task</h2>
        <p class="trial-title">Trial ${this.index + 1} of ${this.trials.length}</p>
        <div class="scientific-progress-track" aria-hidden="true"><div class="scientific-progress-fill" style="width:${((this.index + 1) / this.trials.length) * 100}%"></div></div>

        <div class="large-colour-box" style="background:${s.hex};" aria-label="Current colour stimulus"></div>
        <div class="stimulus-code-line">
          <strong>${s.id}</strong> | ${s.name} | Target CIELCh: L*=${s.L}, C*=${s.C}, h=${s.h}° | Target CIELAB: L*=${s.cielab.L.toFixed(1)}, a*=${s.cielab.a.toFixed(1)}, b*=${s.cielab.b.toFixed(1)} | Provisional sRGB/HEX: ${s.hex}<br>
          <strong>Munsell:</strong> ${s.munsell || 'Pending calibrated Munsell measurement'} | <strong>Session Munsell/Calibration Note:</strong> ${researcherMunsellNote}
          <span class="provisional-notice-inline">Display values are provisional until monitor calibration and physical measurement.</span>
        </div>

        <div class="question-card">
          <h3>1. How pleasant or unpleasant is this colour?</h3>
          ${this.optionButtons('valence', [
            { value: 'very_unpleasant', label: 'Very unpleasant' },
            { value: 'unpleasant', label: 'Unpleasant' },
            { value: 'unsure_neutral', label: 'Unsure / Neutral' },
            { value: 'pleasant', label: 'Pleasant' },
            { value: 'very_pleasant', label: 'Very pleasant' }
          ])}
        </div>

        <div class="question-card">
          <h3>2. How calming or activating is this colour?</h3>
          ${this.optionButtons('arousal', [
            { value: 'very_calm', label: 'Very calm' },
            { value: 'calm', label: 'Calm' },
            { value: 'unsure_neutral', label: 'Unsure / Neutral' },
            { value: 'active', label: 'Active' },
            { value: 'very_active', label: 'Very active' }
          ])}
        </div>

        <div class="question-card">
          <h3>3. Closest emotional response</h3>
          ${this.optionButtons('emotion', ['Joy / Happy', 'Calm / Content', 'Excited / Interested', 'Love / Warmth', 'Sad', 'Angry', 'Fearful / Anxious', 'Disgusted', 'Surprised', 'Bored / Tired', 'No emotion', 'Unsure', 'Other'])}
          <div id="emotionOtherWrap" class="other-text-wrap" style="display:none;">
            <label for="emotionOther">Please type the other feeling:</label>
            <input id="emotionOther" type="text" placeholder="Type here">
          </div>
        </div>

        <div class="question-card">
          <h3>4. Intensity of the response</h3>
          ${this.optionButtons('intensity', [
            { value: '0', label: '0 No feeling' },
            { value: '1', label: '1 Mild' },
            { value: '2', label: '2 Moderate' },
            { value: '3', label: '3 High / Strong' },
            { value: '4', label: '4 Severe / Very strong' }
          ])}
        </div>

        <div class="task-controls-bottom">
          <button class="btn-success" id="scientificSubmitBtn" onclick="SCIENTIFIC_TASK.submitRating()">Submit Response</button>
          <button class="btn-warning" onclick="SCIENTIFIC_TASK.skipTrial()">Skip Trial</button>
          <button class="btn-secondary" onclick="SCIENTIFIC_TASK.pause()">Pause</button>
          <button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button>
        </div>
      </section>`;
    if (typeof NAVIGATION !== 'undefined') NAVIGATION.scrollToTop();
  },

  selectOption(group, value, button) {
    this.responses[group] = value;
    document.querySelectorAll(`.response-option[data-group="${group}"]`).forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    if (group === 'emotion') {
      const wrap = document.getElementById('emotionOtherWrap');
      if (wrap) wrap.style.display = value === 'Other' ? 'block' : 'none';
    }
  },

  submitRating() {
    if (this.isSubmitting) return;
    const required = ['valence', 'arousal', 'emotion', 'intensity'];
    const missing = required.filter(key => !this.responses[key]);
    if (missing.length) {
      alert('Please answer all questions, or use Skip Trial.');
      return;
    }
    this.isSubmitting = true;
    const btn = document.getElementById('scientificSubmitBtn');
    if (btn) btn.disabled = true;

    this.logTrial('completed', {
      valence_response: this.responses.valence,
      valence_scale_type: '5_point_with_unsure_neutral',
      arousal_response: this.responses.arousal,
      arousal_scale_type: '5_point_with_unsure_neutral',
      emotion_response: this.responses.emotion,
      emotion_question_label: 'Closest emotional response',
      emotion_other_text: document.getElementById('emotionOther') ? document.getElementById('emotionOther').value : '',
      intensity_score: this.responses.intensity,
      intensity_scale_type: '0_no_feeling_1_mild_2_moderate_3_high_strong_4_severe_very_strong'
    });
    this.nextAfterWashout();
  },

  skipTrial() {
    this.logTrial('skipped', {
      skip_status: 'skipped',
      skip_reason: NAVIGATION.askSkipReason()
    });
    this.nextAfterWashout();
  },

  logTrial(status, extra = {}) {
    const s = this.current;
    const now = new Date().toISOString();
    STATE.logEvent(status === 'skipped' ? CONFIG.EVENT_TYPES.SKIP : CONFIG.EVENT_TYPES.RESPONSE, {
      task_name: CONFIG.TASKS.SCIENTIFIC,
      trial_number: this.index + 1,
      stimulus_id: s.id,
      stimulus_name: s.name,
      cielab_L: s.cielab.L,
      cielab_a: s.cielab.a,
      cielab_b: s.cielab.b,
      cielch_L: s.L,
      cielch_C: s.C,
      cielch_h: s.h,
      rgb_r: s.rgb.r,
      rgb_g: s.rgb.g,
      rgb_b: s.rgb.b,
      hex_value: s.hex,
      gamut_status: s.gamutStatus,
      munsell_reference: s.munsell || 'Pending calibrated Munsell measurement',
      session_munsell_reference_note: STATE.pageState.munsellReference || '',
      monitor_id: STATE.pageState.monitorId || '',
      ...this.currentTimes,
      rating_onset_time: this.ratingOnset,
      response_time_ms: new Date(now) - new Date(this.ratingOnset),
      trial_status: status,
      skip_status: status === 'skipped' ? 'skipped' : 'not_skipped',
      skip_reason: '',
      ...extra
    });
  },

  async nextAfterWashout() {
    this.index += 1;
    this.renderTimedScreen({ color: '#919191', label: 'Grey rest', ms: this.timings().washout, fixation: false, dot: false });
    await this.delay(this.timings().washout);
    this.runTrial();
  },

  pause() {
    this.paused = true;
    NAVIGATION.pause();
    this.paused = false;
    this.showRating();
  },

  resume() {
    this.paused = false;
    this.runTrial();
  },

  async completeTask() {
    await this.exitFullscreenSafe();
    STATE.logEvent(CONFIG.EVENT_TYPES.COMPLETE, {
      task_name: CONFIG.TASKS.SCIENTIFIC,
      total_trials: this.trials.length
    });
    STORAGE.autoSave();
    NAVIGATION.nextPage();
  }
};
