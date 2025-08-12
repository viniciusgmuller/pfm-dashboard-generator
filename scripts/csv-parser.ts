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
  // Filter out invalid positions (position 0 or invalid) and sort by current position
  const validFirms = [...firms]
    .filter(f => f.currentPosition > 0)
    .sort((a, b) => a.currentPosition - b.currentPosition)
  
  // Find target firm index in valid firms
  const targetIndex = validFirms.findIndex(f => f.firmName === targetFirm.firmName)
  
  if (targetIndex === -1) {
    throw new Error(`Firm ${targetFirm.firmName} not found in valid ranking`)
  }
  
  const targetPosition = targetFirm.currentPosition
  const totalValidFirms = validFirms.length
  
  // Conditional logic based on target firm's position
  let actualPositionsAbove: number
  let actualPositionsBelow: number
  
  if (targetPosition === 1) {
    // Position 1: Show only firms below (0 above, 4 below to show 5 total)
    actualPositionsAbove = 0
    actualPositionsBelow = Math.min(4, totalValidFirms - targetIndex - 1)
  } else if (targetPosition === 2) {
    // Position 2: Show 1 above and 3 below  
    actualPositionsAbove = 1
    actualPositionsBelow = Math.min(3, totalValidFirms - targetIndex - 1)
  } else if (targetPosition === 3) {
    // Position 3: Show 2 above and 2 below
    actualPositionsAbove = 2
    actualPositionsBelow = Math.min(2, totalValidFirms - targetIndex - 1)
  } else if (targetIndex >= totalValidFirms - 2) {
    // Last or second-to-last position: Show more above, fewer below
    actualPositionsAbove = Math.min(4, targetIndex)
    actualPositionsBelow = Math.min(1, totalValidFirms - targetIndex - 1)
  } else {
    // Middle positions: Standard 3 above, 1 below
    actualPositionsAbove = Math.min(positionsAbove, targetIndex)
    actualPositionsBelow = Math.min(positionsBelow, totalValidFirms - targetIndex - 1)
  }
  
  // Calculate window boundaries
  const startIndex = Math.max(0, targetIndex - actualPositionsAbove)
  const endIndex = Math.min(validFirms.length - 1, targetIndex + actualPositionsBelow)
  
  // Extract contextual window
  const contextualFirms = validFirms.slice(startIndex, endIndex + 1)
  
  // Return all firms with their actual names (no anonymization)
  return contextualFirms
}