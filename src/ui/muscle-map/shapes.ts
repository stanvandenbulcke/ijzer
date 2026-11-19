import type { MuscleId } from '../../domain/muscles/taxonomy'

/**
 * Our own stylised body (SPEC §6.2: no copy of other apps): angular "plates" on a 100 × 200
 * grid, one side drawn and mirrored. Points are for the figure's right side (viewer's left).
 */
export interface Shape {
  muscle: MuscleId | null
  points: string
}

export const FRONT: Shape[] = [
  { muscle: null, points: '44,4 56,4 58,12 55,19 45,19 42,12' },
  { muscle: 'neck', points: '46,20 50,20 50,27 45,27' },
  { muscle: 'traps', points: '45,24 37,29 45,29' },
  { muscle: 'front_delts', points: '37,30 31,32 29,41 35,41 38,34' },
  { muscle: 'side_delts', points: '30,32 25,36 24,45 28,42' },
  { muscle: 'chest', points: '49,30 39,31 36,41 38,48 49,49' },
  { muscle: 'biceps', points: '28,44 35,43 34,58 27,58' },
  { muscle: 'forearms', points: '27,60 34,60 32,80 25,80' },
  { muscle: null, points: '25,82 32,82 31,90 25,90' },
  { muscle: 'abs', points: '44.5,51 49.5,51 49.5,62 44.5,62' },
  { muscle: 'abs', points: '44.5,63.5 49.5,63.5 49.5,74.5 44.5,74.5' },
  { muscle: 'abs', points: '44.5,76 49.5,76 49.5,88 45,88' },
  { muscle: 'obliques', points: '38,50 43,51 43.5,87 40,83 37,64' },
  { muscle: 'quads', points: '39,92 47.5,96 46,140 38,138 35,112' },
  { muscle: 'adductors', points: '48.5,96 50,96 50,118 47,128' },
  { muscle: null, points: '38,143 45.5,143 45,184 40,184' },
]

export const BACK: Shape[] = [
  { muscle: null, points: '44,4 56,4 58,12 55,19 45,19 42,12' },
  { muscle: 'neck', points: '46,20 50,20 50,25 46,25' },
  { muscle: 'traps', points: '50,22 39,29 42,33 50,38' },
  { muscle: 'rear_delts', points: '38,30 31,32 29,41 36,40' },
  { muscle: 'side_delts', points: '30,32 25,36 24,45 28,42' },
  { muscle: 'upper_back', points: '50,39 43,34 40,44 50,54' },
  { muscle: 'lats', points: '39,45 36,42 36,56 43,70 49,66 50,56 40,47' },
  { muscle: 'lower_back', points: '44,70 50,67 50,87 43.5,87' },
  { muscle: 'triceps', points: '28,44 35,43 34,58 27,58' },
  { muscle: 'forearms', points: '27,60 34,60 32,80 25,80' },
  { muscle: null, points: '25,82 32,82 31,90 25,90' },
  { muscle: 'abductors', points: '37,88 41,89 38,101 35,98' },
  { muscle: 'glutes', points: '42,89 50,90 50,108 40,106 38.5,100' },
  { muscle: 'hamstrings', points: '38,110 49,112 47,140 38.5,139' },
  { muscle: 'calves', points: '38.5,144 46,144 45,166 40.5,170 37.5,158' },
  { muscle: null, points: '40.5,172 45,170 44.5,184 41,184' },
]
