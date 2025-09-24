export interface FirmData {
  firmName: string
  previousPosition: number
  currentPosition: number
  revenuePrevious: number
  revenueCurrent: number
  revenueChange: number
  visitsPinkPrevious: number
  visitsPinkCurrent: number
  favoritesAdded: number
  favoritesChange: number
  visitsAzulPrevious: number
  trafficCurrent: number
  trafficIncrease: number
  cfdShare: number
}

export interface GenerationOptions {
  inputFile?: string
  outputDir: string
  serverUrl?: string
  width: number
  height: number
  scale?: number
  quality?: number
  format?: 'png' | 'jpeg' | 'pdf'
}

export interface DashboardGenerationRequest {
  csvData: string
  options?: Partial<GenerationOptions>
}

export interface DashboardGenerationProgress {
  total: number
  completed: number
  current?: string
  status: 'idle' | 'processing' | 'completed' | 'error'
  error?: string
}

export interface GeneratedDashboard {
  firmName: string
  filename: string
  url: string
  blob?: Blob
  timestamp?: number
  generatedAt?: Date
  size?: number
}

export interface DashboardGenerationResponse {
  success: boolean
  dashboards?: GeneratedDashboard[]
  error?: string
  jobId?: string
}