/**
 * IRON's own sounds, synthesised with the Web Audio API (no audio files, no licences):
 * a short metallic click when a set is ticked, two tones when rest is over, and a rising
 * fanfare with a plate clank for a PR. All quiet and short.
 */
let context: AudioContext | null = null

/**
 * iOS only plays sound from an AudioContext started by a tap. Call this on every tick, so the
 * end-of-rest signal can play later.
 */
export function primeAudio(): void {
  try {
    context ??= new AudioContext()
    if (context.state === 'suspended') void context.resume()
  } catch {
    context = null
  }
}

function tone(
  freq: number,
  start: number,
  length: number,
  volume = 0.22,
  type: OscillatorType = 'sine',
) {
  if (!context) return
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  osc.connect(gain).connect(context.destination)
  osc.start(start)
  osc.stop(start + length + 0.02)
}

/** A burst of filtered noise: the metal "tick" of a plate or a collar. */
function clank(start: number, length = 0.08, volume = 0.3, frequency = 2400) {
  if (!context) return
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * length), context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++)
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  filter.type = 'bandpass'
  filter.frequency.value = frequency
  filter.Q.value = 6
  gain.gain.value = volume
  source.buffer = buffer
  source.connect(filter).connect(gain).connect(context.destination)
  source.start(start)
}

/** Set ticked: a short click. */
export function playSetDone(): void {
  if (!context) return
  const t = context.currentTime
  clank(t, 0.06, 0.35, 3200)
  tone(1760, t, 0.06, 0.08, 'triangle')
}

/** Rest is over: two rising tones. */
export function playRestDone(): void {
  if (!context) return
  const t = context.currentTime
  tone(880, t, 0.18)
  tone(1175, t + 0.22, 0.2)
}

/** New record: a short rising fanfare and the clank of a plate hitting the collar. */
export function playRecord(): void {
  if (!context) return
  const t = context.currentTime
  ;[523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.09, 0.22, 0.18, 'triangle'))
  clank(t + 0.4, 0.14, 0.4, 1600)
}
