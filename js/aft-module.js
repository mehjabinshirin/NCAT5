const AFT_MODULE = {
  render() {
    const aft = STATE.pageState.aftDetails || {};
    return `
      <section class="task-page">
        <h2>AFT Reference & Synchronization</h2>
        <div class="alert alert-info">
          <p>AFT data are recorded separately. This page only stores reference details for later matching.</p>
        </div>
        <div class="form-group">
          <label for="aftAvailable">AFT Available</label>
          <select id="aftAvailable">
            <option value="Yes" ${aft.aft_available==='Yes'?'selected':''}>Yes</option>
            <option value="No" ${aft.aft_available==='No'?'selected':''}>No</option>
            <option value="Skipped" ${aft.aft_available==='Skipped'?'selected':''}>Skipped</option>
          </select>
        </div>
        <div class="form-group"><label for="aftFileName">AFT File Name</label><input id="aftFileName" type="text" value="${aft.aft_file_name||''}" placeholder="e.g., NCAT_001_AFT.csv"></div>
        <div class="form-group"><label for="aftStartTime">AFT Start Time</label><input id="aftStartTime" type="time" value="${aft.aft_start_time||''}"></div>
        <div class="form-group"><label for="aftOperator">AFT Operator Initials</label><input id="aftOperator" type="text" value="${aft.aft_operator||''}"></div>
        <div class="form-group"><label for="aftNotes">AFT Notes</label><textarea id="aftNotes">${aft.aft_notes||''}</textarea></div>
        <div class="button-container">
          <button class="btn-success" onclick="AFT_MODULE.confirm()">Confirm AFT Details</button>
          <button class="btn-warning" onclick="AFT_MODULE.skip()">Skip AFT</button>
          <button class="btn-secondary" onclick="NAVIGATION.previousPage()">Back</button>
          <button class="btn-secondary" onclick="NAVIGATION.pause()">Pause</button>
          <button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button>
        </div>
      </section>`;
  },
  setupEventListeners() {},
  collect(statusOverride) {
    return {
      aft_available: statusOverride || document.getElementById('aftAvailable').value,
      aft_file_name: document.getElementById('aftFileName').value.trim(),
      aft_start_time: document.getElementById('aftStartTime').value,
      aft_operator: document.getElementById('aftOperator').value.trim(),
      aft_notes: document.getElementById('aftNotes').value.trim(),
      behavioural_time: new Date().toISOString()
    };
  },
  confirm() {
    const details = this.collect();
    STATE.pageState.aftDetails = details;
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, { task_name: CONFIG.TASKS.AFT, ...details });
    STORAGE.autoSave();
    NAVIGATION.nextPage();
  },
  skip() {
    const reason = NAVIGATION.askSkipReason();
    const details = this.collect('Skipped');
    STATE.pageState.aftDetails = details;
    STATE.logEvent(CONFIG.EVENT_TYPES.SKIP, { task_name: CONFIG.TASKS.AFT, skip_reason: reason, ...details });
    STORAGE.autoSave();
    NAVIGATION.nextPage();
  }
};
