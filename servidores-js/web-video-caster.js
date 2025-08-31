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

  // Attempt to open the URL using a hidden anchor tag for broader compatibility.
  // This method is often more reliable for triggering Android intents in various browsers.
  const a = document.createElement("a");
  a.href = webVideoCasterIntentUrl;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  console.log(
    `Attempting to open URL directly in Web Video Caster (compatible mode): ${url}`
  );
}
