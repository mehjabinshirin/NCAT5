const INDIAN_MEMORY_TASK = {
  culturalColours: [
    { id: 'IC01', name: 'Kumkum red', L: 45, a: 65, b: 50, hex: '#D01F18' },
    { id: 'IC02', name: 'Haldi yellow', L: 85, a: -15, b: 85, hex: '#F2C230' },
    { id: 'IC03', name: 'Kesari / saffron', L: 65, a: 35, b: 70, hex: '#FF8C1A' },
    { id: 'IC04', name: 'Marigold orange', L: 75, a: 40, b: 65, hex: '#F59E18' },
    { id: 'IC05', name: 'Mehendi green-brown', L: 40, a: -25, b: 30, hex: '#6B7B3A' },
    { id: 'IC06', name: 'Indigo / neel', L: 25, a: 15, b: -45, hex: '#263B8C' },
    { id: 'IC07', name: 'Peacock blue-green', L: 45, a: -20, b: -35, hex: '#008C8C' },
    { id: 'IC08', name: 'Chandan beige', L: 70, a: 10, b: 25, hex: '#D8B782' },
    { id: 'IC09', name: 'Terracotta / mitti brown', L: 50, a: 30, b: 35, hex: '#A75C36' },
    { id: 'IC10', name: 'Jasmine white', L: 95, a: -2, b: 5, hex: '#F6F0DD' }
  ],
  categories: [
    'Family/person', 'Friend/community', 'Home', 'Village/town', 'Temple/religious place',
    'Hospital/clinic', 'School/workplace', 'Festival', 'Marriage/family ceremony', 'Religious ritual',
    'Childhood event', 'Clothing/textile', 'Jewellery/decoration', 'Household object', 'Art/media',
    'Food/spice/kitchen', 'Cosmetics/body decoration', 'Medicine/health', 'Flowers/plants', 'Animals/birds',
    'Water/pond/river/sea', 'Sky/night', 'Land/soil', 'Summer', 'Monsoon/rain', 'Winter',
    'Morning/evening/night', 'No memory', 'Not sure', 'Other'
  ],
  index: 0,
  start: null,
  responses: {},

  init() {
    this.index = 0;
    this.responses = {};
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
      task_name: CONFIG.TASKS.MEMORY,
      event: 'task_initialized'
    });
    this.renderCurrentItem();
  },

  optionButtons(group, options) {
    return `<div class="response-button-grid memory-button-grid ${group === 'memoryCategory' ? 'memory-category-grid-wide' : ''}">${options.map(value => `
      <button type="button" class="response-option" data-group="${group}" data-value="${value}" onclick="INDIAN_MEMORY_TASK.selectOption('${group}', '${value.replace(/'/g, "\\'")}', this)">${value}</button>
    `).join('')}</div>`;
  },

  renderCurrentItem() {
    if (this.index >= this.culturalColours.length) return this.completeTask();
    this.responses = {};
    const c = this.culturalColours[this.index];
    this.start = new Date().toISOString();

    document.getElementById('mainContent').innerHTML = `
      <section class="memory-task-page">
        <h2>Indian Chromatic Memory</h2>
        <p class="trial-title">Colour ${this.index + 1} of ${this.culturalColours.length}</p>

        <div class="large-colour-box cultural-colour-box" style="background:${c.hex};"></div>
        <p class="stimulus-code-line"><strong>${c.id}: ${c.name}</strong> | Provisional CIELAB: L*=${c.L}, a*=${c.a}, b*=${c.b} | HEX ${c.hex}</p>

        <div class="question-card">
          <h3>1. Is this colour familiar to you?</h3>
          ${this.optionButtons('familiarity', ['Yes', 'No', 'Not sure'])}
        </div>

        <div class="question-card">
          <h3>2. Does this colour remind you of anything?</h3>
          ${this.optionButtons('reminds', ['Yes', 'No', 'Not sure'])}
        </div>

        <div class="question-card">
          <h3>3. What does it remind you of?</h3>
          ${this.optionButtons('memoryCategory', this.categories)}
          <div id="otherMemoryWrap" class="other-text-wrap" style="display:none;">
            <label for="otherMemory">Please describe the memory or association:</label>
            <input id="otherMemory" type="text" placeholder="Type here">
          </div>
        </div>

        <div class="question-card">
          <h3>4. How does this colour feel?</h3>
          ${this.optionButtons('valence', ['Pleasant', 'Neutral', 'Unpleasant'])}
        </div>

        <div class="task-controls-bottom">
          <button class="btn-success" onclick="INDIAN_MEMORY_TASK.submitResponse()">Submit</button>
          <button class="btn-warning" onclick="INDIAN_MEMORY_TASK.skipColour()">Skip Colour</button>
          <button class="btn-secondary" onclick="INDIAN_MEMORY_TASK.skipTask()">Skip Task</button>
          <button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button>
        </div>
      </section>`;
  },

  selectOption(group, value, button) {
    this.responses[group] = value;
    document.querySelectorAll(`.response-option[data-group="${group}"]`).forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    if (group === 'memoryCategory') {
      const wrap = document.getElementById('otherMemoryWrap');
      if (wrap) wrap.style.display = value === 'Other' ? 'block' : 'none';
    }
  },

  submitResponse() {
    const required = ['familiarity', 'reminds', 'memoryCategory', 'valence'];
    const missing = required.filter(key => !this.responses[key]);
    if (missing.length) {
      alert('Please answer all questions or skip this colour.');
      return;
    }

    const c = this.culturalColours[this.index];
    const now = new Date().toISOString();
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
      task_name: CONFIG.TASKS.MEMORY,
      colour_number: this.index + 1,
      stimulus_id: c.id,
      stimulus_name: c.name,
      cielab_L: c.L,
      cielab_a: c.a,
      cielab_b: c.b,
      hex_value: c.hex,
      familiarity: this.responses.familiarity,
      reminds: this.responses.reminds,
      memory_category: this.responses.memoryCategory,
      memory_other_text: document.getElementById('otherMemory') ? document.getElementById('otherMemory').value : '',
      valence_response: this.responses.valence,
      response_time_ms: new Date(now) - new Date(this.start),
      trial_status: 'completed'
    });
    this.index += 1;
    this.renderCurrentItem();
  },

  skipColour() {
    const c = this.culturalColours[this.index];
    const reason = NAVIGATION.askSkipReason();
    STATE.logEvent(CONFIG.EVENT_TYPES.SKIP, {
      task_name: CONFIG.TASKS.MEMORY,
      colour_number: this.index + 1,
      stimulus_id: c.id,
      stimulus_name: c.name,
      trial_status: 'skipped',
      skip_status: 'skipped',
      skip_reason: reason
    });
    STORAGE.autoSave();
    this.index += 1;
    this.renderCurrentItem();
  },

  skipTask() {
    STATE.logSkip(CONFIG.TASKS.MEMORY, NAVIGATION.askSkipReason());
    this.completeTask();
  },

  pause() { NAVIGATION.pause(); },
  resume() { NAVIGATION.resume(); },

  completeTask() {
    STATE.logEvent(CONFIG.EVENT_TYPES.COMPLETE, { task_name: CONFIG.TASKS.MEMORY });
    STORAGE.autoSave();
    NAVIGATION.nextPage();
  }
};
