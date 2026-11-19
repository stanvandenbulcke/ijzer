/**
 * Saves a blob as a file. The object URL is released a bit later: iOS Safari can cancel the
 * download when it is revoked right after the click.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
