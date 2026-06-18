const UI_CONTROLS = {
  renderSetup() {
    return `
      <section class="setup-page task-page page-card">
        <h2>Researcher and Participant Setup</h2>
        <p class="helper-text">Enter the study identifiers before starting. Researcher initials are included in every CSV row for traceability.</p>

        <div class="setup-grid">
          <div class="form-group">
            <label for="researcherInitials">Researcher Initials <span class="required-star">*</span></label>
            <input id="researcherInitials" type="text" maxlength="12" placeholder="e.g., SRM" autocomplete="off">
          </div>
          <div class="form-group">
            <label for="researcherName">Researcher Name / Notes</label>
            <input id="researcherName" type="text" placeholder="Optional full name or note" autocomplete="off">
          </div>
        </div>

        <div class="setup-grid">
          <div class="form-group">
            <label for="participantId">Participant Code <span class="required-star">*</span></label>
            <input id="participantId" type="text" placeholder="e.g., TEST_001" autocomplete="off">
          </div>
          <div class="form-group">
            <label for="versionSelect">Test Version</label>
            <select id="versionSelect">
              <option value="demo">Demo Mode</option>
              <option value="short">Short Version</option>
              <option value="full">Full Version</option>
            </select>
          </div>
        </div>

        <div class="setup-grid">
          <div class="form-group">
            <label for="monitorId">Monitor / Device ID</label>
            <input id="monitorId" type="text" placeholder="Optional, e.g., LabMonitor01">
          </div>
          <div class="form-group">
            <label for="munsellReference">Munsell / Calibration Reference</label>
            <input id="munsellReference" type="text" placeholder="Optional; add measured Munsell or calibration note">
            <p class="field-note">Munsell values should be added only after calibrated measurement. The app records this note in the CSV.</p>
          </div>
        </div>

        <div class="button-container">
          <button class="btn-success" onclick="UI_CONTROLS.submitSetup()">Continue</button>
        </div>
      </section>`;
  },

  setupEventListeners() {},

  submitSetup() {
    const participantId = document.getElementById('participantId').value.trim();
    const researcherInitials = document.getElementById('researcherInitials').value.trim().toUpperCase();
    const researcherName = document.getElementById('researcherName').value.trim();
    const version = document.getElementById('versionSelect').value;
    const monitorId = document.getElementById('monitorId').value.trim();
    const munsellReference = document.getElementById('munsellReference').value.trim();

    if (!researcherInitials) { alert('Please enter researcher initials.'); return; }
    if (!participantId) { alert('Please enter a participant code.'); return; }

    STATE.participantId = participantId;
    STATE.researcherInitials = researcherInitials;
    STATE.researcherName = researcherName;
    STATE.version = version;
    STATE.pageState.setupComplete = true;
    STATE.pageState.researcherInitials = researcherInitials;
    STATE.pageState.researcherName = researcherName;
    STATE.pageState.monitorId = monitorId;
    STATE.pageState.munsellReference = munsellReference;
    STATE.pageState.csvAutoDownloaded = false;

    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
      task_name: CONFIG.TASKS.SETUP,
      researcher_initials: researcherInitials,
      researcher_name: researcherName,
      participant_code: participantId,
      monitor_id: monitorId,
      munsell_reference_note: munsellReference,
      test_version: version
    });
    STORAGE.autoSave();
    NAVIGATION.nextPage();
  },

  renderConsent() {
    return `
      <section class="consent-page task-page page-card">
        <h2>Consent Confirmation</h2>
        <div class="alert alert-info"><p>This application is a research prototype and not a diagnostic instrument. Continue only after the approved informed-consent process has been completed.</p></div>
        <div class="checkbox-item"><input type="checkbox" id="consentCheckbox"><label for="consentCheckbox">Consent pathway completed</label></div>
        <div class="button-container"><button class="btn-success" onclick="UI_CONTROLS.submitConsent()">Continue</button><button class="btn-secondary" onclick="NAVIGATION.previousPage()">Back</button><button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button></div>
      </section>`;
  },

  submitConsent() {
    if (!document.getElementById('consentCheckbox').checked) { alert('Consent confirmation is required.'); return; }
    STATE.pageState.consentGiven = true;
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, { task_name: CONFIG.TASKS.CONSENT, consent_confirmed: true });
    STORAGE.autoSave();
    NAVIGATION.nextPage();
  },

  renderTaskPlaceholder(title, description) {
    return `<section class="task-placeholder task-page page-card"><h2>${title}</h2><p>${description}</p><div class="button-container"><button class="btn-success" onclick="NAVIGATION.nextPage()">Continue</button><button class="btn-warning" onclick="NAVIGATION.skipToNextPage()">Skip</button><button class="btn-secondary" onclick="NAVIGATION.previousPage()">Back</button><button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button></div></section>`;
  },

  renderSummary() {
    const aft = STATE.pageState.aftDetails || {};
    const skipped = STATE.dataLog.filter(r => r.event_type === CONFIG.EVENT_TYPES.SKIP || r.skip_status === 'skipped').length;
    const researcher = STATE.researcherInitials || STATE.pageState.researcherInitials || 'Not set';
    const monitorId = STATE.pageState.monitorId || 'Not provided';
    const munsellReference = STATE.pageState.munsellReference || 'Not provided / pending calibrated measurement';
    return `
      <section class="summary-page task-page page-card">
        <h2>Session Summary</h2>
        <div class="alert alert-success auto-download-status" id="autoDownloadStatus">Preparing automatic CSV download...</div>
        <div class="summary-info">
          <p><strong>Session ID:</strong> ${STATE.sessionId}</p>
          <p><strong>Participant ID:</strong> ${STATE.participantId || 'Not set'}</p>
          <p><strong>Researcher Initials:</strong> ${researcher}</p>
          <p><strong>Test Version:</strong> ${STATE.version}</p>
          <p><strong>Monitor / Device ID:</strong> ${monitorId}</p>
          <p><strong>Munsell / Calibration Reference:</strong> ${munsellReference}</p>
          <p><strong>AFT File:</strong> ${aft.aft_file_name || 'Not provided'}</p>
          <p><strong>Events Logged:</strong> ${STATE.dataLog.length}</p>
          <p><strong>Skipped Events:</strong> ${skipped}</p>
        </div>
        <div class="alert alert-info"><p>The CSV should download automatically when this summary page opens. Use the manual button only if the browser blocks the automatic download or if you need another copy.</p></div>
        <div class="button-container"><button class="btn-success" onclick="downloadBehaviouralCSV()">Manual Download CSV</button><button class="btn-warning" onclick="NAVIGATION.startNewSession()">Start New Session</button></div>
      </section>`;
  }
};
