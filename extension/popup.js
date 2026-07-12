// popup.js
function setStatus(text) {
  document.getElementById('status').textContent = 'حالة: ' + text;
}

function refreshLatest() {
  chrome.runtime.sendMessage({ type: 'GET_LATEST' }, (res) => {
    if (!res || !res.ok) return;
    const d = res.data;
    if (!d) {
      document.getElementById('latestTs').textContent = '—';
      document.getElementById('latestCount').textContent = '—';
      return;
    }
    const ts = new Date(d.ts).toLocaleTimeString('ar-SA');
    document.getElementById('latestTs').textContent = ts;
    document.getElementById('latestCount').textContent = (d.count || 0) + ' سهم';
  });
}

document.getElementById('startBtn').addEventListener('click', () => {
  setStatus('جارٍ الإرسال...');
  chrome.runtime.sendMessage({ type: 'EXT_START' }, (res) => {
    if (!res || !res.ok) setStatus('فشل الإرسال: ' + (res && res.error));
    else setStatus('تم الطلب — راجع الصفحة');
    setTimeout(refreshLatest, 500);
  });
});

document.getElementById('readBtn').addEventListener('click', () => {
  setStatus('طلب قراءة...');
  chrome.runtime.sendMessage({ type: 'EXT_READ_ONCE' }, (res) => {
    if (!res || !res.ok) setStatus('فشل: ' + (res && res.error));
    else setStatus('تم طلب القراءة');
    setTimeout(refreshLatest, 500);
  });
});

document.getElementById('stopBtn').addEventListener('click', () => {
  setStatus('جارٍ الإيقاف...');
  chrome.runtime.sendMessage({ type: 'EXT_STOP' }, (res) => {
    if (!res || !res.ok) setStatus('فشل الإيقاف: ' + (res && res.error));
    else setStatus('تم إيقاف المراقبة');
  });
});

// تحديث دوري للحالة
setInterval(refreshLatest, 3000);
refreshLatest();
