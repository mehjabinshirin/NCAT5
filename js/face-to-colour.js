const FACE_TO_COLOUR_TASK = {
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
  colours: [
    ['Red', '#D01F18'], ['Orange', '#F28C28'], ['Yellow', '#F2C230'], ['Green', '#2E8B57'],
    ['Teal', '#008C8C'], ['Blue', '#2F62C9'], ['Purple', '#7B3FA1'], ['Pink', '#E78AB4'],
    ['Brown', '#8B5A2B'], ['White', '#FFFFFF'], ['Grey', '#919191'], ['Black', '#111111']
  ],

  init() {
    this.index = 0;
    this.selected = null;
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
      task_name: CONFIG.TASKS.FACE_TO_COLOUR,
      event: 'task_initialized'
    });
    this.renderCurrentItem();
  },

  renderFace() {
    const item = this.emotions[this.index];
    const bg = this.selected ? this.selected.hex : '#eeeeee';
    const border = this.selected ? '#111111' : '#666666';
    return `
      <div class="emoji-face-wrap" style="background:${bg}; border-color:${border};">
        <span class="emoji-face-symbol">${item.emoji}</span>
      </div>
      <div class="face-label-large">${item.name}</div>
      ${this.selected ? `<div class="selected-preview">Selected colour: <strong>${this.selected.name}</strong></div>` : '<div class="selected-preview">No colour selected yet</div>'}`;
  },

  renderCurrentItem() {
    if (this.index >= this.emotions.length) return this.completeTask();
    this.selected = null;
    this.start = new Date().toISOString();
    const item = this.emotions[this.index];
    document.getElementById('mainContent').innerHTML = `
      <section class="association-task improved-association">
        <h2>Face-to-Colour Association</h2>
        <p class="task-instruction">Which colour best matches this expression?</p>
        <p class="trial-title">Item ${this.index + 1} of ${this.emotions.length}</p>

        <div id="facePreview" class="face-display-large">
          ${this.renderFace()}
        </div>

        <div class="answer-section">
          <h3>Choose a colour</h3>
          <div class="color-grid answer-grid">
            ${this.colours.map(([name, hex]) => `
              <button type="button" class="color-button" data-colour="${name}" style="background:${hex};color:${['White','Yellow'].includes(name) ? '#111' : '#fff'}" onclick="FACE_TO_COLOUR_TASK.choose('${name}','${hex}', this)">${name}</button>
            `).join('')}
          </div>
        </div>

        <div class="task-controls-bottom">
          <button class="btn-success" onclick="FACE_TO_COLOUR_TASK.submitResponse()">Submit</button>
          <button class="btn-warning" onclick="FACE_TO_COLOUR_TASK.skipItem()">Skip Item</button>
          <button class="btn-secondary" onclick="FACE_TO_COLOUR_TASK.skipTask()">Skip Task</button>
          <button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button>
        </div>
      </section>`;
  },

  choose(name, hex, button) {
    this.selected = { name, hex };
    document.querySelectorAll('.color-button').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    const preview = document.getElementById('facePreview');
    if (preview) preview.innerHTML = this.renderFace();
  },

  submitResponse() {
    if (!this.selected) {
      alert('Select a colour or skip this item.');
      return;
    }
    const now = new Date().toISOString();
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
      task_name: CONFIG.TASKS.FACE_TO_COLOUR,
      item_number: this.index + 1,
      stimulus_emotion: this.emotions[this.index].name,
      selected_colour: this.selected.name,
      selected_hex: this.selected.hex,
      response_time_ms: new Date(now) - new Date(this.start),
      trial_status: 'completed'
    });
    this.index += 1;
    this.renderCurrentItem();
  },

  skipItem() {
    const reason = NAVIGATION.askSkipReason();
    STATE.logEvent(CONFIG.EVENT_TYPES.SKIP, {
      task_name: CONFIG.TASKS.FACE_TO_COLOUR,
      item_number: this.index + 1,
      stimulus_emotion: this.emotions[this.index].name,
      trial_status: 'skipped',
      skip_status: 'skipped',
      skip_reason: reason
    });
    STORAGE.autoSave();
    this.index += 1;
    this.renderCurrentItem();
  },

  skipTask() {
    STATE.logSkip(CONFIG.TASKS.FACE_TO_COLOUR, NAVIGATION.askSkipReason());
    this.completeTask();
  },

  pause() { NAVIGATION.pause(); },
  resume() { NAVIGATION.resume(); },

  completeTask() {
    STATE.logEvent(CONFIG.EVENT_TYPES.COMPLETE, { task_name: CONFIG.TASKS.FACE_TO_COLOUR });
    STORAGE.autoSave();
    NAVIGATION.nextPage();
  }
};
