const UI_CONTROLS = {
  renderSetup() {
    return `
      <section class="setup-page task-page">
        <h2>Researcher and Participant Setup</h2>
        <div class="form-group"><label for="researcherName">Researcher Name / Initials</label><input id="researcherName" type="text" placeholder="Researcher initials"></div>
        <div class="form-group"><label for="participantId">Participant Code</label><input id="participantId" type="text" placeholder="e.g., TEST_001"></div>
        <div class="form-group"><label for="versionSelect">Test Version</label><select id="versionSelect"><option value="demo">Demo Mode</option><option value="short">Short Version</option><option value="full">Full Version</option></select></div>
        <div class="button-container"><button class="btn-success" onclick="UI_CONTROLS.submitSetup()">Continue</button></div>
      </section>`;
  },
  setupEventListeners() {},
  submitSetup() {
    const participantId = document.getElementById('participantId').value.trim();
    const researcher = document.getElementById('researcherName').value.trim();
    const version = document.getElementById('versionSelect').value;
    if (!participantId) { alert('Please enter a participant code.'); return; }
    STATE.participantId = participantId;
    STATE.version = version;
    STATE.pageState.researcher = researcher;
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, { task_name: CONFIG.TASKS.SETUP, researcher, test_version: version });
    STORAGE.autoSave();
    NAVIGATION.nextPage();
  },
  renderConsent() {
    return `
      <section class="consent-page task-page">
        <h2>Consent Confirmation</h2>
        <div class="alert alert-info"><p>This application is a research prototype and not a diagnostic instrument. Continue only after the approved informed-consent process has been completed.</p></div>
        <div class="checkbox-item"><input type="checkbox" id="consentCheckbox"><label for="consentCheckbox">Consent pathway completed</label></div>
        <div class="button-container"><button class="btn-success" onclick="UI_CONTROLS.submitConsent()">Continue</button><button class="btn-secondary" onclick="NAVIGATION.previousPage()">Back</button><button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button></div>
      </section>`;
  },
  submitConsent() {
    if (!document.getElementById('consentCheckbox').checked) { alert('Consent confirmation is required.'); return; }
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, { task_name: CONFIG.TASKS.CONSENT, consent_confirmed: true });
    STORAGE.autoSave();
    NAVIGATION.nextPage();
  },
  renderTaskPlaceholder(title, description) {
    return `<section class="task-placeholder task-page"><h2>${title}</h2><p>${description}</p><div class="button-container"><button class="btn-success" onclick="NAVIGATION.nextPage()">Continue</button><button class="btn-warning" onclick="NAVIGATION.skipToNextPage()">Skip</button><button class="btn-secondary" onclick="NAVIGATION.previousPage()">Back</button><button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button></div></section>`;
  },
  renderSummary() {
    const aft = STATE.pageState.aftDetails || {};
    const skipped = STATE.dataLog.filter(r => r.event_type === CONFIG.EVENT_TYPES.SKIP || r.skip_status === 'skipped').length;
    return `
      <section class="summary-page task-page">
        <h2>Session Summary</h2>
        <div class="summary-info">
          <p><strong>Session ID:</strong> ${STATE.sessionId}</p>
          <p><strong>Participant ID:</strong> ${STATE.participantId || 'Not set'}</p>
          <p><strong>Test Version:</strong> ${STATE.version}</p>
          <p><strong>AFT File:</strong> ${aft.aft_file_name || 'Not provided'}</p>
          <p><strong>Events Logged:</strong> ${STATE.dataLog.length}</p>
          <p><strong>Skipped Events:</strong> ${skipped}</p>
        </div>
        <div class="alert alert-info"><p>Download the CSV before closing this browser.</p></div>
        <div class="button-container"><button class="btn-success" onclick="downloadBehaviouralCSV()">Download Behavioural CSV</button><button class="btn-warning" onclick="NAVIGATION.startNewSession()">Start New Session</button></div>
      </section>`;
  }
};
