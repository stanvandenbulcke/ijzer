/** True when the app runs from the home screen instead of a browser tab. */
export function isStandalone(): boolean {
  // iOS has its own flag; the media query covers the other platforms.
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches
}
