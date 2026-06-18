const DATA_EXPORT = {
  getAllKeys(rows) {
    const keys = new Set();
    rows.forEach(r => Object.keys(r).forEach(k => keys.add(k)));
    return Array.from(keys);
  },

  escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\n\r]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  },

  convertToCSV(rows) {
    const keys = this.getAllKeys(rows);
    const header = keys.map(k => this.escapeCSV(k)).join(',');
    const body = rows.map(row => keys.map(k => this.escapeCSV(row[k])).join(',')).join('\n');
    return header + '\n' + body;
  },

  buildFilename(reason = 'behavioural') {
    const pid = (STATE.participantId || 'Participant').replace(/[^a-zA-Z0-9_-]/g, '_');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `${pid}_${reason}_${stamp}.csv`;
  },

  downloadCSV(options = {}) {
    const automatic = Boolean(options.automatic);
    const reason = options.reason || (automatic ? 'auto_summary' : 'manual');

    if (!STATE.dataLog || STATE.dataLog.length === 0) {
      if (!automatic) alert('No data available to download.');
      return false;
    }

    // Log the export event before building the CSV so the exported file also records when export was attempted.
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, {
      task_name: 'data_export',
      event: automatic ? 'csv_auto_download_started' : 'csv_manual_download_started',
      export_reason: reason,
      rows_before_export: STATE.dataLog.length
    });

    const csv = this.convertToCSV(STATE.dataLog);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.buildFilename(automatic ? 'AUTO_behavioural' : 'behavioural');
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    STORAGE.autoSave();
    return true;
  },

  autoDownloadOnSummary() {
    if (!STATE.pageState) STATE.pageState = {};
    if (STATE.pageState.csvAutoDownloaded) {
      this.updateAutoStatus('CSV automatic download was already started for this session. Use manual download only if you need another copy.');
      return;
    }

    STATE.pageState.csvAutoDownloaded = true;
    STORAGE.autoSave();
    const ok = this.downloadCSV({ automatic: true, reason: 'summary_page_reached' });
    this.updateAutoStatus(ok
      ? 'CSV automatic download has started. Please keep the downloaded file before closing the browser.'
      : 'Automatic CSV download could not start because no data were available.');
  },

  updateAutoStatus(message) {
    const el = document.getElementById('autoDownloadStatus');
    if (el) el.textContent = message;
  }
};

function downloadBehaviouralCSV() { DATA_EXPORT.downloadCSV({ automatic: false, reason: 'manual_button' }); }
