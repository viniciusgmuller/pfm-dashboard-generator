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

export interface DashboardData {
  firm: FirmData
  competitors: FirmData[]
  weekLabel: string
  totalPFMVisits: number
  totalCFDVisits: number
}

export interface GenerationOptions {
  inputFile: string
  outputDir: string
  serverUrl?: string
  width?: number
  height?: number
  scale?: number
  quality?: number
  format?: 'png' | 'pdf' | 'jpeg'
  headless?: boolean
}