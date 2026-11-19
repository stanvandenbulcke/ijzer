let context: AudioContext | null = null

/**
 * iOS only plays sound from an AudioContext that was started by a tap. Call this when the
 * user ticks a set, so the end-of-rest signal can play later.
 */
export function primeAudio(): void {
  try {
    context ??= new AudioContext()
    if (context.state === 'suspended') void context.resume()
  } catch {
    context = null
  }
}

/** Two short tones: rest is over. Silent when audio is unavailable. */
export function playRestDone(): void {
  if (!context) return
  const start = context.currentTime
  for (const [offset, freq] of [
    [0, 880],
    [0.22, 1175],
  ] as const) {
    const osc = context.createOscillator()
    const gain = context.createGain()
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, start + offset)
    gain.gain.exponentialRampToValueAtTime(0.25, start + offset + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.18)
    osc.connect(gain).connect(context.destination)
    osc.start(start + offset)
    osc.stop(start + offset + 0.2)
  }
}
