const CAMERAS = [
  ["FaceTime HD Camera (Built-in)", "05ac", "8514"],
  ["HD Pro Webcam C920", "046d", "082d"],
  ["Logitech BRIO 4K", "046d", "085e"],
  ["HD Webcam C270", "046d", "0825"],
  ["Logitech C922 Pro", "046d", "085c"],
  ["Razer Kiyo", "1532", "0e03"],
  ["Integrated Webcam", "5986", "2113"],
  ["USB2.0 HD UVC WebCam", "13d3", "5666"],
  ["HP TrueVision HD", "05c8", "0383"],
  ["Lenovo EasyCamera", "5986", "0652"],
  ["Dell Integrated Webcam", "0c45", "6713"],
  ["Microsoft LifeCam HD-3000", "045e", "0779"],
  ["Elgato Facecam", "0fd9", "0079"]
];

const MICS = [
  ["Built-in Microphone", "05ac", "8514"],
  ["Blue Yeti", "b58e", "9e84"],
  ["Blue Snowball", "b58e", "9e81"],
  ["Microphone (HD Pro Webcam C920)", "046d", "082d"],
  ["Internal Microphone", "8086", "9dc8"],
  ["Realtek High Definition Audio", "10ec", "0892"],
  ["HyperX QuadCast", "0951", "16df"],
  ["Razer Seiren Mini", "1532", "0517"],
  ["Shure MV7", "14ed", "1010"],
  ["Elgato Wave:3", "0fd9", "006a"]
];

const rHex = n => {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
};

function generateDevices() {
  const cam = CAMERAS[Math.floor(Math.random() * CAMERAS.length)];
  const mic = MICS[Math.floor(Math.random() * MICS.length)];
  return {
    camLabel: `${cam[0]} (${cam[1]}:${cam[2]})`,
    micLabel: `${mic[0]} (${mic[1]}:${mic[2]})`,
    camId: rHex(64),
    micId: rHex(64)
  };
}

(async function init() {
  chrome.storage.local.get(['pc_video_data', 'pc_enabled', 'pc_cam_name', 'pc_mic_name', 'pc_cam_id', 'pc_mic_id'], async (result) => {
    
    let camLabel = result.pc_cam_name;
    let micLabel = result.pc_mic_name;
    let camId = result.pc_cam_id;
    let micId = result.pc_mic_id;
    
    if (!camLabel || !micLabel || !camId || !micId) {
      const devices = generateDevices();
      camLabel = devices.camLabel;
      micLabel = devices.micLabel;
      camId = devices.camId;
      micId = devices.micId;
      
      chrome.storage.local.set({
        pc_cam_name: camLabel,
        pc_mic_name: micLabel,
        pc_cam_id: camId,
        pc_mic_id: micId
      });
    }
    
    window.postMessage({
      type: 'PC_SET_DEVICES',
      camLabel: camLabel,
      micLabel: micLabel,
      camId: camId,
      micId: micId
    }, '*');
    
    const enabled = result.pc_enabled !== false;
    window.postMessage({ type: 'PC_TOGGLE', enabled: enabled }, '*');
    
    if (result.pc_video_data && enabled) {
      console.log("[PhantomCam] Loading video...");
      try {
        const blob = await (await fetch(result.pc_video_data)).blob();
        const url = URL.createObjectURL(blob);
        
        window.postMessage({ type: 'PC_SET_SOURCE', url: url }, '*');
        setTimeout(() => window.postMessage({ type: 'PC_SET_SOURCE', url: url }, '*'), 1000);
      } catch (e) {
        console.error("[PhantomCam] Error loading video:", e);
      }
    }
  });
})();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  
  if (changes.pc_enabled !== undefined) {
    window.postMessage({ type: 'PC_TOGGLE', enabled: changes.pc_enabled.newValue !== false }, '*');
  }
  
  if (changes.pc_video_data && changes.pc_video_data.newValue) {
    chrome.storage.local.get(['pc_enabled'], async (result) => {
      if (result.pc_enabled !== false) {
        const blob = await (await fetch(changes.pc_video_data.newValue)).blob();
        const url = URL.createObjectURL(blob);
        window.postMessage({ type: 'PC_SET_SOURCE', url: url }, '*');
      }
    });
  }
  
  if (changes.pc_randomize) {
    const devices = generateDevices();
    chrome.storage.local.set({
      pc_cam_name: devices.camLabel,
      pc_mic_name: devices.micLabel,
      pc_cam_id: devices.camId,
      pc_mic_id: devices.micId
    });
    window.postMessage({
      type: 'PC_SET_DEVICES',
      camLabel: devices.camLabel,
      micLabel: devices.micLabel,
      camId: devices.camId,
      micId: devices.micId
    }, '*');
  }
});
