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
  downloadCSV() {
    if (!STATE.dataLog || STATE.dataLog.length === 0) {
      alert('No data available to download.');
      return;
    }
    const csv = this.convertToCSV(STATE.dataLog);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const pid = (STATE.participantId || 'Participant').replace(/[^a-zA-Z0-9_-]/g, '_');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${pid}_behavioural_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
    STATE.logEvent(CONFIG.EVENT_TYPES.RESPONSE, { task_name: 'summary', event: 'csv_downloaded', rows: STATE.dataLog.length });
    STORAGE.autoSave();
    if (confirm('CSV download started. Clear the saved browser session now?')) {
      STORAGE.clearSession();
    }
  }
};
function downloadBehaviouralCSV() { DATA_EXPORT.downloadCSV(); }
