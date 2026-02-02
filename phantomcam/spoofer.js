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
  ["Acer HD Webcam", "5986", "055c"],
  ["ASUS USB2.0 Webcam", "1bcf", "2883"],
  ["Microsoft LifeCam HD-3000", "045e", "0779"],
  ["Creative Live! Cam Sync", "041e", "4095"],
  ["AverMedia Live Streamer", "07ca", "0570"],
  ["Elgato Facecam", "0fd9", "0079"],
  ["Anker PowerConf C300", "291a", "3369"]
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
  ["Audio-Technica AT2020USB+", "0909", "001c"],
  ["Samson Meteor", "17a0", "0310"],
  ["Rode NT-USB", "19f7", "0015"],
  ["Shure MV7", "14ed", "1010"],
  ["Elgato Wave:3", "0fd9", "006a"],
  ["Fifine K669", "1fc9", "0115"],
  ["Maono AU-A04", "3142", "0002"]
];

const rHex = n => {
  let s = '';
  const chars = '0123456789abcdef';
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
};

let CAM_LABEL = '';
let MIC_LABEL = '';
let CAM_ID = '';
let MIC_ID = '';
let spoofingEnabled = true;

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

class WebcamSpoofer {
  constructor() {
    this.originalEnumerateDevices = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    this.originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    this.spoofElement = null;
    this.stream = null;
    this.init();
  }

  init() {
    this.setupSpoofElements();
    this.overrideEnumerateDevices();
    this.overrideGetUserMedia();
    console.log("[PhantomCam] Spoofer ready.");
  }

  setupSpoofElements() {
    if (document.getElementById('phantomcam-video')) return;

    const video = document.createElement("video");
    video.id = 'phantomcam-video';
    video.crossOrigin = "anonymous";
    video.setAttribute('playsinline', '');
    video.muted = false; 
    video.volume = 0.001; 
    video.loop = true;
    video.style.display = "none";

    document.documentElement.appendChild(video);
    this.spoofElement = video;

    window.addEventListener('message', (event) => {
      if (event.data.type === 'PC_SET_SOURCE' && event.data.url) {
        console.log("[PhantomCam] Video source received.");
        this.stream = null;
        this.spoofElement.src = event.data.url;
        this.spoofElement.play().catch(e => console.log("Autoplay blocked:", e));
      }
      if (event.data.type === 'PC_TOGGLE') {
        spoofingEnabled = event.data.enabled;
        console.log("[PhantomCam] Spoofing " + (spoofingEnabled ? "enabled" : "disabled"));
      }
      if (event.data.type === 'PC_SET_DEVICES') {
        CAM_LABEL = event.data.camLabel;
        MIC_LABEL = event.data.micLabel;
        CAM_ID = event.data.camId;
        MIC_ID = event.data.micId;
        console.log("[PhantomCam] Devices set:", CAM_LABEL);
      }
    });
  }

  overrideEnumerateDevices() {
    const self = this;
    navigator.mediaDevices.enumerateDevices = async () => {
      const devices = await self.originalEnumerateDevices();
      
      if (!spoofingEnabled) {
        return devices;
      }
      
      return devices.map(d => {
        if (d.kind === "videoinput" && CAM_LABEL) {
          return self.createProxyDevice(d, CAM_LABEL, CAM_ID);
        }
        if (d.kind === "audioinput" && MIC_LABEL) {
          return self.createProxyDevice(d, MIC_LABEL, MIC_ID);
        }
        return d;
      });
    };
  }

  createProxyDevice(original, label, id) {
    return new Proxy(original, {
      get: (target, prop) => {
        if (prop === "label") return label;
        if (prop === "deviceId") return id;
        return target[prop];
      }
    });
  }

  overrideGetUserMedia() {
    const self = this;
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      if (!constraints || (!constraints.video && !constraints.audio)) {
        return self.originalGetUserMedia(constraints);
      }
      
      if (!spoofingEnabled) {
        console.log("[PhantomCam] Spoofing disabled, using real camera");
        return self.originalGetUserMedia(constraints);
      }
      
      try {
        if (self.spoofElement && self.spoofElement.src) {
          if (!self.stream) {
            await self.spoofElement.play().catch(() => {});
            const captureFn = self.spoofElement.captureStream || self.spoofElement.mozCaptureStream;
            if (captureFn) {
              self.stream = captureFn.call(self.spoofElement);
            }
          }
          if (self.stream) {
            console.log("[PhantomCam] Returning spoofed stream");
            return self.stream;
          }
        }
        return self.originalGetUserMedia(constraints);
      } catch (error) {
        console.error("[PhantomCam] Error:", error);
        return self.originalGetUserMedia(constraints);
      }
    };
  }
}

new WebcamSpoofer();
