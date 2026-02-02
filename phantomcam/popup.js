document.addEventListener('DOMContentLoaded', () => {
  const fileIn = document.getElementById('fileIn');
  const fileBox = document.getElementById('fileBox');
  const fname = document.getElementById('fname');
  const stat = document.getElementById('stat');
  const clearBtn = document.getElementById('clearBtn');
  const spoofToggle = document.getElementById('spoofToggle');
  const cspToggle = document.getElementById('cspToggle');
  const randBtn = document.getElementById('randBtn');
  const camN = document.getElementById('camN');
  const micN = document.getElementById('micN');

  chrome.storage.local.get(['pc_video_name', 'pc_enabled', 'pc_csp_enabled', 'pc_cam_name', 'pc_mic_name'], (r) => {
    if (r.pc_video_name) {
      fileBox.classList.add('on');
      fname.textContent = r.pc_video_name;
      stat.textContent = 'Active';
      stat.classList.add('on');
    }
    if (r.pc_enabled === false) {
      spoofToggle.classList.remove('on');
      fileBox.classList.add('off');
    }
    if (r.pc_csp_enabled === false) cspToggle.classList.remove('on');
    if (r.pc_cam_name) camN.textContent = r.pc_cam_name.split(' (')[0];
    if (r.pc_mic_name) micN.textContent = r.pc_mic_name.split(' (')[0];
  });

  fileIn.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    stat.textContent = 'Loading...';
    stat.classList.remove('on');
    const reader = new FileReader();
    reader.onload = (ev) => {
      chrome.storage.local.set({
        pc_video_data: ev.target.result,
        pc_video_name: f.name,
        pc_enabled: true
      }, () => {
        if (chrome.runtime.lastError) {
          stat.textContent = 'Too large';
        } else {
          fileBox.classList.add('on');
          fileBox.classList.remove('off');
          fname.textContent = f.name;
          stat.textContent = 'Active';
          stat.classList.add('on');
          spoofToggle.classList.add('on');
        }
      });
    };
    reader.readAsDataURL(f);
  });

  clearBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['pc_video_data', 'pc_video_name'], () => {
      fileBox.classList.remove('on');
      fname.textContent = 'Select video';
      stat.textContent = 'No video';
      stat.classList.remove('on');
      fileIn.value = '';
    });
  });

  spoofToggle.addEventListener('click', () => {
    const on = spoofToggle.classList.toggle('on');
    chrome.storage.local.set({ pc_enabled: on });
    fileBox.classList.toggle('off', !on);
  });

  cspToggle.addEventListener('click', () => {
    const on = cspToggle.classList.toggle('on');
    chrome.storage.local.set({ pc_csp_enabled: on });
  });

  randBtn.addEventListener('click', () => {
    chrome.storage.local.set({ pc_randomize: Date.now() });
    setTimeout(() => {
      chrome.storage.local.get(['pc_cam_name', 'pc_mic_name'], (r) => {
        if (r.pc_cam_name) camN.textContent = r.pc_cam_name.split(' (')[0];
        if (r.pc_mic_name) micN.textContent = r.pc_mic_name.split(' (')[0];
      });
    }, 100);
    stat.textContent = 'Refresh page';
  });
});
