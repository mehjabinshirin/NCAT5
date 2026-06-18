// Global state management
const STATE = {
  sessionId: '',
  participantId: '',
  researcherInitials: '',
  researcherName: '',
  version: 'demo',
  currentPageIndex: 0,
  dataLog: [],
  pageState: {},
  isPaused: false,
  pausedAt: null,

  resetSession() {
    this.sessionId = 'NCAT-' + Date.now();
    this.participantId = '';
    this.researcherInitials = '';
    this.researcherName = '';
    this.version = 'demo';
    this.currentPageIndex = 0;
    this.dataLog = [];
    this.pageState = {
      setupComplete: false,
      consentGiven: false,
      researcherInitials: '',
      researcherName: '',
      monitorId: '',
      munsellReference: '',
      aftDetails: null,
      scientificResponses: [],
      faceToColourResponses: [],
      colourToFaceResponses: [],
      indianMemoryResponses: [],
      csvAutoDownloaded: false
    };
    this.isPaused = false;
    this.pausedAt = null;

    this.logEvent(CONFIG.EVENT_TYPES.SESSION_START, {});
  },

  getCurrentPageName() {
    return CONFIG.PAGES[this.currentPageIndex] || 'setup';
  },

  nextPage() {
    if (this.currentPageIndex < CONFIG.PAGES.length - 1) {
      this.currentPageIndex++;
      return true;
    }
    return false;
  },

  previousPage() {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      return true;
    }
    return false;
  },

  goToPage(index) {
    if (index >= 0 && index < CONFIG.PAGES.length) {
      this.currentPageIndex = index;
      return true;
    }
    return false;
  },

  logEvent(eventType, details = {}) {
    const event = {
      session_id: this.sessionId,
      participant_id: this.participantId,
      researcher_initials: this.researcherInitials || this.pageState.researcherInitials || '',
      researcher_name: this.researcherName || this.pageState.researcherName || '',
      test_version: this.version,
      event_type: eventType,
      page: this.getCurrentPageName(),
      timestamp: new Date().toISOString(),
      ...details
    };
    this.dataLog.push(event);

    if (typeof STORAGE !== 'undefined') {
      STORAGE.autoSave();
    }
  },

  logSkip(taskName, reason = 'not_specified') {
    this.logEvent(CONFIG.EVENT_TYPES.SKIP, {
      task_name: taskName,
      skip_reason: reason
    });
  }
};
