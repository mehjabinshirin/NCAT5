// Local storage management
const STORAGE = {
  KEY: 'neurocolor_atlas_v2_session',

  autoSave() {
    try {
      localStorage.setItem(
        this.KEY,
        JSON.stringify({
          sessionId: STATE.sessionId,
          participantId: STATE.participantId,
          researcherInitials: STATE.researcherInitials,
          researcherName: STATE.researcherName,
          version: STATE.version,
          currentPageIndex: STATE.currentPageIndex,
          dataLog: STATE.dataLog,
          pageState: STATE.pageState,
          isPaused: STATE.isPaused,
          pausedAt: STATE.pausedAt
        })
      );
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  },

  hasUnfinishedSession() {
    return localStorage.getItem(this.KEY) !== null;
  },

  restoreSession() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.KEY));

      if (!saved) return false;

      STATE.sessionId = saved.sessionId || '';
      STATE.participantId = saved.participantId || '';
      STATE.researcherInitials = saved.researcherInitials || saved.pageState?.researcherInitials || '';
      STATE.researcherName = saved.researcherName || saved.pageState?.researcherName || '';
      STATE.version = saved.version || 'demo';
      STATE.currentPageIndex = saved.currentPageIndex || 0;
      STATE.dataLog = saved.dataLog || [];
      STATE.pageState = saved.pageState || {};
      STATE.isPaused = saved.isPaused || false;
      STATE.pausedAt = saved.pausedAt || null;

      // Backward compatibility with older saved sessions.
      if (!STATE.pageState.scientificResponses) STATE.pageState.scientificResponses = [];
      if (!STATE.pageState.faceToColourResponses) STATE.pageState.faceToColourResponses = [];
      if (!STATE.pageState.colourToFaceResponses) STATE.pageState.colourToFaceResponses = [];
      if (!STATE.pageState.indianMemoryResponses) STATE.pageState.indianMemoryResponses = [];
      if (STATE.pageState.csvAutoDownloaded === undefined) STATE.pageState.csvAutoDownloaded = false;

      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  },

  clearSession() {
    localStorage.removeItem(this.KEY);
  }
};
