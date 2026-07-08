import { describe, it, expect } from 'vitest'
import { buildIcsContent } from './icsService'
import type { DayPlanEntry } from '../types/plan'

const entry: DayPlanEntry = {
  date: '2026-09-07',
  moduleName: 'Algorithms',
  assessmentName: 'Coursework',
  minutesSpent: 120,
}

describe('buildIcsContent', () => {
  it('wraps content in a VCALENDAR block', () => {
    const ics = buildIcsContent([])
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
  })

  it('includes required calendar properties', () => {
    const ics = buildIcsContent([])
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('PRODID:-//Aristotle//Study Scheduler//EN')
    expect(ics).toContain('CALSCALE:GREGORIAN')
    expect(ics).toContain('METHOD:PUBLISH')
  })

  it('returns no VEVENT when entries are empty', () => {
    const ics = buildIcsContent([])
    expect(ics).not.toContain('BEGIN:VEVENT')
  })

  it('produces one VEVENT per entry', () => {
    const ics = buildIcsContent([entry, { ...entry, date: '2026-09-08', minutesSpent: 60 }])
    const matches = ics.match(/BEGIN:VEVENT/g)
    expect(matches).toHaveLength(2)
  })

  it('sets DTSTART to the entry date in compact form', () => {
    const ics = buildIcsContent([entry])
    expect(ics).toContain('DTSTART;VALUE=DATE:20260907')
  })

  it('sets DTEND to the day after the entry date', () => {
    const ics = buildIcsContent([entry])
    expect(ics).toContain('DTEND;VALUE=DATE:20260908')
  })

  it('sets DTEND correctly across month boundaries', () => {
    const ics = buildIcsContent([{ ...entry, date: '2026-09-30' }])
    expect(ics).toContain('DTEND;VALUE=DATE:20261001')
  })

  it('includes module and assessment name in SUMMARY', () => {
    const ics = buildIcsContent([entry])
    expect(ics).toContain('SUMMARY:Algorithms \u2014 Coursework')
  })

  it('includes formatted study time in DESCRIPTION', () => {
    const ics = buildIcsContent([entry])
    expect(ics).toContain('DESCRIPTION:Study time: 2h')
  })

  it('formats minutes-only time correctly', () => {
    const ics = buildIcsContent([{ ...entry, minutesSpent: 45 }])
    expect(ics).toContain('DESCRIPTION:Study time: 45m')
  })

  it('formats hours-and-minutes time correctly', () => {
    const ics = buildIcsContent([{ ...entry, minutesSpent: 90 }])
    expect(ics).toContain('DESCRIPTION:Study time: 1h 30m')
  })

  it('assigns a unique UID to each event', () => {
    const entries: DayPlanEntry[] = [
      entry,
      { ...entry, date: '2026-09-08' },
    ]
    const ics = buildIcsContent(entries)
    const uidMatches = ics.match(/^UID:.+$/gm) ?? []
    const uids = uidMatches.map((line) => line.replace(/^UID:/, ''))
    expect(new Set(uids).size).toBe(2)
  })

  it('uses CRLF line endings', () => {
    const ics = buildIcsContent([entry])
    expect(ics).toContain('\r\n')
    // No bare LF without preceding CR
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n')
  })

  it('ends with a CRLF', () => {
    const ics = buildIcsContent([entry])
    expect(ics.endsWith('\r\n')).toBe(true)
  })

  it('escapes commas in text fields', () => {
    const ics = buildIcsContent([{ ...entry, moduleName: 'Math, Physics' }])
    expect(ics).toContain('Math\\, Physics')
  })

  it('escapes semicolons in text fields', () => {
    const ics = buildIcsContent([{ ...entry, assessmentName: 'Test; Quiz' }])
    expect(ics).toContain('Test\\; Quiz')
  })

  it('folds lines that exceed 75 characters', () => {
    const longName = 'A'.repeat(80)
    const ics = buildIcsContent([{ ...entry, moduleName: longName }])
    // A folded line continuation starts with CRLF followed by a space
    expect(ics).toContain('\r\n ')
  })
})
