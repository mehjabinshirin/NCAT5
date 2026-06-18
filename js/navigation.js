const NAVIGATION = {
  init() {
    if (STORAGE.hasUnfinishedSession()) {
      const confirmed = confirm('An unfinished session was found. Resume it?');
      if (confirmed) STORAGE.restoreSession(); else { STORAGE.clearSession(); STATE.resetSession(); }
    } else STATE.resetSession();
    this.render();
    this.updateSessionInfo();
  },

  scrollToTop() {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
    const main = document.getElementById('mainContent');
    if (main && main.scrollIntoView) main.scrollIntoView({ block: 'start' });
  },

  render() {
    const mainContent = document.getElementById('mainContent');
    const currentPage = STATE.getCurrentPageName();
    STATE.logEvent(CONFIG.EVENT_TYPES.PAGE_ENTER, { page_name: currentPage });
    let html = '';
    if (currentPage === 'setup') html = UI_CONTROLS.renderSetup();
    else if (currentPage === 'consent') html = UI_CONTROLS.renderConsent();
    else if (currentPage === 'aft') html = AFT_MODULE.render();
    else if (currentPage === 'practice') html = UI_CONTROLS.renderTaskPlaceholder('Practice Trial','Practice session to familiarize with task format.');
    else if (currentPage === 'scientific-color') html = this.renderStartPage('Scientific Colour Task','This task presents controlled CIELCh/sRGB colours and asks short emotion ratings.','NAVIGATION.startScientificTask()');
    else if (currentPage === 'face-color') html = this.renderStartPage('Face-to-Colour Association','Select the colour that best matches each grayscale emotional face. Colour positions change across items to support attention.','NAVIGATION.startFaceToColourTask()');
    else if (currentPage === 'color-face') html = this.renderStartPage('Colour-to-Face Association','Select the face that best matches each displayed colour.','NAVIGATION.startColourToFaceTask()');
    else if (currentPage === 'memory') html = this.renderStartPage('Indian Chromatic Memory Task','Answer familiarity, memory, and feeling questions for cultural colours.','NAVIGATION.startIndianMemoryTask()');
    else if (currentPage === 'summary') html = UI_CONTROLS.renderSummary();
    else html = '<div class="alert alert-danger">Unknown page.</div>';
    mainContent.innerHTML = html;
    this.updateSessionInfo();
    STORAGE.autoSave();
    this.scrollToTop();

    if (currentPage === 'summary') {
      setTimeout(() => DATA_EXPORT.autoDownloadOnSummary(), 300);
    }
  },

  renderStartPage(title, desc, action) {
    const beginLabel = title.includes('Scientific') ? 'Enter Fullscreen & Begin' : 'Begin Task';
    return `<section class="scientific-page page-card"><h2>${title}</h2><p>${desc}</p><div class="button-container"><button class="btn-success" onclick="${action}">${beginLabel}</button><button class="btn-warning" onclick="NAVIGATION.skipToNextPage()">Skip Task</button><button class="btn-secondary" onclick="NAVIGATION.previousPage()">Back</button><button class="btn-secondary" onclick="NAVIGATION.pause()">Pause</button><button class="btn-danger" onclick="NAVIGATION.stopTest()">Stop Test</button></div></section>`;
  },

  askSkipReason() {
    const reason = prompt('Reason for skip?\n' + CONFIG.SKIP_REASONS.join(', '), 'participant fatigue');
    return reason || 'not_specified';
  },

  async startScientificTask() {
    SCIENTIFIC_TASK.init(STATE.version);
    try { await SCIENTIFIC_TASK.startFullscreen(); }
    catch(e) { STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE,{task_name:CONFIG.TASKS.SCIENTIFIC,event:'fullscreen_unavailable',error:String(e)}); }
    this.scrollToTop();
    SCIENTIFIC_TASK.runTrial();
  },

  startFaceToColourTask() { this.scrollToTop(); FACE_TO_COLOUR_TASK.init(); },
  startColourToFaceTask() { this.scrollToTop(); COLOUR_TO_FACE_TASK.init(); },
  startIndianMemoryTask() { this.scrollToTop(); INDIAN_MEMORY_TASK.init(); },

  skipToNextPage() {
    const p = STATE.getCurrentPageName();
    STATE.logSkip(p, this.askSkipReason());
    STORAGE.autoSave();
    this.nextPage();
  },

  nextPage() { STATE.nextPage(); this.render(); },
  previousPage() { if (STATE.previousPage()) this.render(); else alert('Cannot go back from this page.'); },
  goToPage(pageIndex) { if (STATE.goToPage(pageIndex)) this.render(); },

  pause() {
    STATE.isPaused = true;
    STATE.pausedAt = new Date().toISOString();
    STATE.logEvent(CONFIG.EVENT_TYPES.PAUSE, { page_name: STATE.getCurrentPageName() });
    STORAGE.autoSave();
    alert('Session paused. Click OK to continue when ready.');
    this.resume();
  },

  resume() {
    STATE.isPaused = false;
    STATE.logEvent(CONFIG.EVENT_TYPES.RESUME, { page_name: STATE.getCurrentPageName() });
    STORAGE.autoSave();
  },

  stopTest() {
    if (confirm('Stop the test and go to summary? A CSV download will be started automatically on the summary page.')) {
      STATE.logEvent(CONFIG.EVENT_TYPES.STOP, { page_name: STATE.getCurrentPageName(), reason:'user_stop' });
      STORAGE.autoSave();
      this.goToPage(8);
    }
  },

  startNewSession() {
    if (confirm('Clear this saved browser session and start a new session? Make sure you have saved the downloaded CSV first.')) {
      STORAGE.clearSession();
      STATE.resetSession();
      this.render();
    }
  },

  updateSessionInfo() {
    const el = document.getElementById('sessionInfo');
    if(el) {
      const researcher = STATE.researcherInitials || STATE.pageState.researcherInitials || 'Not Set';
      el.textContent = `Session: ${STATE.sessionId ? STATE.sessionId.substring(0,12)+'...' : 'New'} | Researcher: ${researcher} | Participant: ${STATE.participantId || 'Not Set'} | Page: ${STATE.currentPageIndex+1}/${CONFIG.PAGES.length}`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => { NAVIGATION.init(); setInterval(() => NAVIGATION.updateSessionInfo(), 5000); });
