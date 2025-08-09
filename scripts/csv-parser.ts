import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'
import { FirmData } from './types'

export function parseCSV(filePath: string): FirmData[] {
  const fileContent = fs.readFileSync(path.resolve(filePath), 'utf-8')
  
  const records = parse(fileContent, {
    columns: false,
    skip_empty_lines: true,
    from_line: 2, // Skip header row
  })

  return records
    .filter((row: string[]) => row[0] && row[0].trim() !== '') // Filter out empty firm names
    .map((row: string[]) => {
      // Parse monetary values (remove $ and commas)
      const parseMoney = (value: string): number => {
        return parseInt(value.replace(/[$,]/g, '')) || 0
      }

      // Parse percentage values (remove %)
      const parsePercentage = (value: string): number => {
        return parseFloat(value.replace(/%/g, '')) || 0
      }

      // Parse integer values
      const parseNumber = (value: string): number => {
        return parseInt(value.replace(/,/g, '')) || 0
      }

      return {
        firmName: row[0].trim(),
        previousPosition: parseNumber(row[1]),
        currentPosition: parseNumber(row[2]),
        revenuePrevious: parseMoney(row[3]),
        revenueCurrent: parseMoney(row[4]),
        revenueChange: parsePercentage(row[5]),
        visitsPinkPrevious: parseNumber(row[6]),
        visitsPinkCurrent: parseNumber(row[7]),
        favoritesAdded: parseNumber(row[8]),
        favoritesChange: parsePercentage(row[9]),
        visitsAzulPrevious: parseNumber(row[10]),
        trafficCurrent: parseNumber(row[11]),
        trafficIncrease: parsePercentage(row[12]),
        cfdShare: parsePercentage(row[13]),
      }
    })
}

export function getContextualRanking(
  firms: FirmData[],
  targetFirm: FirmData,
  positionsAbove: number = 3,
  positionsBelow: number = 1
): FirmData[] {
  // Sort firms by current position
  const sortedFirms = [...firms].sort((a, b) => a.currentPosition - b.currentPosition)
  
  // Find target firm index
  const targetIndex = sortedFirms.findIndex(f => f.firmName === targetFirm.firmName)
  
  if (targetIndex === -1) {
    throw new Error(`Firm ${targetFirm.firmName} not found in ranking`)
  }
  
  // Calculate window boundaries
  const startIndex = Math.max(0, targetIndex - positionsAbove)
  const endIndex = Math.min(sortedFirms.length - 1, targetIndex + positionsBelow)
  
  // Extract contextual window
  const contextualFirms = sortedFirms.slice(startIndex, endIndex + 1)
  
  // Anonymize competitors (keep metrics but hide names)
  return contextualFirms.map(firm => {
    if (firm.firmName === targetFirm.firmName) {
      return firm
    }
    return {
      ...firm,
      firmName: '???'
    }
  })
}