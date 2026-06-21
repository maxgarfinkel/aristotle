# Aristotle

Aristotle is a study-schedule generator for university students. A multi-step wizard collects information about the student's modules, assessments, and weekly availability, then a scheduling algorithm produces a concrete day-by-day study plan.

---

## Wizard overview

The wizard has four completed screens and produces the data that the scheduling algorithm will consume.

### Screen 1 – Module count (`/`)

The student enters how many modules they are studying (a positive integer). This drives the rest of the wizard.

### Screen 2 – Module details (`/modules?count=N`)

For each module the student enters:

| Field | Type | Meaning |
|---|---|---|
| Name | string | Human-readable module name |
| CATS | positive integer | UK credit value of the module (Credit Accumulation and Transfer Scheme). A heavier module earns more credits and should receive proportionally more study time. |
| Assessments | positive integer | How many assessed pieces of work this module has |

### Screen 3 – Assessment details (`/assessments`)

For each assessment within each module:

| Field | Type | Meaning |
|---|---|---|
| Name | string | Human-readable assessment name (e.g. "Coursework", "Final Exam") |
| Weight (%) | integer 1–100 | What percentage of the module mark this assessment contributes |
| Start date | ISO date | **Hard constraint** – the earliest day on which the student may begin studying for this assessment. No study sessions may be scheduled before this date. |
| Deadline | ISO date | The submission/exam date. Must be strictly after start date. |

### Screen 4 – Weekly schedule (`/schedule`)

The student indicates which days of the week they can study and for how many hours and minutes:

| Field | Type | Meaning |
|---|---|---|
| Enabled | boolean | Whether this day of the week is a study day at all |
| Hours | integer ≥ 0 | Study hours available on this day type |
| Minutes | integer 0–59 | Additional study minutes on this day type |

At least one day must be enabled. Each enabled day must have a total study time > 0.

The schedule is a **recurring weekly pattern**, not tied to specific calendar dates. The algorithm applies it repeatedly across the scheduling period.

---

## Data structures (TypeScript)

```ts
// src/types/module.ts
interface ModuleFormEntry {
  name: string
  catsInput: string          // unparsed; cast to integer
  assessmentsInput: string   // unparsed; cast to integer
}

interface ModuleSummary {
  name: string
  cats: number               // parsed integer
  assessmentCount: number    // parsed integer
}

interface AssessmentFormEntry {
  name: string
  percentageInput: string    // unparsed; cast to integer
  startDate: string          // ISO date "YYYY-MM-DD"
  deadline: string           // ISO date "YYYY-MM-DD"
}

// src/types/schedule.ts
interface DaySchedule {
  enabled: boolean
  hoursInput: string         // unparsed; cast to integer
  minutesInput: string       // unparsed; cast to integer
}

type WeeklySchedule = DaySchedule[]  // index 0 = Monday, 6 = Sunday
```

All wizard state is held in `WizardContext` (`src/context/WizardContext.tsx`) and provided by `WizardProvider` (`src/context/WizardProvider.tsx`).

---

## Scheduling algorithm specification

This is the algorithm that needs to be built. Its inputs come directly from the wizard state.

### Inputs

- `modules`: `ModuleSummary[]` — the parsed list of modules with CATS values
- `assessments`: `AssessmentFormEntry[][]` — parallel array; `assessments[i]` is the list of assessments for `modules[i]`
- `schedule`: `WeeklySchedule` — the recurring weekly study pattern

### Step 1 — Calculate each assessment's allocated study hours

The goal is to distribute the student's total available study time proportionally across all assessments, weighted by the assessment's contribution to the student's overall degree load.

**Assessment weight formula:**

```
total_cats = sum of cats across all modules

for each assessment A belonging to module M:
  allocated_fraction(A) = (A.percentage / 100) × (M.cats / total_cats)
```

`allocated_fraction` represents what share of all available study time should go to assessment A. The fractions across all assessments sum to 1.0 (assuming each module's assessment percentages sum to 100).

**Total available hours:**

The scheduling period runs from `min(all start dates)` to `max(all deadlines)`. Iterate over every calendar day in that range, look up what day of the week it falls on, and sum the enabled hours for that day type.

```
total_available_hours = sum of (hours + minutes/60) for every enabled day in the scheduling period
```

**Allocated hours per assessment:**

```
allocated_hours(A) = allocated_fraction(A) × total_available_hours
```

### Step 2 — Order the assessments for scheduling

Sort all assessments using a two-level sort:

1. **Primary: deadline ascending** — earlier deadlines are scheduled first
2. **Secondary: allocated hours ascending** — within the same deadline, smaller assessments are scheduled before larger ones

### Step 3 — Schedule each assessment as a contiguous block

Maintain a **cursor**: the next available calendar day for scheduling. Initialise it to `min(all start dates)`.

For each assessment A (in the sorted order from Step 2):

1. **Determine block start:** `block_start = max(A.startDate, cursor)`. The block cannot begin before the assessment's start date, and cannot begin before the cursor (a previous assessment may have used those days).

2. **Advance through calendar days from `block_start`**, accumulating available hours from the weekly schedule, until `allocated_hours(A)` hours have been consumed. Each day consumed becomes a study session in the output.

3. **Record the sessions** for assessment A (module name, assessment name, date, hours studied on that day).

4. **Advance the cursor** to the day after the last day consumed by this block.

**Key constraints:**
- Each assessment is scheduled as one uninterrupted contiguous block. Once its block starts, no other assessment's work is interleaved.
- Days where the weekly schedule has the day disabled contribute 0 hours and are skipped (the cursor advances past them without consuming study time).
- If a block would run past A's deadline, this is an infeasible schedule — surface this as an error or warning to the user.

### Output

A flat list of daily study sessions:

```ts
interface StudySession {
  date: string          // ISO date "YYYY-MM-DD"
  moduleName: string
  assessmentName: string
  hours: number         // hours of study on this specific day (may be partial on the last day of a block)
}
```

---

## Development

```bash
npm run dev            # Start dev server with HMR
npm run build          # Type-check (tsc -b) then bundle with Vite
npm run lint           # ESLint
npm test               # Vitest in watch mode
npm run test:coverage  # Single run with coverage report (80% thresholds enforced)
npm run check          # Full quality gate: lint + build + test:coverage
```

See `CLAUDE.md` for architecture rules, layer boundaries, and testing conventions.
