export interface DomainAssessment {
  moduleName: string
  name: string
  cats: number
  startDate: string  // YYYY-MM-DD
  deadline: string   // YYYY-MM-DD
  minutesAllocated: number
}

export interface DayPlanEntry {
  date: string         // YYYY-MM-DD
  moduleName: string
  assessmentName: string
  minutesSpent: number
}

export interface AssessmentSummary {
  moduleName: string
  assessmentName: string
  finishDate: string  // YYYY-MM-DD - last calendar day work is scheduled
  totalMinutes: number
}

export interface StudyPlan {
  dayEntries: DayPlanEntry[]
  summaries: AssessmentSummary[]
}
