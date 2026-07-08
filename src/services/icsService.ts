import type { DayPlanEntry } from '../types/plan'

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function toDateCompact(isoDate: string): string {
  return isoDate.replace(/-/g, '')
}

function nextDayCompact(isoDate: string): string {
  const [y, mo, d] = isoDate.split('-').map(Number)
  const date = new Date(Date.UTC(y!, mo! - 1, d!))
  date.setUTCDate(date.getUTCDate() + 1)
  const yy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yy}${mm}${dd}`
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

// RFC 5545: fold lines that exceed 75 octets
function foldLine(line: string): string {
  if (line.length <= 75) return line
  const chunks: string[] = [line.slice(0, 75)]
  let i = 75
  while (i < line.length) {
    chunks.push('\r\n ' + line.slice(i, i + 74))
    i += 74
  }
  return chunks.join('')
}

export function buildIcsContent(dayEntries: DayPlanEntry[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aristotle//Study Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  dayEntries.forEach((entry, index) => {
    const dtstart = toDateCompact(entry.date)
    const dtend = nextDayCompact(entry.date)
    const summary = escapeText(`${entry.moduleName} \u2014 ${entry.assessmentName}`)
    const description = escapeText(`Study time: ${formatMinutes(entry.minutesSpent)}`)
    const uid = `aristotle-${entry.date}-${index}@aristotle`

    lines.push(
      foldLine('BEGIN:VEVENT'),
      foldLine(`DTSTART;VALUE=DATE:${dtstart}`),
      foldLine(`DTEND;VALUE=DATE:${dtend}`),
      foldLine(`SUMMARY:${summary}`),
      foldLine(`DESCRIPTION:${description}`),
      foldLine(`UID:${uid}`),
      foldLine('END:VEVENT'),
    )
  })

  lines.push('END:VCALENDAR')

  return lines.join('\r\n') + '\r\n'
}
