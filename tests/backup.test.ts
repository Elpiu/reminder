import { describe, expect, it } from 'vitest'
import { createBackup, parseBackup } from '../shared/utils/backup'

const v1 = {
  version: 1,
  exportedAt: '2026-05-22T10:00:00.000Z',
  database: {
    notes: [
      { id: 'n1', title: 'Oggi in ferie', description: '', date: '2026-05-22', categoryId: 'cat_work', tagIds: ['t1'], source: 'manual', createdAt: '2026-05-22T08:30:00.000Z', updatedAt: '2026-05-22T08:30:00.000Z' },
      { id: 'n2', title: 'Progetto', description: 'Finito', date: '2026-05-22', categoryId: null, tagIds: [], source: 'manual', createdAt: '2026-05-22T09:00:00.000Z', updatedAt: '2026-05-22T09:00:00.000Z' },
    ],
    todos: [{ id: 'td1', title: 'Chiamare', description: 'idraulico', categoryId: 'cat_personal', tagIds: [], createdAt: '2026-05-20T09:00:00.000Z', updatedAt: '2026-05-20T09:00:00.000Z' }],
    categories: [
      { id: 'cat_work', name: 'Work', color: '#2563eb', icon: 'pi pi-briefcase', createdAt: '2026-05-22T00:00:00.000Z' },
      { id: 'cat_personal', name: 'Personal', color: '#9333ea', icon: 'pi pi-user', createdAt: '2026-05-22T00:00:00.000Z' },
    ],
    tags: [
      { id: 't1', name: '#2026', createdAt: '2026-05-22T00:00:00.000Z' },
      { id: 't2', name: 'work', createdAt: '2026-05-22T00:00:00.000Z' },
    ],
    templates: [{ id: 'tp1', title: 'Palestra', description: '', categoryId: null, tagIds: ['t1'], createdAt: '2026-05-22T00:00:00.000Z', updatedAt: '2026-05-22T00:00:00.000Z' }],
  },
}

describe('parseBackup v1', () => {
  const data = parseBackup(v1)

  it('converte categorie in tag senza duplicati per nome', () => {
    const names = data.tags.map(t => t.name).sort()
    expect(names).toEqual(['#2026', 'Personal', 'work'])
  })
  it('converte note in voci del diario con i tag della categoria', () => {
    expect(data.entries).toHaveLength(2)
    const n1 = data.entries.find(e => e.id === 'n1')!
    expect(n1.activityId).toBeNull()
    expect(n1.text).toBe('Oggi in ferie')
    expect(n1.tagIds.sort()).toEqual(['t1', 't2'])
    expect(data.entries.find(e => e.id === 'n2')!.text).toBe('Progetto\n\nFinito')
  })
  it('converte template in attività e todo in inbox', () => {
    expect(data.activities[0]).toMatchObject({ id: 'tp1', name: 'Palestra', kind: 'check', recurrence: { type: 'none' } })
    expect(data.inbox[0]).toMatchObject({ title: 'Chiamare', notes: 'idraulico', tagIds: ['cat_personal'] })
  })
})

describe('parseBackup v2', () => {
  it('round trip', () => {
    const backup = createBackup({
      activities: [], inbox: [], tags: [{ id: 't', name: 'casa', createdAt: '2026-11-17T00:00:00.000Z' }], photos: [], preferences: { textScale: 'lg' },
      entries: [{ id: 'e', date: '2026-11-17', time: '09:00', activityId: null, value: null, text: 'ciao', tagIds: ['t'], photoIds: [], source: 'manual', createdAt: '2026-11-17T08:00:00.000Z', updatedAt: '2026-11-17T08:00:00.000Z' }],
    })
    const parsed = parseBackup(JSON.parse(JSON.stringify(backup)))
    expect(parsed.entries[0]!.text).toBe('ciao')
    expect(parsed.preferences.textScale).toBe('lg')
  })
  it('rifiuta versioni sconosciute e date non valide', () => {
    expect(() => parseBackup({ version: 9 })).toThrow(/Versione/)
    expect(() => parseBackup({ version: 2, data: { entries: [{ id: 'x', date: '2026-02-30' }] } })).toThrow(/data/)
  })
})
