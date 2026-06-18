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
  selectedPosition: null,
  displayColours: [],
  start: null,
  colours: [
    ['Red', '#D01F18'], ['Orange', '#F28C28'], ['Yellow', '#F2C230'], ['Green', '#2E8B57'],
    ['Teal', '#008C8C'], ['Blue', '#2F62C9'], ['Purple', '#7B3FA1'], ['Pink', '#E78AB4'],
    ['Brown', '#8B5A2B'], ['White', '#FFFFFF'], ['Grey', '#919191'], ['Black', '#111111']
  ],

  init() {
    this.index = 0;
    this.selected = null;
    this.selectedPosition = null;
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
      task_name: CONFIG.TASKS.FACE_TO_COLOUR,
      event: 'task_initialized',
      attention_design: 'colour_grid_positions_randomized_each_item'
    });
    this.renderCurrentItem();
  },

  shuffleColours() {
    const arr = this.colours.map((c, i) => ({ name: c[0], hex: c[1], originalIndex: i + 1 }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.map((c, i) => ({ ...c, displayPosition: i + 1 }));
  },

  renderProgress() {
    const width = ((this.index + 1) / this.emotions.length) * 100;
    return `<div class="scientific-progress-track" aria-hidden="true"><div class="scientific-progress-fill" style="width:${width}%"></div></div>`;
  },

  renderFace() {
    const item = this.emotions[this.index];
    const bg = this.selected ? this.selected.hex : '#eeeeee';
    const border = this.selected ? '#111111' : '#666666';
    const selectedClass = this.selected ? 'selected-colour-applied' : '';
    return `
      <div class="emoji-face-wrap ${selectedClass}" style="background:${bg}; border-color:${border};">
        <span class="emoji-face-symbol">${item.emoji}</span>
      </div>
      <div class="face-label-large">${item.name}</div>
      ${this.selected ? `<div class="selected-preview"><span class="selected-swatch" style="background:${this.selected.hex}"></span> Applied colour: <strong>${this.selected.name}</strong></div>` : '<div class="selected-preview">No colour selected yet</div>'}`;
  },

  renderCurrentItem() {
    if (this.index >= this.emotions.length) return this.completeTask();
    this.selected = null;
    this.selectedPosition = null;
    this.displayColours = this.shuffleColours();
    this.start = new Date().toISOString();
    document.getElementById('mainContent').innerHTML = `
      <section class="association-task improved-association page-card">
        <h2>Face-to-Colour Association</h2>
        <p class="task-instruction">Which colour best matches this expression?</p>
        <p class="trial-title">Item ${this.index + 1} of ${this.emotions.length}</p>
        ${this.renderProgress()}

        <div id="facePreview" class="face-display-large">
          ${this.renderFace()}
        </div>

        <div class="answer-section">
          <h3>Choose a colour</h3>
          <p class="field-note colour-grid-note">Colour positions are intentionally shuffled for each item. Please look at the options carefully before responding.</p>
          <div class="color-grid answer-grid">
            ${this.displayColours.map((c) => `
              <button type="button" class="color-button" data-colour="${c.name}" data-position="${c.displayPosition}" style="background:${c.hex};color:${['White','Yellow'].includes(c.name) ? '#111' : '#fff'}" onclick="FACE_TO_COLOUR_TASK.choose('${c.name}','${c.hex}', ${c.displayPosition}, this)">${c.name}</button>
            `).join('')}
          </div>
        </div>

        <div class="task-controls-bottom">
          <button class="btn-success" id="faceColourSubmitBtn" onclick="FACE_TO_COLOUR_TASK.submitResponse()">Submit</button>
          <button class="btn-warning" onclick="FACE_TO_COLOUR_TASK.skipItem()">Skip Item</button>
          <button class="btn-secondary" onclick="FACE_TO_COLOUR_TASK.skipTask()">Skip Task</button>
          <button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button>
        </div>
      </section>`;
    if (typeof NAVIGATION !== 'undefined') NAVIGATION.scrollToTop();
  },

  choose(name, hex, position, button) {
    this.selected = { name, hex };
    this.selectedPosition = position;
    document.querySelectorAll('.color-button').forEach(btn => {
      btn.classList.remove('selected');
      btn.removeAttribute('aria-pressed');
    });
    button.classList.add('selected');
    button.setAttribute('aria-pressed', 'true');
    const preview = document.getElementById('facePreview');
    if (preview) preview.innerHTML = this.renderFace();
  },

  submitResponse() {
    if (!this.selected) {
      alert('Select a colour or skip this item.');
      return;
    }
    const btn = document.getElementById('faceColourSubmitBtn');
    if (btn) btn.disabled = true;
    const now = new Date().toISOString();
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
      task_name: CONFIG.TASKS.FACE_TO_COLOUR,
      item_number: this.index + 1,
      stimulus_emotion: this.emotions[this.index].name,
      selected_colour: this.selected.name,
      selected_hex: this.selected.hex,
      selected_display_position: this.selectedPosition,
      colour_grid_order: this.displayColours.map(c => `${c.displayPosition}:${c.name}`).join('|'),
      attention_design: 'randomized_colour_positions',
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
      colour_grid_order: this.displayColours.map(c => `${c.displayPosition}:${c.name}`).join('|'),
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
