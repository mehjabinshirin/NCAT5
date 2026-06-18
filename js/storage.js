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
      STATE.version = saved.version || 'demo';
      STATE.currentPageIndex = saved.currentPageIndex || 0;
      STATE.dataLog = saved.dataLog || [];
      STATE.pageState = saved.pageState || {};
      STATE.isPaused = saved.isPaused || false;
      STATE.pausedAt = saved.pausedAt || null;

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
