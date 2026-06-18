const COLOUR_TO_FACE_TASK = {
  colours: [
    ['Red', '#D01F18'], ['Orange', '#F28C28'], ['Yellow', '#F2C230'], ['Green', '#2E8B57'],
    ['Teal', '#008C8C'], ['Blue', '#2F62C9'], ['Purple', '#7B3FA1'], ['Pink', '#E78AB4'],
    ['Brown', '#8B5A2B'], ['White', '#FFFFFF'], ['Grey', '#919191'], ['Black', '#111111']
  ],
  emotions: [
    { name: 'Happiness', emoji: '😀' },
    { name: 'Sadness', emoji: '☹️' },
    { name: 'Anger', emoji: '😠' },
    { name: 'Fear', emoji: '😨' },
    { name: 'Disgust', emoji: '🤢' },
    { name: 'Neutral', emoji: '😐' }
  ],
  index: 0,
  selected: null,
  start: null,

  init() {
    this.index = 0;
    this.selected = null;
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
      task_name: CONFIG.TASKS.COLOUR_TO_FACE,
      event: 'task_initialized'
    });
    this.renderCurrentItem();
  },

  renderFaceOption(emotion) {
    const [colourName, hex] = this.colours[this.index];
    const selectedClass = this.selected === emotion.name ? 'selected' : '';
    const bgStyle = this.selected === emotion.name ? `style="background:${hex};"` : '';
    return `
      <button type="button" class="face-option-large ${selectedClass}" ${bgStyle} onclick="COLOUR_TO_FACE_TASK.choose('${emotion.name}', this)">
        <span class="emoji-face-symbol small-face">${emotion.emoji}</span>
        <span class="face-label-large">${emotion.name}</span>
      </button>`;
  },

  renderCurrentItem() {
    if (this.index >= this.colours.length) return this.completeTask();
    this.selected = null;
    this.start = new Date().toISOString();
    const [name, hex] = this.colours[this.index];

    document.getElementById('mainContent').innerHTML = `
      <section class="association-task improved-association">
        <h2>Colour-to-Face Association</h2>
        <p class="task-instruction">Which face best matches this colour?</p>
        <p class="trial-title">Item ${this.index + 1} of ${this.colours.length}</p>

        <div class="large-colour-box association-colour-box" style="background:${hex};"></div>
        <p class="colour-name-label"><strong>${name}</strong></p>

        <div class="answer-section">
          <h3>Choose a face</h3>
          <div class="face-grid-large">
            ${this.emotions.map(e => this.renderFaceOption(e)).join('')}
          </div>
        </div>

        <div class="task-controls-bottom">
          <button class="btn-success" onclick="COLOUR_TO_FACE_TASK.submitResponse()">Submit</button>
          <button class="btn-warning" onclick="COLOUR_TO_FACE_TASK.skipItem()">Skip Item</button>
          <button class="btn-secondary" onclick="COLOUR_TO_FACE_TASK.skipTask()">Skip Task</button>
          <button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button>
        </div>
      </section>`;
  },

  choose(emotionName, button) {
    this.selected = emotionName;
    document.querySelectorAll('.face-option-large').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
  },

  submitResponse() {
    if (!this.selected) {
      alert('Select a face or skip this item.');
      return;
    }
    const now = new Date().toISOString();
    const [name, hex] = this.colours[this.index];
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
      task_name: CONFIG.TASKS.COLOUR_TO_FACE,
      item_number: this.index + 1,
      stimulus_colour: name,
      stimulus_hex: hex,
      selected_emotion: this.selected,
      response_time_ms: new Date(now) - new Date(this.start),
      trial_status: 'completed'
    });
    this.index += 1;
    this.renderCurrentItem();
  },

  skipItem() {
    const [name, hex] = this.colours[this.index];
    STATE.logEvent(CONFIG.EVENT_TYPES.SKIP, {
      task_name: CONFIG.TASKS.COLOUR_TO_FACE,
      item_number: this.index + 1,
      stimulus_colour: name,
      stimulus_hex: hex,
      trial_status: 'skipped',
      skip_status: 'skipped',
      skip_reason: NAVIGATION.askSkipReason()
    });
    STORAGE.autoSave();
    this.index += 1;
    this.renderCurrentItem();
  },

  skipTask() {
    STATE.logSkip(CONFIG.TASKS.COLOUR_TO_FACE, NAVIGATION.askSkipReason());
    this.completeTask();
  },

  pause() { NAVIGATION.pause(); },
  resume() { NAVIGATION.resume(); },

  completeTask() {
    STATE.logEvent(CONFIG.EVENT_TYPES.COMPLETE, { task_name: CONFIG.TASKS.COLOUR_TO_FACE });
    STORAGE.autoSave();
    NAVIGATION.nextPage();
  }
};
