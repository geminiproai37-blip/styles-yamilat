// web-video-caster.js

/**
 * Opens a given URL directly in Web Video Caster using an Android intent.
 * This function assumes the Web Video Caster app is installed on the device.
 *
 * @param {string} url The URL to open in Web Video Caster.
 */
export function openInWebVideoCaster(url) {
  if (!url) {
    console.error("URL provided to openInWebVideoCaster is empty.");
    return;
  }

  // Android intent URL scheme to directly launch Web Video Caster.
  // This intent specifies the package, action, and scheme to bypass the activity chooser.
  // Reverting to action=android.intent.action.VIEW with scheme=https for direct launch attempt.
  const webVideoCasterIntentUrl = `intent:${url}#Intent;action=android.intent.action.VIEW;package=com.instantbits.cast.webvideo;scheme=https;end`;

  // Attempt to open the URL.
  // On Android, this should trigger the intent.
  // On other platforms, it might just open in a new tab or fail gracefully.
  window.open(webVideoCasterIntentUrl, "_system"); // _system might be needed for Cordova/Capacitor
  console.log(`Attempting to open URL directly in Web Video Caster: ${url}`);
}
