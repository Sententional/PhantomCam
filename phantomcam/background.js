let cspEnabled = true;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['pc_csp_enabled'], (result) => {
    cspEnabled = result.pc_csp_enabled !== false;
    if (cspEnabled === undefined) {
      chrome.storage.local.set({ pc_csp_enabled: true });
      cspEnabled = true;
    }
    updateCSPRules();
  });
});


chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.pc_csp_enabled !== undefined) {
    cspEnabled = changes.pc_csp_enabled.newValue !== false;
    updateCSPRules();
    
    if (cspEnabled) {
      chrome.browsingData.remove({}, { serviceWorkers: true }, () => {
        console.log('[PhantomCam] Service workers cleared');
      });
    }
  }
});

async function updateCSPRules() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  if (existing.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existing.map(r => r.id)
    });
  }

  if (cspEnabled) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: 1,
          priority: 1,
          action: {
            type: "modifyHeaders",
            responseHeaders: [
              { header: "content-security-policy", operation: "remove" },
              { header: "content-security-policy-report-only", operation: "remove" },
              { header: "x-content-security-policy", operation: "remove" },
              { header: "x-webkit-csp", operation: "remove" },
              { header: "x-frame-options", operation: "remove" }
            ]
          },
          condition: {
            urlFilter: "*",
            resourceTypes: ["main_frame", "sub_frame"]
          }
        }
      ]
    });
    console.log('[PhantomCam] CSP blocking enabled');
  } else {
    console.log('[PhantomCam] CSP blocking disabled');
  }
}
