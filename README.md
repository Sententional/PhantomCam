# 👻 PhantomCam - Webcam Spoofer Extension

**A browser extension for webcam spoofing and CSP bypass, designed for security research and penetration testing.**

[![Chrome MV3](https://img.shields.io/badge/chrome-MV3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![No OBS Required](https://img.shields.io/badge/OBS-Not%20Required-green.svg)](#)

## ⚠️ Legal Disclaimer

**FOR AUTHORIZED SECURITY TESTING ONLY**

This tool is designed for legitimate security research. Using it:

- ✅ To test your own systems and applications
- ✅ With explicit written authorization from system owners
- ✅ For bug bounty programs that permit webcam testing
- ✅ Educational and research purposes
- ❌ **ILLEGAL** for fraud, impersonation, or unauthorized access
- ❌ **ILLEGAL** for cheating on proctored exams
- ❌ **ILLEGAL** for bypassing identity verification without permission

**You are solely responsible for ensuring your use complies with applicable laws.**

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 🎬 **Webcam Spoofing** | Replace your camera feed with any video file |
| 🔀 **Device Identity Masking** | Randomized camera/microphone names and IDs |
| 💾 **Persistent Device IDs** | Device fingerprints persist across sessions |
| 🛡️ **CSP Bypass** | Remove Content-Security-Policy headers |
| 🎚️ **Toggle Controls** | Enable/disable spoofing without uninstalling |
| 🎨 **Clean UI** | Minimal, dark interface |
| ⚡ **Lightweight** | Pure browser extension, no external software |
| 🔧 **No Setup Required** | Works out of the box |

---

## 📦 Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Select the `phantomcam` folder
6. Pin the extension to your toolbar for easy access

---

## 📖 Usage

1. Click the PhantomCam icon in your browser toolbar
2. Upload a video file (MP4, WebM, or OGG)
3. Toggle "Spoofer" on
4. Visit any site that requests camera access
5. Your video will be used instead of the real camera

### Controls

| Option | Description |
|--------|-------------|
| **Spoofer** | Enable/disable webcam spoofing |
| **Device Identity** | Shows current spoofed device names |
| **Randomize** | Generate new random device fingerprint |
| **CSP Bypass** | Remove Content-Security-Policy headers |

### Tips

- Use videos with natural movement for better results
- Match the expected resolution (720p/1080p recommended)
- Click "Randomize" and refresh the target page to apply new device IDs
- Some sites may require a hard refresh (Ctrl+Shift+R) after enabling
- If it doesn't work, just refresh the page
- If it says "Waiting for permissions", try a smaller video file first

---

## 🔧 How It Works

### Architecture

PhantomCam operates entirely within your browser using Chrome's extension APIs:

```
┌─────────────────────────────────────────────────────────────┐
│                        PhantomCam                           │
├─────────────────────────────────────────────────────────────┤
│  popup.html/js         │  User interface for controls       │
├─────────────────────────────────────────────────────────────┤
│  background.js         │  Service worker for CSP bypass     │
│  (Service Worker)      │  Uses declarativeNetRequest API    │
├─────────────────────────────────────────────────────────────┤
│  media.js              │  Bridges storage to page context   │
│  (ISOLATED World)      │  Loads video data, sends messages  │
├─────────────────────────────────────────────────────────────┤
│  spoofer.js            │  Overrides WebRTC APIs             │
│  (MAIN World)          │  getUserMedia, enumerateDevices    │
└─────────────────────────────────────────────────────────────┘
```

### API Interception

The extension intercepts these browser APIs:

| API | What It Does |
|-----|--------------|
| `navigator.mediaDevices.getUserMedia()` | Returns spoofed video stream instead of real camera |
| `navigator.mediaDevices.enumerateDevices()` | Returns fake device names and IDs |

### Video Spoofing Process

1. User uploads a video file through the popup
2. Video is stored as base64 in Chrome's local storage
3. Content script creates a hidden `<video>` element
4. When a site requests camera access, the extension:
   - Plays the hidden video element
   - Captures the video stream using `captureStream()`
   - Returns this stream instead of the real camera

### Device Fingerprint Spoofing

- Generates random device names from a pool of real devices
- Creates random 64-character hex device IDs
- Persists across sessions until manually randomized
- Affects both camera and microphone identifiers

---

## 🎯 Supported Devices

The extension randomly selects from a pool of real device names:

**Cameras:**
- FaceTime HD Camera, Logitech C920/C922/BRIO, Razer Kiyo
- HP TrueVision, Lenovo EasyCamera, Dell Integrated Webcam
- Microsoft LifeCam, Elgato Facecam, and more

**Microphones:**
- Built-in Microphone, Blue Yeti/Snowball, HyperX QuadCast
- Razer Seiren, Shure MV7, Elgato Wave:3, and more

---

## 📋 Technical Details

| Spec | Value |
|------|-------|
| Manifest Version | 3 (MV3) |
| CSP Bypass Method | `declarativeNetRequest` API |
| API Overrides | `getUserMedia()`, `enumerateDevices()` |
| Content Script Worlds | MAIN and ISOLATED |
| Storage | `chrome.storage.local` |
| Supported Formats | MP4, WebM, OGG |

### File Structure

```
/
├── phantomcam/
│   ├── manifest.json    # Extension manifest
│   ├── background.js    # Service worker (CSP bypass)
│   ├── spoofer.js       # MAIN world (API overrides)
│   ├── media.js         # ISOLATED world (storage bridge)
│   ├── popup.html       # Extension popup UI
│   ├── popup.js         # Popup controller
│   └── images/          # Extension icons
├── README.md            # This file
├── LICENSE              # MIT license
└── LEGAL.md             # Legal terms
```

---

## ❓ FAQ

### Q: Do I need OBS or any virtual camera software?
**A:** No! PhantomCam is a **pure browser extension**. It works entirely within your browser without any external software, virtual cameras, or OBS. Just install the extension and you're ready to go.

### Q: Why isn't it working on a specific site?
**A:** Try these steps:
1. Hard refresh the page (Ctrl+Shift+R)
2. Make sure "Spoofer" is toggled ON
3. Check if CSP Bypass is enabled
4. Try a smaller video file
5. Click "Randomize" and refresh

### Q: Will this work for video calls?
**A:** Yes, it works on most sites that use standard WebRTC APIs including video conferencing platforms, video verification systems, and streaming sites.

### Q: Can websites detect that I'm using a fake webcam?
**A:** The extension spoofs device names and IDs to appear as real devices. However, sophisticated liveness detection systems may analyze video patterns. Use videos with natural movement for better results.

### Q: What video format should I use?
**A:** MP4 is recommended for best compatibility. WebM and OGG also work. Use 720p or 1080p resolution to match what most sites expect.

### Q: Why does it say "Waiting for permissions"?
**A:** This usually happens with large video files. Try using a smaller file (under 50MB) or a lower resolution video.

### Q: Does this work on Firefox?
**A:** No, PhantomCam uses Manifest V3 which is currently Chrome-specific. It works on Chrome, Edge, Brave, and Opera.

### Q: Can I use my phone's camera through this?
**A:** No, this extension replaces camera input with a pre-recorded video file, not another camera source.

### Q: Is this detectable by browser fingerprinting?
**A:** The extension modifies how your browser reports device information. While it changes device names/IDs, other fingerprinting methods may still work normally.

### Q: Will the audio from my video be used?
**A:** The extension primarily focuses on video. Audio handling depends on the target site's implementation.

---

## ⚙️ Requirements

- Chrome 88+ / Edge 88+ / Brave / Opera
- Developer mode enabled for unpacked extensions
- No external software required

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚖️ Disclaimer

This tool is intended for **authorized security testing only**. 

See [LEGAL.md](LEGAL.md) for full legal terms and conditions.

**The authors are not responsible for any misuse of this software.**

---

<div align="center">

**Made by [@sententionallab](https://t.me/sententionallab)**

⭐ Star this repo if you find it useful!

</div>
