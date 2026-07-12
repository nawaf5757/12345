// background.js — Najoom service worker
console.log("Najoom background running (service worker)");

// استلام رسائل من content.js وتخزين آخر الحزمة
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return;

  // رسائل قادمة من content script (عادة تحتوي على أسعار)
  if (msg.type === "PRICES_UPDATE" || msg.type === "PRIORITY_PRICE_UPDATE" || msg.type === "COLLECTION_COMPLETE") {
    const payload = {
      ts: Date.now(),
      type: msg.type,
      // لبعض الرسائل مثل COLLECTION_COMPLETE قد تكون الحقول مختلفة
      prices: msg.prices || msg.prices || {},
      count: (msg.prices && Object.keys(msg.prices).length) || msg.count || 0
    };
    chrome.storage.local.set({ najoom_latest_prices: payload }, () => {
      console.log("Najoom: prices saved (count=", payload.count, ")");
    });

    // --- خيار: إرسال لحزمة محلية (Python) ---
    /*
    fetch("http://127.0.0.1:5000/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: 'extension', payload: payload })
    }).catch(e => console.warn("Najoom: failed to forward to local server", e));
    */
  }

  if (msg.type === "LOG_INFO") {
    console.info("Najoom log:", msg.msg);
  }

  // --- رسائل من popup -> تنفيذ أوام�� على الـ content script ---
  if (msg.type === "EXT_START" || msg.type === "EXT_READ_ONCE" || msg.type === "EXT_STOP" || msg.type === "EXT_GET_STATUS") {
    // احصل على التبويب النشط
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs && tabs[0];
      if (!tab || !tab.id) {
        sendResponse({ ok: false, error: 'no-active-tab' });
        return;
      }

      let forward = null;
      if (msg.type === 'EXT_START') forward = { type: 'START_MONITORING' };
      if (msg.type === 'EXT_READ_ONCE') forward = { type: 'READ_ONCE' };
      if (msg.type === 'EXT_STOP') forward = { type: 'STOP_MONITORING' };
      if (msg.type === 'EXT_GET_STATUS') forward = { type: 'GET_STATUS' };

      if (!forward) { sendResponse({ ok: false, error: 'unknown-ext-cmd' }); return; }

      chrome.tabs.sendMessage(tab.id, forward, (resp) => {
        // قد لا يكون هناك listener في الصفحة، فنتعامل مع ذلك
        if (chrome.runtime.lastError) {
          sendResponse({ ok: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ ok: true, fromContent: resp || null });
        }
      });
    });
    return true; // سنجيب لاحقاً بصورة مباشرة
  }

  // popup يطلب آخر بيانات مخزنة
  if (msg.type === 'GET_LATEST') {
    chrome.storage.local.get('najoom_latest_prices', (res) => {
      sendResponse({ ok: true, data: res.najoom_latest_prices || null });
    });
    return true;
  }

  // لا حاجة للرد افتراضياً
});

// استجابة للتبويبات التي ترسل رسائل مباشرة للـ service worker (أمنية)
chrome.runtime.onInstalled.addListener(() => {
  console.log('Najoom background installed');
});
