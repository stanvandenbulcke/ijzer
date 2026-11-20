import { describe, expect, it } from 'vitest'
import { fromRemote, remoteWins, SYNCED_TABLES, syncableTables, toRemote } from './mapping'

const meta = {
  createdAt: '2026-11-19T10:00:00.000Z',
  updatedAt: '2026-11-19T11:00:00.000Z',
  deletedAt: null,
}

describe('sync mapping', () => {
  it('round-trips a document row', () => {
    const local = { id: 'w1', name: 'Push A', exercises: [{ id: 'e1' }], ...meta }
    const remote = toRemote('workouts', local, 'user-1')
    expect(remote).toEqual({
      id: 'w1',
      data: { name: 'Push A', exercises: [{ id: 'e1' }] },
      created_at: meta.createdAt,
      updated_at: meta.updatedAt,
      deleted_at: null,
    })
    expect(fromRemote('workouts', remote)).toEqual(local)
  })

  it('maps the local "me" profile to the user id and back', () => {
    const local = { id: 'me', profile: { name: 'Stan' }, ...meta }
    const remote = toRemote('profile', local, 'user-1')
    expect(remote.id).toBe('user-1')
    expect(remote.data).toEqual({ name: 'Stan' })
    expect(fromRemote('profile', remote)).toEqual(local)
  })

  it('keeps soft deletes', () => {
    const remote = toRemote(
      'routines',
      { id: 'r1', name: 'x', ...meta, deletedAt: '2026-11-19T12:00:00.000Z' },
      'u',
    )
    expect(remote.deleted_at).toBe('2026-11-19T12:00:00.000Z')
  })

  it('last write wins, ties go to the server', () => {
    const remote = {
      id: 'x',
      data: {},
      created_at: '',
      updated_at: '2026-11-19T11:00:00.000Z',
      deleted_at: null,
    }
    expect(remoteWins(undefined, remote)).toBe(true)
    expect(remoteWins({ ...meta, updatedAt: '2026-11-19T10:00:00.000Z' }, remote)).toBe(true)
    expect(remoteWins(meta, remote)).toBe(true)
    expect(remoteWins({ ...meta, updatedAt: '2026-11-19T12:00:00.000Z' }, remote)).toBe(false)
  })
})

describe('syncableTables', () => {
  it('leaves out tables that are not migrated in this project yet', () => {
    expect(syncableTables(['foods'])).not.toContain('foods')
    expect(syncableTables()).toEqual(SYNCED_TABLES)
  })
})
