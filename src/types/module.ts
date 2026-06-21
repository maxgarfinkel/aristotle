export interface ModuleFormEntry {
  name: string
  catsInput: string
  assessmentsInput: string
}

export interface ModuleSummary {
  name: string
  cats: number
  assessmentCount: number
}

/** A single assessment's form state. Used inside WizardModule.assessments. */
export interface AssessmentFormEntry {
  name: string
  percentageInput: string
  startDate: string
  deadline: string
}

export interface WizardModule {
  name: string
  catsInput: string
  assessmentsInput: string
  assessments: AssessmentFormEntry[]
}
