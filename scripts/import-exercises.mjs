// Imports free-exercise-db (github.com/yuhonas/free-exercise-db, Unlicense / public domain)
// into the app: a compact catalog at public/data/exercises.json and self-hosted WebP images
// at public/exercises/<id>/<0|1>.webp (SPEC §4.2: never hotlink).
//
// Usage: npm run import:exercises
// Re-running is safe: images that already exist are skipped.
import { mkdir, stat, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import sharp from 'sharp'
import { CURATED } from './exercises/curated.mjs'

/** Pinned dataset commit, so the import is reproducible. */
const COMMIT = 'f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5'
const BASE = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/${COMMIT}`
const ROOT = new URL('../', import.meta.url)

/** Categories that make sense to log in a gym app; stretching and cardio are left out. */
const CATEGORIES = new Set([
  'strength',
  'powerlifting',
  'olympic weightlifting',
  'strongman',
  'plyometrics',
])

const MUSCLE_MAP = {
  abdominals: 'abs',
  abductors: 'abductors',
  adductors: 'adductors',
  biceps: 'biceps',
  calves: 'calves',
  chest: 'chest',
  forearms: 'forearms',
  glutes: 'glutes',
  hamstrings: 'hamstrings',
  lats: 'lats',
  'lower back': 'lower_back',
  'middle back': 'upper_back',
  neck: 'neck',
  quadriceps: 'quads',
  traps: 'traps',
  triceps: 'triceps',
}

const EQUIPMENT_MAP = {
  barbell: 'barbell',
  dumbbell: 'dumbbell',
  cable: 'cable',
  machine: 'machine',
  'body only': 'bodyweight',
  kettlebells: 'kettlebell',
  bands: 'band',
  'e-z curl bar': 'ez_bar',
  'medicine ball': 'other',
  'exercise ball': 'other',
  'foam roll': 'other',
  other: 'other',
}

/** The dataset only knows "shoulders"; we split the three heads by movement (SPEC Bijlage B1). */
function shoulderHead(name) {
  const n = name.toLowerCase()
  if (/rear|reverse fl|face pull|pull apart|back fl/.test(n)) return 'rear_delts'
  if (/lateral|side|upright|deltoid raise|y-raise/.test(n)) return 'side_delts'
  return 'front_delts'
}

function autoMuscles(ex) {
  const weights = new Map()
  const add = (raw, weight) => {
    const id = raw === 'shoulders' ? shoulderHead(ex.name) : MUSCLE_MAP[raw]
    if (!id) throw new Error(`Unknown muscle "${raw}" in ${ex.id}`)
    weights.set(id, Math.max(weights.get(id) ?? 0, weight))
  }
  ex.primaryMuscles.forEach((m) => add(m, 1))
  ex.secondaryMuscles.forEach((m) => add(m, 0.5))
  return [...weights]
}

function parseMapping(spec) {
  const muscles = []
  let lengthened = false
  for (const token of spec.split(/\s+/).filter(Boolean)) {
    if (token === '*') lengthened = true
    else if (token.endsWith('/')) muscles.push([token.slice(0, -1), 0.5])
    else muscles.push([token, 1])
  }
  return { muscles, lengthened }
}

const unilateral = (name) => /\b(one|single)[- ](arm|leg|legged)\b/i.test(name)

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function fetchBuffer(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
      return Buffer.from(await res.arrayBuffer())
    } catch (error) {
      if (attempt >= 4) throw error
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt))
    }
  }
}

async function convertImages(exercise) {
  for (const [index, source] of exercise.images.entries()) {
    const target = new URL(`public/exercises/${exercise.id}/${index}.webp`, ROOT)
    if (await exists(target)) continue
    const input = await fetchBuffer(`${BASE}/exercises/${source}`)
    const output = await sharp(input).resize({ width: 400 }).webp({ quality: 60 }).toBuffer()
    await mkdir(dirname(target.pathname), { recursive: true })
    await writeFile(target, output)
  }
}

async function main() {
  const all = JSON.parse((await fetchBuffer(`${BASE}/dist/exercises.json`)).toString('utf8'))
  const byId = new Map(all.map((ex) => [ex.id, ex]))
  const curated = new Map()
  for (const [id, spec, options = {}] of CURATED) {
    if (!byId.has(id)) throw new Error(`Curated id not in dataset: ${id}`)
    if (curated.has(id)) throw new Error(`Duplicate curated id: ${id}`)
    curated.set(id, { ...parseMapping(spec), ...options })
  }

  const selected = all.filter(
    (ex) => (CATEGORIES.has(ex.category) || curated.has(ex.id)) && ex.images.length === 2,
  )

  const catalog = selected.map((ex) => {
    const cur = curated.get(ex.id)
    const equipment = EQUIPMENT_MAP[ex.equipment] ?? 'other'
    return {
      id: ex.id,
      name: ex.name,
      equipment,
      level: ex.level,
      mechanic: ex.mechanic ?? null,
      category: ex.category,
      type: cur?.type ?? (equipment === 'bodyweight' ? 'bodyweight_reps' : 'weight_reps'),
      unilateral: unilateral(ex.name),
      muscles: cur?.muscles ?? autoMuscles(ex),
      lengthened: cur?.lengthened ?? false,
      quality: cur ? 'curated' : 'auto',
      aliases: cur?.aliases ?? [],
      instructions: ex.instructions,
    }
  })

  // Curated exercises first: they are the common ones and appear first in lists.
  catalog.sort((a, b) =>
    a.quality === b.quality ? a.name.localeCompare(b.name) : a.quality === 'curated' ? -1 : 1,
  )

  let done = 0
  const queue = [...selected]
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let ex = queue.shift(); ex; ex = queue.shift()) {
        await convertImages(ex)
        if (++done % 100 === 0) console.log(`images: ${done}/${selected.length}`)
      }
    }),
  )

  const out = new URL('public/data/exercises.json', ROOT)
  await mkdir(dirname(out.pathname), { recursive: true })
  await writeFile(out, JSON.stringify({ source: COMMIT, exercises: catalog }))
  console.log(`catalog: ${catalog.length} exercises (${curated.size} curated)`)
}

await main()
