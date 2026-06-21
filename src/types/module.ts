export interface Module {
  name: string
  cats: number
}

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

export interface AssessmentFormEntry {
  name: string
  percentageInput: string
  startDate: string
  deadline: string
}

export interface WizardAssessment {
  name: string
  percentageInput: string
  startDate: string
  deadline: string
}

export interface WizardModule {
  name: string
  catsInput: string
  assessmentsInput: string
  assessments: WizardAssessment[]
}
